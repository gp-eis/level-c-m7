(() => {
  const imageBase = '../assets/images/week-2/literacy/activity-page-01/individual';
  const picture = (file, scale = 1) => ({ src: `${imageBase}/${file}`, scale });

  const objects = {
    grass: { id: 'green-grass', ariaLabel: 'Green grass', visual: picture('green-grass.png', .96) },
    ant: { id: 'brown-ant', ariaLabel: 'A brown ant', visual: picture('brown-ant.png', .96) },
    ladybug: { id: 'red-ladybug', ariaLabel: 'A red ladybug', visual: picture('red-ladybug.png', .96) },
    lotus: { id: 'pink-lotus-flower', ariaLabel: 'A pink lotus flower', visual: picture('pink-lotus-flower.png', .92) },
    fence: { id: 'tall-fence', ariaLabel: 'A tall white fence', visual: picture('tall-fence.png', .9) },
    cactus: { id: 'short-cactus', ariaLabel: 'A short green cactus', visual: picture('short-cactus.png', .9) },
    tree: { id: 'big-tree', ariaLabel: 'A big green tree', visual: picture('big-tree.png', .92) },
    snail: { id: 'small-snail', ariaLabel: 'A small brown snail', visual: picture('small-snail.png', .94) }
  };

  const questions = [
    { prompt: 'What can we find in the garden?', targetSentence: 'We can find green grass.', correct: objects.grass.id, choices: [objects.ant, objects.grass, objects.lotus] },
    { prompt: 'What can we find in the garden?', targetSentence: 'We can find a brown ant.', correct: objects.ant.id, choices: [objects.ladybug, objects.lotus, objects.ant] },
    { prompt: 'What can we find in the garden?', targetSentence: 'We can find a red ladybug.', correct: objects.ladybug.id, choices: [objects.grass, objects.ladybug, objects.ant] },
    { prompt: 'What can we find in the garden?', targetSentence: 'We can find a pink lotus flower.', correct: objects.lotus.id, choices: [objects.lotus, objects.grass, objects.ladybug] },
    { prompt: 'What did I find in the garden?', targetSentence: 'I found a tall fence.', correct: objects.fence.id, choices: [objects.cactus, objects.fence, objects.snail] },
    { prompt: 'What did I find in the garden?', targetSentence: 'I found a short cactus.', correct: objects.cactus.id, choices: [objects.tree, objects.snail, objects.cactus] },
    { prompt: 'What did I find in the garden?', targetSentence: 'I found a big tree.', correct: objects.tree.id, choices: [objects.fence, objects.tree, objects.snail] },
    { prompt: 'What did I find in the garden?', targetSentence: 'I found a small snail.', correct: objects.snail.id, choices: [objects.snail, objects.cactus, objects.tree] }
  ];

  const progressLabel = document.querySelector('#quiz-progress-label');
  const progressDots = document.querySelector('#quiz-progress-dots');
  const scoreLabel = document.querySelector('#quiz-score-label');
  const questionHeading = document.querySelector('#quiz-question');
  const questionDetail = document.querySelector('#quiz-question-detail');
  const listenButton = document.querySelector('#quiz-listen');
  const answers = document.querySelector('#quiz-answers');
  const feedback = document.querySelector('#quiz-feedback');
  const complete = document.querySelector('#quiz-complete');
  const restartButton = document.querySelector('#quiz-restart');
  const questionCard = document.querySelector('.literacy-question-card');

  let questionIndex = 0;
  let score = 0;
  let locked = false;
  let narrationId = 0;

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
    return Promise.resolve(speakAmericanEnglish(text, { rate: .82, pitch: 1.04 }));
  }

  function pause(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
  }

  function stopNarration() {
    narrationId += 1;
    listenButton.disabled = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  async function readCurrentQuestion() {
    const currentId = ++narrationId;
    const question = questions[questionIndex];
    listenButton.disabled = true;
    try {
      await speak(question.prompt);
      if (currentId !== narrationId) return;
      await pause(1000);
      if (currentId !== narrationId) return;
      await speak(question.targetSentence);
    } finally {
      if (currentId === narrationId) listenButton.disabled = false;
    }
  }

  function renderStatus() {
    progressLabel.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
    scoreLabel.textContent = `Score: ${score} / ${questions.length}`;
    progressDots.innerHTML = questions.map((_, index) => {
      const state = index < questionIndex ? ' is-done' : index === questionIndex ? ' is-current' : '';
      return `<span class="literacy-progress-dot${state}"></span>`;
    }).join('');
  }

  function applyPicture(element, visual) {
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
    button.innerHTML = '<span class="literacy-answer-visual literacy-activity-picture" aria-hidden="true"></span>';
    applyPicture(button.querySelector('.literacy-answer-visual'), choice.visual);
    button.addEventListener('click', () => checkAnswer(button, choice, question));
    return button;
  }

  function renderQuestion() {
    stopNarration();
    locked = false;
    complete.hidden = true;
    questionCard.hidden = false;
    answers.hidden = false;
    feedback.hidden = false;
    listenButton.hidden = false;
    const question = questions[questionIndex];
    renderStatus();
    questionHeading.textContent = question.prompt;
    questionDetail.textContent = question.targetSentence;
    feedback.textContent = '';
    feedback.className = 'literacy-quiz-feedback';
    answers.replaceChildren();
    question.choices.forEach(choice => answers.appendChild(makeChoice(choice, question)));

    const expectedIndex = questionIndex;
    window.setTimeout(() => {
      if (!locked && questionIndex === expectedIndex) readCurrentQuestion();
    }, 350);
  }

  function showCompletion() {
    progressLabel.textContent = 'Activity complete!';
    scoreLabel.textContent = `Score: ${score} / ${questions.length}`;
    progressDots.innerHTML = questions.map(() => '<span class="literacy-progress-dot is-done"></span>').join('');
    questionCard.hidden = true;
    answers.hidden = true;
    feedback.hidden = true;
    complete.hidden = false;
    restartButton.focus();
  }

  async function checkAnswer(button, choice, question) {
    if (locked) return;
    stopNarration();
    listenButton.disabled = true;

    if (choice.id !== question.correct) {
      locked = true;
      playResultSound(false);
      button.classList.add('is-wrong');
      feedback.textContent = 'Try again! Listen closely to the garden clue.';
      feedback.className = 'literacy-quiz-feedback is-wrong';
      await Promise.all([speak('Try again.'), pause(650)]);
      button.classList.remove('is-wrong');
      feedback.textContent = '';
      feedback.className = 'literacy-quiz-feedback';
      locked = false;
      listenButton.disabled = false;
      return;
    }

    locked = true;
    score += 1;
    renderStatus();
    playResultSound(true);
    button.classList.add('is-correct');
    answers.querySelectorAll('button').forEach(answer => { answer.disabled = true; });
    feedback.textContent = `Great job! ${question.targetSentence}`;
    feedback.className = 'literacy-quiz-feedback is-correct';
    await speak(`Great job! ${question.targetSentence}`);
    await pause(350);

    if (questionIndex < questions.length - 1) {
      questionIndex += 1;
      renderQuestion();
    } else {
      showCompletion();
    }
  }

  listenButton.addEventListener('click', () => {
    if (!locked) readCurrentQuestion();
  });
  restartButton.addEventListener('click', () => {
    questionIndex = 0;
    score = 0;
    renderQuestion();
  });

  renderQuestion();
})();
