// ============================================================
// CthulhuWell — Input
// Traduz eventos do teclado em estado consultável pelos sistemas.
// ============================================================

export class Input {
  constructor(target = window) {
    /** @type {Set<string>} teclas atualmente pressionadas */
    this.pressed = new Set();

    /** @type {Set<string>} teclas que foram pressionadas neste frame */
    this.justPressedSet = new Set();

    /** @type {Set<string>} teclas que foram soltas neste frame */
    this.justReleasedSet = new Set();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
  }

  /** @param {KeyboardEvent} e */
  _onKeyDown(e) {
    // impede scroll com setas/espaço
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    if (!this.pressed.has(e.code)) {
      this.justPressedSet.add(e.code);
    }
    this.pressed.add(e.code);
  }

  /** @param {KeyboardEvent} e */
  _onKeyUp(e) {
    this.pressed.delete(e.code);
    this.justReleasedSet.add(e.code);
  }

  /** @param {string} code @returns {boolean} */
  isDown(code) { return this.pressed.has(code); }

  /** @param {string} code @returns {boolean} */
  justPressed(code) { return this.justPressedSet.has(code); }

  /** @param {string} code @returns {boolean} */
  justReleased(code) { return this.justReleasedSet.has(code); }

  /** Chamado no fim de cada frame pelo Game. */
  endFrame() {
    this.justPressedSet.clear();
    this.justReleasedSet.clear();
  }

  destroy(target = window) {
    target.removeEventListener('keydown', this._onKeyDown);
    target.removeEventListener('keyup', this._onKeyUp);
  }
}