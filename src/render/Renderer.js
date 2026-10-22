// ============================================================
// CthulhuWell — Renderer (O Maestro Visual)
// ============================================================

import { HudRenderer } from './HudRenderer.js';
import { MonsterRenderer } from './MonsterRenderer.js';
import { RopeRenderer } from './RopeRenderer.js';
import { TorchRenderer } from './TorchRenderer.js';
import { WallRenderer } from './WallRenderer.js';

export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.wallRenderer = new WallRenderer(this);
    this.ropeRenderer = new RopeRenderer(this);
    this.torchRenderer = new TorchRenderer(this);
    this.monsterRenderer = new MonsterRenderer(this);
    this.hudRenderer = new HudRenderer(this);
  }

  render() {
    const { ctx, game } = this;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // Balanço da câmera ao correr
    const bobY = p.bobbing || 0;
    ctx.save();
    ctx.translate(0, bobY);

    if (game.state.won) {
      ctx.fillStyle = '#fff';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VOCÊ SOBREVIVEU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    if (game.state.dead) {
      ctx.fillStyle = '#a00';
      ctx.font = '50px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ELE TE PEGOU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    // Desenha o cenário e o monstro
    this.wallRenderer.render();
    this.monsterRenderer.render();

    ctx.restore();

    // O HUD fica fixo, sem balançar
    this.hudRenderer.render();
  }
}