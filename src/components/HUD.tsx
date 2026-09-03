import React from 'react';
import { GameState } from '../types';
import { Flashlight, Key, Heart, Settings, Sparkles, BookOpen } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  hoverPrompt: string | null;
  onToggleFlashlight: () => void;
  onOpenSettings: () => void;
  onOpenMemoryCodex: () => void;
  onInteract: () => void;
  isTouch: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  hoverPrompt,
  onToggleFlashlight,
  onOpenSettings,
  onOpenMemoryCodex,
  onInteract,
  isTouch,
}) => {
  const getActStatus = () => {
    switch (gameState.currentAct) {
      case 'act1_midnight':
        return 'Status: REM Cycle Deep • 01:24 AM';
      case 'act2_fracture':
        return 'Status: Neural Flux • Unstable';
      case 'act3_awakening':
        return 'Status: Cortical Shift • Near Surface';
      case 'epilogue':
        return 'Status: Conscious Awakening';
      default:
        return 'Status: Active Protocol';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none">
      {/* Top Header Section */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Telemetry Status Badge & Current Objective */}
        <div className="flex flex-col gap-1 max-w-sm sm:max-w-md pointer-events-auto">
          {/* Status pill with pulsating red dot */}
          <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/10 rounded-sm w-fit shadow-xl">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-red-100/70">
              {getActStatus()}
            </span>
          </div>

          {/* Objective Box with left-accent border */}
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2.5 sm:py-3 border-l-2 border-white/20 mt-1 shadow-2xl">
            <h2 className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/40 mb-0.5">
              Current Objective
            </h2>
            <p className="text-xs sm:text-sm italic font-serif text-white/90 leading-snug">
              '{gameState.currentObjective}'
            </p>
          </div>
        </div>

        {/* Right: Technical Telemetry & Quick Action Icons */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Diagnostic readouts */}
          <div className="hidden sm:block text-right select-none">
            <div className="text-[11px] font-mono text-white/30 tracking-tighter">
              LOC: ELMRIDGE.RES.98
            </div>
            <div className="text-[11px] font-mono text-white/30 tracking-tighter">
              SYNC: {Math.max(10, Math.round(gameState.sanity))}% • STABLE
            </div>
          </div>

          {/* Action buttons with frosted glass aesthetic */}
          <div className="flex items-center gap-2">
            {/* Memory Fragments Codex Button */}
            <button
              id="hud-open-codex-btn"
              onClick={onOpenMemoryCodex}
              className="px-2.5 py-1.5 rounded-sm bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/15 hover:border-amber-400/50 flex items-center gap-2 transition-all shadow-lg text-white/80 group"
              title="Open Memory Codex (Artifacts & Lore)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 hidden sm:inline">
                Fragments:
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {gameState.collectedFragments?.length || 0}/5
              </span>
            </button>

            {gameState.hasFlashlight && (
              <button
                onClick={onToggleFlashlight}
                className={`p-2.5 rounded-sm border backdrop-blur-xl transition-all ${
                  gameState.flashlightOn
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/90 hover:border-white/20'
                }`}
                title="Toggle Flashlight (F or Tap)"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-sm bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 hover:text-white/90 hover:border-white/20 transition-all shadow-lg"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Micro Crosshair & Interaction Prompt */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Precision pinpoint dot */}
        <div
          className={`rounded-full transition-all duration-200 ${
            hoverPrompt
              ? 'w-2 h-2 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-125 ring-2 ring-white/20'
              : 'w-1 h-1 bg-white/60 shadow-[0_0_10px_white]'
          }`}
        />

        {/* Floating Context Prompt */}
        {hoverPrompt && (
          <div
            onClick={isTouch ? onInteract : undefined}
            className={`absolute top-[54%] bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-fade-in ${
              isTouch ? 'pointer-events-auto active:scale-95 cursor-pointer' : ''
            }`}
          >
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-amber-300">
              {hoverPrompt}
            </span>
          </div>
        )}
      </div>

      {/* Hallucination / Distortion screen pulse */}
      {gameState.hallucinationLevel > 0.3 && (
        <div
          className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-10"
          style={{
            boxShadow: `inset 0 0 ${Math.round(gameState.hallucinationLevel * 100)}px rgba(220, 38, 38, ${gameState.hallucinationLevel * 0.4})`,
          }}
        />
      )}

      {/* Bottom Section: Minimalist Inventory & Desktop Control Legend */}
      <div className="flex items-end justify-between w-full">
        {/* Inventory Slots Strip */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {gameState.inventory.length === 0 ? (
            <div className="text-[11px] font-mono tracking-tight text-white/30 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-sm border border-white/10">
              INVENTORY: EMPTY
            </div>
          ) : (
            gameState.inventory.map((item) => (
              <div
                key={item.id}
                className="bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-sm flex items-center gap-2 shadow-lg group hover:border-white/30 transition-all"
                title={item.description}
              >
                {item.id === 'brass_key' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                {item.id === 'barnaby' && <Heart className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-xs font-mono uppercase tracking-wider text-white/80">
                  {item.name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Desktop Controls Legend */}
        {!isTouch && (
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-white/10">
            <span>[WASD] MOVE</span>
            <span>•</span>
            <span>[MOUSE] LOOK</span>
            <span>•</span>
            <span>[E] INTERACT</span>
            <span>•</span>
            <span>[F] LIGHT</span>
            <span>•</span>
            <span>[M] MEMORIES</span>
          </div>
        )}
      </div>
    </div>
  );
};

