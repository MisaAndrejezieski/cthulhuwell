// ============================================================
// CthulhuWell — Player
// Estado do jogador. Só guarda dados; quem decide é o sistema.
// ============================================================

import { START_DEPTH, LOOK } from '../config/constants.js';

export class Player {
  constructor() {
    this.depth = START_DEPTH;      // metros (1000 = fundo, 0 = topo)
    this.look = LOOK.FRONT;        // 'up' | 'front' | 'down'
    this.hasTorch = false;         // tocha na mão?
    this.climbing = false;         // subindo neste frame?
  }

  /** Distância até a superfície (0 = saiu). */
  getDepthToSurface() {
    return this.depth;
  }

  /** Jogador está no topo? */
  hasEscaped() {
    return this.depth <= 0;
  }
}