import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../services/supabaseClient';
import { InterviewStage } from '../types';
import Spinner from './common/Spinner';

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

function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return '';
  const parts = nameOrEmail.split(/[@.\s]/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface ProfileProps {
  onReturnToHome?: () => void;
}

export default function Profile({ onReturnToHome }: ProfileProps) {
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

  // Function to handle returning to home
  const handleReturnToHome = () => {
    if (onReturnToHome) {
      onReturnToHome();
    } else {
      // Fallback: navigate to home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        if (!user) return;
        
        // Fetch all reports for the user
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setReports(data as Report[]);
          calculateStats(data as Report[]);
        } else {
          console.error('Error fetching reports:', error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const calculateStats = (userReports: Report[]) => {
    if (userReports.length === 0) {
      setStats({
        totalAssessments: 0,
        averageScore: 0,
        bestStage: '',
        worstStage: '',
        lastAssessment: '',
        completionRate: 0,
        stageProgress: {}
      });
      return;
    }

    const stageProgress: { [key: string]: { count: number; averageScore: number; lastAttempt: string } } = {};
    
    // Calculate stage-specific stats
    userReports.forEach(report => {
      const stage = report.stage;
      if (!stageProgress[stage]) {
        stageProgress[stage] = { count: 0, averageScore: 0, lastAttempt: report.created_at };
      }
      stageProgress[stage].count++;
      stageProgress[stage].averageScore += report.score;
      if (new Date(report.created_at) > new Date(stageProgress[stage].lastAttempt)) {
        stageProgress[stage].lastAttempt = report.created_at;
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
    
    // Calculate completion rate based on unique stages completed
    const uniqueStages = Object.keys(stageProgress).length;
    const totalPossibleStages = 5; // Welcome, Self Intro, Aptitude, Technical QA, Coding, HR Round, Feedback
    const completionRate = Math.round((uniqueStages / totalPossibleStages) * 100);

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
      case 'hr_round': return '🤝';
      case 'feedback': return '📊';
      default: return '📋';
    }
  };

  const getStageDisplayName = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'self_introduction': return 'Self Introduction';
      case 'aptitude_test': return 'Aptitude Test';
      case 'technical_qa': return 'Technical Q&A';
      case 'coding_challenge': return 'Coding Challenge';
      case 'hr_round': return 'HR Round';
      case 'feedback': return 'Feedback';
      default: return stage;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-cyan-400 text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner />
        <div className="mt-4 text-cyan-400 text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  // Simple tab style
  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-cyan-600 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6 relative">
        {/* Return to Home Button */}
        <button
          onClick={handleReturnToHome}
          className="absolute top-4 right-4 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors"
          aria-label="Return to home page"
          title="Return to home page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-2xl font-bold text-white">
            {getInitials(user.user_metadata?.username || user.email)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-300">Welcome, {user.user_metadata?.username || user.email}</h1>
            <p className="text-slate-400">Your interview progress dashboard</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={tabClass('reports')} onClick={() => setActiveTab('reports')}>
          Reports
        </button>
        <button className={tabClass('progress')} onClick={() => setActiveTab('progress')}>
          Progress
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-xl p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{stats.totalAssessments}</div>
                <div className="text-sm text-slate-400">Total Assessments</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}/10</div>
                <div className="text-sm text-slate-400">Average Score</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stats.completionRate}%</div>
                <div className="text-sm text-slate-400">Completion Rate</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-slate-300">
                  {stats.lastAssessment ? new Date(stats.lastAssessment).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-slate-400">Last Assessment</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Recent Activity</h2>
              {reports.length === 0 ? (
                <div className="text-slate-400 text-center py-8">No assessments completed yet.</div>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="bg-slate-700 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStageIcon(report.stage)}</span>
                        <div>
                          <div className="font-medium text-slate-200">{getStageDisplayName(report.stage)}</div>
                          <div className="text-sm text-slate-400">{new Date(report.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${getScoreColor(report.score)}`}>{report.score}/10</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Detailed Reports</h2>
            {reports.length === 0 ? (
              <div className="text-slate-400 text-center py-8">No reports available yet.</div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-cyan-300">{getStageDisplayName(report.stage)}</h3>
                      <span className={`font-bold ${getScoreColor(report.score)}`}>{report.score}/10</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{report.summary}</p>
                    <p className="text-slate-400 text-xs">{new Date(report.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Stage Progress</h2>
            {Object.keys(stats.stageProgress).length === 0 ? (
              <div className="text-slate-400 text-center py-8">No progress data available yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.stageProgress).map(([stage, data]) => (
                  <div key={stage} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getStageIcon(stage)}</span>
                      <h3 className="font-semibold text-cyan-300">{getStageDisplayName(stage)}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>Average Score: <span className={`font-bold ${getScoreColor(data.averageScore)}`}>{data.averageScore}/10</span></div>
                      <div>Attempts: <span className="font-bold text-slate-300">{data.count}</span></div>
                      <div>Last Attempt: <span className="text-slate-400">{new Date(data.lastAttempt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}