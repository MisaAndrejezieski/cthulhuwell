// ============================================================
// CthulhuWell — Constantes globais
// Todos os "números mágicos" do jogo vivem aqui.
// Ajustar gameplay = ajustar este arquivo.
// ============================================================

// ---------- Mundo ----------
export const WELL_HEIGHT = 1000;          // profundidade total do poço (metros)
export const START_DEPTH = 1000;          // jogador começa no fundo
export const SURFACE_DEPTH = 0;           // topo = luz

// ---------- Escalada ----------
export const CLIMB_SPEED = 25;            // metros por segundo escalando
export const CLIMB_BOOST_MULT = 1.0;      // multiplicador (reservado p/ futuro)

// ---------- Olhar ----------
// Estados possíveis do olhar.
export const LOOK = {
  UP: 'up',
  FRONT: 'front',
  DOWN: 'down',
};

// Transição de olhar (quanto tempo leva pra mudar de estado).
export const LOOK_TRANSITION_TIME = 0.15; // segundos

// ---------- Tocha ----------
export const TORCH_LIGHT_RADIUS = 260;    // px — raio de luz da tocha na mão
export const TORCH_FALL_GRAVITY = 90;     // aceleração da tocha caindo
export const TORCH_LIFE_AFTER_FALL = 60;  // segundos que a tocha queimando no fundo dura

// ---------- Monstro ----------
export const MONSTER_BASE_SPEED = 1.5;    // velocidade base (debug)
export const MONSTER_START_OFFSET = 300;  // metros abaixo do jogador ao iniciar

// ---------- Áudio ----------
export const AUDIO_DRONE_FREQ = 40;       // Hz — drone grave de fundo
export const AUDIO_NOISE_VOLUME = 0.03;   // ruído de vento

// ---------- Debug ----------
export const DEBUG_MONSTER_ENABLED = false; // tecla M liga/desliga