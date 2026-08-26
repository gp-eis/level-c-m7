(() => {
  const wrap = document.querySelector('.activity-sheet-wrap');
  const worksheetImage = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !worksheetImage) return;

  const questions = [
    {
      position: 'one',
      sentence: "You should always clean up your dog's poop.",
      tail: "always clean up your dog's poop.",
      answer: 'should'
    },
    {
      position: 'two',
      sentence: 'You should not let your dog chase people.',
      tail: 'let your dog chase people.',
      answer: 'should-not'
    },
    {
      position: 'three',
      sentence: 'You should play with your dog at the dog park.',
      tail: 'play with your dog at the dog park.',
      answer: 'should'
    },
    {
      position: 'four',
      sentence: 'You should use a leash when walking your dog.',
      tail: 'use a leash when walking your dog.',
      answer: 'should'
    }
  ];

  const stage = document.createElement('div');
  stage.className = 'page7-grammar-stage';
  worksheetImage.before(stage);
  stage.appendChild(worksheetImage);
  wrap.classList.add('page7-grammar-wrap');

  stage.insertAdjacentHTML('beforeend', questions.map((question, index) => `
    <button class="page7-question-speaker page7-question-speaker-${question.position}" type="button" data-question="${index}" aria-label="Listen: ${question.sentence}">
      <span aria-hidden="true">&#128266;</span>
    </button>
    <div class="page7-question-control page7-question-${question.position}" data-question="${index}">
      <div class="page7-word-choices" role="group" aria-label="Complete this sentence: ${question.sentence}">
        <button class="page7-word-choice page7-word-should" type="button" data-choice="should">should</button>
        <button class="page7-word-choice page7-word-should-not" type="button" data-choice="should-not">should not</button>
      </div>
      <span class="page7-question-status" aria-hidden="true"></span>
    </div>
  `).join(''));

  const videoOverlay = document.createElement('div');
  videoOverlay.className = 'page7-video-overlay';
  videoOverlay.hidden = true;
  videoOverlay.innerHTML = `
    <div class="video-play-shell page7-video-shell">
      <video class="page7-intro-video" controls playsinline preload="metadata" aria-label="At the Dog Park activity clip">
        <source src="../assets/video/literacy/week-1-page-07.mp4" type="video/mp4">
        Your browser does not support this video.
      </video>
      <button class="center-video-play page7-video-play" type="button" aria-label="Play the At the Dog Park clip">&#9654;</button>
    </div>
    <p class="page7-video-message" aria-live="polite" hidden></p>
  `;

  const startLayer = document.createElement('div');
  startLayer.className = 'literacy-activity-start-layer';
  startLayer.innerHTML = `
    <button class="literacy-activity-start-button page7-start-button" type="button" aria-label="Start activity and watch the At the Dog Park clip">
      <span aria-hidden="true">&#9654;</span>
      <span>Start Activity</span>
    </button>
  `;

  wrap.append(videoOverlay, startLayer);
  wrap.classList.add('has-literacy-activity-start');
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');

  const buildNote = document.querySelector('.activity-build-note');
  if (buildNote) buildNote.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="page7-grammar-feedback" id="page7-grammar-feedback" aria-live="polite">
      Watch the clip, then complete the activity.
    </p>
  `);

  const startButton = startLayer.querySelector('.page7-start-button');
  const video = videoOverlay.querySelector('.page7-intro-video');
  const playButton = videoOverlay.querySelector('.page7-video-play');
  const videoMessage = videoOverlay.querySelector('.page7-video-message');
  const feedback = document.querySelector('#page7-grammar-feedback');
  const completed = new Set();
  let activityShown = false;

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

  function showActivity() {
    if (activityShown) return;
    activityShown = true;
    videoOverlay.hidden = true;
    stage.inert = false;
    stage.removeAttribute('aria-hidden');
    feedback.textContent = 'Listen to each sentence, then choose should or should not.';
  }

  async function playVideo() {
    playButton.hidden = true;
    try {
      await video.play();
    } catch (error) {
      playButton.hidden = false;
      videoMessage.hidden = false;
      videoMessage.textContent = 'Press the play button to begin the clip.';
    }
  }

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    videoOverlay.hidden = false;
    feedback.textContent = 'Watch the clip. The activity will appear when it finishes.';
    playVideo();
  });

  playButton.addEventListener('click', playVideo);
  video.addEventListener('play', () => { playButton.hidden = true; });
  video.addEventListener('playing', () => {
    playButton.hidden = true;
    videoMessage.hidden = true;
  });
  video.addEventListener('pause', () => {
    if (!video.ended) playButton.hidden = false;
  });
  video.addEventListener('ended', showActivity);
  video.addEventListener('error', () => {
    videoMessage.hidden = false;
    videoMessage.innerHTML = 'The clip could not be played. <button class="page7-continue-button" type="button">Continue to Activity</button>';
    videoMessage.querySelector('.page7-continue-button').addEventListener('click', showActivity);
  });

  document.querySelectorAll('.page7-question-speaker').forEach(button => {
    const question = questions[Number(button.dataset.question)];
    button.addEventListener('click', () => speak(question.sentence));
  });

  document.querySelectorAll('.page7-question-control').forEach(control => {
    const questionIndex = Number(control.dataset.question);
    const question = questions[questionIndex];
    const status = control.querySelector('.page7-question-status');
    const choiceButtons = [...control.querySelectorAll('.page7-word-choice')];

    choiceButtons.forEach(button => {
      button.addEventListener('click', () => {
        const correct = button.dataset.choice === question.answer;
        choiceButtons.forEach(choice => choice.classList.remove('is-selected', 'is-wrong-choice'));
        control.classList.remove('is-wrong');

        if (correct) {
          button.classList.add('is-selected');
          control.classList.add('is-correct');
          status.textContent = '\u2713';
          choiceButtons.forEach(choice => { choice.disabled = true; });
          completed.add(questionIndex);
          playAnswerSound(true);

          if (completed.size === questions.length) {
            feedback.textContent = 'Wonderful! You completed every dog park sentence.';
            speak('Wonderful! You completed every dog park sentence.');
          } else {
            feedback.textContent = `Correct! ${question.sentence}`;
            speak(`Correct! ${question.sentence}`);
          }
          return;
        }

        button.classList.add('is-wrong-choice');
        control.classList.add('is-wrong');
        status.textContent = '\u00d7';
        feedback.textContent = 'Try again. Think about whether this is the right or wrong thing to do.';
        playAnswerSound(false);
        speak('Try again.');
      });
    });
  });
})();
