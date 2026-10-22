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

    // Fundo escuro
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    if (game.state.won) {
      ctx.fillStyle = '#fff';
      ctx.font = '30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VOCÊ ESCAPOU', w / 2, h / 2);
      return;
    }

    // Desenha os elementos na ordem correta
    this.wallRenderer.render();
    this.ropeRenderer.render();
    this.torchRenderer.renderFallen();
    this.monsterRenderer.render();
    this.torchRenderer.renderHand();
    
    // Vinheta escura nas bordas
    const grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.2, w/2, h/2, Math.max(w,h)*0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.hudRenderer.render();
  }
}