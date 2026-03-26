import { useState, useEffect, useRef } from 'react';
import { generateTechnicalQuestions, evaluateTechnicalAnswers } from '../services/geminiService';
import { TechnicalQAFeedback, SpeechRecognition } from '../types';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';
import Spinner from './common/Spinner';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

interface TechnicalQAProps {
  onComplete: (feedback: TechnicalQAFeedback) => void;
  language: string;
}

export default function TechnicalQA({ onComplete, language }: TechnicalQAProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startRound = async () => {
    setHasStarted(true);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await generateTechnicalQuestions(language);
      setQuestions(fetchedQuestions);
      setAnswers(Array(fetchedQuestions.length).fill(''));
      const utterance = new SpeechSynthesisUtterance(`First question: ${fetchedQuestions[0]}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError("Failed to load technical questions. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

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
          <div className="liquid-pill mx-auto mb-6 w-fit px-4 py-2 text-sm font-bold uppercase tracking-widest text-blue-300">
            Stage 4
          </div>
          <h2 className="liquid-heading mb-4 text-4xl font-extrabold">Technical Q&A</h2>
          <p className="liquid-copy mb-8 text-lg text-slate-300">
            This round tests your technical depth and problem-solving skills in <span className="font-bold text-blue-400">{language}</span>. You will be asked 5 questions.
          </p>
          <GlassButton
            onClick={startRound}
            className="w-full rounded-full py-4 text-xl font-bold shadow-2xl shadow-blue-500/20"
          >
            Start Technical Round
          </GlassButton>
          {error && <p className="mt-4 text-rose-300 text-sm">{error}</p>}
        </GlassSurface>
      </div>
    );
  }

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = answers[currentQuestionIndex] || '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = finalTranscript;
      setAnswers(newAnswers);
      if (textareaRef.current) {
        textareaRef.current.value = finalTranscript + interimTranscript;
      }
    };
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (textareaRef.current) {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = textareaRef.current.value.trim();
        setAnswers(newAnswers);
      }
    };
    recognition.start();
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const utterance = new SpeechSynthesisUtterance(`Next question: ${questions[nextIndex]}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const feedback = await evaluateTechnicalAnswers(questions, answers, language);
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
      <div className="flex h-96 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Generating your technical questions...</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Evaluating your technical answers...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return <p className="flex h-96 items-center justify-center text-center text-rose-300">{error || "Could not load questions."}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center animate-fade-in font-sans">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="mb-6 text-center p-6"
      >
        <p className="liquid-kicker">Stage 4</p>
        <h2 className="liquid-heading mt-3 text-3xl font-extrabold">Technical Q&A</h2>
        <p className="liquid-muted mt-3 font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </GlassSurface>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={20}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="mb-6 p-8 min-h-[140px] flex items-center"
      >
        <p className="liquid-heading text-xl font-semibold sm:text-2xl leading-relaxed">
          {questions[currentQuestionIndex]}
        </p>
      </GlassSurface>

      <textarea
        ref={textareaRef}
        key={currentQuestionIndex}
        defaultValue={answers[currentQuestionIndex]}
        onChange={handleAnswerChange}
        placeholder="Type or use the microphone to record your answer..."
        className="liquid-editor h-64 w-full rounded-[1.75rem] p-6 text-lg placeholder:text-white/20 transition-all duration-300"
        disabled={isSubmitting}
      />

      {error && (
        <div className="mt-6 w-full rounded-2xl bg-rose-500/10 border border-rose-500/20 px-6 py-4 text-center text-rose-200">
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
        className="mt-8 p-6"
      >
        <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="liquid-muted text-sm max-w-md italic">
            Tip: Prioritize depth, accuracy, and real-world examples in your response.
          </p>
          <div className="flex items-center justify-center gap-4">
            {SpeechRecognitionAPI && (
              <button
                type="button"
                onClick={handleToggleListening}
                title={isListening ? 'Stop recording' : 'Start recording'}
                className={`rounded-full p-4 transition-all duration-300 ${isListening ? 'bg-rose-500/90 text-white shadow-xl shadow-rose-500/30 animate-pulse active:scale-95' : 'liquid-button-secondary bg-white/5 active:scale-95'}`}
              >
                <div className="h-6 w-6">🎤</div>
              </button>
            )}
            <GlassButton
              onClick={handleNext}
              disabled={isSubmitting || !answers[currentQuestionIndex]?.trim()}
              className="rounded-full px-10 py-3.5 font-bold text-lg disabled:cursor-not-allowed disabled:opacity-30 transition-all shadow-xl shadow-blue-500/10"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Round'}
            </GlassButton>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
