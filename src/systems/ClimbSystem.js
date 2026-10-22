// ============================================================
// CthulhuWell — ClimbSystem (Corrida)
// ============================================================

import { PLAYER_SPEED, PLAYER_WALK_SPEED } from '../config/constants.js';

export class ClimbSystem {
  constructor(game) {
    this.game = game;
    this.bobTimer = 0;
  }

  update(dt) {
    const { input, player } = this.game;
    if (!player) return;

    // Correr para frente: W, Seta pra Cima ou clique do mouse
    const isRunning = input.isDown('KeyW') || input.isDown('ArrowUp');
    
    if (isRunning) {
      // Shift para correr mais rápido
      const speed = (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) 
                    ? PLAYER_SPEED 
                    : PLAYER_WALK_SPEED;
      
      // Avança em direção à porta
      player.depth = Math.max(0, player.depth - speed * dt);
      
      // Headbob (balanço da câmera simulando os passos)
      this.bobTimer += dt * speed * 2;
      player.bobbing = Math.sin(this.bobTimer) * 12;
    } else {
      player.bobbing = 0; // Fica parado e o monstro te alcança
    }

    // Chegou na porta? Venceu!
    if (player.hasEscaped() && this.game.state.running) {
      this.game.win?.();
    }
  }
}