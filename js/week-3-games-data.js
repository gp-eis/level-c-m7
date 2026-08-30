window.LEVEL_C_WEEK_3_GAMES = Object.freeze([
  Object.freeze({
    id: 'gray-moon',
    label: 'Gray moon',
    phrase: 'The gray moon.',
    sentence: "It's barking at the gray moon.",
    image: '../assets/images/games/speech-book/week-3/barking-gray-moon.webp'
  }),
  Object.freeze({
    id: 'purple-scooter',
    label: 'Purple scooter',
    phrase: 'The purple scooter.',
    sentence: "It's barking at the purple scooter.",
    image: '../assets/images/games/speech-book/week-3/barking-purple-scooter.webp'
  }),
  Object.freeze({
    id: 'brown-owl',
    label: 'Brown owl',
    phrase: 'The brown owl.',
    sentence: "It's barking at the brown owl.",
    image: '../assets/images/games/speech-book/week-3/barking-brown-owl.webp'
  }),
  Object.freeze({
    id: 'blue-car',
    label: 'Blue car',
    phrase: 'The blue car.',
    sentence: "It's barking at the blue car.",
    image: '../assets/images/games/speech-book/week-3/barking-blue-car.webp'
  }),
  Object.freeze({
    id: 'boy-on-scooter',
    label: 'Boy on scooter',
    phrase: 'Boy on scooter.',
    sentence: 'The boy is on the scooter.',
    image: '../assets/images/games/speech-book/week-3/boy-on-scooter.webp'
  }),
  Object.freeze({
    id: 'moon-above-tree',
    label: 'Moon above tree',
    phrase: 'Moon above tree.',
    sentence: 'The moon is above the tree.',
    image: '../assets/images/games/speech-book/week-3/moon-above-tree.webp'
  }),
  Object.freeze({
    id: 'cat-under-car',
    label: 'Cat under car',
    phrase: 'Cat under car.',
    sentence: 'The cat is under the car.',
    image: '../assets/images/games/speech-book/week-3/cat-under-car.webp'
  }),
  Object.freeze({
    id: 'rabbit-behind-dog',
    label: 'Rabbit behind dog',
    phrase: 'Rabbit behind dog.',
    sentence: 'The rabbit is behind the dog.',
    image: '../assets/images/games/speech-book/week-3/rabbit-behind-dog.webp'
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
