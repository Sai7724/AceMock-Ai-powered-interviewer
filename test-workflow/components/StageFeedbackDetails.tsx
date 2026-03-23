import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import type { AptitudeFeedback, CodingFeedback, HRFeedback, TechnicalQAFeedback } from '../../types';
import { getStageDefinition, type TestStageId, type TestWorkflowResults } from '../services/stageConfig';

type StageFeedback =
  | NonNullable<TestWorkflowResults['selfIntroduction']>
  | NonNullable<TestWorkflowResults['aptitudeRound']>
  | NonNullable<TestWorkflowResults['technicalRound']>
  | NonNullable<TestWorkflowResults['codingRound']>
  | NonNullable<TestWorkflowResults['hrRound']>;

interface StageFeedbackDetailsProps {
  stageId: TestStageId;
  feedback: StageFeedback;
}

const panelClass = 'liquid-panel-soft rounded-[1.5rem] p-4';

export default function StageFeedbackDetails({ stageId, feedback }: StageFeedbackDetailsProps) {
  const stage = getStageDefinition(stageId);

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="liquid-kicker">Stage Feedback</p>
          <h2 className="liquid-heading mt-3 text-3xl font-bold">{stage.label}</h2>
          <p className="liquid-copy mt-3">{stage.description}</p>
        </div>
        <StarRating score={feedback.score} />
      </div>

      {stageId === 'aptitudeRound' && (
        <div className="liquid-panel-soft mt-6 p-4 liquid-copy">
          Accuracy: <span className="liquid-accent font-semibold">{(feedback as AptitudeFeedback).correctCount}</span> / {(feedback as AptitudeFeedback).totalQuestions}
        </div>
      )}

      {stageId === 'hrRound' && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Communication', (feedback as HRFeedback).communication],
            ['Problem Solving', (feedback as HRFeedback).problemSolving],
            ['Cultural Fit', (feedback as HRFeedback).culturalFit],
            ['Leadership', (feedback as HRFeedback).leadership],
          ].map(([label, score]) => (
            <div key={label} className="liquid-panel-soft p-4 text-center">
              <p className="liquid-muted text-sm">{label}</p>
              <p className="liquid-accent mt-2 text-2xl font-bold">{score}/10</p>
            </div>
          ))}
        </div>
      )}

      {stageId === 'codingRound' && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ['Logic', (feedback as CodingFeedback).logic],
            ['Syntax', (feedback as CodingFeedback).syntax],
            ['Efficiency', (feedback as CodingFeedback).efficiency],
          ].map(([label, value]) => (
            <div key={label} className={panelClass}>
              <h3 className="liquid-accent font-semibold">{label}</h3>
              <p className="liquid-copy mt-2 text-sm leading-6">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--success)]">Strengths</h3>
          <ul className="liquid-copy mt-3 list-disc space-y-2 pl-5">
            {feedback.strengths.map((item, index) => (
              <li key={`${stageId}-strength-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--danger)]">Weaknesses</h3>
          <ul className="liquid-copy mt-3 list-disc space-y-2 pl-5">
            {feedback.weaknesses.map((item, index) => (
              <li key={`${stageId}-weakness-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[color:var(--warning)]">Improvement Suggestions</h3>
        <ul className="liquid-copy mt-3 list-disc space-y-2 pl-5">
          {feedback.suggestions.map((item, index) => (
            <li key={`${stageId}-suggestion-${index}`}>{item}</li>
          ))}
        </ul>
      </div>

      {(stageId === 'technicalRound' || stageId === 'hrRound') && (
        <div className="mt-8 space-y-4">
          <h3 className="liquid-heading text-lg font-semibold">Detailed Breakdown</h3>
          {(feedback as TechnicalQAFeedback | HRFeedback).detailedResults.map((result, index) => (
            <div key={`${stageId}-detail-${index}`} className={panelClass}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="liquid-heading font-semibold">Question {index + 1}</p>
                  <p className="liquid-muted mt-2">{result.question}</p>
                </div>
                <span className="liquid-chip liquid-chip-accent">{result.score}/10</span>
              </div>
              <div className="liquid-editor mt-4 rounded-2xl p-4">
                <p className="liquid-muted text-sm font-semibold">
                  {stageId === 'technicalRound' ? 'Submitted Answer' : 'Submitted Response'}
                </p>
                <p className="liquid-copy mt-2 whitespace-pre-wrap">
                  {'answer' in result ? result.answer || 'No answer provided.' : result.response || 'No response provided.'}
                </p>
              </div>
              <p className="liquid-copy mt-4 text-sm leading-6">
                <span className="liquid-accent font-semibold">Feedback:</span> {result.evaluation}
              </p>
            </div>
          ))}
        </div>
      )}

      {stageId === 'aptitudeRound' && (
        <div className="mt-8 space-y-4">
          <h3 className="liquid-heading text-lg font-semibold">Question Review</h3>
          {(feedback as AptitudeFeedback).detailedResults.map((result, index) => (
            <div key={`${stageId}-detail-${index}`} className={panelClass}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="liquid-heading font-semibold">Question {index + 1}</p>
                  <p className="liquid-muted mt-2">{result.question}</p>
                </div>
                <span className={result.isCorrect ? 'liquid-chip liquid-chip-success' : 'liquid-chip liquid-chip-danger'}>
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="liquid-editor rounded-2xl p-4">
                  <p className="liquid-muted text-sm font-semibold">Your Answer</p>
                  <p className="liquid-copy mt-2">{result.userAnswer}</p>
                </div>
                <div className="liquid-editor rounded-2xl p-4">
                  <p className="liquid-muted text-sm font-semibold">Correct Answer</p>
                  <p className="liquid-copy mt-2">{result.correctAnswer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
