(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !worksheetImage) return;

  const questions = [
    { text: 'How many triangles make up the dog?', answer: 5 },
    { text: 'How many squares make up the dog?', answer: 1 },
    { text: 'How many parallelograms make up the dog?', answer: 1 }
  ];

  const stage = document.createElement('div');
  stage.className = 'page2-dog-shapes-stage';
  worksheetImage.before(stage);
  const worksheetPicture = document.createElement('picture');
  worksheetPicture.className = 'page2-sheet-picture';
  const portraitSource = document.createElement('source');
  portraitSource.media = '(max-width: 650px)';
  portraitSource.srcset = '../assets/images/week-1/literacy/page-02-dog-shapes-portrait.png';
  worksheetPicture.append(portraitSource, worksheetImage);
  stage.appendChild(worksheetPicture);
  wrap.classList.add('page2-dog-shapes-wrap');

  stage.insertAdjacentHTML('beforeend', `
    <button class="page2-speaker page2-sentence-speaker" type="button" aria-label="Listen to: I am a dog" data-speak="I am a dog.">
      <span aria-hidden="true">🔊</span>
    </button>

    <button class="page2-trace-word" id="page2-trace-word" type="button" aria-label="Open the tracing board for the word dog">
      <span class="sr-only">Trace the word dog</span>
    </button>
    <img class="page2-trace-result" id="page2-trace-result" alt="Your handwritten word dog" hidden>

    ${questions.map((question, index) => `
      <button class="page2-speaker page2-question-speaker page2-question-speaker-${index + 1}" type="button" aria-label="Listen to question ${index + 1}" data-speak="${question.text}">
        <span aria-hidden="true">🔊</span>
      </button>
      <div class="page2-number-control page2-number-control-${index + 1}" data-question="${index}" data-answer="${question.answer}">
        <output class="page2-number-value" aria-live="polite" aria-label="Answer for question ${index + 1}">0</output>
        <div class="page2-step-buttons" aria-label="Change answer for question ${index + 1}">
          <button type="button" class="page2-step-button" data-step="1" aria-label="Increase answer">▲</button>
          <button type="button" class="page2-step-button" data-step="-1" aria-label="Decrease answer">▼</button>
        </div>
        <button class="page2-answer-go" type="button">Go</button>
        <span class="page2-answer-status" aria-hidden="true"></span>
      </div>
    `).join('')}
  `);

  const buildNote = document.querySelector('.activity-build-note');
  if (buildNote) buildNote.remove();

  wrap.insertAdjacentHTML('afterend', `
    <p class="page2-activity-feedback" id="page2-activity-feedback" aria-live="polite">
      Trace the word and answer the three shape questions.
    </p>
    <div class="page2-trace-overlay" id="page2-trace-overlay" role="dialog" aria-modal="true" aria-labelledby="page2-trace-title" hidden>
      <section class="page2-trace-board">
        <button class="page2-trace-close" id="page2-trace-close" type="button" aria-label="Close the tracing board">×</button>
        <h2 id="page2-trace-title">Trace the word</h2>
        <p>Follow the gray letters with your finger or mouse.</p>
        <div class="page2-canvas-shell">
          <span class="page2-trace-guide" aria-hidden="true">dog</span>
          <canvas id="page2-trace-canvas" width="720" height="280" aria-label="Drawing board for tracing the word dog"></canvas>
        </div>
        <p class="page2-trace-feedback" id="page2-trace-feedback" aria-live="polite"></p>
        <div class="page2-trace-actions">
          <button class="pill-btn blue" id="page2-trace-clear" type="button">Clear</button>
          <button class="pill-btn green" id="page2-trace-go" type="button">Go</button>
        </div>
      </section>
    </div>
  `);

  const feedback = document.querySelector('#page2-activity-feedback');
  const traceButton = document.querySelector('#page2-trace-word');
  const traceResult = document.querySelector('#page2-trace-result');
  const overlay = document.querySelector('#page2-trace-overlay');
  const closeButton = document.querySelector('#page2-trace-close');
  const clearButton = document.querySelector('#page2-trace-clear');
  const traceGoButton = document.querySelector('#page2-trace-go');
  const traceFeedback = document.querySelector('#page2-trace-feedback');
  const canvas = document.querySelector('#page2-trace-canvas');
  const context = canvas.getContext('2d');
  let drawing = false;
  let hasInk = false;

  function speak(text) {
    if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text);
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

  document.querySelectorAll('[data-speak]').forEach(button => {
    button.addEventListener('click', () => speak(button.dataset.speak));
  });

  function openTraceBoard() {
    overlay.hidden = false;
    document.body.classList.add('page2-trace-open');
    traceFeedback.textContent = '';
    closeButton.focus();
  }

  function closeTraceBoard() {
    overlay.hidden = true;
    document.body.classList.remove('page2-trace-open');
    traceButton.focus();
  }

  traceButton.addEventListener('click', openTraceBoard);
  closeButton.addEventListener('click', closeTraceBoard);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeTraceBoard();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) closeTraceBoard();
  });

  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = 16;
  context.strokeStyle = '#176fd1';

  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height
    };
  }

  canvas.addEventListener('pointerdown', event => {
    drawing = true;
    hasInk = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });

  canvas.addEventListener('pointermove', event => {
    if (!drawing) return;
    const point = canvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });

  function stopDrawing(event) {
    if (!drawing) return;
    drawing = false;
    context.closePath();
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);

  clearButton.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
    traceFeedback.textContent = 'The board is clear. Trace the word dog.';
  });

  traceGoButton.addEventListener('click', () => {
    if (!hasInk) {
      traceFeedback.textContent = 'Trace the word dog before you press Go.';
      speak('Trace the word dog first.');
      return;
    }
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels.data[(y * canvas.width + x) * 4 + 3] === 0) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) {
      hasInk = false;
      traceFeedback.textContent = 'Draw over the word dog before you press Go.';
      speak('Draw over the word dog first.');
      return;
    }

    const padding = 10;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(canvas.width - cropX, maxX - minX + 1 + padding * 2);
    const cropHeight = Math.min(canvas.height - cropY, maxY - minY + 1 + padding * 2);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    croppedCanvas.getContext('2d').drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    traceResult.src = croppedCanvas.toDataURL('image/png');
    traceResult.hidden = false;
    traceButton.classList.add('is-complete');
    feedback.textContent = 'Great writing! Your word is now on the page.';
    playAnswerSound(true);
    speak('Great writing!');
    closeTraceBoard();
  });

  document.querySelectorAll('.page2-number-control').forEach(control => {
    const valueOutput = control.querySelector('.page2-number-value');
    const status = control.querySelector('.page2-answer-status');
    const answer = Number(control.dataset.answer);
    let value = 0;

    control.querySelectorAll('.page2-step-button').forEach(button => {
      button.addEventListener('click', () => {
        value = Math.max(0, Math.min(10, value + Number(button.dataset.step)));
        valueOutput.textContent = String(value);
        control.classList.remove('is-wrong');
        status.textContent = '';
      });
    });

    control.querySelector('.page2-answer-go').addEventListener('click', () => {
      const correct = value === answer;
      control.classList.remove('is-wrong');
      void control.offsetWidth;
      control.classList.toggle('is-correct', correct);
      control.classList.toggle('is-wrong', !correct);
      status.textContent = correct ? '✓' : '×';
      feedback.textContent = correct
        ? `Correct! The answer is ${answer}.`
        : 'Try again. Use the arrows to change the number.';
      playAnswerSound(correct);
      speak(correct ? `Correct! The answer is ${answer}.` : 'Try again.');
      if (correct) {
        control.querySelectorAll('.page2-step-button, .page2-answer-go').forEach(button => { button.disabled = true; });
      }
    });
  });
})();
