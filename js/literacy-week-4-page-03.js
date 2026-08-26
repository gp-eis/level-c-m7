(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const choices = [
    { key: 'santa', sentence: 'I am Santa Claus.', color: '#2870ca' },
    { key: 'lorenzo', sentence: 'I am Lorenzo Langstroth.', color: '#67b84a', correct: true },
    { key: 'king', sentence: 'I am King Sejeong.', color: '#f1782c' }
  ];
  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page3-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');

  stage.insertAdjacentHTML('beforeend', choices.map(choice => `
    <button class="w4-stage-button w4-page3-choice" type="button" data-choice="${choice.key}" aria-label="${choice.sentence}">
      <span class="w4-page3-dot-mask" style="--dot:${choice.color}" aria-hidden="true"></span>
    </button>
  `).join(''));
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Choose the sentence that Lorenzo Langstroth would say.</p>
    <div class="w4-actions"><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>
  `);

  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const buttons = [...stage.querySelectorAll('.w4-page3-choice')];
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
      feedback.textContent = `Try again. ${choice.sentence}`;
      tone(false);
      speak(`${choice.sentence} Try again.`);
      return;
    }
    button.classList.add('is-correct');
    buttons.forEach(item => { item.disabled = true; });
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = 'Correct! I am Lorenzo Langstroth.';
    restart.hidden = false;
    tone(true);
    speak('Correct! I am Lorenzo Langstroth.');
  }));

  restart.addEventListener('click', () => {
    buttons.forEach(button => { button.disabled = false; button.classList.remove('is-correct', 'is-wrong'); });
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Choose the sentence that Lorenzo Langstroth would say.';
    restart.hidden = true;
  });
})();
