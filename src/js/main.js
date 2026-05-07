/**
 * Playground entry point.
 * Bootstraps the Game instance and wires up the pause button.
 */
import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('playground');
  const params = new URLSearchParams(window.location.search);
  const level = params.get('l') ?? '1';

  const game = new Game(canvas, level);
  game.start();

  const pauseButton = document.getElementById('pause-btn');
  pauseButton?.addEventListener('click', () => {
    const isPaused = game.togglePause();
    pauseButton.innerHTML = isPaused ? '&#9658;' : '&#9616;&#9616;';
  });
});
