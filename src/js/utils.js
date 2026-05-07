/**
 * Pure utility functions — no side effects, no external dependencies.
 */

/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Returns the angle in degrees from point (x1, y1) toward point (x2, y2).
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function angleBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

/**
 * Converts degrees to radians.
 * @param {number} degrees
 * @returns {number}
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}
