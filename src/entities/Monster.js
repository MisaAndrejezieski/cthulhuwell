import { MONSTER_BASE_SPEED, MONSTER_START_OFFSET, START_DEPTH } from '../config/constants.js';

export class Monster {
  constructor() {
    this.depth = START_DEPTH + MONSTER_START_OFFSET;
    this.speed = MONSTER_BASE_SPEED;
    this.active = false;
  }

  update(dt) {
    if (!this.active) return;
    // O monstro persegue o jogador subindo. Se o jogador para, ele se aproxima.
    if (this.depth > 0) {
        this.depth -= this.speed * 10 * dt; 
    }
  }
}