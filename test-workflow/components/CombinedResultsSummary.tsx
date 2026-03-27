import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import StageFeedbackDetails from './StageFeedbackDetails';
import GlassButton from '../../components/common/GlassButton';
import {
  TEST_STAGE_DEFINITIONS,
  type TestStageId,
  type TestWorkflowResults,
} from '../services/stageConfig';

interface CombinedResultsSummaryProps {
  results: TestWorkflowResults;
  onBack: () => void;
  onClear: () => void;
}

export default function CombinedResultsSummary({
  results,
  onBack,
  onClear,
}: CombinedResultsSummaryProps) {
  const completedStages = TEST_STAGE_DEFINITIONS.filter((stage) => results[stage.id]);
  const scores = completedStages
    .map((stage) => results[stage.id]?.score)
    .filter((score): score is number => score !== undefined);
  const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="liquid-kicker text-[color:var(--accent-gold-strong)]">Combined Results</p>
          <h1 className="liquid-heading mt-3 text-4xl font-extrabold">Stage Results Summary</h1>
          <p className="liquid-copy mt-4 max-w-3xl text-lg">
            This summary combines every stage you have tested in the isolated workflow so you can validate the feedback system before running the full interview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GlassButton
            variant="secondary"
            onClick={onBack}
            className="rounded-full px-5 py-3 text-sm font-semibold"
          >
            Back to Stages
          </GlassButton>
          <GlassButton
            variant="danger"
            onClick={onClear}
            className="px-5 py-3 text-sm"
          >
            Clear Temporary Results
          </GlassButton>
        </div>
      </div>

      {completedStages.length === 0 ? (
        <Card>
          <p className="liquid-copy">No stage results have been captured yet. Run one or more stage tests first.</p>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="liquid-kicker text-[color:var(--accent-gold-strong)]">Overall</p>
              <h2 className="liquid-heading mt-3 text-3xl font-bold">Testing Workflow Aggregate</h2>
              <p className="liquid-muted mt-2">
                Included stages: {completedStages.map((stage) => stage.shortLabel).join(', ')}
              </p>
            </div>
            <StarRating score={overallScore} />
          </Card>

          {completedStages.map((stage) => (
            <StageFeedbackDetails
              key={stage.id}
              stageId={stage.id as TestStageId}
              feedback={results[stage.id]!}
            />
          ))}
        </>
      )}
    </div>
  );
}
