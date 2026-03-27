import { useState, useEffect, useCallback } from 'react';
import { generateAptitudeQuestions, evaluateAptitudePerformance } from '../services/geminiService';
import { AptitudeFeedback, AptitudeQuestion } from '../types';
import Spinner from './common/Spinner';
import Card from './common/Card';
// import GlassButton from './common/GlassButton';
// import GlassSurface from './common/GlassSurface';
import { ClockIcon, CalculatorIcon } from '../constants';

const NUM_QUESTIONS = 5;
const TIME_PER_QUESTION_S = 90; // 1.5 minutes per question

const Calculator = ({ onClose }: { onClose: () => void }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | number>('');

  useEffect(() => {
    if (expression.trim() === '') {
      setResult('');
      return;
    }
    try {
      // Basic safe evaluation
      const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
      if (sanitizedExpression) {
        const func = new Function('return ' + sanitizedExpression);
        const res = func();
        setResult(res);
      } else {
        setResult('');
      }
    } catch {
      setResult('Error');
    }
  }, [expression]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="liquid-panel w-full max-w-sm p-8 shadow-2xl"
        style={{ borderRadius: '32px' }}
      >
        <h3 className="liquid-heading mb-4 text-lg font-bold">Calculator</h3>
      <textarea
        autoFocus
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="e.g., (100 / 4) * 2"
        className="liquid-editor h-24 w-full rounded-2xl p-3 font-mono text-lg placeholder:text-white/30"
      />
      <div className="liquid-panel-soft mt-3 min-h-[44px] rounded-2xl p-3 text-right text-2xl font-bold text-[color:var(--text-primary)]">
        {result}
      </div>
      <button onClick={onClose} className="liquid-button-secondary mt-4 w-full rounded-full py-3 font-bold">
        Close Calculator
      </button>
      </div>
    </div>
  );
};


export default function AptitudeTest({ onComplete }: { onComplete: (feedback: AptitudeFeedback) => void }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(NUM_QUESTIONS * TIME_PER_QUESTION_S);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const startAssessment = async () => {
    setHasStarted(true);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await generateAptitudeQuestions(NUM_QUESTIONS);
      setQuestions(fetchedQuestions);
      setUserAnswers(Array(fetchedQuestions.length).fill(''));
    } catch (err) {
      setError("Failed to load aptitude questions. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const finishTest = useCallback(async (finalAnswers: string[]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const feedback = await evaluateAptitudePerformance(questions, finalAnswers);
      onComplete(feedback);
    } catch (err) {
      setError("Failed to get feedback from AI. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [questions, onComplete]);

  useEffect(() => {
    if (!hasStarted || isLoading || isSubmitting) return;

    if (timeLeft <= 0) {
      finishTest(userAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, isLoading, isSubmitting, finishTest, userAnswers]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest(userAnswers);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowCalculator(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!hasStarted) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-12 animate-fade-in">
        <div
          className="p-10 text-center liquid-panel w-full"
          style={{ borderRadius: '32px' }}
        >
          <div className="liquid-pill mx-auto mb-6 w-fit px-4 py-2 text-sm font-bold uppercase tracking-widest text-blue-300">
            Phase 3
          </div>
          <h2 className="liquid-heading mb-4 text-4xl font-extrabold">Aptitude Round</h2>
          <p className="liquid-copy mb-8 text-lg text-slate-300">
            This round evaluates your numerical, logical, and verbal reasoning skills. You will have 90 seconds per question.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="liquid-panel-soft rounded-2xl p-4">
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Total Questions</p>
              <p className="text-xl font-bold text-white">{NUM_QUESTIONS}</p>
            </div>
            <div className="liquid-panel-soft rounded-2xl p-4">
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Time Limit</p>
              <p className="text-xl font-bold text-white">7:30 mins</p>
            </div>
          </div>
          <button
            onClick={startAssessment}
            className="liquid-button-primary w-full rounded-full py-4 text-xl font-bold shadow-2xl shadow-blue-500/20"
          >
            Start Assessment
          </button>
          {error && <p className="mt-4 text-rose-300 text-sm">{error}</p>}
        </div>
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Generating your aptitude test...</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Evaluating your answers...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-rose-300">{error}</p>;
  }

  if (questions.length === 0) {
    return <p className="liquid-muted text-center">No questions available.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

      <div
        className="mb-6 p-6 flex flex-wrap items-center justify-between gap-4 liquid-panel"
        style={{ borderRadius: '32px' }}
      >
        <div>
          <p className="liquid-kicker">Stage 3</p>
          <h2 className="liquid-heading mt-3 text-3xl font-extrabold">Aptitude Round</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCalculator(true)} title="Open Calculator" className="liquid-button-secondary rounded-full p-3 transition-colors">
            <CalculatorIcon className="h-5 w-5" />
          </button>
          <div className="liquid-pill flex items-center gap-2 px-4 py-2">
            <ClockIcon className="h-5 w-5 text-[color:var(--accent-blue-strong)]" />
            <span className="font-mono text-xl font-bold tabular-nums text-[color:var(--text-primary)]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="mb-6 p-6 liquid-panel"
        style={{ borderRadius: '32px' }}
      >
        <p className="liquid-copy mb-3 text-sm uppercase tracking-[0.16em]">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <p className="liquid-heading text-2xl font-bold">{currentQuestion.question}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {currentQuestion.options.map((option, index) => {
          return (
            <Card
              key={index}
              className="group !p-0 overflow-hidden"
            >
              <button
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-5 text-left transition-all duration-200
                  ${userAnswers[currentQuestionIndex] === option
                    ? 'bg-[linear-gradient(135deg,var(--accent-gold-strong),var(--accent-gold))] text-slate-950 font-bold'
                    : 'hover:bg-white/5'
                  }`}
              >
                <span className={userAnswers[currentQuestionIndex] === option ? '' : 'liquid-copy'}>
                  {option}
                </span>
              </button>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleNext}
          disabled={!userAnswers[currentQuestionIndex] || isSubmitting}
          className="liquid-button-primary rounded-full px-8 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
        </button>
      </div>
    </div>
  );
}
