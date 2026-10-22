import { TORCH_LIGHT_RADIUS } from '../config/constants.js';

export class TorchRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  renderFallen() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    if (p.look !== 'down') return;

    for (const t of game.torches) {
      // Calcula a posição na tela baseado na profundidade relativa
      const relativeDepth = t.depth - p.depth;
      if (relativeDepth < 0) continue;
      
      const screenY = h/2 + (relativeDepth * 2);
      if (screenY > h) continue;

      const r = 100;
      const grad = ctx.createRadialGradient(w/2, screenY, 0, w/2, screenY, r);
      grad.addColorStop(0, `rgba(255, 180, 80, ${t.getIntensity()})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w/2, screenY, r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  renderHand() {
    const { ctx, game } = this.renderer;
    if (!game.player.hasTorch) return;

    const w = game.canvas.width;
    const h = game.canvas.height;
    const cx = w/2 + w*0.15;
    const cy = h - h*0.15;

    // Luz no ambiente
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, TORCH_LIGHT_RADIUS);
    grad.addColorStop(0, 'rgba(255, 160, 50, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, TORCH_LIGHT_RADIUS, 0, Math.PI*2);
    ctx.fill();

    // Desenha a tocha (cabo)
    ctx.strokeStyle = '#3d2011';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx + 20, cy + 80);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Chama
    ctx.fillStyle = '#ffbb33';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff5500';
    ctx.beginPath();
    ctx.arc(cx, cy - 15, 8, 0, Math.PI*2);
    ctx.fill();
  }
}