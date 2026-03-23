import { useEffect, useMemo, useState } from 'react';
import type {
  AptitudeFeedback,
  CodingFeedback,
  HRFeedback,
  SelfIntroductionFeedback,
  TechnicalQAFeedback,
} from '../../types';
import CombinedResultsSummary from '../components/CombinedResultsSummary';
import StageFeedbackDetails from '../components/StageFeedbackDetails';
import TestStageGrid from '../components/TestStageGrid';
import {
  TEST_STAGE_DEFINITIONS,
  getStageDefinition,
  type TestStageId,
  type TestWorkflowResults,
} from '../services/stageConfig';
import {
  clearTestWorkflowResults,
  loadTestWorkflowResults,
  saveTestWorkflowResults,
} from '../services/storage';
import AptitudeRoundStage from '../stages/AptitudeRoundStage';
import CodingRoundStage from '../stages/CodingRoundStage';
import HRRoundStage from '../stages/HRRoundStage';
import SelfIntroductionStage from '../stages/SelfIntroductionStage';
import TechnicalRoundStage from '../stages/TechnicalRoundStage';
import GlassButton from '../../components/common/GlassButton';
import GlassSurface from '../../components/common/GlassSurface';

type ViewMode = 'grid' | 'stage' | 'feedback' | 'summary';

export default function TestStagesPage() {
  const [results, setResults] = useState<TestWorkflowResults>(() => loadTestWorkflowResults());
  const [activeStageId, setActiveStageId] = useState<TestStageId | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [stageRunKey, setStageRunKey] = useState(0);

  useEffect(() => {
    saveTestWorkflowResults(results);
  }, [results]);

  const completedCount = useMemo(
    () => TEST_STAGE_DEFINITIONS.filter((stage) => results[stage.id]).length,
    [results]
  );

  const activeStage = activeStageId ? getStageDefinition(activeStageId) : null;

  const handleSelectStage = (stageId: TestStageId) => {
    setActiveStageId(stageId);
    setViewMode('stage');
  };

  const handleCompleteStage = (
    stageId: TestStageId,
    feedback:
      | SelfIntroductionFeedback
      | AptitudeFeedback
      | TechnicalQAFeedback
      | CodingFeedback
      | HRFeedback
  ) => {
    setResults((current) => ({
      ...current,
      [stageId]: feedback,
    }));
    setActiveStageId(stageId);
    setViewMode('feedback');
  };

  const handleRetestStage = () => {
    setStageRunKey((current) => current + 1);
    setViewMode('stage');
  };

  const handleClearResults = () => {
    clearTestWorkflowResults();
    setResults({});
    setActiveStageId(null);
    setViewMode('grid');
    setStageRunKey(0);
  };

  const renderStageRunner = () => {
    if (!activeStageId) {
      return null;
    }

    const key = `${activeStageId}-${stageRunKey}`;

    switch (activeStageId) {
      case 'selfIntroduction':
        return <SelfIntroductionStage key={key} onComplete={(feedback) => handleCompleteStage('selfIntroduction', feedback)} />;
      case 'aptitudeRound':
        return <AptitudeRoundStage key={key} onComplete={(feedback) => handleCompleteStage('aptitudeRound', feedback)} />;
      case 'technicalRound':
        return (
          <TechnicalRoundStage
            key={key}
            onBack={() => setViewMode('grid')}
            onComplete={(feedback) => handleCompleteStage('technicalRound', feedback)}
          />
        );
      case 'codingRound':
        return (
          <CodingRoundStage
            key={key}
            onBack={() => setViewMode('grid')}
            onComplete={(feedback) => handleCompleteStage('codingRound', feedback)}
          />
        );
      case 'hrRound':
        return <HRRoundStage key={key} onComplete={(feedback) => handleCompleteStage('hrRound', feedback)} />;
      default:
        return null;
    }
  };

  return (
    <div className="liquid-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {viewMode === 'grid' && (
          <TestStageGrid
            stages={TEST_STAGE_DEFINITIONS}
            results={results}
            onSelectStage={handleSelectStage}
            onViewSummary={() => setViewMode('summary')}
          />
        )}

        {viewMode === 'summary' && (
          <CombinedResultsSummary
            results={results}
            onBack={() => setViewMode('grid')}
            onClear={handleClearResults}
          />
        )}

        {viewMode === 'stage' && activeStage && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="liquid-kicker">Stage Runner</p>
                <h1 className="liquid-heading mt-3 text-4xl font-extrabold">{activeStage.label}</h1>
                <p className="liquid-copy mt-4 max-w-3xl text-lg">{activeStage.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={() => setViewMode('grid')}
                  className="rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Back to Stages
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => setViewMode('summary')}
                  disabled={completedCount === 0}
                  className="rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View Combined Results
                </GlassButton>
              </div>
            </div>

            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={32}
              blur={16}
              opacity={0.8}
              backgroundOpacity={0.06}
              className="p-6"
            >
              {renderStageRunner()}
            </GlassSurface>
          </div>
        )}

        {viewMode === 'feedback' && activeStage && results[activeStage.id] && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="liquid-kicker">Instant Feedback</p>
                <h1 className="liquid-heading mt-3 text-4xl font-extrabold">{activeStage.label}</h1>
                <p className="liquid-copy mt-4 max-w-3xl text-lg">
                  The stage has been evaluated independently using the same analysis services used in the main interview workflow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={() => setViewMode('grid')}
                  className="rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Back to Stages
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={handleRetestStage}
                  className="rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Retest This Stage
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => setViewMode('summary')}
                  disabled={completedCount === 0}
                  className="rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View Combined Results
                </GlassButton>
              </div>
            </div>

            <StageFeedbackDetails stageId={activeStage.id} feedback={results[activeStage.id]!} />
          </div>
        )}
      </div>
    </div>
  );
}
