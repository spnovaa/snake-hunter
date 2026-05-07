import CONFIG from './config.js';

/**
 * Manages persistent high-score records using localStorage.
 * Scores are stored per difficulty level.
 */
export class ScoreManager {
  constructor() {
    this._storageKey = CONFIG.storage.recordKey;
  }

  /**
   * Returns the best score for the given difficulty level.
   * @param {string} level - Difficulty level key ('1' = Easy, '2' = Hard)
   * @returns {number}
   */
  getBestScore(level) {
    const records = this._load();
    return records?.[level] ?? 0;
  }

  /**
   * Updates the best score for a level if the new score is higher.
   * @param {string} level
   * @param {number} score
   */
  updateBestScore(level, score) {
    const records = this._load() ?? { '1': 0, '2': 0 };
    if (score > (records[level] ?? 0)) {
      records[level] = score;
      this._save(records);
    }
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey));
    } catch {
      return null;
    }
  }

  _save(data) {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(data));
    } catch (err) {
      console.warn('Snake Hunter: could not persist score.', err);
    }
  }
}
