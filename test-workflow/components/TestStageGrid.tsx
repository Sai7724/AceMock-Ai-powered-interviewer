import { Link } from 'react-router-dom';
import type { TestStageDefinition, TestStageId, TestWorkflowResults } from '../services/stageConfig';
import GlassButton from '../../components/common/GlassButton';
import GlassSurface from '../../components/common/GlassSurface';

interface TestStageGridProps {
  stages: TestStageDefinition[];
  results: TestWorkflowResults;
  onSelectStage: (stageId: TestStageId) => void;
  onViewSummary: () => void;
}

export default function TestStageGrid({
  stages,
  results,
  onSelectStage,
  onViewSummary,
}: TestStageGridProps) {
  const completedStages = stages.filter((stage) => results[stage.id]).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="liquid-kicker text-[color:var(--accent-gold-strong)]">Test Workflow</p>
          <h1 className="liquid-heading mt-3 text-4xl font-extrabold">Test Interview Stages</h1>
          <p className="liquid-copy mt-4 max-w-3xl text-lg">
            Run each interview stage independently, get instant feedback, and build a temporary combined summary without touching the production interview flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GlassButton
            as={Link}
            to="/"
            variant="secondary"
            className="rounded-full px-5 py-3 text-sm font-semibold"
          >
            Back to Home
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={onViewSummary}
            disabled={completedStages === 0}
            className="rounded-full px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            View Combined Results
          </GlassButton>
        </div>
      </div>

      <div className="w-full p-6 md:p-8 rounded-[32px] bg-[#0a0d14]/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="liquid-heading text-2xl font-bold">Available Stage Tests</h2>
            <p className="liquid-muted mt-2">
              Completed stages: <span className="liquid-accent text-[color:var(--accent-gold-strong)] font-semibold">{completedStages}</span> / {stages.length}
            </p>
          </div>
        </div>

      <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-5">
        {stages.map((stage) => {
          const result = results[stage.id];
          return (
            <GlassSurface
              as="button"
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(232,195,97,0.3)]"
              backgroundOpacity={0.08}
              blur={24}
              borderRadius={48} // 3rem
            >
              <div className="absolute inset-0 border border-white/5 ring-1 ring-white/10 group-hover:ring-[#e8c361]/30 transition-all duration-500" />
              
              <div className="relative z-10 p-8 flex flex-col h-full min-h-[300px] text-left">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8c361]/10 flex items-center justify-center text-[#e8c361] border border-[#e8c361]/20 group-hover:scale-110 group-hover:bg-[#e8c361]/20 transition-all duration-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-500 ${
                    result 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-[#e8c361]/10 text-[#e8c361] border-[#e8c361]/20 shadow-[0_0_15px_rgba(232,195,97,0.2)]'
                  }`}>
                    {result ? 'Completed' : 'Ready'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-[#e8c361] transition-colors duration-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {stage.label}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors duration-500">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  {result ? (
                    <>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Score</span>
                      <span className="text-lg font-black text-white">{result.score}<span className="text-slate-500 text-xs font-normal">/10</span></span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-[#e8c361]/60 uppercase tracking-widest group-hover:text-[#e8c361] transition-colors duration-500">Initialize Stage</span>
                      <svg className="w-4 h-4 text-[#e8c361] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </div>
              </div>
            </GlassSurface>
          );
        })}
      </div>
      </div>
    </div>
  );
}
