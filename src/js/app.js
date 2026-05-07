/**
 * Landing page entry point.
 * Handles level selection, high-score display, and game launch.
 */
import { ScoreManager } from './ScoreManager.js';

const scoreManager = new ScoreManager();

function getSelectedLevel() {
  return document.querySelector('input[name="radio-level"]:checked')?.value ?? '1';
}

function updateBestScoreDisplay() {
  const level = getSelectedLevel();
  const bestScore = scoreManager.getBestScore(level);
  const scoreEl = document.getElementById('landing-score');
  if (scoreEl) scoreEl.textContent = bestScore;
}

function startGame() {
  const level = getSelectedLevel();
  window.open(`../views/playground.html?l=${level}`, '', 'width=400,height=600');
}

document.addEventListener('DOMContentLoaded', () => {
  updateBestScoreDisplay();

  document.querySelectorAll('input[name="radio-level"]').forEach((radio) => {
    radio.addEventListener('change', updateBestScoreDisplay);
  });

  document.getElementById('landing-start-button')
    ?.addEventListener('click', startGame);
});

// Refresh the high score when the user tabs back from a completed game
window.addEventListener('focus', updateBestScoreDisplay);