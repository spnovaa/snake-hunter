/**
 * Central configuration for Snake Hunter.
 * All magic numbers and tunable values live here.
 */
const CONFIG = Object.freeze({
  canvas: {
    width: 400,
    height: 570,
  },

  snake: {
    width: 10,
    height: 20,
    /** Pixel radius within which a click registers as a hit */
    hitRadius: 30,
    color: '#4caf50',
    lineWidth: 2,
    /** Trembler resets when its absolute value exceeds this */
    maxTrembler: 15,
  },

  food: {
    width: 10,
    height: 10,
    color: '#fdd835',
  },

  game: {
    initialFoodCount: 10,
    durationSeconds: 60,
    bonusPerKill: 1,
    snakeSpawnMinMs: 1000,
    snakeSpawnMaxMs: 3000,
  },

  difficulty: {
    EASY: '1',
    HARD: '2',
  },

  storage: {
    recordKey: 'snake-hunter-record',
  },
});

export default CONFIG;
