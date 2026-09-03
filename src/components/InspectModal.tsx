import React from 'react';
import { X, HeartHandshake, Eye } from 'lucide-react';

interface InspectModalProps {
  item: {
    title: string;
    description: string;
    noteText?: string;
    subtext?: string;
    isMedicalRecord?: boolean;
  } | null;
  onClose: () => void;
  onWakeUp?: () => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  item,
  onClose,
  onWakeUp,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none">
      {/* Background Subtle Noise */}
      <div className="immersive-noise absolute inset-0 opacity-25 pointer-events-none" />

      <div
        className={`w-full max-w-lg rounded-sm border shadow-2xl p-6 sm:p-8 relative z-10 transition-all ${
          item.isMedicalRecord
            ? 'bg-[#080808]/95 border-red-500/40 text-slate-100 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
            : 'bg-[#080808]/95 border-white/15 text-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Close Button */}
        {!item.isMedicalRecord && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header / Category Tag */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-white/10 pb-3">
          {item.isMedicalRecord ? (
            <HeartHandshake className="w-5 h-5 text-red-400" />
          ) : (
            <Eye className="w-4 h-4 text-white/50" />
          )}
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-mono block text-white/40">
              {item.isMedicalRecord ? 'Classified Medical Record' : 'Physical Memory Fragment'}
            </span>
            <h2
              className={`text-lg font-bold tracking-wide ${
                item.isMedicalRecord ? 'text-red-300 font-mono' : 'font-serif text-white/95'
              }`}
            >
              {item.title}
            </h2>
          </div>
        </div>

        {/* Note / Document Box */}
        {item.noteText ? (
          <div
            className={`p-4 rounded-sm my-4 text-xs sm:text-sm leading-relaxed border whitespace-pre-wrap ${
              item.isMedicalRecord
                ? 'bg-black/80 border-red-500/30 text-emerald-400/90 font-mono shadow-inner'
                : 'bg-[#0d0d0d] text-white/90 font-serif border-white/10 shadow-inner'
            }`}
          >
            {item.noteText}
          </div>
        ) : (
          <p className="text-sm sm:text-base leading-relaxed text-white/80 font-serif italic mb-4">
            '{item.description}'
          </p>
        )}

        {/* Auditory Whisper Subtext */}
        {item.subtext && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs italic text-amber-200/80 font-serif flex items-center gap-2">
            <span className="font-mono text-[9px] text-white/30 not-italic uppercase tracking-widest">
              Echo:
            </span>
            <span>"{item.subtext}"</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {item.isMedicalRecord ? (
            <button
              onClick={() => {
                onClose();
                if (onWakeUp) onWakeUp();
              }}
              className="w-full py-3 px-6 rounded-sm bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-red-200 font-mono text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] active:scale-98 cursor-pointer"
            >
              Conscious Return (Awaken)
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
