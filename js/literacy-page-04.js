(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !worksheetImage) return;

  const groups = [
    {
      position: 'upper-left',
      label: 'upper left group of dogs',
      answer: 3,
      sentence: 'There are three colors: brown, white, and gray.'
    },
    {
      position: 'upper-right',
      label: 'upper right group of dogs',
      answer: 4,
      sentence: 'There are four colors: dark brown, white, gray and yellow.'
    },
    {
      position: 'lower-left',
      label: 'lower left group of dogs',
      answer: 6,
      sentence: 'There are six colors: gray, brown, dark brown, orange, white and yellow.'
    },
    {
      position: 'lower-right',
      label: 'lower right group of dogs',
      answer: 7,
      sentence: 'There are seven colors: yellow, black, brown, white, orange, dark brown, and red.'
    }
  ];

  const stage = document.createElement('div');
  stage.className = 'page4-color-count-stage';
  worksheetImage.before(stage);
  stage.appendChild(worksheetImage);
  wrap.classList.add('page4-color-count-wrap');

  stage.insertAdjacentHTML('beforeend', groups.map((group, index) => `
    <button class="page4-group-speaker page4-group-speaker-${group.position}" type="button" data-group="${index}" aria-label="Listen to the ${group.label}">
      <span aria-hidden="true">🔊</span>
    </button>
    <div class="page4-count-control page4-count-${group.position}" data-group="${index}" data-answer="${group.answer}">
      <output class="page4-number-value" aria-live="polite" aria-label="Answer for the ${group.label}">0</output>
      <div class="page4-step-buttons" aria-label="Change the answer for the ${group.label}">
        <button class="page4-step-button" type="button" data-step="1" aria-label="Increase answer">▲</button>
        <button class="page4-step-button" type="button" data-step="-1" aria-label="Decrease answer">▼</button>
      </div>
      <button class="page4-answer-go" type="button">Go</button>
      <span class="page4-answer-status" aria-hidden="true"></span>
    </div>
  `).join(''));

  const buildNote = document.querySelector('.activity-build-note');
  if (buildNote) buildNote.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="page4-count-feedback" id="page4-count-feedback" aria-live="polite">
      Count the different dog colors in each group. Use the arrows, then press Go.
    </p>
  `);

  const feedback = document.querySelector('#page4-count-feedback');

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

  document.querySelectorAll('.page4-group-speaker').forEach(button => {
    const group = groups[Number(button.dataset.group)];
    button.addEventListener('click', () => speak(group.sentence));
  });

  document.querySelectorAll('.page4-count-control').forEach(control => {
    const group = groups[Number(control.dataset.group)];
    const valueOutput = control.querySelector('.page4-number-value');
    const status = control.querySelector('.page4-answer-status');
    let value = 0;

    control.querySelectorAll('.page4-step-button').forEach(button => {
      button.addEventListener('click', () => {
        value = Math.max(0, Math.min(10, value + Number(button.dataset.step)));
        valueOutput.textContent = String(value);
        control.classList.remove('is-wrong');
        status.textContent = '';
      });
    });

    control.querySelector('.page4-answer-go').addEventListener('click', () => {
      const correct = value === group.answer;
      control.classList.remove('is-wrong');
      void control.offsetWidth;
      control.classList.toggle('is-correct', correct);
      control.classList.toggle('is-wrong', !correct);
      status.textContent = correct ? '✓' : '×';
      feedback.textContent = correct
        ? `Correct! ${group.sentence}`
        : 'Try again. Count how many different colors you can see.';
      playAnswerSound(correct);
      speak(correct ? `Correct! ${group.sentence}` : 'Try again.');
      if (correct) {
        control.querySelectorAll('.page4-step-button, .page4-answer-go').forEach(button => { button.disabled = true; });
      }
    });
  });
})();
