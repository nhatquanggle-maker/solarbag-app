// Web Audio API Sound Synthesizer for SolarBag IoT & Emergency Sirens

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic 3-tone BLE locator chime (BEEP-BEEP-BEEP)
 */
export function playChimeSound() {
  try {
    const ctx = getAudioContext();
    const frequencies = [1760, 2637, 3520]; // A6, E7, A7
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.12);
    });
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

/**
 * Start pulsing emergency distress siren for Fall countdown and Panic SOS
 */
export function startSirenSound() {
  stopSirenSound();
  try {
    const ctx = getAudioContext();
    sirenOscillator = ctx.createOscillator();
    sirenGain = ctx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.3, ctx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    let high = true;
    sirenOscillator.frequency.setValueAtTime(880, ctx.currentTime);
    sirenOscillator.start();

    sirenInterval = window.setInterval(() => {
      if (!sirenOscillator || !audioCtx) return;
      high = !high;
      sirenOscillator.frequency.setTargetAtTime(high ? 1100 : 700, audioCtx.currentTime, 0.05);
    }, 250);
  } catch (err) {
    console.warn('Siren play failed:', err);
  }
}

/**
 * Stop emergency siren
 */
export function stopSirenSound() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch {
      // ignore
    }
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch {
      // ignore
    }
    sirenGain = null;
  }
}

/**
 * Play gentle confirmation tick
 */
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore
  }
}

