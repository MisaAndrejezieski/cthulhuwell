// ============================================================
// CthulhuWell — Loop principal
// Encapsula requestAnimationFrame + delta time.
// ============================================================

/**
 * @typedef {Object} LoopCallbacks
 * @property {(dt: number) => void} update
 * @property {(dt: number) => void} render
 */

export class Loop {
  /** @param {LoopCallbacks} callbacks */
  constructor(callbacks) {
    this.update = callbacks.update;
    this.render = callbacks.render;

    this.running = false;
    this.lastTime = 0;
    this.maxDelta = 0.05; // trava em 50ms p/ não "pular" ao voltar de aba

    this._frame = this._frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
  }

  _frame(now) {
    if (!this.running) return;

    // dt em segundos, limitado por segurança
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > this.maxDelta) dt = this.maxDelta;

    this.update(dt);
    this.render(dt);

    requestAnimationFrame(this._frame);
  }
}