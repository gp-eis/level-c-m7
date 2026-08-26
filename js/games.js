(() => {
  const config = window.LEVEL_C_M7;
  const params = new URLSearchParams(location.search);
  const weekNumber = Math.max(1, Math.min(4, Number(params.get('week')) || 1));
  const week = config.weeks[weekNumber];
  const games = [
    ['memory', 'Memory', '🧠'],
    ['spin-the-wheel', 'Spin the Wheel', '🎡'],
    ['matching', 'Matching', '🧩'],
    ['pick-the-right-one', 'Pick the Right One', '☝️'],
    ['phonics', 'Phonics Games', '🔤']
  ];
  const hub = document.querySelector('#games-app');
  const placeholder = document.querySelector('#game-app');

  if (hub) {
    document.title = `Games Week ${weekNumber} — Animals`;
    hub.className = 'page games-hub';
    hub.innerHTML = `
      <a class="back-link" href="../week-${weekNumber}.html#card-games">⬅️ Week ${weekNumber} Home</a>
      <header class="games-heading"><span class="games-heading__icon" aria-hidden="true">${week.icon}</span><h1 class="big-title">Games</h1><p>Week ${weekNumber} — ${week.title}</p></header>
      <nav class="game-grid" aria-label="Week ${weekNumber} games">
        ${games.map(([key, label, icon]) => `<a class="nav-card" href="placeholder.html?week=${weekNumber}&game=${key}"><span class="nav-card__icon" aria-hidden="true">${icon}</span><strong>${label}</strong><span>Coming soon</span></a>`).join('')}
      </nav>`;
  }

  if (placeholder) {
    const selected = games.find(([key]) => key === params.get('game')) || games[0];
    document.title = `${selected[1]} — Week ${weekNumber} — Animals`;
    placeholder.className = 'lesson-shell';
    placeholder.innerHTML = `
      <a class="back-link" href="index.html?week=${weekNumber}">⬅️ Games</a>
      <header class="lesson-heading"><span class="lesson-heading__icon" aria-hidden="true">${selected[2]}</span><h1>${selected[1]}</h1><p>Week ${weekNumber} — ${week.title}</p></header>
      <section class="lesson-card"><h2>Game Placeholder</h2><p>This page is ready for a Week ${weekNumber} ${week.animal}-themed game.</p><div class="placeholder-stage"><div class="placeholder-stage__inner"><span class="placeholder-stage__icon" aria-hidden="true">${week.icon}</span><strong>Game content goes here</strong><span>Artwork, audio, questions, animation, and scoring can be added later.</span></div></div></section>`;
  }
})();
