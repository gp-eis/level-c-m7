(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;
  const choices = [
    { key: 'animals', label: 'no animals', correct: true },
    { key: 'people', label: 'no people', correct: true },
    { key: 'water', label: 'no water', correct: false },
    { key: 'plants', label: 'no plants', correct: true }
  ];
  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page6-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');
  stage.insertAdjacentHTML('beforeend', choices.map(choice => `
    <button class="w4-stage-button w4-page6-choice" type="button" data-choice="${choice.key}" aria-label="${choice.label}" aria-pressed="false"></button>
  `).join(''));
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Choose everything we could lose without bees, then press Go.</p>
    <div class="w4-actions"><button class="w4-check" type="button">Go</button><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>
  `);
  const feedback = document.querySelector('.w4-feedback');
  const check = document.querySelector('.w4-check');
  const restart = document.querySelector('.w4-restart');
  const buttons = [...stage.querySelectorAll('.w4-page6-choice')];
  const speak = text => typeof speakAmericanEnglish === 'function' && speakAmericanEnglish(text);
  const tone = correct => {
    if (typeof playTone !== 'function') return;
    playTone(correct ? 523.25 : 220, .14, .1, correct ? 'triangle' : 'sine');
    playTone(correct ? 783.99 : 174.61, .18, .08, correct ? 'triangle' : 'sine', .12);
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    const pressed = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(pressed));
    button.classList.remove('is-wrong', 'is-missing');
    feedback.className = 'w4-feedback';
    feedback.textContent = pressed ? `${button.getAttribute('aria-label')} selected.` : `${button.getAttribute('aria-label')} unselected.`;
    speak(button.getAttribute('aria-label'));
  }));
  check.addEventListener('click', () => {
    const results = choices.map(choice => {
      const button = buttons.find(item => item.dataset.choice === choice.key);
      const selected = button.getAttribute('aria-pressed') === 'true';
      button.classList.remove('is-wrong', 'is-missing');
      if (selected && !choice.correct) button.classList.add('is-wrong');
      if (!selected && choice.correct) button.classList.add('is-missing');
      return selected === choice.correct;
    });
    if (!results.every(Boolean)) {
      feedback.className = 'w4-feedback is-wrong';
      feedback.textContent = 'Almost! Check the red choice and find every orange choice.';
      tone(false);
      speak('Almost! Try again.');
      return;
    }
    buttons.forEach(button => {
      button.disabled = true;
      if (button.getAttribute('aria-pressed') === 'true') button.classList.add('is-correct');
    });
    check.hidden = true;
    restart.hidden = false;
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = 'Great job! Bees help plants, animals, and people live.';
    tone(true);
    speak('Great job! Bees help plants, animals, and people live.');
  });
  restart.addEventListener('click', () => {
    buttons.forEach(button => {
      button.disabled = false;
      button.setAttribute('aria-pressed', 'false');
      button.classList.remove('is-correct', 'is-wrong', 'is-missing');
    });
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Choose everything we could lose without bees, then press Go.';
    check.hidden = false;
    restart.hidden = true;
  });
})();
