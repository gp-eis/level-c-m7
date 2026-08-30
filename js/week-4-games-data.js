window.LEVEL_C_WEEK_4_GAMES = Object.freeze([
  Object.freeze({
    id: 'dark-cave',
    label: 'Dark cave',
    phrase: 'A dark cave.',
    sentence: 'The cave is dark.',
    image: '../assets/images/games/speech-book/week-4/dark-cave.webp'
  }),
  Object.freeze({
    id: 'monster',
    label: 'Monster',
    phrase: 'The monster.',
    sentence: 'I am scared of the monster.',
    image: '../assets/images/games/speech-book/week-4/scared-of-monster.webp'
  }),
  Object.freeze({
    id: 'skeletons',
    label: 'Skeletons',
    phrase: 'The skeletons.',
    sentence: 'I am scared of the skeletons.',
    image: '../assets/images/games/speech-book/week-4/scared-of-skeletons.webp'
  }),
  Object.freeze({
    id: 'bats',
    label: 'Bats',
    phrase: 'The bats.',
    sentence: 'I am scared of the bats.',
    image: '../assets/images/games/speech-book/week-4/scared-of-bats.webp'
  }),
  Object.freeze({
    id: 'spiders',
    label: 'Spiders',
    phrase: 'The spiders.',
    sentence: 'I am scared of the spiders.',
    image: '../assets/images/games/speech-book/week-4/scared-of-spiders.webp'
  }),
  Object.freeze({
    id: 'orange-pumpkin',
    label: 'Orange pumpkin',
    phrase: 'An orange pumpkin.',
    sentence: 'An orange pumpkin is scary.',
    image: '../assets/images/games/speech-book/week-4/orange-pumpkin.webp'
  }),
  Object.freeze({
    id: 'black-bug',
    label: 'Black bug',
    phrase: 'A black bug.',
    sentence: 'A black bug is scary.',
    image: '../assets/images/games/speech-book/week-4/black-bug.webp'
  }),
  Object.freeze({
    id: 'gray-rat',
    label: 'Gray rat',
    phrase: 'A gray rat.',
    sentence: 'A gray rat is scary.',
    image: '../assets/images/games/speech-book/week-4/gray-rat.webp'
  }),
  Object.freeze({
    id: 'white-ghost',
    label: 'White ghost',
    phrase: 'A white ghost.',
    sentence: 'A white ghost is scary.',
    image: '../assets/images/games/speech-book/week-4/white-ghost.webp'
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
