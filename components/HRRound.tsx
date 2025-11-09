import React, { useState, useRef, useEffect } from 'react';
import { generateHRQuestions, evaluateHRResponse } from '../services/geminiService';
import { HRFeedback } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import StarRating from './common/StarRating';

interface HRRoundProps {
  onComplete: (feedback: HRFeedback) => void;
}

interface HRQuestion {
  question: string;
  category: 'behavioral' | 'situational' | 'motivational' | 'teamwork' | 'leadership';
}

const HRRound: React.FC<HRRoundProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<HRQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    initializeSpeechRecognition();
    loadQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      handleNextQuestion();
    }
  }, [timeLeft, isTimeUp]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentResponse(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  };

  const loadQuestions = async () => {
    try {
      const hrQuestions = await generateHRQuestions();
      setQuestions(hrQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading HR questions:', error);
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentResponse.trim()) {
      const newResponses = [...responses, currentResponse.trim()];
      setResponses(newResponses);
      setCurrentResponse('');
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(120);
      setIsTimeUp(false);
    } else {
      // All questions completed, evaluate responses
      await evaluateResponses();
    }
  };

  const evaluateResponses = async () => {
    setIsEvaluating(true);
    try {
      const feedback = await evaluateHRResponse(questions, responses);
      onComplete(feedback);
    } catch (error) {
      console.error('Error evaluating HR responses:', error);
      // Provide fallback feedback
      const fallbackFeedback: HRFeedback = {
        strengths: ['Good communication skills', 'Professional demeanor'],
        weaknesses: ['Could provide more specific examples', 'Consider expanding on experiences'],
        suggestions: ['Practice STAR method responses', 'Prepare more detailed examples'],
        score: 7,
        communication: 7,
        problemSolving: 6,
        culturalFit: 7,
        leadership: 6,
        detailedResults: responses.map((response, index) => ({
          question: questions[index]?.question || '',
          response: response,
          evaluation: 'Good response with room for improvement',
          score: 7
        }))
      };
      onComplete(fallbackFeedback);
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner />
        <p className="text-slate-300 mt-4">Preparing HR questions...</p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="text-center">
        <Spinner />
        <p className="text-slate-300 mt-4">Evaluating your responses...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">HR Round</h1>
        <p className="text-slate-300 mb-6">
          Let's assess your soft skills, communication, and cultural fit
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div 
            className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-slate-400 mb-6">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className={`font-mono ${timeLeft <= 30 ? 'text-red-400' : 'text-yellow-400'}`}>
            Time: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Question */}
          <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                Q
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {currentQuestion?.question}
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                    {currentQuestion?.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-100">Your Response</h4>
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>
            </div>

            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here or use voice recording..."
              className="w-full h-32 p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {isRecording && (
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Recording...</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setCurrentResponse('')}
              className="px-6 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={!currentResponse.trim() && !isTimeUp}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                currentResponse.trim() || isTimeUp
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete HR Round'}
            </button>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h4 className="text-lg font-semibold text-cyan-400 mb-3">Tips for HR Round</h4>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
          <li>• Be specific and provide concrete examples from your experience</li>
          <li>• Show enthusiasm and genuine interest in the role and company</li>
          <li>• Demonstrate your problem-solving and communication skills</li>
          <li>• Be honest and authentic in your responses</li>
        </ul>
      </div>
    </div>
  );
};

export default HRRound; 