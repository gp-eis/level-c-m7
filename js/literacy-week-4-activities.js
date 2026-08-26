(() => {
  const page = Number(document.body.dataset.page);
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image || page < 2 || page > 7) return;

  const speak = (text, options) => {
    if (typeof speakAmericanEnglish === 'function') return speakAmericanEnglish(text, options);
    return Promise.resolve();
  };

  const tone = correct => {
    if (typeof playTone !== 'function') return;
    if (correct) {
      playTone(523.25, .12, .11, 'triangle');
      playTone(659.25, .14, .1, 'triangle', .11);
      playTone(783.99, .18, .09, 'triangle', .22);
    } else {
      playTone(220, .14, .08, 'sine');
      playTone(174.61, .18, .07, 'sine', .12);
    }
  };

  function makeStage(className) {
    const stage = document.createElement('div');
    stage.className = `w4-stage ${className}`;
    image.before(stage);
    stage.appendChild(image);
    wrap.classList.add('w4-wrap');
    document.querySelector('.activity-build-note')?.remove();
    return stage;
  }

  function addFeedback(text, actions = '') {
    wrap.insertAdjacentHTML('afterend', `
      <p class="w4-feedback" aria-live="polite">${text}</p>
      ${actions ? `<div class="w4-actions">${actions}</div>` : ''}
    `);
    return document.querySelector('.w4-feedback');
  }

  function addSpeaker(stage, className, label, text, style = '') {
    stage.insertAdjacentHTML('beforeend', `<button class="w4-speaker ${className}" type="button" aria-label="Listen: ${label}" style="${style}"><span aria-hidden="true">&#128266;</span></button>`);
    const button = stage.lastElementChild;
    button.addEventListener('click', () => speak(text));
    return button;
  }

  function buildPage2() {
    const questions = [
      { text: 'How many triangles make up the bird?', answer: 5 },
      { text: 'How many squares make up the bird?', answer: 1 },
      { text: 'How many parallelograms make up the bird?', answer: 1 }
    ];
    const stage = makeStage('w4-page2-stage');
    stage.insertAdjacentHTML('beforeend', `
      <button class="w4-trace-word" type="button" aria-label="Trace the word bird"><span class="sr-only">Trace bird</span></button>
      <img class="w4-trace-result" alt="Your handwritten word bird" hidden>
      ${questions.map((question, index) => `
        <div class="w4-counter" data-question="${index}" data-answer="${question.answer}">
          <output aria-label="Answer for question ${index + 1}">0</output>
          <div class="w4-counter-steps">
            <button type="button" data-step="1" aria-label="Increase answer">&#9650;</button>
            <button type="button" data-step="-1" aria-label="Decrease answer">&#9660;</button>
          </div>
          <button class="w4-counter-go" type="button">Go</button>
          <span class="w4-counter-status" aria-hidden="true"></span>
        </div>
      `).join('')}
    `);
    addSpeaker(stage, 'w4-page2-speaker-sentence', 'I am a bird', 'I am a bird.');
    questions.forEach((question, index) => addSpeaker(stage, 'w4-page2-speaker-question', question.text, question.text, `top:${[41,58.1,75.2][index]}%`, index));
    [...stage.querySelectorAll('.w4-page2-speaker-question')].forEach((button, index) => button.dataset.question = String(index));
    const feedback = addFeedback('Trace the word bird and answer all three shape questions.');

    stage.querySelectorAll('.w4-counter').forEach(control => {
      const output = control.querySelector('output');
      const status = control.querySelector('.w4-counter-status');
      const answer = Number(control.dataset.answer);
      let value = 0;
      control.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
        value = Math.max(0, Math.min(10, value + Number(button.dataset.step)));
        output.textContent = String(value);
        status.textContent = '';
        control.classList.remove('is-wrong');
      }));
      control.querySelector('.w4-counter-go').addEventListener('click', () => {
        const correct = value === answer;
        control.classList.toggle('is-correct', correct);
        control.classList.toggle('is-wrong', !correct);
        status.textContent = correct ? '\u2713' : '\u00d7';
        feedback.className = `w4-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        feedback.textContent = correct ? `Correct! The answer is ${answer}.` : 'Try again. Use the arrows to change the number.';
        tone(correct);
        speak(correct ? `Correct! The answer is ${answer}.` : 'Try again.');
        if (correct) control.querySelectorAll('button').forEach(button => { button.disabled = true; });
      });
    });

    const traceButton = stage.querySelector('.w4-trace-word');
    const traceResult = stage.querySelector('.w4-trace-result');
    document.body.insertAdjacentHTML('beforeend', `
      <div class="w4-trace-overlay" role="dialog" aria-modal="true" aria-labelledby="w4-trace-title" hidden>
        <section class="w4-trace-board">
          <button class="w4-trace-close" type="button" aria-label="Close tracing board">&times;</button>
          <h2 id="w4-trace-title">Trace the word</h2>
          <p>Follow the gray letters with your finger or mouse.</p>
          <div class="w4-canvas-shell"><span class="w4-trace-guide" aria-hidden="true">bird</span><canvas class="w4-trace-canvas" width="720" height="280" aria-label="Drawing board for tracing bird"></canvas></div>
          <p class="w4-trace-message" aria-live="polite"></p>
          <div class="w4-trace-actions"><button class="pill-btn blue w4-trace-clear" type="button">Clear</button><button class="pill-btn green w4-trace-go" type="button">Go</button></div>
        </section>
      </div>
    `);
    const overlay = document.querySelector('.w4-trace-overlay');
    const close = overlay.querySelector('.w4-trace-close');
    const clear = overlay.querySelector('.w4-trace-clear');
    const go = overlay.querySelector('.w4-trace-go');
    const message = overlay.querySelector('.w4-trace-message');
    const canvas = overlay.querySelector('.w4-trace-canvas');
    const context = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 16;
    context.strokeStyle = '#176fd1';
    const point = event => {
      const bounds = canvas.getBoundingClientRect();
      return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
    };
    const closeOverlay = () => { overlay.hidden = true; traceButton.focus(); };
    traceButton.addEventListener('click', () => { overlay.hidden = false; message.textContent = ''; close.focus(); });
    close.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) closeOverlay(); });
    canvas.addEventListener('pointerdown', event => {
      drawing = true;
      hasInk = true;
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
    });
    canvas.addEventListener('pointermove', event => {
      if (!drawing) return;
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    });
    const stop = event => {
      if (!drawing) return;
      drawing = false;
      context.closePath();
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    clear.addEventListener('click', () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      message.textContent = 'The board is clear. Trace bird.';
    });
    go.addEventListener('click', () => {
      if (!hasInk) {
        message.textContent = 'Trace the word bird before you press Go.';
        speak('Trace the word bird first.');
        return;
      }
      traceResult.src = canvas.toDataURL('image/png');
      traceResult.hidden = false;
      traceButton.hidden = true;
      feedback.className = 'w4-feedback is-correct';
      feedback.textContent = 'Great writing! Your word is now on the page.';
      tone(true);
      speak('Great writing!');
      closeOverlay();
    });
  }

  function buildPage3() {
    const subjects = [
      { text: 'The rat is scaring', sentence: 'The rat is scaring the baby birds.', target: 1, color: '#f07a3a' },
      { text: 'The bird is scared', sentence: 'The bird is scared of the eagle.', target: 2, color: '#2d95da' },
      { text: 'The scary spider', sentence: 'The scary spider scares the bird.', target: 0, color: '#7e57c2' }
    ];
    const targets = ['scares the bird.', 'the baby birds.', 'of the eagle.'];
    const rows = [40.5, 57.5, 74.6];
    const stage = makeStage('w4-page3-stage');
    stage.insertAdjacentHTML('beforeend', `
      <svg class="w4-match-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g class="w4-match-lines"></g></svg>
      ${subjects.map((subject, index) => `<button class="w4-match-endpoint w4-match-source" type="button" data-source="${index}" data-row="${index}" aria-label="Start match: ${subject.text}"></button>`).join('')}
      ${targets.map((target, index) => `<button class="w4-match-endpoint w4-match-target" type="button" data-target="${index}" data-row="${index}" aria-label="Match to ${target}"></button>`).join('')}
    `);
    const feedback = addFeedback('Tap a black dot beside a sentence beginning, then tap its matching ending.', '<button class="w4-action secondary w4-restart" type="button" hidden>Try Again</button>');
    const sources = [...stage.querySelectorAll('.w4-match-source')];
    const targetsButtons = [...stage.querySelectorAll('.w4-match-target')];
    const lines = stage.querySelector('.w4-match-lines');
    const restart = document.querySelector('.w4-restart');
    let selected = null;
    let completed = 0;
    sources.forEach(button => button.addEventListener('click', () => {
      if (button.disabled) return;
      sources.forEach(item => item.classList.remove('is-selected'));
      selected = Number(button.dataset.source);
      button.classList.add('is-selected');
      feedback.className = 'w4-feedback';
      feedback.textContent = `${subjects[selected].text} — now choose the correct ending.`;
      speak(subjects[selected].text);
    }));
    targetsButtons.forEach(button => button.addEventListener('click', () => {
      if (button.disabled) return;
      if (selected === null) {
        feedback.textContent = 'Choose a sentence beginning first.';
        speak('Choose a sentence beginning first.');
        return;
      }
      const target = Number(button.dataset.target);
      const sourceButton = sources[selected];
      if (subjects[selected].target !== target) {
        sourceButton.classList.add('is-wrong');
        button.classList.add('is-wrong');
        feedback.className = 'w4-feedback is-wrong';
        feedback.textContent = 'Try again. That ending does not complete the sentence.';
        tone(false);
        speak('Try again.');
        window.setTimeout(() => { sourceButton.classList.remove('is-wrong'); button.classList.remove('is-wrong'); }, 650);
        return;
      }
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'w4-match-line');
      line.setAttribute('x1', '72.85');
      line.setAttribute('y1', String(rows[selected]));
      line.setAttribute('x2', '80.75');
      line.setAttribute('y2', String(rows[target]));
      line.setAttribute('stroke', subjects[selected].color);
      lines.appendChild(line);
      sourceButton.classList.remove('is-selected');
      sourceButton.classList.add('is-matched');
      button.classList.add('is-matched');
      sourceButton.disabled = true;
      button.disabled = true;
      const sentence = subjects[selected].sentence;
      selected = null;
      completed += 1;
      feedback.className = 'w4-feedback is-correct';
      feedback.textContent = `Correct! ${sentence}`;
      tone(true);
      speak(sentence);
      if (completed === subjects.length) {
        feedback.textContent = 'Great job! You matched all three sentences.';
        restart.hidden = false;
        speak('Great job! You matched all three sentences.');
      }
    }));
    restart.addEventListener('click', () => {
      selected = null;
      completed = 0;
      lines.replaceChildren();
      [...sources, ...targetsButtons].forEach(button => { button.disabled = false; button.classList.remove('is-selected', 'is-matched', 'is-wrong'); });
      feedback.className = 'w4-feedback';
      feedback.textContent = 'Tap a black dot beside a sentence beginning, then tap its matching ending.';
      restart.hidden = true;
    });
  }

  function buildBirdTimePage(pageNumber) {
    const daytime = pageNumber === 4;
    const correctIndexes = new Set(daytime ? [0, 2, 3, 4, 7, 8, 9, 11] : [0, 1, 4, 5, 9, 10, 11]);
    const times = daytime
      ? ['11 a.m.', '3 a.m.', '7 a.m.', '9 a.m.', '8 a.m.', '2 a.m.', '1 a.m.', '10 a.m.', '3 p.m.', '1 p.m.', '9 p.m.', '2 p.m.']
      : ['8 p.m.', '10 p.m.', '2 p.m.', '4 p.m.', '9 p.m.', '11 p.m.', '1 p.m.', '3 p.m.', '2 p.m.', '10 p.m.', '8 p.m.', '11 p.m.'];
    const stage = makeStage(`w4-page${pageNumber}-stage`);
    stage.insertAdjacentHTML('beforeend', times.map((time, index) => `<button class="w4-choice w4-bird-choice" type="button" data-index="${index}" data-row="${Math.floor(index / 4)}" data-col="${index % 4}" aria-label="Bird at ${time}" aria-pressed="false"></button>`).join(''));
    const instruction = `Choose every bird awake in the ${daytime ? 'daytime' : 'nighttime'}, then press Go.`;
    const feedback = addFeedback(instruction, '<button class="w4-action w4-check" type="button">Go</button><button class="w4-action secondary w4-restart" type="button" hidden>Try Again</button>');
    const buttons = [...stage.querySelectorAll('.w4-bird-choice')];
    const check = document.querySelector('.w4-check');
    const restart = document.querySelector('.w4-restart');
    buttons.forEach(button => button.addEventListener('click', () => {
      if (button.disabled) return;
      const pressed = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(pressed));
      button.classList.remove('is-wrong', 'is-missing');
      speak(`${button.getAttribute('aria-label')}${pressed ? ' selected' : ' unselected'}.`);
    }));
    check.addEventListener('click', () => {
      let allCorrect = true;
      buttons.forEach(button => {
        const index = Number(button.dataset.index);
        const selected = button.getAttribute('aria-pressed') === 'true';
        const shouldSelect = correctIndexes.has(index);
        button.classList.remove('is-wrong', 'is-missing');
        if (selected && !shouldSelect) button.classList.add('is-wrong');
        if (!selected && shouldSelect) button.classList.add('is-missing');
        if (selected !== shouldSelect) allCorrect = false;
      });
      feedback.className = `w4-feedback ${allCorrect ? 'is-correct' : 'is-wrong'}`;
      if (!allCorrect) {
        feedback.textContent = `Almost! Check the red choices and find every orange ${daytime ? 'daytime' : 'nighttime'} bird.`;
        tone(false);
        speak('Almost! Try again.');
        return;
      }
      buttons.forEach(button => { button.disabled = true; if (button.getAttribute('aria-pressed') === 'true') button.classList.add('is-correct'); });
      check.hidden = true;
      restart.hidden = false;
      feedback.textContent = `Wonderful! You found every bird awake in the ${daytime ? 'daytime' : 'nighttime'}.`;
      tone(true);
      speak(feedback.textContent);
    });
    restart.addEventListener('click', () => {
      buttons.forEach(button => { button.disabled = false; button.setAttribute('aria-pressed', 'false'); button.classList.remove('is-correct', 'is-wrong', 'is-missing'); });
      feedback.className = 'w4-feedback';
      feedback.textContent = instruction;
      check.hidden = false;
      restart.hidden = true;
    });
  }

  function buildPage6() {
    const rules = [
      { sentence: 'Run after birds.', answer: 'X' },
      { sentence: 'Take photos of birds.', answer: 'O' },
      { sentence: 'Walk quietly.', answer: 'O' },
      { sentence: 'Leave food on tables.', answer: 'X' },
      { sentence: 'Use binoculars to watch birds.', answer: 'O' },
      { sentence: 'Touch bird nests.', answer: 'X' },
      { sentence: 'Take bird eggs home.', answer: 'X' },
      { sentence: 'Put trash in bins.', answer: 'O' }
    ];
    const xs = [36.2, 84.2];
    const speakerXs = [12.5, 54.5];
    const ys = [39.2, 56.8, 73.7, 90.7];
    const stage = makeStage('w4-page6-stage');
    stage.insertAdjacentHTML('beforeend', rules.map((rule, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      return `<div class="w4-rule-control" data-rule="${index}" style="left:${xs[col]}%;top:${ys[row]}%"><div class="w4-rule-choices" role="group" aria-label="Choose O or X for ${rule.sentence}"><button class="w4-rule-choice" type="button" data-choice="O">O</button><button class="w4-rule-choice" type="button" data-choice="X">X</button></div></div>`;
    }).join(''));
    rules.forEach((rule, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      addSpeaker(stage, 'w4-rule-speaker', rule.sentence, rule.sentence, `left:${speakerXs[col]}%;top:${ys[row] - 5.2}%`);
    });
    const feedback = addFeedback('Listen to each rule, then choose O for a good choice or X for a wrong choice.');
    const completed = new Set();
    stage.querySelectorAll('.w4-rule-control').forEach(control => {
      const index = Number(control.dataset.rule);
      const rule = rules[index];
      const buttons = [...control.querySelectorAll('.w4-rule-choice')];
      buttons.forEach(button => button.addEventListener('click', () => {
        buttons.forEach(choice => choice.classList.remove('is-selected', 'is-wrong'));
        const correct = button.dataset.choice === rule.answer;
        feedback.className = `w4-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        if (!correct) {
          button.classList.add('is-wrong');
          feedback.textContent = 'Try again. Choose O for a good park choice or X for a wrong choice.';
          tone(false);
          speak('Try again.');
          return;
        }
        button.classList.add('is-selected');
        buttons.forEach(choice => { choice.disabled = true; });
        completed.add(index);
        tone(true);
        feedback.textContent = completed.size === rules.length ? 'Great job! You completed all eight park rules.' : `Correct! ${rule.sentence}`;
        speak(feedback.textContent);
      }));
    });
  }

  function buildPage7() {
    const questions = [
      { sentence: 'The gray rat is scary.', answer: 'scary' },
      { sentence: 'I am scared of the eagle.', answer: 'scared' },
      { sentence: 'The big black spider is scary.', answer: 'scary' },
      { sentence: 'The bird is scared of the people.', answer: 'scared' }
    ];
    const ys = [64.1, 71.15, 78.15, 85.15];
    const controls = [
      { left: 73.9, width: 17.2 },
      { left: 69.2, width: 17.2 },
      { left: 76.5, width: 17.2 },
      { left: 72.1, width: 17.2 }
    ];
    const stage = makeStage('w4-page7-stage');
    stage.insertAdjacentHTML('beforeend', questions.map((question, index) => `<div class="w4-grammar-control" data-question="${index}" style="top:${ys[index]}%;left:${controls[index].left}%;width:${controls[index].width}%"><div class="w4-word-choices" role="group" aria-label="Choose scary or scared"><button class="w4-word-choice" type="button" data-choice="scary" aria-label="Choose scary"></button><button class="w4-word-choice" type="button" data-choice="scared" aria-label="Choose scared"></button></div></div>`).join(''));
    questions.forEach((question, index) => addSpeaker(stage, 'w4-grammar-speaker', question.sentence, question.sentence, `top:${ys[index]}%`));
    const feedback = addFeedback('Listen to each sentence, then choose scary or scared.');
    const completed = new Set();
    stage.querySelectorAll('.w4-grammar-control').forEach(control => {
      const index = Number(control.dataset.question);
      const question = questions[index];
      const buttons = [...control.querySelectorAll('.w4-word-choice')];
      buttons.forEach(button => button.addEventListener('click', () => {
        buttons.forEach(choice => choice.classList.remove('is-selected', 'is-wrong'));
        const correct = button.dataset.choice === question.answer;
        feedback.className = `w4-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        if (!correct) {
          button.classList.add('is-wrong');
          feedback.textContent = 'Try again. Scary describes something. Scared describes how someone feels.';
          tone(false);
          speak('Try again.');
          return;
        }
        button.classList.add('is-selected');
        buttons.forEach(choice => { choice.disabled = true; });
        completed.add(index);
        tone(true);
        feedback.textContent = completed.size === questions.length ? 'Wonderful! You completed every sentence.' : `Correct! ${question.sentence}`;
        speak(feedback.textContent);
      }));
    });
  }

  if (page === 2) buildPage2();
  if (page === 3) buildPage3();
  if (page === 4 || page === 5) buildBirdTimePage(page);
  if (page === 6) buildPage6();
  if (page === 7) buildPage7();
})();
