import GlassSurface from './GlassSurface';
import GlassButton from './GlassButton';
import { XMarkIcon, ExclamationTriangleIcon } from '../../constants';

interface LeaveInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LeaveInterviewModal({ isOpen, onClose, onConfirm }: LeaveInterviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={40}
        opacity={0.95}
        backgroundOpacity={0.12}
        className="relative max-w-lg w-full overflow-hidden shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-white/10 animate-in fade-in zoom-in duration-300"
      >
        <div className="p-8 sm:p-10">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[color:var(--accent-gold-strong)]/10 flex items-center justify-center text-[color:var(--accent-gold-strong)] border border-[color:var(--accent-gold-strong)]/20 mb-8 shadow-[0_0_30px_rgba(232,195,97,0.15)]">
              <ExclamationTriangleIcon className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Exit Interview?
            </h3>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-sm">
              Your current interview progress will be permanently lost. Are you sure you want to force exit?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <GlassButton
                onClick={onClose}
                className="flex-1 rounded-2xl py-4 font-bold text-base transition-all duration-300 hover:scale-[1.02]"
              >
                No, Stay & Continue
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={onConfirm}
                className="flex-1 rounded-2xl py-4 font-bold text-base border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 hover:scale-[1.02]"
              >
                Yes, Force Exit
              </GlassButton>
            </div>
          </div>
        </div>
        
        {/* Subtle Decorative Gradient */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[color:var(--accent-gold-strong)]/5 rounded-full blur-[80px] pointer-events-none" />
      </GlassSurface>
    </div>
  );
}
