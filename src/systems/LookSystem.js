import { LOOK } from '../config/constants.js';

export class LookSystem {
  constructor(game) {
    this.game = game;
    this.currentLook = LOOK.FRONT;
  }

  update() {
    const { input, player } = this.game;
    if (!player) return;

    // Verifica o que está pressionado
    const pressingUp = input.isDown('ArrowUp');
    const pressingDown = input.isDown('ArrowDown');

    if (pressingUp) {
      player.look = LOOK.UP;
    } else if (pressingDown) {
      player.look = LOOK.DOWN;
    } else {
      // Só volta pra frente se não estiver clicando nada
      player.look = LOOK.FRONT;
    }
  }
} 