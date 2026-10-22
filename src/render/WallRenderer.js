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
    if (p.look === 'up') offsetY = h * 0.3;
    if (p.look === 'down') offsetY = -h * 0.3;

    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // Fundo do poço (escuridão total)
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Cilindro de tijolos
    const radius = w * 0.45;
    
    // A iluminação vem do centro. O scroll é baseado na profundidade.
    const scroll = (p.depth * 30) % 60; 
    const startY = -100;
    const endY = h + 100;

    ctx.strokeStyle = '#1a1513';
    ctx.lineWidth = 2;

    for (let y = startY; y < endY; y += 30) {
      const rowY = y + scroll;
      
      // Calcula a perspectiva (quanto mais longe do centro, menor a curva)
      for (let x = 0; x < w; x += 60) {
        // Desenha blocos de tijolos curvados
        const distFromCenter = Math.abs(x - cx);
        if (distFromCenter > radius) continue; // Só desenha dentro do círculo

        // Curvatura para dar efeito 3D
        const curve = Math.sqrt(Math.max(0, 1 - Math.pow(distFromCenter / radius, 2))) * 40;
        const by = rowY - curve;

        ctx.fillStyle = `rgba(30, 25, 20, ${0.5 + (distFromCenter/radius)*0.5})`;
        ctx.fillRect(x, by, 55, 25);
        
        // Linha escura entre tijolos
        ctx.strokeRect(x, by, 55, 25);
      }
    }

    // Escuridão nas bordas para simular a falta de visão
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}