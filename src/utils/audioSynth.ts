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

    // Siren bursts (Phase 1)
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 1800 : 1200, now + i * 0.05);
      gain.gain.setValueAtTime(volume * 0.3, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + (i + 1) * 0.05);
    }

    // Heavy crash impact rumble (Phase 2)
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(280, now + 0.3);
    rumbleOsc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    rumbleGain.gain.setValueAtTime(volume * 0.5, now + 0.3);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    rumbleOsc.start(now + 0.3);
    rumbleOsc.stop(now + 1.2);

    // Crunch noise buffer
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.0);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.4, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.3);
  } catch {
    // Fail silently if audio context is blocked
  }
}
