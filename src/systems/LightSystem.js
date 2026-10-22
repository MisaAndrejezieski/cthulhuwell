// ============================================================
// CthulhuWell — LightSystem
// Consulta de luz. Não desenha; o Renderer usa estes dados.
// ============================================================

import { TORCH_LIGHT_RADIUS } from '../config/constants.js';

export class LightSystem {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /** Tocha na mão está acesa? */
  isHandTorchLit() {
    return this.game.player?.hasTorch === true;
  }

  /** Raio (px) da tocha na mão. */
  getHandTorchRadius() {
    return this.isHandTorchLit() ? TORCH_LIGHT_RADIUS : 0;
  }

  /**
   * Retorna a intensidade total de luz que atinge uma profundidade.
   * Útil p/ "o monstro está sendo iluminado?".
   * @param {number} depth
   * @returns {number} 0..1
   */
  getLightAtDepth(depth) {
    let intensity = 0;
    for (const t of this.game.torches) {
      const d = Math.abs(t.depth - depth);
      if (d < TORCH_LIGHT_RADIUS) {
        intensity += t.getIntensity() * (1 - d / TORCH_LIGHT_RADIUS);
      }
    }
    return Math.min(1, intensity);
  }
}