(() => {
  const config = window.LEVEL_C_M7;
  const app = document.querySelector('#week-app');
  const weekNumber = Number(document.body.dataset.week);
  const week = config && config.weeks[weekNumber];
  if (!app || !week) return;

  document.title = `Week ${weekNumber} — ${week.title} — Animals`;
  app.className = 'week-home-shell';
  app.innerHTML = `
    <header class="week-heading">
      <span class="week-heading__bee" aria-hidden="true">${week.icon}</span>
      <h1>Week ${weekNumber} — Animals!</h1>
      <p>${week.title}</p>
    </header>
    <div class="carousel-wrap" id="lesson-focus">
      <button class="carousel-arrow prev" type="button" aria-label="Previous choice">‹</button>
      <nav class="learning-carousel" aria-label="Week ${weekNumber} learning areas">
      ${config.tracks.map((track, index) => {
        const href = track.key === 'literacy'
          ? `lessons/week-${weekNumber}-page-01.html`
          : track.key === 'games'
            ? `games/index.html?week=${weekNumber}`
            : `${track.key}/week-${weekNumber}.html`;
        return `<a class="learning-card ${track.key}${index === 0 ? ' is-active' : ''}" id="card-${track.key}" href="${href}" data-card="${index}">
          <h2>${track.label}</h2>
          <img class="learning-card__art" src="${track.image}" width="1024" height="1536" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" alt="${track.alt}">
        </a>`;
      }).join('')}
      </nav>
      <button class="carousel-arrow next" type="button" aria-label="Next choice">›</button>
    </div>
    <div class="carousel-dots" aria-label="Carousel position">
      ${config.tracks.map((track, index) => `<button class="carousel-dot${index === 0 ? ' is-active' : ''}" type="button" data-card="${index}" aria-label="Show ${track.label}"></button>`).join('')}
    </div>
    <a class="all-weeks-btn" href="index.html"><span aria-hidden="true">←</span> All Weeks</a>`;

  const carousel = app.querySelector('.learning-carousel');
  const cards = [...app.querySelectorAll('.learning-card')];
  const dots = [...app.querySelectorAll('.carousel-dot')];
  const hashCards = { '#card-literacy': 0, '#card-reading': 1, '#card-phonics': 2, '#card-games': 3 };
  let active = Math.min(hashCards[location.hash] ?? 0, cards.length - 1);

  const update = () => {
    cards.forEach((card, index) => card.classList.toggle('is-active', index === active));
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
  };
  const show = index => {
    active = Math.max(0, Math.min(cards.length - 1, index));
    update();
    cards[active].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  };
  app.querySelector('.carousel-arrow.prev').addEventListener('click', () => show(active - 1));
  app.querySelector('.carousel-arrow.next').addEventListener('click', () => show(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  let scrollTimer;
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const middle = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      active = cards.reduce((best, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - middle);
        return distance < best.distance ? { index, distance } : best;
      }, { index: active, distance: Infinity }).index;
      update();
    }, 90);
  }, { passive: true });
  addEventListener('load', () => show(active), { once: true });
})();
