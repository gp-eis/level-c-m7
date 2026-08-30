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
  const speechBookCards = {
    1: [
      { id: 'speech-dog-sitting', label: 'The dog is sitting.', phrase: '', sentence: 'The dog is sitting.', image: '../assets/images/speech-book/week-1/dog-sitting.webp' },
      { id: 'speech-cat-yawning', label: 'The cat is yawning.', phrase: '', sentence: 'The cat is yawning.', image: '../assets/images/speech-book/week-1/cat-yawning.webp' },
      { id: 'speech-deer-walking', label: 'The deer is walking.', phrase: '', sentence: 'The deer is walking.', image: '../assets/images/speech-book/week-1/deer-walking.webp' },
      { id: 'speech-rabbit-jumping', label: 'The rabbit is jumping.', phrase: '', sentence: 'The rabbit is jumping.', image: '../assets/images/speech-book/week-1/rabbit-jumping.webp' },
      { id: 'speech-eagle-hunting', label: 'The eagle is hunting.', phrase: '', sentence: 'The eagle is hunting.', image: '../assets/images/speech-book/week-1/eagle-hunting.webp' },
      { id: 'speech-swan-swimming', label: 'The swan is swimming.', phrase: '', sentence: 'The swan is swimming.', image: '../assets/images/speech-book/week-1/swan-swimming.webp' },
      { id: 'speech-bat-sleeping', label: 'The bat is sleeping.', phrase: '', sentence: 'The bat is sleeping.', image: '../assets/images/speech-book/week-1/bat-sleeping.webp' },
      { id: 'speech-squirrel-playing', label: 'The squirrel is playing.', phrase: '', sentence: 'The squirrel is playing.', image: '../assets/images/speech-book/week-1/squirrel-playing.webp' }
    ],
    2: [
      { id: 'speech-green-grass', label: 'We can find green grass.', phrase: '', sentence: 'We can find green grass.', image: '../assets/images/speech-book/week-2/green-grass.webp' },
      { id: 'speech-brown-ant', label: 'We can find a brown ant.', phrase: '', sentence: 'We can find a brown ant.', image: '../assets/images/speech-book/week-2/brown-ant.webp' },
      { id: 'speech-pink-lotus', label: 'We can find a pink lotus flower.', phrase: '', sentence: 'We can find a pink lotus flower.', image: '../assets/images/speech-book/week-2/pink-lotus-flower.webp' },
      { id: 'speech-red-ladybug', label: 'We can find a red ladybug.', phrase: '', sentence: 'We can find a red ladybug.', image: '../assets/images/speech-book/week-2/red-ladybug.webp' },
      { id: 'speech-tall-fence', label: 'I found a tall fence.', phrase: '', sentence: 'I found a tall fence.', image: '../assets/images/speech-book/week-2/tall-fence.webp' },
      { id: 'speech-big-tree', label: 'I found a big tree.', phrase: '', sentence: 'I found a big tree.', image: '../assets/images/speech-book/week-2/big-tree.webp' },
      { id: 'speech-short-cactus', label: 'I found a short cactus.', phrase: '', sentence: 'I found a short cactus.', image: '../assets/images/speech-book/week-2/short-cactus.webp' },
      { id: 'speech-small-snail', label: 'I found a small snail.', phrase: '', sentence: 'I found a small snail.', image: '../assets/images/speech-book/week-2/small-snail.webp' }
    ],
    3: [
      { id: 'speech-gray-moon', label: "It's barking at the gray moon.", phrase: '', sentence: "It's barking at the gray moon.", image: '../assets/images/speech-book/week-3/barking-gray-moon.webp' },
      { id: 'speech-purple-scooter', label: "It's barking at the purple scooter.", phrase: '', sentence: "It's barking at the purple scooter.", image: '../assets/images/speech-book/week-3/barking-purple-scooter.webp' },
      { id: 'speech-brown-owl', label: "It's barking at the brown owl.", phrase: '', sentence: "It's barking at the brown owl.", image: '../assets/images/speech-book/week-3/barking-brown-owl.webp' },
      { id: 'speech-blue-car', label: "It's barking at the blue car.", phrase: '', sentence: "It's barking at the blue car.", image: '../assets/images/speech-book/week-3/barking-blue-car.webp' },
      { id: 'speech-boy-scooter', label: 'The boy is on the scooter.', phrase: '', sentence: 'The boy is on the scooter.', image: '../assets/images/speech-book/week-3/boy-on-scooter.webp' },
      { id: 'speech-moon-tree', label: 'The moon is above the tree.', phrase: '', sentence: 'The moon is above the tree.', image: '../assets/images/speech-book/week-3/moon-above-tree.webp' },
      { id: 'speech-cat-car', label: 'The cat is under the car.', phrase: '', sentence: 'The cat is under the car.', image: '../assets/images/speech-book/week-3/cat-under-car.webp' },
      { id: 'speech-rabbit-dog', label: 'The rabbit is behind the dog.', phrase: '', sentence: 'The rabbit is behind the dog.', image: '../assets/images/speech-book/week-3/rabbit-behind-dog.webp' }
    ],
    4: [
      { id: 'speech-dark-cave', label: 'The cave is dark.', phrase: '', sentence: 'The cave is dark.', image: '../assets/images/speech-book/week-4/dark-cave.webp' },
      { id: 'speech-monster', label: 'I am scared of the monster.', phrase: '', sentence: 'I am scared of the monster.', image: '../assets/images/speech-book/week-4/scared-of-monster.webp' },
      { id: 'speech-skeletons', label: 'I am scared of the skeletons.', phrase: '', sentence: 'I am scared of the skeletons.', image: '../assets/images/speech-book/week-4/scared-of-skeletons.webp' },
      { id: 'speech-bats', label: 'I am scared of the bats.', phrase: '', sentence: 'I am scared of the bats.', image: '../assets/images/speech-book/week-4/scared-of-bats.webp' },
      { id: 'speech-spiders', label: 'I am scared of the spiders.', phrase: '', sentence: 'I am scared of the spiders.', image: '../assets/images/speech-book/week-4/scared-of-spiders.webp' },
      { id: 'speech-pumpkin', label: 'An orange pumpkin is scary.', phrase: '', sentence: 'An orange pumpkin is scary.', image: '../assets/images/speech-book/week-4/orange-pumpkin.webp' },
      { id: 'speech-black-bug', label: 'A black bug is scary.', phrase: '', sentence: 'A black bug is scary.', image: '../assets/images/speech-book/week-4/black-bug.webp' },
      { id: 'speech-gray-rat', label: 'A gray rat is scary.', phrase: '', sentence: 'A gray rat is scary.', image: '../assets/images/speech-book/week-4/gray-rat.webp' },
      { id: 'speech-white-ghost', label: 'A white ghost is scary.', phrase: '', sentence: 'A white ghost is scary.', image: '../assets/images/speech-book/week-4/white-ghost.webp' }
    ]
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
    const sourceTabs = [...document.querySelectorAll('.fc-source-tab')];

    let cards = [...sourceCards];
    let cardIndex = 0;
    let isFlipped = false;
    let activeSource = 'literacy';

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
      helpElement.textContent = activeSource === 'speech-book' ? 'Listen to the sentence.' : 'Listen to the phrase and full sentence.';
      if (card.phrase) {
        await speakText(card.phrase);
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
      await speakText(card.sentence);
    }

    function setFlipped(nextState) {
      isFlipped = nextState;
      cardElement.classList.toggle('is-flipped', isFlipped);
      cardElement.setAttribute('aria-pressed', String(isFlipped));
      cardElement.setAttribute('aria-label', isFlipped ? 'Show the flashcard picture' : 'Show the flashcard words');
      flipButton.textContent = isFlipped ? '🖼️ Show Picture' : '🔄 Flip Card';
      helpElement.textContent = isFlipped
        ? (activeSource === 'speech-book' ? 'Read the sentence, or press Listen.' : 'Read the phrase and sentence, or press Listen.')
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
      phraseElement.hidden = !card.phrase;
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

    function selectSource(source) {
      if (source !== 'literacy' && source !== 'speech-book') return;
      stopSpeech();
      activeSource = source;
      document.body.dataset.flashcardSource = source;
      cards = source === 'speech-book' ? [...speechBookCards[week]] : [...sourceCards];
      cardIndex = 0;
      sourceTabs.forEach((tab) => {
        const selected = tab.dataset.source === source;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
      buildThumbnails();
      renderCard();
      helpElement.textContent = source === 'speech-book'
        ? 'Speech Book: tap the picture to reveal its sentence.'
        : 'Literacy: tap the picture to reveal its phrase and sentence.';
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
    sourceTabs.forEach((tab) => tab.addEventListener('click', () => selectSource(tab.dataset.source)));
    window.addEventListener('pagehide', stopSpeech);

    buildThumbnails();
    renderCard();
  }
})();
