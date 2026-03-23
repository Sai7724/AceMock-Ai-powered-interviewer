import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type AdminDataSource = 'primary' | 'legacy' | 'both';

export interface AdminUserSummary {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  source: AdminDataSource;
  user_metadata?: {
    username?: string;
    phone?: string;
  };
  project_user_ids: Partial<Record<'primary' | 'legacy', string>>;
}

export interface AdminReportSummary {
  id: string;
  user_id: string;
  stage: string;
  score: number;
  summary: string;
  created_at: string;
  source: 'primary' | 'legacy';
  email?: string;
}

export interface AdminStatistics {
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

export interface AdminDashboardData {
  users: AdminUserSummary[];
  reports: AdminReportSummary[];
  statistics: AdminStatistics;
  warnings: string[];
}

export interface AdminActionResponse {
  message: string;
  dashboard?: AdminDashboardData;
  exportedAt?: string;
  backupCreatedAt?: string;
  warnings?: string[];
}

type AdminAction = 'dashboard' | 'clear_reports' | 'export_data' | 'system_backup';

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json();
      if (payload && typeof payload.message === 'string') {
        return payload.message;
      }
    } catch {
      return 'Admin function returned an HTTP error.';
    }

    return 'Admin function returned an HTTP error.';
  }

  if (error instanceof FunctionsRelayError) {
    return error.message || 'Supabase relay returned an error.';
  }

  if (error instanceof FunctionsFetchError) {
    return error.message || 'Failed to reach the admin function.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Admin function invocation failed.';
}

async function invokeAdminAction(action: AdminAction): Promise<AdminActionResponse> {
  const { data, error } = await supabase.functions.invoke('admin-dashboard', {
    body: { action },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data) {
    throw new Error('Admin function returned no data.');
  }

  return data as AdminActionResponse;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await invokeAdminAction('dashboard');

  if (!response.dashboard) {
    throw new Error('Admin dashboard payload is missing.');
  }

  return response.dashboard;
}

export async function clearAdminReports(): Promise<string> {
  const response = await invokeAdminAction('clear_reports');
  return response.message;
}

export async function exportAdminData(): Promise<{ filename: string; json: string }> {
  const response = await invokeAdminAction('export_data');

  if (!response.dashboard) {
    throw new Error('Export payload is missing dashboard data.');
  }

  const exportedAt = response.exportedAt || new Date().toISOString();
  const filename = `acemock-admin-export-${exportedAt.replace(/[:.]/g, '-')}.json`;
  const json = JSON.stringify(
    {
      exportedAt,
      dashboard: response.dashboard,
    },
    null,
    2
  );

  return { filename, json };
}

export async function requestAdminBackup(): Promise<string> {
  const response = await invokeAdminAction('system_backup');
  return response.message;
}
