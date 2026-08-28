(() => {
  const week = Number(document.body.dataset.week);
  const page = Number(document.body.dataset.page);
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (week !== 2 || page < 2 || page > 7 || !wrap || !worksheetImage) return;

  function speak(text) {
    if (typeof speakAmericanEnglish !== 'function') return Promise.resolve();
    return Promise.resolve(speakAmericanEnglish(text));
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

  function createStage(className) {
    const stage = document.createElement('div');
    stage.className = `w2-activity-stage ${className}`;
    worksheetImage.before(stage);
    stage.appendChild(worksheetImage);
    wrap.classList.add('w2-interactive-wrap');
    const buildNote = document.querySelector('.activity-build-note');
    if (buildNote) buildNote.remove();
    return stage;
  }

  function addFeedback(text) {
    wrap.insertAdjacentHTML('afterend', `<p class="w2-activity-feedback" aria-live="polite">${text}</p>`);
    return document.querySelector('.w2-activity-feedback');
  }

  function speakerMarkup(className, label, text, extra = '') {
    return `<button class="w2-speaker ${className}" type="button" data-speak="${text}" aria-label="${label}" ${extra}><span aria-hidden="true">&#128266;</span></button>`;
  }

  function wireSpeakers(root = document) {
    root.querySelectorAll('[data-speak]').forEach(button => {
      button.addEventListener('click', () => speak(button.dataset.speak));
    });
  }

  function counterMarkup(className, index, label) {
    return `
      <div class="w2-counter ${className}" data-counter="${index}">
        <output class="w2-counter-value" aria-live="polite" aria-label="${label}">0</output>
        <div class="w2-counter-steps" aria-label="Change ${label}">
          <button class="w2-counter-step" type="button" data-step="1" aria-label="Increase ${label}">&#9650;</button>
          <button class="w2-counter-step" type="button" data-step="-1" aria-label="Decrease ${label}">&#9660;</button>
        </div>
        <button class="w2-counter-go" type="button">Go</button>
        <span class="w2-counter-status" aria-hidden="true"></span>
      </div>`;
  }

  function bindCounter(control, options) {
    const output = control.querySelector('.w2-counter-value');
    const status = control.querySelector('.w2-counter-status');
    const buttons = [...control.querySelectorAll('.w2-counter-step')];
    const go = control.querySelector('.w2-counter-go');
    let value = 0;

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        value = Math.max(0, Math.min(options.max || 12, value + Number(button.dataset.step)));
        output.textContent = String(value);
        control.classList.remove('is-wrong');
        status.textContent = '';
        if (options.onChange) options.onChange(value, control);
      });
    });

    go.addEventListener('click', () => {
      const correct = options.validate(value, control);
      control.classList.remove('is-wrong');
      void control.offsetWidth;
      control.classList.toggle('is-correct', correct);
      control.classList.toggle('is-wrong', !correct);
      status.textContent = correct ? '\u2713' : '\u00d7';
      playAnswerSound(correct);
      if (correct) {
        buttons.forEach(button => { button.disabled = true; });
        go.disabled = true;
      }
      options.onResult(correct, value, control);
    });
  }

  function initPage2() {
    const questions = [
      { text: 'How many triangles make up the duck?', answer: 5 },
      { text: 'How many squares make up the duck?', answer: 1 },
      { text: 'How many parallelograms make up the duck?', answer: 1 }
    ];
    const stage = createStage('w2p2-stage');
    stage.insertAdjacentHTML('beforeend', `
      ${speakerMarkup('w2p2-sentence-speaker', 'Listen to: I am a duck.', 'I am a duck.')}
      <button class="w2p2-trace-word" type="button" aria-label="Open the tracing board for the word duck"><span class="sr-only">Trace the word duck</span></button>
      <img class="w2p2-trace-result" alt="Your handwritten word duck" hidden>
      ${questions.map((question, index) => `
        ${speakerMarkup(`w2p2-question-speaker w2p2-question-speaker-${index + 1}`, `Listen: ${question.text}`, question.text)}
        ${counterMarkup(`w2p2-counter w2p2-counter-${index + 1}`, index, `answer for question ${index + 1}`)}
      `).join('')}
    `);
    const feedback = addFeedback('Trace the word duck and answer all three shape questions.');
    wireSpeakers(stage);

    stage.querySelectorAll('.w2-counter').forEach(control => {
      const question = questions[Number(control.dataset.counter)];
      bindCounter(control, {
        max: 10,
        validate: value => value === question.answer,
        onResult(correct) {
          feedback.textContent = correct
            ? `Correct! ${question.text} ${question.answer}.`
            : 'Try again. Count the shapes carefully, then change the number.';
          speak(correct ? `Correct! The answer is ${question.answer}.` : 'Try again. Count the shapes carefully.');
        }
      });
    });

    const traceButton = stage.querySelector('.w2p2-trace-word');
    const traceResult = stage.querySelector('.w2p2-trace-result');
    const overlay = document.createElement('div');
    overlay.className = 'w2p2-trace-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'w2p2-trace-title');
    overlay.innerHTML = `
      <section class="w2p2-trace-board">
        <button class="w2p2-trace-close" type="button" aria-label="Close tracing board">&times;</button>
        <h2 id="w2p2-trace-title">Trace the word</h2>
        <p>Follow the gray letters with your finger or mouse.</p>
        <div class="w2p2-canvas-shell">
          <span class="w2p2-trace-guide" aria-hidden="true">duck</span>
          <canvas class="w2p2-trace-canvas" width="800" height="280" aria-label="Drawing board for tracing the word duck"></canvas>
        </div>
        <p class="w2p2-trace-feedback" aria-live="polite"></p>
        <div class="w2p2-trace-actions">
          <button class="pill-btn blue w2p2-trace-clear" type="button">Clear</button>
          <button class="pill-btn green w2p2-trace-go" type="button">Go</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.w2p2-trace-close');
    const clearButton = overlay.querySelector('.w2p2-trace-clear');
    const goButton = overlay.querySelector('.w2p2-trace-go');
    const traceFeedback = overlay.querySelector('.w2p2-trace-feedback');
    const canvas = overlay.querySelector('.w2p2-trace-canvas');
    const context = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;

    function openBoard() {
      overlay.hidden = false;
      document.body.classList.add('w2p2-trace-open');
      traceFeedback.textContent = '';
      closeButton.focus();
    }

    function closeBoard() {
      overlay.hidden = true;
      document.body.classList.remove('w2p2-trace-open');
      traceButton.focus();
    }

    traceButton.addEventListener('click', openBoard);
    closeButton.addEventListener('click', closeBoard);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeBoard(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) closeBoard(); });

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
      traceFeedback.textContent = 'The board is clear. Trace the word duck.';
    });
    goButton.addEventListener('click', () => {
      if (!hasInk) {
        traceFeedback.textContent = 'Trace the word duck before you press Go.';
        speak('Trace the word duck first.');
        return;
      }
      traceResult.src = canvas.toDataURL('image/png');
      traceResult.hidden = false;
      traceButton.classList.add('is-complete');
      feedback.textContent = 'Great writing! Your word is now on the page.';
      playAnswerSound(true);
      speak('Great writing!');
      closeBoard();
    });
  }

  function initPage3() {
    const subjects = [
      { key: 'grass', label: 'The grass', sentence: 'The grass is short.', answer: 1, color: '#5b9f3a' },
      { key: 'tree', label: 'The tree', sentence: 'The tree is big.', answer: 3, color: '#8b5a2b' },
      { key: 'fence', label: 'The fence', sentence: 'The fence is tall.', answer: 0, color: '#d18a2d' },
      { key: 'snail', label: 'The snail', sentence: 'The snail is small.', answer: 2, color: '#986f4a' }
    ];
    const endings = ['is tall.', 'is short.', 'is small.', 'is big.'];
    const rowSentences = subjects.map(subject => subject.sentence);
    const rows = [404, 545, 688, 829];
    const stage = createStage('w2p3-stage');
    stage.insertAdjacentHTML('beforeend', `
      <svg class="w2p3-lines" viewBox="0 0 1536 1024" preserveAspectRatio="none" aria-hidden="true">
        <g class="w2p3-complete-lines"></g><g class="w2p3-preview-lines"></g>
      </svg>
      ${subjects.map((subject, index) => `
        <button class="w2p3-picture-hotspot w2p3-hotspot-${subject.key}" type="button" data-speak="${subject.sentence}" aria-label="Listen: ${subject.sentence}"></button>
        <button class="w2p3-endpoint w2p3-subject w2p3-row-${index + 1}" type="button" data-subject="${index}" aria-label="Start a line from ${subject.label}"></button>
      `).join('')}
      ${endings.map((ending, index) => `
        <button class="w2p3-endpoint w2p3-ending w2p3-row-${index + 1}" type="button" data-ending="${index}" aria-label="Finish a line at ${ending}"></button>
        ${speakerMarkup(`w2p3-sentence-speaker w2p3-sentence-speaker-${index + 1}`, `Listen: ${rowSentences[index]}`, rowSentences[index])}
      `).join('')}
    `);
    const feedback = addFeedback('Tap the picture to listen, then match all four sentence parts.');
    wireSpeakers(stage);

    stage.querySelectorAll('.w2p3-picture-hotspot').forEach(hotspot => {
      hotspot.addEventListener('click', () => {
        hotspot.classList.remove('is-speaking');
        void hotspot.offsetWidth;
        hotspot.classList.add('is-speaking');
        window.setTimeout(() => hotspot.classList.remove('is-speaking'), 650);
      });
    });

    const completeLines = stage.querySelector('.w2p3-complete-lines');
    const previewLines = stage.querySelector('.w2p3-preview-lines');
    const subjectButtons = [...stage.querySelectorAll('.w2p3-subject')];
    const endingButtons = [...stage.querySelectorAll('.w2p3-ending')];
    let selected = null;
    let completed = 0;
    let drag = null;

    function clearSelection() {
      subjectButtons.forEach(button => button.classList.remove('is-selected'));
      selected = null;
    }

    function lineElement(className, subjectIndex, endingIndex = subjectIndex) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', className);
      line.setAttribute('x1', '1157');
      line.setAttribute('y1', String(rows[subjectIndex]));
      line.setAttribute('x2', '1331');
      line.setAttribute('y2', String(rows[endingIndex]));
      if (className.includes('w2p3-line-color')) line.setAttribute('stroke', subjects[subjectIndex].color);
      return line;
    }

    function drawMatch(subjectIndex, endingIndex) {
      completeLines.append(
        lineElement('w2p3-line-outline', subjectIndex, endingIndex),
        lineElement('w2p3-line-color', subjectIndex, endingIndex)
      );
    }

    function finishMatch(subjectIndex, endingIndex) {
      if (subjects[subjectIndex].answer !== endingIndex) {
        subjectButtons[subjectIndex].classList.add('is-wrong');
        endingButtons[endingIndex].classList.add('is-wrong');
        window.setTimeout(() => {
          subjectButtons[subjectIndex].classList.remove('is-wrong');
          endingButtons[endingIndex].classList.remove('is-wrong');
        }, 650);
        feedback.textContent = 'Try again. Compare the sizes and complete the sentence.';
        playAnswerSound(false);
        speak('Try again. Compare the sizes.');
        return;
      }
      drawMatch(subjectIndex, endingIndex);
      subjectButtons[subjectIndex].disabled = true;
      endingButtons[endingIndex].disabled = true;
      subjectButtons[subjectIndex].classList.add('is-matched');
      endingButtons[endingIndex].classList.add('is-matched');
      completed += 1;
      clearSelection();
      playAnswerSound(true);
      feedback.textContent = completed === subjects.length
        ? 'Great job! You matched all four size sentences.'
        : `Correct! ${subjects[subjectIndex].sentence}`;
      speak(feedback.textContent);
    }

    subjectButtons.forEach(button => {
      if (button.disabled) return;
      button.addEventListener('click', () => {
        clearSelection();
        selected = Number(button.dataset.subject);
        button.classList.add('is-selected');
        feedback.textContent = `${subjects[selected].label} — choose the correct sentence ending.`;
        speak(subjects[selected].label);
      });
      button.addEventListener('pointerdown', event => {
        if (event.button > 0 || button.disabled) return;
        event.preventDefault();
        clearSelection();
        selected = Number(button.dataset.subject);
        button.classList.add('is-selected');
        const outline = lineElement('w2p3-line-outline w2p3-preview', selected);
        const color = lineElement('w2p3-line-color w2p3-preview', selected);
        previewLines.replaceChildren(outline, color);
        drag = { pointerId: event.pointerId, subjectIndex: selected, outline, color, moved: false, startX: event.clientX, startY: event.clientY };
        button.setPointerCapture(event.pointerId);
      });
    });

    function moveDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const bounds = stage.getBoundingClientRect();
      const x = Math.max(0, Math.min(1536, (event.clientX - bounds.left) * 1536 / bounds.width));
      const y = Math.max(0, Math.min(1024, (event.clientY - bounds.top) * 1024 / bounds.height));
      drag.outline.setAttribute('x2', String(x));
      drag.outline.setAttribute('y2', String(y));
      drag.color.setAttribute('x2', String(x));
      drag.color.setAttribute('y2', String(y));
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 7) drag.moved = true;
    }

    stage.addEventListener('pointermove', moveDrag);
    stage.addEventListener('pointerup', event => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      moveDrag(event);
      const finished = drag;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.w2p3-ending');
      previewLines.replaceChildren();
      drag = null;
      if (!finished.moved) return;
      if (!target || target.disabled) {
        clearSelection();
        feedback.textContent = 'Drag the line to one of the available black dots.';
        speak('Drag the line to a black dot.');
        return;
      }
      finishMatch(finished.subjectIndex, Number(target.dataset.ending));
    });
    stage.addEventListener('pointercancel', () => {
      previewLines.replaceChildren();
      drag = null;
      clearSelection();
    });

    endingButtons.forEach(button => {
      if (button.disabled) return;
      button.addEventListener('click', () => {
        if (selected === null) {
          feedback.textContent = 'Choose a sentence beginning on the left first.';
          speak('Choose a sentence beginning first.');
          return;
        }
        finishMatch(selected, Number(button.dataset.ending));
      });
    });
  }

  function initPage4() {
    const groups = [
      { position: 'upper-left', answer: 5, clue: 'There are 5 yellow ducks.', sentence: 'There are five yellow ducks in the upper left group.' },
      { position: 'upper-right', answer: 6, clue: 'There are 6 yellow ducks.', sentence: 'There are six yellow ducks in the upper right group.' },
      { position: 'lower-left', answer: 6, clue: 'There are 6 yellow ducks.', sentence: 'There are six yellow ducks in the lower left group.' },
      { position: 'lower-right', answer: 7, clue: 'There are 7 yellow ducks.', sentence: 'There are seven yellow ducks in the lower right group.' }
    ];
    const stage = createStage('w2p4-stage');
    stage.insertAdjacentHTML('beforeend', groups.map((group, index) => `
      ${speakerMarkup(`w2p4-speaker w2p4-speaker-${group.position}`, `Listen: ${group.clue}`, group.clue)}
      ${counterMarkup(`w2p4-counter w2p4-counter-${group.position}`, index, `${group.position.replace('-', ' ')} yellow duck count`)}
    `).join(''));
    const feedback = addFeedback('Count only the ducks with yellow bodies. Use the arrows, then press Go.');
    wireSpeakers(stage);
    let completed = 0;
    stage.querySelectorAll('.w2-counter').forEach(control => {
      const group = groups[Number(control.dataset.counter)];
      bindCounter(control, {
        max: 12,
        validate: value => value === group.answer,
        onResult(correct) {
          if (correct) completed += 1;
          feedback.textContent = correct
            ? (completed === groups.length ? 'Excellent! You counted every group of yellow ducks.' : `Correct! ${group.sentence}`)
            : 'Try again. Count only the ducks whose bodies are yellow.';
          speak(feedback.textContent);
        }
      });
    });
  }

  function initPage5() {
    const groups = [
      {
        position: 'upper-left', answer: 2, clue: 'The duck and the fish can swim.',
        animals: [
          { name: 'duck', correct: true }, { name: 'giraffe', correct: false },
          { name: 'fish', correct: true }, { name: 'butterfly', correct: false }
        ]
      },
      {
        position: 'upper-right', answer: 3, clue: 'The dolphin, the jellyfish, and the duck can swim.',
        animals: [
          { name: 'dolphin', correct: true }, { name: 'jellyfish', correct: true },
          { name: 'hippopotamus', correct: false }, { name: 'duck', correct: true }
        ]
      },
      {
        position: 'lower-left', answer: 4, clue: 'The duck, the squid, the shark, and the seahorse can swim.',
        animals: [
          { name: 'duck', correct: true }, { name: 'squid', correct: true },
          { name: 'shark', correct: true }, { name: 'seahorse', correct: true }
        ]
      },
      {
        position: 'lower-right', answer: 3, clue: 'The whale, the swan, and the octopus can swim.',
        animals: [
          { name: 'whale', correct: true }, { name: 'swan', correct: true },
          { name: 'octopus', correct: true }, { name: 'gorilla', correct: false }
        ]
      }
    ];
    const stage = createStage('w2p5-stage');
    stage.insertAdjacentHTML('beforeend', groups.map((group, groupIndex) => `
      ${speakerMarkup(`w2p5-speaker w2p5-speaker-${group.position}`, `Listen: ${group.clue}`, group.clue)}
      ${group.animals.map((animal, animalIndex) => `<button class="w2p5-animal w2p5-animal-${group.position}-${animalIndex + 1}" type="button" data-group="${groupIndex}" data-animal="${animalIndex}" aria-pressed="false" aria-label="Circle ${animal.name}"></button>`).join('')}
      ${counterMarkup(`w2p5-counter w2p5-counter-${group.position}`, groupIndex, `${group.position.replace('-', ' ')} swimming animal total`)}
    `).join(''));
    const feedback = addFeedback('Tap each speaker for a clue. Circle every animal that swims, enter the total, and press Go.');
    wireSpeakers(stage);
    let completed = 0;

    stage.querySelectorAll('.w2p5-animal').forEach(button => {
      button.addEventListener('click', () => {
        if (button.disabled) return;
        const selected = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-selected', selected);
        button.classList.remove('is-wrong-selection');
        stage.querySelector(`.w2p5-counter[data-counter="${button.dataset.group}"]`)?.classList.remove('is-wrong');
      });
    });

    stage.querySelectorAll('.w2-counter').forEach(control => {
      const groupIndex = Number(control.dataset.counter);
      const group = groups[groupIndex];
      bindCounter(control, {
        max: 6,
        onChange() {
          stage.querySelectorAll(`.w2p5-animal[data-group="${groupIndex}"]`).forEach(button => button.classList.remove('is-wrong-selection'));
        },
        validate(value) {
          const buttons = [...stage.querySelectorAll(`.w2p5-animal[data-group="${groupIndex}"]`)];
          const exactSelection = buttons.every(button => {
            const animal = group.animals[Number(button.dataset.animal)];
            return (button.getAttribute('aria-pressed') === 'true') === animal.correct;
          });
          return value === group.answer && exactSelection;
        },
        onResult(correct, value) {
          const buttons = [...stage.querySelectorAll(`.w2p5-animal[data-group="${groupIndex}"]`)];
          if (correct) {
            completed += 1;
            buttons.forEach(button => {
              button.disabled = true;
              if (button.getAttribute('aria-pressed') === 'true') button.classList.add('is-correct');
            });
            feedback.textContent = completed === groups.length
              ? 'Wonderful! You found and counted every animal that swims.'
              : `Correct! ${group.answer} animals swim in this group.`;
          } else {
            buttons.forEach(button => {
              const animal = group.animals[Number(button.dataset.animal)];
              const selected = button.getAttribute('aria-pressed') === 'true';
              button.classList.toggle('is-wrong-selection', selected && !animal.correct);
            });
            feedback.textContent = value !== group.answer
              ? 'Try again. Check the animals you circled and the total number.'
              : 'The total is right, but check which animals you circled.';
          }
          speak(feedback.textContent);
        }
      });
    });
  }

  function initPage6() {
    const rules = [
      { position: 'left-1', sentence: 'Squash bugs.', resultSentence: 'You should not squash bugs.', answer: 'X' },
      { position: 'right-1', sentence: 'Plant flowers.', resultSentence: 'You should plant flowers.', answer: 'O' },
      { position: 'left-2', sentence: 'Pull out weeds.', resultSentence: 'You should pull out weeds.', answer: 'O' },
      { position: 'right-2', sentence: 'Feed birds.', resultSentence: 'You should feed birds.', answer: 'O' },
      { position: 'left-3', sentence: 'Climb fences.', resultSentence: 'You should not climb fences.', answer: 'X' },
      { position: 'right-3', sentence: 'Set traps.', resultSentence: 'You should not set traps.', answer: 'X' },
      { position: 'left-4', sentence: 'Break flower pots.', resultSentence: 'You should not break flower pots.', answer: 'X' },
      { position: 'right-4', sentence: 'Water the flowers.', resultSentence: 'You should water the flowers.', answer: 'O' }
    ];
    const stage = createStage('w2p6-stage');
    stage.insertAdjacentHTML('beforeend', rules.map((rule, index) => `
      ${speakerMarkup(`w2p6-speaker w2p6-speaker-${rule.position}`, `Listen: ${rule.sentence}`, rule.sentence)}
      <div class="w2p6-rule w2p6-rule-${rule.position}" data-rule="${index}">
        <div class="w2p6-choices" role="group" aria-label="Choose O or X for ${rule.sentence}">
          <button class="w2p6-choice" type="button" data-choice="O" aria-label="Choose O for ${rule.sentence}">O</button>
          <button class="w2p6-choice" type="button" data-choice="X" aria-label="Choose X for ${rule.sentence}">X</button>
        </div>
        <span class="w2p6-status" aria-hidden="true"></span>
      </div>
    `).join(''));
    const feedback = addFeedback('Listen to each garden rule. Choose O for a good choice or X for a wrong choice.');
    wireSpeakers(stage);
    const completed = new Set();

    stage.querySelectorAll('.w2p6-rule').forEach(control => {
      const index = Number(control.dataset.rule);
      const rule = rules[index];
      const status = control.querySelector('.w2p6-status');
      const choices = [...control.querySelectorAll('.w2p6-choice')];
      choices.forEach(button => {
        button.addEventListener('click', () => {
          const correct = button.dataset.choice === rule.answer;
          choices.forEach(choice => choice.classList.remove('is-selected', 'is-wrong-choice'));
          control.classList.remove('is-wrong');
          if (correct) {
            button.classList.add('is-selected');
            control.classList.add('is-correct');
            choices.forEach(choice => { choice.disabled = true; });
            status.textContent = '\u2713';
            completed.add(index);
            playAnswerSound(true);
            const correctResponse = `Correct! ${rule.resultSentence}`;
            feedback.textContent = completed.size === rules.length
              ? `${correctResponse} Great job! You completed all eight garden rules.`
              : correctResponse;
            speak(feedback.textContent);
          } else {
            button.classList.add('is-wrong-choice');
            control.classList.add('is-wrong');
            status.textContent = '\u00d7';
            playAnswerSound(false);
            feedback.textContent = 'Try again. Choose O for something we should do or X for something we should not do.';
            speak('Try again.');
          }
        });
      });
    });
  }

  function initPage7() {
    const questions = [
      { position: 'one', sentence: 'I can find a butterfly in my garden.', answer: 'find' },
      { position: 'two', sentence: 'I found a small snail in my garden yesterday.', answer: 'found' },
      { position: 'three', sentence: 'I can find some short grass in my garden.', answer: 'find' },
      { position: 'four', sentence: 'I found a duck waddling in my garden last week.', answer: 'found' }
    ];
    const stage = createStage('w2p7-stage');
    stage.insertAdjacentHTML('beforeend', questions.map((question, index) => `
      ${speakerMarkup(`w2p7-speaker w2p7-speaker-${question.position}`, `Listen: ${question.sentence}`, question.sentence)}
      <div class="w2p7-question w2p7-question-${question.position}" data-question="${index}">
        <div class="w2p7-choices" role="group" aria-label="Choose find or found to complete sentence ${index + 1}">
          <button class="w2p7-choice w2p7-choice-find" type="button" data-choice="find" aria-label="Choose find for sentence ${index + 1}"><span class="sr-only">find</span></button>
          <button class="w2p7-choice w2p7-choice-found" type="button" data-choice="found" aria-label="Choose found for sentence ${index + 1}"><span class="sr-only">found</span></button>
        </div>
        <span class="w2p7-status" aria-hidden="true"></span>
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
        <video class="page7-intro-video" controls playsinline preload="metadata" aria-label="In the Garden activity clip">
          <source src="../assets/video/literacy/week-2-page-07.mp4" type="video/mp4">
          Your browser does not support this video.
        </video>
        <button class="center-video-play page7-video-play" type="button" aria-label="Play the In the Garden clip">&#9654;</button>
      </div>
      <p class="page7-video-message" aria-live="polite" hidden></p>
    `;

    const startLayer = document.createElement('div');
    startLayer.className = 'literacy-activity-start-layer';
    startLayer.innerHTML = `
      <button class="literacy-activity-start-button page7-start-button" type="button" aria-label="Start activity and watch the In the Garden clip">
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
      video.pause();
      videoOverlay.hidden = true;
      stage.inert = false;
      stage.removeAttribute('aria-hidden');
      feedback.textContent = 'Listen to each sentence. Choose find or found.';
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
      if (!video.ended && !activityShown) playButton.hidden = false;
    });
    video.addEventListener('ended', showActivity);
    video.addEventListener('error', () => {
      videoMessage.hidden = false;
      videoMessage.innerHTML = 'The clip could not be played. <button class="page7-continue-button" type="button">Continue to Activity</button>';
      videoMessage.querySelector('.page7-continue-button').addEventListener('click', showActivity);
    });

    stage.querySelectorAll('.w2p7-question').forEach(control => {
      const index = Number(control.dataset.question);
      const question = questions[index];
      const choices = [...control.querySelectorAll('.w2p7-choice')];
      const status = control.querySelector('.w2p7-status');

      choices.forEach(button => {
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
            feedback.textContent = allDone
              ? 'Wonderful! You completed every garden sentence.'
              : `Correct! ${question.sentence}`;
            speak(allDone
              ? 'Wonderful! You completed every garden sentence.'
              : `Correct! ${question.sentence}`);
            return;
          }

          button.classList.add('is-wrong-choice');
          control.classList.add('is-wrong');
          status.textContent = '\u00d7';
          feedback.textContent = 'Try again. Use find for now and found for the past.';
          playAnswerSound(false);
          speak('Try again. Use find for now and found for the past.');
        });
      });
    });
  }

  ({ 2: initPage2, 3: initPage3, 4: initPage4, 5: initPage5, 6: initPage6, 7: initPage7 })[page]();
})();
