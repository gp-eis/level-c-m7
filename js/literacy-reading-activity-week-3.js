(() => {
  const imageBase = '../assets/images/week-3/literacy/activity-page-01/choices';
  const picture = file => ({ src: `${imageBase}/${file}`, scale: 1 });
  const choice = (id, file, ariaLabel) => ({ id, ariaLabel, visual: picture(file) });
  const questions = [
    {
      prompt: 'What is the dog barking at?',
      targetSentence: 'The dog is barking at the gray moon.',
      correct: 'gray-moon',
      choices: [
        choice('brown-owl', 'q1-brown-owl.png', 'The dog is barking at a brown owl'),
        choice('gray-moon', 'q1-gray-moon.png', 'The dog is barking at the gray moon'),
        choice('purple-scooter', 'q1-purple-scooter.png', 'The dog is barking at a purple scooter')
      ]
    },
    {
      prompt: 'What is the dog barking at?',
      targetSentence: 'The dog is barking at the purple scooter.',
      correct: 'purple-scooter',
      choices: [
        choice('purple-scooter', 'q2-purple-scooter.png', 'The dog is barking at the purple scooter'),
        choice('blue-car', 'q2-blue-car.png', 'The dog is barking at a blue car'),
        choice('gray-moon', 'q2-gray-moon.png', 'The dog is barking at the gray moon')
      ]
    },
    {
      prompt: 'What is the dog barking at?',
      targetSentence: 'The dog is barking at the brown owl.',
      correct: 'brown-owl',
      choices: [
        choice('blue-car', 'q3-blue-car.png', 'The dog is barking at a blue car'),
        choice('gray-moon', 'q3-gray-moon.png', 'The dog is barking at the gray moon'),
        choice('brown-owl', 'q3-brown-owl.png', 'The dog is barking at a brown owl')
      ]
    },
    {
      prompt: 'What is the dog barking at?',
      targetSentence: 'The dog is barking at the blue car.',
      correct: 'blue-car',
      choices: [
        choice('purple-scooter', 'q4-purple-scooter.png', 'The dog is barking at a purple scooter'),
        choice('blue-car', 'q4-blue-car.png', 'The dog is barking at a blue car'),
        choice('brown-owl', 'q4-brown-owl.png', 'The dog is barking at a brown owl')
      ]
    },
    {
      prompt: 'Where is the boy?',
      targetSentence: 'The boy is on the scooter.',
      correct: 'boy-on-scooter',
      choices: [
        choice('boy-behind-scooter', 'q5-boy-behind-scooter.png', 'The boy is behind the scooter'),
        choice('boy-beside-scooter', 'q5-boy-beside-scooter.png', 'The boy is beside the scooter'),
        choice('boy-on-scooter', 'q5-boy-on-scooter.png', 'The boy is on the scooter')
      ]
    },
    {
      prompt: 'Where is the moon?',
      targetSentence: 'The moon is above the tree.',
      correct: 'moon-above-tree',
      choices: [
        choice('moon-above-tree', 'q6-moon-above-tree.png', 'The moon is above the tree'),
        choice('moon-under-tree', 'q6-moon-under-tree.png', 'The moon is under the tree'),
        choice('moon-beside-tree', 'q6-moon-beside-tree.png', 'The moon is beside the tree')
      ]
    },
    {
      prompt: 'Where is the cat?',
      targetSentence: 'The cat is under the car.',
      correct: 'cat-under-car',
      choices: [
        choice('cat-on-car', 'q7-cat-on-car.png', 'The cat is on the car'),
        choice('cat-under-car', 'q7-cat-under-car.png', 'The cat is under the car'),
        choice('cat-beside-car', 'q7-cat-beside-car.png', 'The cat is beside the car')
      ]
    },
    {
      prompt: 'Where is the rabbit?',
      targetSentence: 'The rabbit is behind the dog.',
      correct: 'rabbit-behind-dog',
      choices: [
        choice('rabbit-beside-dog', 'q8-rabbit-beside-dog.png', 'The rabbit is beside the dog'),
        choice('rabbit-in-front-of-dog', 'q8-rabbit-in-front-of-dog.png', 'The rabbit is in front of the dog'),
        choice('rabbit-behind-dog', 'q8-rabbit-behind-dog.png', 'The rabbit is behind the dog')
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
