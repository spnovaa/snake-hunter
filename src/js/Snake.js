import CONFIG from './config.js';
import { euclideanDistance, angleBetweenPoints, degToRad, randomInt } from './utils.js';

/**
 * Represents a snake enemy that autonomously seeks the nearest food.
 *
 * Each frame the snake:
 *  1. Finds the nearest food item.
 *  2. Moves toward it at the configured speed.
 *  3. Eats it (signals the caller) when it gets close enough.
 *  4. Renders itself as an animated bezier curve.
 */
export class Snake {
  /**
   * @param {number} x      - Initial horizontal position
   * @param {number} speed  - Movement speed in pixels per frame (1 = Easy, 2 = Hard)
   */
  constructor(x, speed) {
    this.x = x;
    this.y = 0;
    this.width = CONFIG.snake.width;
    this.height = CONFIG.snake.height;
    this.speed = speed;
    this.angle = 0;

    // Controls the lateral oscillation of the bezier body curve
    this.trembler = 5;
  }

  /**
   * Advances the snake one step toward the nearest food.
   *
   * @param {Food[]} foods    - Current food items on the canvas
   * @param {boolean} isPaused - When true, position is frozen but drawing still occurs
   * @returns {number|null}  Index of the food that was eaten, or null
   */
  update(foods, isPaused) {
    if (!foods.length) return null;

    const nearest = this._findNearestFood(foods);

    if (nearest.distance < CONFIG.snake.height) {
      // Snake reached the food — signal the caller to remove it
      return nearest.index;
    }

    if (!isPaused) {
      this.angle = angleBetweenPoints(this.x, this.y, nearest.x, nearest.y);
      this.x += Math.cos(degToRad(this.angle)) * this.speed;
      this.y += Math.sin(degToRad(this.angle)) * this.speed;
    }

    this._updateTrembler();
    return null;
  }

  /**
   * Renders the snake as an oscillating bezier curve on the canvas.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(degToRad(this.angle));

    const head = { x: this.height, y: 0 };
    const cp1 = { x: this.height / 2, y: this.trembler };
    const cp2 = { x: this.height / 2, y: -this.trembler };

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, head.x, head.y);
    ctx.strokeStyle = CONFIG.snake.color;
    ctx.lineWidth = CONFIG.snake.lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Scans the food array and returns metadata about the closest item.
   * @param {Food[]} foods
   * @returns {{ index: number, x: number, y: number, distance: number }}
   */
  _findNearestFood(foods) {
    let nearest = { index: 0, x: foods[0].x, y: foods[0].y, distance: Infinity };

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const distance = euclideanDistance(this.x, this.y, food.x, food.y);
      if (distance < nearest.distance) {
        nearest = { index: i, x: food.x, y: food.y, distance };
      }
    }

    return nearest;
  }

  /**
   * Advances the body-oscillation animation by a small random delta.
   * Resets to zero when the trembler drifts too far from center.
   */
  _updateTrembler() {
    this.trembler += randomInt(-10, 10) / 6;
    if (Math.abs(this.trembler) > CONFIG.snake.maxTrembler) {
      this.trembler = 0;
    }
  }
}
