const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// UI Elements
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

const SETTINGS = {
  totalDistance: 1000,
  playerSpeed: 3.5,
  sprintSpeed: 7,
  monsterBaseSpeed: 3.0, // Aumentei um pouco a velocidade base
  fov: 100,
  renderDist: 150
};

const game = {
  active: false,
  paused: false,
  lookingBack: false,
  time: 0,
  lastTime: 0,
  
  // Variáveis do Jumpscare
  jumpscareActive: false,
  jumpscareTimer: 0,
  screenShake: 0,
  
  player: { distance: 0, stamina: 100, bob: 0, speed: 0 },
  monster: { distance: -20, speed: 0 },
  
  audioCtx: null,
  heartbeatTimer: 0
};

// ==========================================
// ÁUDIO (Batimento e Jumpscare)
// ==========================================
function initAudio() {
  if (!game.audioCtx) game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playHeartbeat(volume) {
  if (!game.audioCtx || volume <= 0) return;
  const osc = game.audioCtx.createOscillator();
  const gain = game.audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(50, game.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, game.audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(volume, game.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, game.audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(game.audioCtx.destination);
  osc.start();
  osc.stop(game.audioCtx.currentTime + 0.2);
}

function playJumpscareSound() {
  if (!game.audioCtx) return;
  
  // Cria um som de "grito" distorcido usando ruído e osciladores
  const osc = game.audioCtx.createOscillator();
  const gain = game.audioCtx.createGain();
  
  osc.type = 'sawtooth'; // Som agressivo
  osc.frequency.setValueAtTime(800, game.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, game.audioCtx.currentTime + 0.8); // Cai drasticamente
  
  gain.gain.setValueAtTime(1.0, game.audioCtx.currentTime); // Volume máximo
  gain.gain.exponentialRampToValueAtTime(0.01, game.audioCtx.currentTime + 1.0);
  
  osc.connect(gain);
  gain.connect(game.audioCtx.destination);
  
  osc.start();
  osc.stop(game.audioCtx.currentTime + 1.0);
}

// ==========================================
// INPUT
// ==========================================
const keys = { w: false, s: false, shift: false };

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') keys.w = true;
  if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') keys.s = true;
  if (e.key === 'Shift') keys.shift = true;
  if (e.key === 'Escape' && game.active) togglePause();
});

window.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') keys.w = false;
  if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') keys.s = false;
  if (e.key === 'Shift') keys.shift = false;
});

function togglePause() {
  game.paused = !game.paused;
  if (game.paused) {
    overlay.classList.remove('hidden');
    screenTitle.innerText = "PAUSADO";
    screenSubtitle.innerText = "Respire fundo.";
    screenStory.innerText = "Pressione ENTER para continuar.";
    startBtn.innerText = "Continuar";
  } else {
    overlay.classList.add('hidden');
    game.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

startBtn.addEventListener('click', () => {
  if (game.paused) togglePause();
  else startGame();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && game.paused) togglePause();
});

// ==========================================
// LÓGICA
// ==========================================
function startGame() {
  initAudio();
  overlay.classList.add('hidden');
  ui.classList.remove('hidden');
  
  game.active = true;
  game.paused = false;
  game.time = 0;
  game.lastTime = performance.now();
  game.jumpscareActive = false;
  
  game.player.distance = 0;
  game.player.stamina = 100;
  game.monster.distance = -20;
  
  updateUI();
  requestAnimationFrame(loop);
}

function update(dt) {
  if (game.jumpscareActive) {
    // Se o jumpscare está rodando, só atualiza o timer e o tremor
    game.jumpscareTimer -= dt;
    game.screenShake = Math.max(0, game.jumpscareTimer * 30);
    
    if (game.jumpscareTimer <= 0) {
      endGame(false); // Fim de jogo após o susto
    }
    return; // Pausa a lógica normal do jogo
  }

  game.time += dt;
  
  let targetSpeed = 0;
  if (keys.w && !game.lookingBack) {
    if (keys.shift && game.player.stamina > 0) {
      targetSpeed = SETTINGS.sprintSpeed;
      game.player.stamina = Math.max(0, game.player.stamina - 20 * dt);
    } else {
      targetSpeed = SETTINGS.playerSpeed;
    }
  }
  
  if (targetSpeed <= SETTINGS.playerSpeed) {
    game.player.stamina = Math.min(100, game.player.stamina + 15 * dt);
  }
  
  game.player.speed += (targetSpeed - game.player.speed) * 8 * dt;
  game.player.distance += game.player.speed * dt;
  
  if (game.player.speed > 0.1) game.player.bob += game.player.speed * dt * 3;
  
  game.lookingBack = keys.s;
  
  if (!game.lookingBack) {
    const difficulty = 1 + (game.player.distance / SETTINGS.totalDistance) * 1.5;
    game.monster.speed = SETTINGS.monsterBaseSpeed * difficulty;
    game.monster.distance += game.monster.speed * dt;
  } else {
    game.monster.speed = 0;
  }
  
  // Verifica se o monstro alcançou
  if (game.monster.distance >= game.player.distance) {
    triggerJumpscare();
    return;
  }
  
  if (game.player.distance >= SETTINGS.totalDistance) {
    endGame(true);
    return;
  }
  
  const distToMonster = game.player.distance - game.monster.distance;
  if (distToMonster < 25) {
    game.heartbeatTimer -= dt;
    if (game.heartbeatTimer <= 0) {
      const vol = Math.max(0, 1 - (distToMonster / 25)) * 0.6;
      playHeartbeat(vol);
      game.heartbeatTimer = Math.max(0.2, distToMonster / 12);
    }
  }
  
  updateUI();
}

function triggerJumpscare() {
  game.jumpscareActive = true;
  game.jumpscareTimer = 1.5; // Duração do susto em segundos
  playJumpscareSound();
  ui.classList.add('hidden'); // Esconde o HUD
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
  } else if (distToMonster < 35) {
    statusEl.innerText = "OUVINDO PASSOS";
    statusEl.classList.add('danger');
  } else {
    statusEl.innerText = "SILÊNCIO";
    statusEl.classList.remove('danger');
  }
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================
function draw() {
  const w = canvas.width;
  const h = canvas.height;
  
  // Tremor de tela (Screen Shake)
  let shakeX = 0;
  let shakeY = 0;
  if (game.screenShake > 0) {
    shakeX = (Math.random() - 0.5) * game.screenShake;
    shakeY = (Math.random() - 0.5) * game.screenShake;
  }
  
  ctx.save();
  ctx.translate(shakeX, shakeY);
  
  if (game.jumpscareActive) {
    drawJumpscare(w, h);
  } else {
    // Fundo normal
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    
    const bobX = Math.cos(game.player.bob * 0.5) * 4;
    const bobY = Math.sin(game.player.bob) * 6;
    
    ctx.save();
    ctx.translate(w / 2 + bobX, h / 2 + bobY);
    
    const fov = SETTINGS.fov * (Math.PI / 180);
    const focalLength = (w / 2) / Math.tan(fov / 2);
    
    if (game.lookingBack) {
      drawMonster(w, h, focalLength);
    } else {
      drawCorridorAndDoor(w, h, focalLength);
    }
    
    ctx.restore();
    
    drawVignette(w, h);
    drawGrain(w, h);
  }
  
  ctx.restore();
}

// ==========================================
// DESENHO DO JUMPSCARE (A Cara do Monstro)
// ==========================================
function drawJumpscare(w, h) {
  // Fundo preto
  ctx.fillStyle = '#000';
  ctx.fillRect(-100, -100, w + 200, h + 200);
  
  // Zoom rápido para a cara (Efeito de avanço)
  const zoom = 1 + (1.5 - game.jumpscareTimer) * 2; 
  
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  
  // Rosto base
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Silhueta do Corpo (como na sua foto)
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.5, w * 0.4, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Olhos brancos e vazios
  ctx.fillStyle = '#e0e0e0';
  ctx.beginPath();
  ctx.ellipse(-w * 0.1, -h * 0.1, w * 0.06, h * 0.04, 0.2, 0, Math.PI * 2);
  ctx.ellipse(w * 0.1, -h * 0.1, w * 0.06, h * 0.04, -0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupilas minúsculas
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-w * 0.1, -h * 0.1, w * 0.01, 0, Math.PI * 2);
  ctx.arc(w * 0.1, -h * 0.1, w * 0.01, 0, Math.PI * 2);
  ctx.fill();
  
  // Boca rasgada e dentes
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.15, w * 0.15, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#d0d0d0'; // Dentes amarelados
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue; // Falha no meio
    ctx.beginPath();
    ctx.moveTo(i * w * 0.03, h * 0.05);
    ctx.lineTo(i * w * 0.03 - w * 0.015, h * 0.1);
    ctx.lineTo(i * w * 0.03 + w * 0.015, h * 0.1);
    ctx.fill();
  }
  
  // Adiciona um filtro de ruído estático em cima do rosto
  drawGrain(w, h, 0.2);
}

// ==========================================
// FUNÇÕES AUXILIARES DE RENDERIZAÇÃO
// ==========================================
function drawCorridorAndDoor(w, h, focalLength) {
  const corridorW = 200;
  
  function project(worldX, worldY, worldZ) {
    const scale = focalLength / worldZ;
    return { x: worldX * scale, y: worldY * scale, scale: scale };
  }
  
  const maxZ = SETTINGS.renderDist;
  const minZ = 2;
  
  // Chão
  const pBottomLeftFar = project(-corridorW/2, corridorW/2, maxZ);
  const pBottomRightFar = project(corridorW/2, corridorW/2, maxZ);
  const pBottomLeftNear = project(-corridorW/2, corridorW/2, minZ);
  const pBottomRightNear = project(corridorW/2, corridorW/2, minZ);
  
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.moveTo(pBottomLeftNear.x, pBottomLeftNear.y);
  ctx.lineTo(pBottomRightNear.x, pBottomRightNear.y);
  ctx.lineTo(pBottomRightFar.x, pBottomRightFar.y);
  ctx.lineTo(pBottomLeftFar.x, pBottomLeftFar.y);
  ctx.fill();

  // Teto
  const pTopLeftFar = project(-corridorW/2, -corridorW/2, maxZ);
  const pTopRightFar = project(corridorW/2, -corridorW/2, maxZ);
  const pTopLeftNear = project(-corridorW/2, -corridorW/2, minZ);
  const pTopRightNear = project(corridorW/2, -corridorW/2, minZ);
  
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.moveTo(pTopLeftNear.x, pTopLeftNear.y);
  ctx.lineTo(pTopRightNear.x, pTopRightNear.y);
  ctx.lineTo(pTopRightFar.x, pTopRightFar.y);
  ctx.lineTo(pTopLeftFar.x, pTopLeftFar.y);
  ctx.fill();

  // Paredes
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.moveTo(pTopLeftNear.x, pTopLeftNear.y);
  ctx.lineTo(pBottomLeftNear.x, pBottomLeftNear.y);
  ctx.lineTo(pBottomLeftFar.x, pBottomLeftFar.y);
  ctx.lineTo(pTopLeftFar.x, pTopLeftFar.y);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.moveTo(pTopRightNear.x, pTopRightNear.y);
  ctx.lineTo(pBottomRightNear.x, pBottomRightNear.y);
  ctx.lineTo(pBottomRightFar.x, pBottomRightFar.y);
  ctx.lineTo(pTopRightFar.x, pTopRightFar.y);
  ctx.fill();
  
  // Detalhes das portas laterais
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  for (let z = 10; z < maxZ; z += 15) {
    let p1 = project(-corridorW/2, -corridorW/2 + 10, z);
    let p2 = project(-corridorW/2, corridorW/2 - 10, z);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    p1 = project(corridorW/2, -corridorW/2 + 10, z);
    p2 = project(corridorW/2, corridorW/2 - 10, z);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  
  // Luzes no Teto
  for (let z = 5; z < maxZ; z += 20) {
    const p = project(0, -corridorW/2 + 5, z);
    const lightRadius = Math.max(1, 20 * p.scale);
    
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, lightRadius * 4);
    grad.addColorStop(0, 'rgba(200, 210, 220, 0.8)');
    grad.addColorStop(0.2, 'rgba(200, 210, 220, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, lightRadius * 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, lightRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // A Porta
  const doorZ = SETTINGS.totalDistance - game.player.distance;
  if (doorZ > 0 && doorZ < maxZ + 10) {
    const pDoor = project(0, 0, doorZ);
    const doorScale = Math.min(1, 20 / doorZ);
    const dw = 80 * doorScale;
    const dh = 150 * doorScale;
    
    const glow = ctx.createRadialGradient(pDoor.x, pDoor.y + dh/2, 0, pDoor.x, pDoor.y + dh/2, dw*2);
    glow.addColorStop(0, 'rgba(167, 139, 118, 0.6)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(pDoor.x - dw*2, pDoor.y - dh/2, dw*4, dh*2);
    
    ctx.fillStyle = '#050505';
    ctx.fillRect(pDoor.x - dw/2, pDoor.y - dh/2, dw, dh);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2 * doorScale;
    ctx.strokeRect(pDoor.x - dw/2, pDoor.y - dh/2, dw, dh);
  }
}

function drawMonster(w, h, focalLength) {
  const dist = game.player.distance - game.monster.distance;
  if (dist > 40) return;
  
  const scale = focalLength / dist;
  const size = 100 * scale;
  
  // Silhueta (como na foto)
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeça
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Olhos vermelhos se estiver muito perto
  if (dist < 15) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(-size * 0.08, -size * 0.55, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.08, -size * 0.55, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVignette(w, h) {
  const grad = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.9);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.6)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawGrain(w, h, intensity = 0.03) {
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillRect(x, y, 1, 1);
  }
}

// ==========================================
// LOOP E FIM DE JOGO
// ==========================================
function loop(timestamp) {
  if (!game.active || game.paused) return;
  const dt = Math.min((timestamp - game.lastTime) / 1000, 0.1);
  game.lastTime = timestamp;
  
  update(dt);
  draw();
  
  if (game.active) requestAnimationFrame(loop);
}

function endGame(win) {
  game.active = false;
  overlay.classList.remove('hidden');
  
  if (win) {
    screenTitle.innerText = "VOCÊ ESCAPOU";
    screenTitle.classList.remove('dead');
    screenSubtitle.innerText = "A porta se fechou.";
    screenStory.innerText = "O silêncio retorna. Mas você ainda sente que algo te observa.";
    startBtn.innerText = "Tentar Novamente";
  } else {
    // Se perdeu, mostra a tela de morte (o Jumpscare já sumiu)
    screenTitle.innerText = "VOCÊ FOI PEGO";
    screenTitle.classList.add('dead');
    screenSubtitle.innerText = "A escuridão te envolveu.";
    screenStory.innerText = "Os passos pararam. O corredor está vazio.";
    startBtn.innerText = "Tentar Novamente";
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();