export class HudRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render() {
    const { game } = this.renderer;
    const p = game.player;

    const set = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    set('hud-depth', `DISTÂNCIA DA PORTA: ${Math.floor(p.depth)}m`);
    
    const lookLabel = p.look === 'up' ? 'CIMA' : p.look === 'down' ? 'BAIXO' : 'FRENTE';
    set('hud-look', `OLHAR: ${lookLabel}`);
  }
}