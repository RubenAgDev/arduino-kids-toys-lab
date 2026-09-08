/**
 * Web Audio API synthesizer modeling an Arduino passive piezo buzzer (tone())
 * and crash sound effects.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBuzzerTone(frequency: number, durationMs: number = 50, volume: number = 0.2): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Square wave sounds remarkably identical to an Arduino digital buzzer / tone()
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Gracefully handle browser autoplay blocks
  }
}

export function playCrashSoundEffect(volume: number = 0.3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Exact 3 repeats of the sound as requested!
    for (let i = 0; i < 3; i++) {
      // First tone of the blast (2000Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(2000, now + i * 0.6);
      gain1.gain.setValueAtTime(volume * 0.4, now + i * 0.6);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.6 + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now + i * 0.6);
      osc1.stop(now + i * 0.6 + 0.3);

      // Second tone of the blast (1200Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1200, now + i * 0.6 + 0.3);
      gain2.gain.setValueAtTime(volume * 0.4, now + i * 0.6 + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.6 + 0.58);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + i * 0.6 + 0.3);
      osc2.stop(now + i * 0.6 + 0.6);
    }
  } catch {
    // Fail silently if audio context is blocked
  }
}
