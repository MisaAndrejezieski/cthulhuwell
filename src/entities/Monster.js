// ============================================================
// CthulhuWell — Monster (stub)
// Por enquanto só guarda posição/velocidade.
// Ativação com M. Perseguição completa na próxima iteração.
// ============================================================

import { MONSTER_BASE_SPEED, MONSTER_START_OFFSET, START_DEPTH } from '../config/constants.js';

export class Monster {
  constructor() {
    this.depth = START_DEPTH + MONSTER_START_OFFSET;
    this.speed = MONSTER_BASE_SPEED;
    this.active = false;
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.active) return;
    // Por enquanto só "sobe" devagar pra debug
    this.depth -= this.speed * 2 * dt;
  }
}