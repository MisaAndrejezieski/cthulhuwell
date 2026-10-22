export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // O olhar altera o centro da tela
    let offsetY = 0;
    if (p.look === 'up') offsetY = h * 0.3;
    if (p.look === 'down') offsetY = -h * 0.3;

    // Simulação de perspectiva do poço
    const cx = w / 2;
    const topY = h * 0.1 - offsetY;
    const botY = h * 1.2 - offsetY;
    const topHalf = w * 0.1;
    const botHalf = w * 0.8;

    // Parede de pedra (gradiente escuro)
    const grad = ctx.createLinearGradient(0, topY, 0, botY);
    grad.addColorStop(0, '#2a2a35');
    grad.addColorStop(0.5, '#15151c');
    grad.addColorStop(1, '#000000');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - topHalf, topY);
    ctx.lineTo(cx + topHalf, topY);
    ctx.lineTo(cx + botHalf, botY);
    ctx.lineTo(cx - botHalf, botY);
    ctx.fill();

    // Luz do topo (se estiver olhando pra cima)
    if (p.look === 'up') {
      const lightGrad = ctx.createRadialGradient(cx, topY, 0, cx, topY, w * 0.5);
      lightGrad.addColorStop(0, 'rgba(200, 220, 255, 0.6)');
      lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }
}