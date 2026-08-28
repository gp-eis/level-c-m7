window.LEVEL_C_WEEK_1_GAMES = Object.freeze([
  Object.freeze({
    id: 'clean-up',
    label: 'Clean up dog poop',
    phrase: 'Always clean up dog poop.',
    sentence: 'You should always clean up dog poop.',
    image: '../assets/images/week-1/games/dog-park-rules/clean-up-dog-poop.png'
  }),
  Object.freeze({
    id: 'hurt',
    label: 'Hurt other dogs',
    phrase: 'Hurt other dogs.',
    sentence: 'You should not hurt other dogs.',
    image: '../assets/images/week-1/games/dog-park-rules/hurt-other-dogs.png'
  }),
  Object.freeze({
    id: 'shout',
    label: 'Shout at other dogs',
    phrase: 'Shout at other dogs.',
    sentence: 'You should not shout at other dogs.',
    image: '../assets/images/week-1/games/dog-park-rules/shout-at-other-dogs.png'
  }),
  Object.freeze({
    id: 'play',
    label: 'Play with your dog',
    phrase: 'Play with your dog.',
    sentence: 'You should play with your dog.',
    image: '../assets/images/week-1/games/dog-park-rules/play-with-your-dog.png'
  }),
  Object.freeze({
    id: 'leash',
    label: 'Use a leash',
    phrase: 'Use a leash.',
    sentence: 'You should use a leash.',
    image: '../assets/images/week-1/games/dog-park-rules/use-a-leash.png'
  }),
  Object.freeze({
    id: 'chase',
    label: 'Let your dog chase people',
    phrase: 'Let your dog chase people.',
    sentence: 'You should not let your dog chase people.',
    image: '../assets/images/week-1/games/dog-park-rules/dog-chase-people.png'
  }),
  Object.freeze({
    id: 'fight',
    label: 'Let your dog fight other animals',
    phrase: 'Let your dog fight other animals.',
    sentence: 'You should not let your dog fight other animals.',
    image: '../assets/images/week-1/games/dog-park-rules/dog-fight-other-animals.png'
  }),
  Object.freeze({
    id: 'water',
    label: 'Give your dog water',
    phrase: 'Give your dog water.',
    sentence: 'You should give your dog water.',
    image: '../assets/images/week-1/games/dog-park-rules/give-dog-water.png'
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
