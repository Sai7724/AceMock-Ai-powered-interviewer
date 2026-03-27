import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../App';
import { 
  getCachedReports, 
  mergeStoredReports,
  StoredReport
} from '../services/reportHistory';
import Card from './common/Card';
import GlassButton from './common/GlassButton';
import Spinner from './common/Spinner';
import MainAvatar from './common/Avatars';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Target,
  AlertCircle
} from 'lucide-react';

// Local Utility Functions 
export function getStageIcon(stage: string): string {
  const s = stage?.toLowerCase() || '';
  if (s.includes('self')) return '👋';
  if (s.includes('aptitude')) return '🧠';
  if (s.includes('technical')) return '💻';
  if (s.includes('coding')) return '🚀';
  if (s.includes('hr')) return '🎯';
  return '💬';
}

export function toDisplayStage(stage: string): string {
  const s = stage?.toLowerCase() || '';
  if (s === 'self_introduction') return 'Self Introduction';
  if (s === 'aptitude_test') return 'Aptitude Test';
  if (s === 'technical_qa') return 'Technical Q&A';
  if (s === 'coding_challenge') return 'Coding Challenge';
  if (s === 'hr_round') return 'HR Round';
  return stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, ' ');
}

export function formatDate(dateStr: string, includeTime: boolean = false): string {
  if (!dateStr) return 'Unknown Date';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    if (includeTime) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  } catch (e) {
    return 'Invalid Date';
  }
}

export function toStageKey(stage: unknown): string {
  if (typeof stage !== 'string') return 'report';
  return stage.toLowerCase().replace(/\s+/g, '_');
}

export function getDateValue(dateStr: string): number {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
}

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
  stageProgress: Record<string, { count: number; averageScore: number; lastAttempt: string }>;
}

interface Session {
  id: string; // created_at timestamp
  index: number; // Assessment #X
  date: string;
  reports: Report[];
  averageScore: number;
  complete: boolean;
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

interface ProfileProps {
  onReturnToHome?: () => void;
}

function normalizeScore(val: unknown): number {
  const value = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(value)) {
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
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-amber-400';
  return 'text-rose-400';
}

function SessionCard({ 
  session, 
  isExpanded, 
  onToggle 
}: { 
  session: Session; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <Card 
      className={`!p-0 !rounded-[32px] overflow-hidden transition-all duration-500 border-white/10 ${
        isExpanded ? 'ring-2 ring-cyan-500/50 bg-white/[0.08]' : 'bg-white/5 hover:bg-white/[0.08]'
      }`}
    >
      <div 
        className="p-6 cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-2xl"></div>
            <div className="relative h-16 w-16 flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Assmt</span>
              <span className="text-2xl font-black leading-none">#{session.index}</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Assessment Session</h3>
            <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              {formatDate(session.id, true)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center md:text-right">
            <div className={`text-3xl font-black ${getScoreColor(session.averageScore)}`}>
              {session.averageScore.toFixed(1)}
              <span className="text-xs opacity-40 ml-1 text-slate-400">/10</span>
            </div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Overall Performance</div>
          </div>
          
          <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        className="overflow-hidden bg-black/20 border-t border-white/5"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.reports.map((report) => (
              <div key={report.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getStageIcon(report.stage)}</span>
                    <span className="font-bold text-white text-sm">{toDisplayStage(report.stage)}</span>
                  </div>
                  <span className={`text-sm font-black ${getScoreColor(report.score)}`}>{report.score.toFixed(1)}/10</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 italic">"{report.summary}"</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <GlassButton as={Link} to={`/reports?session=${session.id}`} className="rounded-full px-5 py-2 text-xs font-bold bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              View Detailed Transcript
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}

export default function Profile({ onReturnToHome }: ProfileProps) {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'progress'>('overview');

  const username = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : '';
  const displayName = username || user?.email || 'AceMock User';

  const navigate = useNavigate();

  const handleReturnToHome = () => {
    if (onReturnToHome) {
      onReturnToHome();
      return;
    }
    if (window.location.pathname !== '/') {
      navigate('/');
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
          const fallbackReports = mergeStoredReports([], cachedReports as StoredReport[]);
          setLoadError(
            fallbackReports.length > 0
              ? 'Cloud sync is unavailable right now. Showing your locally saved reports.'
              : 'We could not load your saved reports right now.'
          );
          calculateStats(fallbackReports as Report[]);
          return;
        }

        const remoteReports = (data || []) as StoredReport[];
        const normalizedReports = mergeStoredReports(remoteReports, cachedReports as StoredReport[]);

        calculateStats(normalizedReports as Report[]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        const fallbackReports = mergeStoredReports([], cachedReports as StoredReport[]);
        setLoadError(
          fallbackReports.length > 0
            ? 'Cloud sync is unavailable right now. Showing your locally saved reports.'
            : 'We could not load your profile data right now.'
          );
        calculateStats(fallbackReports as Report[]);
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

    const stageAverages = Object.entries(stageProgress)
      .map(([stage, data]) => ({
        stage,
        average: data.averageScore,
      }));

    const bestStage = stageAverages.length > 0
      ? stageAverages.reduce((a, b) => (a.average >= b.average ? a : b)).stage
      : '';
    const worstStage = stageAverages.length > 0
      ? stageAverages.reduce((a, b) => (a.average <= b.average ? a : b)).stage
      : '';
    const lastAssessment = userReports[0]?.created_at || '';
    const uniqueStages = Object.keys(stageProgress).length;
    const totalPossibleStages = 6;
    const completionRate = Math.round((uniqueStages / totalPossibleStages) * 100);

    const totalScore = userReports.reduce((acc, report) => acc + report.score, 0);
    const averageScore = Math.round((totalScore / userReports.length) * 100) / 100;

    // Grouping into sessions (assessments) by exact created_at timestamp
    // Grouping into sessions
    const sessionsMap = new Map<string, Report[]>();
    userReports.forEach(r => {
      const dateKey = r.created_at;
      if (!sessionsMap.has(dateKey)) {
        sessionsMap.set(dateKey, []);
      }
      sessionsMap.get(dateKey)!.push(r);
    });

    const sortedSessionKeys = Array.from(sessionsMap.keys()).sort((a, b) => getDateValue(a) - getDateValue(b));
    
    const sessionsList: Session[] = sortedSessionKeys.map((key, i) => {
      const sessionReports = sessionsMap.get(key)!;
      const avg = Math.round((sessionReports.reduce((acc, r) => acc + r.score, 0) / sessionReports.length) * 100) / 100;
      return {
        id: key,
        index: i + 1,
        date: key,
        reports: sessionReports,
        averageScore: avg,
        complete: sessionReports.length >= 5
      };
    }).reverse(); // Latest sessions first

    setSessions(sessionsList);
    setStats({
      totalAssessments: sessionsList.length,
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
        <div className="p-8 md:p-10 text-center w-full max-w-lg rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="text-xl text-cyan-300 font-bold uppercase tracking-widest">Authentication Required</div>
          <p className="mt-4 text-slate-400">Please log in to view your personalized interview dashboard.</p>
          <GlassButton as={Link} to="/" className="mt-8 rounded-full px-8">Return to Login</GlassButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="liquid-page min-h-screen flex flex-col items-center justify-center p-8">
        <div className="p-8 md:p-10 text-center w-full max-w-lg rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <Spinner />
          </div>
          <div className="text-lg text-cyan-300 font-black uppercase tracking-[0.2em] animate-pulse">Initializing Dashboard</div>
          <p className="mt-2 text-slate-500 text-xs font-bold uppercase tracking-widest">Fetching your assessment records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-page min-h-screen text-slate-100 font-sans overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="p-8 md:p-10 mb-8 w-full rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-cyan-500/15 transition-all duration-700"></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                  <MainAvatar
                    seed={user.id}
                    name={displayName}
                    size="100%"
                    className="w-full h-full text-4xl"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{displayName}</h1>
                  <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Validated Profile</span>
                </div>
                
                <p className="text-slate-400 text-lg mb-8 font-medium opacity-80">{user?.email}</p>

                <div className="grid grid-cols-3 gap-4 md:gap-8 justify-center md:justify-start">
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-black text-white leading-none mb-1">{stats.totalAssessments}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Interviews</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className={`text-3xl font-black leading-none mb-1 ${getScoreColor(stats.averageScore)}`}>
                      {stats.averageScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Avg Score</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-black text-emerald-400 leading-none mb-1">{stats.completionRate}%</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap justify-center items-start gap-4">
              <GlassButton variant="secondary" onClick={handleReturnToHome} className="rounded-2xl px-6 py-3 text-sm font-bold bg-white/5 border-white/5 hover:bg-white/10">
                Back to Home
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={async () => {
                  await signOut();
                  handleReturnToHome();
                }}
                className="rounded-2xl px-6 py-3 text-sm font-bold bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 transition-all"
              >
                Logout Account
              </GlassButton>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-8 p-5 text-amber-200 w-full rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex items-center gap-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{loadError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 inline-flex p-1.5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md">
          {(['overview', 'reports', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-[color:var(--accent-gold-strong)] text-slate-950 shadow-[0_0_15px_rgba(232,195,97,0.3)]' 
                  : 'text-slate-400 hover:text-[color:var(--accent-gold-strong)] hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full transition-all duration-500">
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="!p-8 border-white/10 bg-white/5 relative overflow-hidden" lowPerformance={true}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy className="w-24 h-24" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400/80 mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Strongest Competency
                  </p>
                  <p className="text-3xl font-black text-white tracking-tight">{toDisplayStage(stats.bestStage || 'report')}</p>
                  <p className="mt-2 text-slate-500 text-xs font-bold uppercase tracking-widest">Consistently high performance in this stage</p>
                </Card>
                
                <Card className="!p-8 border-white/10 bg-white/5 relative overflow-hidden" lowPerformance={true}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target className="w-24 h-24" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-400/80 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Focus Area
                  </p>
                  <p className="text-3xl font-black text-white tracking-tight">{toDisplayStage(stats.worstStage || 'report')}</p>
                  <p className="mt-2 text-slate-500 text-xs font-bold uppercase tracking-widest">Prioritize these rounds in your next prep</p>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-lg font-black uppercase tracking-[0.3em] text-white/40">Recent Assessment Performance</h2>
                  <button onClick={() => setActiveTab('reports')} className="text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">See Complete History</button>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="py-24 text-center text-slate-500 w-full rounded-[40px] bg-white/[0.03] border border-white/5 border-dashed">
                    <p className="text-sm font-bold uppercase tracking-widest">No assessment data available</p>
                    <p className="mt-2 text-xs opacity-60">Complete your first interview round to see analysis here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sessions.slice(0, 3).map((session) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        isExpanded={expandedSessionId === session.id}
                        onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Full Transcript Library</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Review your detailed feedback across all sessions</p>
                </div>
                <div className="inline-flex px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {sessions.length} Recorded Assessments
                </div>
              </div>
              
              {sessions.length === 0 ? (
                <div className="py-24 text-center text-slate-500 w-full rounded-[40px] bg-white/[0.03] border border-white/5 border-dashed">
                  <p className="text-sm font-bold uppercase tracking-widest">No reports archived yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sessions.map((session) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      isExpanded={expandedSessionId === session.id}
                      onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="px-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Skill Mastery & Progression</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Long-term performance trends by interview round</p>
              </div>

              {Object.keys(stats.stageProgress).length === 0 ? (
                <div className="py-24 text-center text-slate-500 w-full rounded-[40px] bg-white/[0.03] border border-white/5 border-dashed">
                   <p className="text-sm font-bold uppercase tracking-widest">Progress data will appear here after your first round</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Object.entries(stats.stageProgress).map(([stage, data]) => (
                    <Card key={stage} className="!p-8 !rounded-[40px] border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all flex flex-col justify-between group">
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-3xl group-hover:scale-110 transition-transform">
                            {getStageIcon(stage)}
                          </span>
                          <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-2">{toDisplayStage(stage)}</h3>
                            <div className="text-[10px] items-center flex gap-2">
                              <span className="text-slate-500 font-black uppercase tracking-widest">{data.count} Total Attempts</span>
                              <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                              <span className="text-cyan-400 font-black uppercase tracking-widest">Latest: {formatDate(data.lastAttempt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Mastery Level</div>
                             <div className={`text-2xl font-black ${getScoreColor(data.averageScore)} tracking-tighter`}>{data.averageScore * 10}%</div>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${data.averageScore * 10}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className={`h-full rounded-full ${data.averageScore >= 8 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : data.averageScore >= 6 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`} 
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Session cards also visible in progress to satisfy "all tabs" requirement */}
              <div className="pt-10 border-t border-white/5">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8 px-2">Progression Milestones</h3>
                <div className="space-y-6">
                  {sessions.slice(0, 3).map((session) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      isExpanded={expandedSessionId === session.id}
                      onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
