import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'acemock_admin26@gmail.com';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata?: {
    username?: string;
    phone?: string;
  };
}

interface Report {
  id: string;
  user_id: string;
  stage: string;
  score: number;
  summary: string;
  created_at: string;
}

interface Statistics {
  totalUsers: number;
  totalReports: number;
  averageScore: number;
  recentActivity: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    totalReports: 0,
    averageScore: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase.auth.admin.listUsers();
      if (usersData?.users) {
        // Transform Supabase User to our User interface
        const transformedUsers: User[] = usersData.users.map((supabaseUser: SupabaseUser) => ({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          created_at: supabaseUser.created_at,
          last_sign_in_at: supabaseUser.last_sign_in_at || '',
          user_metadata: supabaseUser.user_metadata as any
        }));
        setUsers(transformedUsers);
      }

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsData) {
        setReports(reportsData);
      }

      // Calculate statistics
      const totalUsers = usersData?.users?.length || 0;
      const totalReports = reportsData?.length || 0;
      const averageScore = reportsData && reportsData.length > 0 
        ? reportsData.reduce((acc, report) => acc + report.score, 0) / reportsData.length 
        : 0;
      const recentActivity = reportsData ? reportsData.filter(report => {
        const reportDate = new Date(report.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return reportDate > weekAgo;
      }).length : 0;

      setStatistics({
        totalUsers,
        totalReports,
        averageScore: Math.round(averageScore * 100) / 100,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-cyan-400">AceMock Admin Panel</h1>
            <div className="text-slate-300">
              Welcome, {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'users', label: 'Users' },
              { id: 'reports', label: 'Reports' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-300 hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardTab statistics={statistics} />}
        {activeTab === 'users' && <UsersTab users={users} />}
        {activeTab === 'reports' && <ReportsTab reports={reports} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ statistics: Statistics }> = ({ statistics }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-100">Dashboard Overview</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
        <p className="text-3xl font-bold text-cyan-400">{statistics.totalUsers}</p>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-slate-400 text-sm font-medium">Total Reports</h3>
        <p className="text-3xl font-bold text-green-400">{statistics.totalReports}</p>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-slate-400 text-sm font-medium">Average Score</h3>
        <p className="text-3xl font-bold text-yellow-400">{statistics.averageScore}</p>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-slate-400 text-sm font-medium">Recent Activity (7 days)</h3>
        <p className="text-3xl font-bold text-purple-400">{statistics.recentActivity}</p>
      </div>
    </div>
  </div>
);

// Users Tab Component
const UsersTab: React.FC<{ users: User[] }> = ({ users }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-100">User Management</h2>
    
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Sign In</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-100">
                    {user.user_metadata?.username || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Reports Tab Component
const ReportsTab: React.FC<{ reports: Report[] }> = ({ reports }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-100">Interview Reports</h2>
    
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Summary</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-100">
                    {report.user_id.substring(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">{report.stage}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">{report.score}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-300 max-w-xs truncate">
                    {report.summary}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-100">System Settings</h2>
    
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h3 className="text-lg font-medium text-slate-100 mb-4">Admin Actions</h3>
      
      <div className="space-y-4">
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          Clear All Reports
        </button>
        
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
          Export Data
        </button>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          System Backup
        </button>
      </div>
    </div>
  </div>
);

export default AdminPanel; 