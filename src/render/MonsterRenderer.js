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

    const relativeDepth = m.depth - p.depth;
    
    // O monstro SÓ pode ser visto se você olhar pra baixo
    if (p.look !== 'down') return;
    if (relativeDepth > 300) return; // Longe demais, invisível na escuridão
    if (relativeDepth < -10) return; // Já te passou

    // O quão perto ele está (0 a 1)
    const prox = Math.max(0, 1 - (relativeDepth / 300));
    
    // Ele sai do centro da tela (onde é o fundo do poço quando você olha pra baixo)
    // O mesmo offsetY do WallRenderer
    const offsetY = -h * 0.3; 
    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // A criatura sobe do centro
    const monsterY = cy + (relativeDepth * 2);

    // O tamanho aumenta exponencialmente (ele engole a tela)
    const scale = 0.1 + Math.pow(prox, 3) * 12; 
    const shakeX = (Math.random() - 0.5) * 30 * prox;
    const shakeY = (Math.random() - 0.5) * 30 * prox;

    ctx.save();
    ctx.translate(cx + shakeX, monsterY + shakeY);
    ctx.scale(scale, scale);

    // Se ele estiver muito perto, a tela fica vermelha/preta
    const intensity = Math.min(1, prox * 1.5);
    ctx.fillStyle = `rgba(5, 2, 2, ${intensity})`;

    // --- CORPO E CABEÇA (Silhueta amorfa) ---
    ctx.beginPath();
    // Cabeça grande
    ctx.ellipse(0, 0, 150, 200, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corpo
    ctx.beginPath();
    ctx.moveTo(-150, 50);
    ctx.quadraticCurveTo(-250, 300, -100, 600);
    ctx.lineTo(100, 600);
    ctx.quadraticCurveTo(250, 300, 150, 50);
    ctx.fill();

    // --- TENTÁCULOS ---
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineCap = 'round';
    const time = game.state.time * 2;

    for (let i = 0; i < 6; i++) {
        ctx.lineWidth = 20 - i * 2;
        ctx.beginPath();
        const startX = -100 + (i * 40);
        // Tentáculos caóticos e longos
        ctx.moveTo(startX, 50);
        ctx.bezierCurveTo(
            startX + Math.sin(time + i)*50, 200, 
            startX + Math.cos(time + i)*80, 400, 
            startX + Math.sin(time * 2 + i)*60, 700
        );
        ctx.stroke();
    }

    // --- BRAÇOS ---
    // Braço esquerdo
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(-100, 150);
    ctx.quadraticCurveTo(-300, 200, -200, 400);
    ctx.stroke();

    // Braço direito
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.quadraticCurveTo(300, 200, 200, 400);
    ctx.stroke();

    // --- OLHOS ---
    if (prox > 0.2) {
        // Dois pontos brilhantes no escuro absoluto
        ctx.fillStyle = `rgba(255, 30, 0, ${prox})`;
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 40 * prox;
        
        ctx.beginPath();
        ctx.arc(-40, -50, 10, 0, Math.PI*2);
        ctx.arc(40, -50, 10, 0, Math.PI*2);
        ctx.fill();
        
        // Reseta a sombra para não afetar o resto
        ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}