(() => {
  const ASSET_ROOT = '../assets/images/week-2/reading/activity/';
  const ROUNDS = [
    {
      question: 'What did the little duck find first?',
      detail: 'The little duck find the small snail first.',
      showLabels: false,
      correct: 'snail',
      success: 'That\'s right! The little duck found a small snail first.',
      answers: [
        { id: 'snail', label: 'A small snail.', image: 'q1-small-snail.webp', alt: 'A small friendly snail in the garden.' },
        { id: 'grass', label: 'Some short grass.', image: 'q1-short-grass.webp', alt: 'A short patch of green grass.' },
        { id: 'fence', label: 'A tall fence.', image: 'q1-tall-fence.webp', alt: 'A tall white garden fence.' }
      ]
    },
    {
      question: 'Why did the little duck cry?',
      detail: 'Nobody knew who he was.',
      showLabels: false,
      correct: 'unknown',
      success: 'That\'s right! He cried because nobody in the garden knew who he was.',
      answers: [
        { id: 'unknown', label: 'Nobody knew who he was.', image: 'q2-no-one-knew-him.webp', alt: 'A confused and lonely duckling sits near a snail and a quiet fence.' },
        { id: 'hungry', label: 'He was hungry.', image: 'q2-hungry.webp', alt: 'A hungry duckling looks at an empty food bowl.' },
        { id: 'hurt', label: 'He hurt his foot.', image: 'q2-hurt.webp', alt: 'A duckling sits with a bandage around one foot.' }
      ]
    },
    {
      question: 'Who helped the little duck learn who he was?',
      detail: 'His mother duck helped him that he was a duck.',
      showLabels: false,
      correct: 'mother',
      success: 'That\'s right! His mother duck helped him learn that he was a duck.',
      answers: [
        { id: 'mother', label: 'His mother duck.', image: 'q3-mother-helps.webp', alt: 'A caring white mother duck comforts her yellow duckling.' },
        { id: 'snail', label: 'The small snail.', image: 'q1-small-snail.webp', alt: 'A small friendly snail in the garden.' },
        { id: 'fence', label: 'The tall fence.', image: 'q1-tall-fence.webp', alt: 'A tall white garden fence.' }
      ]
    },
    {
      question: 'What should you do when a friend is sad and needs help?',
      detail: 'Choose the kind thing to do.',
      showLabels: true,
      correct: 'help',
      success: 'That\'s right! We should listen and help kindly when a friend is sad.',
      answers: [
        { id: 'help', label: 'Listen and help kindly.', image: 'q3-mother-helps.webp', alt: 'A caring mother duck listens to and comforts a sad duckling.' },
        { id: 'laugh', label: 'Laugh at your friend.', image: 'q4-laugh.webp', alt: 'One duckling laughs at another sad duckling.' },
        { id: 'leave', label: 'Walk away and ignore them.', image: 'q4-walk-away.webp', alt: 'One duckling walks away from another sad duckling.' }
      ]
    }
  ];

  const questionMain = document.getElementById('question-main');
  const questionDetail = document.getElementById('question-detail');
  const introSpeaker = document.getElementById('intro-speaker');
  const questionSpeaker = document.getElementById('question-speaker');
  const answersGrid = document.getElementById('answers-grid');
  const progressLabel = document.getElementById('progress-label');
  const progressDots = document.getElementById('progress-dots');
  const feedbackLine = document.getElementById('feedback-line');
  const completionOverlay = document.getElementById('completion-overlay');
  const completionSpeaker = document.getElementById('completion-speaker');
  const tryAgainButton = document.getElementById('try-again');

  let roundIndex = 0;
  let locked = false;
  let speechToken = 0;
  let preferredVoice = null;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const isUsEnglish = (voice) => /^en[-_]US$/i.test(voice.lang || '');
    preferredVoice = voices.find((voice) => isUsEnglish(voice) && /jenny|aria|zira|samantha|google|english/i.test(voice.name))
      || voices.find(isUsEnglish)
      || null;
  }

  if ('speechSynthesis' in window) {
    chooseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', chooseVoice);
  }

  function stopSpeech() {
    speechToken += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function speak(text, token = speechToken) {
    return new Promise((resolve) => {
      if (!text || token !== speechToken || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.pitch = 1.08;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  function pause(milliseconds, token = speechToken) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(token === speechToken), milliseconds);
    });
  }

  async function readCurrentQuestion() {
    stopSpeech();
    const token = speechToken;
    const round = ROUNDS[roundIndex];
    await speak(round.question, token);
    if (token !== speechToken) return;
    await pause(650, token);
    await speak(round.detail, token);
  }

  function makeAnswerSpeaker(label) {
    const button = document.createElement('button');
    button.className = 'reading-speaker-btn reading-answer-listen';
    button.type = 'button';
    button.textContent = '🔊';
    button.setAttribute('aria-label', `Listen to: ${label}`);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (locked) return;
      stopSpeech();
      speak(label);
    });
    return button;
  }

  function makeAnswerCard(answer, correctId, showLabel) {
    const card = document.createElement('button');
    card.className = 'reading-answer-card';
    card.type = 'button';
    card.dataset.answer = answer.id;
    card.setAttribute('aria-label', answer.label);

    const image = document.createElement('img');
    image.className = 'reading-answer-image';
    image.src = `${ASSET_ROOT}${answer.image}`;
    image.alt = answer.alt;

    const label = document.createElement('span');
    label.className = 'reading-answer-label';
    label.textContent = answer.label;

    card.append(makeAnswerSpeaker(answer.label), image);
    if (showLabel) card.append(label);
    card.addEventListener('click', () => checkAnswer(card, answer.id === correctId));
    return card;
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.innerHTML = '';
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-progress-dot';
      if (index < roundIndex) dot.classList.add('done');
      if (index === roundIndex) dot.classList.add('current');
      progressDots.appendChild(dot);
    });
  }

  function renderRound({ readAloud = true } = {}) {
    locked = false;
    questionSpeaker.disabled = false;
    feedbackLine.textContent = '';
    feedbackLine.className = 'reading-feedback';

    const round = ROUNDS[roundIndex];
    questionMain.textContent = round.question;
    questionDetail.textContent = round.detail;
    answersGrid.innerHTML = '';
    answersGrid.classList.toggle('pictures-only', !round.showLabels);
    renderProgress();

    shuffle(round.answers).forEach((answer) => {
      answersGrid.appendChild(makeAnswerCard(answer, round.correct, round.showLabels));
    });

    if (readAloud) window.setTimeout(readCurrentQuestion, 380);
  }

  function setAnswersDisabled(disabled) {
    answersGrid.querySelectorAll('button').forEach((button) => {
      button.disabled = disabled;
    });
  }

  function playResultSound(correct) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = correct ? 'sine' : 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? 0.14 : 0.055, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  }

  async function checkAnswer(card, isCorrect) {
    if (locked) return;
    locked = true;
    questionSpeaker.disabled = true;
    stopSpeech();
    setAnswersDisabled(true);

    if (!isCorrect) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedbackLine.textContent = 'Try again!';
      feedbackLine.className = 'reading-feedback try';
      await speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        setAnswersDisabled(false);
        feedbackLine.textContent = '';
        feedbackLine.className = 'reading-feedback';
        questionSpeaker.disabled = false;
        locked = false;
      }, 420);
      return;
    }

    playResultSound(true);
    card.classList.add('is-correct');
    feedbackLine.textContent = 'Great choice!';
    feedbackLine.className = 'reading-feedback good';
    await speak(ROUNDS[roundIndex].success);
    await pause(480);

    if (roundIndex < ROUNDS.length - 1) {
      roundIndex += 1;
      renderRound();
    } else {
      completionOverlay.hidden = false;
      tryAgainButton.focus();
      stopSpeech();
      speak('Great job! You finished the Do You Know Who I Am activity!');
    }
  }

  function startActivity() {
    stopSpeech();
    roundIndex = 0;
    completionOverlay.hidden = true;
    renderRound();
  }

  introSpeaker.addEventListener('click', () => {
    if (locked) return;
    stopSpeech();
    speak('Garden Story Challenge. Listen carefully, then choose the best picture!');
  });
  questionSpeaker.addEventListener('click', () => {
    if (!locked) readCurrentQuestion();
  });
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Do You Know Who I Am activity!');
  });
  tryAgainButton.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
