(() => {
  if (window.LevelCLiteracyCompletion) return;

  const body = document.body;
  const week = Number(body.dataset.week);
  const page = Number(body.dataset.page);
  const isReadingQuiz = body.classList.contains('literacy-reading-activity-page');
  let hasPlayed = false;

  const overlay = document.createElement('div');
  overlay.className = 'activity-completion-overlay level-c-literacy-completion';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Activity complete celebration');
  overlay.innerHTML = `
    <div class="activity-completion-frame">
      <button class="activity-completion-close" type="button" aria-label="Close the congratulatory clip">&times;</button>
      <video class="activity-completion-video" src="../assets/video/shared/pow-wow-you-did-it.mp4" playsinline preload="metadata"></video>
      <button class="activity-completion-play" type="button" aria-label="Play the congratulatory clip" hidden>&#9654;</button>
      <div class="activity-completion-actions">
        <button class="pill-btn blue activity-completion-restart" type="button">&#8635; Try Again</button>
      </div>
    </div>`;
  body.appendChild(overlay);

  const video = overlay.querySelector('.activity-completion-video');
  const closeButton = overlay.querySelector('.activity-completion-close');
  const playButton = overlay.querySelector('.activity-completion-play');
  const restartButton = overlay.querySelector('.activity-completion-restart');

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function hide() {
    video.pause();
    overlay.hidden = true;
    body.classList.remove('level-c-completion-open');
  }

  async function playVideo() {
    playButton.hidden = true;
    try {
      await video.play();
    } catch (error) {
      playButton.hidden = false;
    }
  }

  function show() {
    if (hasPlayed) return;
    hasPlayed = true;
    stopSpeech();
    overlay.hidden = false;
    body.classList.add('level-c-completion-open');
    video.currentTime = 0;
    closeButton.focus({ preventScroll: true });
    playVideo();
  }

  function every(selector, expected) {
    const elements = [...document.querySelectorAll(selector)];
    return elements.length === expected && elements.every(element => element.classList.contains('is-correct'));
  }

  function selected(selector, expected) {
    return document.querySelectorAll(`${selector}.is-selected`).length === expected;
  }

  function isComplete() {
    if (isReadingQuiz) {
      const complete = document.querySelector('.literacy-quiz-complete');
      return Boolean(complete && !complete.hidden);
    }

    if (week === 1 && page === 2) return Boolean(document.querySelector('.page2-trace-word.is-complete')) && every('.page2-number-control', 3);
    if (week === 1 && page === 3) return document.querySelectorAll('.page3-subject-endpoint.is-matched').length === 4;
    if (week === 1 && page === 4) return every('.page4-count-control', 4);
    if (week === 1 && page === 5) return every('.page5-count-control', 4);
    if (week === 1 && page === 6) return every('.page6-rule-control', 8);
    if (week === 1 && page === 7) return every('.page7-question-control', 4);

    if (week === 2 && page === 2) return Boolean(document.querySelector('.w2p2-trace-word.is-complete')) && every('.w2-counter', 3);
    if (week === 2 && page === 3) return document.querySelectorAll('.w2p3-subject.is-matched').length === 4;
    if (week === 2 && (page === 4 || page === 5)) return every('.w2-counter', 4);
    if (week === 2 && page === 6) return every('.w2p6-rule', 8);
    if (week === 2 && page === 7) return every('.w2p7-question', 4);

    if (week === 3 && page === 2) return Boolean(document.querySelector('.w3p2-trace-word.is-complete')) && every('.w3-counter', 3);
    if (week === 3 && page >= 3 && page <= 5) return every('.w3-counter', 4);
    if (week === 3 && page === 6) return every('.w3p6-rule', 8);
    if (week === 3 && page === 7) return every('.w3p7-question', 4);

    if (week === 4 && page === 2) {
      const traceButton = document.querySelector('.w4-trace-word');
      return Boolean(traceButton && traceButton.hidden) && every('.w4-counter', 3);
    }
    if (week === 4 && page === 3) return document.querySelectorAll('.w4-match-source.is-matched').length === 3;
    if (week === 4 && (page === 4 || page === 5)) return document.querySelectorAll('.w4-bird-row-check.is-complete').length === 3;
    if (week === 4 && page === 6) return selected('.w4-rule-choice', 8);
    if (week === 4 && page === 7) return selected('.w4-word-choice', 4);

    return false;
  }

  function checkCompletion() {
    if (!hasPlayed && isComplete()) show();
  }

  closeButton.addEventListener('click', hide);
  playButton.addEventListener('click', playVideo);
  restartButton.addEventListener('click', () => window.location.reload());
  overlay.addEventListener('click', event => { if (event.target === overlay) hide(); });
  video.addEventListener('play', () => { playButton.hidden = true; });
  video.addEventListener('pause', () => { if (!video.ended && !overlay.hidden) playButton.hidden = false; });
  video.addEventListener('ended', () => { playButton.hidden = true; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) hide(); });

  const observer = new MutationObserver(checkCompletion);
  observer.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });

  window.LevelCLiteracyCompletion = { show, hide, check: checkCompletion };
  checkCompletion();
})();
