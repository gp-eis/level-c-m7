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
  const phonicsVideos = {
    1: '../assets/video/phonics/week-1-week-2.mp4',
    2: '../assets/video/phonics/week-1-week-2.mp4',
    3: '../assets/video/phonics/week-3-week-4.mp4',
    4: '../assets/video/phonics/week-3-week-4.mp4'
  };
  const phonicsVideo = trackKey === 'phonics' ? phonicsVideos[weekNumber] : null;
  const hasPhonicsVideo = Boolean(phonicsVideo);
  app.className = `page track-shell-page ${trackKey}-page`;
  app.innerHTML = `
    <a class="back-link" href="../week-${weekNumber}.html#card-${trackKey}">⬅️ Week ${weekNumber} Home</a>
    <header class="track-header">
      <div class="track-title-row"><span class="track-title-icon" aria-hidden="true">${track.icon}</span><h1 class="big-title">${track.label} — Week ${weekNumber}</h1></div>
      <p class="subtitle">${week.title}</p>
    </header>
    <section class="track-card" id="lesson-focus">
      <h2 class="section-title">🎬 ${track.label} Video</h2>
      ${hasPhonicsVideo ? `
        <div class="video-play-shell track-video-shell">
          <video class="track-video" controls playsinline preload="metadata" aria-label="Week ${weekNumber} phonics lesson video">
            <source src="${phonicsVideo}" type="video/mp4">
            Your browser does not support this video.
          </video>
          <button class="center-video-play" type="button" aria-label="Play the Week ${weekNumber} phonics video">▶</button>
        </div>
      ` : `
        <div class="track-video-placeholder"><div class="track-video-placeholder__copy"><span aria-hidden="true">${week.icon}</span><strong>Week ${weekNumber} ${track.label} video placeholder</strong><small>The ${week.animal} lesson video will be added here.</small></div><button class="center-video-play-placeholder" type="button" aria-label="Video placeholder" disabled>▶</button></div>
      `}
      ${isReading ? '<p class="track-note">Watch the story, then try the reading activity!</p>' : ''}
    </section>
    <section class="track-card track-activity-card"><h2 class="section-title">⭐ ${isReading ? 'Watch and Play!' : 'Check What You Learned'}</h2><p>The follow-up ${track.label.toLowerCase()} activity will be added here.</p><button class="track-activity-btn" type="button" disabled><span aria-hidden="true">${track.icon}</span><span>Activity Placeholder</span></button></section>`;

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
