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
    const ropeWidth = 12;
    
    ctx.strokeStyle = '#4a3b2a';
    ctx.lineWidth = ropeWidth;
    ctx.lineCap = 'round';
    
    // Desenha a corda no meio
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Textura da corda (trançado)
    ctx.strokeStyle = '#2b2117';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(cx - ropeWidth/2, y);
      ctx.lineTo(cx + ropeWidth/2, y + 5);
      ctx.stroke();
    }
  }
}