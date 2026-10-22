// ==========================================
// CTHULHUWELL - MOTOR DE RENDERIZAÇÃO E LÓGICA
// ==========================================

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// Elementos da UI
const ui = document.getElementById('ui');
const distEl = document.getElementById('dist');
const statusEl = document.getElementById('status');
const staminaEl = document.getElementById('stamina');
const staminaLabel = document.getElementById('stamina-label');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-button');
const screenTitle = document.getElementById('screen-title');
const screenSubtitle = document.getElementById('screen-subtitle');
const screenStory = document.getElementById('screen-story');

// Configurações Globais
const SETTINGS = {
  totalDistance: 1000, // Distância até a porta em metros
  playerSpeed: 4,      // Velocidade de caminhada (m/s)
  sprintSpeed: 8,      // Velocidade de corrida (m/s)
  monsterBaseSpeed: 2.5, // Velocidade base do monstro
  monsterRampUp: 0.5,  // O quanto o monstro acelera conforme você demora
  fov: 90,             // Campo de visão
  renderDist: 100,     // Distância máxima de renderização
  corridorWidth: 6,    // Largura do corredor em unidades de mundo
  wallHeight: 4        // Altura da parede
};

// Estado do Jogo
const game = {
  active: false,
  paused: false,
  lookingBack: false,
  time: 0,
  lastTime: 0,
  
  player: {
    distance: 0,       // Quão longe ele andou no corredor
    stamina: 100,
    bob: 0,
    speed: 0
  },
  
  monster: {
    distance: -20,     // Começa 20 metros atrás do jogador
    speed: 0
  },
  
  audioCtx: null,
  heartbeatTimer: 0
};

// ==========================================
// ÁUDIO PROCEDURAL (Web Audio API)
// ==========================================
function initAudio() {
  if (!game.audioCtx) {
    game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playHeartbeat(volume) {
  if (!game.audioCtx || volume <= 0) return;
  const osc = game.audioCtx.createOscillator();
  const gain = game.audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, game.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, game.audioCtx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(volume, game.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, game.audioCtx.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(game.audioCtx.destination);
  
  osc.start();
  osc.stop(game.audioCtx.currentTime + 0.2);
}

// ==========================================
// INPUT E CONTROLES
// ==========================================
const keys = { w: false, s: false, shift: false };

window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.w = true;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.s = true;
  if (e.key === 'Shift') keys.shift = true;
  if (e.key === 'Escape' && game.active) togglePause();
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.w = false;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.s = false;
  if (e.key === 'Shift') keys.shift = false;
});

function togglePause() {
  game.paused = !game.paused;
  if (game.paused) {
    overlay.classList.remove('hidden');
    screenTitle.innerText = "PAUSADO";
    screenSubtitle.innerText = "Respire fundo.";
    screenStory.innerText = "Pressione ENTER para continuar correndo.";
    startBtn.innerText = "Continuar";
  } else {
    overlay.classList.add('hidden');
    game.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

startBtn.addEventListener('click', () => {
  if (game.paused) {
    togglePause();
  } else {
    startGame();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && game.paused) togglePause();
});

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================
function startGame() {
  initAudio();
  overlay.classList.add('hidden');
  ui.classList.remove('hidden');
  
  game.active = true;
  game.paused = false;
  game.time = 0;
  game.lastTime = performance.now();
  
  game.player.distance = 0;
  game.player.stamina = 100;
  game.monster.distance = -15; // Começa atrás
  
  updateUI();
  requestAnimationFrame(loop);
}

function update(dt) {
  game.time += dt;
  
  // Movimento do Jogador
  let targetSpeed = 0;
  if (keys.w && !game.lookingBack) {
    if (keys.shift && game.player.stamina > 0) {
      targetSpeed = SETTINGS.sprintSpeed;
      game.player.stamina = Math.max(0, game.player.stamina - 25 * dt);
    } else {
      targetSpeed = SETTINGS.playerSpeed;
    }
  }
  
  // Recuperação de Fôlego
  if (targetSpeed <= SETTINGS.playerSpeed) {
    game.player.stamina = Math.min(100, game.player.stamina + 15 * dt);
  }
  
  // Aceleração suave
  game.player.speed += (targetSpeed - game.player.speed) * 10 * dt;
  game.player.distance += game.player.speed * dt;
  
  // Animação de balanço (Head Bob)
  if (game.player.speed > 0.1) {
    game.player.bob += game.player.speed * dt * 2;
  }
  
  // Olhar para trás
  game.lookingBack = keys.s;
  
  // Lógica do Monstro
  if (!game.lookingBack) {
    // O monstro fica mais rápido quanto mais tempo passa e mais longe o jogador vai
    const difficulty = 1 + (game.player.distance / SETTINGS.totalDistance) * 2;
    game.monster.speed = SETTINGS.monsterBaseSpeed * difficulty;
    game.monster.distance += game.monster.speed * dt;
  } else {
    // Se olhar para trás, o monstro congela (mecânica de "não piscar")
    game.monster.speed = 0;
  }
  
  // Verificação de Fim de Jogo
  if (game.player.distance >= SETTINGS.totalDistance) {
    endGame(true);
  } else if (game.monster.distance >= game.player.distance) {
    endGame(false);
  }
  
  // Áudio de Batimento Cardíaco
  const distToMonster = game.player.distance - game.monster.distance;
  if (distToMonster < 20) {
    game.heartbeatTimer -= dt;
    if (game.heartbeatTimer <= 0) {
      const vol = Math.max(0, 1 - (distToMonster / 20)) * 0.5;
      playHeartbeat(vol);
      // Batimentos mais rápidos quando perto
      game.heartbeatTimer = Math.max(0.2, distToMonster / 15);
    }
  }
  
  updateUI();
}

function updateUI() {
  const distToDoor = Math.max(0, Math.ceil(SETTINGS.totalDistance - game.player.distance));
  distEl.innerText = `${distToDoor} m`;
  
  const staminaPct = Math.floor(game.player.stamina);
  staminaEl.style.width = `${staminaPct}%`;
  staminaLabel.innerText = `${staminaPct}%`;
  
  const distToMonster = game.player.distance - game.monster.distance;
  if (distToMonster < 10) {
    statusEl.innerText = "MUITO PERTO";
    statusEl.classList.add('danger');
  } else if (distToMonster < 30) {
    statusEl.innerText = "OUVINDO PASSOS";
    statusEl.classList.add('danger');
  } else {
    statusEl.innerText = "SILÊNCIO";
    statusEl.classList.remove('danger');
  }
}

// ==========================================
// RENDERIZAÇÃO (Perspectiva e Profundidade)
// ==========================================
function draw() {
  const w = canvas.width;
  const h = canvas.height;
  
  // Limpa a tela
  ctx.fillStyle = '#080706';
  ctx.fillRect(0, 0, w, h);
  
  // Ponto de Fuga (Horizonte)
  const horizon = h * 0.45;
  
  // Efeito de Head Bob (Câmera balançando)
  const bobY = Math.sin(game.player.bob) * 5;
  const bobX = Math.cos(game.player.bob * 0.5) * 3;
  
  ctx.save();
  ctx.translate(bobX, bobY);
  
  // Renderiza o Corredor
  drawCorridor(w, h, horizon);
  
  // Renderiza a Porta (Frente) ou o Monstro (Trás)
  if (game.lookingBack) {
    drawMonster(w, h, horizon);
  } else {
    drawDoor(w, h, horizon);
  }
  
  // Efeito de Vinheta (Escurecimento nas bordas)
  drawVignette(w, h);
  
  ctx.restore();
}

function drawCorridor(w, h, horizon) {
  // Chão
  const floorGrad = ctx.createLinearGradient(0, horizon, 0, h);
  floorGrad.addColorStop(0, '#1a1512');
  floorGrad.addColorStop(1, '#080706');
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.lineTo(w * 0.65, horizon);
  ctx.lineTo(w * 0.35, horizon);
  ctx.fill();
  
  // Teto
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizon);
  ceilGrad.addColorStop(0, '#0a0908');
  ceilGrad.addColorStop(1, '#1a1512');
  ctx.fillStyle = ceilGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w * 0.65, horizon);
  ctx.lineTo(w * 0.35, horizon);
  ctx.fill();
  
  // Paredes Laterais (Perspectiva)
  // Parede Esquerda
  const leftWallGrad = ctx.createLinearGradient(0, 0, w * 0.35, horizon);
  leftWallGrad.addColorStop(0, '#2a201a');
  leftWallGrad.addColorStop(1, '#110d0a');
  ctx.fillStyle = leftWallGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.35, horizon);
  ctx.lineTo(w * 0.35, h);
  ctx.lineTo(0, h);
  ctx.fill();
  
  // Parede Direita
  const rightWallGrad = ctx.createLinearGradient(w, 0, w * 0.65, horizon);
  rightWallGrad.addColorStop(0, '#2a201a');
  rightWallGrad.addColorStop(1, '#110d0a');
  ctx.fillStyle = rightWallGrad;
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w * 0.65, horizon);
  ctx.lineTo(w * 0.65, h);
  ctx.lineTo(w, h);
  ctx.fill();
  
  // Linhas de Perspectiva nas Paredes (Textura Simples)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    // Linhas horizontais esquerdas
    ctx.beginPath();
    ctx.moveTo(0, h * t);
    ctx.lineTo(w * 0.35, horizon + (h - horizon) * t * 0.2);
    ctx.stroke();
    
    // Linhas horizontais direitas
    ctx.beginPath();
    ctx.moveTo(w, h * t);
    ctx.lineTo(w * 0.65, horizon + (h - horizon) * t * 0.2);
    ctx.stroke();
  }
}

function drawDoor(w, h, horizon) {
  // Cálculo de perspectiva para a porta
  // A porta fica longe. Quanto mais perto (distance -> total), maior ela fica.
  const progress = game.player.distance / SETTINGS.totalDistance;
  const scale = 0.1 + (progress * 0.9); // Escala de 10% a 100%
  
  const doorW = w * 0.15 * scale;
  const doorH = h * 0.3 * scale;
  
  const centerX = w / 2;
  const doorY = horizon + (h * 0.4 * scale) - doorH; // Base da porta no chão
  
  // Brilho da porta (Luz vindo de baixo)
  const glow = ctx.createRadialGradient(centerX, doorY + doorH, 0, centerX, doorY + doorH, doorW * 2);
  glow.addColorStop(0, 'rgba(167, 139, 118, 0.4)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(centerX - doorW * 2, doorY - doorH, doorW * 4, doorH * 3);
  
  // Desenha a Porta
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(centerX - doorW / 2, doorY, doorW, doorH);
  
  // Moldura da Porta
  ctx.strokeStyle = '#4a3b32';
  ctx.lineWidth = 2 + (scale * 4);
  ctx.strokeRect(centerX - doorW / 2, doorY, doorW, doorH);
  
  // Linha de luz sob a porta
  ctx.fillStyle = 'rgba(167, 139, 118, 0.6)';
  ctx.fillRect(centerX - doorW / 2, doorY + doorH - 2, doorW, 4);
}

function drawMonster(w, h, horizon) {
  const dist = game.player.distance - game.monster.distance;
  if (dist > 40) return; // Não desenha se estiver muito longe
  
  // Escala baseada na distância
  const scale = Math.max(0, 1 - (dist / 40));
  const size = h * 0.5 * scale;
  
  const centerX = w / 2;
  const centerY = horizon + (h * 0.2); // Um pouco abaixo do horizonte
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Corpo Sombrio
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeça
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Olhos Brilhantes
  const eyeGlow = ctx.createRadialGradient(0, -size * 0.5, 0, 0, -size * 0.5, size * 0.1);
  eyeGlow.addColorStop(0, 'rgba(255, 50, 50, 0.8)');
  eyeGlow.addColorStop(1, 'rgba(255, 50, 50, 0)');
  ctx.fillStyle = eyeGlow;
  ctx.fillRect(-size * 0.2, -size * 0.7, size * 0.4, size * 0.4);
  
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.5, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.5, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  
  // Tentáculos (Simples)
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = size * 0.05;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI - Math.PI / 2;
    const len = size * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.2);
    ctx.quadraticCurveTo(
      Math.cos(angle) * len, size * 0.2 + Math.sin(angle) * len,
      Math.cos(angle) * len * 1.5, size * 0.2 + Math.sin(angle) * len * 1.5
    );
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawVignette(w, h) {
  const grad = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.8);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ==========================================
// LOOP DE ANIMAÇÃO
// ==========================================
function loop(timestamp) {
  if (!game.active || game.paused) return;
  
  const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1); // Limita o delta a 100ms
  game.lastTime = timestamp;
  
  update(dt);
  draw();
  
  requestAnimationFrame(loop);
}

function endGame(win) {
  game.active = false;
  overlay.classList.remove('hidden');
  
  if (win) {
    screenTitle.innerText = "VOCÊ ESCAPOU";
    screenTitle.classList.remove('dead');
    screenSubtitle.innerText = "A porta se fechou atrás de você.";
    screenStory.innerText = "O silêncio retorna. Mas você ainda pode ouvir a respiração do outro lado.";
    startBtn.innerText = "Tentar Novamente";
  } else {
    screenTitle.innerText = "VOCÊ FOI PEGO";
    screenTitle.classList.add('dead');
    screenSubtitle.innerText = "A escuridão te envolveu.";
    screenStory.innerText = "Os passos pararam. O corredor está vazio novamente.";
    startBtn.innerText = "Tentar Novamente";
  }
}

// ==========================================
// RESIZE DO CANVAS
// ==========================================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();