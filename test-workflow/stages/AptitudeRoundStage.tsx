import type { AptitudeFeedback } from '../../types';
import AptitudeTest from '../../components/AptitudeTest';

interface AptitudeRoundStageProps {
  onComplete: (feedback: AptitudeFeedback) => void;
}

export default function AptitudeRoundStage({ onComplete }: AptitudeRoundStageProps) {
  return <AptitudeTest onComplete={onComplete} />;
}
