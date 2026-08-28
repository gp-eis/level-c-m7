(() => {
  const items = window.LEVEL_C_GAMES || window.LEVEL_C_WEEK_1_GAMES;
  const { shuffle, delay, speak, correctSound, wrongSound } = window.LevelCGameHelpers;
  const board = document.querySelector('#memory-board');
  if (!items || !board) return;

  const movesElement = document.querySelector('#memory-moves');
  const pairsElement = document.querySelector('#memory-pairs');
  const previewButton = document.querySelector('#memory-preview');
  const restartButton = document.querySelector('#memory-restart');
  const matchModal = document.querySelector('#memory-match-modal');
  const matchImage = document.querySelector('#memory-match-image');
  const matchSentence = document.querySelector('#memory-match-sentence');
  const continueButton = document.querySelector('#memory-match-continue');
  const celebration = document.querySelector('#memory-celebration');
  const playAgainButton = document.querySelector('#memory-play-again');

  let firstCard = null;
  let locked = false;
  let moves = 0;
  let pairs = 0;
  let gameId = 0;
  let activeItems = [];
  let lastDeck = '';
  let lastSelection = '';
  let celebrateAfterContinue = false;

  function createCard(item, copyIndex) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-card';
    card.dataset.itemId = item.id;
    card.dataset.copy = copyIndex;
    card.setAttribute('aria-label', 'Hidden memory card');
    card.innerHTML = `
      <span class="memory-card__picture">
        <img src="${item.image}" alt="${item.label}" draggable="false">
      </span>`;
    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function startGame() {
    gameId += 1;
    window.speechSynthesis?.cancel();
    matchModal.hidden = true;
    celebration.hidden = true;
    celebrateAfterContinue = false;
    firstCard = null;
    locked = false;
    moves = 0;
    pairs = 0;
    movesElement.textContent = '0';
    pairsElement.textContent = '0';
    previewButton.disabled = false;
    previewButton.textContent = '👀 Look for 3 Seconds';

    let selectionSignature;
    do {
      activeItems = shuffle(items).slice(0, 5);
      selectionSignature = activeItems.map((item) => item.id).sort().join(',');
    } while (selectionSignature === lastSelection);
    lastSelection = selectionSignature;

    let deck;
    let signature;
    do {
      deck = shuffle(activeItems.flatMap((item) => [{ item, copy: 1 }, { item, copy: 2 }]));
      signature = deck.map(({ item }) => item.id).join(',');
    } while (signature === lastDeck);
    lastDeck = signature;
    board.replaceChildren(...deck.map(({ item, copy }) => createCard(item, copy)));
  }

  async function flipCard(card) {
    if (locked || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
    const item = items.find((entry) => entry.id === card.dataset.itemId);
    const currentGame = gameId;
    card.classList.add('is-flipped');
    card.setAttribute('aria-label', item.label);
    locked = true;
    await speak(item.phrase);
    if (currentGame !== gameId) return;

    if (!firstCard) {
      firstCard = card;
      locked = false;
      return;
    }

    moves += 1;
    movesElement.textContent = String(moves);
    if (firstCard.dataset.itemId === card.dataset.itemId) {
      correctSound();
      firstCard.classList.add('is-matched');
      card.classList.add('is-matched');
      firstCard = null;
      pairs += 1;
      pairsElement.textContent = String(pairs);
      celebrateAfterContinue = pairs === activeItems.length;
      matchImage.src = item.image;
      matchImage.alt = item.label;
      matchSentence.textContent = item.sentence;
      matchModal.hidden = false;
      await speak(item.sentence);
      continueButton.focus();
      return;
    }

    wrongSound();
    const previous = firstCard;
    firstCard = null;
    previous.classList.add('is-wrong');
    card.classList.add('is-wrong');
    await delay(650);
    previous.classList.remove('is-flipped', 'is-wrong');
    card.classList.remove('is-flipped', 'is-wrong');
    previous.setAttribute('aria-label', 'Hidden memory card');
    card.setAttribute('aria-label', 'Hidden memory card');
    locked = false;
  }

  async function previewCards() {
    if (locked) return;
    locked = true;
    previewButton.disabled = true;
    const hiddenCards = [...board.querySelectorAll('.memory-card:not(.is-matched)')];
    hiddenCards.forEach((card) => card.classList.add('is-previewing'));
    for (let seconds = 3; seconds > 0; seconds -= 1) {
      previewButton.textContent = `👀 ${seconds}`;
      await delay(1000);
    }
    hiddenCards.forEach((card) => card.classList.remove('is-previewing'));
    previewButton.textContent = '👀 Look for 3 Seconds';
    previewButton.disabled = false;
    locked = false;
  }

  continueButton.addEventListener('click', () => {
    matchModal.hidden = true;
    if (celebrateAfterContinue) {
      celebration.hidden = false;
      playAgainButton.focus();
    } else {
      locked = false;
      board.querySelector('.memory-card:not(.is-matched)')?.focus();
    }
  });
  previewButton.addEventListener('click', previewCards);
  restartButton.addEventListener('click', startGame);
  playAgainButton.addEventListener('click', startGame);
  startGame();
})();
