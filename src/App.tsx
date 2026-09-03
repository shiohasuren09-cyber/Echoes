import React, { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { soundManager } from './audio/SoundSynthesizer';
import { GraphicSettings } from './types';

export default function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const [settings] = useState<GraphicSettings>({
    quality: 'medium',
    shadows: true,
    sensitivity: 1.0,
    soundVolume: 0.8,
    musicVolume: 0.8,
    fov: 72,
  });

  const handleStartGame = () => {
    // Initialize Web Audio on user gesture
    soundManager.init();
    setGameStarted(true);
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-black select-none text-slate-100">
      {!gameStarted ? (
        <TitleScreen onStart={handleStartGame} />
      ) : (
        <GameCanvas initialSettings={settings} />
      )}
    </main>
  );
}
