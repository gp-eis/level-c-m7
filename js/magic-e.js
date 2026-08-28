(() => {
  const params = new URLSearchParams(window.location.search);
  const requestedWeek = Number(params.get('week'));
  const weekNumber = requestedWeek >= 1 && requestedWeek <= 4 ? requestedWeek : 1;
  const config = window.LEVEL_C_M7;
  const week = config && config.weeks[weekNumber];
  const back = document.querySelector('#magic-e-back');
  const label = document.querySelector('#magic-e-week');
  const video = document.querySelector('#magic-e-video');
  const play = document.querySelector('#magic-e-play');

  back.href = `week-${weekNumber}.html#lesson-focus`;
  back.textContent = `⬅️ Back to Week ${weekNumber} Phonics`;
  label.textContent = week ? `Week ${weekNumber} — ${week.title}` : `Week ${weekNumber}`;
  document.title = `Magic e — Week ${weekNumber} — Level C Month 7`;

  video.setAttribute('aria-label', `Level C Month 7 Week ${weekNumber} Magic e video`);
  play.setAttribute('aria-label', `Play the Week ${weekNumber} Magic e video`);

  const showPlayButton = () => { play.hidden = false; };
  const hidePlayButton = () => { play.hidden = true; };
  const syncPlayButton = () => {
    play.hidden = !(video.paused || video.ended);
  };

  play.addEventListener('click', async () => {
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
})();
