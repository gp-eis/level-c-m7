(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const facts = [
    { key: 'book', sentence: 'Lorenzo Langstroth wrote a book.', target: 'book', x: 25.8, y: 43, color: '#ef7fb0' },
    { key: 'loved', sentence: 'Lorenzo Langstroth loved bees.', target: 'loved', x: 23.6, y: 56.8, color: '#4f9cda' },
    { key: 'hive', sentence: 'Lorenzo Langstroth made the modern beehive.', target: 'hive', x: 41.2, y: 70.4, color: '#f4a14b' },
    { key: 'helped', sentence: 'Lorenzo Langstroth helped beekeepers.', target: 'helped', x: 32.8, y: 84.3, color: '#6fbf3d' }
  ];
  const targets = [
    { key: 'hive', x: 57.7, y: 42.8, label: 'modern beehives' },
    { key: 'book', x: 80, y: 55.8, label: 'a typewriter writing a book' },
    { key: 'loved', x: 57.7, y: 69.8, label: 'bees on flowers' },
    { key: 'helped', x: 79.4, y: 83.6, label: 'many healthy bees' }
  ];
  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page4-stage';
  image.before(stage);
  stage.appendChild(image);
  wrap.classList.add('w4-bee-wrap');

  stage.insertAdjacentHTML('beforeend', `
    <svg class="w4-page4-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g>${facts.map(fact => {
        const target = targets.find(item => item.key === fact.target);
        return `<line class="w4-page4-mask-line" x1="${fact.x}" y1="${fact.y}" x2="${target.x}" y2="${target.y}"></line>`;
      }).join('')}</g>
      <g id="w4-page4-lines"></g>
    </svg>
    ${facts.map(fact => `<button class="w4-stage-button w4-page4-endpoint w4-page4-source" type="button" data-item="${fact.key}" style="left:${fact.x}%;top:${fact.y}%" aria-label="Start a match for: ${fact.sentence}"></button>`).join('')}
    ${targets.map(target => `<button class="w4-stage-button w4-page4-endpoint w4-page4-target" type="button" data-target="${target.key}" style="left:${target.x}%;top:${target.y}%" aria-label="Match to ${target.label}"></button>`).join('')}
  `);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Tap a black dot beside a sentence, then tap its matching picture.</p>
    <div class="w4-actions"><button class="w4-restart" type="button" hidden>↻ Try Again</button></div>
  `);

  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const sources = [...stage.querySelectorAll('.w4-page4-source')];
  const targetButtons = [...stage.querySelectorAll('.w4-page4-target')];
  const lineGroup = stage.querySelector('#w4-page4-lines');
  let selected = null;
  let completed = 0;
  const speak = text => typeof speakAmericanEnglish === 'function' && speakAmericanEnglish(text);
  const tone = correct => {
    if (typeof playTone !== 'function') return;
    playTone(correct ? 523.25 : 220, .14, .1, correct ? 'triangle' : 'sine');
    playTone(correct ? 783.99 : 174.61, .18, .08, correct ? 'triangle' : 'sine', .12);
  };

  function selectSource(button) {
    sources.forEach(source => source.classList.remove('is-selected'));
    selected = button.dataset.item;
    button.classList.add('is-selected');
    const fact = facts.find(item => item.key === selected);
    feedback.className = 'w4-feedback';
    feedback.textContent = `${fact.sentence} Now choose its picture.`;
    speak(fact.sentence);
  }

  sources.forEach(button => button.addEventListener('click', () => {
    if (!button.disabled) selectSource(button);
  }));

  targetButtons.forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    if (!selected) {
      feedback.textContent = 'Choose a sentence dot first.';
      speak('Choose a sentence first.');
      return;
    }
    const fact = facts.find(item => item.key === selected);
    const source = sources.find(item => item.dataset.item === selected);
    if (fact.target !== button.dataset.target) {
      source.classList.add('is-wrong');
      button.classList.add('is-wrong');
      feedback.className = 'w4-feedback is-wrong';
      feedback.textContent = 'Try again. Choose a different picture.';
      tone(false);
      speak('Try again. Choose a different picture.');
      window.setTimeout(() => { source.classList.remove('is-wrong'); button.classList.remove('is-wrong'); }, 600);
      return;
    }
    const target = targets.find(item => item.key === button.dataset.target);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'w4-page4-match-line');
    line.setAttribute('x1', fact.x);
    line.setAttribute('y1', fact.y);
    line.setAttribute('x2', target.x);
    line.setAttribute('y2', target.y);
    line.setAttribute('stroke', fact.color);
    lineGroup.appendChild(line);
    source.classList.remove('is-selected');
    source.classList.add('is-matched');
    button.classList.add('is-matched');
    source.disabled = true;
    button.disabled = true;
    selected = null;
    completed += 1;
    tone(true);
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = `Correct! ${fact.sentence}`;
    speak(`Correct! ${fact.sentence}`);
    if (completed === facts.length) {
      feedback.textContent = 'Great job! You matched all four facts.';
      restart.hidden = false;
      speak('Great job! You matched all four facts.');
    }
  }));

  restart.addEventListener('click', () => {
    selected = null;
    completed = 0;
    lineGroup.replaceChildren();
    [...sources, ...targetButtons].forEach(button => {
      button.disabled = false;
      button.classList.remove('is-selected', 'is-matched', 'is-wrong');
    });
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Tap a black dot beside a sentence, then tap its matching picture.';
    restart.hidden = true;
  });
})();
