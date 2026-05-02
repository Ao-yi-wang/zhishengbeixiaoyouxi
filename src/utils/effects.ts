import confetti from 'canvas-confetti';

export const triggerFireworks = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults, particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#dc2626']
    });
    confetti({
      ...defaults, particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#dc2626']
    });
  }, 250);
};

export const playBambooDropSound = (soundEnabled: boolean, customAudioUrl?: string | null) => {
  if (!soundEnabled) return;

  const playGeneratedSound = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playClack = (time: number, pitch: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, time);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, time + 0.05);
      
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.05);

      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = pitch * 1.2;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(vol, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noise.start(time);
      noise.stop(time + 0.04);
    };

    const t = ctx.currentTime;
    // Impact sounds (bamboo on cement: very fast, high pitched, crisp)
    playClack(t, 2200, 1.0);
    playClack(t + 0.03, 2400, 0.9);
    
    // Quick bounces, cement makes them stop fast
    playClack(t + 0.12, 2300, 0.4);
    playClack(t + 0.17, 2500, 0.25);
    
    // Minor settle
    playClack(t + 0.23, 2400, 0.1);
    playClack(t + 0.27, 2600, 0.05);
  };

  const audioUrlToPlay = customAudioUrl || '/sound.mp3';
  const audio = new Audio(audioUrlToPlay);
  
  audio.play().catch(e => {
    // If the file is not found (404) or cannot be played, fallback to synthetic sound
    if (!customAudioUrl) {
       // console.log("External audio not found, falling back to generated sound.");
       playGeneratedSound();
    } else {
       console.error("Failed to play custom audio", e);
    }
  });
};
