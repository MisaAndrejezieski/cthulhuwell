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

    // Fundo escuro absoluto
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    const radius = w * 0.45;
    
    // AQUI ESTÁ A MÁGICA DO MOVIMENTO:
    // Multiplicamos a profundidade por 40 (pixels por metro) e tiramos o módulo.
    // Quando o player.depth diminui, o scroll aumenta, empurrando os tijolos para baixo.
    const scroll = (p.depth * 40) % 40; 
    
    const startY = -100;
    const endY = h + 100;

    // Tamanho do tijolo
    const brickW = 80;
    const brickH = 40;

    for (let y = startY; y < endY; y += brickH) {
      const rowY = y + scroll;
      
      // Desenha os tijolos
      for (let x = 0; x < w; x += brickW) {
        const distFromCenter = Math.abs(x - cx);
        if (distFromCenter > radius) continue;

        // Curvatura para dar efeito 3D de tubo
        const curve = Math.sqrt(Math.max(0, 1 - Math.pow(distFromCenter / radius, 2))) * 60;
        const by = rowY - curve;

        // Cor do tijolo baseada na distância do centro (mais escuro nas bordas)
        const darkness = 1 - (distFromCenter / radius);
        const r = Math.floor(40 * darkness);
        const g = Math.floor(30 * darkness);
        const b = Math.floor(25 * darkness);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, by, brickW - 2, brickH - 2);
      }
    }

    // Vinheta de profundidade (faz o centro parecer mais iluminado)
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}