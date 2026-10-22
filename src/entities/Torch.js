// ============================================================
// CthulhuWell — Torch (tocha caída no mundo)
// Criada quando o jogador aperta L.
// Cai com gravidade e queima por um tempo iluminando o fundo.
// ============================================================

import { TORCH_FALL_GRAVITY, TORCH_LIFE_AFTER_FALL } from '../config/constants.js';

export class Torch {
  /** @param {number} depth profundidade onde foi solta */
  constructor(depth) {
    this.depth = depth;
    this.vy = 0;              // velocidade de queda (m/s)
    this.life = TORCH_LIFE_AFTER_FALL; // segundos restantes queimando
    this.dead = false;
  }

  /** @param {number} dt */
  update(dt) {
    // Cai até bater no fundo (limitado ao fundo do poço)
    this.vy += TORCH_FALL_GRAVITY * dt;
    this.depth += this.vy * dt;

    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
    }
  }

  /** Intensidade da luz (0..1) baseada em vida restante. */
  getIntensity() {
    const t = Math.max(0, Math.min(1, this.life / TORCH_LIFE_AFTER_FALL));
    // Suaviza a queda de intensidade no final
    return Math.pow(t, 0.5);
  }
}