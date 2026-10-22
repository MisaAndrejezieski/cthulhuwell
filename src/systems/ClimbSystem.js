import { LOOK } from '../config/constants.js';

export class ClimbSystem {
  constructor(game) {
    this.game = game;
    this.handCycle = 0;
    this.handTimer = 0;
  }

  update(dt) {
    const { input, player } = this.game;
    if (!player) return;

    const canClimb =
      input.isDown('Space') &&
      !player.hasTorch &&
      player.look === LOOK.FRONT;

    if (canClimb) {
      // Velocidade de subida lenta (1.5 metros por segundo)
      player.depth = Math.max(0, player.depth - 1.5 * dt);
      player.climbing = true;
      
      this.handTimer += dt;
      if (this.handTimer > 0.6) { // Demora mais pra trocar de mão
        this.handCycle = this.handCycle === 0 ? 1 : 0;
        this.handTimer = 0;
      }
    } else {
      player.climbing = false;
      this.handTimer = 0;
    }

    player.handCycle = this.handCycle;

    if (player.hasEscaped() && this.game.state.running) {
      this.game.win?.();
    }
  }
}