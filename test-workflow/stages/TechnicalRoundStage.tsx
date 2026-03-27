import { useState } from 'react';
import type { TechnicalQAFeedback } from '../../types';
import TechnicalQA from '../../components/TechnicalQA';
import StageLanguageGate from '../components/StageLanguageGate';
import GlassButton from '../../components/common/GlassButton';

interface TechnicalRoundStageProps {
  onComplete: (feedback: TechnicalQAFeedback) => void;
  onBack: () => void;
}

export default function TechnicalRoundStage({
  onComplete,
  onBack,
}: TechnicalRoundStageProps) {
  const [language, setLanguage] = useState('');

  if (!language) {
    return (
      <StageLanguageGate
        stageLabel="Technical Round"
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="liquid-banner border border-[color:var(--accent-gold-strong)]/20 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="liquid-kicker text-[color:var(--accent-gold-strong)]">Technical Test</p>
            <p className="liquid-copy mt-2">
              Current language/track: <span className="liquid-accent text-[color:var(--accent-gold-strong)] font-semibold">{language}</span>
            </p>
          </div>
          <GlassButton
            variant="secondary"
            onClick={() => setLanguage('')}
            disabled={!!language} 
            className="rounded-full px-5 py-3 text-sm font-semibold opacity-0 pointer-events-none"
          >
            Change Selection
          </GlassButton>
        </div>
      </div>
      <TechnicalQA language={language} onComplete={onComplete} />
    </div>
  );
}
