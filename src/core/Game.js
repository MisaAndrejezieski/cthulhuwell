// ============================================================
// CthulhuWell — Game
// Orquestrador central: estado global + ordem de update/render.
// Nesta etapa só existe o esqueleto. Entidades/sistemas entram
// na Etapa 4 (marcados com TODO).
// ============================================================

import { DEBUG_MONSTER_ENABLED, START_DEPTH } from '../config/constants.js';
import { Input } from './Input.js';
import { Loop } from './Loop.js';

export class Game {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.input = new Input();

    // ---------- Estado global ----------
    this.state = {
      depth: START_DEPTH,       // profundidade atual (metros)
      running: false,
      time: 0,                  // tempo total de jogo (s)
      monsterEnabled: DEBUG_MONSTER_ENABLED,
    };

    // ---------- Entidades (Etapa 4) ----------
    // this.player = new Player();
    // this.torches = [];        // tochas caídas no mundo
    // this.monster = new Monster();

    // ---------- Sistemas (Etapa 4) ----------
    // this.climbSystem = new ClimbSystem(this);
    // this.lookSystem  = new LookSystem(this);
    // this.torchSystem = new TorchSystem(this);

    this.loop = new Loop({
      update: (dt) => this.update(dt),
      render: (dt) => this.render(dt),
    });

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.state.running = true;
    this.loop.start();
  }

  stop() {
    this.state.running = false;
    this.loop.stop();
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.state.running) return;

    this.state.time += dt;

    // TODO Etapa 4:
    // this.lookSystem.update(dt);
    // this.climbSystem.update(dt);
    // this.torchSystem.update(dt);

    // Placeholder de teste: sobe com Espaço pra ver o HUD mudar
    if (this.input.isDown('Space')) {
      this.state.depth = Math.max(0, this.state.depth - 25 * dt);
    }

    // Limpa estado de input do frame
    this.input.endFrame();
  }

  /** @param {number} dt */
  render(dt) {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TODO Etapa 5: Renderer desenha parede, corda, tocha, monstro, HUD
    ctx.fillStyle = '#556';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `depth: ${this.state.depth.toFixed(1)}m — time: ${this.state.time.toFixed(1)}s`,
      canvas.width / 2,
      canvas.height / 2
    );

    this._updateHud();
  }

  _updateHud() {
    const depthEl = document.getElementById('hud-depth');
    if (depthEl) depthEl.textContent = `PROFUNDIDADE: ${Math.floor(this.state.depth)}m`;
  }
}