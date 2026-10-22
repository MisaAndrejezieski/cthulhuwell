import { Monster } from '../entities/Monster.js';
import { Player } from '../entities/Player.js';
import { Renderer } from '../render/Renderer.js';
import { ClimbSystem } from '../systems/ClimbSystem.js';
import { LightSystem } from '../systems/LightSystem.js';
import { LookSystem } from '../systems/LookSystem.js';
import { TorchSystem } from '../systems/TorchSystem.js';
import { playRoar } from '../utils/audio.js';
import { Input } from './Input.js';
import { Loop } from './Loop.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();

    this.state = { running: false, time: 0, won: false };
    this.player = new Player();
    this.torches = [];
    this.monster = new Monster();

    this.lookSystem = new LookSystem(this);
    this.climbSystem = new ClimbSystem(this);
    this.torchSystem = new TorchSystem(this);
    this.lightSystem = new LightSystem(this);
    
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
    if (this.state.won) return;
    this.state.won = true;
    this.state.running = false;
  }

  update(dt) {
    if (!this.state.running) return;
    this.state.time += dt;

    if (this.input.justPressed('KeyM')) {
      this.monster.active = !this.monster.active;
      if (this.monster.active) playRoar();
    }

    this.lookSystem.update();
    this.climbSystem.update(dt);
    this.torchSystem.update(dt);
    this.monster.update(dt);

    // Verifica se o monstro pegou o jogador
    if (this.monster.active && this.monster.depth <= this.player.depth + 5) {
      this.state.running = false;
      console.log("VOCÊ MORREU");
    }

    this.input.endFrame();
  }

  render() {
    this.renderer.render();
  }
}