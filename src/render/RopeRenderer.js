export class RopeRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    if (p.look !== 'front') return;

    const cx = w / 2;
    
    // Desenha a corda
    ctx.strokeStyle = '#4a3b2a';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Trançado da corda
    ctx.strokeStyle = '#2b2117';
    ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(cx - 8, y);
      ctx.lineTo(cx + 8, y + 10);
      ctx.stroke();
    }

    // Desenha as mãos se estiver escalando
    if (p.climbing) {
      const isLeft = p.handCycle === 0;
      
      // Mão esquerda sobe, depois direita
      const lhY = isLeft ? h * 0.65 : h * 0.8;
      const rhY = isLeft ? h * 0.8 : h * 0.65;

      ctx.fillStyle = '#c9a68a';
      
      // Mão Esquerda
      ctx.beginPath();
      ctx.ellipse(cx - 25, lhY, 30, 40, 0.2, 0, Math.PI*2);
      ctx.fill();

      // Mão Direita
      ctx.beginPath();
      ctx.ellipse(cx + 25, rhY, 30, 40, -0.2, 0, Math.PI*2);
      ctx.fill();
    }
  }
}