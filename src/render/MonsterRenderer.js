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

    // Se o monstro estiver acima do jogador (já passou), não desenha embaixo
    const relativeDepth = m.depth - p.depth;
    
    let screenY = h / 2;
    // Se olhar pra frente, o monstro não é visto
    if (p.look === 'front') return; 
    
    // Se olhar pra baixo, a profundidade empurra ele pra baixo na tela
    if (p.look === 'down') {
      screenY = h / 2 + (relativeDepth * 2);
    } 
    // Se olhar pra cima, ele pode aparecer no fundo da tela
    else if (p.look === 'up') {
      screenY = h + (relativeDepth * 2); 
    }

    // Só desenha se estiver na tela
    if (screenY > h + 500 || screenY < -500) return;

    // Calcula a luz
    let intensity = game.lightSystem.getLightAtDepth(m.depth);
    // Se estiver muito perto, você vê a silhueta mesmo sem luz
    if (relativeDepth < 150) intensity = Math.max(intensity, 0.5);
    if (intensity < 0.05) return;

    // O tamanho aumenta conforme ele chega perto
    const scale = Math.max(0.5, 1 + (150 - Math.min(relativeDepth, 150)) / 100);
    const size = 300 * scale;

    ctx.save();
    ctx.translate(w/2, screenY);
    ctx.scale(scale, scale);

    // Corpo disforme
    ctx.fillStyle = `rgba(10, 5, 5, ${intensity})`;
    ctx.beginPath();
    // Desenha uma forma grotesca
    ctx.ellipse(0, 0, size/2, size, 0, 0, Math.PI*2);
    ctx.fill();

    // Braços compridos
    ctx.beginPath();
    ctx.ellipse(-size/3, -size/4, size/4, size/8, 0.5, 0, Math.PI*2);
    ctx.ellipse(size/3, -size/4, size/4, size/8, -0.5, 0, Math.PI*2);
    ctx.fill();

    // Olhos brilhantes
    ctx.fillStyle = `rgba(255, 20, 0, ${intensity * 1.5})`;
    ctx.beginPath();
    ctx.arc(-size/6, -size/3, size/12, 0, Math.PI*2);
    ctx.arc(size/6, -size/3, size/12, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }
}