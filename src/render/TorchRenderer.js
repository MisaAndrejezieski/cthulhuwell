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
      const relativeDepth = t.depth - p.depth;
      if (relativeDepth < 0) continue;
      
      const screenY = h/2 + (relativeDepth * 2);
      if (screenY > h * 1.5) continue;

      // Luz da tocha caída
      const r = 300;
      const grad = ctx.createRadialGradient(w/2, screenY, 0, w/2, screenY, r);
      grad.addColorStop(0, `rgba(255, 120, 20, ${t.getIntensity()})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w/2, screenY, r, 0, Math.PI*2);
      ctx.fill();

      // A chama minúscula
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(w/2, screenY, 5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  renderHand() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // Se ele estiver escalando, mostra a mão segurando a corda
    if (p.climbing) {
      // Mão esquerda
      ctx.fillStyle = '#c9a68a'; // Cor de pele
      ctx.beginPath();
      ctx.ellipse(w/2 - 30, h - 50, 30, 40, 0.2, 0, Math.PI*2);
      ctx.fill();
      // Mão direita
      ctx.beginPath();
      ctx.ellipse(w/2 + 30, h - 80, 30, 40, -0.2, 0, Math.PI*2);
      ctx.fill();
    } 
    // Se tiver tocha na mão
    else if (p.hasTorch) {
      const cx = w * 0.8;
      const cy = h * 0.8;
      
      // Movimento da chama (flicker)
      const f = Math.sin(game.state.time * 20) * 5;

      // O clarão da luz
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, TORCH_LIGHT_RADIUS);
      grad.addColorStop(0, 'rgba(255, 170, 50, 0.6)');
      grad.addColorStop(0.3, 'rgba(255, 100, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, TORCH_LIGHT_RADIUS, 0, Math.PI*2);
      ctx.fill();

      // Desenha a mão
      ctx.fillStyle = '#c9a68a';
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy + 40, 40, 50, -0.5, 0, Math.PI*2);
      ctx.fill();

      // Desenha o cabo
      ctx.strokeStyle = '#3d2011';
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 60);
      ctx.lineTo(cx, cy - 20);
      ctx.stroke();

      // Desenha a chama
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