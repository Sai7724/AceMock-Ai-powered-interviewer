import React, { useState, useCallback } from 'react';
import { InterviewStage, InterviewResults, SelfIntroductionFeedback, TechnicalQAFeedback, CodingFeedback, AptitudeFeedback } from './types';
import Navbar from './components/common/Header';
import Welcome from './components/Welcome';
import LanguageSelection from './components/LanguageSelection';
import SelfIntroduction from './components/SelfIntroduction';
import AptitudeTest from './components/AptitudeTest';
import TechnicalQA from './components/TechnicalQA';
import CodingChallenge from './components/CodingChallenge';
import FeedbackReport from './components/FeedbackReport';

export default function App() {
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.WELCOME);
  const [results, setResults] = useState<InterviewResults>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8 sm:p-16 lg:p-24 font-sans">
      <Navbar onReset={handleReset} showControls={stage > InterviewStage.WELCOME && stage < InterviewStage.FEEDBACK}/>
      <main className="w-full max-w-7xl mt-16 pt-28">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="p-12 sm:p-20 lg:p-24">
            {renderStage()}
          </div>
        </div>
      </main>
      <footer className="w-full max-w-7xl mt-16 text-center text-slate-400 text-base animate-fade-in-up font-sans">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 py-14 border-t border-slate-700">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-4xl font-extrabold text-cyan-400 mb-3 tracking-tight font-sans">AceMock</span>
            <p className="max-w-xs text-slate-400 mb-3 leading-relaxed">Your AI-powered interview coach for mastering every stage of the tech interview process.</p>
            <div className="flex gap-5 mt-3">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.309.68.92.68 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg></a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.785-1.75-1.75s.784-1.75 1.75-1.75 1.75.785 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.605v5.591z"/></svg></a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-semibold text-slate-300 mb-1">Quick Links</span>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
              <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              <a href="#howitworks" className="hover:text-cyan-400 transition-colors">How It Works</a>
              <a href="#projectinfo" className="hover:text-cyan-400 transition-colors">Project Info</a>
              <a href="#devteam" className="hover:text-cyan-400 transition-colors">Dev Team</a>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">&copy; 2024 AceMock. All rights reserved.</div>
      </footer>
    </div>
  );
}