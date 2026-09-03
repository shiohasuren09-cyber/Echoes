import React from 'react';
import { Play, Volume2, ShieldAlert } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-40 bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Immersive UI Subtle Noise & Vignette */}
      <div className="immersive-noise absolute inset-0 opacity-40 pointer-events-none" />
      <div className="vhs-scanlines absolute inset-0 opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />

      <div className="relative z-10 max-w-xl flex flex-col items-center my-auto">
        {/* Status / Date Tag */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-sm bg-black/60 backdrop-blur-md border border-white/10 text-red-100/80 text-[10px] tracking-[0.25em] font-mono uppercase mb-6 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
          Autumn 1998 • Elmridge Archive
        </div>

        {/* Game Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-title tracking-widest text-white/95 mb-4 drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]">
          Echoes of Elmridge
        </h1>

        <div className="bg-black/40 backdrop-blur-sm px-5 py-3 border-l-2 border-white/20 mb-8 max-w-md text-left">
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono">
            Clinical Observation Log
          </h2>
          <p className="text-sm italic font-serif text-white/80 leading-relaxed">
            'You wake past midnight in your childhood bedroom. The thunderstorm rattles the window pane. The house feels strangely quiet.'
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative px-8 py-3.5 rounded-sm bg-white/5 backdrop-blur-xl border border-white/20 hover:border-white/50 text-white font-mono text-xs tracking-[0.25em] uppercase transition-all duration-200 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:bg-white/10 active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-red-400" />
          <span>Enter the Dark</span>
        </button>

        {/* Sensory and Advisory Notice */}
        <div className="mt-10 flex flex-col items-center gap-2 max-w-sm text-center">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <Volume2 className="w-3.5 h-3.5 text-white/60" />
            <span>Spatial 3D audio enabled (Headphones recommended)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 tracking-tight">
            <ShieldAlert className="w-3 h-3 text-white/40" />
            <span>Contains psychological themes, flickering light, and sensory shifts</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex items-center gap-4 text-[10px] text-white/30 font-mono tracking-widest uppercase">
        <span>FRAMEWORK: THREE.JS</span>
        <span>•</span>
        <span>OPT: DESKTOP & LANDSCAPE MOBILE</span>
      </div>
    </div>
  );
};

