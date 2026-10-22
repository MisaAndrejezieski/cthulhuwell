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
    
    // Só aparece se você olhar pra baixo
    if (p.look !== 'down') return;

    // Se estiver longe demais, não vê
    if (relativeDepth > 250) return;

    // Proximidade: 0 (longe) a 1 (te pegando)
    const prox = Math.max(0, 1 - (relativeDepth / 250));
    
    // Posição no centro do túnel, subindo de baixo
    const offsetY = -h * 0.4; // O mesmo offset do WallRenderer para alinhar
    const cy = h / 2 + offsetY;

    // A criatura sai do centro escuro do túnel
    const monsterY = cy + (relativeDepth * 4) + (prox * 100);
    if (monsterY > h + 500) return;

    // Tamanho gigantesco
    const scale = 0.2 + Math.pow(prox, 3) * 8;

    // Efeito de tremor
    const shakeX = (Math.random() - 0.5) * 25 * prox;
    const shakeY = (Math.random() - 0.5) * 25 * prox;

    ctx.save();
    ctx.translate(w / 2 + shakeX, monsterY + shakeY);
    ctx.scale(scale, scale);

    // A cor é quase preto absoluto, mas com um leve tom arroxeado
    const c = Math.floor(15 + prox * 20); // Fica mais nítido quando perto
    ctx.fillStyle = `rgb(${c}, ${c - 5}, ${c})`;

    // --- CORPO DISFORME ---
    ctx.beginPath();
    ctx.ellipse(0, 100, 180, 300, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- CABEÇA INCLINADA (como na referência 6) ---
    ctx.beginPath();
    ctx.ellipse(0, -150, 100, 120, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // --- TENTÁCULOS PENDURADOS ---
    const t = game.state.time * 2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineCap = 'round';
    
    for (let i = -2; i <= 2; i++) {
      const wobble = Math.sin(t + i * 2) * 30;
      ctx.lineWidth = 15 - Math.abs(i) * 3; // Mais grossos no centro
      
      ctx.beginPath();
      ctx.moveTo(i * 30, -50);
      // Curva caótica descendo
      ctx.quadraticCurveTo(i * 50 + wobble, 50, i * 60 + wobble * 1.5, 200);
      ctx.stroke();
    }

    // --- GARRAS ---
    // Braço esquerdo
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(-100, 50);
    ctx.quadraticCurveTo(-250, 100 + Math.sin(t)*20, -200, 300);
    ctx.stroke();
    
    // Dedos/Garras
    ctx.lineWidth = 8;
    for(let i=0; i<3; i++){
        ctx.beginPath();
        ctx.moveTo(-200, 300);
        ctx.lineTo(-250 - i*20, 400);
        ctx.stroke();
    }

    // Braço direito
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.quadraticCurveTo(250, 100 + Math.cos(t)*20, 200, 300);
    ctx.stroke();

    // Dedos/Garras
    ctx.lineWidth = 8;
    for(let i=0; i<3; i++){
        ctx.beginPath();
        ctx.moveTo(200, 300);
        ctx.lineTo(250 + i*20, 400);
        ctx.stroke();
    }

    // --- OLHOS (Só dois pontos brilhantes no escuro) ---
    // O contraste é o que dá o susto
    if (prox > 0.3) {
      const eyeIntensity = Math.min(1, (prox - 0.3) * 2);
      const glow = ctx.createRadialGradient(0, -170, 0, 0, -170, 100);
      glow.addColorStop(0, `rgba(255, 255, 255, ${eyeIntensity})`);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(-30, -170, 50, 0, Math.PI*2);
      ctx.arc(30, -170, 50, 0, Math.PI*2);
      ctx.fill();

      // As pupilas em si
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-30, -170, 5, 0, Math.PI*2);
      ctx.arc(30, -170, 5, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }
}