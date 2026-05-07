import CONFIG from './config.js';
import { randomInt, euclideanDistance } from './utils.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { ScoreManager } from './ScoreManager.js';

/**
 * Core game engine for Snake Hunter.
 *
 * Responsibilities:
 *  - Owns the game loop (requestAnimationFrame-based)
 *  - Manages snakes, foods, score, and the countdown timer
 *  - Handles player click-to-hunt interaction
 *  - Delegates score persistence to ScoreManager
 *
 * Usage:
 *   const game = new Game(canvasElement, '1');
 *   game.start();
 */
export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} level - '1' for Easy, '2' for Hard
   */
  constructor(canvas, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.speed = Number(level);

    this.snakes = [];
    this.foods = [];
    this.score = 0;
    this.timeRemaining = CONFIG.game.durationSeconds;
    this.isPaused = false;
    this.isRunning = false;

    this._scoreManager = new ScoreManager();

    // Frame-timing accumulators
    this._lastTimestamp = null;
    this._clockAccumulator = 0;
    this._spawnAccumulator = 0;
    this._nextSpawnInterval = this._randomSpawnInterval();

    // Bind once so we can attach/detach the same reference
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundLoop = this._loop.bind(this);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Initialises the canvas, seeds food, and starts the game loop. */
  start() {
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;

    for (let i = 0; i < CONFIG.game.initialFoodCount; i++) {
      this._spawnFood();
    }

    this.canvas.addEventListener('click', this._boundHandleClick);
    this.isRunning = true;
    requestAnimationFrame(this._boundLoop);
  }

  /** Stops the loop, removes listeners, and persists the score. */
  stop() {
    this.isRunning = false;
    this.canvas.removeEventListener('click', this._boundHandleClick);
    this._scoreManager.updateBestScore(this.level, this.score);
  }

  /**
   * Toggles the pause state.
   * @returns {boolean} The new isPaused value
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  // ─── Game Loop ───────────────────────────────────────────────────────────────

  /**
   * Main loop driven by requestAnimationFrame.
   * Uses delta-time so gameplay speed is frame-rate independent.
   * @param {DOMHighResTimeStamp} timestamp
   */
  _loop(timestamp) {
    if (!this.isRunning) return;

    if (this._lastTimestamp === null) {
      this._lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;

    if (!this.isPaused) {
      this._advanceTimers(deltaMs);
    }

    this._render();
    this._updateHUD();

    if (!this._checkGameOver()) {
      requestAnimationFrame(this._boundLoop);
    }
  }

  /**
   * Advances the countdown clock and the snake-spawner timer.
   * @param {number} deltaMs - Milliseconds elapsed since the last frame
   */
  _advanceTimers(deltaMs) {
    this._clockAccumulator += deltaMs;
    if (this._clockAccumulator >= 1000) {
      this._clockAccumulator -= 1000;
      if (this.timeRemaining > 0) this.timeRemaining -= 1;
    }

    this._spawnAccumulator += deltaMs;
    if (this._spawnAccumulator >= this._nextSpawnInterval) {
      this._spawnAccumulator = 0;
      this._nextSpawnInterval = this._randomSpawnInterval();
      this._spawnSnake();
    }
  }

  // ─── Rendering ──────────────────────────────────────────────────────────────

  /**
   * Clears the canvas and redraws all game objects.
   * Also processes snake-food collisions detected during snake updates.
   */
  _render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw food first so snakes appear on top
    for (const food of this.foods) {
      food.draw(this.ctx);
    }

    // Update + draw snakes, collecting indices of food eaten this frame
    const eatenFoodIndices = new Set();
    for (const snake of this.snakes) {
      const eatenIndex = snake.update(this.foods, this.isPaused);
      if (eatenIndex !== null) eatenFoodIndices.add(eatenIndex);
      snake.draw(this.ctx);
    }

    // Remove eaten food items (descending order to preserve splice correctness)
    [...eatenFoodIndices]
      .sort((a, b) => b - a)
      .forEach((i) => this.foods.splice(i, 1));
  }

  /** Pushes score and timer values to the HUD elements. */
  _updateHUD() {
    const scoreEl = document.getElementById('gameplay-score');
    const timerEl = document.getElementById('timer');
    if (scoreEl) scoreEl.textContent = this.score;
    if (timerEl) timerEl.textContent = this.timeRemaining;
  }

  // ─── Interaction ────────────────────────────────────────────────────────────

  /**
   * Handles a click on the canvas.
   * Translates the click to canvas-local coordinates, then checks for a hit.
   * @param {MouseEvent} event
   */
  _handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hitIndex = this._findSnakeAtPoint(x, y);
    if (hitIndex !== null) {
      this.snakes.splice(hitIndex, 1);
      this.score += CONFIG.game.bonusPerKill;
    }
  }

  /**
   * Finds the closest snake to the given canvas point within the hit radius.
   * @param {number} x
   * @param {number} y
   * @returns {number|null} Index in this.snakes, or null if none within range
   */
  _findSnakeAtPoint(x, y) {
    let closestIndex = null;
    let closestDistance = Infinity;

    for (let i = 0; i < this.snakes.length; i++) {
      const distance = euclideanDistance(this.snakes[i].x, this.snakes[i].y, x, y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestDistance < CONFIG.snake.hitRadius ? closestIndex : null;
  }

  // ─── Game State ─────────────────────────────────────────────────────────────

  /**
   * Checks end conditions and triggers game-over flow if met.
   * @returns {boolean} True if the game has ended
   */
  _checkGameOver() {
    const isTimeUp = this.timeRemaining === 0;
    const allFoodConsumed = this.foods.length === 0;

    if (isTimeUp || allFoodConsumed) {
      this.stop();
      const message = isTimeUp ? "⏰ Time's Up!" : '🐍 Snakes Won!';
      // Defer alert so the final frame can paint before the dialog blocks
      setTimeout(() => alert(message), 50);
      return true;
    }

    return false;
  }

  // ─── Spawning ───────────────────────────────────────────────────────────────

  _spawnSnake() {
    const x = randomInt(0, CONFIG.canvas.width);
    this.snakes.push(new Snake(x, this.speed));
  }

  _spawnFood() {
    const x = randomInt(CONFIG.food.width, CONFIG.canvas.width - CONFIG.food.width);
    const y = randomInt(CONFIG.food.height, CONFIG.canvas.height - CONFIG.food.height);
    this.foods.push(new Food(x, y));
  }

  /** @returns {number} A random ms interval for the next snake spawn */
  _randomSpawnInterval() {
    return randomInt(CONFIG.game.snakeSpawnMinMs, CONFIG.game.snakeSpawnMaxMs);
  }
}
