import React from 'react';
import { RotateCcw } from 'lucide-react';

interface EpilogueScreenProps {
  onRestart: () => void;
}

export const EpilogueScreen: React.FC<EpilogueScreenProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
      {/* Immersive UI Subtle Noise & Depth Vignette */}
      <div className="immersive-noise absolute inset-0 opacity-40 pointer-events-none" />
      <div className="vhs-scanlines absolute inset-0 opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />

      <div className="relative z-10 max-w-xl my-auto py-8">
        {/* Status chip */}
        <div className="inline-flex items-center justify-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-sm mb-6 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-300">
            Clinical Telemetry: Awake & Responsive
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white/95 mb-6 tracking-wide drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
          The Waking World
        </h1>

        <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed font-serif text-left bg-black/40 backdrop-blur-sm border-l-2 border-white/20 p-6 shadow-2xl mb-8">
          <p>
            The violent thunderstorm was never real. It was the rhythmic cycling of the hospital ventilator and rain against the fourth-floor glass of St. Jude Pediatric Care.
          </p>
          <p>
            The muffled, locked conversations behind your parents' bedroom door were your mother and father whispering prayers over your bedside, holding your hand through a seven-day fever.
          </p>
          <p>
            The shifting rooms, the whispering clocks, and the shadow in the crayon drawing were the frightening fragments of early-onset childhood schizophrenia—a mind trying desperately to hold onto the safe memory of Elmridge Street.
          </p>
          <p className="italic text-amber-200/90 border-l-2 border-amber-400/60 pl-4 py-1 text-sm sm:text-base">
            "You made it through the night, Leo. You are safe now. Open your eyes."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-mono text-xs tracking-[0.25em] uppercase transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Re-enter the Memory
          </button>
        </div>

        <div className="mt-8 text-[10px] text-white/30 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
          <span>St. Jude Pediatric Care</span>
          <span>•</span>
          <span>Patient Discharge Protocol</span>
        </div>
      </div>
    </div>
  );
};

