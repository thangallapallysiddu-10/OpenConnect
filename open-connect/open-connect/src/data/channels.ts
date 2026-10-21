export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Spanish', 'French'];

export const ALL_CHANNELS = Array.from({ length: 100 }, (_, i) => {
  const chNum = i + 1;
  const freq = 200.001 + i * 0.001;
  return {
    channelNumber: chNum,
    frequency: freq,
    frequencyStr: `MM ${freq.toFixed(3)}`,
    name: `Live Broadcast - Channel ${chNum}`,
    language: LANGUAGES[i % LANGUAGES.length],
  };
});
