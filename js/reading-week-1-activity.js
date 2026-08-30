(() => {
  const ASSET_ROOT = '../assets/images/reading/week-1-activity/';
  const ROUNDS = [
    {
      question: 'What is the red dog doing?',
      detail: 'The red dog is sleeping.',
      pictureOnly: true,
      cue: 'q1-red-cue.webp',
      cueAlt: 'A cute red dog from the story.',
      correct: 'sleeping',
      success: 'Correct! The red dog is sleeping.',
      answers: [
        { id: 'sleeping', label: 'Sleeping', image: 'q1-red-sleeping.webp', alt: 'A cute red dog sleeping peacefully.' },
        { id: 'running', label: 'Running', image: 'q1-red-running.webp', alt: 'A cute red dog running.' },
        { id: 'jumping', label: 'Jumping', image: 'q1-red-jumping.webp', alt: 'A cute red dog jumping.' }
      ]
    },
    {
      question: 'What does the yellow dog smell?',
      detail: 'The yellow dog smells the grass.',
      pictureOnly: true,
      cue: 'q2-yellow-cue.webp',
      cueAlt: 'A cute yellow dog using its nose.',
      correct: 'grass',
      success: 'Correct! The yellow dog smells the grass.',
      answers: [
        { id: 'grass', label: 'The grass', image: 'q2-yellow-grass.webp', alt: 'A cute yellow dog smelling green grass.' },
        { id: 'flowers', label: 'The flowers', image: 'q2-yellow-flowers.webp', alt: 'A cute yellow dog smelling colorful flowers.' },
        { id: 'bone', label: 'A bone', image: 'q2-yellow-bone.webp', alt: 'A cute yellow dog smelling a bone.' }
      ]
    },
    {
      question: 'What does a dog use to smell?',
      detail: 'Dogs use their noses to smell.',
      pictureOnly: true,
      cue: 'q1-red-cue.webp',
      cueAlt: 'A cute red dog ready to use its senses.',
      correct: 'nose',
      success: 'Correct! Dogs use their noses to smell.',
      answers: [
        { id: 'nose', label: 'Its nose', image: 'q3-dog-nose.webp', alt: 'A cute red dog using its nose to smell a flower.' },
        { id: 'eyes', label: 'Its eyes', image: 'q3-dog-eyes.webp', alt: 'A cute red dog using its eyes to look at a butterfly.' },
        { id: 'ears', label: 'Its ears', image: 'q3-dog-ears.webp', alt: 'A cute red dog using its ears to listen to a bell.' }
      ]
    },
    {
      question: 'Which sense do dogs use very well to explore the world?',
      detail: 'Choose the best answer.',
      cue: 'q1-red-cue.webp',
      cueAlt: 'A cute dog ready to explore the world.',
      correct: 'smell',
      success: 'Correct! Dogs use their sense of smell very well.',
      answers: [
        { id: 'smell', label: 'Their sense of smell.', image: 'q4-sense-smell.webp', alt: 'A cute golden puppy uses its nose to smell grass and flowers.' },
        { id: 'taste', label: 'Their sense of taste.', image: 'q4-sense-taste.webp', alt: 'A cute golden puppy tastes a dog biscuit.' },
        { id: 'touch', label: 'Their sense of touch.', image: 'q4-sense-touch.webp', alt: 'A cute golden puppy touches a soft blue blanket with its paw.' }
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

  function makeAnswerCard(answer, correctId, pictureOnly = false) {
    const card = document.createElement('button');
    card.className = 'reading-answer-card';
    if (pictureOnly) card.classList.add('is-picture-only');
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

    card.append(makeAnswerSpeaker(answer.label), image, label);
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
    questionImage.src = `${ASSET_ROOT}${round.cue}`;
    questionImage.alt = round.cueAlt;
    answersGrid.innerHTML = '';
    renderProgress();

    shuffle(round.answers).forEach((answer) => {
      answersGrid.appendChild(makeAnswerCard(answer, round.correct, round.pictureOnly));
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
      speak('Great job! You finished the Why, Why is That activity!');
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
    speak('Story Challenge. Listen carefully, then choose the best picture!');
  });
  questionSpeaker.addEventListener('click', () => {
    if (!locked) readCurrentQuestion();
  });
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Why, Why is That activity!');
  });
  tryAgainButton.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
