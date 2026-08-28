(() => {
  const items = window.LEVEL_C_GAMES || window.LEVEL_C_WEEK_1_GAMES;
  const helpers = window.LevelCGameHelpers;
  const wheel = document.querySelector('#dog-rules-wheel');
  if (!items || !helpers || !wheel) return;

  const { speak } = helpers;
  const spinButton = document.querySelector('#wheel-spin');
  const stopButton = document.querySelector('#wheel-stop');
  const result = document.querySelector('#wheel-result');
  const selectedArea = document.querySelector('#wheel-selected-area');
  const card = document.querySelector('#wheel-card');
  const returnButton = document.querySelector('#wheel-return');
  const frontImage = document.querySelector('#wheel-card-front-image');
  const backImage = document.querySelector('#wheel-card-back-image');
  const sentence = document.querySelector('#wheel-card-sentence');

  const colors = ['#ff8a80', '#80d8ff', '#b9f6ca', '#ffd180', '#ea80fc', '#ffff8d', '#84ffff', '#ff9e80'];
  const segmentAngle = 360 / items.length;
  const spinSpeed = 75;
  let rotation = 0;
  let spinning = false;
  let stopping = false;
  let animationFrame = 0;
  let lastFrame = 0;
  let selectedItem = null;

  wheel.style.background = `conic-gradient(${items.map((_, index) => {
    const start = index * segmentAngle;
    const end = (index + 1) * segmentAngle;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  }).join(',')})`;

  items.forEach((item, index) => {
    const midpoint = (index * segmentAngle + segmentAngle / 2) * Math.PI / 180;
    const label = document.createElement('span');
    label.className = 'wheel-label';
    label.style.setProperty('--label-x', `${50 + Math.sin(midpoint) * 31}%`);
    label.style.setProperty('--label-y', `${50 - Math.cos(midpoint) * 31}%`);

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    label.appendChild(image);
    wheel.appendChild(label);
  });

  function render() {
    wheel.style.transform = `rotate(${rotation}deg)`;
  }

  function spinFrame(time) {
    if (!spinning || stopping) return;
    if (!lastFrame) lastFrame = time;
    const elapsed = Math.min(time - lastFrame, 40);
    lastFrame = time;
    rotation += spinSpeed * elapsed / 1000;
    render();
    animationFrame = requestAnimationFrame(spinFrame);
  }

  function startSpin() {
    if (spinning) return;
    window.speechSynthesis?.cancel();
    selectedArea.hidden = true;
    selectedItem = null;
    result.textContent = '';
    card.classList.remove('is-flipped');
    card.setAttribute('aria-pressed', 'false');
    spinning = true;
    stopping = false;
    lastFrame = 0;
    spinButton.hidden = true;
    stopButton.hidden = false;
    stopButton.disabled = false;
    document.body.classList.add('wheel-is-spinning');
    stopButton.focus({ preventScroll: true });
    animationFrame = requestAnimationFrame(spinFrame);
  }

  function stopSpin() {
    if (!spinning || stopping) return;
    stopping = true;
    stopButton.disabled = true;
    cancelAnimationFrame(animationFrame);

    const startRotation = rotation;
    const startTime = performance.now();
    const duration = 1800;
    const coastDistance = spinSpeed * (duration / 1000) / 2;

    function slowDown(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      rotation = startRotation + coastDistance * (2 * progress - progress * progress);
      render();
      if (progress < 1) {
        animationFrame = requestAnimationFrame(slowDown);
      } else {
        finishSpin();
      }
    }

    animationFrame = requestAnimationFrame(slowDown);
  }

  async function finishSpin() {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const pointerAngle = (360 - normalizedRotation) % 360;
    const selectedIndex = Math.floor(pointerAngle / segmentAngle) % items.length;
    selectedItem = items[selectedIndex];
    spinning = false;
    stopping = false;
    document.body.classList.remove('wheel-is-spinning');
    spinButton.hidden = false;
    stopButton.hidden = true;
    stopButton.disabled = false;

    frontImage.src = selectedItem.image;
    frontImage.alt = selectedItem.label;
    backImage.src = selectedItem.image;
    backImage.alt = selectedItem.label;
    sentence.textContent = selectedItem.sentence;
    card.style.setProperty('--selected-color', colors[selectedIndex % colors.length]);
    card.classList.remove('is-flipped');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${selectedItem.phrase} Click to reveal the full sentence.`);
    result.textContent = '🎉 Listen to the phrase!';
    selectedArea.hidden = false;
    card.focus({ preventScroll: true });
    await speak(selectedItem.phrase);
  }

  async function flipCard() {
    if (!selectedItem) return;
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
    if (flipped) {
      card.setAttribute('aria-label', `${selectedItem.sentence} Click to see the picture again.`);
      await speak(selectedItem.sentence);
    } else {
      card.setAttribute('aria-label', `${selectedItem.phrase} Click to reveal the full sentence.`);
      await speak(selectedItem.phrase);
    }
  }

  function returnToWheel() {
    window.speechSynthesis?.cancel();
    selectedArea.hidden = true;
    card.classList.remove('is-flipped');
    card.setAttribute('aria-pressed', 'false');
    result.textContent = '';
    selectedItem = null;
    spinButton.focus({ preventScroll: true });
  }

  spinButton.addEventListener('click', startSpin);
  stopButton.addEventListener('click', stopSpin);
  card.addEventListener('click', flipCard);
  returnButton.addEventListener('click', returnToWheel);
  render();
})();
