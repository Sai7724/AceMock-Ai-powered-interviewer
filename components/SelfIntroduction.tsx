import React, { useState, useEffect, useRef } from 'react';
import { analyzeSelfIntroduction } from '../services/geminiService';
import { SelfIntroductionFeedback, SpeechRecognition } from '../types';
import Spinner from './common/Spinner';
import { MicrophoneIcon } from '../constants';

// Browser compatibility check
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

interface SelfIntroductionProps {
  onComplete: (feedback: SelfIntroductionFeedback) => void;
}

export default function SelfIntroduction({ onComplete }: SelfIntroductionProps) {
  const [introduction, setIntroduction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const PROMPT = "Tell me about yourself. What are your passions, skills, and career goals?";

  // Text-to-Speech on component mount
  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(PROMPT);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    // Cleanup speech on unmount
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);
  
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
      }
      setIntroduction(prev => (prev ? prev + ' ' : '') + transcript.trim());
    };
    
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSubmit = async () => {
    if (!introduction.trim()) {
      setError("Please provide your self-introduction.");
      return;
    }
    setIsLoading(true);
    setError(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    try {
      const feedback = await analyzeSelfIntroduction(introduction);
      onComplete(feedback);
    } catch (err) {
      setError("Failed to get feedback from AI. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Stage 2: Self-Introduction</h2>
      <p className="text-slate-400 mb-6 text-center">{PROMPT}</p>
      
      <textarea
        value={introduction}
        onChange={(e) => setIntroduction(e.target.value)}
        placeholder="Type or use the microphone to record your introduction..."
        className="w-full h-48 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
        disabled={isLoading}
      />
      
      {error && <p className="text-red-400 mt-2 text-center">{error}</p>}

      <div className="mt-6 flex w-full items-center justify-center gap-4">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {SpeechRecognitionAPI && (
               <button
                  type="button"
                  onClick={handleToggleListening}
                  title={isListening ? 'Stop recording' : 'Start recording'}
                  className={`p-3 rounded-full transition-all duration-300 ease-in-out ${isListening ? 'bg-red-600 shadow-lg shadow-red-500/50 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
               >
                 <MicrophoneIcon className="w-6 h-6 text-white" />
               </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !introduction.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              Submit for Analysis
            </button>
          </>
        )}
      </div>
    </div>
  );
}