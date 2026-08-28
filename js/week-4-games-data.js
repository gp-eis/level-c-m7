window.LEVEL_C_WEEK_4_GAMES = Object.freeze([
  Object.freeze({
    id: 'run-after-birds',
    label: 'Run after birds',
    phrase: 'Run after birds.',
    sentence: 'You should not run after birds.',
    image: '../assets/images/week-4/games/park-rules/run-after-birds.png'
  }),
  Object.freeze({
    id: 'take-photos-of-birds',
    label: 'Take photos of birds',
    phrase: 'Take photos of birds.',
    sentence: 'You should take photos of birds.',
    image: '../assets/images/week-4/games/park-rules/take-photos-of-birds.png'
  }),
  Object.freeze({
    id: 'walk-quietly',
    label: 'Walk quietly',
    phrase: 'Walk quietly.',
    sentence: 'You should walk quietly.',
    image: '../assets/images/week-4/games/park-rules/walk-quietly.png'
  }),
  Object.freeze({
    id: 'leave-food-on-tables',
    label: 'Leave food on tables',
    phrase: 'Leave food on tables.',
    sentence: 'You should not leave food on tables.',
    image: '../assets/images/week-4/games/park-rules/leave-food-on-tables.png'
  }),
  Object.freeze({
    id: 'use-binoculars-to-watch-birds',
    label: 'Use binoculars to watch birds',
    phrase: 'Use binoculars to watch birds.',
    sentence: 'You should use binoculars to watch birds.',
    image: '../assets/images/week-4/games/park-rules/use-binoculars-to-watch-birds.png'
  }),
  Object.freeze({
    id: 'touch-bird-nests',
    label: 'Touch bird nests',
    phrase: 'Touch bird nests.',
    sentence: 'You should not touch bird nests.',
    image: '../assets/images/week-4/games/park-rules/touch-bird-nests.png'
  }),
  Object.freeze({
    id: 'take-bird-eggs-home',
    label: 'Take bird eggs home',
    phrase: 'Take bird eggs home.',
    sentence: 'You should not take bird eggs home.',
    image: '../assets/images/week-4/games/park-rules/take-bird-eggs-home.png'
  }),
  Object.freeze({
    id: 'put-trash-in-bins',
    label: 'Put trash in bins',
    phrase: 'Put trash in bins.',
    sentence: 'You should put trash in bins.',
    image: '../assets/images/week-4/games/park-rules/put-trash-in-bins.png'
  })
]);

window.LEVEL_C_GAMES = window.LEVEL_C_WEEK_4_GAMES;

window.LevelCGameHelpers = Object.freeze({
  shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  },
  delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  },
  speak(text) {
    if (typeof speakAmericanEnglish !== 'function') return Promise.resolve();
    const maximumWait = Math.min(6500, Math.max(2500, text.length * 100));
    return Promise.race([
      Promise.resolve(speakAmericanEnglish(text, { rate: .86, pitch: 1.04 })),
      new Promise((resolve) => window.setTimeout(resolve, maximumWait))
    ]);
  },
  correctSound() {
    if (typeof playTone !== 'function') return;
    playTone(523.25, .12, .15, 'sine');
    playTone(659.25, .12, .15, 'sine', .08);
    playTone(783.99, .18, .17, 'sine', .16);
  },
  wrongSound() {
    if (typeof playTone !== 'function') return;
    playTone(220, .14, .07, 'sawtooth');
    playTone(175, .18, .065, 'sawtooth', .1);
  }
});
