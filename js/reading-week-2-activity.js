(() => {
  const ASSET_ROOT = '../assets/images/week-2/reading/life-identity/';
  const ROUNDS = [
    {
      question: 'How did the little duck feel when he did not know who he was?',
      detail: '',
      questionImage: 'q1-question.webp',
      questionAlt: 'A curious little duckling looks at a large blue question mark in the garden.',
      showLabels: true,
      correct: 'confused',
      success: 'That\'s right! The little duck felt confused and upset when he did not know who he was.',
      answers: [
        { id: 'confused', label: 'He felt confused and upset.', image: 'q1-confused-upset.webp', alt: 'The little duckling looks confused and upset in the garden.' },
        { id: 'excited', label: 'He felt very excited.', image: 'q1-excited.webp', alt: 'The little duckling jumps with excitement in the garden.' },
        { id: 'calm', label: 'He did not care.', image: 'q1-calm.webp', alt: 'The little duckling sits calmly without showing a strong feeling.' }
      ]
    },
    {
      question: 'Why did the little duck look for Mother Duck?',
      detail: '',
      questionImage: 'q2-question.webp',
      questionAlt: 'A curious little duckling stands beside a purple question mark where garden paths meet.',
      showLabels: true,
      correct: 'identity',
      success: 'That\'s right! The little duck looked for Mother Duck because he wanted to learn who he was.',
      answers: [
        { id: 'identity', label: 'He wanted to learn who he was.', image: 'q2-learn-who-i-am.webp', alt: 'The little duckling thoughtfully looks at his duck reflection in a garden pond.' },
        { id: 'food', label: 'He wanted something delicious to eat.', image: 'q2-food.webp', alt: 'The little duckling eagerly looks at a basket of food.' },
        { id: 'travel', label: 'He wanted to travel far away.', image: 'q2-travel.webp', alt: 'The little duckling carries a backpack and map toward a long path.' }
      ]
    },
    {
      question: 'What did the little duck learn after meeting Mother Duck?',
      detail: '',
      questionImage: 'q3-question.webp',
      questionAlt: 'A little duckling looks up at a large teal question mark beside the pond.',
      showLabels: true,
      correct: 'duck',
      success: 'That\'s right! The little duck learned, I am a duck!',
      answers: [
        { id: 'duck', label: 'I am a duck!', image: 'q3-i-am-duck.webp', alt: 'The little duckling proudly stands with Mother Duck and other ducklings.' },
        { id: 'cat', label: 'I am a cat!', image: 'q3-i-am-cat.webp', alt: 'The little duckling pretends to be a cat with soft cat ears and a ball of yarn.' },
        { id: 'fish', label: 'I am a fish!', image: 'q3-i-am-fish.webp', alt: 'The little duckling pretends to be a fish in a blue fish-tail costume.' }
      ]
    },
    {
      question: 'Why is it important to know who you are?',
      detail: '',
      questionImage: 'q4-question.webp',
      questionAlt: 'A thoughtful little duckling sits beside a large golden question mark reflected in a pond.',
      showLabels: true,
      correct: 'yourself',
      success: 'That\'s right! Knowing who you are helps you understand yourself and be yourself.',
      answers: [
        { id: 'yourself', label: 'It helps you understand yourself and be yourself.', image: 'q4-be-yourself.webp', alt: 'A confident little duckling smiles proudly beside his matching reflection.' },
        { id: 'same', label: 'It helps you become exactly like everyone else.', image: 'q4-be-like-everyone.webp', alt: 'Three ducklings wear identical blue caps and stand in the same pose.' },
        { id: 'copy', label: 'It helps you always copy other people.', image: 'q4-copy-others.webp', alt: 'A smaller duckling copies every part of another duckling\'s pose.' }
      ]
    }
  ];

  const questionMain = document.getElementById('question-main');
  const questionDetail = document.getElementById('question-detail');
  const questionImage = document.getElementById('question-image');
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
    if (round.detail) {
      await pause(650, token);
      await speak(round.detail, token);
    }
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
    questionDetail.hidden = !round.detail;
    questionImage.src = `${ASSET_ROOT}${round.questionImage}`;
    questionImage.alt = round.questionAlt;
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
