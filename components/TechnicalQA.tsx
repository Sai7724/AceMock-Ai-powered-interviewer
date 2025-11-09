import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateTechnicalQuestions, evaluateTechnicalAnswers } from '../services/geminiService';
import { TechnicalQAFeedback, SpeechRecognition } from '../types';
import { MicrophoneIcon } from '../constants';
import Spinner from './common/Spinner';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

interface TechnicalQAProps {
  onComplete: (feedback: TechnicalQAFeedback) => void;
  language: string;
}

export default function TechnicalQA({ onComplete, language }: TechnicalQAProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchQuestions() {
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
    }
    fetchQuestions();

    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, [language]);

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner />
        <p className="mt-4 text-slate-400">Generating your technical questions...</p>
      </div>
    );
  }
  
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner />
        <p className="mt-4 text-slate-400">Evaluating your technical answers...</p>
      </div>
    );
  }
  
  if (error || questions.length === 0) {
    return <p className="text-red-400 text-center min-h-[400px] flex items-center justify-center">{error || "Could not load questions."}</p>;
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Stage 4: Technical Q&A</h2>
       <p className="text-slate-400 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>

      <div className="w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 min-h-[100px] flex items-center">
        <p className="text-slate-200 text-lg font-medium">{questions[currentQuestionIndex]}</p>
      </div>

      <textarea
        ref={textareaRef}
        key={currentQuestionIndex} // Re-mounts the textarea to clear interim speech state
        defaultValue={answers[currentQuestionIndex]}
        onChange={handleAnswerChange}
        placeholder="Type or use the microphone to record your answer..."
        className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
        disabled={isSubmitting}
      />

      {error && <p className="text-red-400 mt-2 text-center">{error}</p>}

      <div className="mt-6 flex w-full items-center justify-center gap-4">
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
              onClick={handleNext}
              disabled={isSubmitting || !answers[currentQuestionIndex]?.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
            </button>
          </>
      </div>
    </div>
  );
}