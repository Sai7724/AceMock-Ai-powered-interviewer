import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../services/supabaseClient';
import { InterviewStage } from '../types';

interface Report {
  id: string;
  created_at: string;
  stage: string;
  score: number;
  summary: string;
  user_id: string;
}

interface UserStats {
  totalAssessments: number;
  averageScore: number;
  bestStage: string;
  worstStage: string;
  lastAssessment: string;
  completionRate: number;
  stageProgress: {
    [key: string]: {
      count: number;
      averageScore: number;
      lastAttempt: string;
    };
  };
}

export default function Profile() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalAssessments: 0,
    averageScore: 0,
    bestStage: '',
    worstStage: '',
    lastAssessment: '',
    completionRate: 0,
    stageProgress: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'progress'>('overview');

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setReports(data as Report[]);
          calculateStats(data as Report[]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) fetchUserData();
  }, [user]);

  const calculateStats = (userReports: Report[]) => {
    if (userReports.length === 0) return;

    const stageProgress: { [key: string]: { count: number; averageScore: number; lastAttempt: string } } = {};
    
    // Calculate stage-specific stats
    userReports.forEach(report => {
      if (!stageProgress[report.stage]) {
        stageProgress[report.stage] = { count: 0, averageScore: 0, lastAttempt: report.created_at };
      }
      stageProgress[report.stage].count++;
      stageProgress[report.stage].averageScore += report.score;
      if (new Date(report.created_at) > new Date(stageProgress[report.stage].lastAttempt)) {
        stageProgress[report.stage].lastAttempt = report.created_at;
      }
    });

    // Calculate averages
    Object.keys(stageProgress).forEach(stage => {
      stageProgress[stage].averageScore = Math.round((stageProgress[stage].averageScore / stageProgress[stage].count) * 100) / 100;
    });

    // Find best and worst stages
    const stageAverages = Object.entries(stageProgress).map(([stage, data]) => ({
      stage,
      average: data.averageScore
    }));
    
    const bestStage = stageAverages.reduce((a, b) => a.average > b.average ? a : b)?.stage || '';
    const worstStage = stageAverages.reduce((a, b) => a.average < b.average ? a : b)?.stage || '';

    // Calculate overall stats
    const totalAssessments = userReports.length;
    const averageScore = Math.round((userReports.reduce((acc, report) => acc + report.score, 0) / totalAssessments) * 100) / 100;
    const lastAssessment = userReports[0]?.created_at || '';
    const completionRate = Math.round((Object.keys(stageProgress).length / 4) * 100); // 4 main stages

    setStats({
      totalAssessments,
      averageScore,
      bestStage,
      worstStage,
      lastAssessment,
      completionRate,
      stageProgress
    });
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'self_introduction': return '👋';
      case 'aptitude_test': return '🧠';
      case 'technical_qa': return '💻';
      case 'coding_challenge': return '⚡';
      default: return '📊';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cyan-400 mb-2">My Dashboard</h1>
              <p className="text-slate-300">Welcome back, {user.user_metadata?.username || user.email}</p>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-sm">Member since</div>
              <div className="text-slate-200 font-semibold">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'reports', label: 'Detailed Reports', icon: '📋' },
                { id: 'progress', label: 'Progress Tracking', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-300 hover:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total Assessments</p>
                        <p className="text-3xl font-bold text-cyan-400">{stats.totalAssessments}</p>
                      </div>
                      <div className="text-4xl">📊</div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Average Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                          {stats.averageScore}/10
                        </p>
                      </div>
                      <div className="text-4xl">🎯</div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Completion Rate</p>
                        <p className="text-3xl font-bold text-green-400">{stats.completionRate}%</p>
                      </div>
                      <div className="text-4xl">✅</div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Last Assessment</p>
                        <p className="text-lg font-semibold text-slate-200">
                          {stats.lastAssessment ? new Date(stats.lastAssessment).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div className="text-4xl">📅</div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <h3 className="text-xl font-bold text-slate-100 mb-4">Performance Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Best Stage:</span>
                        <span className="text-green-400 font-semibold">{stats.bestStage || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Needs Improvement:</span>
                        <span className="text-red-400 font-semibold">{stats.worstStage || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                    <h3 className="text-xl font-bold text-slate-100 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStageIcon(report.stage)}</span>
                            <div>
                              <p className="text-slate-200 font-medium">{report.stage}</p>
                              <p className="text-slate-400 text-sm">
                                {new Date(report.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold ${getScoreColor(report.score)}`}>
                            {report.score}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Detailed Assessment Reports</h2>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-slate-400 text-lg">No assessment reports found.</p>
                    <p className="text-slate-500">Complete your first assessment to see detailed reports here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-slate-700 rounded-xl border border-slate-600 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <span className="text-3xl">{getStageIcon(report.stage)}</span>
                              <div>
                                <h3 className="text-xl font-bold text-slate-100">{report.stage}</h3>
                                <p className="text-slate-400">
                                  {new Date(report.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                                {report.score}/10
                              </div>
                              <div className="text-slate-400 text-sm">Score</div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-600 rounded-lg p-4">
                            <h4 className="text-slate-200 font-semibold mb-2">Feedback Summary</h4>
                            <p className="text-slate-300 leading-relaxed">{report.summary}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Progress Tracking</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(stats.stageProgress).map(([stage, data]) => (
                    <div key={stage} className="bg-slate-700 p-6 rounded-xl border border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getStageIcon(stage)}</span>
                          <div>
                            <h3 className="text-lg font-bold text-slate-100">{stage}</h3>
                            <p className="text-slate-400 text-sm">
                              {data.count} attempt{data.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(data.averageScore)}`}>
                            {data.averageScore}/10
                          </div>
                          <div className="text-slate-400 text-sm">Average</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((data.averageScore / 10) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor((data.averageScore / 10) * 100)}`}
                              style={{ width: `${(data.averageScore / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="text-slate-400 text-sm">
                          Last attempt: {new Date(data.lastAttempt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(stats.stageProgress).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-slate-400 text-lg">No progress data available.</p>
                    <p className="text-slate-500">Complete assessments to track your progress.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 