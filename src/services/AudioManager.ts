export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Record<string, AudioBuffer> = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async loadSound(name: string, url: string) {
    if (!this.audioContext) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
    } catch (e) {
      console.error(`Failed to load sound: ${name}`, e);
    }
  }

  public play(name: string, volume: number = 0.5) {
    if (!this.audioContext || !this.sounds[name]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  // Helper for common casino sounds using synthesized tones if files aren't available
  public playSynthesized(type: 'chip' | 'card' | 'win' | 'click' | 'welcome' | 'tudum') {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'welcome':
        // Warm rising chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = this.audioContext!.createOscillator();
          const g = this.audioContext!.createGain();
          o.connect(g);
          g.connect(this.audioContext!.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.15);
          g.gain.setValueAtTime(0, now + i * 0.15);
          g.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 1.5);
          o.start(now + i * 0.15);
          o.stop(now + i * 0.15 + 1.5);
        });
        break;
      case 'tudum':
        // Low bass hit + metallic impact
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bassOsc.connect(bassGain);
        bassGain.connect(this.audioContext.destination);
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(60, now);
        bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        bassGain.gain.setValueAtTime(0.6, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        bassOsc.start(now);
        bassOsc.stop(now + 0.8);

        const metalOsc = this.audioContext.createOscillator();
        const metalGain = this.audioContext.createGain();
        metalOsc.connect(metalGain);
        metalGain.connect(this.audioContext.destination);
        metalOsc.type = 'square';
        metalOsc.frequency.setValueAtTime(400, now);
        metalOsc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        metalGain.gain.setValueAtTime(0.1, now);
        metalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        metalOsc.start(now);
        metalOsc.stop(now + 0.3);
        break;
      case 'chip':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'card':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'win':
        [440, 554.37, 659.25].forEach((freq, i) => {
          const o = this.audioContext!.createOscillator();
          const g = this.audioContext!.createGain();
          o.connect(g);
          g.connect(this.audioContext!.destination);
          o.frequency.setValueAtTime(freq, now + i * 0.1);
          g.gain.setValueAtTime(0.2, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.5);
        });
        break;
      case 'click':
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
        break;
    }
  }
}
