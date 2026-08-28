(() => {
  const directions = {
    1: {
      2: 'Woof! Woof! What am I? What shapes make up my body?',
      3: 'Look at what each dog is doing. Then match the sentence parts.',
      4: 'How many different colored dogs are there?',
      5: 'How many dogs are sleeping?',
      6: 'Dog Park Rules. What should we do at the dog park? Circle O or X for your answer.'
    },
    2: {
      2: 'Quack! Quack! What am I? What shapes make up my body?',
      3: 'Compare the sizes. Tap the picture to listen. Then match all four sentence parts.',
      4: 'Count the number of ducks with yellow bodies in each group.',
      5: 'Which animals swim? Circle them. Then write the total number.',
      6: 'Garden Rules. What should we do in the garden? Choose O or X for each answer.',
      7: 'In the Garden. Choose find or found to complete each sentence.'
    },
    3: {
      2: 'Hiss! Hiss! What am I? What shapes make up my body?',
      3: 'Look where the snakes are. Then answer the questions.',
      4: 'Count the total length of the snakes. Add the two lengths in each group.',
      5: 'Count the total time. How long did the snakes hang in the trees?',
      6: 'Jungle Rules. What should we do in the jungle? Choose O or X for each answer.',
      7: 'In the Jungle. Choose on or behind to complete each sentence.'
    },
    4: {
      2: 'Tweet! Tweet! What am I? What shapes make up my body?',
      3: 'Look at the picture. Then match the sentence parts.',
      4: 'Which birds were awake in the daytime? Circle them.',
      5: 'Which birds were awake in the nighttime? Circle them.',
      6: 'Park Rules. What should we do in the park? Choose O or X for each answer.',
      7: 'At the Park. Choose scary or scared to complete each sentence.'
    }
  };

  const week = Number(document.body.dataset.week);
  const page = Number(document.body.dataset.page);
  const direction = directions[week] && directions[week][page];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const stage = wrap && wrap.firstElementChild;
  if (!direction || !wrap || !stage) return;

  const feedback = document.querySelector([
    '.page2-activity-feedback',
    '.page3-match-feedback',
    '.page4-count-feedback',
    '.page5-count-feedback',
    '.page6-rules-feedback',
    '.w2-activity-feedback',
    '.w3-activity-feedback',
    '.w4-feedback'
  ].join(','));
  const originalFeedback = feedback ? feedback.textContent.trim() : '';

  const startLayer = document.createElement('div');
  startLayer.className = 'literacy-activity-start-layer';
  startLayer.innerHTML = `
    <button class="literacy-activity-start-button" type="button" aria-label="Start activity and listen to: ${direction}">
      <span aria-hidden="true">&#9654;</span>
      <span>Start Activity</span>
    </button>
  `;
  wrap.appendChild(startLayer);
  wrap.classList.add('has-literacy-activity-start');
  wrap.scrollLeft = 0;
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');

  const startButton = startLayer.querySelector('.literacy-activity-start-button');
  let started = false;

  startButton.addEventListener('click', async () => {
    if (started) return;
    started = true;
    startLayer.hidden = true;
    stage.removeAttribute('aria-hidden');
    stage.setAttribute('aria-busy', 'true');
    if (feedback) feedback.textContent = 'Listen to the directions.';

    const narration = typeof speakAmericanEnglish === 'function'
      ? speakAmericanEnglish(direction, { rate: .82, pitch: 1.05 })
      : Promise.resolve();
    const safetyTimeout = new Promise(resolve => window.setTimeout(resolve, 14000));
    await Promise.race([Promise.resolve(narration), safetyTimeout]);

    stage.inert = false;
    stage.removeAttribute('aria-busy');
    if (feedback && feedback.textContent === 'Listen to the directions.') {
      feedback.textContent = originalFeedback;
    }
    document.dispatchEvent(new CustomEvent('level-c-literacy-activity-started', {
      detail: { page, direction }
    }));
  });
})();
