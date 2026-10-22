export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // O ponto de fuga (para onde todas as linhas do túnel convergem)
    let offsetY = 0;
    if (p.look === 'up') offsetY = h * 0.3;
    if (p.look === 'down') offsetY = -h * 0.3;

    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // Fundo escuro (o fim do túnel)
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    // Vamos criar o scroll baseado na profundidade
    const scroll = (p.depth * 20) % 100;

    // --- DESENHANDO AS PAREDES LATERAIS E O TETO ---
    // A ideia é criar arcos e linhas que se movem em direção ao centro.
    // Desenhamos de trás pra frente.
    
    const numSections = 20;
    for (let i = numSections; i >= 0; i--) {
      // 't' vai de 0 (fundo do túnel) a 1 (tela inteira)
      const t = i / numSections;
      
      // O tamanho do arco aumenta conforme chega perto da tela
      const widthScale = Math.pow(t, 2); 
      const currentW = w * widthScale;
      const currentH = h * widthScale;

      // A posição Y da seção, aplicando o scroll
      // O scroll empurra as seções para baixo (você subindo)
      const sectionY = cy + currentH * 0.5 + scroll * widthScale;
      
      // Não desenha se estiver fora da tela
      if (sectionY < -currentH || sectionY - currentH > h) continue;

      // Cor da pedra
      const intensity = Math.max(0.05, 1 - t * 0.9);
      ctx.fillStyle = `rgba(30, 28, 25, ${intensity})`;
      ctx.strokeStyle = `rgba(15, 12, 10, ${intensity * 2})`;
      ctx.lineWidth = 2 + t * 5; // Linhas mais grossas perto

      // Desenha o Teto (Abóbada)
      ctx.beginPath();
      ctx.ellipse(cx, sectionY - currentH * 0.5, currentW / 2, currentH * 0.5, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Desenha o Chão
      ctx.beginPath();
      ctx.rect(cx - currentW / 2, sectionY, currentW, currentH * 0.5);
      ctx.fill();
      ctx.stroke();

      // Linhas verticais de fuga (as divisórias das paredes)
      ctx.beginPath();
      // Parede esquerda
      ctx.moveTo(cx - currentW / 2, sectionY - currentH * 0.5);
      ctx.lineTo(cx - currentW / 2, sectionY + currentH * 0.5);
      // Parede direita
      ctx.moveTo(cx + currentW / 2, sectionY - currentH * 0.5);
      ctx.lineTo(cx + currentW / 2, sectionY + currentH * 0.5);
      ctx.stroke();
    }

    // --- ILUMINAÇÃO ---
    // Centro do túnel (luz no fim ou escuridão)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5);
    
    if (p.look === 'up') {
      grad.addColorStop(0, 'rgba(200, 220, 255, 0.9)'); // Luz lá em cima
      grad.addColorStop(0.3, 'rgba(100, 120, 150, 0.4)');
    } else if (p.look === 'down') {
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Abismo
    } else {
      grad.addColorStop(0, 'rgba(10, 10, 15, 0.9)'); // Penumbra
    }
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Vinheta nas bordas (escuridão da visão periférica)
    const vignette = ctx.createRadialGradient(cx, cy, Math.min(w,h)*0.3, cx, cy, Math.max(w,h)*0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}