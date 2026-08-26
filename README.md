# Level C Month 7 — Animals

Static Month 7 learning-site scaffold based on the Level A/Level B navigation framework.

## Weekly themes

- Week 1: In the Park
- Week 2: In the Garden
- Week 3: In the Yard
- Week 4: In the Cave

## Structure

- `index.html` — week selection
- `week-1.html` through `week-4.html` — Literacy, Reading, Phonics, and Games selection
- `lessons/week-N-page-01.html` through `week-N-page-07.html` — Page 1 lesson video and Pages 2–7 activities
- `reading/week-N.html` — Reading video and activity placeholders
- `phonics/week-N.html` — Phonics video and activity placeholders
- `games/index.html` — Games selection for the chosen week
- `games/placeholder.html` — shared game placeholder

## Deployment

The workflow in `.github/workflows/deploy.yml` publishes this static project to GitHub Pages whenever `main` is updated.

## Adding content later

Week titles and temporary animal emoji are in `js/data.js`. Replace the emoji there when the approved icons arrive. Put new media under `assets/images/week-N/`, `assets/audio/week-N/`, or `assets/video/week-N/`, then replace the corresponding placeholder in the lesson renderer.

### Supplied media

- `assets/video/phonics/week-3-week-4.mp4` — shared Phonics video used by Week 3 and Week 4
- `assets/video/phonics/week-1-week-2.mp4` — shared Phonics video used by Week 1 and Week 2

### Week 3 Literacy activity sheets

Pages 2–7 use the supplied snake and jungle activity sheets stored in `assets/images/week-3/literacy/`. Each sheet includes a narrated start gate, aligned interactive controls, spoken prompts, retry feedback, and correct-answer locking.

### Generated card artwork

- Weekly cards: dog, duck, snake, and bird icons in `assets/images/ui/weekly/`
- Literacy: Gerry presenting an alphabet picture book
- Reading: Penny reading an illustrated storybook
- Phonics: Don holding lowercase `a` and `y` blocks
- Games: Wanda holding a game controller

### Week 1 Literacy activity sheets

Pages 2–7 use the supplied dog activity sheets stored in `assets/images/week-1/literacy/`. Page 1 remains reserved for the lesson video. The activity sheets are currently display-only until interaction details are supplied.
