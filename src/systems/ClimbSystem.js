import { CLIMB_SPEED, LOOK } from '../config/constants.js';

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
      player.depth = Math.max(0, player.depth - CLIMB_SPEED * dt);
      player.climbing = true;
      
      this.handTimer += dt;
      if (this.handTimer > 0.4) {
        this.handCycle = this.handCycle === 0 ? 1 : 0;
        this.handTimer = 0;
      }
    } else {
      player.climbing = false;
      this.handTimer = 0;
      // Note que o player NÃO desce. Ele fica pendurado na corda. Mas o monstro sobe.
    }

    player.handCycle = this.handCycle;

    if (player.hasEscaped() && this.game.state.running) {
      this.game.win?.();
    }
  }
}