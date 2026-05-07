import CONFIG from './config.js';

/**
 * Represents a food item on the game canvas.
 * Food is static — it only needs to be drawn each frame.
 */
export class Food {
  /**
   * @param {number} x - Horizontal position
   * @param {number} y - Vertical position
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.food.width;
    this.height = CONFIG.food.height;
  }

  /**
   * Draws the food item onto the given canvas context.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = CONFIG.food.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}
