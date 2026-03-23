import { useState, useEffect, useRef } from 'react';
import { analyzeSelfIntroduction } from '../services/geminiService';
import { SelfIntroductionFeedback, SpeechRecognition } from '../types';
import Spinner from './common/Spinner';
import { MicrophoneIcon } from '../constants';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';

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
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 animate-fade-in font-sans px-4">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="text-center p-6"
      >
        <p className="liquid-kicker">Stage 2</p>
        <h2 className="liquid-heading mt-3 text-3xl font-extrabold sm:text-4xl tracking-tight">
          Self-Introduction
        </h2>
      </GlassSurface>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={20}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="p-8 sm:p-10 flex items-center justify-center text-center"
      >
        <p className="liquid-copy text-xl font-medium leading-relaxed italic text-white/90">
          {"\""}{PROMPT}{"\""}
        </p>
      </GlassSurface>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-between px-2">
          <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Your Introduction</label>
          <span className="text-xs font-medium text-slate-500">{introduction.length} characters</span>
        </div>
        <textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          placeholder="Type or use the microphone to record your introduction..."
          className="liquid-editor h-64 w-full rounded-[2rem] p-8 text-lg placeholder:text-white/20 transition-all duration-500 ease-out focus:shadow-2xl focus:shadow-blue-500/5"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="w-full rounded-2xl bg-rose-500/10 border border-rose-500/20 px-6 py-4 text-center text-rose-200 animate-shake">
          {error}
        </div>
      )}

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="p-6"
      >
        <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="liquid-muted text-sm max-w-xs italic text-slate-400">
            Keep it concise, focusing on your unique strengths and career aspirations.
          </p>

          <div className="flex items-center justify-center gap-4">
            {SpeechRecognitionAPI && (
              <GlassButton
                variant={isListening ? "primary" : "secondary"}
                onClick={handleToggleListening}
                title={isListening ? 'Stop recording' : 'Start recording'}
                className={`rounded-full p-4 transition-all duration-300 ${isListening
                    ? '!bg-rose-500 text-white shadow-xl shadow-rose-500/30 animate-pulse active:scale-95'
                    : 'bg-white/5 hover:bg-white/10 active:scale-95'
                  }`}
              >
                <MicrophoneIcon className="h-6 w-6" />
              </GlassButton>
            )}

            <GlassButton
              onClick={handleSubmit}
              disabled={isLoading || !introduction.trim()}
              className="rounded-full px-10 py-4 font-bold text-lg shadow-2xl shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? <Spinner /> : 'Submit for Analysis'}
            </GlassButton>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
