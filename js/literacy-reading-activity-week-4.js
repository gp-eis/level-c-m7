(() => {
  const imageBase = '../assets/images/week-4/literacy/activity-page-01/individual';
  const picture = file => ({ src: `${imageBase}/${file}`, scale: 1 });
  const choice = (id, file, ariaLabel) => ({ id, ariaLabel, visual: picture(file) });
  const questions = [
    {
      prompt: 'Where are they going?',
      targetSentence: 'Come with me into the cave.',
      correct: 'cave',
      choices: [
        choice('playground', 'location-playground.png', 'The children are going to a playground'),
        choice('cave', 'location-cave.png', 'The children are going into a cave'),
        choice('classroom', 'location-classroom.png', 'The children are going into a classroom')
      ]
    },
    {
      prompt: 'How must they move inside?',
      targetSentence: 'We must be careful inside.',
      correct: 'careful',
      choices: [
        choice('running', 'move-running.png', 'The children are running fast'),
        choice('jumping', 'move-jumping.png', 'The children are jumping'),
        choice('careful', 'move-carefully.png', 'The children are moving carefully')
      ]
    },
    {
      prompt: 'What is inside the cave?',
      targetSentence: 'There are many scary things.',
      correct: 'scary-things',
      choices: [
        choice('school-things', 'things-school.png', 'Many classroom supplies'),
        choice('scary-things', 'things-scary.png', 'A pumpkin, bug, rat, and ghost inside a cave'),
        choice('picnic-things', 'things-picnic.png', 'Many picnic things')
      ]
    },
    {
      prompt: 'What scary thing is inside the cave?',
      targetSentence: 'The orange pumpkin is scary.',
      correct: 'orange-pumpkin',
      choices: [
        choice('black-bug', 'black-bug.png', 'A black bug'),
        choice('orange-pumpkin', 'orange-pumpkin.png', 'An orange pumpkin'),
        choice('gray-rat', 'gray-rat.png', 'A gray rat')
      ]
    },
    {
      prompt: 'What scary thing is inside the cave?',
      targetSentence: 'The white ghost is scary.',
      correct: 'white-ghost',
      choices: [
        choice('gray-rat', 'gray-rat.png', 'A gray rat'),
        choice('black-bug', 'black-bug.png', 'A black bug'),
        choice('white-ghost', 'white-ghost.png', 'A white ghost')
      ]
    },
    {
      prompt: 'What are you scared of?',
      targetSentence: 'I am scared of monsters.',
      correct: 'monsters',
      choices: [
        choice('skeletons', 'skeletons.png', 'Three skeletons'),
        choice('monsters', 'blue-monster.png', 'A blue monster'),
        choice('bats', 'bats.png', 'Three bats')
      ]
    },
    {
      prompt: 'What are you scared of?',
      targetSentence: 'I am scared of spiders.',
      correct: 'spiders',
      choices: [
        choice('bats', 'bats.png', 'Three bats'),
        choice('spiders', 'spiders.png', 'Three spiders'),
        choice('skeletons', 'skeletons.png', 'Three skeletons')
      ]
    },
    {
      prompt: 'What is it like inside a cave?',
      targetSentence: "It's dark and scary inside a cave.",
      correct: 'dark-scary',
      choices: [
        choice('bright-sunny', 'cave-bright-sunny.png', 'A bright sunny cave'),
        choice('dark-scary', 'cave-dark-scary.png', 'A dark and scary cave'),
        choice('colorful-cheerful', 'cave-colorful-cheerful.png', 'A colorful cheerful cave')
      ]
    }
  ];

  const progressLabel = document.querySelector('#quiz-progress-label');
  const progressDots = document.querySelector('#quiz-progress-dots');
  const questionCard = document.querySelector('.literacy-question-card');
  const questionVisual = document.querySelector('#quiz-question-visual');
  const questionHeading = document.querySelector('#quiz-question');
  const questionDetail = document.querySelector('#quiz-question-detail');
  const listenButton = document.querySelector('#quiz-listen');
  const answers = document.querySelector('#quiz-answers');
  const feedback = document.querySelector('#quiz-feedback');
  const complete = document.querySelector('#quiz-complete');
  const restartButton = document.querySelector('#quiz-restart');

  let questionIndex = 0;
  let score = 0;
  let locked = false;
  let listening = false;
  let narrationTimer = 0;

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
    if (listening || locked || complete.hidden === false) return;
    listening = true;
    listenButton.disabled = true;
    const question = questions[questionIndex];
    try {
      await speak(question.prompt);
      await pause(1000);
      await speak(question.targetSentence);
    } finally {
      listening = false;
      listenButton.disabled = false;
    }
  }

  function renderProgress() {
    progressLabel.textContent = `Question ${questionIndex + 1} of ${questions.length} · Score ${score}`;
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

  function makeChoice(answerChoice, question) {
    const button = document.createElement('button');
    button.className = 'literacy-answer-card';
    button.type = 'button';
    button.dataset.answer = answerChoice.id;
    button.setAttribute('aria-label', answerChoice.ariaLabel);
    button.innerHTML = '<span class="literacy-answer-visual" data-base-class="literacy-answer-visual" aria-hidden="true"></span>';
    applyPicture(button.querySelector('.literacy-answer-visual'), answerChoice.visual);
    button.addEventListener('click', () => checkAnswer(button, answerChoice, question));
    return button;
  }

  function renderQuestion() {
    window.clearTimeout(narrationTimer);
    locked = false;
    complete.hidden = true;
    questionCard.hidden = false;
    answers.hidden = false;
    feedback.hidden = false;
    listenButton.hidden = false;
    const question = questions[questionIndex];
    renderProgress();
    questionHeading.textContent = question.prompt;
    questionDetail.textContent = question.targetSentence;
    questionVisual.className = questionVisual.dataset.baseClass;
    questionVisual.replaceChildren();
    questionVisual.textContent = '👂';
    questionVisual.style.fontSize = 'clamp(3.5rem, 8vw, 5.5rem)';
    questionVisual.setAttribute('aria-label', 'Listen for the clue');
    feedback.textContent = '';
    feedback.className = 'literacy-quiz-feedback';
    answers.replaceChildren(...question.choices.map(answerChoice => makeChoice(answerChoice, question)));
    narrationTimer = window.setTimeout(readCurrentQuestion, 350);
  }

  function showCompletion() {
    progressLabel.textContent = `Activity complete! · Score ${score} of ${questions.length}`;
    progressDots.innerHTML = questions.map(() => '<span class="literacy-progress-dot is-done"></span>').join('');
    questionCard.hidden = true;
    answers.hidden = true;
    feedback.hidden = true;
    complete.hidden = false;
    restartButton.focus();
  }

  async function checkAnswer(button, answerChoice, question) {
    if (locked) return;

    if (answerChoice.id !== question.correct) {
      locked = true;
      playResultSound(false);
      button.classList.add('is-wrong');
      feedback.textContent = 'Try again! Listen and look carefully.';
      feedback.className = 'literacy-quiz-feedback is-wrong';
      await speak('Try again.');
      await pause(300);
      button.classList.remove('is-wrong');
      feedback.textContent = '';
      feedback.className = 'literacy-quiz-feedback';
      locked = false;
      return;
    }

    locked = true;
    score += 1;
    renderProgress();
    playResultSound(true);
    button.classList.add('is-correct');
    answers.querySelectorAll('button').forEach(answer => { answer.disabled = true; });
    feedback.textContent = `That's right! ${question.targetSentence}`;
    feedback.className = 'literacy-quiz-feedback is-correct';
    await speak(`That's right! ${question.targetSentence}`);
    await pause(350);

    if (questionIndex < questions.length - 1) {
      questionIndex += 1;
      renderQuestion();
    } else {
      showCompletion();
    }
  }

  listenButton.addEventListener('click', readCurrentQuestion);
  restartButton.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    questionIndex = 0;
    score = 0;
    renderQuestion();
  });

  renderQuestion();
})();
