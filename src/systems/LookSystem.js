// ============================================================
// CthulhuWell — LookSystem
// Lê setas e decide o estado do olhar do jogador.
//   ↑  = olhar pra cima
//   ↓  = olhar pra baixo
//   (nada pressionado) = olhar pra frente
// ============================================================

import { LOOK } from '../config/constants.js';

export class LookSystem {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  update() {
    const { input, player } = this.game;
    if (!player) return;

    if (input.isDown('ArrowUp')) {
      player.look = LOOK.UP;
    } else if (input.isDown('ArrowDown')) {
      player.look = LOOK.DOWN;
    } else {
      player.look = LOOK.FRONT;
    }
  }
}