window.LEVEL_C_WEEK_2_GAMES = Object.freeze([
  Object.freeze({
    id: 'squash-bugs',
    label: 'Squash bugs',
    phrase: 'Squash bugs.',
    sentence: 'You should not squash bugs.',
    image: '../assets/images/week-2/games/garden-rules/squash-bugs.png'
  }),
  Object.freeze({
    id: 'plant-flowers',
    label: 'Plant flowers',
    phrase: 'Plant flowers.',
    sentence: 'You should plant flowers.',
    image: '../assets/images/week-2/games/garden-rules/plant-flowers.png'
  }),
  Object.freeze({
    id: 'pull-out-weeds',
    label: 'Pull out weeds',
    phrase: 'Pull out weeds.',
    sentence: 'You should pull out weeds.',
    image: '../assets/images/week-2/games/garden-rules/pull-out-weeds.png'
  }),
  Object.freeze({
    id: 'feed-birds',
    label: 'Feed birds',
    phrase: 'Feed birds.',
    sentence: 'You should feed birds.',
    image: '../assets/images/week-2/games/garden-rules/feed-birds.png'
  }),
  Object.freeze({
    id: 'climb-fences',
    label: 'Climb fences',
    phrase: 'Climb fences.',
    sentence: 'You should not climb fences.',
    image: '../assets/images/week-2/games/garden-rules/climb-fences.png'
  }),
  Object.freeze({
    id: 'set-traps',
    label: 'Set traps',
    phrase: 'Set traps.',
    sentence: 'You should not set traps.',
    image: '../assets/images/week-2/games/garden-rules/set-traps.png'
  }),
  Object.freeze({
    id: 'break-flower-pots',
    label: 'Break flower pots',
    phrase: 'Break flower pots.',
    sentence: 'You should not break flower pots.',
    image: '../assets/images/week-2/games/garden-rules/break-flower-pots.png'
  }),
  Object.freeze({
    id: 'water-the-flowers',
    label: 'Water the flowers',
    phrase: 'Water the flowers.',
    sentence: 'You should water the flowers.',
    image: '../assets/images/week-2/games/garden-rules/water-the-flowers.png'
  })
]);

window.LEVEL_C_GAMES = window.LEVEL_C_WEEK_2_GAMES;

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
