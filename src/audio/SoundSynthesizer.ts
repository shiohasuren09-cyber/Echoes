/**
 * Procedural Web Audio Sound Engine
 * Provides rich, zero-latency psychological horror audio without external audio file dependencies.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private masterGain: GainNode | null = null;
  
  // Continuous audio nodes
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private horrorDroneGain: GainNode | null = null;
  private crtGain: GainNode | null = null;
  
  // Loops & intervals
  private clockInterval: number | null = null;
  private musicBoxTimeout: number | null = null;
  private heartMonitorInterval: number | null = null;
  private whisperInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startRainAndStorm();
      this.startHorrorDrone();
      this.startClockTicking();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // --- AMBIENT DRONES ---

  private startRainAndStorm() {
    if (!this.ctx || !this.masterGain) return;

    // Buffer noise for rain against window
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Rain lowpass filter (muffled through glass)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  private startHorrorDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Deep psychological sub-bass drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(48, this.ctx.currentTime); // Low G
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(47.2, this.ctx.currentTime); // Subtle binaural beat

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, this.ctx.currentTime);

    this.horrorDroneGain = this.ctx.createGain();
    this.horrorDroneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.horrorDroneGain);
    this.horrorDroneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
  }

  public setHallucinationIntensity(intensity: number) {
    // intensity 0 to 1
    if (!this.ctx || !this.horrorDroneGain) return;
    const targetGain = 0.12 + intensity * 0.28;
    this.horrorDroneGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);

    if (intensity > 0.4 && !this.whisperInterval) {
      this.startWhispers();
    } else if (intensity <= 0.4 && this.whisperInterval) {
      clearInterval(this.whisperInterval);
      this.whisperInterval = null;
    }

    if (intensity > 0.65 && !this.heartMonitorInterval) {
      this.startHeartMonitor();
    } else if (intensity <= 0.65 && this.heartMonitorInterval) {
      clearInterval(this.heartMonitorInterval);
      this.heartMonitorInterval = null;
    }
  }

  private startClockTicking() {
    let tickTock = false;
    this.clockInterval = window.setInterval(() => {
      this.playClockTick(tickTock);
      tickTock = !tickTock;
    }, 1000);
  }

  private playClockTick(isTock: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isTock ? 420 : 540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isTock ? 600 : 780, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // --- SOUND EFFECTS ---

  public playFootstep() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = 70 + Math.random() * 25;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  public playFlashlightClick(turnOn: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(turnOn ? 1800 : 1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playThunder() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(25, this.ctx.currentTime + 2.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 3.2);
  }

  public playDoorCreak() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, this.ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(6, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.9);
  }

  public playItemPickup() {
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.26);
    });
  }

  // --- HALLUCINATIONS & DREAM SOUNDS ---

  public startHeartMonitor() {
    if (this.heartMonitorInterval) return;

    // Hospital ECG monitor beep: 1000Hz sine wave beep every 0.9s
    this.heartMonitorInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1020, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    }, 950);
  }

  public startWhispers() {
    if (this.whisperInterval) return;

    this.whisperInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || Math.random() > 0.6) return;

      // Filtered formant synthesis resembling distant whispers: "wake up...", "Leo..."
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sawtooth';
      const pitch = 130 + Math.random() * 80;
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750 + Math.random() * 600, this.ctx.currentTime);
      filter.Q.setValueAtTime(8, this.ctx.currentTime);

      if (pan) {
        pan.pan.setValueAtTime(Math.random() * 1.8 - 0.9, this.ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(filter);
      if (pan) {
        filter.connect(pan);
        pan.connect(gain);
      } else {
        filter.connect(gain);
      }
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    }, 3500);
  }

  public playMusicBoxNote(freq: number) {
    if (!this.ctx || !this.masterGain) return;

    // Plucked metal tine sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Harmonic ring
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.95);
  }

  public playLullabyMelody() {
    // Notes of a haunting childhood melody (in minor key)
    const melody = [
      { f: 659.25, d: 0.0 }, // E5
      { f: 587.33, d: 0.5 }, // D5
      { f: 523.25, d: 1.0 }, // C5
      { f: 493.88, d: 1.5 }, // B4
      { f: 440.00, d: 2.0 }, // A4
      { f: 493.88, d: 2.5 }, // B4
      { f: 523.25, d: 3.0 }, // C5
      { f: 392.00, d: 3.8 }, // G4
    ];

    melody.forEach((note) => {
      setTimeout(() => {
        this.playMusicBoxNote(note.f);
      }, note.d * 1000);
    });
  }

  public playPhoneRing() {
    if (!this.ctx || !this.masterGain) return;

    // Vintage dual-bell electromagnetic telephone ringer (440Hz + 480Hz bell clash)
    const ringDur = 1.6;
    for (let burst = 0; burst < 2; burst++) {
      const startTime = this.ctx.currentTime + burst * 0.45;
      [440, 480].forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    }
  }

  public playRadiatorHiss() {
    if (!this.ctx || !this.masterGain) return;

    // High pressure steam release hiss through radiator valve
    const dur = 1.8;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.ctx.currentTime + dur + 0.1);
  }

  public playElectricSpark() {
    if (!this.ctx || !this.masterGain) return;

    // Sharp buzzing crackle of an electrical short or arcing fuse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime); // 60Hz mains hum base
    osc.frequency.linearRampToValueAtTime(800 + Math.random() * 1200, this.ctx.currentTime + 0.03);
    osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playFaucetDrip() {
    if (!this.ctx || !this.masterGain) return;

    // Resonant water drop ping in porcelain basin
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  public playGramophoneMelody() {
    // A melancholy, slightly warped 1930s gramophone melody with flutter
    const notes = [
      { f: 392.00, d: 0.0 }, // G4
      { f: 440.00, d: 0.4 }, // A4
      { f: 466.16, d: 0.8 }, // Bb4
      { f: 587.33, d: 1.3 }, // D5
      { f: 523.25, d: 1.8 }, // C5
      { f: 466.16, d: 2.3 }, // Bb4
      { f: 440.00, d: 2.8 }, // A4
      { f: 392.00, d: 3.4 }, // G4
    ];

    notes.forEach((note) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        // Slight pitch wobble for aged 78-RPM vinyl effect
        osc.frequency.setValueAtTime(note.f * 1.01, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(note.f * 0.99, this.ctx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(note.f, this.ctx.currentTime + 0.4);

        // Gramophone horn acoustic bandpass (reedy telephone/horn resonance)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.2, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
      }, note.d * 1000);
    });
  }

  public playAwakeningResolution() {
    if (!this.ctx || !this.masterGain) return;

    // Warm, emotional major chords (F major -> C major) marking waking from nightmare into reality
    const freqs = [261.63, 329.63, 392.00, 523.25]; // C major chord
    freqs.forEach((f) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 6.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 6.5);
    });
  }

  public destroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.heartMonitorInterval) clearInterval(this.heartMonitorInterval);
    if (this.whisperInterval) clearInterval(this.whisperInterval);
    if (this.musicBoxTimeout) clearTimeout(this.musicBoxTimeout);
    this.stopMemoryFragmentAudio();

    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
  }

  // --- MEMORY FRAGMENT PSYCHOLOGICAL AUDIO CLIPS ---

  private activeFragmentNodes: { stop: () => void }[] = [];

  public stopMemoryFragmentAudio() {
    this.activeFragmentNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore already stopped
      }
    });
    this.activeFragmentNodes = [];
  }

  /**
   * Resonant crystalline chime triggered whenever a memory fragment is collected or inspected
   */
  public playFragmentChime() {
    if (!this.ctx || !this.masterGain) return;

    // Harmonic bell chime chords (F# minor ethereal)
    const bellTones = [739.99, 880.0, 1108.73, 1479.98, 2217.46];
    bellTones.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const delay = idx * 0.04;
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.09 / (idx + 1), this.ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 2.6);
    });
  }

  /**
   * Plays the specific distorted psychological audio memory corresponding to the fragment
   */
  public playMemoryFragmentAudio(
    type: 'telemetry_ventilator' | 'cassette_recording' | 'pill_whisper' | 'warped_lullaby' | 'polaroid_shutter'
  ) {
    if (!this.ctx || !this.masterGain) return;
    this.stopMemoryFragmentAudio();

    const now = this.ctx.currentTime;

    switch (type) {
      case 'telemetry_ventilator': {
        // 1. Ventilator cycling (filtered white noise swell in / swell out)
        const bufferSize = this.ctx.sampleRate * 3;
        const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        // Cyclic breathing modulation
        filter.frequency.linearRampToValueAtTime(850, now + 1.2);
        filter.frequency.linearRampToValueAtTime(300, now + 2.4);

        const vGain = this.ctx.createGain();
        vGain.gain.setValueAtTime(0.01, now);
        vGain.gain.linearRampToValueAtTime(0.18, now + 1.0);
        vGain.gain.linearRampToValueAtTime(0.04, now + 2.2);
        vGain.gain.linearRampToValueAtTime(0.0001, now + 4.5);

        noiseSrc.connect(filter);
        filter.connect(vGain);
        vGain.connect(this.masterGain);
        noiseSrc.start(now);
        noiseSrc.stop(now + 4.6);

        // 2. Muffled telemetry beeps (ICU monitor: 880 Hz with feedback)
        [0.4, 1.6, 2.8].forEach((timeOffset) => {
          if (!this.ctx || !this.masterGain) return;
          const beep = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          beep.type = 'sine';
          beep.frequency.setValueAtTime(880, now + timeOffset);

          bGain.gain.setValueAtTime(0.0001, now + timeOffset);
          bGain.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.01);
          bGain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.28);

          beep.connect(bGain);
          bGain.connect(this.masterGain);
          beep.start(now + timeOffset);
          beep.stop(now + timeOffset + 0.3);
        });

        this.activeFragmentNodes.push({
          stop: () => {
            try {
              noiseSrc.stop();
            } catch {}
          },
        });
        break;
      }

      case 'cassette_recording': {
        // Cassette tape hiss + wow & flutter pitch wobble + filtered voice formant
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const bandpass = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Speech formant frequencies (~220Hz fundamental with phoneme filtering)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);

        // Wow & flutter tape warble
        lfo.frequency.setValueAtTime(4.5, now);
        lfoGain.gain.setValueAtTime(14, now);
        lfo.connect(osc.frequency);

        // Bandpass filter to simulate 1990s telephone/dictaphone
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1100, now);
        bandpass.Q.setValueAtTime(3.0, now);

        // Pitch shift sweep mimicking speech inflection
        osc.frequency.linearRampToValueAtTime(185, now + 0.8);
        osc.frequency.linearRampToValueAtTime(140, now + 1.8);
        osc.frequency.linearRampToValueAtTime(200, now + 2.8);
        osc.frequency.linearRampToValueAtTime(130, now + 3.8);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        lfo.start(now);
        osc.stop(now + 4.3);
        lfo.stop(now + 4.3);

        this.activeFragmentNodes.push({
          stop: () => {
            try {
              osc.stop();
              lfo.stop();
            } catch {}
          },
        });
        break;
      }

      case 'pill_whisper': {
        // Rattling pills in bottle + deep resonant drone + ghostly acoustic whispering
        const drone = this.ctx.createOscillator();
        const dGain = this.ctx.createGain();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(73.42, now); // D2 low drone

        dGain.gain.setValueAtTime(0.001, now);
        dGain.gain.linearRampToValueAtTime(0.15, now + 0.5);
        dGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

        drone.connect(dGain);
        dGain.connect(this.masterGain);
        drone.start(now);
        drone.stop(now + 4.1);

        // Shaking plastic pill taps
        [0.1, 0.22, 0.38, 0.55, 0.7, 1.2, 1.35, 1.8].forEach((offset) => {
          if (!this.ctx || !this.masterGain) return;
          const click = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();
          click.type = 'triangle';
          click.frequency.setValueAtTime(600 + Math.random() * 400, now + offset);

          cGain.gain.setValueAtTime(0.09, now + offset);
          cGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.04);

          click.connect(cGain);
          cGain.connect(this.masterGain);
          click.start(now + offset);
          click.stop(now + offset + 0.05);
        });

        this.activeFragmentNodes.push({
          stop: () => {
            try {
              drone.stop();
            } catch {}
          },
        });
        break;
      }

      case 'warped_lullaby': {
        // Slowed down, haunting minor key music box with pitch decay
        const notes = [
          { f: 523.25, t: 0.1 }, // C5
          { f: 493.88, t: 0.7 }, // B4
          { f: 415.3, t: 1.4 },  // Ab4
          { f: 392.0, t: 2.1 },  // G4
          { f: 329.63, t: 2.9 }, // E4 (distorted pitch droop)
        ];

        notes.forEach((n) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f, now + n.t);
          // Tape slowdown droop on final note
          if (n.t > 2.5) {
            osc.frequency.exponentialRampToValueAtTime(220, now + n.t + 1.2);
          }

          gain.gain.setValueAtTime(0.0001, now + n.t);
          gain.gain.linearRampToValueAtTime(0.12, now + n.t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + 1.2);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + n.t);
          osc.stop(now + n.t + 1.3);

          this.activeFragmentNodes.push({
            stop: () => {
              try {
                osc.stop();
              } catch {}
            },
          });
        });
        break;
      }

      case 'polaroid_shutter': {
        // Camera shutter click + spring motor whir + waking dream chord
        const clickNoise = this.ctx.createBufferSource();
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
        clickNoise.buffer = buf;

        const cFilter = this.ctx.createBiquadFilter();
        cFilter.type = 'highpass';
        cFilter.frequency.setValueAtTime(1400, now);

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.25, now);
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        clickNoise.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(this.masterGain);
        clickNoise.start(now);

        // Dream swell chord
        const dreamFreqs = [220.0, 329.63, 440.0, 554.37];
        dreamFreqs.forEach((f) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + 0.2);

          gain.gain.setValueAtTime(0.0001, now + 0.2);
          gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + 0.2);
          osc.stop(now + 4.3);

          this.activeFragmentNodes.push({
            stop: () => {
              try {
                osc.stop();
              } catch {}
            },
          });
        });
        break;
      }
    }
  }
}

export const soundManager = new SoundSynthesizer();
