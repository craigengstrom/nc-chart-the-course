# Chart the Course
## NC School Directors Workshop mini-game

A short, static browser game designed to lead into the workshop's Sailboat Exercise. It uses original artwork/layout and a journey metaphor inspired by classic decision-based travel games, without copying copyrighted game assets or text.

## Files

- `index.html` — game structure
- `styles.css` — NC-inspired visual design
- `game.js` — game logic
- `scenarios.json` — all editable scenarios, choices, effects, feedback, priorities, and result text

No framework, npm package, database, authentication, cookies, or external service is required.

## Quick preview

Because the game loads `scenarios.json` with `fetch()`, most browsers will block it if you simply double-click `index.html` and run it as a `file://` URL.

### Option A: Python

From this folder, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option B: VS Code

Use a simple local-server extension such as Live Server and open `index.html` through the local server.

## Editing the game

Most workshop edits can be made in `scenarios.json` without touching JavaScript.

Each scenario contains:

- `id`
- `priority`
- `title`
- `situation`
- `choices`

Each choice contains:

- `text` — what the participant clicks
- `feedback` — what appears after the choice
- `effects` — changes to the four indicators
- `tags` — optional behavioral tags used for the ending

Effects use these keys:

- `momentum`
- `capacity`
- `impact`
- `collaboration`

The JavaScript automatically clamps every indicator between 0 and 100.

## Optional Sailboat Exercise link

In `scenarios.json`, edit:

```json
"sailboatUrl": ""
```

Add a full URL if you want the final button to navigate to a Canvas page, external page, or other destination.

If the field is blank, the final button simply changes to a completion message.

## Canvas deployment

Canvas course pages normally sanitize or block arbitrary JavaScript pasted directly into the Rich Content Editor. The safest approach is therefore to **host these static files at a web-accessible location** and embed the hosted page in Canvas with an iframe or an approved External Tool/LTI workflow available at your institution.

Possible hosting locations include an institutional web server or another static hosting service approved by NC.

### Recommended Canvas embed pattern

After the game is hosted, use an iframe that points to the hosted `index.html`. Example only:

```html
<iframe
  src="https://YOUR-APPROVED-HOST/chart-the-course/index.html"
  width="100%"
  height="780"
  style="border:0;"
  title="Chart the Course leadership simulation"
  allow="fullscreen">
</iframe>
```

Whether Canvas accepts the iframe depends on the College's Canvas security and allow-list settings. If the host is blocked, ask the Canvas administrator which institutional/static domains are approved for embedding.

## Facilitation intent

The game is designed to take about 4–6 minutes. It reinforces the workshop's core ideas:

- The destination can be clear even when the route is not.
- Priorities require local interpretation and enactment.
- Leadership choices involve tradeoffs.
- Faculty capacity matters.
- Relationships and collaboration can create capacity.
- Quick pilots can create learning and momentum.
- School Directors help translate institutional priorities into local action.

The four scenarios cover:

1. Student persistence and retention
2. Equitable high-impact learning
3. Career readiness
4. Faculty capacity and enactment

## Accessibility

The game uses semantic buttons, keyboard-accessible controls, visible focus indicators, responsive layout, readable contrast, and reduced-motion support. Essential information does not depend on hover.

## Privacy

The game does not collect, transmit, or store participant data. All state exists only in the participant's browser during the current session.
