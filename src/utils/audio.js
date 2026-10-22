// ============================================================
// CthulhuWell — Áudio procedural (Web Audio API)
// Gera todos os sons em tempo real. Zero arquivos externos.
// ============================================================

import { AUDIO_DRONE_FREQ, AUDIO_NOISE_VOLUME } from '../config/constants.js';

/** @type {AudioContext|null} */
let ctx = null;
let drone = null;
let noise = null;

/**
 * Inicializa o contexto de áudio. Deve ser chamado após um gesto
 * do usuário (ex: clique), por política dos navegadores.
 */
export function initAudio() {
  if (ctx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return; // navegador sem suporte
  ctx = new AudioCtx();

  // --- Drone grave de fundo ---
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = AUDIO_DRONE_FREQ;

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.06;

  osc.connect(droneGain).connect(ctx.destination);
  osc.start();
  drone = osc;

  // --- Ruído de vento (loop) ---
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buffer;
  noiseSrc.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = AUDIO_NOISE_VOLUME;

  noiseSrc.connect(filter).connect(noiseGain).connect(ctx.destination);
  noiseSrc.start();
  noise = noiseSrc;
}

/** Toca um "clique" curto ao pegar tocha. */
export function playTorchPick() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 220;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

/** Toca um "whoosh" descendente ao largar a tocha. */
export function playTorchDrop() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 1.2);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.3);
}

/** Toca um rugido grave (debug do monstro). */
export function playRoar() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 55;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.28, t + 0.2);
  g.gain.exponentialRampToValueAtTime(0.001, t + 2);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  osc.connect(filter).connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 2.1);
}

/** Para tudo (usado no shutdown). */
export function stopAudio() {
  if (drone) { try { drone.stop(); } catch {} drone = null; }
  if (noise) { try { noise.stop(); } catch {} noise = null; }
  if (ctx) { try { ctx.close(); } catch {} ctx = null; }
}