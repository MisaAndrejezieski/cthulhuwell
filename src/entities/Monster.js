import { MONSTER_SPEED, MONSTER_START_OFFSET, START_POSITION } from '../config/constants.js';

export class Monster {
  constructor() {
    // Ele começa atrás de você (posição maior = mais longe da porta)
    this.depth = START_POSITION + MONSTER_START_OFFSET;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    
    // Ele persegue sem parar na direção da porta (diminuindo o depth)
    this.depth -= MONSTER_SPEED * dt;
  }
}