import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getCachedReports, mergeStoredReports } from '../services/reportHistory';
import { supabase } from '../services/supabaseClient';
import Card from './common/Card';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';
import Spinner from './common/Spinner';

interface RawReport {
  id?: unknown;
  created_at?: unknown;
  stage?: unknown;
  score?: unknown;
  summary?: unknown;
  user_id?: unknown;
}

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

interface ProfileProps {
  onReturnToHome?: () => void;
}

const EMPTY_STATS: UserStats = {
  totalAssessments: 0,
  averageScore: 0,
  bestStage: '',
  worstStage: '',
  lastAssessment: '',
  completionRate: 0,
  stageProgress: {},
};

function getInitials(nameOrEmail?: string | null) {
  if (!nameOrEmail) return 'AM';
  const parts = nameOrEmail.split(/[@.\s]/).filter(Boolean);
  if (parts.length === 0) return 'AM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function getDateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string, withTime = false) {
  const parsed = getDateValue(value);
  if (!parsed) {
    return 'Unknown';
  }

  return withTime
    ? new Date(parsed).toLocaleString()
    : new Date(parsed).toLocaleDateString();
}

function toStageKey(stage: unknown) {
  if (typeof stage !== 'string') {
    return 'report';
  }

  const normalized = stage.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!normalized) {
    return 'report';
  }

  switch (normalized) {
    case 'selfintroduction':
      return 'self_introduction';
    case 'aptitude':
      return 'aptitude_test';
    case 'technical':
      return 'technical_qa';
    case 'coding':
      return 'coding_challenge';
    case 'hr':
      return 'hr_round';
    default:
      return normalized;
  }
}

function toDisplayStage(stage: string) {
  switch (stage) {
    case 'self_introduction':
      return 'Self Introduction';
    case 'aptitude_test':
      return 'Aptitude Test';
    case 'technical_qa':
      return 'Technical Q&A';
    case 'coding_challenge':
      return 'Coding Challenge';
    case 'hr_round':
      return 'HR Round';
    case 'feedback':
      return 'Feedback';
    case 'report':
      return 'Interview Report';
    default:
      return stage
        .split('_')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(' ') || 'Interview Report';
  }
}

function getStageIcon(stage: string) {
  switch (stage) {
    case 'self_introduction':
      return 'SI';
    case 'aptitude_test':
      return 'AT';
    case 'technical_qa':
      return 'TQ';
    case 'coding_challenge':
      return 'CC';
    case 'hr_round':
      return 'HR';
    case 'feedback':
      return 'FB';
    default:
      return 'RP';
  }
}

function normalizeScore(score: unknown) {
  const value = typeof score === 'number' ? score : Number(score);
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(10, Math.round(value * 100) / 100));
}

function normalizeReport(raw: RawReport, index: number): Report {
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : `report-${index}`,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : '',
    stage: toStageKey(raw.stage),
    score: normalizeScore(raw.score),
    summary:
      typeof raw.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : 'No summary available for this report.',
    user_id: typeof raw.user_id === 'string' ? raw.user_id : '',
  };
}

function getScoreColor(score: number) {
  if (score >= 8) return 'text-emerald-300';
  if (score >= 6) return 'text-amber-300';
  return 'text-rose-300';
}

export default function Profile({ onReturnToHome }: ProfileProps) {
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'progress'>('overview');

  const username = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : '';
  const displayName = username || user?.email || 'AceMock User';

  const handleReturnToHome = () => {
    if (onReturnToHome) {
      onReturnToHome();
      return;
    }

    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);
      const cachedReports = getCachedReports(user.id).map((row, index) =>
        normalizeReport(row as RawReport, index)
      );

      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reports:', error);
          const fallbackReports = mergeStoredReports([], cachedReports);
          setLoadError(
            fallbackReports.length > 0
              ? 'Cloud sync is unavailable right now. Showing your locally saved reports.'
              : 'We could not load your saved reports right now.'
          );
          setReports(fallbackReports);
          calculateStats(fallbackReports);
          return;
        }

        const remoteReports = Array.isArray(data)
          ? data.map((row, index) => normalizeReport(row as RawReport, index))
          : [];
        const normalizedReports = mergeStoredReports(remoteReports, cachedReports);

        setReports(normalizedReports);
        calculateStats(normalizedReports);
      } catch (error) {
        console.error('Error fetching user data:', error);
        const fallbackReports = mergeStoredReports([], cachedReports);
        setLoadError(
          fallbackReports.length > 0
            ? 'Cloud sync is unavailable right now. Showing your locally saved reports.'
            : 'We could not load your profile data right now.'
        );
        setReports(fallbackReports);
        calculateStats(fallbackReports);
      } finally {
        setLoading(false);
      }
    }

    void fetchUserData();
  }, [user]);

  const calculateStats = (userReports: Report[]) => {
    if (userReports.length === 0) {
      setStats(EMPTY_STATS);
      return;
    }

    const stageProgress: UserStats['stageProgress'] = {};

    userReports.forEach((report) => {
      const stage = report.stage || 'report';
      if (!stageProgress[stage]) {
        stageProgress[stage] = { count: 0, averageScore: 0, lastAttempt: report.created_at };
      }

      stageProgress[stage].count += 1;
      stageProgress[stage].averageScore += report.score;

      if (getDateValue(report.created_at) > getDateValue(stageProgress[stage].lastAttempt)) {
        stageProgress[stage].lastAttempt = report.created_at;
      }
    });

    Object.keys(stageProgress).forEach((stage) => {
      stageProgress[stage].averageScore =
        Math.round((stageProgress[stage].averageScore / stageProgress[stage].count) * 100) / 100;
    });

    const stageAverages = Object.entries(stageProgress).map(([stage, data]) => ({
      stage,
      average: data.averageScore,
    }));

    const bestStage = stageAverages.length > 0
      ? stageAverages.reduce((a, b) => (a.average >= b.average ? a : b)).stage
      : '';
    const worstStage = stageAverages.length > 0
      ? stageAverages.reduce((a, b) => (a.average <= b.average ? a : b)).stage
      : '';
    const totalAssessments = userReports.length;
    const averageScore =
      Math.round((userReports.reduce((acc, report) => acc + report.score, 0) / totalAssessments) * 100) / 100;
    const lastAssessment = userReports[0]?.created_at || '';
    const uniqueStages = Object.keys(stageProgress).length;
    const totalPossibleStages = 6;
    const completionRate = Math.round((uniqueStages / totalPossibleStages) * 100);

    setStats({
      totalAssessments,
      averageScore,
      bestStage,
      worstStage,
      lastAssessment,
      completionRate,
      stageProgress,
    });
  };

  const tabVariant = (tab: 'overview' | 'reports' | 'progress') =>
    activeTab === tab ? 'primary' : 'secondary';
  
  const tabClass = (tab: 'overview' | 'reports' | 'progress') =>
    `rounded-full px-4 py-2 text-sm font-medium transition-all ${activeTab === tab
      ? 'text-slate-950'
      : 'text-slate-200'
    }`;

  if (!user) {
    return (
      <div className="liquid-page min-h-screen flex items-center justify-center p-8">
        <GlassSurface
          width="auto"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="px-8 py-10 text-center"
        >
          <div className="text-xl text-cyan-300">Please log in to view your profile.</div>
        </GlassSurface>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="liquid-page min-h-screen flex flex-col items-center justify-center p-8">
        <GlassSurface
          width="auto"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="px-8 py-10 text-center"
        >
          <Spinner />
          <div className="mt-4 text-lg text-cyan-300">Loading your dashboard...</div>
        </GlassSurface>
      </div>
    );
  }

  return (
    <div className="liquid-page min-h-screen text-slate-100 font-sans">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-8 md:p-10 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/30 transition-all duration-500"></div>
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 bg-slate-900/50 flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.username || user?.email || 'User'}`}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{displayName}</h1>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">PRO Member</span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-lg mb-6 leading-none">
                {user?.email || 'guest@example.com'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">{stats.totalAssessments}</div>
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Interviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                    S
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">{stats.averageScore}</div>
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Avg Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
                    C
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">{stats.completionRate}%</div>
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Completion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassSurface>

        {loadError && (
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={24}
            blur={12}
            opacity={0.7}
            backgroundOpacity={0.1}
            className="mb-6 px-5 py-4 text-sm text-amber-200"
          >
            {loadError}
          </GlassSurface>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <GlassButton variant="secondary" onClick={handleReturnToHome} className="rounded-full px-4 py-3 text-sm font-semibold">
            Back to Home
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={async () => {
              await signOut();
              handleReturnToHome();
            }}
            className="rounded-full px-4 py-3 text-sm font-semibold"
          >
            Logout
          </GlassButton>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <GlassButton variant={tabVariant('overview')} className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </GlassButton>
          <GlassButton variant={tabVariant('reports')} className={tabClass('reports')} onClick={() => setActiveTab('reports')}>
            Reports
          </GlassButton>
          <GlassButton variant={tabVariant('progress')} className={tabClass('progress')} onClick={() => setActiveTab('progress')}>
            Progress
          </GlassButton>
        </div>

        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-6"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <div className="text-center bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
                  <div className="text-2xl font-bold text-cyan-300">{stats.totalAssessments}</div>
                  <div className="text-sm text-slate-400">Total Assessments</div>
                </div>
                <div className="text-center bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
                  <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}/10</div>
                  <div className="text-sm text-slate-400">Average Score</div>
                </div>
                <div className="text-center bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
                  <div className="text-2xl font-bold text-emerald-300">{stats.completionRate}%</div>
                  <div className="text-sm text-slate-400">Completion Rate</div>
                </div>
                <div className="text-center bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-xl">
                  <div className="text-lg font-bold text-slate-200">{formatDate(stats.lastAssessment)}</div>
                  <div className="text-sm text-slate-400">Last Assessment</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="!p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Best Stage</p>
                  <p className="mt-3 text-xl font-bold text-slate-100">{toDisplayStage(stats.bestStage || 'report')}</p>
                </Card>
                <Card className="!p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Needs Work</p>
                  <p className="mt-3 text-xl font-bold text-slate-100">{toDisplayStage(stats.worstStage || 'report')}</p>
                </Card>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-cyan-200">Recent Activity</h2>
                {reports.length === 0 ? (
                  <GlassSurface
                    width="100%"
                    height="auto"
                    borderRadius={24}
                    blur={12}
                    opacity={0.7}
                    backgroundOpacity={0.04}
                    className="py-8 text-center text-slate-400"
                  >
                    No assessments completed yet.
                  </GlassSurface>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <Card key={report.id} className="flex items-center justify-between gap-4 !p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-bold text-cyan-300">
                            {getStageIcon(report.stage)}
                          </span>
                          <div>
                            <div className="font-medium text-slate-100">{toDisplayStage(report.stage)}</div>
                            <div className="text-sm text-slate-400">{formatDate(report.created_at)}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${getScoreColor(report.score)}`}>{report.score}/10</div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-cyan-200">Detailed Reports</h2>
              {reports.length === 0 ? (
                <GlassSurface
                  width="100%"
                  height="auto"
                  borderRadius={24}
                  blur={12}
                  opacity={0.7}
                  backgroundOpacity={0.04}
                  className="py-8 text-center text-slate-400"
                >
                  No reports available yet.
                </GlassSurface>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="!p-4">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-cyan-200">{toDisplayStage(report.stage)}</h3>
                        <span className={`font-bold ${getScoreColor(report.score)}`}>{report.score}/10</span>
                      </div>
                      <p className="mb-2 text-sm text-slate-300">{report.summary}</p>
                      <p className="text-xs text-slate-400">{formatDate(report.created_at, true)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-cyan-200">Stage Progress</h2>
              {Object.keys(stats.stageProgress).length === 0 ? (
                <GlassSurface
                  width="100%"
                  height="auto"
                  borderRadius={24}
                  blur={12}
                  opacity={0.7}
                  backgroundOpacity={0.04}
                  className="py-8 text-center text-slate-400"
                >
                  No progress data available yet.
                </GlassSurface>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(stats.stageProgress).map(([stage, data]) => {
                    return (
                      <Card key={stage} className="!p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-bold text-cyan-300">
                            {getStageIcon(stage)}
                          </span>
                          <h3 className="font-semibold text-cyan-200">{toDisplayStage(stage)}</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            Average Score: <span className={`font-bold ${getScoreColor(data.averageScore)}`}>{data.averageScore}/10</span>
                          </div>
                          <div>
                            Attempts: <span className="font-bold text-slate-200">{data.count}</span>
                          </div>
                          <div>
                            Last Attempt: <span className="text-slate-400">{formatDate(data.lastAttempt)}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </GlassSurface>
      </div>
    </div>
  );
}
