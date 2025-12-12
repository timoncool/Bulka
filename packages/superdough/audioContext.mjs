let audioContext;

export const setDefaultAudioContext = () => {
  // Use 48000 Hz to match the SAMPLE_RATE constant in dough.mjs
  // This prevents playback speed issues when sample rates don't match
  audioContext = new AudioContext({ sampleRate: 48000 });
  return audioContext;
};

export const getAudioContext = () => {
  if (!audioContext) {
    return setDefaultAudioContext();
  }

  return audioContext;
};

export function getAudioContextCurrentTime() {
  return getAudioContext().currentTime;
}
