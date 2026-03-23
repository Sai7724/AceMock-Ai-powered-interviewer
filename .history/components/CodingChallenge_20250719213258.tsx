import React, { useState, useEffect } from 'react';
import { generateCodingChallenge, evaluateCode } from '../services/geminiService';
import { CodingFeedback } from '../types';
import Spinner from './common/Spinner';

interface CodingChallengeProps {
  onComplete: (feedback: CodingFeedback) => void;
  language: string;
}

export default function CodingChallenge({ onComplete, language }: CodingChallengeProps) {
  const [challenge, setChallenge] = useState<{ title: string; description: string; defaultCode: string; } | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedChallenge = await generateCodingChallenge(language);
        setChallenge(fetchedChallenge);
        setCode(fetchedChallenge.defaultCode);
      } catch (err) {
        setError("Failed to load a coding challenge. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChallenge();
  }, [language]);

  const handleSubmit = async () => {
    if (!code.trim() || !challenge) {
      setError("Please provide your code.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const feedback = await evaluateCode(challenge.description, language, code);
      onComplete(feedback);
    } catch (err) {
      setError("Failed to get feedback from AI. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner />
        <p className="mt-4 text-slate-400">Crafting a coding challenge for you...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return <p className="text-red-400 text-center">{error || "Could not load challenge."}</p>;
  }

  return (
    <div className="flex flex-col items-center animate-fade-in font-grotesk">
      <h2 className="text-3xl font-extrabold text-cyan-400 mb-4 tracking-tight font-grotesk">Stage 5: Coding Challenge</h2>
      
      <div className="w-full bg-slate-900/50 p-8 rounded-2xl border border-slate-700 mb-8 shadow-lg font-grotesk">
        <h3 className="font-bold text-slate-100 text-2xl mb-4 font-grotesk">{challenge.title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap text-lg leading-relaxed font-grotesk">{challenge.description}</p>
      </div>
      
      <div className="w-full mb-6">
        <label className="block text-lg font-medium text-slate-400 mb-2 font-grotesk">Language: <span className="font-bold text-slate-200">{language}</span></label>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code solution..."
        className="w-full h-80 p-6 bg-slate-900 border border-slate-700 rounded-xl font-mono text-base focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-grotesk"
        spellCheck="false"
        disabled={isSubmitting}
      />

      {error && <p className="text-red-400 mt-4 font-grotesk">{error}</p>}

      <div className="mt-8">
        {isSubmitting ? (
          <Spinner />
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl transition-colors duration-300 text-xl font-grotesk shadow-lg shadow-cyan-500/20"
          >
            Submit Code
          </button>
        )}
      </div>
    </div>
  );
}