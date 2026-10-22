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
    
    // O MONSTRO SÓ APARECE SE VOCÊ OLHAR PRA FRENTE!
    if (p.look !== 'front') return;
    
    // Se estiver muito longe no fundo do túnel, não dá pra ver
    if (relativeDepth > 200) return;
    if (relativeDepth < -10) return;

    // O quão perto ele está (0 a 1)
    const prox = Math.max(0, 1 - (relativeDepth / 200));
    
    // O ponto de fuga do túnel
    const cx = w / 2;
    const cy = h / 2;

    // O monstro sai do ponto de fuga e cresce
    const monsterY = cy + (relativeDepth * 1.5);
    
    // Escala: começa pequeno (longe) e fica gigante (perto)
    const scale = 0.1 + Math.pow(prox, 3) * 12; 
    
    // Tremor da tela (ele faz a terra tremer)
    const shakeX = (Math.random() - 0.5) * 20 * prox;
    const shakeY = (Math.random() - 0.5) * 20 * prox;

    ctx.save();
    ctx.translate(cx + shakeX, monsterY + shakeY);
    ctx.scale(scale, scale);

    // Cor (preto absoluto no fundo)
    const c = Math.floor(15 + prox * 10);
    ctx.fillStyle = `rgb(${c}, ${c - 5}, ${c})`;

    // --- CORPO DISFORME ---
    ctx.beginPath();
    ctx.ellipse(0, 100, 180, 300, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- CABEÇA INCLINADA ---
    ctx.beginPath();
    ctx.ellipse(0, -150, 100, 120, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // --- TENTÁCULOS PENDURADOS ---
    const t = game.state.time * 2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineCap = 'round';
    
    for (let i = -2; i <= 2; i++) {
      const wobble = Math.sin(t + i * 2) * 30;
      ctx.lineWidth = 15 - Math.abs(i) * 3;
      
      ctx.beginPath();
      ctx.moveTo(i * 30, -50);
      ctx.quadraticCurveTo(i * 50 + wobble, 50, i * 60 + wobble * 1.5, 200);
      ctx.stroke();
    }

    // --- GARRAS ---
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(-100, 50);
    ctx.quadraticCurveTo(-250, 100 + Math.sin(t)*20, -200, 300);
    ctx.stroke();
    
    ctx.lineWidth = 8;
    for(let i=0; i<3; i++){
        ctx.beginPath();
        ctx.moveTo(-200, 300);
        ctx.lineTo(-250 - i*20, 400);
        ctx.stroke();
    }

    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.quadraticCurveTo(250, 100 + Math.cos(t)*20, 200, 300);
    ctx.stroke();

    ctx.lineWidth = 8;
    for(let i=0; i<3; i++){
        ctx.beginPath();
        ctx.moveTo(200, 300);
        ctx.lineTo(250 + i*20, 400);
        ctx.stroke();
    }

    // --- OLHOS ---
    if (prox > 0.2) {
      const eyeIntensity = Math.min(1, (prox - 0.3) * 2);
      const glow = ctx.createRadialGradient(0, -170, 0, 0, -170, 100);
      glow.addColorStop(0, `rgba(255, 255, 255, ${eyeIntensity})`);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(-30, -170, 50, 0, Math.PI*2);
      ctx.arc(30, -170, 50, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-30, -170, 5, 0, Math.PI*2);
      ctx.arc(30, -170, 5, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }
}