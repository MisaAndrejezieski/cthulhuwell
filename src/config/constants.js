export const WELL_HEIGHT = 1000;
export const START_DEPTH = 1000;
export const SURFACE_DEPTH = 0;

// Jogador sobe a 5 m/s. O monstro sobe a 6.5 m/s. Se você parar, morre.
export const CLIMB_SPEED = 5.0; 
export const CLIMB_BOOST_MULT = 1.0;

export const LOOK = {
  UP: 'up',
  FRONT: 'front',
  DOWN: 'down',
};

export const LOOK_TRANSITION_TIME = 0.15;
export const TORCH_LIGHT_RADIUS = 350;
export const TORCH_FALL_GRAVITY = 40;
export const TORCH_LIFE_AFTER_FALL = 60;

export const MONSTER_START_OFFSET = 180; // Começa 180m abaixo. Você tem uns 30 segundos de folga.

export const AUDIO_DRONE_FREQ = 40;
export const AUDIO_NOISE_VOLUME = 0.03;
export const DEBUG_MONSTER_ENABLED = true; // Deixei true caso você queira testar desativar no console