import { MONSTER_START_OFFSET, START_DEPTH } from '../config/constants.js';

export class Monster {
  constructor() {
    // Começa 150 metros abaixo de você
    this.depth = START_DEPTH + MONSTER_START_OFFSET; 
    this.active = true; // Sem autorização, ele já está caçando.
  }

  update(dt) {
    if (!this.active) return;

    // Se o jogador está subindo, o monstro acelera para alcançar.
    // O terror é saber que ele é MAIS RÁPIDO que você.
    this.depth -= 6.5 * dt; 
  }
}