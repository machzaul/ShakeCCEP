import { GAME_CONFIG } from '@/config/gameConfig';

class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = GAME_CONFIG.audioEnabled;
  private masterVolume: number = GAME_CONFIG.masterVolume;
  private lastShakeSoundTime: number = 0;
  private flightOscillator: OscillatorNode | null = null;
  private flightGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.flightGain) {
      this.flightGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Button click / UI select
   */
  public playButtonClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Countdown beeps for 3, 2, 1
   */
  public playCountdownBeep(count: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = count === 1 ? 660 : count === 2 ? 550 : 440;
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * GO! celebratory sound
   */
  public playCountdownGo() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C major chord arpeggio
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      gain.gain.setValueAtTime(this.masterVolume * 0.35, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.45);
    });
  }

  /**
   * Physical shake feedback with rate limiting and frequency scaling based on charge
   */
  public playShakeFeedback(energyPercent: number = 0) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Rate-limit to prevent sound cacophony during high-frequency shakes
    const nowMs = Date.now();
    if (nowMs - this.lastShakeSoundTime < 80) return;
    this.lastShakeSoundTime = nowMs;

    const now = this.ctx.currentTime;

    // Dynamic pitch rising with bottle energy (250Hz - 600Hz)
    const baseFreq = 220 + (energyPercent / 100) * 380;

    // Carbonation pop + swoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 0.8, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.06);

    gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    // Fizz noise burst
    try {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000 + energyPercent * 20, now);
      filter.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(this.masterVolume * 0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.06);
    } catch {
      // Audio buffer fallback
    }
  }

  /**
   * Jetpack launch blast
   */
  public playJetpackLaunch() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Powerful low-frequency rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  /**
   * Continuous jetpack flight sound loop
   */
  public startFlightLoop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopFlightLoop();

    const now = this.ctx.currentTime;
    this.flightOscillator = this.ctx.createOscillator();
    this.flightGain = this.ctx.createGain();

    this.flightOscillator.type = 'triangle';
    this.flightOscillator.frequency.setValueAtTime(260, now);

    this.flightGain.gain.setValueAtTime(0.01, now);
    this.flightGain.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + 0.4);

    this.flightOscillator.connect(this.flightGain);
    this.flightGain.connect(this.ctx.destination);

    this.flightOscillator.start(now);
  }

  public stopFlightLoop() {
    if (this.flightOscillator && this.flightGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.flightGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        this.flightOscillator.stop(now + 0.35);
      } catch {
        // cleanup
      }
      this.flightOscillator = null;
      this.flightGain = null;
    }
  }

  /**
   * Result fanfare
   */
  public playResultFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopFlightLoop();
    const now = this.ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.15, offset: 0 },    // C5
      { f: 659.25, d: 0.15, offset: 0.15 }, // E5
      { f: 783.99, d: 0.15, offset: 0.3 },  // G5
      { f: 1046.5, d: 0.45, offset: 0.45 }, // C6
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.offset);
      gain.gain.setValueAtTime(this.masterVolume * 0.3, now + n.offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.offset + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.offset);
      osc.stop(now + n.offset + n.d + 0.05);
    });
  }
}

export const audioManager = new AudioManager();

