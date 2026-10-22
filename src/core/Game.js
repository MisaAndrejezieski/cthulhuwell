// ============================================================
// CthulhuWell — Game (Orquestrador do Corredor)
// ============================================================

import { Monster } from '../entities/Monster.js';
import { Player } from '../entities/Player.js';
import { Renderer } from '../render/Renderer.js';
import { ClimbSystem } from '../systems/ClimbSystem.js';
import { LookSystem } from '../systems/LookSystem.js';
import { Input } from './Input.js';
import { Loop } from './Loop.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();

    this.state = { running: false, time: 0, won: false, dead: false };
    
    this.player = new Player();
    this.monster = new Monster();

    this.lookSystem = new LookSystem(this);
    // Usando o ClimbSystem como "RunSystem"
    this.climbSystem = new ClimbSystem(this);
    
    this.renderer = new Renderer(this);

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

  win() {
    if (this.state.won || this.state.dead) return;
    this.state.won = true;
    this.state.running = false;
  }

  update(dt) {
    if (!this.state.running) return;
    this.state.time += dt;

    this.lookSystem.update();
    this.climbSystem.update(dt);
    this.monster.update(dt);

    // Verifica se o monstro alcançou o jogador
    if (this.monster.active && this.monster.depth <= this.player.depth + 10) {
      this.state.running = false;
      this.state.dead = true;
    }

    this.input.endFrame();
  }

  render() {
    this.renderer.render();
  }
}