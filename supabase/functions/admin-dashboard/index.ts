import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type AdminAction = 'dashboard' | 'clear_reports' | 'export_data' | 'system_backup';
type AdminDataSource = 'primary' | 'legacy' | 'both';
type ProjectLabel = 'primary' | 'legacy';

interface AdminUserSummary {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  source: AdminDataSource;
  user_metadata?: {
    username?: string;
    phone?: string;
  };
  project_user_ids: Partial<Record<ProjectLabel, string>>;
}

interface AdminReportSummary {
  id: string;
  user_id: string;
  stage: string;
  score: number;
  summary: string;
  created_at: string;
  source: ProjectLabel;
  email?: string;
}

interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalReports: number;
  averageScore: number;
  recentActivity: number;
  primaryUsers: number;
  legacyUsers: number;
  primaryReports: number;
  legacyReports: number;
}

interface AdminDashboardData {
  users: AdminUserSummary[];
  reports: AdminReportSummary[];
  statistics: AdminStatistics;
  warnings: string[];
}

interface AdminActionResponse {
  message: string;
  dashboard?: AdminDashboardData;
  exportedAt?: string;
  backupCreatedAt?: string;
  warnings?: string[];
}

interface ProjectContext {
  label: ProjectLabel;
  admin: SupabaseClient;
}

interface AuthUserRecord {
  id: string;
  email?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

interface ReportRecord {
  id: string;
  user_id: string;
  stage: string | null;
  score: number | null;
  summary: string | null;
  created_at: string | null;
}

interface DashboardBuildResult {
  dashboard: AdminDashboardData;
  warnings: string[];
}

class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'HttpError';
  }
}

const ADMIN_EMAIL = (Deno.env.get('ADMIN_DASHBOARD_EMAIL') || 'acemock_admin26@gmail.com').toLowerCase();
const DEFAULT_BACKUP_BUCKET = Deno.env.get('ADMIN_BACKUP_BUCKET') || 'admin-backups';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getRequiredEnv(name: string, fallback?: string | null): string {
  const value = fallback ?? Deno.env.get(name);
  if (!value) {
    throw new HttpError(`Missing required environment variable: ${name}`, 500);
  }

  return value;
}

function createAdminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

function normalizeTimestamp(value?: string | null): string {
  return value || '';
}

function earliestTimestamp(first?: string | null, second?: string | null): string {
  const left = normalizeTimestamp(first);
  const right = normalizeTimestamp(second);

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return new Date(left).getTime() <= new Date(right).getTime() ? left : right;
}

function latestTimestamp(first?: string | null, second?: string | null): string {
  const left = normalizeTimestamp(first);
  const right = normalizeTimestamp(second);

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return new Date(left).getTime() >= new Date(right).getTime() ? left : right;
}

function pickUserMetadata(metadata?: Record<string, unknown> | null): AdminUserSummary['user_metadata'] {
  if (!metadata) {
    return undefined;
  }

  const username = typeof metadata.username === 'string' ? metadata.username : undefined;
  const phone = typeof metadata.phone === 'string' ? metadata.phone : undefined;

  if (!username && !phone) {
    return undefined;
  }

  return { username, phone };
}

function mergeUserMetadata(
  current?: AdminUserSummary['user_metadata'],
  incoming?: AdminUserSummary['user_metadata']
): AdminUserSummary['user_metadata'] {
  if (!current) {
    return incoming;
  }

  if (!incoming) {
    return current;
  }

  return {
    username: current.username || incoming.username,
    phone: current.phone || incoming.phone,
  };
}

function sortUsers(users: AdminUserSummary[]): AdminUserSummary[] {
  return [...users].sort((left, right) => {
    const leftCreated = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightCreated = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightCreated - leftCreated;
  });
}

function sortReports(reports: AdminReportSummary[]): AdminReportSummary[] {
  return [...reports].sort((left, right) => {
    const leftCreated = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightCreated = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightCreated - leftCreated;
  });
}

async function authenticateAdmin(request: Request, primaryUrl: string, primaryAnonKey: string, primaryServiceRoleKey: string) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError('Missing bearer token.', 401);
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    throw new HttpError('Bearer token is empty.', 401);
  }

  const authClient = createClient(primaryUrl, primaryAnonKey || primaryServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new HttpError('Unable to verify the current user.', 401);
  }

  if (normalizeEmail(data.user.email) !== ADMIN_EMAIL) {
    throw new HttpError('Admin access denied for this user.', 403);
  }

  return data.user;
}

async function listAllUsers(project: ProjectContext): Promise<AuthUserRecord[]> {
  const users: AuthUserRecord[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await project.admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new HttpError(`Failed to list ${project.label} users: ${error.message}`, 500);
    }

    const batch = (data?.users || []) as AuthUserRecord[];
    if (batch.length === 0) {
      break;
    }

    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function fetchReports(project: ProjectContext): Promise<ReportRecord[]> {
  const { data, error } = await project.admin
    .from('reports')
    .select('id, user_id, stage, score, summary, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new HttpError(`Failed to read ${project.label} reports: ${error.message}`, 500);
  }

  return (data || []) as ReportRecord[];
}

function mergeUsers(primaryUsers: AuthUserRecord[], legacyUsers: AuthUserRecord[]) {
  const merged = new Map<string, AdminUserSummary>();
  const emailByProjectUserId = {
    primary: new Map<string, string>(),
    legacy: new Map<string, string>(),
  };

  const upsertUser = (project: ProjectLabel, user: AuthUserRecord) => {
    const normalizedEmail = normalizeEmail(user.email);
    const mapKey = normalizedEmail || `${project}:${user.id}`;
    const metadata = pickUserMetadata(user.user_metadata);
    const existing = merged.get(mapKey);

    if (!existing) {
      merged.set(mapKey, {
        id: user.id,
        email: user.email || '',
        created_at: normalizeTimestamp(user.created_at),
        last_sign_in_at: normalizeTimestamp(user.last_sign_in_at),
        source: project,
        user_metadata: metadata,
        project_user_ids: {
          [project]: user.id,
        },
      });
    } else {
      existing.source = existing.source === project ? project : 'both';
      existing.id = project === 'primary' ? user.id : existing.id || user.id;
      existing.email = existing.email || user.email || '';
      existing.created_at = earliestTimestamp(existing.created_at, user.created_at);
      existing.last_sign_in_at = latestTimestamp(existing.last_sign_in_at, user.last_sign_in_at);
      existing.user_metadata = mergeUserMetadata(existing.user_metadata, metadata);
      existing.project_user_ids[project] = user.id;
    }

    if (user.id && user.email) {
      emailByProjectUserId[project].set(user.id, user.email);
    }
  };

  primaryUsers.forEach((user) => upsertUser('primary', user));
  legacyUsers.forEach((user) => upsertUser('legacy', user));

  return {
    users: sortUsers(Array.from(merged.values())),
    emailByProjectUserId,
  };
}

function mapReports(
  primaryReports: ReportRecord[],
  legacyReports: ReportRecord[],
  emailByProjectUserId: {
    primary: Map<string, string>;
    legacy: Map<string, string>;
  }
): AdminReportSummary[] {
  const toSummary = (project: ProjectLabel, report: ReportRecord): AdminReportSummary => ({
    id: report.id,
    user_id: report.user_id,
    stage: report.stage || 'Unknown',
    score: typeof report.score === 'number' ? report.score : 0,
    summary: report.summary || '',
    created_at: normalizeTimestamp(report.created_at),
    source: project,
    email: emailByProjectUserId[project].get(report.user_id),
  });

  return sortReports([
    ...primaryReports.map((report) => toSummary('primary', report)),
    ...legacyReports.map((report) => toSummary('legacy', report)),
  ]);
}

const ACTIVE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

function buildStatistics(
  users: AdminUserSummary[],
  reports: AdminReportSummary[],
  primaryUsers: AuthUserRecord[],
  legacyUsers: AuthUserRecord[],
  primaryReports: ReportRecord[],
  legacyReports: ReportRecord[]
): AdminStatistics {
  const totalScore = reports.reduce((sum, report) => sum + report.score, 0);
  const recentThreshold = Date.now() - ONE_WEEK_MS;
  const activeThreshold = Date.now() - ACTIVE_THRESHOLD_MS;

  const recentActivity = reports.filter((report) => {
    if (!report.created_at) return false;
    return new Date(report.created_at).getTime() >= recentThreshold;
  }).length;

  const activeUsers = users.filter((u) => {
    if (!u.last_sign_in_at) return false;
    return new Date(u.last_sign_in_at).getTime() >= activeThreshold;
  }).length;

  return {
    totalUsers: users.length,
    activeUsers,
    inactiveUsers: users.length - activeUsers,
    totalReports: reports.length,
    averageScore: reports.length > 0 ? Math.round((totalScore / reports.length) * 100) / 100 : 0,
    recentActivity,
    primaryUsers: primaryUsers.length,
    legacyUsers: legacyUsers.length,
    primaryReports: primaryReports.length,
    legacyReports: legacyReports.length,
  };
}

async function buildDashboard(primaryProject: ProjectContext, legacyProject: ProjectContext | null, warnings: string[]): Promise<DashboardBuildResult> {
  const [primaryUsers, primaryReports, legacyUsers, legacyReports] = await Promise.all([
    listAllUsers(primaryProject),
    fetchReports(primaryProject),
    legacyProject ? listAllUsers(legacyProject) : Promise.resolve([]),
    legacyProject ? fetchReports(legacyProject) : Promise.resolve([]),
  ]);

  const { users, emailByProjectUserId } = mergeUsers(primaryUsers, legacyUsers);
  const reports = mapReports(primaryReports, legacyReports, emailByProjectUserId);

  return {
    dashboard: {
      users,
      reports,
      statistics: buildStatistics(users, reports, primaryUsers, legacyUsers, primaryReports, legacyReports),
      warnings,
    },
    warnings,
  };
}

async function clearReports(project: ProjectContext): Promise<number> {
  const { data, error } = await project.admin
    .from('reports')
    .delete()
    .not('id', 'is', null)
    .select('id');

  if (error) {
    throw new HttpError(`Failed to clear ${project.label} reports: ${error.message}`, 500);
  }

  return data?.length || 0;
}

async function ensureBackupBucket(primaryProject: ProjectContext, bucketName: string) {
  const { data, error } = await primaryProject.admin.storage.listBuckets();
  if (error) {
    throw new HttpError(`Failed to list storage buckets: ${error.message}`, 500);
  }

  const exists = (data || []).some((bucket) => bucket.name === bucketName);
  if (exists) {
    return;
  }

  const { error: createError } = await primaryProject.admin.storage.createBucket(bucketName, {
    public: false,
  });

  if (createError) {
    throw new HttpError(`Failed to create backup bucket ${bucketName}: ${createError.message}`, 500);
  }
}

async function createBackup(primaryProject: ProjectContext, dashboard: AdminDashboardData) {
  const backupCreatedAt = new Date().toISOString();
  const objectPath = `backups/${backupCreatedAt.replace(/[:.]/g, '-')}.json`;
  const payload = JSON.stringify(
    {
      backupCreatedAt,
      dashboard,
    },
    null,
    2
  );

  await ensureBackupBucket(primaryProject, DEFAULT_BACKUP_BUCKET);

  const { error } = await primaryProject.admin.storage
    .from(DEFAULT_BACKUP_BUCKET)
    .upload(objectPath, new Blob([payload], { type: 'application/json' }), {
      contentType: 'application/json',
      upsert: false,
    });

  if (error) {
    throw new HttpError(`Failed to upload backup snapshot: ${error.message}`, 500);
  }

  return {
    backupCreatedAt,
    bucketName: DEFAULT_BACKUP_BUCKET,
    objectPath,
  };
}

function parseAction(payload: unknown): AdminAction {
  if (!payload || typeof payload !== 'object') {
    throw new HttpError('Request payload must be a JSON object.', 400);
  }

  const action = (payload as { action?: string }).action;
  if (action === 'dashboard' || action === 'clear_reports' || action === 'export_data' || action === 'system_backup') {
    return action;
  }

  throw new HttpError('Unsupported admin action.', 400);
}

function createProjects() {
  const primaryUrl = getRequiredEnv('PRIMARY_SUPABASE_URL', Deno.env.get('SUPABASE_URL'));
  const primaryServiceRoleKey = getRequiredEnv(
    'PRIMARY_SUPABASE_SERVICE_ROLE_KEY',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  const primaryAnonKey =
    Deno.env.get('PRIMARY_SUPABASE_ANON_KEY') ||
    Deno.env.get('SUPABASE_ANON_KEY') ||
    primaryServiceRoleKey;

  const primaryProject: ProjectContext = {
    label: 'primary',
    admin: createAdminClient(primaryUrl, primaryServiceRoleKey),
  };

  const legacyUrl = Deno.env.get('LEGACY_SUPABASE_URL');
  const legacyServiceRoleKey = Deno.env.get('LEGACY_SUPABASE_SERVICE_ROLE_KEY');
  const warnings: string[] = [];

  let legacyProject: ProjectContext | null = null;
  if (legacyUrl && legacyServiceRoleKey) {
    legacyProject = {
      label: 'legacy',
      admin: createAdminClient(legacyUrl, legacyServiceRoleKey),
    };
  } else {
    warnings.push(
      'Legacy Supabase admin access is not configured. Set LEGACY_SUPABASE_URL and LEGACY_SUPABASE_SERVICE_ROLE_KEY in function secrets to include the old project.'
    );
  }

  return {
    primaryUrl,
    primaryAnonKey,
    primaryServiceRoleKey,
    primaryProject,
    legacyProject,
    warnings,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed.' }, 405);
  }

  try {
    const body = await request.json();
    const action = parseAction(body);
    const {
      primaryUrl,
      primaryAnonKey,
      primaryServiceRoleKey,
      primaryProject,
      legacyProject,
      warnings,
    } = createProjects();

    await authenticateAdmin(request, primaryUrl, primaryAnonKey, primaryServiceRoleKey);

    if (action === 'dashboard') {
      const { dashboard } = await buildDashboard(primaryProject, legacyProject, warnings);
      return jsonResponse({
        message: 'Admin dashboard loaded.',
        dashboard,
        warnings,
      } satisfies AdminActionResponse);
    }

    if (action === 'clear_reports') {
      const [primaryDeleted, legacyDeleted] = await Promise.all([
        clearReports(primaryProject),
        legacyProject ? clearReports(legacyProject) : Promise.resolve(0),
      ]);

      return jsonResponse({
        message: `Deleted ${primaryDeleted} primary reports and ${legacyDeleted} legacy reports.`,
        warnings,
      } satisfies AdminActionResponse);
    }

    if (action === 'export_data') {
      const exportedAt = new Date().toISOString();
      const { dashboard } = await buildDashboard(primaryProject, legacyProject, warnings);

      return jsonResponse({
        message: 'Admin export prepared.',
        exportedAt,
        dashboard,
        warnings,
      } satisfies AdminActionResponse);
    }

    const { dashboard } = await buildDashboard(primaryProject, legacyProject, warnings);
    const backup = await createBackup(primaryProject, dashboard);

    return jsonResponse({
      message: `Backup stored in ${backup.bucketName}/${backup.objectPath}.`,
      backupCreatedAt: backup.backupCreatedAt,
      warnings,
    } satisfies AdminActionResponse);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ message: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : 'Unexpected admin function failure.';
    console.error('admin-dashboard function error:', error);
    return jsonResponse({ message }, 500);
  }
});
