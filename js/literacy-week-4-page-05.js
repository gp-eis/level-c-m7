(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;
  const choices = [
    { key: 'fireman', phrase: 'a fireman' },
    { key: 'beekeeper', phrase: 'a beekeeper', correct: true },
    { key: 'nurse', phrase: 'a nurse' }
  ];
  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page5-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');
  stage.insertAdjacentHTML('beforeend', `
    ${choices.map(choice => `<button class="w4-stage-button w4-page5-choice" type="button" data-choice="${choice.key}" aria-label="Lorenzo Langstroth was ${choice.phrase}"></button>`).join('')}
    <div class="w4-page5-answer" aria-live="polite">He was <span>________</span>.</div>
  `);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Choose Lorenzo Langstroth’s job.</p>
    <div class="w4-actions"><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>
  `);
  const feedback = document.querySelector('.w4-feedback');
  const answer = stage.querySelector('.w4-page5-answer span');
  const restart = document.querySelector('.w4-restart');
  const buttons = [...stage.querySelectorAll('.w4-page5-choice')];
  const speak = text => typeof speakAmericanEnglish === 'function' && speakAmericanEnglish(text);
  const tone = correct => {
    if (typeof playTone !== 'function') return;
    playTone(correct ? 523.25 : 220, .14, .1, correct ? 'triangle' : 'sine');
    playTone(correct ? 783.99 : 174.61, .18, .08, correct ? 'triangle' : 'sine', .12);
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const choice = choices.find(item => item.key === button.dataset.choice);
    buttons.forEach(item => item.classList.remove('is-wrong'));
    if (!choice.correct) {
      button.classList.add('is-wrong');
      feedback.className = 'w4-feedback is-wrong';
      feedback.textContent = `He was not ${choice.phrase}. Try again.`;
      tone(false);
      speak(`He was not ${choice.phrase}. Try again.`);
      return;
    }
    button.classList.add('is-correct');
    buttons.forEach(item => { item.disabled = true; });
    answer.textContent = 'a beekeeper';
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = 'Correct! He was a beekeeper.';
    restart.hidden = false;
    tone(true);
    speak('Correct! He was a beekeeper.');
  }));
  restart.addEventListener('click', () => {
    buttons.forEach(button => { button.disabled = false; button.classList.remove('is-correct', 'is-wrong'); });
    answer.textContent = '________';
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Choose Lorenzo Langstroth’s job.';
    restart.hidden = true;
  });
})();
