(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !worksheetImage) return;

  const rules = [
    { position: 'top-1', sentence: 'Always clean up dog poop.', resultSentence: 'You should always clean up dog poop.', answer: 'O' },
    { position: 'top-2', sentence: 'Hurt other dogs.', resultSentence: 'You should not hurt other dogs.', answer: 'X' },
    { position: 'top-3', sentence: 'Shout at other dogs.', resultSentence: 'You should not shout at other dogs.', answer: 'X' },
    { position: 'top-4', sentence: 'Play with your dog.', resultSentence: 'You should play with your dog.', answer: 'O' },
    { position: 'bottom-1', sentence: 'Use a leash.', resultSentence: 'You should use a leash.', answer: 'O' },
    { position: 'bottom-2', sentence: 'Let your dog chase people.', resultSentence: 'You should not let your dog chase people.', answer: 'X' },
    { position: 'bottom-3', sentence: 'Let your dog fight other animals.', resultSentence: 'You should not let your dog fight other animals.', answer: 'X' },
    { position: 'bottom-4', sentence: 'Give your dog water.', resultSentence: 'You should give your dog water.', answer: 'O' }
  ];

  const stage = document.createElement('div');
  stage.className = 'page6-rules-stage';
  worksheetImage.before(stage);
  stage.appendChild(worksheetImage);
  wrap.classList.add('page6-rules-wrap');

  stage.insertAdjacentHTML('beforeend', rules.map((rule, index) => `
    <button class="page6-rule-speaker page6-rule-speaker-${rule.position}" type="button" data-rule="${index}" aria-label="Listen: ${rule.sentence}">
      <span aria-hidden="true">&#128266;</span>
    </button>
    <div class="page6-rule-control page6-rule-${rule.position}" data-rule="${index}">
      <div class="page6-rule-choices" role="group" aria-label="Choose O or X for ${rule.sentence}">
        <button class="page6-rule-choice" type="button" data-choice="O" aria-label="Choose O for ${rule.sentence}">O</button>
        <button class="page6-rule-choice" type="button" data-choice="X" aria-label="Choose X for ${rule.sentence}">X</button>
      </div>
      <span class="page6-rule-status" aria-hidden="true"></span>
    </div>
  `).join(''));

  const buildNote = document.querySelector('.activity-build-note');
  if (buildNote) buildNote.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="page6-rules-feedback" id="page6-rules-feedback" aria-live="polite">
      Listen to each rule, then choose O for a good choice or X for a wrong choice.
    </p>
  `);

  const feedback = document.querySelector('#page6-rules-feedback');
  const completed = new Set();

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

  document.querySelectorAll('.page6-rule-speaker').forEach(button => {
    const rule = rules[Number(button.dataset.rule)];
    button.addEventListener('click', () => speak(rule.sentence));
  });

  document.querySelectorAll('.page6-rule-control').forEach(control => {
    const ruleIndex = Number(control.dataset.rule);
    const rule = rules[ruleIndex];
    const status = control.querySelector('.page6-rule-status');
    const choiceButtons = [...control.querySelectorAll('.page6-rule-choice')];

    choiceButtons.forEach(button => {
      button.addEventListener('click', () => {
        const correct = button.dataset.choice === rule.answer;
        choiceButtons.forEach(choice => choice.classList.remove('is-selected', 'is-wrong-choice'));
        control.classList.remove('is-wrong');

        if (correct) {
          button.classList.add('is-selected');
          control.classList.add('is-correct');
          status.textContent = '\u2713';
          choiceButtons.forEach(choice => { choice.disabled = true; });
          completed.add(ruleIndex);
          playAnswerSound(true);

          const correctResponse = `Correct! ${rule.resultSentence}`;
          if (completed.size === rules.length) {
            const completionResponse = `${correctResponse} Great job! You completed all eight dog park rules.`;
            feedback.textContent = completionResponse;
            speak(completionResponse);
          } else {
            feedback.textContent = correctResponse;
            speak(correctResponse);
          }
          return;
        }

        button.classList.add('is-wrong-choice');
        control.classList.add('is-wrong');
        status.textContent = '\u00d7';
        feedback.textContent = 'Try again. Choose O for a good choice or X for a wrong choice.';
        playAnswerSound(false);
        speak('Try again.');
      });
    });
  });
})();
