import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import GlassSurface from './common/GlassSurface';
import {
  AdminDashboardData,
  AdminReportSummary,
  AdminStatistics,
  AdminUserSummary,
  clearAdminReports,
  exportAdminData,
  fetchAdminDashboard,
  requestAdminBackup,
} from '../services/adminService';
import GlassButton from './common/GlassButton';

const ADMIN_EMAIL = 'acemock_admin26@gmail.com';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
] as const;

function sourcePill(source: 'primary' | 'legacy' | 'both') {
  if (source === 'both') return 'liquid-chip liquid-chip-accent';
  if (source === 'primary') return 'liquid-chip liquid-chip-success';
  return 'liquid-chip liquid-chip-warning';
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [reports, setReports] = useState<AdminReportSummary[]>([]);
  const [statistics, setStatistics] = useState<AdminStatistics>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalReports: 0,
    averageScore: 0,
    recentActivity: 0,
    primaryUsers: 0,
    legacyUsers: 0,
    primaryReports: 0,
    legacyReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      void fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchAdminDashboard();
      applyDashboard(dashboard);
    } catch (dashboardError) {
      console.error('Error fetching admin data:', dashboardError);
      setError(dashboardError instanceof Error ? dashboardError.message : 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const applyDashboard = (dashboard: AdminDashboardData) => {
    setUsers(dashboard.users);
    setReports(dashboard.reports);
    setStatistics(dashboard.statistics);
    setWarnings(dashboard.warnings);
  };

  const handleClearReports = async () => {
    if (!window.confirm('This will delete reports from both primary and legacy projects. Continue?')) {
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    setError(null);
    try {
      const message = await clearAdminReports();
      setActionMessage(message);
      const dashboard = await fetchAdminDashboard();
      applyDashboard(dashboard);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to clear reports.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExport = async () => {
    setIsActionLoading(true);
    setActionMessage(null);
    setError(null);
    try {
      const { filename, json } = await exportAdminData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setActionMessage(`Export created: ${filename}`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to export admin data.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsActionLoading(true);
    setActionMessage(null);
    setError(null);
    try {
      const message = await requestAdminBackup();
      setActionMessage(message);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to create admin backup.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="liquid-page min-h-screen flex items-center justify-center px-6">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="max-w-xl w-full p-10 text-center"
        >
          <div className="w-full">
            <h1 className="liquid-heading mb-4 text-3xl font-bold">Access Denied</h1>
            <p className="liquid-copy">You do not have permission to view this page.</p>
          </div>
        </GlassSurface>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="liquid-page min-h-screen flex items-center justify-center px-6">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="px-8 py-10 text-center w-full max-w-sm"
        >
          <div className="w-full">
            <div className="liquid-accent text-xl font-semibold">Loading admin panel...</div>
          </div>
        </GlassSurface>
      </div>
    );
  }

  return (
    <div className="liquid-page min-h-screen px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-6 relative overflow-hidden"
        >
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="liquid-kicker">Admin Control</p>
              <h1 className="liquid-heading mt-3 text-4xl font-extrabold">AceMock Admin Panel</h1>
              <p className="liquid-copy mt-3">Monitor users, reports, storage actions, and project health from a single dashboard.</p>
            </div>
            <div className="liquid-panel-soft rounded-[1.5rem] px-5 py-4">
              <p className="liquid-muted text-xs uppercase tracking-[0.18em]">Signed in as</p>
              <p className="liquid-heading mt-2 text-base font-semibold">{user.email}</p>
            </div>
          </div>
        </GlassSurface>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <GlassButton
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full px-5 py-2.5 text-sm font-bold"
            >
              {tab.label}
            </GlassButton>
          ))}
        </div>

        {error && (
          <div className="liquid-banner border border-rose-400/20 px-5 py-4 text-rose-200">{error}</div>
        )}
        {warnings.length > 0 && (
          <div className="liquid-banner border border-amber-300/20 px-5 py-4 text-[color:var(--warning)]">
            <ul className="space-y-1">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {actionMessage && (
          <div className="liquid-banner border border-[color:var(--accent-blue-strong)]/20 px-5 py-4 text-[color:var(--accent-blue-strong)]">{actionMessage}</div>
        )}

        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={22}
          opacity={0.6}
          backgroundOpacity={0.04}
          className="p-6 w-full relative"
        >
          <div className="w-full">
            {activeTab === 'dashboard' && <DashboardTab statistics={statistics} />}
            {activeTab === 'users' && <UsersTab users={users} />}
            {activeTab === 'reports' && <ReportsTab reports={reports} />}
            {activeTab === 'settings' && (
              <SettingsTab
                isActionLoading={isActionLoading}
                onClearReports={handleClearReports}
                onExport={handleExport}
                onBackup={handleBackup}
              />
            )}
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};

const ACTIVE_THRESHOLD_DAYS = 30;

function isActiveUser(lastSignInAt: string): boolean {
  if (!lastSignInAt) return false;
  const diff = Date.now() - new Date(lastSignInAt).getTime();
  return diff <= ACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

const DashboardTab = ({ statistics }: { statistics: AdminStatistics }) => (
  <div className="space-y-6">
    <div>
      <p className="liquid-kicker">Overview</p>
      <h2 className="liquid-heading mt-3 text-3xl font-bold">Dashboard Metrics</h2>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Total Users</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-blue-strong)]">{statistics.totalUsers}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Active Users</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--success)]">{statistics.activeUsers}</p>
        <p className="mt-1 text-xs text-slate-500">Signed in last 30 days</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Inactive Users</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--danger)]">{statistics.inactiveUsers}</p>
        <p className="mt-1 text-xs text-slate-500">No sign-in in 30+ days</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Total Reports</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--success)]">{statistics.totalReports}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Average Score</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-gold-strong)]">{statistics.averageScore}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Recent Activity</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--danger)]">{statistics.recentActivity}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Primary Users</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-blue-strong)]">{statistics.primaryUsers}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Legacy Users</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-gold-strong)]">{statistics.legacyUsers}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Primary Reports</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-blue-strong)]">{statistics.primaryReports}</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
        <h3 className="liquid-muted text-sm font-medium">Legacy Reports</h3>
        <p className="mt-3 text-3xl font-bold text-[color:var(--accent-gold-strong)]">{statistics.legacyReports}</p>
      </div>
    </div>
  </div>
);

const UsersTab = ({ users }: { users: AdminUserSummary[] }) => (
  <div className="space-y-6">
    <div>
      <p className="liquid-kicker">Users</p>
      <h2 className="liquid-heading mt-3 text-3xl font-bold">User Management</h2>
      <p className="liquid-muted text-sm mt-1">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
    </div>

    {users.length === 0 ? (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 text-center text-slate-400">
        No users found.
      </div>
    ) : (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-xl overflow-hidden p-2">
        <div className="overflow-x-auto rounded-[1.5rem]">
          <table className="liquid-table min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Source</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-left">Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userRecord) => {
                const active = isActiveUser(userRecord.last_sign_in_at);
                return (
                  <tr key={userRecord.id} className="border-t border-white/5">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[color:var(--text-primary)]">
                        {userRecord.user_metadata?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{userRecord.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={active ? 'liquid-chip liquid-chip-success' : 'liquid-chip liquid-chip-warning'}>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={sourcePill(userRecord.source)}>{userRecord.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      {userRecord.created_at ? new Date(userRecord.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {userRecord.last_sign_in_at ? new Date(userRecord.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const ReportsTab = ({ reports }: { reports: AdminReportSummary[] }) => (
  <div className="space-y-6">
    <div>
      <p className="liquid-kicker">Reports</p>
      <h2 className="liquid-heading mt-3 text-3xl font-bold">Interview Reports</h2>
    </div>

    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-xl overflow-hidden p-2">
      <div className="overflow-x-auto rounded-[1.5rem]">
        <table className="liquid-table min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">Source</th>
              <th className="px-6 py-4 text-left">User ID</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Stage</th>
              <th className="px-6 py-4 text-left">Score</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Summary</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-white/5">
                <td className="px-6 py-4"><span className={report.source === 'primary' ? 'liquid-chip liquid-chip-success' : 'liquid-chip liquid-chip-warning'}>{report.source}</span></td>
                <td className="px-6 py-4 font-medium text-[color:var(--text-primary)]">{report.user_id.substring(0, 8)}...</td>
                <td className="px-6 py-4">{report.email || 'Unknown'}</td>
                <td className="px-6 py-4">{report.stage}</td>
                <td className="px-6 py-4">{report.score}</td>
                <td className="px-6 py-4">{new Date(report.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 max-w-xs truncate">{report.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SettingsTab = ({
  isActionLoading,
  onClearReports,
  onExport,
  onBackup,
}: {
  isActionLoading: boolean;
  onClearReports: () => void;
  onExport: () => void;
  onBackup: () => void;
}) => (
  <div className="space-y-6">
    <div>
      <p className="liquid-kicker">System</p>
      <h2 className="liquid-heading mt-3 text-3xl font-bold">Admin Actions</h2>
    </div>

    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={32}
      blur={16}
      opacity={0.8}
      backgroundOpacity={0.06}
      className="p-6 w-full relative"
    >
      <div className="w-full flex flex-wrap gap-4">
        <GlassButton
          variant="danger"
          onClick={onClearReports}
          disabled={isActionLoading}
          className="px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear All Reports
        </GlassButton>

        <GlassButton
          variant="warning"
          onClick={onExport}
          disabled={isActionLoading}
          className="px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Data
        </GlassButton>

        <GlassButton
          variant="secondary"
          onClick={onBackup}
          disabled={isActionLoading}
          className="rounded-full px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          System Backup
        </GlassButton>
      </div>
    </GlassSurface>
  </div>
);

export default AdminPanel;
