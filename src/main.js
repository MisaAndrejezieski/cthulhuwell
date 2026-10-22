// ============================================================
// CthulhuWell — Entry point provisório (Etapa 3)
// Vai ser expandido na Etapa 5 (render completo + áudio + start).
// ============================================================

import { Game } from './core/Game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

// Expõe no console pra debug fácil
window.__game = game;

game.start();