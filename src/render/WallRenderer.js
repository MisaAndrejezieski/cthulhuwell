export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    const cx = w / 2;
    const cy = h / 2;
    
    // O fundo escuro no final do túnel
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const vanishX = cx;
    const vanishY = cy;

    // O scroll é a ilusão de movimento (a cada 10 metros, move os tijolos)
    const scroll = (p.depth * 30) % 60;

    // Desenhamos os túneis em fatias (do fundo para a frente)
    const numSlices = 15;
    
    for (let i = numSlices; i >= 0; i--) {
      // 't' de 0 (fundo do túnel) a 1 (na sua cara)
      const t = Math.pow(i / numSlices, 2.5); 
      
      // Tamanho da fatia na tela
      const sliceW = w * t;
      const sliceH = h * t;
      
      // Posição Y aplicando o scroll (empurra pra baixo quando você sobe)
      const sliceY = vanishY + (sliceH * 0.5) + (scroll * t);

      // Cor dos tijolos: mais escura no fundo (luz da tocha)
      const light = Math.min(1, 0.1 + t * 0.9);
      ctx.fillStyle = `rgb(${Math.floor(80 * light)}, ${Math.floor(30 * light)}, ${Math.floor(20 * light)})`;

      // 1. Desenha a parede do fundo (o "tampão" onde o monstro está)
      if (i === numSlices) {
        ctx.fillStyle = '#000'; // Escuridão absoluta
        ctx.fillRect(vanishX - sliceW/2, vanishY - sliceH/2, sliceW, sliceH);
      }

      // 2. Desenha o Chão
      ctx.beginPath();
      ctx.moveTo(vanishX - (w * Math.pow((i-1)/numSlices, 2.5))/2, vanishY + (h * Math.pow((i-1)/numSlices, 2.5))/2 + (scroll * Math.pow((i-1)/numSlices, 2.5)));
      ctx.lineTo(vanishX + (w * Math.pow((i-1)/numSlices, 2.5))/2, vanishY + (h * Math.pow((i-1)/numSlices, 2.5))/2 + (scroll * Math.pow((i-1)/numSlices, 2.5)));
      ctx.lineTo(vanishX + sliceW/2, sliceY + sliceH/2);
      ctx.lineTo(vanishX - sliceW/2, sliceY + sliceH/2);
      ctx.fill();
      
      // Textura do chão (linhas horizontais)
      ctx.strokeStyle = `rgba(0,0,0,${0.5 * light})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Desenha as Paredes Laterais (os tijolos em fuga)
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

      // Desenha os tijolos nas paredes
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

      // 4. Desenha o Teto (Abóbada curva, como na sua imagem)
      ctx.fillStyle = `rgb(${Math.floor(50 * light)}, ${Math.floor(20 * light)}, ${Math.floor(15 * light)})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vanishX - sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(vanishX + sliceW/2, sliceY - sliceH/2);
      ctx.lineTo(w, 0);
      ctx.fill();
    }

    // Vinheta (escuridão nas bordas para dar clima de terror)
    const grad = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.3, cx, cy, Math.max(w,h)*0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}