import type { SelfIntroductionFeedback } from '../../types';
import SelfIntroduction from '../../components/SelfIntroduction';

interface SelfIntroductionStageProps {
  onComplete: (feedback: SelfIntroductionFeedback) => void;
}

export default function SelfIntroductionStage({ onComplete }: SelfIntroductionStageProps) {
  return <SelfIntroduction onComplete={onComplete} />;
}
