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

    // Headbob suave
    let camX = 0;
    let camY = 0;
    if (p.climbing) {
      camX = Math.sin(game.state.time * 10) * 5;
      camY = Math.cos(game.state.time * 20) * 3;
    }

    ctx.save();
    ctx.translate(camX, camY);

    if (game.state.won) {
      ctx.fillStyle = '#fff';
      ctx.font = '30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VOCÊ ESCAPOU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    if (game.state.dead) {
      ctx.fillStyle = '#a00';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ELE TE PEGOU', w / 2, h / 2);
      ctx.restore();
      return;
    }

    // Camadas de desenho
    this.wallRenderer.render();
    this.ropeRenderer.render();
    this.torchRenderer.renderFallen();
    this.monsterRenderer.render();
    
    // Desenha a tocha na mão apenas se não estiver escalando
    if (!p.climbing) {
      this.torchRenderer.renderHand();
    }

    ctx.restore();
    this.hudRenderer.render();
  }
}