(() => {
  const config = window.LEVEL_C_M7;
  const hub = document.querySelector('#games-app');
  const placeholder = document.querySelector('#game-app');
  if (!config || (!hub && !placeholder)) return;

  const gameCards = [
    {
      key: 'memory',
      label: 'Memory Game',
      hint: 'Find the matching pictures!',
      image: '../assets/images/ui/game-memory.webp'
    },
    {
      key: 'spin-the-wheel',
      label: 'Spin the Wheel',
      hint: 'Spin, stop, and flip a card!',
      image: '../assets/images/ui/game-wheel.webp'
    },
    {
      key: 'matching',
      label: 'Picture Match',
      hint: 'Pick the picture for the sentence!',
      image: '../assets/images/ui/game-matching.webp'
    },
    {
      key: 'pick-the-right-one',
      label: 'Pick the Right One',
      hint: 'Listen and choose the answer!',
      image: '../assets/images/ui/game-pick.webp'
    },
    {
      key: 'phonics',
      label: 'Phonics',
      hint: 'Letter games for this week!',
      image: '../assets/images/ui/phonics-games/vowel-team-train.png'
    }
  ];

  const clampWeek = (value) => Math.max(1, Math.min(4, Number(value) || 1));
  const isWeekOpen = (weekNumber) => (window.LEVEL_C_OPEN_WEEKS || [1]).includes(Number(weekNumber));
  const params = new URLSearchParams(location.search);
  const requestedWeek = params.has('week') ? clampWeek(params.get('week')) : null;

  const gameIcon = (game) => game.image
    ? `<img class="icon-img" src="${game.image}" alt="">`
    : `<span class="emoji" aria-hidden="true">${game.emoji}</span>`;

  const gameHref = (weekNumber, game) => {
    if (game.key === 'phonics') return `phonics.html?week=${weekNumber}&from=games`;
    const completedPages = {
      1: {
        memory: 'memory.html',
        'spin-the-wheel': 'spin-the-wheel.html',
        matching: 'matching.html',
        'pick-the-right-one': 'pick-the-right-one.html'
      },
      2: {
        memory: 'week-2-memory.html',
        'spin-the-wheel': 'week-2-spin-the-wheel.html',
        matching: 'week-2-matching.html',
        'pick-the-right-one': 'week-2-pick-the-right-one.html'
      },
      3: {
        memory: 'week-3-memory.html',
        'spin-the-wheel': 'week-3-spin-the-wheel.html',
        matching: 'week-3-matching.html',
        'pick-the-right-one': 'week-3-pick-the-right-one.html'
      },
      4: {
        memory: 'week-4-memory.html',
        'spin-the-wheel': 'week-4-spin-the-wheel.html',
        matching: 'week-4-matching.html',
        'pick-the-right-one': 'week-4-pick-the-right-one.html'
      }
    };
    const weekPages = completedPages[Number(weekNumber)];
    if (weekPages?.[game.key]) return weekPages[game.key];
    return `placeholder.html?week=${weekNumber}&game=${game.key}`;
  };

  const gameGrid = (weekNumber) => `
    <div class="card-grid">
      ${gameCards.map((game) => `
        <a class="nav-card" href="${gameHref(weekNumber, game)}">
          ${gameIcon(game)}
          <span class="label">${game.label}</span>
          <span class="hint">${game.hint}</span>
        </a>`).join('')}
    </div>`;

  if (hub) {
    document.title = 'Games — Animals';
    hub.className = 'page games-hub';
    hub.innerHTML = `
      <a class="back-link" id="games-week-home" href="../week-1.html#card-games">⬅️ Week 1 Home</a>

      <header class="games-hub__header">
        <h1 class="big-title hub-title-with-icon">
          <img class="hub-title-icon" src="../assets/images/ui/games-3d.webp" alt="">
          Games
        </h1>
        <p class="subtitle" id="hub-subtitle">Pick a week, then choose a game!</p>
      </header>

      <section id="week-picker" aria-label="Choose a week">
        <div class="week-picker">
          ${Object.entries(config.weeks).map(([number, week], index) => {
            const color = ['pink', 'blue', 'green', 'orange'][index];
            const isOpen = isWeekOpen(number);
            return `
              <button class="week-pick-btn ${color}${isOpen ? '' : ' is-locked'}" type="button" data-week="${number}" aria-label="Week ${number} — ${week.title}${isOpen ? '' : ', coming soon'}"${isOpen ? '' : ' aria-disabled="true"'}>
                <span class="week-pick-btn__inner">
                  <span class="week-pick-btn__icon" aria-hidden="true">
                    <img class="week-pick-btn__icon-img" src="../${week.image}" alt="">
                  </span>
                  <span class="week-pick-btn__label">Week ${number}</span>
                  <span class="week-pick-btn__hint">${isOpen ? week.title : '🔒 Coming soon'}</span>
                </span>
              </button>`;
          }).join('')}
        </div>
      </section>

      ${Object.entries(config.weeks).map(([number, week]) => `
        <section class="week-games-panel" id="week-${number}-games" data-week="${number}" hidden aria-label="Week ${number} games">
          <div class="week-games-header">
            <h2 class="week-games-heading"><span class="week-number">${number}</span>${week.title}</h2>
            <button class="pill-btn orange back-weeks" type="button">⬅️ All Weeks</button>
          </div>
          ${gameGrid(number)}
        </section>`).join('')}`;

    const weekPicker = hub.querySelector('#week-picker');
    const hubSubtitle = hub.querySelector('#hub-subtitle');
    const weekHomeLink = hub.querySelector('#games-week-home');
    const weekPanels = [...hub.querySelectorAll('.week-games-panel')];

    const updateWeekHomeLink = (weekNumber) => {
      weekHomeLink.href = `../week-${weekNumber}.html#card-games`;
      weekHomeLink.textContent = `⬅️ Week ${weekNumber} Home`;
    };

    const updateUrl = (weekNumber) => {
      const url = new URL(location.href);
      if (weekNumber) url.searchParams.set('week', weekNumber);
      else url.searchParams.delete('week');
      history.replaceState({ week: weekNumber || null }, '', url);
    };

    const showWeek = (weekNumber, shouldUpdateUrl = true) => {
      const week = config.weeks[weekNumber];
      if (!week || !isWeekOpen(weekNumber)) return;
      weekPicker.hidden = true;
      weekPanels.forEach((panel) => {
        panel.hidden = panel.dataset.week !== String(weekNumber);
      });
      hubSubtitle.textContent = `Week ${weekNumber} — ${week.title}`;
      updateWeekHomeLink(weekNumber);
      if (shouldUpdateUrl) updateUrl(weekNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const showWeekPicker = (shouldUpdateUrl = true) => {
      weekPicker.hidden = false;
      weekPanels.forEach((panel) => { panel.hidden = true; });
      hubSubtitle.textContent = 'Pick a week, then choose a game!';
      if (shouldUpdateUrl) updateUrl(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    hub.querySelectorAll('.week-pick-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const weekNumber = clampWeek(button.dataset.week);
        if (!isWeekOpen(weekNumber)) {
          showToast(`🔒 Week ${weekNumber} is coming soon!`);
          return;
        }
        showWeek(weekNumber);
      });
    });
    hub.querySelectorAll('.back-weeks').forEach((button) => {
      button.addEventListener('click', () => showWeekPicker());
    });
    window.addEventListener('popstate', () => {
      const weekNumber = new URLSearchParams(location.search).get('week');
      if (weekNumber) showWeek(clampWeek(weekNumber), false);
      else showWeekPicker(false);
    });

    if (requestedWeek && isWeekOpen(requestedWeek)) showWeek(requestedWeek, false);
    else showWeekPicker(false);
  }

  if (placeholder) {
    const weekNumber = clampWeek(params.get('week'));
    const week = config.weeks[weekNumber];
    const selected = gameCards.find((game) => game.key === params.get('game')) || gameCards[0];
    document.title = `${selected.label} — Week ${weekNumber} — Animals`;
    placeholder.className = 'lesson-shell';
    placeholder.innerHTML = `
      <a class="back-link" href="index.html?week=${weekNumber}">⬅️ Games</a>
      <header class="lesson-heading">
        <span class="lesson-heading__game-icon" aria-hidden="true">${gameIcon(selected)}</span>
        <h1>${selected.label}</h1>
        <p>Week ${weekNumber} — ${week.title}</p>
      </header>
      <section class="lesson-card">
        <h2>Game Placeholder</h2>
        <p>This page is ready for a Week ${weekNumber} ${week.animal}-themed game.</p>
        <div class="placeholder-stage">
          <div class="placeholder-stage__inner">
            <span class="placeholder-stage__icon" aria-hidden="true">${week.icon}</span>
            <strong>Game content goes here</strong>
            <span>Artwork, audio, questions, animation, and scoring can be added later.</span>
          </div>
        </div>
      </section>`;
  }
})();
