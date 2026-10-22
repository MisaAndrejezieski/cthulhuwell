import { PLAYER_SPEED, PLAYER_WALK_SPEED } from '../config/constants.js';

export class ClimbSystem {
  constructor(game) {
    this.game = game;
    this.bobTimer = 0;
  }

  update(dt) {
    const { input, player } = this.game;
    if (!player) return;

    // Correndo para frente (W ou Seta pra Cima) e com os pés no chão
    const isRunning = input.isDown('KeyW') || input.isDown('ArrowUp');
    
    if (isRunning) {
      // Se estiver com Shift, corre mais rápido
      const speed = input.isDown('ShiftLeft') ? PLAYER_SPEED : PLAYER_WALK_SPEED;
      
      // Diminui a posição em direção à porta (0)
      player.depth = Math.max(0, player.depth - speed * dt);
      
      // Headbob para dar sensação de corrida
      this.bobTimer += dt * speed * 2;
      player.bobbing = Math.sin(this.bobTimer) * 10;
    } else {
      player.bobbing = 0;
    }

    // Chegou na porta? Venceu!
    if (player.depth <= 0 && this.game.state.running) {
      this.game.win?.();
    }
  }
}