import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { soundManager } from '../audio/SoundSynthesizer';
import { GameState, GraphicSettings, MemoryFragment } from '../types';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { InspectModal } from './InspectModal';
import { SettingsModal } from './SettingsModal';
import { MemoryFragmentModal } from './MemoryFragmentModal';
import { MemoryCodexModal } from './MemoryCodexModal';
import { OrientationWarning } from './OrientationWarning';
import { EpilogueScreen } from './EpilogueScreen';

interface GameCanvasProps {
  initialSettings: GraphicSettings;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ initialSettings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [settings, setSettings] = useState<GraphicSettings>(initialSettings);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [hoverPrompt, setHoverPrompt] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameState>({
    currentAct: 'act1_midnight',
    hasFlashlight: false,
    flashlightOn: false,
    battery: 100,
    sanity: 100,
    inventory: [],
    collectedFragments: [],
    activeMemoryFragment: null,
    isMemoryCodexOpen: false,
    currentObjective: 'Find your flashlight on the bedroom desk.',
    activeInspectItem: null,
    hallucinationLevel: 0,
    isPaused: false,
    isGameOver: false,
    isAwakened: false,
    foundBear: false,
    foundKey: false,
    foundDrawing: false,
    unlockedBasement: false,
    masterBedroomExamined: false,
    fridgeExamined: false,
    tvExamined: false,
    doctorVoicesTriggered: false,
  });

  // State update callback from engine
  const handleEngineStateChange = useCallback((updated: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updated }));
  }, []);

  // Inspect modal callback from engine
  const handleInspectObject = useCallback(
    (data: {
      title: string;
      description: string;
      noteText?: string;
      subtext?: string;
      isMedicalRecord?: boolean;
    }) => {
      setGameState((prev) => ({
        ...prev,
        activeInspectItem: data,
      }));
    },
    []
  );

  // Memory fragment inspect callback from engine
  const handleInspectMemoryFragment = useCallback((fragment: MemoryFragment) => {
    setGameState((prev) => ({
      ...prev,
      activeMemoryFragment: fragment,
    }));
  }, []);

  // Keyboard shortcut listener for 'M' (Memory Codex)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setGameState((prev) => ({
          ...prev,
          isMemoryCodexOpen: !prev.isMemoryCodexOpen,
          activeMemoryFragment: null,
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Engine
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (!containerRef.current) return;

    const engine = new GameEngine(
      containerRef.current,
      gameState,
      settings,
      handleEngineStateChange,
      handleInspectObject,
      handleInspectMemoryFragment
    );

    engineRef.current = engine;

    // Check hovered object every 80ms for UI HUD
    const hoverInterval = setInterval(() => {
      if (engineRef.current) {
        const hit = engineRef.current.hoveredObject;
        if (hit && hit.userData?.interactiveData?.prompt) {
          setHoverPrompt(hit.userData.interactiveData.prompt);
        } else {
          setHoverPrompt(null);
        }
      }
    }, 80);

    return () => {
      clearInterval(hoverInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, [handleEngineStateChange, handleInspectObject, handleInspectMemoryFragment]);

  // Update engine settings when changed
  const handleUpdateSettings = (newSettings: GraphicSettings) => {
    setSettings(newSettings);
    if (engineRef.current) {
      engineRef.current.updateSettings(newSettings);
    }
  };

  const handleToggleFlashlight = () => {
    if (engineRef.current) {
      engineRef.current.toggleFlashlight();
    }
  };

  const handleInteract = () => {
    if (engineRef.current) {
      engineRef.current.interactWithTarget();
    }
  };

  const handleCloseInspect = () => {
    setGameState((prev) => ({ ...prev, activeInspectItem: null }));
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Immersive UI Subtle Noise & Radial Depth Gradient */}
      <div className="immersive-noise absolute inset-0 pointer-events-none z-10 opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10" />

      {/* VHS Scanlines Overlay */}
      <div className="vhs-scanlines absolute inset-0 pointer-events-none z-10 opacity-25" />

      {/* Game HUD */}
      <HUD
        gameState={gameState}
        hoverPrompt={hoverPrompt}
        onToggleFlashlight={handleToggleFlashlight}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMemoryCodex={() =>
          setGameState((prev) => ({ ...prev, isMemoryCodexOpen: true, activeMemoryFragment: null }))
        }
        onInteract={handleInteract}
        isTouch={isTouch}
      />

      {/* Mobile Touch Controls (Joystick & Action Buttons) */}
      {isTouch && engineRef.current && (
        <TouchControls
          touchInput={engineRef.current.touchInput}
          onInteract={handleInteract}
          onToggleFlashlight={handleToggleFlashlight}
          hasFlashlight={gameState.hasFlashlight}
          flashlightOn={gameState.flashlightOn}
          hasInteractTarget={hoverPrompt !== null}
        />
      )}

      {/* Inspect Item Modal (Drawings, Notes, Medical Record) */}
      <InspectModal
        item={gameState.activeInspectItem}
        onClose={handleCloseInspect}
        onWakeUp={() => {
          setGameState((prev) => ({
            ...prev,
            currentAct: 'epilogue',
            activeInspectItem: null,
          }));
        }}
      />

      {/* Memory Fragment Discovery Modal */}
      <MemoryFragmentModal
        fragment={gameState.activeMemoryFragment}
        onClose={() => setGameState((prev) => ({ ...prev, activeMemoryFragment: null }))}
        onOpenCodex={() =>
          setGameState((prev) => ({
            ...prev,
            activeMemoryFragment: null,
            isMemoryCodexOpen: true,
          }))
        }
        totalCollected={gameState.collectedFragments?.length || 0}
        totalFragments={5}
      />

      {/* Memory Codex Modal (Archive & Audio Player) */}
      <MemoryCodexModal
        isOpen={gameState.isMemoryCodexOpen}
        collectedIds={gameState.collectedFragments || []}
        onClose={() => setGameState((prev) => ({ ...prev, isMemoryCodexOpen: false }))}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Orientation Warning for mobile in portrait */}
      <OrientationWarning />

      {/* Epilogue Screen (Awakening Revelation) */}
      {gameState.currentAct === 'epilogue' && (
        <EpilogueScreen onRestart={handleRestart} />
      )}
    </div>
  );
};
