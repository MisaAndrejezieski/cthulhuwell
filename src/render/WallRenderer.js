export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    let offsetY = 0;
    if (p.look === 'up') offsetY = h * 0.4;
    if (p.look === 'down') offsetY = -h * 0.4;

    const cx = w / 2;
    const centerY = h / 2 + offsetY;

    // Desenha as paredes laterais com perspectiva
    const gradL = ctx.createLinearGradient(0, 0, w/4, 0);
    gradL.addColorStop(0, '#111');
    gradL.addColorStop(1, '#000');
    ctx.fillStyle = gradL;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w/2, centerY);
    ctx.lineTo(0, h);
    ctx.fill();

    const gradR = ctx.createLinearGradient(w, 0, w*0.75, 0);
    gradR.addColorStop(0, '#111');
    gradR.addColorStop(1, '#000');
    ctx.fillStyle = gradR;
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w/2, centerY);
    ctx.lineTo(w, h);
    ctx.fill();

    // Textura de pedras que se move com a profundidade
    ctx.strokeStyle = 'rgba(40, 40, 50, 0.5)';
    ctx.lineWidth = 2;
    
    // O scroll das pedras é baseado na profundidade atual
    const scroll = (p.depth * 20) % 100;
    
    for (let i = -100; i < h + 100; i += 100) {
        const y = i + scroll;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w/2, centerY + (y - h/2)*0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w, y);
        ctx.lineTo(w/2, centerY + (y - h/2)*0.2);
        ctx.stroke();
    }
  }
}