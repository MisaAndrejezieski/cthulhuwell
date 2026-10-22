import { Game } from './core/Game.js';
import { initAudio } from './utils/audio.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

// Inicia o áudio após interação do usuário
document.body.addEventListener('click', () => {
    initAudio();
    game.start();
}, { once: true });

// Expor para debug no console
window.__game = game;