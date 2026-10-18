/**
 * Retro 8-bit / 16-bit Web Audio Synthesizer
 * Generates instant authentic chiptune sound effects without any external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check localStorage for mute preference
    const saved = localStorage.getItem('pixel_grana_muted');
    if (saved !== null) {
      this.muted = saved === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('pixel_grana_muted', String(this.muted));
    if (!this.muted) {
      this.playBeep(440, 0.08, 'square');
    }
    return this.muted;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', startDelay: number = 0, gainLevel: number = 0.15) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime + startDelay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might fail on rapid interactions
    }
  }

  public playCoin(value: number = 1) {
    if (this.muted) return;
    if (value <= 2) {
      this.playTone(987.77, 0.08, 'square', 0, 0.12); // B5
      this.playTone(1318.51, 0.12, 'square', 0.06, 0.14); // E6
    } else if (value <= 10) {
      this.playTone(1174.66, 0.07, 'square', 0, 0.14); // D6
      this.playTone(1567.98, 0.14, 'square', 0.05, 0.16); // G6
    } else {
      this.playTone(1318.51, 0.06, 'square', 0, 0.15); // E6
      this.playTone(1760.0, 0.16, 'square', 0.05, 0.18); // A6
    }
  }

  public playBill() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Fast papery flutter
    this.playTone(784, 0.06, 'triangle', 0, 0.12);
    this.playTone(1046.5, 0.08, 'triangle', 0.04, 0.15);
    this.playTone(1318.5, 0.1, 'square', 0.08, 0.15);
  }

  public playMoneyBag() {
    if (this.muted) return;
    this.playTone(523.25, 0.08, 'square', 0, 0.18); // C5
    this.playTone(659.25, 0.08, 'square', 0.07, 0.18); // E5
    this.playTone(783.99, 0.08, 'square', 0.14, 0.2); // G5
    this.playTone(1046.5, 0.2, 'square', 0.21, 0.22); // C6
  }

  public playDiamond() {
    if (this.muted) return;
    // Sparkling chime
    [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, idx) => {
      this.playTone(freq, 0.15, 'triangle', idx * 0.04, 0.2);
    });
  }

  public playPowerup() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignored
    }
  }

  public playSlip() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignored
    }
  }

  public playTick(isUrgent: boolean = false) {
    if (this.muted) return;
    const freq = isUrgent ? 880 : 520;
    this.playTone(freq, 0.04, 'square', 0, isUrgent ? 0.12 : 0.08);
  }

  public playShopBuy() {
    if (this.muted) return;
    // Classic cash register "CHA-CHING!"
    this.playTone(987.77, 0.06, 'square', 0, 0.18);
    this.playTone(1318.51, 0.12, 'square', 0.06, 0.2);
    this.playTone(1760.0, 0.25, 'triangle', 0.12, 0.22);
  }

  public playEquip() {
    if (this.muted) return;
    this.playTone(440, 0.05, 'triangle', 0, 0.15);
    this.playTone(880, 0.08, 'square', 0.05, 0.15);
  }

  public playRoundOver() {
    if (this.muted) return;
    // End of 60s victory fanfare
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.15, t: 0.24 },
      { f: 1046.5, d: 0.4, t: 0.39 },
    ];
    notes.forEach((n) => {
      this.playTone(n.f, n.d, 'square', n.t, 0.2);
    });
  }

  public playBeep(freq = 440, duration = 0.1, type: OscillatorType = 'square') {
    this.playTone(freq, duration, type, 0, 0.15);
  }
}

export const sound = new SoundEngine();
