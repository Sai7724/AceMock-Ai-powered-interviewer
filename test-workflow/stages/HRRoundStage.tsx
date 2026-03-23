import type { HRFeedback } from '../../types';
import HRRound from '../../components/HRRound';

interface HRRoundStageProps {
  onComplete: (feedback: HRFeedback) => void;
}

export default function HRRoundStage({ onComplete }: HRRoundStageProps) {
  return <HRRound onComplete={onComplete} />;
}
