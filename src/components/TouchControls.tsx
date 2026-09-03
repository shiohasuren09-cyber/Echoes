import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TouchInputState } from '../types';
import { Flashlight, Hand, Zap } from 'lucide-react';

interface TouchControlsProps {
  touchInput: TouchInputState;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  hasFlashlight: boolean;
  flashlightOn: boolean;
  hasInteractTarget: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  touchInput,
  onInteract,
  onToggleFlashlight,
  hasFlashlight,
  flashlightOn,
  hasInteractTarget,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isSprinting, setIsSprinting] = useState(false);

  // Touch tracking for virtual joystick
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch tracking for look area
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const maxRadius = 45; // Maximum joystick displacement radius

  // --- JOYSTICK TOUCH HANDLERS ---
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;

    const rect = joystickBaseRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      joystickOriginRef.current = { x: centerX, y: centerY };
    }

    setJoystickActive(true);
  };

  const handleJoystickTouchMove = useCallback(
    (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchIdRef.current) {
          const dx = touch.clientX - joystickOriginRef.current.x;
          const dy = touch.clientY - joystickOriginRef.current.y;
          const dist = Math.hypot(dx, dy);

          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxRadius);

          const knobX = Math.cos(angle) * clampedDist;
          const knobY = Math.sin(angle) * clampedDist;

          setKnobPos({ x: knobX, y: knobY });

          // Normalize to -1 to 1 for game engine
          touchInput.moveX = knobX / maxRadius;
          touchInput.moveY = knobY / maxRadius;
          break;
        }
      }
    },
    [touchInput]
  );

  const handleJoystickTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
          joystickTouchIdRef.current = null;
          setJoystickActive(false);
          setKnobPos({ x: 0, y: 0 });
          touchInput.moveX = 0;
          touchInput.moveY = 0;
          break;
        }
      }
    },
    [touchInput]
  );

  // --- LOOK AREA TOUCH HANDLERS ---
  const handleLookTouchStart = (e: React.TouchEvent) => {
    // Only capture on the right 60% of the screen
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.clientX > window.innerWidth * 0.35 && lookTouchIdRef.current === null) {
        lookTouchIdRef.current = touch.identifier;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleLookTouchMove = useCallback(
    (e: TouchEvent) => {
      if (lookTouchIdRef.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchIdRef.current) {
          const deltaX = touch.clientX - lastLookPosRef.current.x;
          const deltaY = touch.clientY - lastLookPosRef.current.y;

          touchInput.lookDeltaX += deltaX;
          touchInput.lookDeltaY += deltaY;

          lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    },
    [touchInput]
  );

  const handleLookTouchEnd = useCallback((e: TouchEvent) => {
    if (lookTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('touchmove', handleJoystickTouchMove, { passive: false });
    window.addEventListener('touchend', handleJoystickTouchEnd);
    window.addEventListener('touchcancel', handleJoystickTouchEnd);

    window.addEventListener('touchmove', handleLookTouchMove, { passive: false });
    window.addEventListener('touchend', handleLookTouchEnd);
    window.addEventListener('touchcancel', handleLookTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleJoystickTouchMove);
      window.removeEventListener('touchend', handleJoystickTouchEnd);
      window.removeEventListener('touchcancel', handleJoystickTouchEnd);

      window.removeEventListener('touchmove', handleLookTouchMove);
      window.removeEventListener('touchend', handleLookTouchEnd);
      window.removeEventListener('touchcancel', handleLookTouchEnd);
    };
  }, [handleJoystickTouchMove, handleJoystickTouchEnd, handleLookTouchMove, handleLookTouchEnd]);

  const toggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    touchInput.sprintPressed = next;
  };

  return (
    <div className="absolute inset-0 z-15 pointer-events-none select-none">
      {/* Right-half full drag look area */}
      <div
        onTouchStart={handleLookTouchStart}
        className="absolute top-0 right-0 w-3/5 h-full pointer-events-auto"
      />

      {/* Left side: Virtual Joystick */}
      <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          className={`w-36 h-36 sm:w-44 sm:h-44 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative touch-none transition-colors ${
            joystickActive ? 'border-white/30 bg-white/10' : ''
          }`}
        >
          {/* Label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-white/30 font-mono pointer-events-none">
            Move
          </div>

          {/* Knob */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border shadow-lg transition-transform pointer-events-none ${
              joystickActive
                ? 'bg-white/20 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/10 border-white/20'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right side: Action Floating Buttons with Pip Indicators */}
      <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 flex flex-col items-end gap-3 sm:gap-4 pointer-events-auto">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sprint Button */}
          <button
            onClick={toggleSprint}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-95 transition-transform ${
              isSprinting
                ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'text-white/40 hover:text-white/80'
            }`}
            title="Toggle Sprint"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Flashlight Button */}
          {hasFlashlight && (
            <button
              onClick={onToggleFlashlight}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-95 transition-transform ${
                flashlightOn
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'text-white/40 hover:text-white/80'
              }`}
              title="Toggle Flashlight"
            >
              <Flashlight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Primary Interact Button */}
          <button
            onClick={onInteract}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-900/20 backdrop-blur-2xl border border-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.15)] active:scale-95 transition-transform ${
              hasInteractTarget ? 'ring-2 ring-red-500/40 bg-red-900/30' : ''
            }`}
            title="Interact"
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                hasInteractTarget
                  ? 'border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'border-red-500/40 text-red-400'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-mono font-bold">
                Interact
              </span>
            </div>
          </button>
        </div>

        {/* Minimalist Pips Display */}
        <div className="flex gap-2 mr-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/20 bg-white/10" />
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/20 ${flashlightOn ? 'bg-amber-400/40 border-amber-300/60' : ''}`} />
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/20 ${hasInteractTarget ? 'bg-red-500/50 border-red-400' : ''}`} />
        </div>
      </div>
    </div>
  );
};
