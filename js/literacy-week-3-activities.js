(() => {
  const week = Number(document.body.dataset.week);
  const page = Number(document.body.dataset.page);
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (week !== 3 || page < 2 || page > 7 || !wrap || !worksheetImage) return;

  function speak(text) {
    if (typeof speakAmericanEnglish !== 'function') return Promise.resolve();
    return Promise.resolve(speakAmericanEnglish(text, { rate: .86, pitch: 1.04 }));
  }

  function playAnswerSound(correct) {
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

  function attributeText(text) {
    return String(text).replace(/[&"<>]/g, character => ({
      '&': '&amp;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;'
    })[character]);
  }

  function createStage(className) {
    const stage = document.createElement('div');
    stage.className = `w3-activity-stage ${className}`;
    worksheetImage.before(stage);
    stage.appendChild(worksheetImage);
    wrap.classList.add('w3-interactive-wrap');
    const buildNote = document.querySelector('.activity-build-note');
    if (buildNote) buildNote.remove();
    return stage;
  }

  function addFeedback(text) {
    wrap.insertAdjacentHTML('afterend', `<p class="w3-activity-feedback" aria-live="polite">${text}</p>`);
    return document.querySelector('.w3-activity-feedback');
  }

  function speakerMarkup(className, text) {
    const safeText = attributeText(text);
    return `<button class="w3-speaker ${className}" type="button" data-speak="${safeText}" aria-label="Listen: ${safeText}"><span aria-hidden="true">&#128266;</span></button>`;
  }

  function wireSpeakers(root) {
    root.querySelectorAll('[data-speak]').forEach(button => {
      button.addEventListener('click', () => speak(button.dataset.speak));
    });
  }

  function counterMarkup(className, index, label) {
    return `
      <div class="w3-counter ${className}" data-counter="${index}">
        <output class="w3-counter-value" aria-live="polite" aria-label="${attributeText(label)}">0</output>
        <div class="w3-counter-steps" aria-label="Change ${attributeText(label)}">
          <button class="w3-counter-step" type="button" data-step="1" aria-label="Increase ${attributeText(label)}">&#9650;</button>
          <button class="w3-counter-step" type="button" data-step="-1" aria-label="Decrease ${attributeText(label)}">&#9660;</button>
        </div>
        <button class="w3-counter-go" type="button">Go</button>
        <span class="w3-counter-status" aria-hidden="true"></span>
      </div>`;
  }

  function bindCounter(control, options) {
    const output = control.querySelector('.w3-counter-value');
    const status = control.querySelector('.w3-counter-status');
    const stepButtons = [...control.querySelectorAll('.w3-counter-step')];
    const goButton = control.querySelector('.w3-counter-go');
    let value = 0;

    stepButtons.forEach(button => {
      button.addEventListener('click', () => {
        value = Math.max(0, Math.min(options.max || 24, value + Number(button.dataset.step)));
        output.textContent = String(value);
        control.classList.remove('is-wrong');
        status.textContent = '';
      });
    });

    goButton.addEventListener('click', () => {
      const correct = value === options.answer;
      control.classList.remove('is-wrong');
      void control.offsetWidth;
      control.classList.toggle('is-correct', correct);
      control.classList.toggle('is-wrong', !correct);
      status.textContent = correct ? '\u2713' : '\u00d7';
      playAnswerSound(correct);
      options.onResult(correct, value);
      if (correct) {
        stepButtons.forEach(button => { button.disabled = true; });
        goButton.disabled = true;
      }
    });
  }

  function buildCounters(stage, items, classPrefix, feedback, options = {}) {
    stage.insertAdjacentHTML('beforeend', items.map((item, index) => `
      ${speakerMarkup(`${classPrefix}-speaker ${classPrefix}-speaker-${item.position}`, item.prompt)}
      ${counterMarkup(`${classPrefix}-counter ${classPrefix}-counter-${item.position}`, index, item.label)}
    `).join(''));
    wireSpeakers(stage);
    stage.querySelectorAll('.w3-counter').forEach(control => {
      const item = items[Number(control.dataset.counter)];
      bindCounter(control, {
        answer: item.answer,
        max: options.max || 24,
        onResult(correct) {
          feedback.textContent = correct ? item.correctText : options.retryText;
          speak(correct ? item.correctText : options.retrySpeech || 'Try again.');
        }
      });
    });
  }

  function addTraceBoard(stage, word, feedback) {
    const traceButton = stage.querySelector('.w3p2-trace-word');
    const traceResult = stage.querySelector('.w3p2-trace-result');
    const overlay = document.createElement('div');
    overlay.className = 'w3-trace-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'w3-trace-title');
    overlay.innerHTML = `
      <section class="w3-trace-board">
        <button class="w3-trace-close" type="button" aria-label="Close tracing board">&times;</button>
        <h2 id="w3-trace-title">Trace the word</h2>
        <p>Follow the gray letters with your finger or mouse.</p>
        <div class="w3-canvas-shell">
          <span class="w3-trace-guide" aria-hidden="true">${word}</span>
          <canvas class="w3-trace-canvas" width="900" height="280" aria-label="Drawing board for tracing the word ${word}"></canvas>
        </div>
        <p class="w3-trace-feedback" aria-live="polite"></p>
        <div class="w3-trace-actions">
          <button class="pill-btn blue w3-trace-clear" type="button">Clear</button>
          <button class="pill-btn green w3-trace-go" type="button">Go</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.w3-trace-close');
    const clearButton = overlay.querySelector('.w3-trace-clear');
    const goButton = overlay.querySelector('.w3-trace-go');
    const traceFeedback = overlay.querySelector('.w3-trace-feedback');
    const canvas = overlay.querySelector('.w3-trace-canvas');
    const context = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;

    function openBoard() {
      overlay.hidden = false;
      document.body.classList.add('w3-trace-open');
      traceFeedback.textContent = '';
      closeButton.focus();
    }

    function closeBoard() {
      overlay.hidden = true;
      document.body.classList.remove('w3-trace-open');
      traceButton.focus();
    }

    function canvasPoint(event) {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
        y: (event.clientY - bounds.top) * (canvas.height / bounds.height)
      };
    }

    function startDrawing(event) {
      drawing = true;
      hasInk = true;
      canvas.setPointerCapture(event.pointerId);
      const point = canvasPoint(event);
      context.beginPath();
      context.moveTo(point.x, point.y);
    }

    function draw(event) {
      if (!drawing) return;
      const point = canvasPoint(event);
      context.lineTo(point.x, point.y);
      context.stroke();
    }

    function stopDrawing(event) {
      if (!drawing) return;
      drawing = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 18;
    context.strokeStyle = '#1476d4';
    traceButton.addEventListener('click', openBoard);
    closeButton.addEventListener('click', closeBoard);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeBoard(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) closeBoard(); });
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);

    clearButton.addEventListener('click', () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      traceFeedback.textContent = '';
    });

    function croppedInkDataUrl() {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width;
      let right = -1;
      let top = canvas.height;
      let bottom = -1;

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (pixels[((y * canvas.width + x) * 4) + 3] === 0) continue;
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }

      if (right < left || bottom < top) return canvas.toDataURL('image/png');
      const padding = 10;
      left = Math.max(0, left - padding);
      right = Math.min(canvas.width - 1, right + padding);
      top = Math.max(0, top - padding);
      bottom = Math.min(canvas.height - 1, bottom + padding);
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = right - left + 1;
      croppedCanvas.height = bottom - top + 1;
      croppedCanvas.getContext('2d').drawImage(
        canvas,
        left,
        top,
        croppedCanvas.width,
        croppedCanvas.height,
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height
      );
      return croppedCanvas.toDataURL('image/png');
    }

    goButton.addEventListener('click', () => {
      if (!hasInk) {
        traceFeedback.textContent = `Trace the word ${word} first.`;
        playAnswerSound(false);
        speak(`Trace the word ${word} first.`);
        return;
      }
      traceResult.src = croppedInkDataUrl();
      traceResult.hidden = false;
      traceButton.classList.add('is-complete');
      feedback.textContent = `Great tracing! You wrote ${word}.`;
      playAnswerSound(true);
      speak(`Great tracing! You wrote ${word}.`);
      closeBoard();
    });
  }

  function initPage2() {
    const items = [
      { position: 'one', label: 'triangles answer', prompt: 'How many triangles make up the snake?', answer: 5, correctText: 'Correct! Five triangles make up the snake.' },
      { position: 'two', label: 'squares answer', prompt: 'How many squares make up the snake?', answer: 1, correctText: 'Correct! One square makes up the snake.' },
      { position: 'three', label: 'parallelograms answer', prompt: 'How many parallelograms make up the snake?', answer: 1, correctText: 'Correct! One parallelogram makes up the snake.' }
    ];
    const stage = createStage('w3p2-stage');
    stage.insertAdjacentHTML('beforeend', `
      ${speakerMarkup('w3p2-sentence-speaker', 'I am a snake.')}
      <button class="w3p2-trace-word" type="button" aria-label="Open the tracing board for the word snake"><span class="sr-only">Trace the word snake</span></button>
      <img class="w3p2-trace-result" alt="Your handwritten word snake" hidden>
    `);
    const feedback = addFeedback('Trace the word snake and answer all three shape questions.');
    buildCounters(stage, items, 'w3p2', feedback, {
      max: 10,
      retryText: 'Try again. Count each shape carefully.',
      retrySpeech: 'Try again. Count each shape carefully.'
    });
    addTraceBoard(stage, 'snake', feedback);
  }

  function initPage3() {
    const items = [
      { position: 'one', label: 'snakes hanging on branches', displayText: 'snakes are hanging on branches.', prompt: 'How many snakes are hanging on branches?', answer: 2, correctText: 'Correct! Two snakes are hanging on branches.' },
      { position: 'two', label: 'snakes on trees', displayText: 'snakes are on trees.', prompt: 'How many snakes are on trees?', answer: 4, correctText: 'Correct! Four snakes are on trees.' },
      { position: 'three', label: 'snakes behind flowers', displayText: 'snakes are behind flowers.', prompt: 'How many snakes are behind flowers?', answer: 2, correctText: 'Correct! Two snakes are behind flowers.' },
      { position: 'four', label: 'snakes on the ground', displayText: 'snakes are on the ground.', prompt: 'How many snakes are on the ground?', answer: 2, correctText: 'Correct! Two snakes are on the ground.' }
    ];
    const snakes = [
      { position: 'hanging-left', speech: 'I am hanging on a branch.' },
      { position: 'hanging-right', speech: 'I am hanging on a branch.' },
      { position: 'tree-yellow', speech: 'I am on the tree.' },
      { position: 'tree-pink', speech: 'I am on the tree.' },
      { position: 'tree-red', speech: 'I am on the tree.' },
      { position: 'tree-green', speech: 'I am on the tree.' },
      { position: 'ground-pink', speech: 'I am behind the flowers and on the ground.' },
      { position: 'ground-orange', speech: 'I am behind the flowers and on the ground.' }
    ];
    const stage = createStage('w3p3-stage');
    stage.insertAdjacentHTML('beforeend', `
      ${items.map(item => `<span class="w3p3-row-label w3p3-row-label-${item.position}">${attributeText(item.displayText)}</span>`).join('')}
      ${snakes.map(snake => `
        <button class="w3p3-snake w3p3-snake-${snake.position}" type="button" data-speak="${attributeText(snake.speech)}" aria-label="Listen to this snake: ${attributeText(snake.speech)}">
          <span class="sr-only">${attributeText(snake.speech)}</span>
        </button>
      `).join('')}
    `);
    const feedback = addFeedback('Look carefully at the picture. Count the snakes in each place.');
    buildCounters(stage, items, 'w3p3', feedback, {
      max: 10,
      retryText: 'Try again. Look at where each snake is.',
      retrySpeech: 'Try again. Look carefully at where each snake is.'
    });
    stage.querySelectorAll('.w3p3-snake').forEach(snake => {
      snake.addEventListener('click', () => {
        snake.classList.remove('is-speaking');
        void snake.offsetWidth;
        snake.classList.add('is-speaking');
        window.setTimeout(() => snake.classList.remove('is-speaking'), 650);
      });
    });
  }

  function initPage4() {
    const items = [
      { position: 'upper-left', label: 'five plus four meters', prompt: 'Five meters plus four meters. What is the total length?', answer: 9, correctText: 'Correct! Five plus four equals nine meters.' },
      { position: 'upper-right', label: 'nine plus seven meters', prompt: 'Nine meters plus seven meters. What is the total length?', answer: 16, correctText: 'Correct! Nine plus seven equals sixteen meters.' },
      { position: 'lower-left', label: 'six plus eight meters', prompt: 'Six meters plus eight meters. What is the total length?', answer: 14, correctText: 'Correct! Six plus eight equals fourteen meters.' },
      { position: 'lower-right', label: 'five plus three meters', prompt: 'Five meters plus three meters. What is the total length?', answer: 8, correctText: 'Correct! Five plus three equals eight meters.' }
    ];
    const stage = createStage('w3p4-stage');
    const feedback = addFeedback('Add the two snake lengths. Use the arrows, then press Go.');
    buildCounters(stage, items, 'w3p4', feedback, {
      max: 20,
      retryText: 'Try again. Add the two lengths together.',
      retrySpeech: 'Try again. Add the two lengths together.'
    });
  }

  function initPage5() {
    const items = [
      { position: 'upper-left', label: 'hours from nine A M to one P M', prompt: 'From nine A M to one P M. How many hours passed?', answer: 4, correctText: 'Correct! Four hours passed.' },
      { position: 'upper-right', label: 'hours from three P M to ten P M', prompt: 'From three P M to ten P M. How many hours passed?', answer: 7, correctText: 'Correct! Seven hours passed.' },
      { position: 'lower-left', label: 'hours from eight A M to eleven A M', prompt: 'From eight A M to eleven A M. How many hours passed?', answer: 3, correctText: 'Correct! Three hours passed.' },
      { position: 'lower-right', label: 'hours from four P M to two A M', prompt: 'From four P M to two A M the next day. How many hours passed?', answer: 10, correctText: 'Correct! Ten hours passed.' }
    ];
    const stage = createStage('w3p5-stage');
    const feedback = addFeedback('Count forward from the first time to the second time.');
    buildCounters(stage, items, 'w3p5', feedback, {
      max: 12,
      retryText: 'Try again. Count each hour from the start time to the end time.',
      retrySpeech: 'Try again. Count forward one hour at a time.'
    });
  }

  function initPage6() {
    const rules = [
      { position: 'left-one', sentence: 'Pet the animals.', resultSentence: 'You should not pet the animals.', answer: 'X' },
      { position: 'right-one', sentence: 'Watch from far away.', resultSentence: 'You should watch from far away.', answer: 'O' },
      { position: 'left-two', sentence: 'Walk carefully.', resultSentence: 'You should walk carefully.', answer: 'O' },
      { position: 'right-two', sentence: 'Feed snacks to the animals.', resultSentence: 'You should not feed snacks to the animals.', answer: 'X' },
      { position: 'left-three', sentence: 'Listen to the guide.', resultSentence: 'You should listen to the guide.', answer: 'O' },
      { position: 'right-three', sentence: 'Throw trash on the ground.', resultSentence: 'You should not throw trash on the ground.', answer: 'X' },
      { position: 'left-four', sentence: 'Shout and scream.', resultSentence: 'You should not shout and scream.', answer: 'X' },
      { position: 'right-four', sentence: 'Stay on the path.', resultSentence: 'You should stay on the path.', answer: 'O' }
    ];
    const stage = createStage('w3p6-stage');
    stage.insertAdjacentHTML('beforeend', rules.map((rule, index) => `
      ${speakerMarkup(`w3p6-speaker w3p6-speaker-${rule.position}`, rule.sentence)}
      <div class="w3p6-rule w3p6-rule-${rule.position}" data-rule="${index}">
        <div class="w3p6-choices" role="group" aria-label="Choose O or X for ${attributeText(rule.sentence)}">
          <button class="w3p6-choice" type="button" data-choice="O">O</button>
          <button class="w3p6-choice" type="button" data-choice="X">X</button>
        </div>
        <span class="w3p6-status" aria-hidden="true"></span>
      </div>
    `).join(''));
    const feedback = addFeedback('Listen to each jungle rule. Choose O for a safe choice or X for an unsafe choice.');
    const completed = new Set();
    wireSpeakers(stage);

    stage.querySelectorAll('.w3p6-rule').forEach(control => {
      const index = Number(control.dataset.rule);
      const rule = rules[index];
      const choices = [...control.querySelectorAll('.w3p6-choice')];
      const status = control.querySelector('.w3p6-status');
      choices.forEach(button => {
        button.setAttribute('aria-label', `Choose ${button.dataset.choice} for ${rule.sentence}`);
        button.addEventListener('click', () => {
          const correct = button.dataset.choice === rule.answer;
          choices.forEach(choice => choice.classList.remove('is-selected', 'is-wrong-choice'));
          control.classList.remove('is-wrong');
          if (correct) {
            button.classList.add('is-selected');
            control.classList.add('is-correct');
            status.textContent = '\u2713';
            choices.forEach(choice => { choice.disabled = true; });
            completed.add(index);
            playAnswerSound(true);
            const correctResponse = `Correct! ${rule.resultSentence}`;
            if (completed.size === rules.length) {
              const completionResponse = `${correctResponse} Great job! You completed all eight jungle rules.`;
              feedback.textContent = completionResponse;
              speak(completionResponse);
            } else {
              feedback.textContent = correctResponse;
              speak(correctResponse);
            }
          } else {
            button.classList.add('is-wrong-choice');
            control.classList.add('is-wrong');
            status.textContent = '\u00d7';
            feedback.textContent = 'Try again. Choose O for a safe choice or X for an unsafe choice.';
            playAnswerSound(false);
            speak('Try again. Think about safe jungle behavior.');
          }
        });
      });
    });
  }

  function initPage7() {
    const questions = [
      { position: 'one', sentence: 'The monkey is on the tree.', answer: 'on' },
      { position: 'two', sentence: 'The snake is behind the leaves.', answer: 'behind' },
      { position: 'three', sentence: 'The parrot is on the branch.', answer: 'on' },
      { position: 'four', sentence: 'The giraffe is behind the rocks.', answer: 'behind' }
    ];
    const stage = createStage('w3p7-stage');
    stage.insertAdjacentHTML('beforeend', questions.map((question, index) => `
      ${speakerMarkup(`w3p7-speaker w3p7-speaker-${question.position}`, question.sentence)}
      <div class="w3p7-question w3p7-question-${question.position}" data-question="${index}">
        <div class="w3p7-choices" role="group" aria-label="Choose on or behind to complete the sentence">
          <button class="w3p7-choice w3p7-choice-on" type="button" data-choice="on"><span class="sr-only">on</span></button>
          <button class="w3p7-choice w3p7-choice-behind" type="button" data-choice="behind"><span class="sr-only">behind</span></button>
        </div>
        <span class="w3p7-status" aria-hidden="true"></span>
      </div>
    `).join(''));
    const feedback = addFeedback('Watch the clip, then complete the activity.');
    const completed = new Set();
    wireSpeakers(stage);

    const videoOverlay = document.createElement('div');
    videoOverlay.className = 'page7-video-overlay';
    videoOverlay.hidden = true;
    videoOverlay.innerHTML = `
      <div class="video-play-shell page7-video-shell">
        <video class="page7-intro-video" controls playsinline preload="metadata" aria-label="In the Jungle activity clip">
          <source src="../assets/video/literacy/week-3-page-07.mp4" type="video/mp4">
          Your browser does not support this video.
        </video>
        <button class="center-video-play page7-video-play" type="button" aria-label="Play the In the Jungle clip">&#9654;</button>
      </div>
      <p class="page7-video-message" aria-live="polite" hidden></p>
    `;

    const startLayer = document.createElement('div');
    startLayer.className = 'literacy-activity-start-layer';
    startLayer.innerHTML = `
      <button class="literacy-activity-start-button page7-start-button" type="button" aria-label="Start activity and watch the In the Jungle clip">
        <span aria-hidden="true">&#9654;</span>
        <span>Start Activity</span>
      </button>
    `;

    wrap.append(videoOverlay, startLayer);
    wrap.classList.add('has-literacy-activity-start');
    stage.inert = true;
    stage.setAttribute('aria-hidden', 'true');

    const startButton = startLayer.querySelector('.page7-start-button');
    const video = videoOverlay.querySelector('.page7-intro-video');
    const playButton = videoOverlay.querySelector('.page7-video-play');
    const videoMessage = videoOverlay.querySelector('.page7-video-message');
    let activityShown = false;

    function showActivity() {
      if (activityShown) return;
      activityShown = true;
      videoOverlay.hidden = true;
      stage.inert = false;
      stage.removeAttribute('aria-hidden');
      feedback.textContent = 'Listen to each sentence. Choose on or behind.';
    }

    async function playVideo() {
      playButton.hidden = true;
      try {
        await video.play();
      } catch (error) {
        playButton.hidden = false;
        videoMessage.hidden = false;
        videoMessage.textContent = 'Press the play button to begin the clip.';
      }
    }

    startButton.addEventListener('click', () => {
      startLayer.hidden = true;
      videoOverlay.hidden = false;
      feedback.textContent = 'Watch the clip. The activity will appear when it finishes.';
      playVideo();
    });

    playButton.addEventListener('click', playVideo);
    video.addEventListener('play', () => { playButton.hidden = true; });
    video.addEventListener('playing', () => {
      playButton.hidden = true;
      videoMessage.hidden = true;
    });
    video.addEventListener('pause', () => {
      if (!video.ended) playButton.hidden = false;
    });
    video.addEventListener('ended', showActivity);
    video.addEventListener('error', () => {
      videoMessage.hidden = false;
      videoMessage.innerHTML = 'The clip could not be played. <button class="page7-continue-button" type="button">Continue to Activity</button>';
      videoMessage.querySelector('.page7-continue-button').addEventListener('click', showActivity);
    });

    stage.querySelectorAll('.w3p7-question').forEach(control => {
      const index = Number(control.dataset.question);
      const question = questions[index];
      const choices = [...control.querySelectorAll('.w3p7-choice')];
      const status = control.querySelector('.w3p7-status');
      choices.forEach(button => {
        button.setAttribute('aria-label', `Choose ${button.dataset.choice}. ${question.sentence}`);
        button.addEventListener('click', () => {
          const correct = button.dataset.choice === question.answer;
          choices.forEach(choice => choice.classList.remove('is-selected', 'is-wrong-choice'));
          control.classList.remove('is-wrong');
          if (correct) {
            button.classList.add('is-selected');
            control.classList.add('is-correct');
            status.textContent = '\u2713';
            choices.forEach(choice => { choice.disabled = true; });
            completed.add(index);
            playAnswerSound(true);
            const allDone = completed.size === questions.length;
            feedback.textContent = allDone ? 'Wonderful! You completed every jungle sentence.' : `Correct! ${question.sentence}`;
            speak(allDone ? 'Wonderful! You completed every jungle sentence.' : `Correct! ${question.sentence}`);
          } else {
            button.classList.add('is-wrong-choice');
            control.classList.add('is-wrong');
            status.textContent = '\u00d7';
            feedback.textContent = 'Try again. Is the animal on the object or behind it?';
            playAnswerSound(false);
            speak('Try again. Is the animal on the object or behind it?');
          }
        });
      });
    });
  }

  ({
    2: initPage2,
    3: initPage3,
    4: initPage4,
    5: initPage5,
    6: initPage6,
    7: initPage7
  })[page]();
})();
