(() => {
  const ASSET_ROOT = '../assets/images/reading/week-4-activity/';
  const ROUNDS = [
    {
      question: 'Why does the rat climb the tree?',
      detail: 'Because it wants the birds eggs.',
      answer: "Because it wants the birds' eggs.",
      showChoiceText: false,
      choices: [
        { label: "Because it wants the birds' eggs.", image: 'q1-eggs.webp', alt: 'A gray rat climbs toward a bird nest with three eggs.', correct: true },
        { label: 'Because it wants to eat the leaves.', image: 'q1-leaves.webp', alt: 'A gray rat eats green leaves on a tree branch.' },
        { label: 'Because it wants to play in the web.', image: 'q1-web.webp', alt: 'A gray rat plays beside an empty spider web.' }
      ]
    },
    {
      question: 'What is Mommy Bird scared of?',
      answer: 'Mommy Bird is scared of the eagle.',
      choices: [
        { label: 'The eagle.', image: 'q2-eagle.webp', alt: 'A worried gray mother bird looks at an eagle flying overhead.', correct: true },
        { label: 'The spider.', image: 'q2-spider.webp', alt: 'A smiling gray mother bird looks calmly at a small spider.' },
        { label: 'The baby bird.', image: 'q2-baby-bird.webp', alt: 'A happy gray mother bird smiles beside a yellow baby bird.' }
      ]
    },
    {
      question: 'How does the spider help the birds?',
      answer: 'Its web warns them that the rat is coming.',
      choices: [
        { label: 'Its web warns them that the rat is coming.', image: 'q3-web-warning.webp', alt: 'A spider web shakes when a rat touches it, warning two birds.', correct: true },
        { label: 'It chases the eagle away.', image: 'q3-chase-eagle.webp', alt: 'A spider chases an eagle while birds watch.' },
        { label: 'It wraps the eggs in its web.', image: 'q3-wrap-eggs.webp', alt: 'A spider wraps eggs in white web inside a nest.' }
      ]
    },
    {
      question: 'What should you do when you feel scared?',
      answer: 'Tell a trusted grown-up.',
      choices: [
        { label: 'Tell a trusted grown-up.', image: 'q4-tell-grownup.webp', alt: 'A worried child tells a kind teacher about feeling scared.', correct: true },
        { label: 'Go closer by yourself.', image: 'q4-go-alone.webp', alt: 'A worried child walks alone toward a dark cave.' },
        { label: 'Keep it a secret.', image: 'q4-keep-secret.webp', alt: 'A worried child sits silently near a caring teacher.' }
      ]
    }
  ];

  const questionText = document.getElementById('question-text');
  const questionDetail = document.getElementById('question-detail');
  const questionSpeaker = document.getElementById('question-speaker');
  const introSpeaker = document.getElementById('intro-speaker');
  const answerGrid = document.getElementById('answer-grid');
  const progressLabel = document.getElementById('progress-label');
  const progressDots = document.getElementById('progress-dots');
  const feedback = document.getElementById('feedback');
  const completion = document.getElementById('completion');
  const completionSpeaker = document.getElementById('completion-speaker');
  const tryAgain = document.getElementById('try-again');

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
    const isAmericanEnglish = (voice) => /^en[-_]US$/i.test(voice.lang || '');
    preferredVoice = voices.find((voice) => isAmericanEnglish(voice) && /jenny|aria|zira|samantha|google|english/i.test(voice.name))
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
    return new Promise((resolve) => window.setTimeout(() => resolve(token === speechToken), milliseconds));
  }

  async function readQuestion() {
    stopSpeech();
    const token = speechToken;
    const round = ROUNDS[roundIndex];
    await speak(round.question, token);
    if (round.detail && token === speechToken) {
      await pause(650, token);
      await speak(round.detail, token);
    }
  }

  function playResultSound(correct) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
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

  function renderProgress() {
    progressLabel.textContent = `Question ${roundIndex + 1} of ${ROUNDS.length}`;
    progressDots.replaceChildren();
    ROUNDS.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'reading-progress-dot';
      if (index < roundIndex) dot.classList.add('is-done');
      if (index === roundIndex) dot.classList.add('is-current');
      progressDots.appendChild(dot);
    });
  }

  function setAnswersDisabled(disabled) {
    answerGrid.querySelectorAll('button').forEach((button) => { button.disabled = disabled; });
  }

  function makeAnswerCard(choice) {
    const card = document.createElement('article');
    card.className = 'reading-answer-card';

    const choiceButton = document.createElement('button');
    choiceButton.className = 'reading-answer-choice';
    choiceButton.type = 'button';
    choiceButton.setAttribute('aria-label', `Choose: ${choice.label}`);

    const image = document.createElement('img');
    image.className = 'reading-answer-picture';
    image.src = `${ASSET_ROOT}${choice.image}`;
    image.alt = choice.alt;
    image.width = 900;
    image.height = 900;

    const label = document.createElement('span');
    label.className = 'reading-answer-label';
    label.textContent = choice.label;

    const listen = document.createElement('button');
    listen.className = 'reading-speaker reading-answer-speaker';
    listen.type = 'button';
    listen.textContent = '🔊';
    listen.setAttribute('aria-label', `Listen to: ${choice.label}`);
    listen.addEventListener('click', (event) => {
      event.stopPropagation();
      if (locked) return;
      stopSpeech();
      speak(choice.label);
    });

    choiceButton.append(image);
    if (ROUNDS[roundIndex].showChoiceText !== false) choiceButton.append(label);
    card.append(choiceButton, listen);
    choiceButton.addEventListener('click', () => checkAnswer(card, choice));
    return card;
  }

  function renderRound({ readAloud = true } = {}) {
    locked = false;
    questionSpeaker.disabled = false;
    feedback.textContent = '';
    feedback.className = 'reading-feedback';
    const round = ROUNDS[roundIndex];
    questionText.textContent = round.question;
    questionDetail.textContent = round.detail || '';
    questionDetail.hidden = !round.detail;
    answerGrid.classList.toggle('is-picture-only', round.showChoiceText === false);
    answerGrid.replaceChildren(...shuffle(round.choices).map(makeAnswerCard));
    renderProgress();
    if (readAloud) window.setTimeout(readQuestion, 380);
  }

  async function checkAnswer(card, choice) {
    if (locked) return;
    locked = true;
    questionSpeaker.disabled = true;
    stopSpeech();
    setAnswersDisabled(true);

    if (!choice.correct) {
      playResultSound(false);
      card.classList.add('is-wrong');
      feedback.textContent = 'Try again!';
      feedback.className = 'reading-feedback is-try';
      await speak('Try again.');
      window.setTimeout(() => {
        card.classList.remove('is-wrong');
        setAnswersDisabled(false);
        feedback.textContent = '';
        feedback.className = 'reading-feedback';
        questionSpeaker.disabled = false;
        locked = false;
      }, 420);
      return;
    }

    playResultSound(true);
    card.classList.add('is-correct');
    feedback.textContent = `Great choice! ${ROUNDS[roundIndex].answer}`;
    feedback.className = 'reading-feedback is-good';
    await speak(`That's right! ${ROUNDS[roundIndex].answer}`);
    await pause(480);

    if (roundIndex < ROUNDS.length - 1) {
      roundIndex += 1;
      renderRound();
      return;
    }

    completion.hidden = false;
    tryAgain.focus();
    stopSpeech();
    speak('Great job! You finished the Bird Watcher Challenge!');
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
    speak('Bird Watcher Challenge. Listen carefully, then choose the right picture!');
  });
  questionSpeaker.addEventListener('click', () => { if (!locked) readQuestion(); });
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Bird Watcher Challenge!');
  });
  tryAgain.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
