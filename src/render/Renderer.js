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

    // Movimento de câmera (Headbob) quando está escalando
    let camX = 0;
    let camY = 0;
    if (p.climbing) {
      camX = Math.sin(game.state.time * 15) * 10;
      camY = Math.cos(game.state.time * 30) * 5;
    }

    ctx.save();
    ctx.translate(camX, camY);

    // Fundo escuro absoluto
    ctx.fillStyle = '#000';
    ctx.fillRect(-20, -20, w + 40, h + 40);

    if (game.state.won) {
      ctx.fillStyle = '#fff';
      ctx.font = '30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VOCÊ ESCAPOU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    // Se o monstro pegou
    if (game.state.dead) {
      ctx.fillStyle = '#a00';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ELE TE PEGOU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    // Renderização em camadas (do fundo para a frente)
    this.wallRenderer.render();
    this.ropeRenderer.render();
    this.torchRenderer.renderFallen(); // Tochas no fundo
    this.monsterRenderer.render();     // Monstro no fundo
    this.torchRenderer.renderHand();   // Sua mão e a luz principal

    ctx.restore();

    // HUD não sofre headbob
    this.hudRenderer.render();
  }
}