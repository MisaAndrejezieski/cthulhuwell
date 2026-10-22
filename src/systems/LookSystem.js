import { LOOK } from '../config/constants.js';

export class LookSystem {
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