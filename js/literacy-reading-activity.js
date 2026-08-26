(() => {
  const imageBase = '../assets/images/week-1/literacy/activity-page-01/individual';
  const picture = (file, scale = 1) => ({ src: `${imageBase}/${file}`, scale });

  const questions = [
    {
      prompt: 'What is the dog doing?',
      targetSentence: 'The dog is sitting.',
      visual: picture('dog-portrait.png'),
      visualLabel: 'A dog',
      correct: 'dog-sitting',
      choices: [
        { id: 'dog-sitting', ariaLabel: 'Dog sitting', visual: picture('dog-sitting.png') },
        { id: 'dog-running', ariaLabel: 'Dog running', visual: picture('dog-running.png') },
        { id: 'dog-sleeping', ariaLabel: 'Dog sleeping', visual: picture('dog-sleeping.png') }
      ]
    },
    {
      prompt: 'Which animal is yawning?',
      targetSentence: 'The cat is yawning.',
      readTargetSentence: false,
      visual: picture('yawning-cue.png'),
      visualLabel: 'A sleepy question symbol',
      correct: 'cat-yawning',
      choices: [
        { id: 'cat-yawning', ariaLabel: 'Cat yawning', visual: picture('cat-yawning.png') },
        { id: 'rabbit-sleeping', ariaLabel: 'Rabbit sleeping', visual: picture('rabbit-sleeping-q2.png') },
        { id: 'dog-sitting', ariaLabel: 'Dog sitting', visual: picture('dog-sitting.png') }
      ]
    },
    {
      prompt: 'What is the deer doing?',
      targetSentence: 'The deer is walking.',
      visual: picture('deer-portrait.png'),
      visualLabel: 'A deer',
      correct: 'deer-walking',
      choices: [
        { id: 'deer-jumping', ariaLabel: 'Deer jumping', visual: picture('deer-jumping.png', 1.15) },
        { id: 'deer-walking', ariaLabel: 'Deer walking', visual: picture('deer-walking.png', 1.62) },
        { id: 'deer-sleeping', ariaLabel: 'Deer sleeping', visual: picture('deer-sleeping.png', 1.16) }
      ]
    },
    {
      prompt: 'What is the rabbit doing?',
      targetSentence: 'The rabbit is jumping.',
      visual: picture('rabbit-portrait.png'),
      visualLabel: 'A rabbit',
      correct: 'rabbit-jumping',
      choices: [
        { id: 'rabbit-sitting', ariaLabel: 'Rabbit sitting', visual: picture('rabbit-sitting.png', 1.52) },
        { id: 'rabbit-sleeping', ariaLabel: 'Rabbit sleeping', visual: picture('rabbit-sleeping.png', 1.16) },
        { id: 'rabbit-jumping', ariaLabel: 'Rabbit jumping', visual: picture('rabbit-jumping.png', 1.52) }
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
      playTone(523.25, .12, .11, 'triangle');
      playTone(659.25, .14, .1, 'triangle', .11);
      playTone(783.99, .18, .09, 'triangle', .22);
    } else {
      playTone(220, .14, .08, 'sine');
      playTone(174.61, .18, .07, 'sine', .12);
    }
  }

  function speak(text) {
    if (typeof speakAmericanEnglish !== 'function') return Promise.resolve();
    return Promise.resolve(speakAmericanEnglish(text));
  }

  function pause(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
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
    progressDots.innerHTML = questions.map((_, index) => {
      const state = index < questionIndex ? ' is-done' : index === questionIndex ? ' is-current' : '';
      return `<span class="literacy-progress-dot${state}"></span>`;
    }).join('');
  }

  function applyPicture(element, visual) {
    element.className = `${element.dataset.baseClass} literacy-activity-picture`;
    element.replaceChildren();
    const image = document.createElement('img');
    image.src = visual.src;
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    image.style.setProperty('--literacy-picture-scale', String(visual.scale || 1));
    element.appendChild(image);
  }

  function makeChoice(choice, question) {
    const button = document.createElement('button');
    button.className = 'literacy-answer-card';
    button.type = 'button';
    button.dataset.answer = choice.id;
    button.setAttribute('aria-label', choice.ariaLabel);
    button.innerHTML = '<span class="literacy-answer-visual" data-base-class="literacy-answer-visual" aria-hidden="true"></span>';
    applyPicture(button.querySelector('.literacy-answer-visual'), choice.visual);
    button.addEventListener('click', () => checkAnswer(button, choice, question));
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
      ? 'Listen and find the animal doing the action.'
      : question.targetSentence;
    applyPicture(questionVisual, question.visual);
    questionVisual.setAttribute('aria-label', question.visualLabel);
    feedback.textContent = '';
    feedback.className = 'literacy-quiz-feedback';
    answers.innerHTML = '';
    question.choices.forEach(choice => answers.appendChild(makeChoice(choice, question)));
  }

  function showCompletion() {
    progressLabel.textContent = 'Activity complete!';
    progressDots.innerHTML = questions.map(() => '<span class="literacy-progress-dot is-done"></span>').join('');
    document.querySelector('.literacy-question-card').hidden = true;
    answers.hidden = true;
    feedback.hidden = true;
    complete.hidden = false;
    restartButton.focus();
    speak('Great job! You remembered all four animal actions!');
  }

  function checkAnswer(button, choice, question) {
    if (locked) return;

    if (choice.id !== question.correct) {
      locked = true;
      playResultSound(false);
      button.classList.add('is-wrong');
      feedback.textContent = 'Try again! Look carefully at each animal pose.';
      feedback.className = 'literacy-quiz-feedback is-wrong';
      speak('Try again.');
      window.setTimeout(() => {
        button.classList.remove('is-wrong');
        feedback.textContent = '';
        feedback.className = 'literacy-quiz-feedback';
        locked = false;
      }, 650);
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
    }, 1250);
  }

  listenButton.addEventListener('click', readCurrentQuestion);
  restartButton.addEventListener('click', () => {
    questionIndex = 0;
    document.querySelector('.literacy-question-card').hidden = false;
    renderQuestion();
  });

  renderQuestion();
})();
