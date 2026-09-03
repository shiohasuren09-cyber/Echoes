import React, { useState } from 'react';
import { X, Volume2, Lock, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { MEMORY_FRAGMENTS } from '../data/memoryFragments';
import { MemoryFragment } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';

interface MemoryCodexModalProps {
  isOpen: boolean;
  collectedIds: string[];
  onClose: () => void;
}

export const MemoryCodexModal: React.FC<MemoryCodexModalProps> = ({
  isOpen,
  collectedIds,
  onClose,
}) => {
  const [selectedFragmentId, setSelectedFragmentId] = useState<string>(
    collectedIds.length > 0 ? collectedIds[0] : MEMORY_FRAGMENTS[0].id
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const selectedFragment =
    MEMORY_FRAGMENTS.find((f) => f.id === selectedFragmentId) || MEMORY_FRAGMENTS[0];
  const isCollected = collectedIds.includes(selectedFragment.id);

  const handlePlayAudio = (fragment: MemoryFragment) => {
    soundManager.playMemoryFragmentAudio(fragment.audioType);
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  return (
    <div
      id="memory-codex-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="immersive-noise absolute inset-0 opacity-20 pointer-events-none" />

      <div
        id="memory-codex-dialog"
        className="w-full max-w-4xl bg-[#08080a] border border-white/15 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden relative z-10 flex flex-col h-[88vh] max-h-[720px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0c0c10]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block">
                Subconscious Archive
              </span>
              <h2 className="text-lg font-mono font-bold text-white tracking-wider">
                Memory Codex // Fragment Recovery
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                Truth Reconstruction
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">
                {collectedIds.length} / {MEMORY_FRAGMENTS.length} Collected
              </span>
            </div>
            <button
              id="close-codex-modal-btn"
              onClick={() => {
                soundManager.stopMemoryFragmentAudio();
                onClose();
              }}
              className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left Sidebar List, Right Detail Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Artifact List */}
          <div className="md:col-span-4 border-r border-white/10 bg-[#060608] overflow-y-auto p-3 space-y-2">
            <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white/30">
              Recovered Breadcrumbs
            </div>

            {MEMORY_FRAGMENTS.map((frag) => {
              const collected = collectedIds.includes(frag.id);
              const isSelected = frag.id === selectedFragment.id;

              return (
                <button
                  key={frag.id}
                  id={`select-fragment-${frag.id}`}
                  onClick={() => {
                    setSelectedFragmentId(frag.id);
                    soundManager.stopMemoryFragmentAudio();
                    setIsPlayingAudio(false);
                  }}
                  className={`w-full text-left p-3 rounded-sm border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white/10 border-white/30 text-white'
                      : collected
                      ? 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05]'
                      : 'bg-transparent border-white/5 text-white/30 hover:border-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-sm border border-white/10 bg-black/60 shrink-0 overflow-hidden flex items-center justify-center">
                    {collected ? (
                      <img
                        src={frag.imageDataUri}
                        alt={frag.artifactName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Lock className="w-4 h-4 text-white/20" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/40 mb-0.5">
                      <span>#0{frag.number}</span>
                      {collected ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 text-[8px]">
                          <CheckCircle2 className="w-2.5 h-2.5" /> RECOVERED
                        </span>
                      ) : (
                        <span className="text-white/30">MISSING</span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-medium truncate">
                      {collected ? frag.artifactName : 'Distorted Memory'}
                    </div>
                    <div className="text-[10px] font-mono text-white/40 truncate">
                      {frag.locationHint}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Viewer */}
          <div className="md:col-span-8 overflow-y-auto p-5 sm:p-7 flex flex-col justify-between space-y-6">
            {isCollected ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative w-32 h-32 rounded-sm overflow-hidden border border-white/20 bg-black/80 shrink-0 shadow-lg">
                    <img
                      src={selectedFragment.imageDataUri}
                      alt={selectedFragment.artifactName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                        Artifact #{selectedFragment.number}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-mono text-white/50">
                        {selectedFragment.dateTag}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif text-white/95 font-medium">
                      {selectedFragment.title}
                    </h3>
                    <p className="text-xs font-mono text-white/60">
                      Physical Representation: {selectedFragment.artifactName}
                    </p>
                    <p className="text-[10px] font-mono text-white/40">
                      Location in Elmridge: {selectedFragment.locationHint}
                    </p>
                  </div>
                </div>

                {/* Audio player */}
                <div className="p-3.5 bg-black/50 border border-white/10 rounded-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPlayingAudio ? 'bg-amber-400 animate-ping' : 'bg-white/30'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-mono text-white/80">
                        {selectedFragment.audioTitle}
                      </div>
                      <div className="text-[9px] font-mono text-white/40">
                        Distorted Auditory Hallucination Memory
                      </div>
                    </div>
                  </div>

                  <button
                    id="codex-play-audio-btn"
                    onClick={() => handlePlayAudio(selectedFragment)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-amber-300 border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 rounded-sm transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingAudio ? 'Playing Signal...' : 'Listen to Audio'}</span>
                  </button>
                </div>

                {/* Narrative text */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-white/50" />
                    <span>Recovered Memory Transcript</span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border-l-2 border-amber-500/50 rounded-r-sm text-sm sm:text-base font-serif italic text-white/90 leading-relaxed">
                    "{selectedFragment.narrative}"
                  </div>
                </div>

                {/* Subconscious Telemetry Clue */}
                <div className="flex items-start gap-2.5 p-3.5 bg-red-950/20 border border-red-500/20 rounded-sm text-xs font-mono text-red-300/80 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-red-400 mr-1.5">
                      Clinical Subtext:
                    </span>
                    {selectedFragment.subtext}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center">
                  <Lock className="w-7 h-7 text-white/30" />
                </div>
                <div className="max-w-md space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 block">
                    Unrecovered Artifact #{selectedFragment.number}
                  </span>
                  <h3 className="text-lg font-mono text-white/70">
                    Memory Fragment Lost in Dream
                  </h3>
                  <p className="text-xs font-mono text-white/40 leading-relaxed">
                    Hint: Explore the Elmridge house carefully.{' '}
                    <span className="text-amber-400/80">"{selectedFragment.locationHint}"</span>.
                    Look for a faint, ethereal resonant aura.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom summary note */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400/70" />
                Breadcrumbs do not alter fate, but illuminate reality.
              </span>
              <span>
                {collectedIds.length === 5
                  ? 'All 5 fragments reassembled. The subconscious barrier is weakening.'
                  : `${5 - collectedIds.length} fragments remaining in the house.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
