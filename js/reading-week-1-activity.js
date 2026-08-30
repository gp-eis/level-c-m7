(() => {
  const ASSET_ROOT = '../assets/images/reading/week-1-activity/';
  const ROUNDS = [
    {
      question: 'Why does a dog wag its tail?',
      detail: '',
      cue: 'q1-dog-neutral-cue.webp',
      cueAlt: 'A real dog sitting calmly and looking at the camera.',
      correct: 'feelings',
      success: 'Correct! A dog can wag its tail to show how it feels.',
      answers: [
        { id: 'feelings', label: 'To show how it feels.', image: 'q1-dog-wag-tail.webp', alt: 'A real happy dog wagging its tail.' },
        { id: 'dig', label: 'To dig a hole.', image: 'q1-dog-dig.webp', alt: 'A real dog digging a small hole.' },
        { id: 'sleep', label: 'To go to sleep.', image: 'q1-dog-sleep.webp', alt: 'A real dog sleeping peacefully on grass.' }
      ]
    },
    {
      question: 'Why does a peacock open its colorful tail?',
      detail: '',
      cue: 'q2-peacock-neutral-cue.webp',
      cueAlt: 'A real peacock standing calmly with its tail folded.',
      correct: 'show',
      success: 'Correct! A peacock opens its colorful tail to attract a partner.',
      answers: [
        { id: 'show', label: 'To attract a partner.', image: 'q2-peacock-fan.webp', alt: 'A real peacock fanning its colorful tail feathers to attract a partner.' },
        { id: 'food', label: 'To find food.', image: 'q2-peacock-food.webp', alt: 'A real peacock looking for food on the ground.' },
        { id: 'rest', label: 'To take a nap.', image: 'q2-peacock-rest.webp', alt: 'A real peacock resting quietly on grass.' }
      ]
    },
    {
      question: 'Why does a lion roar?',
      detail: '',
      cue: 'q3-lion-neutral-cue.webp',
      cueAlt: 'A real lion sitting calmly and looking at the camera.',
      correct: 'here',
      success: 'Correct! A lion roars to tell other lions, I am here!',
      answers: [
        { id: 'here', label: 'To tell other lions, “I am here!”', image: 'q3-lion-roar.webp', alt: 'A real lion roaring to other lions.' },
        { id: 'drink', label: 'To drink water.', image: 'q3-lion-drink.webp', alt: 'A real lion drinking from a waterhole.' },
        { id: 'sleep', label: 'To go to sleep.', image: 'q3-lion-sleep.webp', alt: 'A real lion sleeping under a tree.' }
      ]
    },
    {
      question: 'Why does a bee dance?',
      detail: '',
      cue: 'q4-bee-neutral-cue.webp',
      cueAlt: 'A real honey bee resting calmly on a green leaf.',
      correct: 'food',
      success: 'Correct! A bee dances to show other bees where food is.',
      answers: [
        { id: 'food', label: 'To show other bees where food is.', image: 'q4-bee-dance.webp', alt: 'Real honey bees watching another bee dance on a honeycomb.' },
        { id: 'flower', label: 'To drink from a flower.', image: 'q4-bee-flower.webp', alt: 'A real honey bee drinking nectar from a yellow flower.' },
        { id: 'clean', label: 'To clean its wings.', image: 'q4-bee-clean.webp', alt: 'A real honey bee grooming its wings on a leaf.' }
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
    questionDetail.hidden = !round.detail;
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
