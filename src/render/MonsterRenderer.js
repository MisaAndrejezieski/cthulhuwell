// ============================================================
// CthulhuWell — MonsterRenderer (O Espectro)
// ============================================================

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
    
    // Só vê se estiver olhando pra frente
    if (p.look !== 'front') return;
    
    // Se estiver muito longe, não vemos
    if (relativeDepth > 250) return;
    if (relativeDepth < -10) return;

    // Proximidade (0 = longe, 1 = te pegando)
    const prox = Math.max(0, 1 - (relativeDepth / 250));
    
    const cx = w / 2;
    const cy = h / 2;

    // O monstro vem do ponto de fuga
    const monsterY = cy + (relativeDepth * 0.5);
    const scale = 0.2 + Math.pow(prox, 2.5) * 8; 

    // Tremor
    const shakeX = (Math.random() - 0.5) * 15 * prox;
    const shakeY = (Math.random() - 0.5) * 15 * prox;

    ctx.save();
    ctx.translate(cx + shakeX, monsterY + shakeY);
    ctx.scale(scale, scale);

    // Corpo (Silhueta negra)
    ctx.fillStyle = `rgba(5, 0, 0, ${Math.max(0.8, prox)})`;
    
    // Tronco fino e alongado
    ctx.beginPath();
    ctx.ellipse(0, 150, 60, 200, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.beginPath();
    ctx.ellipse(0, -50, 50, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Braços longos (garras)
    ctx.lineCap = 'round';
    ctx.strokeStyle = ctx.fillStyle;
    
    // Braço esquerdo
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(-50, -10);
    ctx.quadraticCurveTo(-150, 100, -120, 350);
    ctx.stroke();
    
    // Braço direito
    ctx.beginPath();
    ctx.moveTo(50, -10);
    ctx.quadraticCurveTo(150, 100, 120, 350);
    ctx.stroke();

    // Pernas longas
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(-30, 300);
    ctx.lineTo(-50, 500);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(30, 300);
    ctx.lineTo(50, 500);
    ctx.stroke();

    // Olhos Vermelhos Brilhantes
    if (prox > 0.1) {
        ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(1, prox * 2)})`;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 30 * prox;
        
        // Olhos afiados
        ctx.beginPath();
        ctx.moveTo(-25, -60);
        ctx.quadraticCurveTo(-10, -70, -10, -50);
        ctx.quadraticCurveTo(-25, -45, -25, -60);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(25, -60);
        ctx.quadraticCurveTo(10, -70, 10, -50);
        ctx.quadraticCurveTo(25, -45, 25, -60);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}