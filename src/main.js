// ============================================================
// CthulhuWell — Entry Point
// ============================================================

import { Game } from './core/Game.js';
import { initAudio } from './utils/audio.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

// Inicializa o áudio no primeiro clique/tecla
window.addEventListener('keydown', () => {
  initAudio();
}, { once: true });

window.addEventListener('mousedown', () => {
  initAudio();
}, { once: true });

// Inicia o jogo imediatamente
game.start();

// Expor para debug
window.__game = game;