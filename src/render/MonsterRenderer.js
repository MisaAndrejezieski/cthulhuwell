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

    // Distância real em metros
    const relativeDepth = m.depth - p.depth;
    
    // Se ele está muito longe (fundo do poço), não dá pra ver.
    if (relativeDepth > 200) return;
    // Se ele já passou de você (te pegou), a tela de morte assume.
    if (relativeDepth < -10) return;

    // Você SÓ vê o monstro se olhar pra baixo.
    if (p.look !== 'down') return;

    // Proximidade: 0 (longe) a 1 (colado).
    const prox = Math.max(0, 1 - (relativeDepth / 200));
    
    // Luz: se você tem tocha, vê melhor.
    let intensity = p.hasTorch ? 0.9 : 0.4; 
    if (game.lightSystem.getLightAtDepth(m.depth) > 0) intensity = 1.0;

    // Posição Y na tela (ele surge de baixo)
    const screenY = h * 0.5 + (relativeDepth * 3); 
    if (screenY > h + 800) return;

    // O monstro fica ENORME conforme chega perto
    const scale = 0.3 + Math.pow(prox, 2) * 6; 
    
    // Tremor da tela (ele faz o ar vibrar quando perto)
    const shakeX = (Math.random() - 0.5) * 20 * prox;
    const shakeY = (Math.random() - 0.5) * 20 * prox;

    ctx.save();
    ctx.translate(w / 2 + shakeX, screenY + shakeY);
    ctx.scale(scale, scale);

    // --- CABEÇA GIGANTE DO CTHULHU ---
    ctx.fillStyle = `rgba(20, 15, 18, ${intensity})`;
    
    // Crânio
    ctx.beginPath();
    ctx.ellipse(0, 0, 200, 250, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- TENTÁCULOS NA CARA (O clássico do Lovecraft) ---
    ctx.fillStyle = `rgba(15, 10, 12, ${intensity})`;
    const t = game.state.time * 4; // Tempo para a animação dos tentáculos
    
    // Desenha 6 tentáculos saindo da parte de baixo da cara
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Pula o centro para os olhos
      
      const angle = i * 0.2;
      const wobble = Math.sin(t + i) * 40; // Eles se contorcem

      ctx.save();
      // Move para a base dos tentáculos (parte de baixo da cara)
      ctx.translate(i * 50, 150); 
      
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      // Control point (faz a curva) e End point (a ponta)
      ctx.quadraticCurveTo(-30 + wobble, 150, -10 + wobble * 2, 300);
      ctx.quadraticCurveTo(10 + wobble, 150, 25, 0);
      ctx.fill();
      ctx.restore();
    }

    // --- OLHOS (O Pior Pesadelo) ---
    // Brilho ao redor dos olhos
    const eyeGlow = ctx.createRadialGradient(0, -50, 0, 0, -50, 150);
    eyeGlow.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
    eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = eyeGlow;
    ctx.fillRect(-200, -200, 400, 300);

    // Globo ocular esquerdo
    ctx.fillStyle = `rgba(255, 230, 0, ${intensity})`; // Amarelo doentio
    ctx.beginPath();
    ctx.ellipse(-60, -50, 40, 25, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Globo ocular direito
    ctx.beginPath();
    ctx.ellipse(60, -50, 40, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas fendidas (olho de réptil)
    ctx.fillStyle = `rgba(0, 0, 0, 1)`;
    ctx.beginPath();
    ctx.ellipse(-60, -50, 8, 25, 0.2, 0, Math.PI * 2);
    ctx.ellipse(60, -50, 8, 25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}