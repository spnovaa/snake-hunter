# 🐍 Snake Hunter

A browser-based arcade game built with vanilla JavaScript and the Canvas API.  
Click the snakes before they eat all the food — beat the clock to win!

---

## Demo

Open `index.html` in any modern browser — no build step required.

---

## Gameplay

| Objective | Hunt snakes by clicking on them before they eat all the food on the board. |
|-----------|----------------------------------------------------------------------------|
| Win       | Survive the 60-second timer with at least one food item remaining.         |
| Lose      | All food is consumed by snakes, or time runs out.                          |

### Controls

| Action | Input |
|--------|-------|
| Hunt a snake | Click on it |
| Pause / Resume | Click the **⏸ / ▶** button |

### Difficulty

| Level | Snake Speed |
|-------|-------------|
| Easy  | 1 px / frame |
| Hard  | 2 px / frame |

High scores for each difficulty are saved automatically in `localStorage`.

---

## Features

- **Smooth rendering** via `requestAnimationFrame` for a buttery 60 fps game loop
- **Delta-time timers** — gameplay speed is frame-rate independent
- **Autonomous snake AI** — each snake pathfinds toward the nearest food using Euclidean distance + angle calculation
- **Animated snake bodies** — bezier-curve rendering with live oscillation
- **Accurate click detection** — click coordinates are mapped to canvas-local space using `getBoundingClientRect`, eliminating offset bugs
- **Persistent high scores** — per-difficulty records stored in `localStorage`
- **Zero dependencies** — pure HTML5 / CSS3 / ES2020, no frameworks, no build tools

---

## Project Structure

```
snake-hunter/
├── index.html                    # Home / navigation page
├── public/
│   ├── assets/                   # Images (logo, icons)
│   └── views/
│       ├── landing.html          # Difficulty selection & high-score display
│       └── playground.html       # Game canvas & HUD
└── src/
    ├── js/
    │   ├── config.js             # Centralised game constants
    │   ├── utils.js              # Pure math helpers (distance, angle, random)
    │   ├── ScoreManager.js       # localStorage high-score persistence
    │   ├── Food.js               # Food entity
    │   ├── Snake.js              # Snake entity (AI movement + rendering)
    │   ├── Game.js               # Game engine (loop, spawning, collision)
    │   ├── main.js               # Playground page entry point
    │   └── app.js                # Landing page entry point
    └── styles/
        └── app.css               # CSS with custom properties (design tokens)
```

---

## Architecture

The project follows a clean **separation of concerns**:

```
main.js / app.js          ← entry points, wire up DOM ↔ Game
       │
       ▼
    Game.js               ← orchestrates the game loop and state
    ├── Snake.js           ← entity: movement AI + bezier-curve rendering
    ├── Food.js            ← entity: static drawable
    ├── ScoreManager.js    ← service: localStorage read/write
    ├── config.js          ← constants: all magic numbers in one place
    └── utils.js           ← pure functions: math / geometry helpers
```

**Game loop** — driven by `requestAnimationFrame`:

```
requestAnimationFrame
  └── _loop(timestamp)
        ├── _advanceTimers(deltaMs)   // countdown clock + snake spawner
        ├── _render()                 // clear → draw food → update & draw snakes
        ├── _updateHUD()              // push score/time to DOM
        └── _checkGameOver()         // stop loop on win/loss
```

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Language | JavaScript (ES2020) — ES Modules |
| Rendering | HTML5 Canvas API |
| Styling | CSS3 with custom properties |
| Storage | Web Storage API (`localStorage`) |
| Build | None — runs directly in the browser |

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/spnovaa/snake-hunter.git
cd snake-hunter

# Serve with any static file server (required for ES Modules)
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

> **Note:** ES Modules require a server (not `file://`).  
> Chrome / Firefox / Safari / Edge all supported.

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `requestAnimationFrame` over `setInterval` | Syncs with the display refresh rate, pauses automatically when the tab is hidden, and avoids timer drift. |
| Delta-time accumulation | Decouples game logic (seconds, spawn intervals) from frame rate so the game feels the same on 30 fps and 120 fps screens. |
| ES Modules (no bundler) | Demonstrates clean dependency graphs and modern JS without adding tooling complexity. |
| `getBoundingClientRect` for click mapping | Correctly handles window scroll and CSS scaling — the original offset hack broke on non-default zoom levels. |
| `ScoreManager` class | Isolates `localStorage` access; easy to swap for a remote API later. |

---

## Author

**SpNova** — [spnova@aut.ac.ir](mailto:spnova@aut.ac.ir)  
[github.com/spnovaa/snake-hunter](https://github.com/spnovaa/snake-hunter)
