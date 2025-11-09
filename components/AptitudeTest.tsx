import React, { useState, useEffect, useCallback } from 'react';
import { generateAptitudeQuestions, evaluateAptitudePerformance } from '../services/geminiService';
import { AptitudeFeedback, AptitudeQuestion } from '../types';
import Spinner from './common/Spinner';
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
    } catch (error) {
      setResult('Error');
    }
  }, [expression]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg shadow-2xl w-full max-w-sm border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Calculator</h3>
        <textarea
          autoFocus
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g., (100 / 4) * 2"
          className="w-full h-24 p-2 bg-slate-900 border border-slate-600 rounded-lg font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
        <div className="mt-2 p-2 bg-slate-900 rounded-md text-right text-2xl font-bold text-slate-100 min-h-[44px]">
          {result}
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
};


export default function AptitudeTest({ onComplete }: { onComplete: (feedback: AptitudeFeedback) => void }) {
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(NUM_QUESTIONS * TIME_PER_QUESTION_S);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

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
    async function fetchQuestions() {
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
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (isLoading || isSubmitting) return;

    if (timeLeft <= 0) {
      finishTest(userAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isSubmitting, finishTest, userAnswers]);

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


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner />
        <p className="mt-4 text-slate-400">Generating your aptitude test...</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner />
        <p className="mt-4 text-slate-400">Evaluating your answers...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center">{error}</p>;
  }

  if (questions.length === 0) {
    return <p className="text-slate-400 text-center">No questions available.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="animate-fade-in">
       {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-cyan-400">Stage 3: Aptitude Test</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCalculator(true)} title="Open Calculator" className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
            <CalculatorIcon className="w-6 h-6 text-slate-200" />
          </button>
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
            <ClockIcon className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-mono font-bold text-slate-100 tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6">
        <p className="text-lg text-slate-300 mb-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <p className="text-xl text-slate-100">{currentQuestion.question}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-4 rounded-lg text-left border-2 transition-all duration-200
              ${userAnswers[currentQuestionIndex] === option
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleNext}
          disabled={!userAnswers[currentQuestionIndex] || isSubmitting}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
        </button>
      </div>
    </div>
  );
}
