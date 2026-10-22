// ============================================================
// CthulhuWell — Player
// ============================================================

import { LOOK, START_POSITION } from '../config/constants.js';

export class Player {
  constructor() {
    this.depth = START_POSITION;   
    this.look = LOOK.FRONT;        
    this.bobbing = 0;              
  }

  hasEscaped() {
    return this.depth <= 0;
  }
}