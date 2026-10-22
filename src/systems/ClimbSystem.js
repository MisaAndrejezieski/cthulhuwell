import { CLIMB_SPEED, LOOK } from '../config/constants.js';

export class ClimbSystem {
  constructor(game) {
    this.game = game;
    this.handCycle = 0; // 0 = esquerda, 1 = direita
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
      
      // Lógica de alternar as mãos
      this.handTimer += dt;
      if (this.handTimer > 0.4) { // Troca de mão a cada 0.4s
        this.handCycle = this.handCycle === 0 ? 1 : 0;
        this.handTimer = 0;
      }
    } else {
      player.climbing = false;
      this.handTimer = 0;
    }

    // Passa o estado da mão pro player para o Renderer desenhar
    player.handCycle = this.handCycle;

    if (player.hasEscaped() && this.game.state.running) {
      this.game.win?.();
    }
  }
}