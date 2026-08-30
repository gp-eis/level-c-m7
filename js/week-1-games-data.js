window.LEVEL_C_WEEK_1_GAMES = Object.freeze([
  Object.freeze({
    id: 'dog-sitting',
    label: 'Dog sitting',
    phrase: 'Dog sitting.',
    sentence: 'The dog is sitting.',
    image: '../assets/images/games/speech-book/week-1/dog-sitting.webp'
  }),
  Object.freeze({
    id: 'cat-yawning',
    label: 'Cat yawning',
    phrase: 'Cat yawning.',
    sentence: 'The cat is yawning.',
    image: '../assets/images/games/speech-book/week-1/cat-yawning.webp'
  }),
  Object.freeze({
    id: 'deer-walking',
    label: 'Deer walking',
    phrase: 'Deer walking.',
    sentence: 'The deer is walking.',
    image: '../assets/images/games/speech-book/week-1/deer-walking.webp'
  }),
  Object.freeze({
    id: 'rabbit-jumping',
    label: 'Rabbit jumping',
    phrase: 'Rabbit jumping.',
    sentence: 'The rabbit is jumping.',
    image: '../assets/images/games/speech-book/week-1/rabbit-jumping.webp'
  }),
  Object.freeze({
    id: 'eagle-hunting',
    label: 'Eagle hunting',
    phrase: 'Eagle hunting.',
    sentence: 'The eagle is hunting.',
    image: '../assets/images/games/speech-book/week-1/eagle-hunting.webp'
  }),
  Object.freeze({
    id: 'swan-swimming',
    label: 'Swan swimming',
    phrase: 'Swan swimming.',
    sentence: 'The swan is swimming.',
    image: '../assets/images/games/speech-book/week-1/swan-swimming.webp'
  }),
  Object.freeze({
    id: 'bat-sleeping',
    label: 'Bat sleeping',
    phrase: 'Bat sleeping.',
    sentence: 'The bat is sleeping.',
    image: '../assets/images/games/speech-book/week-1/bat-sleeping.webp'
  }),
  Object.freeze({
    id: 'squirrel-playing',
    label: 'Squirrel playing',
    phrase: 'Squirrel playing.',
    sentence: 'The squirrel is playing.',
    image: '../assets/images/games/speech-book/week-1/squirrel-playing.webp'
  })
]);

window.LEVEL_C_GAMES = window.LEVEL_C_WEEK_1_GAMES;

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
    return Promise.resolve(speakAmericanEnglish(text, { rate: .86, pitch: 1.04 }));
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
