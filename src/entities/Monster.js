// ============================================================
// CthulhuWell — Monster (O Espectro)
// ============================================================

import { MONSTER_SPEED, MONSTER_START_OFFSET, START_POSITION } from '../config/constants.js';

export class Monster {
  constructor() {
    this.depth = START_POSITION + MONSTER_START_OFFSET;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    // O espectro avança incansavelmente
    this.depth -= MONSTER_SPEED * dt;
  }
}