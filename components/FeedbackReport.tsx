import { InterviewResults, Feedback, AptitudeFeedback, TechnicalQAFeedback, HRFeedback, CodingFeedback } from '../types';
import Spinner from './common/Spinner';
import Card from './common/Card';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';
import StarRating from './common/StarRating';
import { CheckIcon, XMarkIcon, LightBulbIcon } from '../constants';

interface FeedbackReportProps {
  results: InterviewResults;
  onReset: () => void;
}

const detailCardClass = 'liquid-panel-soft rounded-[1.5rem] p-4';

const TechnicalQADetails = ({ feedback }: { feedback: TechnicalQAFeedback }) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="liquid-heading text-lg font-semibold">Detailed Breakdown</h4>
      {feedback.detailedResults.map((result, index) => (
        <div key={index} className={detailCardClass}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="liquid-copy font-semibold">Question {index + 1}</p>
            <StarRating score={result.score} />
          </div>
          <p className="liquid-muted mb-2 italic">"{result.question}"</p>
          <p className="mb-3 border-l-2 border-white/10 pl-4 py-1 liquid-copy">Your answer: "{result.answer || 'No answer provided.'}"</p>
          <p className="liquid-copy"><span className="liquid-accent font-semibold">Feedback:</span> {result.evaluation}</p>
        </div>
      ))}
    </div>
  );
};

const HRRoundDetails = ({ feedback }: { feedback: HRFeedback }) => {
  return (
    <div className="mt-6 space-y-4">
      <h4 className="liquid-heading text-lg font-semibold">Detailed Breakdown</h4>
      {feedback.detailedResults.map((result, index) => (
        <div key={index} className={detailCardClass}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="liquid-copy font-semibold">Question {index + 1}</p>
            <StarRating score={result.score} />
          </div>
          <p className="liquid-muted mb-2 italic">"{result.question}"</p>
          <p className="mb-3 border-l-2 border-white/10 pl-4 py-1 liquid-copy">Your response: "{result.response || 'No response provided.'}"</p>
          <p className="liquid-copy"><span className="liquid-accent font-semibold">Feedback:</span> {result.evaluation}</p>
        </div>
      ))}
    </div>
  );
};

const FeedbackSection = ({ title, feedback }: { title: string; feedback?: Feedback }) => {
  if (!feedback) return null;

  return (
    <Card className="mb-6 animate-fade-in-up">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <h3 className="liquid-heading text-2xl font-bold">{title}</h3>
        <StarRating score={feedback.score} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--success)]">
            <CheckIcon className="mr-2 h-5 w-5" /> Strengths
          </h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">
            {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--danger)]">
            <XMarkIcon className="mr-2 h-5 w-5" /> Weaknesses
          </h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">
            {feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--warning)]">
          <LightBulbIcon className="mr-2 h-5 w-5" /> Suggestions for Improvement
        </h4>
        <ul className="list-disc list-inside space-y-1 liquid-copy">
          {feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {'detailedResults' in feedback && 'questionCount' in feedback && (
        <TechnicalQADetails feedback={feedback as TechnicalQAFeedback} />
      )}
      {'detailedResults' in feedback && 'communication' in feedback && (
        <HRRoundDetails feedback={feedback as HRFeedback} />
      )}
    </Card>
  );
};

const AptitudeFeedbackSection = ({ feedback }: { feedback?: AptitudeFeedback }) => {
  if (!feedback) return null;

  return (
    <Card className="mb-6 animate-fade-in-up delay-100">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="liquid-heading text-2xl font-bold">Aptitude Test Analysis</h3>
          <p className="liquid-muted mt-2">{feedback.correctCount} / {feedback.totalQuestions} correct</p>
        </div>
        <StarRating score={feedback.score} />
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--success)]"><CheckIcon className="mr-2 h-5 w-5" /> Strengths</h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--danger)]"><XMarkIcon className="mr-2 h-5 w-5" /> Weaknesses</h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--warning)]"><LightBulbIcon className="mr-2 h-5 w-5" /> Suggestions</h4>
        <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </div>
    </Card>
  );
};

const HRRoundFeedbackSection = ({ feedback }: { feedback?: HRFeedback }) => {
  if (!feedback) return null;

  return (
    <Card className="mb-6 animate-fade-in-up delay-200">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="liquid-heading text-2xl font-bold">HR Round Analysis</h3>
          <p className="liquid-muted mt-2">Soft skills and cultural fit assessment</p>
        </div>
        <StarRating score={feedback.score} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="liquid-panel-soft rounded-[1.75rem] p-4 shadow-xl text-center">
          <p className="liquid-muted text-sm">Communication</p>
          <div className="flex justify-center mt-1">
            <StarRating score={feedback.communication} />
          </div>
        </div>
        <div className="liquid-panel-soft rounded-[1.75rem] p-4 shadow-xl text-center">
          <p className="liquid-muted text-sm">Problem Solving</p>
          <div className="flex justify-center mt-1">
            <StarRating score={feedback.problemSolving} />
          </div>
        </div>
        <div className="liquid-panel-soft rounded-[1.75rem] p-4 shadow-xl text-center">
          <p className="liquid-muted text-sm">Cultural Fit</p>
          <div className="flex justify-center mt-1">
            <StarRating score={feedback.culturalFit} />
          </div>
        </div>
        <div className="liquid-panel-soft rounded-[1.75rem] p-4 shadow-xl text-center">
          <p className="liquid-muted text-sm">Leadership</p>
          <div className="flex justify-center mt-1">
            <StarRating score={feedback.leadership} />
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--success)]"><CheckIcon className="mr-2 h-5 w-5" /> Strengths</h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--danger)]"><XMarkIcon className="mr-2 h-5 w-5" /> Weaknesses</h4>
          <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="mb-2 flex items-center text-lg font-semibold text-[color:var(--warning)]"><LightBulbIcon className="mr-2 h-5 w-5" /> Suggestions</h4>
        <ul className="list-disc list-inside space-y-1 liquid-copy">{feedback.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </div>
    </Card>
  );
};

export default function FeedbackReport({ results, onReset }: FeedbackReportProps) {
  const scores = [
    results.selfIntroduction?.score,
    results.aptitude?.score,
    results.technicalQA?.score,
    results.coding?.score,
    results.hrRound?.score,
  ].filter((s): s is number => s !== undefined);

  const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const overallScoreRounded = Math.round(overallScore); 
  const statusTag = overallScore >= 4 ? 'Excellent' : overallScore >= 3 ? 'Good' : 'Needs Improvement';

  return (
    <div className="animate-fade-in px-4 py-8">
      <div className="mb-10 text-center">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-8 sm:p-12 mb-10 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-cyan-500/15 transition-all duration-700"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
              <div className="relative h-40 w-40 sm:h-48 sm:w-48 flex items-center justify-center rounded-full border-4 border-cyan-400/30 bg-slate-900/50 backdrop-blur-xl">
                <div className="text-center">
                  <span className="block text-5xl sm:text-6xl font-black text-white">{overallScoreRounded}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">Overall Score</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">{statusTag}</span>
                <span className="px-4 py-1.5 rounded-full bg-slate-500/10 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest leading-none pt-[7px]">Completed {new Date().toLocaleDateString()}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mastered.</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                Excellent performance! You've demonstrated strong technical proficiency and communication skills across all stages of the assessment.
              </p>
            </div>
          </div>
        </GlassSurface>
      </div>

      <FeedbackSection title="Self-Introduction Analysis" feedback={results.selfIntroduction} />
      <AptitudeFeedbackSection feedback={results.aptitude} />
      <FeedbackSection title="Technical Q&A Analysis" feedback={results.technicalQA} />
      <FeedbackSection title="Coding Challenge Analysis" feedback={results.coding} />
      <HRRoundFeedbackSection feedback={results.hrRound} />

      <div className="mt-12 text-center">
        <GlassButton
          onClick={onReset}
          className="rounded-full px-10 py-4 font-bold text-lg"
        >
          Try Another Interview
        </GlassButton>
      </div>
    </div>
  );
}
