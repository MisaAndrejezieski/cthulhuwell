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

    if (p.look !== 'down' && p.look !== 'front') return;

    for (const t of game.torches) {
      const relativeDepth = t.depth - p.depth;
      if (relativeDepth < 0) continue;
      
      // Posição na tela simulando a tocha caindo no meio do poço
      const screenY = h/2 + (relativeDepth * 4);
      if (screenY > h * 1.5) continue;

      const r = 400; // Clarão bem forte no escuro
      const flicker = Math.sin(game.state.time * 30 + t.depth) * 20;
      
      const grad = ctx.createRadialGradient(w/2, screenY, 0, w/2, screenY, r + flicker);
      grad.addColorStop(0, `rgba(255, 120, 20, ${t.getIntensity()})`);
      grad.addColorStop(0.4, `rgba(255, 60, 0, ${t.getIntensity() * 0.5})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w/2, screenY, r, 0, Math.PI*2);
      ctx.fill();

      // Chama
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(w/2, screenY, 8, 0, Math.PI*2);
      ctx.fill();
    }
  }

  renderHand() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // Se tem tocha na mão, desenha a mão com a tocha
    if (p.hasTorch) {
      const cx = w * 0.85;
      const cy = h * 0.9;
      const f = Math.sin(game.state.time * 20) * 8;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, TORCH_LIGHT_RADIUS);
      grad.addColorStop(0, 'rgba(255, 170, 50, 0.7)');
      grad.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, TORCH_LIGHT_RADIUS, 0, Math.PI*2);
      ctx.fill();

      // Braço
      ctx.fillStyle = '#c9a68a';
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy + 50, 45, 60, -0.4, 0, Math.PI*2);
      ctx.fill();

      // Cabo
      ctx.strokeStyle = '#3d2011';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 60);
      ctx.lineTo(cx, cy - 20);
      ctx.stroke();

      // Chama animada
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.arc(cx + f, cy - 30, 25, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ffffaa';
      ctx.beginPath();
      ctx.arc(cx + f*0.5, cy - 25, 12, 0, Math.PI*2);
      ctx.fill();
    }
  }
}