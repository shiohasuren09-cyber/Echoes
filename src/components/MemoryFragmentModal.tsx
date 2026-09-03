import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { MemoryFragment } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';

interface MemoryFragmentModalProps {
  fragment: MemoryFragment | null;
  onClose: () => void;
  onOpenCodex: () => void;
  totalCollected: number;
  totalFragments: number;
}

export const MemoryFragmentModal: React.FC<MemoryFragmentModalProps> = ({
  fragment,
  onClose,
  onOpenCodex,
  totalCollected,
  totalFragments,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

  useEffect(() => {
    if (fragment) {
      setIsPlayingAudio(true);
      const timer = setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4500);
      return () => {
        clearTimeout(timer);
        soundManager.stopMemoryFragmentAudio();
      };
    }
  }, [fragment]);

  if (!fragment) return null;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      soundManager.stopMemoryFragmentAudio();
      setIsPlayingAudio(false);
    } else {
      soundManager.playMemoryFragmentAudio(fragment.audioType);
      setIsPlayingAudio(true);
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4500);
    }
  };

  return (
    <div
      id="memory-fragment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fade-in select-none"
    >
      {/* Background ambient CRT scanline noise */}
      <div className="immersive-noise absolute inset-0 opacity-20 pointer-events-none" />

      <div
        id="memory-fragment-dialog"
        className="w-full max-w-2xl bg-[#08080a] border border-white/15 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden relative z-10 flex flex-col max-h-[92vh]"
      >
        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0c0c10]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
              Subconscious Artifact #{fragment.number}
            </span>
            <span className="text-[10px] font-mono text-white/30">|</span>
            <span className="text-[10px] font-mono text-white/50 tracking-wider">
              {fragment.dateTag}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/40 tracking-widest hidden sm:inline">
              RECOVERED: {totalCollected}/{totalFragments}
            </span>
            <button
              id="close-fragment-modal-btn"
              onClick={onClose}
              className="p-1 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {/* Artifact Visual & Audio Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Artifact Generated Image Preview */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="relative group w-full aspect-square max-w-[220px] rounded-sm overflow-hidden border border-white/20 bg-black/80 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                <img
                  src={fragment.imageDataUri}
                  alt={fragment.artifactName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105 brightness-95"
                />
                {/* CRT Scanline simulation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-white/70 text-center tracking-widest truncate">
                  {fragment.artifactName}
                </div>
              </div>
              <span className="mt-2 text-[9px] font-mono text-white/30 tracking-widest text-center uppercase">
                Location: {fragment.locationHint}
              </span>
            </div>

            {/* Audio Signal Player & Meta */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 block mb-1">
                  Psychological Memory Resonance
                </span>
                <h2 className="text-xl sm:text-2xl font-serif text-white/95 font-medium tracking-wide">
                  {fragment.title}
                </h2>
              </div>

              {/* Audio Playback Box */}
              <div className="p-3.5 bg-black/60 border border-white/10 rounded-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlayingAudio ? 'bg-amber-400 animate-ping' : 'bg-white/20'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-white/70 tracking-wider">
                      {fragment.audioTitle}
                    </span>
                  </div>
                  <button
                    id="toggle-fragment-audio-btn"
                    onClick={handleToggleAudio}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 rounded-sm transition-all"
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3 h-3" />
                        <span>Mute Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Replay Audio</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Animated waveform visualizer */}
                <div className="flex items-center justify-between gap-1 h-6 px-1.5 bg-black/80 rounded-sm border border-white/5">
                  {Array.from({ length: 28 }).map((_, idx) => {
                    const activeHeight = isPlayingAudio
                      ? Math.max(15, ((idx * 17 + Date.now() / 100) % 85) + 15)
                      : 12;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-xs transition-all duration-150 ${
                          isPlayingAudio ? 'bg-amber-400/80' : 'bg-white/15'
                        }`}
                        style={{ height: `${activeHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                <Sparkles className="w-3 h-3 text-cyan-400/70" />
                <span>Sanity stabilized (+10%) upon rediscovery</span>
              </div>
            </div>
          </div>

          {/* Narrative Revelation */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="p-4 bg-white/[0.02] border-l-2 border-amber-500/50 rounded-r-sm text-sm sm:text-base font-serif italic text-white/90 leading-relaxed">
              "{fragment.narrative}"
            </div>

            {/* Subconscious Clinical Subtext */}
            <div className="flex items-start gap-2.5 p-3 bg-red-950/20 border border-red-500/20 rounded-sm text-[11px] font-mono text-red-300/80 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold tracking-wider text-red-400 uppercase mr-1.5">
                  Subconscious Telemetry:
                </span>
                {fragment.subtext}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/10 bg-[#0a0a0d] flex items-center justify-between">
          <button
            id="open-archive-from-fragment-btn"
            onClick={() => {
              onClose();
              onOpenCodex();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Review Memory Archive ({totalCollected}/{totalFragments})</span>
          </button>

          <button
            id="return-to-dream-btn"
            onClick={onClose}
            className="px-5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-mono text-xs uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Return to Dream
          </button>
        </div>
      </div>
    </div>
  );
};
