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

  // Function to handle returning to home
  const handleReturnToHome = () => {
    // This will be handled by the parent component through a callback
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center pt-24">
        <div className="text-cyan-400 text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center pt-32">
        <Spinner />
        <div className="mt-6 text-cyan-400 text-xl font-semibold">Loading your dashboard...</div>
      </div>
    );
  }

  // Modern tab style
  const tabClass = (tab: string) =>
    `px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 focus:outline-none ${
      activeTab === tab
        ? 'bg-cyan-600 text-white shadow-lg'
        : 'bg-slate-700 text-slate-300 hover:bg-cyan-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl mx-auto mt-32 mb-20 rounded-3xl shadow-2xl bg-slate-800 p-0 sm:p-4 md:p-8">
        {/* Header */}
        <div className="relative rounded-2xl shadow-xl p-6 md:p-10 mb-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-cyan-400/5 pointer-events-none rounded-2xl" />
          
          {/* Return to Home Button */}
          <button
            onClick={handleReturnToHome}
            className="absolute top-4 right-4 z-20 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-4 rounded-full shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Return to Home
          </button>
          
          <div className="relative z-10 flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-cyan-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-cyan-400">
              {getInitials(user.user_metadata?.username || user.email)}
            </div>
          </div>
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-300 mb-1">Welcome, {user.user_metadata?.username || user.email}</h1>
            <div className="text-slate-300 text-lg mb-2">Your personalized interview dashboard</div>
            <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
              <span>Member since <span className="text-cyan-200 font-semibold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</span></span>
              <span>|</span>
              <span>Total Assessments: <span className="text-cyan-200 font-semibold">{stats.totalAssessments}</span></span>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={tabClass('reports')} onClick={() => setActiveTab('reports')}>
            📋 Detailed Reports
          </button>
          <button className={tabClass('progress')} onClick={() => setActiveTab('progress')}>
            📈 Progress
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl shadow-xl p-4 sm:p-6 md:p-10 bg-slate-800">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-cyan-700/80 to-cyan-400/40 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-lg text-slate-100 font-semibold">Total Assessments</div>
                  <div className="text-3xl font-extrabold text-white mt-1">{stats.totalAssessments}</div>
                </div>
                <div className="bg-gradient-to-br from-green-700/80 to-green-400/40 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-lg text-slate-100 font-semibold">Average Score</div>
                  <div className={`text-3xl font-extrabold mt-1 ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}/10</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-700/80 to-yellow-400/40 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-lg text-slate-100 font-semibold">Completion Rate</div>
                  <div className="text-3xl font-extrabold text-white mt-1">{stats.completionRate}%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-700/80 to-purple-400/40 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">📅</div>
                  <div className="text-lg text-slate-100 font-semibold">Last Assessment</div>
                  <div className="text-xl font-bold text-white mt-1">{stats.lastAssessment ? new Date(stats.lastAssessment).toLocaleDateString() : 'Never'}</div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-cyan-200 mb-4">Recent Activity</h2>
                {reports.length === 0 ? (
                  <div className="text-slate-400">No recent activity yet.</div>
                ) : (
                  <ol className="relative border-l-4 border-cyan-500 ml-4">
                    {reports.slice(0, 5).map((report, idx) => (
                      <li key={report.id} className="mb-8 ml-6">
                        <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-cyan-600 rounded-full ring-4 ring-cyan-200 text-white text-2xl shadow-lg">
                          {getStageIcon(report.stage)}
                        </span>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="text-lg font-semibold text-slate-100">{report.stage}</div>
                            <div className="text-slate-400 text-sm">{new Date(report.created_at).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${getScoreColor(report.score)}`}>{report.score}/10</span>
                            <button className="ml-2 px-3 py-1 bg-cyan-700 text-white rounded-full text-xs hover:bg-cyan-600 transition-colors">View Details</button>
                          </div>
                        </div>
                        <div className="text-slate-300 mt-2 italic">{report.summary}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-10">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Your Detailed Reports</h2>
              {reports.length === 0 ? (
                <div className="text-slate-400">You haven't completed any assessments yet.</div>
              ) : (
                <div className="grid gap-6">
                  {reports.map(report => (
                    <div key={report.id} className="bg-slate-700 p-6 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-bold text-cyan-300 mb-2">{report.stage}</h3>
                      <p className="text-slate-300 mb-4">Score: <span className={`font-bold ${getScoreColor(report.score)}`}>{report.score}/10</span></p>
                      <p className="text-slate-300 mb-4">Summary: {report.summary}</p>
                      <p className="text-slate-400 text-sm">Date: {new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-10">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Your Progress</h2>
              {Object.keys(stats.stageProgress).length === 0 ? (
                <div className="text-slate-400">No progress data available yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(stats.stageProgress).map(([stage, data]) => (
                    <div key={stage} className="bg-slate-700 p-6 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-bold text-cyan-300 mb-2">{stage}</h3>
                      <p className="text-slate-300 mb-2">Average Score: <span className={`font-bold ${getScoreColor(data.averageScore)}`}>{data.averageScore}/10</span></p>
                      <p className="text-slate-300 mb-2">Attempts: {data.count}</p>
                      <p className="text-slate-400 text-sm">Last Attempt: {data.lastAttempt ? new Date(data.lastAttempt).toLocaleDateString() : 'Never'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}