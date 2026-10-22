export class MonsterRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { ctx, game } = this.renderer;
    const m = game.monster;
    if (!m.active) return;

    const w = game.canvas.width;
    const h = game.canvas.height;
    const p = game.player;

    // A distância em metros entre você e o bicho
    const relativeDepth = m.depth - p.depth;
    
    // Se ele já passou de você (te pegou), a tela de morte assume.
    if (relativeDepth < -20) return;

    // O monstro só "existe" visualmente quando está a menos de 150 metros
    if (relativeDepth > 150) return;

    // A proximidade vai de 0 (longe) a 1 (colado em você)
    const prox = Math.max(0, 1 - (relativeDepth / 150));
    
    // Intensidade da luz (se você tem tocha, ele fica mais visível)
    let intensity = p.hasTorch ? 0.9 : 0.4; 
    if (game.lightSystem.getLightAtDepth(m.depth) > 0) intensity = 1.0; // Tocha caída ilumina

    // Define a posição do monstro na tela baseado no olhar
    let screenY = h / 2;
    if (p.look === 'down') {
      screenY = h / 2 + (relativeDepth * 4); // Ele tá embaixo, na escuridão
    } else if (p.look === 'front') {
      screenY = h * 0.5 + (relativeDepth * 2); // Ele sobe pela parede bem no meio
    } else if (p.look === 'up') {
      screenY = h * 1.5; // Se você olha pra cima, não vê o que tá embaixo
    }

    if (screenY > h + 400) return;

    // Tamanho escala agressivamente conforme ele se aproxima
    const scale = 0.2 + Math.pow(prox, 2) * 4; 
    const size = 250 * scale;

    // Tremor da tela (o monstro faz o ar vibrar)
    const shakeX = (Math.random() - 0.5) * 15 * prox;
    const shakeY = (Math.random() - 0.5) * 15 * prox;

    ctx.save();
    ctx.translate(w / 2 + shakeX, screenY + shakeY);
    ctx.scale(scale, scale);

    // --- CORPO PRINCIPAL ---
    ctx.fillStyle = `rgba(12, 6, 8, ${intensity})`;
    ctx.beginPath();
    // Corpo grotesco, meio esticado
    ctx.ellipse(0, 100, 200, 300, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- TENTÁCULOS ---
    ctx.fillStyle = `rgba(8, 4, 5, ${intensity})`;
    const t = game.state.time * 3; // Tempo para animar os tentáculos
    
    // Tentáculos ao redor da cabeça (tipo o Cthulhu clássico)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      // Tentáculos se contorcem com a animação
      const wobble = Math.sin(t + i) * 30;
      
      ctx.save();
      ctx.translate(Math.cos(angle) * 120, Math.sin(angle) * 120 + 50);
      ctx.rotate(angle + wobble * 0.01);
      
      // Desenha a forma do tentáculo
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(40 + wobble, -80, -20 + wobble, -200);
      ctx.quadraticCurveTo(20 + wobble, -80, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    // --- BRAÇOS GIGANTES ---
    // Braço esquerdo
    ctx.fillStyle = `rgba(5, 2, 3, ${intensity})`;
    ctx.beginPath();
    ctx.ellipse(-200, 150 + Math.sin(t) * 20, 80, 250, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Garras do braço esquerdo
    for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(-250 - i*10, 200);
        ctx.lineTo(-300 - i*20, 350 + Math.sin(t+i)*30);
        ctx.lineTo(-240 - i*10, 250);
        ctx.fill();
    }

    // Braço direito
    ctx.beginPath();
    ctx.ellipse(200, 150 + Math.cos(t) * 20, 80, 250, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Garras do braço direito
    for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(250 + i*10, 200);
        ctx.lineTo(300 + i*20, 350 + Math.cos(t+i)*30);
        ctx.lineTo(240 + i*10, 250);
        ctx.fill();
    }

    // --- OLHOS (O Pior Pesadelo) ---
    // Brilho ao redor dos olhos
    const eyeGlow = ctx.createRadialGradient(-60, -100, 0, -60, -100, 100);
    eyeGlow.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
    eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = eyeGlow;
    ctx.fillRect(-160, -200, 200, 200);
    
    const eyeGlow2 = ctx.createRadialGradient(60, -100, 0, 60, -100, 100);
    eyeGlow2.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
    eyeGlow2.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = eyeGlow2;
    ctx.fillRect(40, -200, 200, 200);

    // Pupilas vermelhas e malignas
    ctx.fillStyle = `rgba(255, 20, 0, ${intensity + 0.2})`;
    ctx.beginPath();
    // Olho esquerdo (levemente inclinado pra parecer raivoso)
    ctx.ellipse(-60, -100, 25, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Olho direito
    ctx.beginPath();
    ctx.ellipse(60, -100, 25, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Fenda no meio da pupila (olho de réptil)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(-60, -100, 5, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(60, -100, 5, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}