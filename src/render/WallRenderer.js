// ============================================================
// CthulhuWell — WallRenderer (Túnel de Tijolos)
// ============================================================

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

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // O ponto de fuga no centro
    const vanishX = cx;
    const vanishY = cy;

    // Scroll empurra os tijolos para trás e para baixo
    const scroll = (p.depth * 40) % 100;

    const numSlices = 15;
    
    for (let i = numSlices; i >= 0; i--) {
      const t = Math.pow(i / numSlices, 2.5); 
      
      const sliceW = w * t;
      const sliceH = h * t;
      
      const sliceY = vanishY + (sliceH * 0.5) + (scroll * t);

      const light = Math.min(1, 0.1 + t * 0.9);
      
      // 1. Fundo escuro no final do túnel
      if (i === numSlices) {
        ctx.fillStyle = '#050505'; 
        ctx.fillRect(vanishX - sliceW/2, vanishY - sliceH/2, sliceW, sliceH);
      }

      // 2. Chão
      ctx.fillStyle = `rgb(${Math.floor(40 * light)}, ${Math.floor(15 * light)}, ${Math.floor(10 * light)})`;
      ctx.beginPath();
      ctx.moveTo(vanishX - (w * Math.pow((i-1)/numSlices, 2.5))/2, vanishY + (h * Math.pow((i-1)/numSlices, 2.5))/2 + (scroll * Math.pow((i-1)/numSlices, 2.5)));
      ctx.lineTo(vanishX + (w * Math.pow((i-1)/numSlices, 2.5))/2, vanishY + (h * Math.pow((i-1)/numSlices, 2.5))/2 + (scroll * Math.pow((i-1)/numSlices, 2.5)));
      ctx.lineTo(vanishX + sliceW/2, sliceY + sliceH/2);
      ctx.lineTo(vanishX - sliceW/2, sliceY + sliceH/2);
      ctx.fill();
      
      // Textura do chão
      ctx.strokeStyle = `rgba(0,0,0,${0.5 * light})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Paredes Laterais (Tijolos)
      ctx.fillStyle = `rgb(${Math.floor(120 * light)}, ${Math.floor(50 * light)}, ${Math.floor(30 * light)})`;
      
      // Parede esquerda
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(vanishX - sliceW/2, sliceY + sliceH/2);
      ctx.lineTo(vanishX - sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(0, 0);
      ctx.fill();
      
      // Parede direita
      ctx.beginPath();
      ctx.moveTo(w, h);
      ctx.lineTo(vanishX + sliceW/2, sliceY + sliceH/2);
      ctx.lineTo(vanishX + sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(w, 0);
      ctx.fill();

      // Linhas horizontais dos tijolos
      ctx.strokeStyle = `rgba(0,0,0,${0.8 * light})`;
      for (let b = 0; b < 10; b++) {
        const brickY = (b / 10) * h;
        ctx.beginPath();
        ctx.moveTo(0, brickY);
        ctx.lineTo(vanishX - sliceW/2, sliceY + (brickY - h/2) * t);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w, brickY);
        ctx.lineTo(vanishX + sliceW/2, sliceY + (brickY - h/2) * t);
        ctx.stroke();
      }

      // 4. Teto Abobadado
      ctx.fillStyle = `rgb(${Math.floor(60 * light)}, ${Math.floor(25 * light)}, ${Math.floor(20 * light)})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vanishX - sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(vanishX + sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(w, 0);
      ctx.fill();
    }

    // Vinheta de escuridão
    const grad = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.3, cx, cy, Math.max(w,h)*0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}