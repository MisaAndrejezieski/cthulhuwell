// ============================================================
// CthulhuWell — ClimbSystem
// Regra central: o jogador sobe apenas se TODAS forem verdade:
//   1. Espaço está segurado
//   2. Mão está livre (!player.hasTorch)
//   3. Olhar está em FRENTE
// Caso contrário, para de subir.
// ============================================================

import { CLIMB_SPEED, LOOK } from '../config/constants.js';

export class ClimbSystem {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /** @param {number} dt */
  update(dt) {
    const { input, player } = this.game;
    if (!player) return;

    const canClimb =
      input.isDown('Space') &&
      !player.hasTorch &&
      player.look === LOOK.FRONT;

    if (canClimb) {
      player.depth = Math.max(0, player.depth - CLIMB_SPEED * dt);
      player.climbing = true;
      this.game.state.depth = player.depth;
    } else {
      player.climbing = false;
    }

    // Chegou ao topo?
    if (player.hasEscaped() && this.game.state.running) {
      this.game.win?.();
    }
  }
}