export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // Fundo preto absoluto (a escuridão do fundo do poço)
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    let offsetY = 0;
    if (p.look === 'up') offsetY = h * 0.4;    // Olha pra cima, o buraco desce
    if (p.look === 'down') offsetY = -h * 0.4; // Olha pra baixo, o buraco sobe

    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // Escala máxima do túnel (quanto maior, mais perto de nós)
    const maxRadius = w * 0.8;

    // O movimento! A profundidade puxa os tijolos para baixo.
    // Multiplicamos por 15 para controlar a velocidade do scroll.
    const scroll = (p.depth * 15) % 60; 

    // Desenhamos os anéis de trás pra frente
    const numRings = 20;
    
    for (let i = 0; i < numRings; i++) {
      // O raio aumenta exponencialmente para simular a perspectiva 3D
      const t = i / numRings;
      const radius = maxRadius * Math.pow(t, 1.5);

      // O anel se move para baixo conforme você sobe
      const ringY = cy + radius + scroll;

      // Só desenha se estiver na tela
      if (ringY > h + maxRadius) continue;

      const numBricks = Math.floor(12 + t * 30); // Mais tijolos nos anéis maiores
      
      // Cor baseada na profundidade (mais longe = mais escuro)
      const darkness = Math.min(1, Math.max(0.1, t * 1.2));
      
      // Desenha os tijolos do anel
      for (let j = 0; j < numBricks; j++) {
        const angle = (j / numBricks) * Math.PI * 2;
        
        // Tamanho do tijolo baseado no anel
        const brickW = (Math.PI * 2 * radius) / numBricks * 0.9;
        const brickH = 15 + t * 20;

        const bx = cx + Math.cos(angle) * radius;
        const by = ringY + Math.sin(angle) * radius * 0.6; // 0.6 achata a elipse (perspectiva)

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle + Math.PI / 2);

        // Cor do tijolo (pedra escura)
        const r = Math.floor(50 * darkness);
        const g = Math.floor(45 * darkness);
        const b = Math.floor(40 * darkness);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Desenha o tijolo como um arco
        ctx.beginPath();
        ctx.rect(-brickW / 2, -brickH / 2, brickW, brickH);
        ctx.fill();

        // Contorno para dar textura
        ctx.strokeStyle = `rgba(10, 10, 10, ${darkness})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
    }

    // No centro do túnel, a escuridão ou a luz
    if (p.look === 'up') {
      // Luz do topo
      const topLight = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.5);
      topLight.addColorStop(0, 'rgba(180, 200, 220, 0.8)');
      topLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topLight;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Escuridão no centro (fundo do poço)
      const abyss = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.6);
      abyss.addColorStop(0, 'rgba(0, 0, 0, 1)');
      abyss.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = abyss;
      ctx.fillRect(0, 0, w, h);
    }
  }
}