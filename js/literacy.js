(() => {
  const config = window.LEVEL_C_M7;
  const app = document.querySelector('#literacy-app');
  const weekNumber = Number(document.body.dataset.week);
  const page = Number(document.body.dataset.page);
  const week = config && config.weeks[weekNumber];
  const pageCount = 7;

  if (!app || !week || page < 1 || page > pageCount) return;

  const pages = {
    1: ['🎬', 'Lesson Video', 'Watch the lesson video'],
    2: ['🔺', 'Dog Shapes', 'Identify the dog and count the shapes'],
    3: ['🧩', 'Match Dog Actions', 'Match each dog with the correct action'],
    4: ['🎨', 'Count the Colors', 'Count the different colored dogs'],
    5: ['😴', 'Count Sleeping Dogs', 'Count how many dogs are sleeping'],
    6: ['⭕', 'Dog Park Rules', 'Choose O or X for each dog park rule'],
    7: ['💡', 'At the Dog Park', 'Practice should and should not']
  };

  const weekOneActivityImages = {
    2: ['../assets/images/week-1/literacy/page-02-dog-shapes.png', 'Dog shapes activity sheet'],
    3: ['../assets/images/week-1/literacy/page-03-match-actions.png', 'Match the dog actions activity sheet'],
    4: ['../assets/images/week-1/literacy/page-04-count-colors.png', 'Count different colored dogs activity sheet'],
    5: ['../assets/images/week-1/literacy/page-05-count-sleeping.png', 'Count sleeping dogs activity sheet'],
    6: ['../assets/images/week-1/literacy/page-06-dog-park-rules-clean.png', 'Dog park rules activity sheet'],
    7: ['../assets/images/week-1/literacy/page-07-dog-park-grammar.png', 'At the dog park grammar activity sheet']
  };

  const weekTwoActivityImages = {
    2: ['../assets/images/week-2/literacy/page-02-duck-shapes.png', 'Duck shapes activity sheet'],
    3: ['../assets/images/week-2/literacy/page-03-compare-sizes.png', 'Compare sizes and match the sentence parts activity sheet'],
    4: ['../assets/images/week-2/literacy/page-04-count-yellow-ducks.png', 'Count the ducks with yellow bodies activity sheet'],
    5: ['../assets/images/week-2/literacy/page-05-animals-that-swim.png', 'Identify and count the animals that swim activity sheet'],
    6: ['../assets/images/week-2/literacy/page-06-garden-rules.png', 'Garden rules activity sheet'],
    7: ['../assets/images/week-2/literacy/page-07-in-the-garden-grammar.png', 'In the garden find and found grammar activity sheet']
  };

  const weekThreeActivityImages = {
    2: ['../assets/images/week-3/literacy/page-02-snake-shapes.png', 'Snake shapes activity sheet'],
    3: ['../assets/images/week-3/literacy/page-03-snake-locations.png', 'Count snake locations activity sheet'],
    4: ['../assets/images/week-3/literacy/page-04-snake-lengths.png', 'Add the total snake lengths activity sheet'],
    5: ['../assets/images/week-3/literacy/page-05-snake-times.png', 'Count the total time activity sheet'],
    6: ['../assets/images/week-3/literacy/page-06-jungle-rules.png', 'Jungle rules activity sheet'],
    7: ['../assets/images/week-3/literacy/page-07-jungle-grammar.png', 'In the jungle on and behind grammar activity sheet']
  };

  const weekFourActivityImages = {
    2: ['../assets/images/week-4/literacy/page-02-bird-shapes.png', 'Bird shapes and tracing activity sheet'],
    3: ['../assets/images/week-4/literacy/page-03-match-sentences.png', 'Match the bird sentence parts activity sheet'],
    4: ['../assets/images/week-4/literacy/page-04-daytime-birds.png', 'Choose the birds awake in the daytime activity sheet'],
    5: ['../assets/images/week-4/literacy/page-05-nighttime-birds.png', 'Choose the birds awake in the nighttime activity sheet'],
    6: ['../assets/images/week-4/literacy/page-06-park-rules.png', 'Bird park rules activity sheet'],
    7: ['../assets/images/week-4/literacy/page-07-park-grammar.png', 'Scary and scared grammar activity sheet']
  };

  const activityImages = {
    1: weekOneActivityImages,
    2: weekTwoActivityImages,
    3: weekThreeActivityImages,
    4: weekFourActivityImages
  };

  const [icon] = pages[page];
  const padded = value => String(value).padStart(2, '0');
  const weekHome = `../week-${weekNumber}.html#card-literacy`;
  const previous = page === 1
    ? weekHome
    : `week-${weekNumber}-page-${padded(page - 1)}.html#lesson-focus`;
  const next = page === pageCount
    ? weekHome
    : `week-${weekNumber}-page-${padded(page + 1)}.html#lesson-focus`;
  const talkSongReturn = `week-${weekNumber}-page-${padded(page)}.html#lesson-focus`;
  const talkSongHref = `tpr.html?week=${weekNumber}&from=${page}&return=${encodeURIComponent(talkSongReturn)}`;
  const activityImage = activityImages[weekNumber] && activityImages[weekNumber][page];
  const hasWeekOneLessonVideo = weekNumber === 1 && page === 1;

  document.title = `Literacy Week ${weekNumber} — Page ${page} — Animals`;
  app.className = 'page literacy-activity-page level-c-literacy-page';
  app.innerHTML = `
    <nav class="top-page-nav" aria-label="Literacy page navigation">
      <a class="back-link" href="${previous}">⬅️ ${page === 1 ? 'Week Home' : 'Previous Page'}</a>
      <span class="page-indicator" aria-current="page">📖 Page ${page} of ${pageCount}</span>
      <a class="back-link next-page-link" href="${next}">${page === pageCount ? 'Finish' : 'Next Page'} ➡️</a>
    </nav>

    <a class="literacy-list-link" href="${weekHome}">🏠 Week ${weekNumber} Home</a>

    <header class="center level-c-literacy-header">
      <h1 class="big-title">Week ${weekNumber} — ${week.title}</h1>
      <nav class="week-tools" aria-label="Week tools">
        <a class="pill-btn orange" href="${talkSongHref}">🎵 Week Song</a>
        <span class="pill-btn blue is-disabled" aria-disabled="true">🃏 Flashcards</span>
      </nav>
    </header>

    <section id="lesson-focus" class="card level-c-literacy-card${activityImage ? ' activity-sheet-card' : ''}">
      ${hasWeekOneLessonVideo ? `
        <div class="literacy-video-carousel" data-active-part="1">
          <button class="literacy-video-arrow literacy-video-arrow--previous" type="button" aria-label="Show previous video part" disabled>‹</button>
          <div class="literacy-video-carousel__main">
            <div class="literacy-video-part-heading" aria-live="polite">
              <strong class="literacy-video-part-title">Part 1</strong>
              <span class="literacy-video-part-count">Video 1 of 2</span>
            </div>
            <div class="video-play-shell literacy-video-shell">
              <video class="literacy-lesson-video" controls playsinline preload="metadata" aria-label="Week 1 reading video, Part 1">
                <source src="../assets/video/reading/week-1.mp4" type="video/mp4">
                Your browser does not support this video.
              </video>
              <button class="center-video-play literacy-video-play" type="button" aria-label="Play Week 1 reading video, Part 1">▶</button>
            </div>
            <div class="literacy-video-part-dots" role="tablist" aria-label="Choose a video part">
              <button class="literacy-video-part-dot is-active" type="button" role="tab" aria-selected="true" aria-label="Show Part 1" data-video-part="1"></button>
              <button class="literacy-video-part-dot" type="button" role="tab" aria-selected="false" aria-label="Show Part 2" data-video-part="2"></button>
            </div>
            <div class="literacy-activity-launch">
              <a class="pill-btn green literacy-activity-link" href="week-1-page-01-activity.html">
                <span aria-hidden="true">⭐</span>
                <span class="literacy-activity-link-label">Start Part 1 Activity</span>
              </a>
            </div>
          </div>
          <button class="literacy-video-arrow literacy-video-arrow--next" type="button" aria-label="Show next video part">›</button>
        </div>
      ` : activityImage ? `
        <div class="activity-sheet-wrap">
          <img class="activity-sheet-image" src="${activityImage[0]}" alt="${activityImage[1]}" loading="eager" decoding="async">
        </div>
        <p class="activity-build-note">${weekNumber === 2 && page === 7
          ? 'Page 7 will become interactive when its introductory clip is supplied.'
          : 'Activity interactions will be added when the instructions are supplied.'}</p>
      ` : `
        <div class="level-c-video-placeholder" role="img" aria-label="Lesson video placeholder">
          <div class="placeholder-stage__inner">
            <span class="placeholder-stage__icon" aria-hidden="true">${icon}</span>
            <strong>${page === 1 ? 'Lesson video goes here' : 'Activity page goes here'}</strong>
            <span>Media and interactions can be added when supplied.</span>
          </div>
        </div>
      `}
    </section>`;

  const video = app.querySelector('.literacy-lesson-video');
  const playButton = app.querySelector('.literacy-video-play');
  if (video && playButton) {
    const carousel = app.querySelector('.literacy-video-carousel');
    const source = video.querySelector('source');
    const previousPartButton = app.querySelector('.literacy-video-arrow--previous');
    const nextPartButton = app.querySelector('.literacy-video-arrow--next');
    const partTitle = app.querySelector('.literacy-video-part-title');
    const partCount = app.querySelector('.literacy-video-part-count');
    const activityLink = app.querySelector('.literacy-activity-link');
    const activityLinkLabel = app.querySelector('.literacy-activity-link-label');
    const partDots = [...app.querySelectorAll('.literacy-video-part-dot')];
    const videoParts = [
      {
        number: 1,
        src: '../assets/video/reading/week-1.mp4',
        activityHref: 'week-1-page-01-activity.html',
        activityLabel: 'Start Part 1 Activity'
      },
      {
        number: 2,
        src: '../assets/video/reading/week-1-part-2.mp4',
        activityHref: 'week-1-page-01-activity-part-2.html',
        activityLabel: 'Start Part 2 Activity'
      }
    ];
    const requestedPart = Number(new URLSearchParams(window.location.search).get('part'));
    let activePartIndex = requestedPart === 2 ? 1 : 0;
    const showPlayButton = () => { playButton.hidden = false; };
    const hidePlayButton = () => { playButton.hidden = true; };

    const renderVideoPart = () => {
      const part = videoParts[activePartIndex];
      video.pause();
      source.src = part.src;
      video.load();
      video.setAttribute('aria-label', `Week 1 reading video, Part ${part.number}`);
      playButton.setAttribute('aria-label', `Play Week 1 reading video, Part ${part.number}`);
      partTitle.textContent = `Part ${part.number}`;
      partCount.textContent = `Video ${part.number} of ${videoParts.length}`;
      activityLink.href = part.activityHref;
      activityLinkLabel.textContent = part.activityLabel;
      carousel.dataset.activePart = String(part.number);
      previousPartButton.disabled = activePartIndex === 0;
      nextPartButton.disabled = activePartIndex === videoParts.length - 1;
      partDots.forEach((dot, index) => {
        const active = index === activePartIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });
      showPlayButton();
    };

    const showPart = partIndex => {
      if (partIndex < 0 || partIndex >= videoParts.length || partIndex === activePartIndex) return;
      activePartIndex = partIndex;
      renderVideoPart();
    };

    playButton.addEventListener('click', async () => {
      hidePlayButton();
      try {
        await video.play();
      } catch (error) {
        showPlayButton();
      }
    });

    video.addEventListener('play', hidePlayButton);
    video.addEventListener('playing', hidePlayButton);
    video.addEventListener('pause', showPlayButton);
    video.addEventListener('ended', showPlayButton);
    video.addEventListener('error', showPlayButton);
    video.addEventListener('abort', showPlayButton);
    previousPartButton.addEventListener('click', () => showPart(activePartIndex - 1));
    nextPartButton.addEventListener('click', () => showPart(activePartIndex + 1));
    partDots.forEach((dot, index) => dot.addEventListener('click', () => showPart(index)));
    renderVideoPart();
  }
})();
