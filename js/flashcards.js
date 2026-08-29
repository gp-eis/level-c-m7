(() => {
  const params = new URLSearchParams(window.location.search);
  const requestedWeek = Number(params.get('week'));
  const week = requestedWeek >= 1 && requestedWeek <= 4 ? requestedWeek : 1;
  const weekTitles = {
    1: 'In the Park',
    2: 'In the Garden',
    3: 'In the Yard',
    4: 'In the Cave'
  };

  document.body.dataset.week = String(week);
  document.title = `Flashcards — Week ${week} — Level C`;

  const backLink = document.getElementById('flashcards-back');
  const weekLabel = document.getElementById('flashcards-week-label');
  const fromPage = params.get('from') || '';
  const explicitReturn = params.get('return') || '';
  const safeReturnPattern = new RegExp(`^week-${week}-page-0([1-7])\\.html(?:#[A-Za-z0-9_-]+)?$`, 'i');
  const explicitMatch = explicitReturn.match(safeReturnPattern);

  if (explicitMatch) {
    backLink.href = explicitReturn;
    backLink.textContent = `⬅️ Back to Page ${Number(explicitMatch[1])}`;
  } else if (/^[1-7]$/.test(fromPage)) {
    backLink.href = `week-${week}-page-0${fromPage}.html#lesson-focus`;
    backLink.textContent = `⬅️ Back to Page ${fromPage}`;
  } else {
    backLink.href = `../week-${week}.html#card-literacy`;
    backLink.textContent = `⬅️ Week ${week} Home`;
  }

  weekLabel.textContent = `Week ${week} — ${weekTitles[week]}`;

  const dataScript = document.createElement('script');
  dataScript.src = `../js/week-${week}-games-data.js`;
  dataScript.addEventListener('load', initializeFlashcards, { once: true });
  dataScript.addEventListener('error', () => {
    document.getElementById('flashcards-help').textContent = 'The flashcards could not be loaded.';
  }, { once: true });
  document.head.appendChild(dataScript);

  function initializeFlashcards() {
    const sourceCards = window.LEVEL_C_GAMES;
    if (!Array.isArray(sourceCards) || !sourceCards.length) return;

    const cardElement = document.getElementById('flashcard');
    const frontImage = document.getElementById('flashcard-front-image');
    const backImage = document.getElementById('flashcard-back-image');
    const phraseElement = document.getElementById('flashcard-phrase');
    const sentenceElement = document.getElementById('flashcard-sentence');
    const counterElement = document.getElementById('flashcards-counter');
    const helpElement = document.getElementById('flashcards-help');
    const thumbnailsElement = document.getElementById('flashcards-thumbnails');
    const previousButton = document.getElementById('flashcards-previous');
    const nextButton = document.getElementById('flashcards-next');
    const flipButton = document.getElementById('flashcards-flip');
    const listenButton = document.getElementById('flashcards-listen');
    const shuffleButton = document.getElementById('flashcards-shuffle');

    let cards = [...sourceCards];
    let cardIndex = 0;
    let isFlipped = false;

    function shuffle(items) {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[other]] = [copy[other], copy[index]];
      }
      return copy;
    }

    function currentCard() {
      return cards[cardIndex];
    }

    function stopSpeech() {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function speakText(text) {
      if (!text) return Promise.resolve();
      if (typeof speakAmericanEnglish === 'function') {
        return Promise.resolve(speakAmericanEnglish(text, { rate: .86, pitch: 1.05 }));
      }
      if (!('speechSynthesis' in window)) return Promise.resolve();
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = .86;
        utterance.pitch = 1.05;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
      });
    }

    async function listenToCard() {
      const card = currentCard();
      if (!card) return;
      stopSpeech();
      helpElement.textContent = 'Listen to the phrase and full sentence.';
      await speakText(card.phrase);
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      await speakText(card.sentence);
    }

    function setFlipped(nextState) {
      isFlipped = nextState;
      cardElement.classList.toggle('is-flipped', isFlipped);
      cardElement.setAttribute('aria-pressed', String(isFlipped));
      cardElement.setAttribute('aria-label', isFlipped ? 'Show the flashcard picture' : 'Show the flashcard words');
      flipButton.textContent = isFlipped ? '🖼️ Show Picture' : '🔄 Flip Card';
      helpElement.textContent = isFlipped
        ? 'Read the phrase and sentence, or press Listen.'
        : 'Tap the large card to reveal the phrase and sentence.';
    }

    function buildThumbnails() {
      thumbnailsElement.innerHTML = '';
      cards.forEach((card, index) => {
        const button = document.createElement('button');
        button.className = 'fc-thumbnail';
        button.type = 'button';
        button.dataset.cardId = card.id;
        button.setAttribute('aria-label', `Show flashcard: ${card.label}`);
        button.innerHTML = `<img src="${card.image}" alt="">`;
        button.addEventListener('click', () => {
          stopSpeech();
          cardIndex = index;
          renderCard();
        });
        thumbnailsElement.appendChild(button);
      });
    }

    function renderCard() {
      const card = currentCard();
      if (!card) return;
      setFlipped(false);
      frontImage.src = card.image;
      frontImage.alt = card.label;
      backImage.src = card.image;
      backImage.alt = '';
      phraseElement.textContent = card.phrase;
      sentenceElement.textContent = card.sentence;
      counterElement.textContent = `Card ${cardIndex + 1} of ${cards.length}`;
      [...thumbnailsElement.querySelectorAll('.fc-thumbnail')].forEach((button, index) => {
        const selected = index === cardIndex;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-current', selected ? 'true' : 'false');
      });
    }

    function showRelativeCard(offset) {
      stopSpeech();
      cardIndex = (cardIndex + offset + cards.length) % cards.length;
      renderCard();
    }

    function shuffleCards() {
      stopSpeech();
      const currentId = currentCard().id;
      let nextOrder;
      do {
        nextOrder = shuffle(cards);
      } while (nextOrder.map((card) => card.id).join('|') === cards.map((card) => card.id).join('|'));
      cards = nextOrder;
      cardIndex = Math.max(0, cards.findIndex((card) => card.id === currentId));
      buildThumbnails();
      renderCard();
      helpElement.textContent = 'The flashcards have been shuffled!';
    }

    cardElement.addEventListener('click', () => setFlipped(!isFlipped));
    cardElement.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setFlipped(!isFlipped);
    });
    previousButton.addEventListener('click', () => showRelativeCard(-1));
    nextButton.addEventListener('click', () => showRelativeCard(1));
    flipButton.addEventListener('click', () => setFlipped(!isFlipped));
    listenButton.addEventListener('click', listenToCard);
    shuffleButton.addEventListener('click', shuffleCards);
    window.addEventListener('pagehide', stopSpeech);

    buildThumbnails();
    renderCard();
  }
})();
