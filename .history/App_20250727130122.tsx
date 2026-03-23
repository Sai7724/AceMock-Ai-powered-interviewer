import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
// Removed import for missing AceTutor component
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
import { supabase } from './services/supabaseClient';
import AdminPanel from './components/AdminPanel';

// Auth context
interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, metadata?: { username?: string; phone?: string }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() { return useContext(AuthContext)!; }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  async function signUp(email: string, password: string, metadata?: { username?: string; phone?: string }) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (error) throw error;
    return data;
  }
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function AuthModal() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, { username, phone });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2 text-center">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        {mode === 'signup' && (
          <>
            <input type="text" required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="p-3 rounded bg-slate-700 text-white" />
            <input type="tel" required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="p-3 rounded bg-slate-700 text-white" />
          </>
        )}
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 rounded bg-slate-700 text-white" />
        <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-3 rounded bg-slate-700 text-white" />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 rounded mt-2" disabled={loading}>{loading ? 'Loading...' : (mode === 'login' ? 'Login' : 'Sign Up')}</button>
        <div className="text-center text-slate-400 text-sm">
          {mode === 'login' ? (
            <>Don't have an account? <button type="button" className="text-cyan-400 underline" onClick={() => setMode('signup')}>Sign Up</button></>
          ) : (
            <>Already have an account? <button type="button" className="text-cyan-400 underline" onClick={() => setMode('login')}>Login</button></>
          )}
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function MainApp() {
  const { user, signOut } = useAuth();
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.WELCOME);
  const [results, setResults] = useState<InterviewResults>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleStart = useCallback(() => {
    setStage(InterviewStage.LANGUAGE_SELECTION);
    setResults({});
    setSelectedLanguage('');
  }, []);
  
  const handleReset = useCallback(() => {
    setStage(InterviewStage.WELCOME);
    setResults({});
    setSelectedLanguage('');
  }, []);

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
    setResults(prev => ({ ...prev, hrRound: feedback }));
    setStage(InterviewStage.FEEDBACK);
  }, []);

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.WELCOME:
        return <Welcome onStart={handleStart} />;
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
      case InterviewStage.FEEDBACK:
        return <FeedbackReport results={results} onReset={handleReset} />;
      default:
        return <Welcome onStart={handleStart} />;
    }
  };

  const showHeader = stage !== InterviewStage.WELCOME;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-1 sm:p-2 lg:p-3 font-sans">
      {showLogin && !user && <AuthModal />}
      {user && (
        <div className="absolute top-6 right-8 flex gap-4">
          {/* These buttons are now in Navbar, but keep for fallback */}
        </div>
      )}
      {showProfile && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"><div className="relative"><Profile /><button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 bg-slate-700 text-cyan-300 px-3 py-1 rounded">Close</button></div></div>}
      <Navbar
        onReset={handleReset}
        showControls={stage > InterviewStage.WELCOME && stage < InterviewStage.FEEDBACK}
        onShowProfile={() => setShowProfile(true)}
        onShowLogin={() => setShowLogin(true)}
      />
      <main className="w-full max-w-7xl mt-16 pt-28">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="p-12 sm:p-20 lg:p-24">
            {/* Render Welcome and pass custom onStart logic */}
            {stage === InterviewStage.WELCOME ? (
              <Welcome onStart={() => {
                if (!user) {
                  setShowLogin(true);
                } else {
                  setStage(InterviewStage.LANGUAGE_SELECTION);
                  setResults({});
                  setSelectedLanguage('');
                }
              }} />
            ) : renderStage()}
          </div>
        </div>
      </main>
      <footer className="w-full max-w-7xl mt-16 px-4 sm:px-8 lg:px-0 text-slate-400 text-base animate-fade-in-up font-sans">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 py-12 border-t border-slate-700">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              {/* Logo SVG (reuse from header) */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400"><path d="M16.886 7.114A5.5 5.5 0 0 0 7.114 16.886a5.5 5.5 0 0 0 9.772-9.772ZM12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        <div className="text-center text-xs text-slate-500 pb-4">&copy; {new Date().getFullYear()} AceMock. All rights reserved.</div>
      </footer>
    </div>
  );
}