(() => {
  const ASSET_ROOT = '../assets/images/reading/week-4-activity/';
  const ROUNDS = [
    {
      question: 'What do spiders use to make their webs?',
      detail: 'Spiders use silk to make their webs.',
      answer: 'Spiders use silk to make their webs.',
      showChoiceText: false,
      choices: [
        { label: 'Silk.', image: 'q1-silk.webp', alt: 'A realistic spider produces a fine silk strand while building a web.', correct: true },
        { label: 'Leaves.', image: 'q1-leaves-realistic.webp', alt: 'A realistic spider arranges green leaves between two twigs.' },
        { label: 'Water.', image: 'q1-water.webp', alt: 'A realistic spider stands beside large water droplets between two twigs.' }
      ]
    },
    {
      question: 'Why do spiders make webs?',
      detail: 'Spiders make webs to catch food.',
      answer: 'Spiders make webs to catch food.',
      showChoiceText: false,
      choices: [
        { label: 'To catch food.', image: 'q2-catch-food.webp', alt: 'A realistic spider approaches a fly caught in its web.', correct: true },
        { label: 'To fly in the sky.', image: 'q2-fly-sky.webp', alt: 'A realistic-looking spider flies through the sky with transparent wings.' },
        { label: 'To hide from the rain.', image: 'q2-hide-rain.webp', alt: 'A realistic spider shelters beneath a dry leaf during rain.' }
      ]
    },
    {
      question: "Why can't insects easily get out of a spider web?",
      detail: 'Some parts of the web are sticky.',
      answer: 'Insects cannot easily get out because some parts of the web are sticky.',
      showChoiceText: false,
      choices: [
        { label: 'Some parts of the web are sticky.', image: 'q3-sticky.webp', alt: 'A realistic fly is caught on sticky silk strands with tiny adhesive droplets.', correct: true },
        { label: 'The web is very heavy.', image: 'q3-heavy.webp', alt: 'An unusually thick and heavy web sags between branches.' },
        { label: 'The insects like the web.', image: 'q3-insects-like.webp', alt: 'Several realistic insects gather peacefully around a clean web.' }
      ]
    },
    {
      question: 'What can happen when an insect touches a spider web?',
      detail: 'The web can move or shake when an insect touches it.',
      answer: 'The web can move or shake when an insect touches it.',
      showChoiceText: false,
      choices: [
        { label: 'The web can move or shake.', image: 'q4-shake.webp', alt: 'A realistic web vibrates with natural motion blur when an insect touches it.', correct: true },
        { label: 'The web becomes hard like a rock.', image: 'q4-rock.webp', alt: 'A realistic-looking spider web has transformed into rigid gray stone.' },
        { label: 'The web turns into water.', image: 'q4-water.webp', alt: 'A realistic-looking spider web melts into clear water droplets.' }
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
    speak('Great job! You finished the Spider Web Science Challenge!');
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
    speak('Spider Web Science Challenge. Listen carefully, then choose the right picture!');
  });
  questionSpeaker.addEventListener('click', () => { if (!locked) readQuestion(); });
  completionSpeaker.addEventListener('click', () => {
    stopSpeech();
    speak('Great job! You finished the Spider Web Science Challenge!');
  });
  tryAgain.addEventListener('click', startActivity);
  window.addEventListener('pagehide', stopSpeech);

  startActivity();
})();
