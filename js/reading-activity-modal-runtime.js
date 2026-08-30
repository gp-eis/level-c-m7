(() => {
  const week = Number(document.body.dataset.week || document.querySelector('[data-reading-week]')?.dataset.readingWeek);
  const app = document.querySelector('#track-app') || document.querySelector('main.page') || document.querySelector('.page');
  const config = window.READING_ACTIVITY_CONFIGS?.[week];
  if (!app || !config) return;

  const existingActivityLink = app.querySelector('a[href*="activity.html"]');
  const activityCard = existingActivityLink?.closest('section') || app.querySelector('.track-activity-card');
  if (!activityCard) return;
  activityCard.classList.add('w1-reading-activity-card');
  activityCard.innerHTML = `<h2 class="section-title">⭐ ${config.title}</h2><p>${config.cardCopy || 'Answer four picture questions about the story.'}</p><button class="track-activity-btn pill-btn green" id="reading-activity-open" type="button"><span aria-hidden="true">📖</span><span>Start Activity</span></button>`;

  const overlay = document.createElement('div');
  overlay.className = 'w1-reading-modal';
  overlay.hidden = true;
  overlay.innerHTML = `<section class="w1-reading-dialog" role="dialog" aria-modal="true" aria-labelledby="reading-dialog-title"><header class="w1-reading-dialog-header"><div><h2 id="reading-dialog-title">⭐ ${config.title}</h2><div class="w1-reading-intro"><p>Look, listen, and choose the right answer!</p><button class="w1-reading-speaker" data-intro type="button" aria-label="Listen to the activity instructions">🔊</button></div></div><button class="w1-reading-close" data-close type="button" aria-label="Close activity">✕</button></header><div class="w1-reading-dialog-body"></div></section>`;
  document.body.appendChild(overlay);
  const body = overlay.querySelector('.w1-reading-dialog-body');

  if (config.available === false) {
    body.innerHTML = `<section class="w1-reading-coming-soon"><div class="w1-reading-coming-soon-card"><h2>📚 Activity Coming Soon</h2><p>The Week ${week} Reading questions and pictures will be added here.</p><button class="track-activity-btn pill-btn green" data-finish type="button">✓ Back to Reading</button></div></section>`;
  } else {
    body.innerHTML = `<div data-game><div class="w1-reading-progress"><span data-progress></span><span class="w1-reading-dots" data-dots aria-hidden="true"></span></div><div class="w1-reading-question"><img data-question-image alt=""><div><h2 data-question></h2><p data-detail></p></div><button class="w1-reading-speaker" data-question-speaker type="button" aria-label="Listen to the question">🔊</button></div><div class="w1-reading-answers" data-answers></div><p class="w1-reading-feedback" data-feedback aria-live="polite"></p></div><section class="w1-reading-complete" data-complete hidden><h2>🏆 Great job!</h2><p>${config.completion}</p><div class="w1-reading-complete-actions"><button class="track-activity-btn" data-again type="button">🔄 Try Again</button><button class="track-activity-btn" data-finish type="button">✓ Finish</button><button class="w1-reading-speaker" data-complete-speaker type="button" aria-label="Listen to the congratulations message">🔊</button></div></section>`;
  }

  let index = 0;
  let locked = false;
  let lastFocus = null;
  const game = overlay.querySelector('[data-game]');
  const questionImage = overlay.querySelector('[data-question-image]');
  const questionPanel = overlay.querySelector('.w1-reading-question');
  const questionText = overlay.querySelector('[data-question]');
  const detail = overlay.querySelector('[data-detail]');
  const answers = overlay.querySelector('[data-answers]');
  const feedback = overlay.querySelector('[data-feedback]');
  const questionSpeaker = overlay.querySelector('[data-question-speaker]');
  const completion = overlay.querySelector('[data-complete]');

  function speak(text) {
    if (typeof window.speakAmericanEnglish === 'function') return window.speakAmericanEnglish(text, { rate: .82, pitch: 1.05 });
    if (!('speechSynthesis' in window) || !text) return Promise.resolve();
    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; utterance.rate = .88; utterance.pitch = 1.06;
      utterance.onend = resolve; utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }
  function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function shuffle(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
  function resultSound(correct) { if (typeof window.playTone !== 'function') return; if (correct) { window.playTone(523,.16,.11,'sine'); window.playTone(659,.16,.1,'sine',.1); window.playTone(784,.2,.1,'sine',.2); } else { window.playTone(220,.18,.08,'sawtooth'); window.playTone(160,.24,.07,'sawtooth',.13); } }
  function setDisabled(value) { answers?.querySelectorAll('button').forEach(button => { button.disabled = value; }); if (questionSpeaker) questionSpeaker.disabled = value; }

  function renderProgress() {
    overlay.querySelector('[data-progress]').textContent = `Question ${index + 1} of ${config.questions.length}`;
    const dots = overlay.querySelector('[data-dots]'); dots.replaceChildren();
    config.questions.forEach((_, i) => { const dot = document.createElement('span'); dot.className = 'w1-reading-dot'; if (i < index) dot.classList.add('is-done'); if (i === index) dot.classList.add('is-current'); dots.appendChild(dot); });
  }

  function makeAnswer(answer) {
    const card = document.createElement('article'); card.className = 'w1-reading-answer';
    const pick = document.createElement('button'); pick.className = 'w1-reading-answer-select'; pick.type = 'button';
    pick.innerHTML = `<img src="${config.assetBase}${answer.image}" alt="${answer.alt || answer.label}">${config.questions[index].hideAnswerText ? '' : `<span class="w1-reading-answer-label">${answer.label}</span>`}`;
    const listen = document.createElement('button'); listen.className = 'w1-reading-speaker'; listen.type = 'button'; listen.textContent = '🔊'; listen.setAttribute('aria-label', `Listen to: ${answer.label}`);
    listen.addEventListener('click', event => { event.stopPropagation(); if (!locked) speak(answer.label); });
    card.append(listen, pick);
    pick.addEventListener('click', async () => {
      if (locked) return;
      locked = true; setDisabled(true);
      if (!answer.correct) {
        resultSound(false); card.classList.add('is-wrong'); feedback.textContent = 'Try again!'; feedback.className = 'w1-reading-feedback is-wrong'; await speak(answer.label);
        window.setTimeout(() => { card.classList.remove('is-wrong'); feedback.textContent = ''; feedback.className = 'w1-reading-feedback'; locked = false; setDisabled(false); }, 500);
        return;
      }
      resultSound(true); card.classList.add('is-correct'); feedback.textContent = 'Great choice!'; feedback.className = 'w1-reading-feedback is-good';
      const question = config.questions[index]; await speak(question.response || answer.response || `That's right! ${answer.label}`);
      window.setTimeout(() => { if (index < config.questions.length - 1) { index += 1; render(); } else { game.hidden = true; completion.hidden = false; body.classList.add('is-complete'); speak(`Great job! ${config.completion}`); } }, 450);
    });
    return card;
  }

  function render() {
    if (!game) return;
    locked = false; body.classList.remove('is-complete'); completion.hidden = true; game.hidden = false;
    const item = config.questions[index]; questionText.textContent = item.question; detail.textContent = item.detail || ''; detail.hidden = !item.detail;
    questionPanel.classList.toggle('no-image', !item.image); questionImage.hidden = !item.image;
    if (item.image) { questionImage.src = `${config.assetBase}${item.image}`; questionImage.alt = item.imageAlt || ''; }
    answers.replaceChildren(); answers.classList.toggle('has-three-answers', item.answers.length === 3); shuffle(item.answers).forEach(answer => answers.appendChild(makeAnswer(answer)));
    feedback.textContent = ''; feedback.className = 'w1-reading-feedback'; setDisabled(false); renderProgress();
  }

  function open() { lastFocus = document.activeElement; index = 0; if (game) render(); overlay.hidden = false; document.body.classList.add('w1-reading-modal-open'); overlay.querySelector('[data-close]').focus(); }
  function close() { overlay.hidden = true; document.body.classList.remove('w1-reading-modal-open'); stopSpeech(); if (lastFocus instanceof HTMLElement) lastFocus.focus(); }

  activityCard.querySelector('#reading-activity-open').addEventListener('click', open);
  overlay.querySelector('[data-close]').addEventListener('click', close);
  overlay.querySelector('[data-intro]').addEventListener('click', () => speak('Look, listen, and choose the right answer!'));
  questionSpeaker?.addEventListener('click', () => { if (!locked) { const item = config.questions[index]; speak(`${item.question}${item.detail ? ` ${item.detail}` : ''}`); } });
  overlay.querySelector('[data-complete-speaker]')?.addEventListener('click', () => speak(`Great job! ${config.completion}`));
  overlay.querySelector('[data-again]')?.addEventListener('click', () => { index = 0; render(); });
  overlay.querySelectorAll('[data-finish]').forEach(button => button.addEventListener('click', close));
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
})();
