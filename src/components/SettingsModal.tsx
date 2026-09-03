import React from 'react';
import { GraphicSettings } from '../types';
import { X, Volume2, Monitor, Compass, Gamepad2 } from 'lucide-react';

interface SettingsModalProps {
  settings: GraphicSettings;
  onUpdateSettings: (newSettings: GraphicSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none">
      {/* Immersive background noise */}
      <div className="immersive-noise absolute inset-0 opacity-25 pointer-events-none" />

      <div className="w-full max-w-md bg-[#080808]/95 border border-white/10 rounded-sm shadow-2xl p-6 text-slate-100 relative z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-mono text-white/40 mb-1">
            <Gamepad2 className="w-3.5 h-3.5 text-white/50" />
            System Parameters
          </div>
          <h2 className="text-xl font-bold font-serif text-white/90">
            Diagnostics & Interface
          </h2>
        </div>

        <div className="space-y-5 text-sm">
          {/* Graphics Quality */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mb-2 flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-white/50" />
              Rendering Pipeline
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      quality: q,
                      shadows: q !== 'low',
                    })
                  }
                  className={`py-2 px-3 rounded-sm border text-xs font-mono uppercase tracking-wider transition-all ${
                    settings.quality === q
                      ? 'bg-white/15 border-white/40 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-1.5">
              Select Low for maximum battery and stability on mobile chips.
            </p>
          </div>

          {/* Look Sensitivity */}
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1 font-mono">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <Compass className="w-3.5 h-3.5 text-white/50" />
                Look Sensitivity
              </span>
              <span className="text-white/90">
                {settings.sensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  sensitivity: parseFloat(e.target.value),
                })
              }
              className="w-full accent-white bg-black/60 border border-white/10 rounded-sm cursor-pointer h-1.5"
            />
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1 font-mono">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <Volume2 className="w-3.5 h-3.5 text-white/50" />
                Audio Master
              </span>
              <span className="text-white/90">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  soundVolume: parseFloat(e.target.value),
                })
              }
              className="w-full accent-white bg-black/60 border border-white/10 rounded-sm cursor-pointer h-1.5"
            />
          </div>

          {/* Controls Quick Guide */}
          <div className="pt-3 border-t border-white/10">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 mb-2">
              Input Bindings
            </h3>
            <div className="bg-black/50 rounded-sm p-3 text-[11px] space-y-1.5 text-white/60 border border-white/5 font-mono">
              <div><strong className="text-white/90">[DESKTOP]</strong> WASD move • Mouse look • [E] interact • [F] light</div>
              <div><strong className="text-white/90">[TOUCH]</strong> Left thumbstick • Right surface look • Floating pips</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-mono text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
        >
          Resume Simulation
        </button>
      </div>
    </div>
  );
};

