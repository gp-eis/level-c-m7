(() => {
  const IMAGE_BASE = '../assets/images/reading/week-3-qa/';
  const ROUNDS = [
    {
      kind: 'Story Question',
      question: 'What did Momo wear on his ear?',
      correctFeedback: 'That’s right! Momo wore a red flower on his ear.',
      answers: [
        { label: 'A red flower.', image: 'q1-red-flower.webp', alt: 'Momo wears a red flower on his ear.', correct: true },
        { label: 'A green leaf.', image: 'q1-green-leaf.webp', alt: 'Momo wears a green leaf on his ear.', correct: false },
        { label: 'A blue hat.', image: 'q1-blue-hat.webp', alt: 'Momo wears a blue hat.', correct: false }
      ]
    },
    {
      kind: 'Story Question',
      question: 'What did Momo realize after copying his friends?',
      correctFeedback: 'That’s right! Momo realized that copying his friends did not feel right for him.',
      answers: [
        { label: 'Copying them did not feel right for him.', image: 'q2-copying-feels-wrong.webp', alt: 'Momo looks uncomfortable while copying his friends.', correct: true },
        { label: 'He could do everything better than them.', image: 'q2-better-than-friends.webp', alt: 'Momo proudly holds a trophy while his friends watch.', correct: false },
        { label: 'He wanted to copy them all day.', image: 'q2-copy-all-day.webp', alt: 'Momo eagerly copies the same pose as his friends.', correct: false }
      ]
    },
    {
      kind: 'Story Question',
      question: 'What did Momo do after he felt sad?',
      correctFeedback: 'That’s right! Momo made a silly, droopy face.',
      answers: [
        { label: 'He made a silly, droopy face.', image: 'q3-funny-face.webp', alt: 'Momo makes a silly, droopy face.', correct: true },
        { label: 'He put on another flower.', image: 'q3-another-flower.webp', alt: 'Momo wears two red flowers.', correct: false },
        { label: 'He went to sleep.', image: 'q3-sleep.webp', alt: 'Momo sleeps peacefully in the warm sunlight.', correct: false }
      ]
    },
    {
      kind: 'Folktale Lesson',
      question: 'What did Momo learn at the end?',
      correctFeedback: 'That’s right! Momo learned that he liked being himself.',
      answers: [
        { label: 'He liked being himself.', image: 'q4-like-being-himself.webp', alt: 'Momo happily makes his own funny face while his friends smile.', correct: true },
        { label: 'He had to keep copying his friends.', image: 'q4-keep-copying.webp', alt: 'Momo copies the same pose as his friends.', correct: false },
        { label: 'He should stay away from his friends.', image: 'q4-stay-away.webp', alt: 'Momo sits alone far away from his friends.', correct: false }
      ]
    }
  ];

  const introSpeaker = document.getElementById('reading-qa-intro-speaker');
  const questionKicker = document.getElementById('reading-qa-question-kicker');
  const questionText = document.getElementById('reading-qa-question');
  const questionSpeaker = document.getElementById('reading-qa-question-speaker');
  const answers = document.getElementById('reading-qa-answers');
  const feedback = document.getElementById('reading-qa-feedback');
  const progressLabel = document.getElementById('reading-qa-progress-label');
  const progressDots = document.getElementById('reading-qa-progress-dots');
  const completion = document.getElementById('reading-qa-completion');
  const completionSpeaker = document.getElementById('reading-qa-completion-speaker');
  const tryAgain = document.getElementById('reading-qa-try-again');
  if (!questionText || !answers) return;

  let roundIndex = 0;
  let locked = false;
  let speechToken = 0;
  let preferredVoice = null;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  }

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const isAmericanEnglish = voice => /^en[-_]US$/i.test(voice.lang || '');
    preferredVoice = voices.find(voice => isAmericanEnglish(voice) && /jenny|aria|zira|samantha|google|english/i.test(voice.name))
      || voices.find(isAmericanEnglish)
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
    return new Promise(resolve => {
      if (!text || token !== speechToken || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      let settled = false;
      let fallbackTimer = 0;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.pitch = 1.06;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
      fallbackTimer = window.setTimeout(finish, Math.max(1500, Math.min(5200, text.length * 55 + 650)));
    });
  }

  function pause(milliseconds, token = speechToken) {
    return new Promise(resolve => window.setTimeout(() => resolve(token === speechToken), milliseconds));
  }

  function playResultSound(correct) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = correct ? [523, 659, 784] : [220, 175];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * .09;
      oscillator.type = correct ? 'sine' : 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? .14 : .055, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .2);
    });
  }

  function setAnswerButtonsDisabled(disabled) {
    answers.querySelectorAll('.reading-qa-answer').forEach(card => {
      card.setAttribute('aria-disabled', String(disabled));
    });
    answers.querySelectorAll('.reading-qa-answer-speaker').forEach(button => {
      button.disabled = disabled;
    });
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.innerHTML = '';
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-qa-progress-dot';
      if (index < roundIndex) dot.classList.add('is-done');
      if (index === roundIndex) dot.classList.add('is-current');
      progressDots.appendChild(dot);
    });
  }

  function readQuestion() {
    if (locked) return;
    stopSpeech();
    speak(ROUNDS[roundIndex].question);
  }

  function makeAnswerCard(answer) {
    const card = document.createElement('div');
    card.className = 'reading-qa-answer';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-disabled', 'false');
    card.setAttribute('aria-label', answer.label);

    const image = document.createElement('img');
    image.className = 'reading-qa-answer-image';
    image.src = IMAGE_BASE + answer.image;
    image.alt = answer.alt;
    image.width = 1254;
    image.height = 1254;

    const label = document.createElement('span');
    label.className = 'reading-qa-answer-label';
    label.textContent = answer.label;

    const speaker = document.createElement('button');
    speaker.className = 'reading-qa-speaker reading-qa-answer-speaker';
    speaker.type = 'button';
    speaker.textContent = '🔊';
    speaker.setAttribute('aria-label', `Listen to answer: ${answer.label}`);
    speaker.addEventListener('click', event => {
      event.stopPropagation();
      if (locked) return;
      stopSpeech();
      speak(answer.label);
    });

    card.append(image, label, speaker);
    card.addEventListener('click', () => checkAnswer(card, answer));
    card.addEventListener('keydown', event => {
      if (event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      checkAnswer(card, answer);
    });
    return card;
  }

  function renderRound({ readAloud = true } = {}) {
    locked = false;
    questionSpeaker.disabled = false;
    feedback.textContent = '';
    feedback.className = 'reading-qa-feedback';
    const round = ROUNDS[roundIndex];
    questionKicker.textContent = round.kind;
    questionText.textContent = round.question;
    answers.innerHTML = '';
    shuffle(round.answers).forEach(answer => answers.appendChild(makeAnswerCard(answer)));
    renderProgress();
    if (readAloud) window.setTimeout(readQuestion, 380);
  }

  async function checkAnswer(card, answer) {
    if (locked) return;
    locked = true;
    questionSpeaker.disabled = true;
    stopSpeech();
    setAnswerButtonsDisabled(true);

    if (!answer.correct) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedback.textContent = 'Try again!';
      feedback.className = 'reading-qa-feedback is-try';
      await speak('Try again. Look at all three pictures.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        feedback.textContent = '';
        feedback.className = 'reading-qa-feedback';
        setAnswerButtonsDisabled(false);
        questionSpeaker.disabled = false;
        locked = false;
      }, 420);
      return;
    }

    playResultSound(true);
    card.classList.add('is-correct');
    feedback.textContent = 'Great choice!';
    feedback.className = 'reading-qa-feedback is-good';
    await speak(ROUNDS[roundIndex].correctFeedback);
    await pause(480);

    if (roundIndex < ROUNDS.length - 1) {
      roundIndex += 1;
      renderRound();
      return;
    }

    completion.hidden = false;
    tryAgain.focus();
    stopSpeech();
    speak('Great job! You finished the Monkey, the Copycat activity!');
  }

  function startActivity() {
    stopSpeech();
    roundIndex = 0;
    completion.hidden = true;
    renderRound();
  }

  introSpeaker.addEventListener('click', () => {
    if (locked) return;
    stopSpeech();
    speak('Jungle Story Challenge. Listen carefully, then choose the best picture!');
  });
  questionSpeaker.addEventListener('click', readQuestion);
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Monkey, the Copycat activity!');
  });
  tryAgain.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
