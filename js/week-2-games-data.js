window.LEVEL_C_WEEK_2_GAMES = Object.freeze([
  Object.freeze({
    id: 'green-grass',
    label: 'Green grass',
    phrase: 'Green grass.',
    sentence: 'We can find green grass.',
    image: '../assets/images/games/speech-book/week-2/green-grass.webp'
  }),
  Object.freeze({
    id: 'brown-ant',
    label: 'Brown ant',
    phrase: 'A brown ant.',
    sentence: 'We can find a brown ant.',
    image: '../assets/images/games/speech-book/week-2/brown-ant.webp'
  }),
  Object.freeze({
    id: 'pink-lotus-flower',
    label: 'Pink lotus flower',
    phrase: 'A pink lotus flower.',
    sentence: 'We can find a pink lotus flower.',
    image: '../assets/images/games/speech-book/week-2/pink-lotus-flower.webp'
  }),
  Object.freeze({
    id: 'red-ladybug',
    label: 'Red ladybug',
    phrase: 'A red ladybug.',
    sentence: 'We can find a red ladybug.',
    image: '../assets/images/games/speech-book/week-2/red-ladybug.webp'
  }),
  Object.freeze({
    id: 'tall-fence',
    label: 'Tall fence',
    phrase: 'A tall fence.',
    sentence: 'I found a tall fence.',
    image: '../assets/images/games/speech-book/week-2/tall-fence.webp'
  }),
  Object.freeze({
    id: 'big-tree',
    label: 'Big tree',
    phrase: 'A big tree.',
    sentence: 'I found a big tree.',
    image: '../assets/images/games/speech-book/week-2/big-tree.webp'
  }),
  Object.freeze({
    id: 'short-cactus',
    label: 'Short cactus',
    phrase: 'A short cactus.',
    sentence: 'I found a short cactus.',
    image: '../assets/images/games/speech-book/week-2/short-cactus.webp'
  }),
  Object.freeze({
    id: 'small-snail',
    label: 'Small snail',
    phrase: 'A small snail.',
    sentence: 'I found a small snail.',
    image: '../assets/images/games/speech-book/week-2/small-snail.webp'
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
