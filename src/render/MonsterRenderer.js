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
    
    // Se você não estiver olhando pro fundo do túnel, não vê ele
    if (p.look !== 'down') return;
    if (relativeDepth > 300) return;
    if (relativeDepth < -10) return;

    // O quão perto ele está (0 a 1)
    const prox = Math.max(0, 1 - (relativeDepth / 300));
    
    // Ponto de fuga do túnel
    const offsetY = -h * 0.3; 
    const cx = w / 2;
    const cy = h / 2 + offsetY;

    // A posição dele sobe do centro do túnel
    const monsterY = cy + (relativeDepth * 3);

    // Tamanho: ele começa minúsculo no fundo e vira um gigante
    const scale = 0.1 + Math.pow(prox, 4) * 15; 
    
    // Tremor na tela quando ele chega perto
    const shakeX = (Math.random() - 0.5) * 20 * prox;
    const shakeY = (Math.random() - 0.5) * 20 * prox;

    ctx.save();
    ctx.translate(cx + shakeX, monsterY + shakeY);
    ctx.scale(scale, scale);

    // A cor é quase preto absoluto
    const c = Math.floor(10 + prox * 15);
    ctx.fillStyle = `rgb(${c}, ${c - 2}, ${c})`;

    // --- CORPO DISFORME E CABEÇA (Silhueta que tapa o túnel) ---
    ctx.beginPath();
    // Cabeça grande e caída
    ctx.ellipse(0, 0, 200, 250, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ombros e tronco se alastrando
    ctx.beginPath();
    ctx.moveTo(-150, 50);
    ctx.quadraticCurveTo(-300, 300, -150, 600);
    ctx.lineTo(150, 600);
    ctx.quadraticCurveTo(300, 300, 150, 50);
    ctx.fill();

    // --- TENTÁCULOS PENDURADOS (Cara do Cthulhu) ---
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineCap = 'round';
    const time = game.state.time * 3;

    for (let i = 0; i < 7; i++) {
        ctx.lineWidth = 25 - i * 3;
        ctx.beginPath();
        const startX = -120 + (i * 40);
        // Tentáculos caóticos e longos
        ctx.moveTo(startX, 50);
        ctx.bezierCurveTo(
            startX + Math.sin(time + i)*60, 200, 
            startX + Math.cos(time + i)*100, 400, 
            startX + Math.sin(time * 2 + i)*80, 700
        );
        ctx.stroke();
    }

    // --- BRAÇOS ---
    // Braço esquerdo
    ctx.lineWidth = 50;
    ctx.beginPath();
    ctx.moveTo(-150, 150);
    ctx.quadraticCurveTo(-350, 200, -250, 450);
    ctx.stroke();

    // Braço direito
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.quadraticCurveTo(350, 200, 250, 450);
    ctx.stroke();

    // --- OLHOS (Brilho vermelho no escuro) ---
    if (prox > 0.2) {
        ctx.fillStyle = `rgba(255, 20, 0, ${prox})`;
        // Faz os olhos brilharem na escuridão
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 50 * prox;
        
        ctx.beginPath();
        ctx.arc(-60, -50, 15, 0, Math.PI*2);
        ctx.arc(60, -50, 15, 0, Math.PI*2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reseta a sombra
    }

    ctx.restore();
  }
}