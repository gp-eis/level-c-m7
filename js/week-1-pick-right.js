(() => {
  const items = window.LEVEL_C_PICK_RIGHT_ITEMS || window.LEVEL_C_WEEK_1_GAMES || window.LEVEL_C_GAMES;
  const config = window.LEVEL_C_PICK_RIGHT_CONFIG || {};
  const helpers = window.LevelCGameHelpers;
  const picture = document.querySelector('#pick-right-picture');
  if (!items || !helpers || !picture) return;

  const { shuffle, delay, speak, correctSound, wrongSound } = helpers;
  const choices = [...document.querySelectorAll('.pick-right-choice')];
  const phrase = document.querySelector('#pick-right-phrase');
  const feedback = document.querySelector('#pick-right-feedback');
  const listenButton = document.querySelector('#pick-right-listen');
  const nextButton = document.querySelector('#pick-right-next');
  const newRoundButton = document.querySelector('#pick-right-new');
  const scoreElement = document.querySelector('#pick-right-score');
  const progressElement = document.querySelector('#pick-right-progress');
  const celebration = document.querySelector('#pick-right-celebration');
  const playAgainButton = document.querySelector('#pick-right-play-again');

  let deck = [];
  let roundIndex = 0;
  let score = 0;
  let currentItem = null;
  let locked = false;

  function answerFor(item) {
    if (item.answer) return item.answer;
    return /\bshould not\b/i.test(item.sentence) ? 'should-not' : 'should';
  }

  function promptFor(item) {
    return item.prompt || item.phrase || '';
  }

  function audioPromptFor(item) {
    return item.audioPrompt || item.prompt || item.phrase || '';
  }

  function resultSentence(item) {
    return `Correct! ${item.sentence}`;
  }

  function resetChoice(button) {
    button.disabled = false;
    button.classList.remove('is-correct', 'is-wrong');
    button.removeAttribute('aria-pressed');
  }

  function renderItem(autoSpeak = false) {
    locked = false;
    currentItem = deck[roundIndex];
    choices.forEach(resetChoice);
    nextButton.hidden = true;
    listenButton.disabled = false;
    phrase.textContent = promptFor(currentItem);
    picture.src = currentItem.image;
    picture.alt = currentItem.label;
    progressElement.textContent = String(roundIndex + 1);
    feedback.className = 'pick-right-feedback';
    feedback.textContent = config.choicePrompt || 'Choose O should or X should not.';
    if (autoSpeak) speak(audioPromptFor(currentItem));
  }

  async function choose(button) {
    if (locked || !currentItem) return;
    const correctAnswer = answerFor(currentItem);

    if (button.dataset.choice !== correctAnswer) {
      wrongSound();
      button.classList.remove('is-wrong');
      void button.offsetWidth;
      button.classList.add('is-wrong');
      feedback.className = 'pick-right-feedback is-wrong';
      feedback.textContent = config.wrongMessage || 'Try again! Look carefully at the picture.';
      button.disabled = true;
      await delay(560);
      button.classList.remove('is-wrong');
      button.disabled = false;
      feedback.className = 'pick-right-feedback';
      feedback.textContent = config.choicePrompt || 'Choose O should or X should not.';
      return;
    }

    locked = true;
    correctSound();
    button.classList.add('is-correct');
    button.setAttribute('aria-pressed', 'true');
    choices.forEach(choice => { choice.disabled = true; });
    listenButton.disabled = true;
    score += 1;
    scoreElement.textContent = String(score);
    const message = resultSentence(currentItem);
    feedback.className = 'pick-right-feedback is-correct';
    feedback.textContent = message;
    nextButton.textContent = roundIndex === deck.length - 1 ? 'Finish Round 🏆' : 'Next Picture ➡️';
    nextButton.hidden = false;
    await speak(message);
    nextButton.focus();
  }

  function nextItem() {
    if (!locked) return;
    if (roundIndex >= deck.length - 1) {
      celebration.hidden = false;
      playAgainButton.focus();
      return;
    }
    roundIndex += 1;
    renderItem(true);
  }

  function startRound() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    deck = shuffle(items);
    roundIndex = 0;
    score = 0;
    scoreElement.textContent = '0';
    celebration.hidden = true;
    renderItem();
  }

  choices.forEach(button => button.addEventListener('click', () => choose(button)));
  listenButton.addEventListener('click', () => { if (!locked && currentItem) speak(audioPromptFor(currentItem)); });
  nextButton.addEventListener('click', nextItem);
  newRoundButton.addEventListener('click', startRound);
  playAgainButton.addEventListener('click', startRound);
  startRound();
})();
