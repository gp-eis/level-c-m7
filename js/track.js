(() => {
  const config = window.LEVEL_C_M7;
  const app = document.querySelector('#track-app');
  const weekNumber = Number(document.body.dataset.week);
  const trackKey = document.body.dataset.track;
  const week = config && config.weeks[weekNumber];
  const track = config && config.tracks.find(item => item.key === trackKey);
  if (!app || !week || !track) return;

  document.title = `${track.label} Week ${weekNumber} — Animals`;
  const isReading = trackKey === 'reading';
  const readingVideoTemporarilyDisabled = isReading && weekNumber === 3;
  const readingThumbnails = {
    1: '../assets/images/reading/why-why-is-that-thumbnail.webp',
    2: '../assets/images/reading/week-2-do-you-know-who-i-am-thumbnail.webp?v=20260901-philosophy',
    3: '../assets/images/reading/week-3-video-thumbnail.png',
    4: '../assets/images/reading/week-4-video-thumbnail.png'
  };
  const readingThumbnail = isReading ? readingThumbnails[weekNumber] : null;
  const readingVideos = {
    1: '../assets/video/reading/week-1-reading-section.mp4',
    2: '../assets/video/reading/week-2-reading-section.mp4?v=20260903-updated',
    3: '../assets/video/reading/week-3-reading-section.mp4?v=20260905-updated',
    4: '../assets/video/reading/week-4-reading-section.mp4?v=20260903-updated'
  };
  const readingVideo = isReading && !readingVideoTemporarilyDisabled ? readingVideos[weekNumber] : null;
  const readingActivityPages = {
    1: 'week-1-activity.html',
    2: 'week-2-activity.html',
    3: 'week-3-activity.html',
    4: 'week-4-activity.html'
  };
  const readingActivityPage = isReading ? readingActivityPages[weekNumber] : null;
  const phonicsVideos = {
    1: '../assets/video/phonics/week-1-week-2.mp4',
    2: '../assets/video/phonics/week-1-week-2.mp4',
    3: '../assets/video/phonics/week-3-week-4.mp4',
    4: '../assets/video/phonics/week-3-week-4.mp4'
  };
  const phonicsVideo = trackKey === 'phonics' ? phonicsVideos[weekNumber] : null;
  const phonicsGamesPage = trackKey === 'phonics'
    ? `../games/phonics.html?week=${weekNumber}&from=phonics`
    : null;
  const trackVideo = phonicsVideo || readingVideo;
  const hasTrackVideo = Boolean(trackVideo);
  app.className = `page track-shell-page ${trackKey}-page`;
  app.innerHTML = `
    <a class="back-link" href="../week-${weekNumber}.html#card-${trackKey}">⬅️ Week ${weekNumber} Home</a>
    <header class="track-header">
      <div class="track-title-row"><span class="track-title-icon" aria-hidden="true">${track.icon}</span><h1 class="big-title">${track.label} — Week ${weekNumber}</h1></div>
      <p class="subtitle">${week.title}</p>
      ${trackKey === 'phonics' ? `
        <nav class="week-tools track-tools" aria-label="Phonics tools">
          <a class="pill-btn magic-e-btn" href="magic-e.html?week=${weekNumber}">✨ Magic e</a>
        </nav>
      ` : ''}
    </header>
    <section class="track-card" id="lesson-focus">
      <h2 class="section-title">🎬 ${track.label} Video</h2>
      ${hasTrackVideo ? `
        <div class="video-play-shell track-video-shell">
          <video class="track-video" controls playsinline preload="metadata" ${readingThumbnail ? `poster="${readingThumbnail}"` : ''} aria-label="Week ${weekNumber} ${track.label.toLowerCase()} video">
            <source src="${trackVideo}" type="video/mp4">
            Your browser does not support this video.
          </video>
          <button class="center-video-play" type="button" aria-label="Play the Week ${weekNumber} ${track.label.toLowerCase()} video">▶</button>
        </div>
      ` : readingThumbnail ? `
        <div class="track-video-placeholder track-video-thumbnail">
          <img class="track-video-thumbnail__image" src="${readingThumbnail}" alt="Week ${weekNumber} reading video thumbnail">
          <button class="center-video-play-placeholder" type="button" aria-label="Reading video coming soon" disabled>▶</button>
        </div>
      ` : `
        <div class="track-video-placeholder"><div class="track-video-placeholder__copy"><span aria-hidden="true">${week.icon}</span><strong>Week ${weekNumber} ${track.label} video placeholder</strong><small>The ${week.animal} lesson video will be added here.</small></div><button class="center-video-play-placeholder" type="button" aria-label="Video placeholder" disabled>▶</button></div>
      `}
      ${isReading
        ? `<p class="track-note">${readingVideoTemporarilyDisabled
          ? 'This reading video is being updated. Please check back soon!'
          : 'Watch the story, then try the reading activity!'}</p>`
        : ''}
    </section>
    <section class="track-card track-activity-card">
      <h2 class="section-title">⭐ ${isReading ? 'Watch and Play!' : 'Check What You Learned'}</h2>
      ${phonicsGamesPage ? `
        <p>After watching the lesson, try a short phonics activity.</p>
        <a class="track-activity-btn" href="${phonicsGamesPage}"><span aria-hidden="true">${track.icon}</span><span>Start Activity</span></a>
      ` : readingActivityPage ? `
        <p>Answer four picture questions about the story.</p>
        <button class="track-activity-btn" type="button" disabled><span aria-hidden="true">${track.icon}</span><span>Loading Activity</span></button>
      ` : `
        <p>The follow-up ${track.label.toLowerCase()} activity will be added here.</p>
        <button class="track-activity-btn" type="button" disabled><span aria-hidden="true">${track.icon}</span><span>Activity Placeholder</span></button>
      `}
    </section>`;

  const video = app.querySelector('.track-video');
  const playButton = app.querySelector('.center-video-play');
  if (video && playButton) {
    const showPlayButton = () => { playButton.hidden = false; };
    const hidePlayButton = () => { playButton.hidden = true; };
    const syncPlayButton = () => {
      playButton.hidden = !(video.paused || video.ended);
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
    syncPlayButton();
  }
})();
