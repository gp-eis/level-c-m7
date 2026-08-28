(() => {
  const items = window.LEVEL_C_GAMES || window.LEVEL_C_WEEK_1_GAMES;
  const { shuffle, delay, speak, correctSound, wrongSound } = window.LevelCGameHelpers;
  const choices = document.querySelector('#picture-match-choices');
  if (!items || !choices) return;

  const sentenceElement = document.querySelector('#picture-match-sentence');
  const listenButton = document.querySelector('#picture-match-listen');
  const newButton = document.querySelector('#picture-match-new');
  const scoreElement = document.querySelector('#picture-match-score');
  const modal = document.querySelector('#picture-match-modal');
  const reviewImage = document.querySelector('#picture-match-review-image');
  const reviewSentence = document.querySelector('#picture-match-review-sentence');
  const continueButton = document.querySelector('#picture-match-continue');

  let currentItem = null;
  let previousItemId = '';
  let locked = false;
  let score = 0;

  function chooseItem() {
    const candidates = items.filter((item) => item.id !== previousItemId);
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    previousItemId = item.id;
    return item;
  }

  function createChoice(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picture-choice';
    button.dataset.itemId = item.id;
    button.setAttribute('aria-label', item.label);
    button.innerHTML = `<img src="${item.image}" alt="${item.label}" draggable="false">`;
    button.addEventListener('click', () => choosePicture(button, item));
    return button;
  }

  async function renderRound(autoSpeak = true) {
    locked = false;
    modal.hidden = true;
    listenButton.disabled = false;
    currentItem = chooseItem();
    const wrongItems = shuffle(items.filter((item) => item.id !== currentItem.id)).slice(0, 2);
    const roundChoices = shuffle([currentItem, ...wrongItems]);
    sentenceElement.textContent = currentItem.sentence;
    choices.replaceChildren(...roundChoices.map(createChoice));
    if (autoSpeak) await speak(currentItem.sentence);
  }

  async function choosePicture(button, item) {
    if (locked) return;
    if (item.id !== currentItem.id) {
      wrongSound();
      button.classList.add('is-wrong');
      button.disabled = true;
      await delay(550);
      button.classList.remove('is-wrong');
      button.disabled = false;
      return;
    }

    locked = true;
    choices.querySelectorAll('.picture-choice').forEach((choice) => { choice.disabled = true; });
    listenButton.disabled = true;
    correctSound();
    button.classList.add('is-correct');
    score += 1;
    scoreElement.textContent = String(score);
    reviewImage.src = currentItem.image;
    reviewImage.alt = currentItem.label;
    reviewSentence.textContent = currentItem.sentence;
    modal.hidden = false;
    await speak(currentItem.sentence);
    continueButton.focus();
  }

  listenButton.addEventListener('click', () => {
    if (!locked && currentItem) speak(currentItem.sentence);
  });
  newButton.addEventListener('click', () => renderRound());
  continueButton.addEventListener('click', () => renderRound());
  renderRound();
})();
