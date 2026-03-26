import { useEffect, useState } from 'react';
import { generateHRQuestions, evaluateHRResponse } from '../services/geminiService';
import { HRFeedback, HRQuestion } from '../types';
import Spinner from './common/Spinner';
import Card from './common/Card';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';

interface HRRoundProps {
  onComplete: (feedback: HRFeedback) => void;
}

const HRRound = ({ onComplete }: HRRoundProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<HRQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const startRound = () => {
    setHasStarted(true);
    initializeSpeechRecognition();
    void loadQuestions();
  };

  useEffect(() => {
    // Just initialize speech if hasn't started yet, or wait?
    // Actually, we only need it once started.
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      void handleNextQuestion();
    }
  }, [timeLeft, isTimeUp]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const nextRecognition = new SpeechRecognition();
      nextRecognition.continuous = true;
      nextRecognition.interimResults = true;
      nextRecognition.lang = 'en-US';

      nextRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentResponse((prev) => `${prev} ${finalTranscript}`.trim());
        }
      };

      nextRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(nextRecognition);
    }
  };

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hrQuestions = await generateHRQuestions();
      setQuestions(hrQuestions);
    } catch (error) {
      console.error('Error loading HR questions:', error);
      setError("Failed to load HR questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Speech recognition already started');
      }
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleNextQuestion = async () => {
    const submittedResponses = currentResponse.trim() ? [...responses, currentResponse.trim()] : responses;

    if (currentResponse.trim()) {
      setResponses(submittedResponses);
      setCurrentResponse('');
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(120);
      setIsTimeUp(false);
      return;
    }

    await evaluateResponses(submittedResponses);
  };

  const evaluateResponses = async (submittedResponses: string[] = responses) => {
    setIsEvaluating(true);
    setError(null);
    try {
      const feedback = await evaluateHRResponse(questions, submittedResponses);
      onComplete(feedback);
    } catch (error) {
      console.error('Error evaluating HR responses:', error);
      setError("Failed to get feedback from AI. Please try again.");
      // ... rest of the fallback logic if I want to keep it, 
      // but for now I'll just show the error.
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Preparing HR questions...</p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Evaluating your responses...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions.length || 1)) * 100;

  if (!hasStarted) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-12 animate-fade-in">
        <GlassSurface
           width="100%"
           height="auto"
           borderRadius={32}
           blur={16}
           opacity={0.8}
           backgroundOpacity={0.06}
           className="p-10 text-center"
        >
          <div className="liquid-pill mx-auto mb-6 w-fit px-4 py-2 text-sm font-bold uppercase tracking-widest text-indigo-300">
            Stage 5
          </div>
          <h2 className="liquid-heading mb-4 text-4xl font-extrabold">HR Round</h2>
          <p className="liquid-copy mb-8 text-lg text-slate-300">
            The Final Stage. This round assesses your communication, self-awareness, and cultural fit. Be prepared for behavioral and situational questions.
          </p>
          <GlassButton
            onClick={startRound}
            className="w-full rounded-full py-4 text-xl font-bold bg-[linear-gradient(135deg,var(--accent-blue-strong),var(--accent-blue))] shadow-2xl shadow-blue-500/20"
          >
            Start HR Interview
          </GlassButton>
          {error && <p className="mt-4 text-rose-300 text-sm">{error}</p>}
        </GlassSurface>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in px-4">
      <div className="text-center">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="text-center p-8 mb-6"
        >
          <p className="liquid-kicker">Stage 5</p>
          <h1 className="liquid-heading mt-3 text-4xl font-extrabold tracking-tight">HR Round</h1>
        </GlassSurface>
        
        <p className="liquid-copy mt-6 max-w-2xl mx-auto">
          Assess communication, judgment, self-awareness, and culture fit under a timed response format.
        </p>

        <div className="mt-10">
          <div className="liquid-progress-track h-3 w-full">
            <div className="liquid-progress-bar transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="liquid-copy font-semibold text-lg">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <GlassSurface
              width="auto"
              height="auto"
              borderRadius={20}
              blur={10}
              opacity={0.5}
              backgroundOpacity={0.1}
              className={`px-4 py-1.5 font-mono font-bold ${timeLeft <= 30 ? 'text-rose-400' : 'text-blue-400'}`}
            >
              Time Left: {formatTime(timeLeft)}
            </GlassSurface>
          </div>
        </div>
      </div>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={20}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="p-8 sm:p-10"
      >
        <div className="space-y-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white shadow-lg">
                Q
              </div>
              <div className="pt-1">
                <h3 className="liquid-heading text-xl font-semibold leading-relaxed">{currentQuestion?.question}</h3>
                <div className="mt-4 flex gap-2">
                  <span className="liquid-chip liquid-chip-accent uppercase tracking-wider text-[10px]">{currentQuestion?.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="liquid-heading text-lg font-semibold">Your Response</h4>
              <GlassButton
                variant={isRecording ? "primary" : "secondary"}
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording
                  ? '!bg-rose-500/90 rounded-full px-6 py-2.5 font-bold text-white shadow-xl shadow-rose-500/20 active:scale-95 transition-all'
                  : 'rounded-full px-6 py-2.5 font-bold transition-all'}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </GlassButton>
            </div>

            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here or use voice recording..."
              className="liquid-editor h-48 w-full resize-none rounded-[1.75rem] p-6 text-lg placeholder:text-white/20"
            />

            {isRecording && (
              <div className="flex items-center gap-3 px-2 text-rose-400">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"></div>
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Listening...</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={() => setCurrentResponse('')}
              className="px-8 py-3 text-sm font-bold text-white/50 hover:text-white transition-colors"
            >
              Clear Response
            </button>

            <GlassButton
              onClick={() => void handleNextQuestion()}
              disabled={!currentResponse.trim() && !isTimeUp}
              className="rounded-full px-10 py-3.5 font-bold text-lg disabled:cursor-not-allowed disabled:opacity-30 transition-all shadow-2xl shadow-blue-500/10"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Review & Finish'}
            </GlassButton>
          </div>
        </div>
      </GlassSurface>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={10}
        opacity={0.6}
        backgroundOpacity={0.04}
        className="p-8"
      >
        <h4 className="liquid-heading mb-4 text-xl font-bold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400"></span>
          HR Round Tips
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm liquid-copy">
          <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-blue-400 font-bold">1</span>
            Use the STAR method for behavioral questions.
          </li>
          <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-blue-400 font-bold">2</span>
            Be specific and give concrete examples.
          </li>
          <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-blue-400 font-bold">3</span>
            Show interest in role and company context.
          </li>
          <li className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-blue-400 font-bold">4</span>
            Explain how you think, not just outcomes.
          </li>
        </ul>
      </GlassSurface>
    </div>
  );
};

export default HRRound;
