// ============================================================
// CthulhuWell — TorchSystem
//   T = pega tocha (mão fica ocupada → não escala)
//   L = larga tocha → cria Torch caída no mundo
// Tochas caídas são atualizadas a cada frame aqui.
// ============================================================

import { Torch } from '../entities/Torch.js';
import { playTorchDrop, playTorchPick } from '../utils/audio.js';

export class TorchSystem {
  /** @param {import('../core/Game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /** @param {number} dt */
  update(dt) {
    const { input, player, torches } = this.game;
    if (!player) return;

    // --- T: pega tocha ---
    if (input.justPressed('KeyT') && !player.hasTorch) {
      player.hasTorch = true;
      playTorchPick();
    }

    // --- L: larga tocha ---
    if (input.justPressed('KeyL') && player.hasTorch) {
      player.hasTorch = false;
      // Cria tocha caída na profundidade atual
      torches.push(new Torch(player.depth));
      playTorchDrop();
    }

    // --- Atualiza tochas caídas ---
    for (const t of torches) t.update(dt);

    // Remove tochas queimadas
    this.game.torches = torches.filter(t => !t.dead);
  }
}