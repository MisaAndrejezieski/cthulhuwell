export class WallRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // A câmera se move dependendo de onde você olha
    let offsetY = 0;
    if (p.look === 'up') offsetY = h * 0.3;
    if (p.look === 'down') offsetY = -h * 0.3;

    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // Fundo escuro (o abismo)
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Raio do túnel (metade da tela)
    const R = Math.max(w, h) * 0.6;

    // O movimento de subida (scroll).
    // Multiplicamos a profundidade por um fator para simular a velocidade da luz passando.
    const scroll = (p.depth * 10) % 40; 

    // Desenhamos os anéis do poço
    for (let y = -R; y < h + R; y += 40) {
      // Aplica o scroll para o anel parecer que desce
      const ringY = y + scroll;
      
      // Calcula a distância do anel ao centro da tela
      const distY = Math.abs(ringY - cy);
      
      // Se o anel estiver fora do túnel, não desenha
      if (distY > R * 1.5) continue;

      // A curvatura da parede (quanto mais perto do centro, mais apertado)
      const curve = Math.sqrt(Math.max(0, 1 - Math.pow(distY / R, 2)));
      
      // O raio horizontal do anel naquela altura
      const rx = R * curve;
      const ry = R * 0.2 * curve; // Achatado para dar perspectiva 3D

      // A cor da pedra: mais escura nas bordas, mais clara no centro (se tiver luz)
      const lightIntensity = Math.pow(curve, 2) * 0.8;
      
      ctx.strokeStyle = `rgba(60, 55, 50, ${lightIntensity})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.ellipse(cx, ringY, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Desenha as pedras texturizadas nas laterais (onde a parede encosta na tela)
      if (distY < h * 0.8) {
        for (let i = -6; i <= 6; i++) {
            const angle = (i / 6) * Math.PI;
            const bx = cx + Math.cos(angle) * rx;
            const by = ringY + Math.sin(angle) * ry;
            
            // Desenha blocos de pedra nas beiradas
            ctx.fillStyle = `rgba(30, 25, 20, ${lightIntensity * 1.5})`;
            ctx.fillRect(bx - 20, by - 10, 40, 20);
            
            // Linha escura entre as pedras
            ctx.strokeStyle = `rgba(0, 0, 0, ${lightIntensity})`;
            ctx.strokeRect(bx - 20, by - 10, 40, 20);
        }
      }
    }

    // Luz do topo ou escuridão no fundo
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    if (p.look === 'up') {
      grad.addColorStop(0, 'rgba(200, 220, 255, 0.9)'); // Luz do sol
      grad.addColorStop(0.5, 'rgba(100, 120, 150, 0.4)');
    } else if (p.look === 'down') {
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Abismo absoluto
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
    } else {
      grad.addColorStop(0, 'rgba(10, 10, 15, 0.9)'); // Frente: penumbra
      grad.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Vinheta escura para esconder as bordas do canvas
    const vignette = ctx.createRadialGradient(cx, cy, R*0.6, cx, cy, Math.max(w,h));
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}