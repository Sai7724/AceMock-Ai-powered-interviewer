import LanguageSelection from '../../components/LanguageSelection';
import GlassButton from '../../components/common/GlassButton';
import GlassSurface from '../../components/common/GlassSurface';

interface StageLanguageGateProps {
  stageLabel: string;
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  onBack: () => void;
}

export default function StageLanguageGate({
  stageLabel,
  selectedLanguage,
  onSelectLanguage,
  onBack,
}: StageLanguageGateProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="liquid-kicker">Testing Setup</p>
          <h2 className="liquid-heading mt-3 text-3xl font-extrabold">{stageLabel}</h2>
          <p className="liquid-copy mt-3 max-w-2xl">
            Select the language or technology stack you want to use for this isolated stage test.
          </p>
        </div>
        <GlassButton
          variant="secondary"
          onClick={onBack}
          className="rounded-full px-5 py-3 text-sm font-semibold"
        >
          Back to Stage List
        </GlassButton>
      </div>

      {selectedLanguage && (
        <div className="liquid-banner border border-[color:var(--accent-blue-strong)]/20 px-5 py-4 text-[color:var(--accent-blue-strong)]">
          Current selection: <span className="font-semibold">{selectedLanguage}</span>
        </div>
      )}

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="p-6 shadow-2xl"
      >
        <LanguageSelection onComplete={onSelectLanguage} />
      </GlassSurface>
    </div>
  );
}
