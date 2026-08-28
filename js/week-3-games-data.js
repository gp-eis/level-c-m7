window.LEVEL_C_WEEK_3_GAMES = Object.freeze([
  Object.freeze({
    id: 'pet-the-animals',
    label: 'Pet the animals',
    phrase: 'Pet the animals.',
    sentence: 'You should not pet the animals.',
    image: '../assets/images/week-3/games/jungle-rules/pet-the-animals.png'
  }),
  Object.freeze({
    id: 'watch-from-far-away',
    label: 'Watch from far away',
    phrase: 'Watch from far away.',
    sentence: 'You should watch from far away.',
    image: '../assets/images/week-3/games/jungle-rules/watch-from-far-away.png'
  }),
  Object.freeze({
    id: 'walk-carefully',
    label: 'Walk carefully',
    phrase: 'Walk carefully.',
    sentence: 'You should walk carefully.',
    image: '../assets/images/week-3/games/jungle-rules/walk-carefully.png'
  }),
  Object.freeze({
    id: 'feed-snacks-to-the-animals',
    label: 'Feed snacks to the animals',
    phrase: 'Feed snacks to the animals.',
    sentence: 'You should not feed snacks to the animals.',
    image: '../assets/images/week-3/games/jungle-rules/feed-snacks-to-the-animals.png'
  }),
  Object.freeze({
    id: 'listen-to-the-guide',
    label: 'Listen to the guide',
    phrase: 'Listen to the guide.',
    sentence: 'You should listen to the guide.',
    image: '../assets/images/week-3/games/jungle-rules/listen-to-the-guide.png'
  }),
  Object.freeze({
    id: 'throw-trash-on-the-ground',
    label: 'Throw trash on the ground',
    phrase: 'Throw trash on the ground.',
    sentence: 'You should not throw trash on the ground.',
    image: '../assets/images/week-3/games/jungle-rules/throw-trash-on-the-ground.png'
  }),
  Object.freeze({
    id: 'shout-and-scream',
    label: 'Shout and scream',
    phrase: 'Shout and scream.',
    sentence: 'You should not shout and scream.',
    image: '../assets/images/week-3/games/jungle-rules/shout-and-scream.png'
  }),
  Object.freeze({
    id: 'stay-on-the-path',
    label: 'Stay on the path',
    phrase: 'Stay on the path.',
    sentence: 'You should stay on the path.',
    image: '../assets/images/week-3/games/jungle-rules/stay-on-the-path.png'
  })
]);

window.LEVEL_C_GAMES = window.LEVEL_C_WEEK_3_GAMES;

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
