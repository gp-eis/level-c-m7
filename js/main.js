/* ---------- Shared button sounds (generated with Web Audio) ---------- */

let audioContext;
let soundEnabled = true;
let cachedAmericanEnglishVoice = null;

function findAmericanEnglishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const americanVoices = voices.filter((voice) => String(voice.lang).toLowerCase().replace('_', '-') === 'en-us');
  if (!americanVoices.length) return null;

  const preferredNames = [
    /google us english/i,
    /microsoft (aria|jenny|guy|zira|david)/i,
    /samantha|alex/i,
    /american/i,
    /english.*united states/i
  ];
  return preferredNames
    .map((pattern) => americanVoices.find((voice) => pattern.test(voice.name)))
    .find(Boolean) || americanVoices[0];
}

function getAmericanEnglishVoice() {
  if (cachedAmericanEnglishVoice) return Promise.resolve(cachedAmericanEnglishVoice);
  const immediateVoice = findAmericanEnglishVoice();
  if (immediateVoice) {
    cachedAmericanEnglishVoice = immediateVoice;
    return Promise.resolve(immediateVoice);
  }

  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      cachedAmericanEnglishVoice = findAmericanEnglishVoice();
      resolve(cachedAmericanEnglishVoice);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 1200);
  });
}

async function speakAmericanEnglish(text, options = {}) {
  if (!soundEnabled || !text || !('speechSynthesis' in window)) return;
  const voice = await getAmericanEnglishVoice();
  // Never fall back to the device's default voice: on non-English devices that
  // can produce a Korean-accented English reading. Recorded lesson audio remains
  // the primary source, and speech is used only when an en-US voice is present.
  if (!voice) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = 'en-US';
  utterance.rate = options.rate || .82;
  utterance.pitch = options.pitch || 1.05;
  return new Promise((resolve) => {
    utterance.addEventListener('end', resolve, { once: true });
    utterance.addEventListener('error', resolve, { once: true });
    window.speechSynthesis.speak(utterance);
  });
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration, volume, type = 'sine', delay = 0) {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

function playClickSound() {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state !== 'running') {
    context.resume().then(playClickSound).catch(() => {});
    return;
  }

  const start = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(1.05, start);
  masterGain.connect(context.destination);

  const pop = context.createOscillator();
  const popGain = context.createGain();
  pop.type = 'sine';
  pop.frequency.setValueAtTime(260, start);
  pop.frequency.exponentialRampToValueAtTime(680, start + 0.065);
  pop.frequency.exponentialRampToValueAtTime(520, start + 0.105);
  popGain.gain.setValueAtTime(0.0001, start);
  popGain.gain.exponentialRampToValueAtTime(0.22, start + 0.008);
  popGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  pop.connect(popGain);
  popGain.connect(masterGain);
  pop.start(start);
  pop.stop(start + 0.13);

  [
    { frequency: 820, delay: 0.018, volume: 0.09 },
    { frequency: 1120, delay: 0.052, volume: 0.075 },
    { frequency: 1480, delay: 0.086, volume: 0.055 }
  ].forEach(({ frequency, delay, volume }) => {
    const note = context.createOscillator();
    const noteGain = context.createGain();
    const noteStart = start + delay;
    note.type = 'triangle';
    note.frequency.setValueAtTime(frequency, noteStart);
    note.frequency.exponentialRampToValueAtTime(frequency * 1.06, noteStart + 0.05);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.068);
    note.connect(noteGain);
    noteGain.connect(masterGain);
    note.start(noteStart);
    note.stop(noteStart + 0.075);
  });
}

function setupSiteSounds() {
  const findControl = (target) => target instanceof Element
    ? target.closest('button, a, [role="button"]')
    : null;

  document.addEventListener('pointerdown', (event) => {
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);
}

(() => {
  document.documentElement.classList.add('js-ready');
  setupSiteSounds();

  const script = document.querySelector('script[src*="main.js"]');
  const assetsBase = script
    ? script.getAttribute('src').replace(/js\/main\.js(?:\?.*)?$/, 'assets/')
    : 'assets/';

  if (!document.querySelector('.site-logo-bar')) {
    const bar = document.createElement('div');
    bar.className = 'site-logo-bar';

    const logo = document.createElement('img');
    logo.src = `${assetsBase}images/ui/giiip-eis-logo.webp`;
    logo.alt = 'GIIIP EIS logo';
    logo.width = 118;
    logo.height = 118;
    logo.decoding = 'async';

    bar.appendChild(logo);
    document.body.prepend(bar);
    document.body.classList.add('has-site-logo');
  }
})();

/* ---------- Level C Month 7 week availability ---------- */

window.LEVEL_C_OPEN_WEEKS = Object.freeze([1]);

function isLevelCWeekOpen(week) {
  return window.LEVEL_C_OPEN_WEEKS.includes(Number(week));
}

(() => {
  const path = window.location.pathname.replace(/\\/g, '/');
  const gamesHubWeek = /\/games\/index\.html$/i.test(path)
    ? Number(new URLSearchParams(window.location.search).get('week'))
    : 0;
  const pageMatch = path.match(/\/week-([2-4])\.html$/i);
  const lessonMatch = path.match(/\/lessons\/week-([2-4])-page-/i);
  const trackMatch = path.match(/\/(?:reading|phonics)\/week-([2-4])\.html$/i);
  const gameMatch = path.match(/\/games\/week-([2-4])-/i);
  const closedWeek = Number(
    pageMatch?.[1] || lessonMatch?.[1] || trackMatch?.[1] || gameMatch?.[1] || gamesHubWeek || 0
  );
  if (!closedWeek || isLevelCWeekOpen(closedWeek)) return;

  const destination = /\/(?:lessons|reading|phonics|games)\//i.test(path)
    ? '../index.html'
    : 'index.html';
  window.location.replace(destination);
})();

/* ---------- Level C Month 7 weekly selection ---------- */

(() => {
  const config = window.LEVEL_C_M7;
  const weekGrid = document.querySelector('#week-grid');
  if (!config || !weekGrid) return;

  const colorClasses = ['week-orange', 'week-red', 'week-yellow', 'week-green'];
  weekGrid.innerHTML = Object.entries(config.weeks).map(([number, week], index) => {
    const isOpen = isLevelCWeekOpen(number);
    return `
      <a class="week-card ${colorClasses[index]}${isOpen ? '' : ' is-locked'}" data-week="${number}" ${isOpen ? `href="week-${number}.html"` : 'aria-disabled="true" tabindex="0"'}>
        <span class="week-card__inner">
          <span class="week-card__icon"><img src="${week.image}" width="100" height="100" loading="eager" decoding="async" alt="${week.alt}"></span>
          <strong>Week ${number}</strong>
          <span class="week-card__title">${week.title}</span>
          ${isOpen ? '' : '<span class="week-card__status">🔒 Coming soon</span>'}
        </span>
      </a>`;
  }).join('');

  weekGrid.querySelectorAll('.week-card.is-locked').forEach((card) => {
    const block = (event) => {
      event.preventDefault();
      showToast(`🔒 Week ${card.dataset.week} is coming soon!`);
    };
    card.addEventListener('click', block);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') block(event);
    });
  });
})();
