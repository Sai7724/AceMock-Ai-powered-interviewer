import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthResponse, User } from '@supabase/supabase-js';
import { InterviewStage, InterviewResults, SelfIntroductionFeedback, TechnicalQAFeedback, CodingFeedback, AptitudeFeedback, HRFeedback } from './types';
import Navbar from './components/common/Header';
import Welcome from './components/Welcome';
import LanguageSelection from './components/LanguageSelection';
import SelfIntroduction from './components/SelfIntroduction';
import AptitudeTest from './components/AptitudeTest';
import TechnicalQA from './components/TechnicalQA';
import CodingChallenge from './components/CodingChallenge';
import HRRound from './components/HRRound';
import FeedbackReport from './components/FeedbackReport';
import Profile from './components/Profile';
import { saveInterviewReports } from './services/reportHistory';
import { supabase } from './services/supabaseClient';
import AdminPanel from './components/AdminPanel';
import TestStagesPage from './test-workflow/routes/TestStagesPage';
// import GlassButton from './components/common/GlassButton';
// import GlassSurface from './components/common/GlassSurface';
import RouteBackground from './components/common/RouteBackground';
import DarkVeil from './components/DarkVeil';
import LoginPage from './components/LoginPage';


// Authentication can only be bypassed when explicitly enabled for local debugging.
export const AUTH_DISABLED = import.meta.env.MODE === 'test'
  ? false
  : import.meta.env.VITE_DISABLE_AUTH === 'true';

// Auth context
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: { username?: string; phone?: string }
  ) => Promise<AuthResponse['data']>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() { return useContext(AuthContext)!; }


function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(!AUTH_DISABLED);

  useEffect(() => {
    if (AUTH_DISABLED) {
      // Skip auth subscription while auth is disabled
      return;
    }
    let isMounted = true;

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load current session:', error);
        }

        if (isMounted) {
          setUser(data.session?.user ?? null);
          setAuthLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user || null);
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  async function signUp(email: string, password: string, metadata?: { username?: string; phone?: string }) {
    if (AUTH_DISABLED) {
      return Promise.resolve({ user: null, session: null });
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (error) throw error;
    return data;
  }
  async function signIn(email: string, password: string) {
    if (AUTH_DISABLED) {
      // No-op while auth disabled
      return Promise.resolve({});
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    if (AUTH_DISABLED) {
      // No-op while auth disabled
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <div className="fixed inset-0 -z-10">
        <DarkVeil
          hueShift={5}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.8}
          scanlineFrequency={32}
          warpAmount={0.55}
          resolutionScale={1}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RouteBackground><MainApp /></RouteBackground>} />
          <Route path="/acetutor" element={<RouteBackground><ComingSoonPage /></RouteBackground>} />
          <Route path="/admin" element={<RouteBackground><AdminPanel /></RouteBackground>} />
          <Route path="/test-stages" element={<RouteBackground><TestStagesPage /></RouteBackground>} />
          <Route path="/profile" element={<RouteBackground><Profile /></RouteBackground>} />
          <Route path="/login" element={<RouteBackground><LoginPage /></RouteBackground>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.WELCOME);
  const [results, setResults] = useState<InterviewResults>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [attemptId, setAttemptId] = useState(0);
  const navigate = useNavigate();

  const isInterviewActive = useMemo(() => {
    return [
      InterviewStage.SELF_INTRODUCTION,
      InterviewStage.APTITUDE_TEST,
      InterviewStage.TECHNICAL_QA,
      InterviewStage.CODING_CHALLENGE,
      InterviewStage.HR_ROUND,
    ].includes(stage);
  }, [stage]);


  const handleReset = useCallback(() => {
    setStage(InterviewStage.WELCOME);
    setResults({});
    setSelectedLanguage('');
  }, []);

  const handleStartAssessment = useCallback(() => {
    if (AUTH_DISABLED) {
      setAttemptId((current) => current + 1);
      setStage(InterviewStage.LANGUAGE_SELECTION);
      setResults({});
      setSelectedLanguage('');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setAttemptId((current) => current + 1);
    setStage(InterviewStage.LANGUAGE_SELECTION);
    setResults({});
    setSelectedLanguage('');
  }, [user]);

  const handleLanguageSelect = useCallback((language: string) => {
    setSelectedLanguage(language);
    setStage(InterviewStage.SELF_INTRODUCTION);
  }, []);

  const handleSelfIntroFeedback = useCallback((feedback: SelfIntroductionFeedback) => {
    setResults(prev => ({ ...prev, selfIntroduction: feedback }));
    setStage(InterviewStage.APTITUDE_TEST);
  }, []);

  const handleAptitudeFeedback = useCallback((feedback: AptitudeFeedback) => {
    setResults(prev => ({ ...prev, aptitude: feedback }));
    setStage(InterviewStage.TECHNICAL_QA);
  }, []);

  const handleTechnicalQAFeedback = useCallback((feedback: TechnicalQAFeedback) => {
    setResults(prev => ({ ...prev, technicalQA: feedback }));
    setStage(InterviewStage.CODING_CHALLENGE);
  }, []);

  const handleCodingFeedback = useCallback((feedback: CodingFeedback) => {
    setResults(prev => ({ ...prev, coding: feedback }));
    setStage(InterviewStage.HR_ROUND);
  }, []);

  const handleHRFeedback = useCallback((feedback: HRFeedback) => {
    const nextResults = { ...results, hrRound: feedback };
    setResults(nextResults);
    setStage(InterviewStage.FEEDBACK);

    if (user) {
      void saveInterviewReports(user.id, nextResults, attemptId);
    }
  }, [attemptId, results, user]);

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.LANGUAGE_SELECTION:
        return <LanguageSelection onComplete={handleLanguageSelect} />;
      case InterviewStage.SELF_INTRODUCTION:
        return <SelfIntroduction onComplete={handleSelfIntroFeedback} />;
      case InterviewStage.APTITUDE_TEST:
        return <AptitudeTest onComplete={handleAptitudeFeedback} />;
      case InterviewStage.TECHNICAL_QA:
        return <TechnicalQA onComplete={handleTechnicalQAFeedback} language={selectedLanguage} />;
      case InterviewStage.CODING_CHALLENGE:
        return <CodingChallenge onComplete={handleCodingFeedback} language={selectedLanguage} />;
      case InterviewStage.HR_ROUND:
        return <HRRound onComplete={handleHRFeedback} />;
      case InterviewStage.FEEDBACK:
        return <FeedbackReport results={results} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="liquid-page min-h-screen flex flex-col items-center p-2 sm:p-3 lg:p-4 font-sans">
      {user && (
        <div className="absolute top-6 right-8 flex gap-4">
          {/* These buttons are now in Navbar, but keep for fallback */}
        </div>
      )}
      <Navbar
        onReset={handleReset}
        onStartAssessment={handleStartAssessment}
        onLeaveInterview={handleReset}
        showLandingNav={stage === InterviewStage.WELCOME}
        authDisabled={AUTH_DISABLED}
        isInterviewActive={isInterviewActive}
      />
      <main className={`w-full max-w-7xl px-4 sm:px-8 lg:px-12 ${stage === InterviewStage.WELCOME ? 'mt-8 pt-20' : 'mt-14 pt-20'}`}>
        {stage === InterviewStage.WELCOME ? (
          <Welcome onStart={handleStartAssessment} />
        ) : renderStage()}
      </main>
      {stage === InterviewStage.WELCOME && (
        <footer className="w-full max-w-7xl mt-16 px-4 sm:px-8 lg:px-0 text-slate-300 text-base animate-fade-in-up font-sans">
          <div
            className="px-8 py-10 liquid-panel"
            style={{ borderRadius: '32px' }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 py-6">
              <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-2xl font-extrabold text-cyan-400 tracking-tight font-sans">AceMock</span>
                </div>
                <p className="max-w-xs text-slate-400 mb-2 leading-relaxed text-center md:text-left">Your AI-powered interview coach for mastering every stage of the tech interview process.</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-16 w-full md:w-auto">
                <div>
                  <h4 className="text-slate-200 font-semibold mb-2">About</h4>
                  <ul className="space-y-1">
                    <li><span className="hover:text-cyan-400 cursor-pointer">Our Story</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Team</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Careers</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold mb-2">Features</h4>
                  <ul className="space-y-1">
                    <li><span className="hover:text-cyan-400 cursor-pointer">AI Feedback</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Practice Modes</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Progress Tracking</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold mb-2">Resources</h4>
                  <ul className="space-y-1">
                    <li><span className="hover:text-cyan-400 cursor-pointer">Blog</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Help Center</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">Contact</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold mb-2">Social</h4>
                  <ul className="space-y-1">
                    <li><span className="hover:text-cyan-400 cursor-pointer">Twitter</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">LinkedIn</span></li>
                    <li><span className="hover:text-cyan-400 cursor-pointer">GitHub</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-slate-500 pt-4">&copy; {new Date().getFullYear()} AceMock. All rights reserved.</div>
          </div>
        </footer>
      )}
    </div>
  );
}

function ComingSoonPage() {
  return (
    <div className="liquid-page min-h-screen text-slate-100 flex items-center justify-center px-6">
      <div
        className="max-w-xl p-10 text-center liquid-panel"
        style={{ borderRadius: '32px' }}
      >
        <h1 className="mb-4 text-4xl font-extrabold text-cyan-300" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>AceTutor is coming soon</h1>
        <p className="text-slate-300 mb-8">
          The landing page linked to this route, but the actual feature has not been shipped yet.
        </p>
        <Link
          to="/"
          className="liquid-button-primary inline-flex items-center justify-center rounded-full px-8 py-3 font-bold text-lg"
        >
          Back to AceMock
        </Link>
      </div>
    </div>
  );
}


