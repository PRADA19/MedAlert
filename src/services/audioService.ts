import { SoundPreset } from '../types/settings';

class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private volume: number = 0.8;
  private currentPreset: SoundPreset = 'gentle_bell';

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): boolean {
    const ctx = this.initContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx.state === 'running';
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setPreset(preset: SoundPreset) {
    this.currentPreset = preset;
  }

  public playAlarm(preset: SoundPreset = this.currentPreset, volume: number = this.volume) {
    this.stopAlarm();
    const ctx = this.initContext();
    if (!ctx) return;
    
    this.isPlaying = true;
    this.currentPreset = preset;
    this.volume = volume;

    const playSequence = () => {
      if (!this.isPlaying || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      switch (this.currentPreset) {
        case 'classic_alarm':
          this.playClassicBeepPattern();
          this.timerId = window.setTimeout(playSequence, 1200);
          break;
        case 'soft_chime':
          this.playSoftChimePattern();
          this.timerId = window.setTimeout(playSequence, 2000);
          break;
        case 'gentle_bell':
        default:
          this.playGentleBellPattern();
          this.timerId = window.setTimeout(playSequence, 1800);
          break;
      }
    };

    playSequence();
  }

  public stopAlarm() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public testSound(preset: SoundPreset, volume: number = 0.8) {
    this.stopAlarm();
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isPlaying = true;
    this.currentPreset = preset;
    this.volume = volume;

    switch (preset) {
      case 'classic_alarm':
        this.playClassicBeepPattern();
        break;
      case 'soft_chime':
        this.playSoftChimePattern();
        break;
      case 'gentle_bell':
      default:
        this.playGentleBellPattern();
        break;
    }

    setTimeout(() => {
      this.stopAlarm();
    }, 2500);
  }

  // --- Sound Preset Implementations ---

  private playGentleBellPattern() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.2);

      const startTime = now + index * 0.2;
      const duration = 0.8;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3 * this.volume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  private playClassicBeepPattern() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const beeps = [880, 880, 880]; // A5 tone

    beeps.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + index * 0.25);

      const startTime = now + index * 0.25;
      const duration = 0.15;

      gain.gain.setValueAtTime(0.15 * this.volume, startTime);
      gain.gain.setValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  private playSoftChimePattern() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.18);

      const startTime = now + index * 0.18;
      const duration = 0.9;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25 * this.volume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}

export const audioService = new AudioService();
