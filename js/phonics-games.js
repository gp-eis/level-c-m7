(() => {
  const params = new URLSearchParams(window.location.search);
  const week = Math.max(1, Math.min(4, Number(params.get('week')) || 1));
  const origin = params.get('from') === 'games' ? 'games' : 'phonics';
  const focusTeams = week <= 2 ? ['ai', 'ay'] : ['ea', 'ee'];
  const focusLabel = focusTeams.join(' and ');
  const vowelSound = week <= 2 ? 'long A' : 'long E';
  const wordsByFocus = {
    a: [
      { word: 'tail', team: 'ai', before: 't', after: 'l', silly: 'tayl', sentence: 'An elephant has a tail.' },
      { word: 'rain', team: 'ai', before: 'r', after: 'n', silly: 'rayn', sentence: 'It is in the rain.' },
      { word: 'spray', team: 'ay', before: 'spr', after: '', silly: 'sprai', sentence: 'It can spray water.' },
      { word: 'play', team: 'ay', before: 'pl', after: '', silly: 'plai', sentence: 'It can play in the rain.' }
    ],
    e: [
      { word: 'sea', team: 'ea', before: 's', after: '', silly: 'see', sentence: 'Look at the sea.' },
      { word: 'leaf', team: 'ea', before: 'l', after: 'f', silly: 'leef', sentence: 'Look at the leaf.' },
      { word: 'bee', team: 'ee', before: 'b', after: '', silly: 'bea', sentence: 'Look at the bee.' },
      { word: 'tree', team: 'ee', before: 'tr', after: '', silly: 'trea', sentence: 'He is in the tree.' }
    ]
  };
  const words = wordsByFocus[week <= 2 ? 'a' : 'e'].map((item) => ({
    ...item,
    image: `../assets/images/phonics-games/words/${item.word}.png`
  }));
  const games = {
    missing: {
      label: "What's Missing?",
      shortLabel: "What's Missing?",
      page: 'phonics-missing.html',
      icon: 'missing-vowel-team.png',
      hint: `Choose ${focusTeams[0]} or ${focusTeams[1]} to complete each word.`
    },
    pop: {
      label: 'Listen and Pop',
      shortLabel: 'Listen and Pop',
      page: 'phonics-pop.html',
      icon: 'listen-pop.png',
      hint: 'Listen to the word, then pop its picture bubble.'
    },
    train: {
      label: 'Vowel Team Train',
      shortLabel: 'Vowel Team Train',
      page: 'phonics-train.html',
      icon: 'vowel-team-train.png',
      hint: 'Put the correct vowel team on the word train.'
    },
    picture: {
      label: 'Picture Match',
      shortLabel: 'Picture Match',
      page: 'phonics-picture-match.html',
      icon: 'picture-match-3d.png',
      hint: 'Listen to each sentence and choose the matching picture.'
    }
  };
  const iconRoot = '../assets/images/ui/phonics-games/';

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };

  let speechSequence = 0;
  const speak = (text) => new Promise((resolve) => {
    const sequence = ++speechSequence;
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      window.setTimeout(resolve, 650);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = .82;
    utterance.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => /Samantha|Ava|Jenny|Aria|Zira/i.test(voice.name) && /^en/i.test(voice.lang))
      || voices.find((voice) => /^en-US/i.test(voice.lang))
      || voices.find((voice) => /^en/i.test(voice.lang))
      || null;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    window.setTimeout(finish, Math.min(4800, Math.max(2200, text.length * 65)));
  });

  const markWrong = (button) => {
    button.classList.remove('is-wrong');
    void button.offsetWidth;
    button.classList.add('is-wrong');
    window.setTimeout(() => button.classList.remove('is-wrong'), 560);
  };

  const hub = document.querySelector('#phonics-games-app');
  if (hub) {
    const backHref = origin === 'games'
      ? `index.html?week=${week}`
      : `../phonics/week-${week}.html#lesson-focus`;
    const backLabel = origin === 'games' ? `Week ${week} Games` : 'Phonics Lesson';
    document.title = `Phonics Games — Week ${week} — Level C`;
    hub.className = 'page phonics-games-hub';
    hub.innerHTML = `
      <a class="back-link" href="${backHref}">⬅️ ${backLabel}</a>
      <header class="phonics-games-heading">
        <h1 class="big-title"><img class="phonics-title-icon" src="../assets/images/ui/week-home/phonics-don-ay.png" alt="">Phonics Games</h1>
        <p class="subtitle">Week ${week} — pick a phonics game!</p>
        <p class="phonics-focus-banner">This week: <strong>${focusLabel}</strong> vowel teams</p>
      </header>
      <nav class="phonics-game-grid" aria-label="Week ${week} phonics games">
        ${Object.entries(games).map(([key, game]) => `
          <a class="phonics-game-card" href="${game.page}?week=${week}&from=${origin}" data-game="${key}">
            <img src="${iconRoot}${game.icon}" alt="">
            <span class="label">${game.label}</span>
            <span class="hint">${game.hint}</span>
          </a>`).join('')}
      </nav>`;
  }

  const gameApp = document.querySelector('#phonics-game-app');
  if (!gameApp) return;
  const gameKey = document.body.dataset.game;
  const game = games[gameKey];
  if (!game) return;

  let rounds = shuffle(words);
  let roundIndex = 0;
  let roundLocked = false;
  let roundToken = 0;
  document.title = `${game.label} — Week ${week} — Level C`;
  gameApp.className = 'page phonics-game-shell';
  gameApp.innerHTML = `
    <a class="back-link" href="phonics.html?week=${week}&from=${origin}">⬅️ Phonics Games</a>
    <header class="phonics-game-heading">
      <h1 class="big-title"><img class="phonics-title-icon" src="${iconRoot}${game.icon}" alt="">${game.label}</h1>
      <p class="subtitle">${gameKey === 'picture' ? 'Listen to the sentence. Tap the matching picture!' : `Week ${week} — ${focusLabel} vowel teams`}</p>
    </header>
    <div class="phonics-game-toolbar">
      ${gameKey === 'missing' || gameKey === 'picture' ? '' : '<button class="phonics-replay" type="button" aria-label="Hear the word">🔊 Hear Word</button>'}
      <span class="phonics-progress" aria-live="polite">Word 1 of ${rounds.length}</span>
      <button class="phonics-new-game" type="button">🔄 New Game</button>
    </div>
    <section class="phonics-game-board" aria-live="polite"></section>
    <div class="phonics-complete" hidden>
      <section class="phonics-complete-card" role="dialog" aria-modal="true" aria-labelledby="phonics-complete-title">
        <div class="phonics-complete-emoji" aria-hidden="true">🌟🚂🌟</div>
        <h2 id="phonics-complete-title">Fantastic Phonics!</h2>
        <p>You completed all four ${focusLabel} words!</p>
        <div class="phonics-complete-actions">
          <button class="phonics-new-game" type="button" data-complete-replay>🔄 Play Again</button>
          <a class="pill-btn blue" href="phonics.html?week=${week}&from=${origin}">🎮 More Games</a>
        </div>
      </section>
    </div>`;

  const board = gameApp.querySelector('.phonics-game-board');
  const progress = gameApp.querySelector('.phonics-progress');
  const complete = gameApp.querySelector('.phonics-complete');
  const replayButtons = gameApp.querySelectorAll('.phonics-new-game');
  const hearButton = gameApp.querySelector('.phonics-replay');

  const currentWord = () => rounds[roundIndex];
  const correctSpeech = (item) => gameKey === 'picture'
    ? `Correct! ${item.sentence}`
    : `Correct! ${item.word}. ${item.team.split('').join(' ')} makes the ${vowelSound} sound in ${item.word}.`;

  const finishCorrect = async (button, item, updateBoard) => {
    if (roundLocked) return;
    const activeToken = roundToken;
    roundLocked = true;
    button.classList.add('is-correct');
    board.querySelectorAll('button').forEach((control) => { control.disabled = true; });
    if (updateBoard) updateBoard();
    await speak(correctSpeech(item));
    if (activeToken !== roundToken) return;
    window.setTimeout(() => {
      if (activeToken !== roundToken) return;
      roundIndex += 1;
      if (roundIndex >= rounds.length) {
        complete.hidden = false;
        speak('Fantastic phonics! You completed all four words!');
      } else {
        renderRound();
      }
    }, 380);
  };

  const chooseTeam = (button, selected, item, updateBoard) => {
    if (roundLocked) return;
    if (selected !== item.team) {
      markWrong(button);
      return;
    }
    finishCorrect(button, item, updateBoard);
  };

  const renderTeamButtons = (className = 'team-choice') => shuffle(focusTeams).map((team) => `
    <button class="${className}" type="button" data-team="${team}" aria-label="Choose ${team.split('').join(' ')}">${team}</button>`).join('');

  const renderMissing = (item) => {
    board.innerHTML = `
      <h2 class="game-prompt">Choose the missing vowel team!</h2>
      <p class="game-help">Look at the picture and finish the word.</p>
      <button class="phonics-replay phonics-replay--picture" type="button" aria-label="Hear the word ${item.word}">🔊 Hear the Word</button>
      <img class="focus-word-picture" src="${item.image}" alt="${item.word}">
      <div class="word-builder" aria-label="${item.before}, missing vowel team, ${item.after}"><span>${item.before}</span><span class="word-gap">?</span><span>${item.after}</span></div>
      <div class="team-choices">${renderTeamButtons()}</div>`;
    board.querySelectorAll('[data-team]').forEach((button) => {
      button.addEventListener('click', () => chooseTeam(button, button.dataset.team, item, () => {
        board.querySelector('.word-gap').textContent = item.team;
      }));
    });
    board.querySelector('.phonics-replay--picture').addEventListener('click', () => speak(item.word));
  };

  const renderSilly = (item) => {
    board.innerHTML = `
      <h2 class="game-prompt">Fix the silly word!</h2>
      <p class="game-help">Which vowel team makes the picture word?</p>
      <img class="focus-word-picture" src="${item.image}" alt="${item.word}">
      <div class="silly-word" aria-label="Silly spelling ${item.silly}">${item.silly}</div>
      <div class="team-choices">${renderTeamButtons()}</div>`;
    board.querySelectorAll('[data-team]').forEach((button) => {
      button.addEventListener('click', () => chooseTeam(button, button.dataset.team, item, () => {
        const sillyWord = board.querySelector('.silly-word');
        sillyWord.textContent = item.word;
        sillyWord.classList.remove('silly-word');
        sillyWord.classList.add('word-builder');
      }));
    });
  };

  const renderPop = (item) => {
    const choices = shuffle(words);
    board.innerHTML = `
      <h2 class="game-prompt">Listen and pop the right word!</h2>
      <p class="game-help">Tap 🔊 if you want to hear the word again.</p>
      <div class="phonics-pop-grid">
        ${choices.map((choice) => `
          <button class="phonics-bubble" type="button" data-word="${choice.word}" aria-label="${choice.word}">
            <img src="${choice.image}" alt="">
            <span>${choice.word}</span>
          </button>`).join('')}
      </div>`;
    board.querySelectorAll('.phonics-bubble').forEach((button) => {
      button.addEventListener('click', () => {
        if (roundLocked) return;
        if (button.dataset.word !== item.word) {
          markWrong(button);
          return;
        }
        finishCorrect(button, item, () => button.classList.add('is-popped'));
      });
    });
    window.setTimeout(() => speak(`Pop ${item.word}.`), 260);
  };

  const renderTrain = (item) => {
    board.innerHTML = `
      <h2 class="game-prompt">Build the word train!</h2>
      <p class="game-help">Choose the vowel-team car that completes the word.</p>
      <div class="train-scene">
        <img class="train-picture" src="${item.image}" alt="${item.word}">
        <div class="train-word-car"><span>${item.before}</span><span class="word-gap">?</span><span>${item.after}</span></div>
      </div>
      <p class="train-choice-label">Which car belongs on the train?</p>
      <div class="team-choices">${renderTeamButtons('train-car')}</div>`;
    board.querySelectorAll('[data-team]').forEach((button) => {
      button.addEventListener('click', () => chooseTeam(button, button.dataset.team, item, () => {
        board.querySelector('.word-gap').textContent = item.team;
        board.querySelector('.train-scene').classList.add('is-departing');
      }));
    });
  };

  const renderPictureMatch = (item) => {
    const choices = shuffle(words);
    board.innerHTML = `
      <h2 class="game-prompt">Which picture matches the sentence?</h2>
      <div class="phonics-picture-sentence">
        <p>${item.sentence}</p>
        <button class="phonics-picture-listen" type="button" aria-label="Listen to the sentence">🔊</button>
      </div>
      <div class="phonics-picture-grid" role="group" aria-label="Choose the matching picture">
        ${choices.map((choice) => `
          <button class="phonics-picture-choice" type="button" data-word="${choice.word}" aria-label="Choose ${choice.word}">
            <img src="${choice.image}" alt="${choice.word}" draggable="false">
          </button>`).join('')}
      </div>
      <p class="phonics-picture-feedback" role="status" aria-live="polite">Listen and choose a picture.</p>`;
    board.querySelector('.phonics-picture-listen').addEventListener('click', () => speak(item.sentence));
    board.querySelectorAll('.phonics-picture-choice').forEach((button) => {
      button.addEventListener('click', () => {
        if (roundLocked) return;
        if (button.dataset.word !== item.word) {
          markWrong(button);
          board.querySelector('.phonics-picture-feedback').textContent = 'Try another picture.';
          return;
        }
        finishCorrect(button, item, () => {
          board.querySelector('.phonics-picture-feedback').textContent = `Yes! ${item.sentence}`;
        });
      });
    });
    window.setTimeout(() => speak(item.sentence), 260);
  };

  const renderRound = () => {
    roundToken += 1;
    speechSequence += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    roundLocked = false;
    complete.hidden = true;
    progress.textContent = `Word ${roundIndex + 1} of ${rounds.length}`;
    const item = currentWord();
    if (gameKey === 'missing') renderMissing(item);
    if (gameKey === 'silly') renderSilly(item);
    if (gameKey === 'pop') renderPop(item);
    if (gameKey === 'train') renderTrain(item);
    if (gameKey === 'picture') renderPictureMatch(item);
  };

  const newGame = () => {
    rounds = shuffle(words);
    roundIndex = 0;
    renderRound();
  };

  hearButton?.addEventListener('click', () => {
    const item = currentWord();
    speak(gameKey === 'picture' ? item.sentence : gameKey === 'pop' ? `Pop ${item.word}.` : item.word);
  });
  replayButtons.forEach((button) => button.addEventListener('click', newGame));
  renderRound();
})();
