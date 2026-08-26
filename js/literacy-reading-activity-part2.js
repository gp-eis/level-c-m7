(() => {
  const imageBase = '../assets/images/week-1/literacy/activity-page-01-part-2/individual';
  const picture = (file, scale = 1) => ({ src: `${imageBase}/${file}`, scale });

  const questions = [
    {
      prompt: 'What is the eagle doing?',
      targetSentence: 'The eagle is hunting.',
      visual: picture('eagle-portrait.png'),
      visualLabel: 'A friendly eagle',
      correct: 'eagle-hunting',
      choices: [
        { id: 'eagle-hunting', ariaLabel: 'Eagle hunting', visual: picture('eagle-hunting.png', 1.04) },
        { id: 'eagle-flying', ariaLabel: 'Eagle flying', visual: picture('eagle-flying.png', 1.08) },
        { id: 'eagle-sleeping', ariaLabel: 'Eagle sleeping', visual: picture('eagle-sleeping.png', 1.1) }
      ]
    },
    {
      prompt: 'What is the duck doing?',
      targetSentence: 'The duck is swimming.',
      visual: picture('duck-portrait.png'),
      visualLabel: 'A white duck',
      correct: 'duck-swimming',
      choices: [
        { id: 'duck-walking', ariaLabel: 'Duck walking', visual: picture('duck-walking.png', 1.1) },
        { id: 'duck-swimming', ariaLabel: 'Duck swimming', visual: picture('duck-swimming.png', 1.12) },
        { id: 'duck-sitting', ariaLabel: 'Duck sitting', visual: picture('duck-sitting.png', 1.1) }
      ]
    },
    {
      prompt: 'What is the bat doing?',
      targetSentence: 'The bat is sleeping.',
      visual: picture('bat-portrait.png'),
      visualLabel: 'A friendly purple bat',
      correct: 'bat-sleeping',
      choices: [
        { id: 'bat-flying', ariaLabel: 'Bat flying', visual: picture('bat-flying.png', 1.08) },
        { id: 'bat-sleeping', ariaLabel: 'Bat sleeping upside down', visual: picture('bat-sleeping.png', 1.04) },
        { id: 'bat-playing', ariaLabel: 'Bat playing with a ball', visual: picture('bat-playing.png', 1.06) }
      ]
    },
    {
      prompt: 'Which animal is playing?',
      targetSentence: 'The squirrel is playing.',
      readTargetSentence: false,
      visual: picture('play-question.png'),
      visualLabel: 'A ball and toy block',
      correct: 'squirrel-playing',
      choices: [
        { id: 'squirrel-playing', ariaLabel: 'Squirrel playing', visual: picture('squirrel-playing.png', 1.06) },
        { id: 'eagle-flying', ariaLabel: 'Eagle flying', visual: picture('eagle-flying.png', 1.08) },
        { id: 'swan-swimming', ariaLabel: 'Swan swimming', visual: picture('swan-swimming.png', 1.06) }
      ]
    }
  ];

  const progressLabel = document.querySelector('#quiz-progress-label');
  const progressDots = document.querySelector('#quiz-progress-dots');
  const questionVisual = document.querySelector('#quiz-question-visual');
  const questionHeading = document.querySelector('#quiz-question');
  const questionDetail = document.querySelector('#quiz-question-detail');
  const listenButton = document.querySelector('#quiz-listen');
  const answers = document.querySelector('#quiz-answers');
  const feedback = document.querySelector('#quiz-feedback');
  const complete = document.querySelector('#quiz-complete');
  const restartButton = document.querySelector('#quiz-restart');

  let questionIndex = 0;
  let locked = false;
  let listening = false;

  function playResultSound(correct) {
    if (typeof playTone !== 'function') return;
    if (correct) {
      playTone(523.25,.12,.11,'triangle');
      playTone(659.25,.14,.1,'triangle',.11);
      playTone(783.99,.18,.09,'triangle',.22);
    } else {
      playTone(220,.14,.08,'sine');
      playTone(174.61,.18,.07,'sine',.12);
    }
  }

  function speak(text) {
    if (typeof speakAmericanEnglish !== 'function') return Promise.resolve();
    return Promise.resolve(speakAmericanEnglish(text));
  }

  function pause(duration) {
    return new Promise(resolve => window.setTimeout(resolve,duration));
  }

  async function readCurrentQuestion() {
    if (listening) return;
    listening = true;
    listenButton.disabled = true;
    const question = questions[questionIndex];
    try {
      await speak(question.prompt);
      if (question.readTargetSentence !== false) {
        await pause(1000);
        await speak(question.targetSentence);
      }
    } finally {
      listening = false;
      listenButton.disabled = false;
    }
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
    progressDots.innerHTML = questions.map((_,index) => {
      const state = index < questionIndex ? ' is-done' : index === questionIndex ? ' is-current' : '';
      return `<span class="literacy-progress-dot${state}"></span>`;
    }).join('');
  }

  function applyPicture(element,visual) {
    element.className = `${element.dataset.baseClass} literacy-activity-picture`;
    element.replaceChildren();
    const image = document.createElement('img');
    image.src = visual.src;
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    image.style.setProperty('--literacy-picture-scale',String(visual.scale || 1));
    element.appendChild(image);
  }

  function makeChoice(choice,question) {
    const button = document.createElement('button');
    button.className = 'literacy-answer-card';
    button.type = 'button';
    button.dataset.answer = choice.id;
    button.setAttribute('aria-label',choice.ariaLabel);
    button.innerHTML = '<span class="literacy-answer-visual" data-base-class="literacy-answer-visual" aria-hidden="true"></span>';
    applyPicture(button.querySelector('.literacy-answer-visual'),choice.visual);
    button.addEventListener('click',() => checkAnswer(button,choice,question));
    return button;
  }

  function renderQuestion() {
    locked = false;
    complete.hidden = true;
    answers.hidden = false;
    feedback.hidden = false;
    listenButton.hidden = false;
    const question = questions[questionIndex];
    renderProgress();
    questionHeading.textContent = question.prompt;
    questionDetail.textContent = question.readTargetSentence === false
      ? 'Look carefully and choose the animal from the video.'
      : question.targetSentence;
    applyPicture(questionVisual,question.visual);
    questionVisual.setAttribute('aria-label',question.visualLabel);
    feedback.textContent = '';
    feedback.className = 'literacy-quiz-feedback';
    answers.innerHTML = '';
    question.choices.forEach(choice => answers.appendChild(makeChoice(choice,question)));
  }

  function showCompletion() {
    progressLabel.textContent = 'Activity complete!';
    progressDots.innerHTML = questions.map(() => '<span class="literacy-progress-dot is-done"></span>').join('');
    document.querySelector('.literacy-question-card').hidden = true;
    answers.hidden = true;
    feedback.hidden = true;
    complete.hidden = false;
    restartButton.focus();
    speak('Great job! You remembered what happened in the park!');
  }

  function checkAnswer(button,choice,question) {
    if (locked) return;
    if (choice.id !== question.correct) {
      locked = true;
      playResultSound(false);
      button.classList.add('is-wrong');
      feedback.textContent = 'Try again! Look carefully at each picture.';
      feedback.className = 'literacy-quiz-feedback is-wrong';
      speak('Try again.');
      window.setTimeout(() => {
        button.classList.remove('is-wrong');
        feedback.textContent = '';
        feedback.className = 'literacy-quiz-feedback';
        locked = false;
      },650);
      return;
    }

    locked = true;
    playResultSound(true);
    button.classList.add('is-correct');
    answers.querySelectorAll('button').forEach(answer => { answer.disabled = true; });
    feedback.textContent = `That's right! ${question.targetSentence}`;
    feedback.className = 'literacy-quiz-feedback is-correct';
    speak(`That's right! ${question.targetSentence}`);
    window.setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        showCompletion();
      }
    },1250);
  }

  listenButton.addEventListener('click',readCurrentQuestion);
  restartButton.addEventListener('click',() => {
    questionIndex = 0;
    document.querySelector('.literacy-question-card').hidden = false;
    renderQuestion();
  });

  renderQuestion();
})();
