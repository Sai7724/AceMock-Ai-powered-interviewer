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
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Stage 5: Coding Challenge</h2>
      
      <div className="w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6">
        <h3 className="font-bold text-slate-100 text-xl mb-2">{challenge.title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap">{challenge.description}</p>
      </div>
      
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-1">Language: <span className="font-bold text-slate-200">{language}</span></label>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code solution..."
        className="w-full h-80 p-4 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
        spellCheck="false"
        disabled={isSubmitting}
      />

      {error && <p className="text-red-400 mt-4">{error}</p>}

      <div className="mt-6">
        {isSubmitting ? (
          <Spinner />
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            Submit Code
          </button>
        )}
      </div>
    </div>
  );
}