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
    if (relativeDepth < 0) return;

    // Só desenha se a luz permitir (perto da tocha caída ou muito perto do jogador)
    let intensity = game.lightSystem.getLightAtDepth(m.depth);
    if (relativeDepth < 100) intensity = 1; // Se estiver colado, você vê a silhueta

    if (intensity < 0.1) return;

    let screenY = h/2;
    if (p.look === 'down') {
      screenY += relativeDepth * 1.5;
    } else if (p.look === 'front') {
       return; // Monstro não é visto de frente
    } else {
      return; // Nem de cima
    }

    if (screenY > h) return;

    const size = Math.max(50, 300 - relativeDepth*0.5);

    ctx.fillStyle = `rgba(10, 5, 5, ${intensity})`;
    ctx.beginPath();
    ctx.ellipse(w/2, screenY, size, size*0.7, 0, 0, Math.PI*2);
    ctx.fill();

    // Olhos
    ctx.fillStyle = `rgba(255, 50, 0, ${intensity})`;
    ctx.beginPath();
    ctx.arc(w/2 - size*0.2, screenY - size*0.2, size*0.1, 0, Math.PI*2);
    ctx.arc(w/2 + size*0.2, screenY - size*0.2, size*0.1, 0, Math.PI*2);
    ctx.fill();
  }
}