import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export const OrientationWarning: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if height > width and if mobile touch screen
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isPort = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && isPort);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed inset-0 z-60 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="immersive-noise absolute inset-0 opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6">
          <Smartphone className="w-14 h-14 text-white/80 rotate-90 animate-pulse" />
          <RotateCw className="w-6 h-6 text-red-400 absolute -top-1 -right-1 animate-spin duration-3000" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-black/60 border border-white/10 text-[9px] uppercase tracking-[0.25em] font-mono text-white/40 mb-3">
          Viewport Orientation Alert
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-serif text-white/90 mb-2">
          Rotate to Landscape
        </h2>
        <p className="text-xs sm:text-sm text-white/60 font-serif italic max-w-xs mb-8 leading-relaxed">
          'Echoes of Elmridge is built for horizontal perspective. Please turn your device sideways for the most immersive sensory experience.'
        </p>

        <button
          onClick={() => setDismissed(true)}
          className="px-6 py-2.5 rounded-sm border border-white/20 text-xs font-mono uppercase tracking-[0.2em] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          Continue in Portrait
        </button>
      </div>
    </div>
  );
};

