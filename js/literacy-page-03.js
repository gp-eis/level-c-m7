(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !worksheetImage) return;

  const subjects = [
    { name: 'The brown dog', sentence: 'The brown dog is jumping.', answer: 2, color: '#b96b2f' },
    { name: 'The gray dog', sentence: 'The gray dog is sitting.', answer: 0, color: '#718596' },
    { name: 'The black dog', sentence: 'The black dog is playing.', answer: 3, color: '#263238' },
    { name: 'The white dog', sentence: 'The white dog is sleeping.', answer: 1, color: '#4f79bd' }
  ];

  const actions = [
    { label: 'is sitting', sentence: 'The gray dog is sitting.' },
    { label: 'is sleeping', sentence: 'The white dog is sleeping.' },
    { label: 'is jumping', sentence: 'The brown dog is jumping.' },
    { label: 'is playing', sentence: 'The black dog is playing.' }
  ];

  const rows = [397, 545, 694, 840];
  const stage = document.createElement('div');
  stage.className = 'page3-dog-match-stage';
  worksheetImage.before(stage);
  stage.appendChild(worksheetImage);
  wrap.classList.add('page3-dog-match-wrap');

  stage.insertAdjacentHTML('beforeend', `
    <svg class="page3-match-lines" viewBox="0 0 1448 1086" preserveAspectRatio="none" aria-hidden="true">
      <g id="page3-match-lines"></g>
      <g id="page3-preview-lines"></g>
    </svg>

    <button class="page3-dog-audio page3-dog-brown" type="button" data-subject="0" aria-label="Listen to: The brown dog is jumping."><span aria-hidden="true">🔊</span></button>
    <button class="page3-dog-audio page3-dog-gray" type="button" data-subject="1" aria-label="Listen to: The gray dog is sitting."><span aria-hidden="true">🔊</span></button>
    <button class="page3-dog-audio page3-dog-black" type="button" data-subject="2" aria-label="Listen to: The black dog is playing."><span aria-hidden="true">🔊</span></button>
    <button class="page3-dog-audio page3-dog-white" type="button" data-subject="3" aria-label="Listen to: The white dog is sleeping."><span aria-hidden="true">🔊</span></button>

    ${subjects.map((subject, index) => `
      <button class="page3-match-endpoint page3-subject-endpoint page3-row-${index + 1}" type="button" data-subject="${index}" aria-label="Drag a line from ${subject.name}"></button>
    `).join('')}

    ${actions.map((action, index) => `
      <button class="page3-match-endpoint page3-action-endpoint page3-row-${index + 1}" type="button" data-action="${index}" aria-label="Drop the line on ${action.label}"></button>
      <button class="page3-action-speaker page3-row-${index + 1}" type="button" data-action="${index}" aria-label="Listen to: ${action.sentence}"><span aria-hidden="true">🔊</span></button>
    `).join('')}
  `);

  const buildNote = document.querySelector('.activity-build-note');
  if (buildNote) buildNote.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="page3-match-feedback" id="page3-match-feedback" aria-live="polite">
      Press a black dot, then drag its line to the correct sentence ending.
    </p>
  `);

  const feedback = document.querySelector('#page3-match-feedback');
  const lineGroup = document.querySelector('#page3-match-lines');
  const previewGroup = document.querySelector('#page3-preview-lines');
  const subjectButtons = [...document.querySelectorAll('.page3-subject-endpoint')];
  const actionButtons = [...document.querySelectorAll('.page3-action-endpoint')];
  let selectedSubject = null;
  let completed = 0;
  let dragState = null;
  let suppressSubjectClick = null;

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

  document.querySelectorAll('.page3-dog-audio').forEach(button => {
    button.addEventListener('click', () => speak(subjects[Number(button.dataset.subject)].sentence));
  });

  document.querySelectorAll('.page3-action-speaker').forEach(button => {
    button.addEventListener('click', () => speak(actions[Number(button.dataset.action)].sentence));
  });

  function clearSelection() {
    subjectButtons.forEach(button => button.classList.remove('is-selected'));
    selectedSubject = null;
  }

  function clearPreviewLine() {
    previewGroup.replaceChildren();
    stage.classList.remove('is-dragging');
    dragState = null;
  }

  function stagePoint(event) {
    const bounds = stage.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1448, (event.clientX - bounds.left) * 1448 / bounds.width)),
      y: Math.max(0, Math.min(1086, (event.clientY - bounds.top) * 1086 / bounds.height))
    };
  }

  function createSvgLine(className, subjectIndex) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', className);
    line.setAttribute('x1', '1042');
    line.setAttribute('y1', String(rows[subjectIndex]));
    line.setAttribute('x2', '1042');
    line.setAttribute('y2', String(rows[subjectIndex]));
    if (className === 'page3-match-line page3-preview-line') {
      line.setAttribute('stroke', subjects[subjectIndex].color);
    }
    return line;
  }

  function beginDrag(button, event) {
    if (button.disabled || event.button > 0) return;
    event.preventDefault();
    clearSelection();
    selectedSubject = Number(button.dataset.subject);
    button.classList.add('is-selected');

    const outline = createSvgLine('page3-match-line-outline page3-preview-outline', selectedSubject);
    const line = createSvgLine('page3-match-line page3-preview-line', selectedSubject);
    previewGroup.replaceChildren(outline, line);
    dragState = {
      subjectIndex: selectedSubject,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      outline,
      line,
      moved: false
    };
    stage.classList.add('is-dragging');
    button.setPointerCapture(event.pointerId);
    feedback.textContent = `${subjects[selectedSubject].name} — drag the line to the correct ending.`;
  }

  function moveDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    event.preventDefault();
    const point = stagePoint(event);
    dragState.outline.setAttribute('x2', String(point.x));
    dragState.outline.setAttribute('y2', String(point.y));
    dragState.line.setAttribute('x2', String(point.x));
    dragState.line.setAttribute('y2', String(point.y));
    if (Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY) > 7) {
      dragState.moved = true;
    }
  }

  subjectButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const subjectIndex = Number(button.dataset.subject);
      if (suppressSubjectClick === subjectIndex) {
        suppressSubjectClick = null;
        return;
      }
      clearSelection();
      selectedSubject = subjectIndex;
      button.classList.add('is-selected');
      feedback.textContent = `${subjects[selectedSubject].name} — now choose the correct ending.`;
      speak(subjects[selectedSubject].name);
    });
  });

  function addMatchLine(subjectIndex, actionIndex) {
    const namespace = 'http://www.w3.org/2000/svg';
    const outline = document.createElementNS(namespace, 'line');
    const line = document.createElementNS(namespace, 'line');
    const attributes = {
      x1: 1042,
      y1: rows[subjectIndex],
      x2: 1221,
      y2: rows[actionIndex]
    };
    Object.entries(attributes).forEach(([name, value]) => {
      outline.setAttribute(name, value);
      line.setAttribute(name, value);
    });
    outline.setAttribute('class', 'page3-match-line-outline');
    line.setAttribute('class', 'page3-match-line');
    line.setAttribute('stroke', subjects[subjectIndex].color);
    lineGroup.append(outline, line);
  }

  function showWrongMatch(subjectIndex, actionButton) {
    const subjectButton = subjectButtons[subjectIndex];
    subjectButton.classList.add('is-wrong');
    if (actionButton) actionButton.classList.add('is-wrong');
    feedback.textContent = 'Try again. That ending does not complete the sentence.';
    playAnswerSound(false);
    speak('Try again.');
    window.setTimeout(() => {
      subjectButton.classList.remove('is-wrong');
      if (actionButton) actionButton.classList.remove('is-wrong');
    }, 650);
  }

  async function completeMatch(subjectIndex, actionIndex) {
    const subjectButton = subjectButtons[subjectIndex];
    const actionButton = actionButtons[actionIndex];
    addMatchLine(subjectIndex, actionIndex);
    subjectButton.classList.remove('is-selected');
    subjectButton.classList.add('is-matched');
    actionButton.classList.add('is-matched');
    subjectButton.disabled = true;
    actionButton.disabled = true;
    completed += 1;
    selectedSubject = null;
    feedback.textContent = `Correct! ${subjects[subjectIndex].sentence}`;
    playAnswerSound(true);
    await speak(subjects[subjectIndex].sentence);

    if (completed === subjects.length) {
      feedback.textContent = 'Great job! You completed all four sentences.';
      await speak('Great job! You completed all four sentences.');
    }
  }

  function finishDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    moveDrag(event);
    const finishedDrag = dragState;
    const dropTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest('.page3-action-endpoint');
    clearPreviewLine();

    if (!finishedDrag.moved) return;
    suppressSubjectClick = finishedDrag.subjectIndex;
    window.setTimeout(() => {
      if (suppressSubjectClick === finishedDrag.subjectIndex) suppressSubjectClick = null;
    }, 0);
    if (!dropTarget || dropTarget.disabled) {
      clearSelection();
      feedback.textContent = 'Drag the line all the way to one of the black answer dots.';
      speak('Drag the line to a black answer dot.');
      return;
    }

    const actionIndex = Number(dropTarget.dataset.action);
    if (subjects[finishedDrag.subjectIndex].answer !== actionIndex) {
      showWrongMatch(finishedDrag.subjectIndex, dropTarget);
      clearSelection();
      return;
    }

    completeMatch(finishedDrag.subjectIndex, actionIndex);
  }

  subjectButtons.forEach(button => {
    button.addEventListener('pointerdown', event => beginDrag(button, event));
  });
  stage.addEventListener('pointermove', moveDrag);
  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    clearPreviewLine();
    clearSelection();
  });

  actionButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const actionIndex = Number(button.dataset.action);
      if (selectedSubject === null) {
        feedback.textContent = 'Choose a dog phrase on the left first.';
        speak('Choose a dog phrase first.');
        return;
      }

      const subjectButton = subjectButtons[selectedSubject];
      if (subjects[selectedSubject].answer !== actionIndex) {
        showWrongMatch(selectedSubject, button);
        return;
      }

      const matchedSubject = selectedSubject;
      completeMatch(matchedSubject, actionIndex);
    });
  });
})();
