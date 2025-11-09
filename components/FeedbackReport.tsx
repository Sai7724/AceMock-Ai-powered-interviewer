import React from 'react';
import { InterviewResults, Feedback, AptitudeFeedback, TechnicalQAFeedback, HRFeedback } from '../types';
import Card from './common/Card';
import StarRating from './common/StarRating';
import { CheckIcon, XMarkIcon, LightBulbIcon } from '../constants';

interface FeedbackReportProps {
  results: InterviewResults;
  onReset: () => void;
}

const TechnicalQADetails = ({ feedback }: { feedback: TechnicalQAFeedback }) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-lg font-semibold text-slate-200">Detailed Breakdown:</h4>
      {feedback.detailedResults.map((result, index) => (
        <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-slate-300">Question {index + 1}</p>
            <StarRating score={result.score} />
          </div>
          <p className="text-slate-400 italic mb-2">"{result.question}"</p>
          <p className="text-slate-300 mb-3 border-l-4 border-slate-600 pl-4 py-1">Your answer: "{result.answer || 'No answer provided.'}"</p>
          <p className="text-slate-300"><span className="font-semibold text-cyan-400">Feedback:</span> {result.evaluation}</p>
        </div>
      ))}
    </div>
  )
}

const HRRoundDetails = ({ feedback }: { feedback: HRFeedback }) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-lg font-semibold text-slate-200">Detailed Breakdown:</h4>
      {feedback.detailedResults.map((result, index) => (
        <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-slate-300">Question {index + 1}</p>
            <StarRating score={result.score} />
          </div>
          <p className="text-slate-400 italic mb-2">"{result.question}"</p>
          <p className="text-slate-300 mb-3 border-l-4 border-slate-600 pl-4 py-1">Your response: "{result.response || 'No response provided.'}"</p>
          <p className="text-slate-300"><span className="font-semibold text-cyan-400">Feedback:</span> {result.evaluation}</p>
        </div>
      ))}
    </div>
  )
}

const FeedbackSection = ({ title, feedback }: { title: string; feedback?: Feedback }) => {
  if (!feedback) return null;

  return (
    <Card className="mb-6 animate-fade-in-up">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-cyan-400">{title}</h3>
        <StarRating score={feedback.score} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="flex items-center text-lg font-semibold text-green-400 mb-2">
            <CheckIcon className="w-5 h-5 mr-2" /> Strengths
          </h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center text-lg font-semibold text-red-400 mb-2">
            <XMarkIcon className="w-5 h-5 mr-2" /> Weaknesses
          </h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            {feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="flex items-center text-lg font-semibold text-amber-400 mb-2">
          <LightBulbIcon className="w-5 h-5 mr-2" /> Suggestions for Improvement
        </h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          {feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      { 'detailedResults' in feedback && 'questionCount' in feedback && (
        <TechnicalQADetails feedback={feedback as TechnicalQAFeedback} />
      )}
      { 'detailedResults' in feedback && 'communication' in feedback && (
        <HRRoundDetails feedback={feedback as HRFeedback} />
      )}
    </Card>
  );
};

const AptitudeFeedbackSection = ({ feedback }: { feedback?: AptitudeFeedback }) => {
  if (!feedback) return null;

  return (
     <Card className="mb-6 animate-fade-in-up delay-100">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-2xl font-bold text-cyan-400">Aptitude Test Analysis</h3>
            <p className="text-slate-400">{feedback.correctCount} / {feedback.totalQuestions} Correct</p>
        </div>
        <StarRating score={feedback.score} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="flex items-center text-lg font-semibold text-green-400 mb-2"><CheckIcon className="w-5 h-5 mr-2" /> Strengths</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h4 className="flex items-center text-lg font-semibold text-red-400 mb-2"><XMarkIcon className="w-5 h-5 mr-2" /> Weaknesses</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>
       <div className="mt-6">
        <h4 className="flex items-center text-lg font-semibold text-amber-400 mb-2"><LightBulbIcon className="w-5 h-5 mr-2" /> Suggestions</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </div>
    </Card>
  )
}

const HRRoundFeedbackSection = ({ feedback }: { feedback?: HRFeedback }) => {
  if (!feedback) return null;

  return (
    <Card className="mb-6 animate-fade-in-up delay-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-cyan-400">HR Round Analysis</h3>
          <p className="text-slate-400">Soft Skills & Cultural Fit Assessment</p>
        </div>
        <StarRating score={feedback.score} />
      </div>

      {/* Skill Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-400">Communication</p>
          <StarRating score={feedback.communication} />
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-400">Problem Solving</p>
          <StarRating score={feedback.problemSolving} />
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-400">Cultural Fit</p>
          <StarRating score={feedback.culturalFit} />
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-400">Leadership</p>
          <StarRating score={feedback.leadership} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="flex items-center text-lg font-semibold text-green-400 mb-2"><CheckIcon className="w-5 h-5 mr-2" /> Strengths</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h4 className="flex items-center text-lg font-semibold text-red-400 mb-2"><XMarkIcon className="w-5 h-5 mr-2" /> Weaknesses</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>
       <div className="mt-6">
        <h4 className="flex items-center text-lg font-semibold text-amber-400 mb-2"><LightBulbIcon className="w-5 h-5 mr-2" /> Suggestions</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">{feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </div>
    </Card>
  )
}


export default function FeedbackReport({ results, onReset }: FeedbackReportProps) {
  const scores = [
    results.selfIntroduction?.score,
    results.aptitude?.score,
    results.technicalQA?.score,
    results.coding?.score,
    results.hrRound?.score
  ].filter((s): s is number => s !== undefined);

  const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Interview Complete!</h2>
        <p className="text-slate-400 mt-2">Here is your detailed performance feedback.</p>
        <div className="mt-4 inline-block">
           <Card className="flex flex-col items-center">
            <span className="text-lg font-semibold text-slate-300">Overall Score</span>
            <StarRating score={overallScore} />
           </Card>
        </div>
      </div>

      <FeedbackSection title="Self-Introduction Analysis" feedback={results.selfIntroduction} />
      <AptitudeFeedbackSection feedback={results.aptitude} />
      <FeedbackSection title="Technical Q&A Analysis" feedback={results.technicalQA} />
      <FeedbackSection title="Coding Challenge Analysis" feedback={results.coding} />
      <HRRoundFeedbackSection feedback={results.hrRound} />

      <div className="text-center mt-10">
        <button
          onClick={onReset}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Try Another Interview
        </button>
      </div>
    </div>
  );
}