// ============================================================
// CthulhuWell — Constantes do Corredor (Nova Versão)
// ============================================================

// Dimensões do corredor
export const TUNNEL_LENGTH = 1000; // metros até a porta
export const START_POSITION = 1000; // você começa no fundo

// Velocidades
export const PLAYER_SPEED = 8;      // Velocidade de corrida (segurando Shift)
export const PLAYER_WALK_SPEED = 4; // Velocidade normal
export const MONSTER_START_OFFSET = 250; // O espectro começa 250m atrás de você
export const MONSTER_SPEED = 7;     // O espectro é um pouco mais lento, mas implacável

// Olhar
export const LOOK = {
  UP: 'up',
  FRONT: 'front',
  DOWN: 'down',
};

// Iluminação
export const PLAYER_LIGHT_RADIUS = 400;