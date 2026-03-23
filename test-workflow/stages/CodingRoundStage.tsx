import { useState } from 'react';
import type { CodingFeedback } from '../../types';
import CodingChallenge from '../../components/CodingChallenge';
import StageLanguageGate from '../components/StageLanguageGate';
import GlassButton from '../../components/common/GlassButton';

interface CodingRoundStageProps {
  onComplete: (feedback: CodingFeedback) => void;
  onBack: () => void;
}

export default function CodingRoundStage({
  onComplete,
  onBack,
}: CodingRoundStageProps) {
  const [language, setLanguage] = useState('');

  if (!language) {
    return (
      <StageLanguageGate
        stageLabel="Coding Round"
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="liquid-banner border border-[color:var(--accent-blue-strong)]/20 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="liquid-kicker">Coding Test</p>
            <p className="liquid-copy mt-2">
              Current language/track: <span className="liquid-accent font-semibold">{language}</span>
            </p>
          </div>
          <GlassButton
            variant="secondary"
            onClick={() => setLanguage('')}
            className="rounded-full px-5 py-3 text-sm font-semibold"
          >
            Change Selection
          </GlassButton>
        </div>
      </div>
      <CodingChallenge language={language} onComplete={onComplete} />
    </div>
  );
}
