/* CthulhuWell: jogo de corredor em canvas, sem dependências externas. */

(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const ui = document.getElementById('ui');
  const overlay = document.getElementById('overlay');
  const distanceDisplay = document.getElementById('dist');
  const statusDisplay = document.getElementById('status');
  const staminaBar = document.getElementById('stamina');
  const staminaLabel = document.getElementById('stamina-label');
  const progressBar = document.querySelector('[role="progressbar"]');
  const screenTitle = document.getElementById('screen-title');
  const screenSubtitle = document.getElementById('screen-subtitle');
  const screenStory = document.getElementById('screen-story');
  const startButton = document.getElementById('start-button');

  const SETTINGS = Object.freeze({
    corridorLength: 1000,
    monsterStartDistance: 205,
    walkSpeed: 88,
    sprintSpeed: 250,
    monsterSpeed: 122,
    sprintDrain: 42,
    staminaRecovery: 20,
    catchDistance: 13,
    lookBackRevealDistance: 410
  });

  const state = {
    width: 0,
    height: 0,
    playerDistance: SETTINGS.corridorLength,
    monsterDistance: SETTINGS.corridorLength + SETTINGS.monsterStartDistance,
    stamina: 100,
    elapsed: 0,
    previousFrame: 0,
    footstepClock: 0,
    phase: 'menu',
    moving: false,
    sprinting: false,
    lookingBack: false,
    lookPitch: 0
  };

  const audio = {
    context: null,
    master: null,
    ambience: null,
    drone: null,
    overtone: null,
    noise: null
  };

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * pixelRatio);
    canvas.height = Math.floor(state.height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function clearControls() {
    state.moving = false;
    state.sprinting = false;
    state.lookingBack = false;
    state.lookPitch = 0;
  }

  function startAmbience() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audio.context) {
      audio.context = new AudioContext();
      audio.master = audio.context.createGain();
      audio.ambience = audio.context.createGain();
      audio.drone = audio.context.createOscillator();
      audio.overtone = audio.context.createOscillator();

      audio.drone.type = 'sine';
      audio.drone.frequency.value = 46;
      audio.overtone.type = 'sine';
      audio.overtone.frequency.value = 47.3;
      audio.ambience.gain.value = 0.018;
      audio.master.gain.value = 0.32;

      audio.drone.connect(audio.ambience);
      audio.overtone.connect(audio.ambience);
      audio.ambience.connect(audio.master);
      audio.master.connect(audio.context.destination);

      const buffer = audio.context.createBuffer(1, audio.context.sampleRate * 2, audio.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++) {
        channel[i] = (Math.random() * 2 - 1) * 0.22;
      }
      audio.noise = audio.context.createBufferSource();
      audio.noise.buffer = buffer;
      audio.noise.loop = true;
      const lowPass = audio.context.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 180;
      const airGain = audio.context.createGain();
      airGain.gain.value = 0.08;
      audio.noise.connect(lowPass);
      lowPass.connect(airGain);
      airGain.connect(audio.master);

      audio.drone.start();
      audio.overtone.start();
      audio.noise.start();
    }

    if (audio.context.state === 'suspended') audio.context.resume();
  }

  function updateAmbience(proximity) {
    if (!audio.context || !audio.ambience) return;
    const target = 0.018 + proximity * 0.032;
    audio.ambience.gain.setTargetAtTime(target, audio.context.currentTime, 0.8);
  }

  function playFootstep() {
    if (!audio.context || audio.context.state !== 'running') return;
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    const now = audio.context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(72, now);
    oscillator.frequency.exponentialRampToValueAtTime(39, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    oscillator.connect(gain);
    gain.connect(audio.master);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  }

  function startGame() {
    state.playerDistance = SETTINGS.corridorLength;
    state.monsterDistance = SETTINGS.corridorLength + SETTINGS.monsterStartDistance;
    state.stamina = 100;
    state.elapsed = 0;
    state.footstepClock = 0;
    state.phase = 'playing';
    clearControls();
    startAmbience();
    updateHud();
    ui.classList.remove('hidden');
    overlay.classList.add('hidden');
  }

  function resumeGame() {
    state.phase = 'playing';
    startAmbience();
    ui.classList.remove('hidden');
    overlay.classList.add('hidden');
  }

  function showOverlay(heading, subtitle, story, buttonLabel, isDeath = false) {
    screenTitle.innerHTML = heading;
    screenTitle.classList.toggle('dead', isDeath);
    screenSubtitle.textContent = subtitle;
    screenStory.textContent = story;
    startButton.textContent = buttonLabel;
    overlay.classList.remove('hidden');
  }

  function finishGame(escaped) {
    state.phase = escaped ? 'win' : 'dead';
    clearControls();
    ui.classList.add('hidden');

    if (escaped) {
      showOverlay(
        'VOCÊ<br>ESCAPOU',
        'A porta se fechou. Os passos pararam.',
        `Você alcançou a porta em ${state.elapsed.toFixed(1).replace('.', ',')} segundos. Do outro lado, não há passos.`,
        'Tentar novamente'
      );
    } else {
      showOverlay(
        'ELE ESTÁ<br>AQUI',
        'Os passos cessaram.',
        'Você não viu o que chegou até você. Só sentiu o ar mudar antes de tudo ficar em silêncio.',
        'Tentar novamente',
        true
      );
    }
  }

  function updateHud() {
    const distance = Math.max(0, Math.ceil(state.playerDistance));
    const gap = state.monsterDistance - state.playerDistance;
    distanceDisplay.textContent = `${distance} m`;

    if (gap < 80) statusDisplay.textContent = 'LOGO ATRÁS';
    else if (gap < 155) statusDisplay.textContent = 'PASSOS PRÓXIMOS';
    else if (gap < 300) statusDisplay.textContent = 'PASSOS AO LONGE';
    else statusDisplay.textContent = '...';

    statusDisplay.classList.toggle('danger', gap < 170);
    staminaBar.style.width = `${state.stamina}%`;
    staminaLabel.textContent = `${Math.round(state.stamina)}%`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(state.stamina)));
  }

  function update(delta) {
    if (state.phase !== 'playing') return;

    state.elapsed += delta;
    const sprinting = state.sprinting && state.moving && state.stamina > 0;
    const speed = sprinting ? SETTINGS.sprintSpeed : SETTINGS.walkSpeed;

    if (state.moving) {
      state.playerDistance = Math.max(0, state.playerDistance - speed * delta);
      const staminaChange = (sprinting ? -SETTINGS.sprintDrain : SETTINGS.staminaRecovery) * delta;
      state.stamina = Math.max(0, Math.min(100, state.stamina + staminaChange));
      state.footstepClock -= delta;
      if (state.footstepClock <= 0) {
        playFootstep();
        state.footstepClock = sprinting ? 0.29 : 0.48;
      }
    } else {
      state.stamina = Math.min(100, state.stamina + SETTINGS.staminaRecovery * delta);
      state.footstepClock = 0;
    }

    state.monsterDistance = Math.max(0, state.monsterDistance - SETTINGS.monsterSpeed * delta);
    const gap = state.monsterDistance - state.playerDistance;
    updateAmbience(Math.max(0, 1 - gap / 340));
    updateHud();

    if (state.playerDistance <= 0) finishGame(true);
    else if (gap <= SETTINGS.catchDistance) finishGame(false);
  }

  function polygon(points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function drawCorridor(vanishingX, horizon, facingBack) {
    const { width, height } = state;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#0c0b09');
    sky.addColorStop(0.42, '#201c17');
    sky.addColorStop(1, '#100f0d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    polygon([[0, 0], [vanishingX, horizon], [width, 0]], '#171410');
    polygon([[0, 0], [vanishingX, horizon], [vanishingX, height], [0, height]], '#211d18');
    polygon([[width, 0], [vanishingX, horizon], [vanishingX, height], [width, height]], '#1c1915');
    polygon([[0, height], [vanishingX, horizon], [width, height]], '#302a22');

    const wallGlow = ctx.createRadialGradient(vanishingX, horizon, 0, vanishingX, horizon, width * 0.68);
    wallGlow.addColorStop(0, 'rgba(165, 142, 108, .2)');
    wallGlow.addColorStop(0.48, 'rgba(96, 79, 58, .065)');
    wallGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = wallGlow;
    ctx.fillRect(0, 0, width, height);

    drawFloorTiles(vanishingX, horizon);
    drawWallDetails(vanishingX, horizon);
    drawCeilingLights(vanishingX, horizon, facingBack);
  }

  function drawFloorTiles(cx, horizon) {
    const { width, height } = state;
    const floorHeight = height - horizon;
    ctx.strokeStyle = 'rgba(174, 151, 119, .12)';
    ctx.lineWidth = 1;

    for (let lane = -4; lane <= 4; lane++) {
      ctx.beginPath();
      ctx.moveTo(cx + lane * 3, horizon);
      ctx.lineTo(cx + lane * (width * 0.62), height);
      ctx.stroke();
    }

    for (let row = 1; row <= 13; row++) {
      const phase = (state.elapsed * 0.23) % 1;
      const depth = (row / 14 + phase / 14) % 1;
      const y = horizon + floorHeight * depth * depth;
      const halfWidth = (width * 0.52) * depth * depth;
      ctx.globalAlpha = 0.16 + depth * 0.26;
      ctx.beginPath();
      ctx.moveTo(cx - halfWidth, y);
      ctx.lineTo(cx + halfWidth, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawWallDetails(cx, horizon) {
    const { width, height } = state;
    for (const side of [-1, 1]) {
      ctx.strokeStyle = 'rgba(184, 155, 117, .16)';
      ctx.lineWidth = Math.max(2, width * 0.003);
      ctx.beginPath();
      ctx.moveTo(cx + side * 3, horizon + 2);
      ctx.lineTo(cx + side * width * 0.5, height);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const depth = 0.24 + i * 0.12;
        const farDepth = Math.max(0.08, depth - 0.075);
        const wallX = cx + side * width * 0.5 * depth * depth;
        const innerX = cx + side * width * 0.5 * farDepth * farDepth;
        const topY = horizon - horizon * depth * depth;
        const bottomY = horizon + (height - horizon) * depth * depth;
        const panelTopY = horizon - horizon * farDepth * farDepth;
        const panelBottomY = horizon + (height - horizon) * farDepth * farDepth;
        const offset = side < 0 ? 1 : -1;
        const pulse = 0.82 + Math.sin(state.elapsed * 1.2 + i * 2.3) * 0.04;

        polygon([
          [wallX, topY],
          [innerX, panelTopY],
          [innerX, panelBottomY],
          [wallX, bottomY]
        ], `rgba(104, 83, 61, ${0.13 * pulse})`);
        polygon([
          [wallX + offset * 2, topY + (bottomY - topY) * 0.28],
          [innerX + offset * 2, panelTopY + (panelBottomY - panelTopY) * 0.28],
          [innerX + offset * 2, panelTopY + (panelBottomY - panelTopY) * 0.32],
          [wallX + offset * 2, topY + (bottomY - topY) * 0.32]
        ], `rgba(186, 153, 110, ${0.13 * pulse})`);

        const sconceY = topY + (bottomY - topY) * 0.4;
        const sconceX = wallX + (innerX - wallX) * 0.42;
        const sconceSize = Math.max(2, depth * 4);
        const glow = ctx.createRadialGradient(sconceX, sconceY, 0, sconceX, sconceY, sconceSize * 7);
        glow.addColorStop(0, `rgba(196, 151, 100, ${0.16 * pulse * depth})`);
        glow.addColorStop(1, 'rgba(196, 151, 100, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sconceX, sconceY, sconceSize * 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(196, 151, 100, ${0.24 * pulse * depth})`;
        ctx.fillRect(sconceX - sconceSize / 2, sconceY - sconceSize * 2, sconceSize, sconceSize * 4);
      }
    }
  }

  function drawCeilingLights(cx, horizon, facingBack) {
    const { width } = state;
    for (let i = 0; i < 5; i++) {
      const depth = ((i / 5 + (state.elapsed * 0.055) % 1 + (facingBack ? 0.5 : 0)) % 1);
      const perspective = 0.025 + depth * depth * 0.96;
      const y = horizon - (state.height * 0.42) * (1 - perspective);
      const lightWidth = 2 + width * 0.028 * perspective;
      const x = cx;
      const flicker = 0.68 + Math.sin(state.elapsed * 2.1 + i * 7.2) * 0.11;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8 + lightWidth * 2);
      glow.addColorStop(0, `rgba(207, 183, 143, ${0.24 * flicker * perspective})`);
      glow.addColorStop(1, 'rgba(176, 150, 115, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 8 + lightWidth * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(200, 179, 145, ${0.16 * flicker * perspective})`;
      ctx.fillRect(x - lightWidth / 2, y - 1, lightWidth, Math.max(1, perspective * 3));
    }
  }

  function drawDoor(cx, horizon) {
    const approach = 1 - state.playerDistance / SETTINGS.corridorLength;
    const scale = 0.14 + Math.pow(approach, 2.5) * 5.5;
    const width = 106 * scale;
    const height = 164 * scale;
    const top = horizon - height;

    ctx.save();
    ctx.shadowColor = 'rgba(173, 125, 77, .18)';
    ctx.shadowBlur = 8 + scale * 5;
    ctx.fillStyle = '#090908';
    ctx.fillRect(cx - width / 2, top, width, height);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(143, 116, 86, ${0.27 + approach * 0.33})`;
    ctx.lineWidth = Math.max(1, scale * 1.3);
    ctx.strokeRect(cx - width / 2, top, width, height);

    ctx.strokeStyle = `rgba(118, 96, 72, ${0.18 + approach * 0.3})`;
    ctx.lineWidth = Math.max(1, scale * 0.45);
    ctx.beginPath();
    ctx.moveTo(cx, top + height * 0.04);
    ctx.lineTo(cx, horizon - height * 0.03);
    ctx.stroke();

    ctx.fillStyle = `rgba(194, 157, 105, ${0.45 + approach * 0.4})`;
    ctx.beginPath();
    ctx.arc(cx + width * 0.32, top + height * 0.56, Math.max(0.8, scale * 1.15), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMonster(cx, floorLine) {
    const gap = state.monsterDistance - state.playerDistance;
    if (gap <= 0 || gap > SETTINGS.lookBackRevealDistance) return;

    const proximity = 1 - gap / SETTINGS.lookBackRevealDistance;
    const scale = 0.18 + Math.pow(proximity, 1.55) * 1.65;
    const groundY = floorLine + state.height * (0.13 + proximity * 0.12);
    const sway = Math.sin(state.elapsed * 5.5) * (2 + proximity * 5);

    ctx.save();
    ctx.translate(cx + sway, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(2, 2, 2, .98)';
    ctx.beginPath();
    ctx.ellipse(0, -183, 26, 36, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -103, 37, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(2, 2, 2, .98)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-28, -145);
    ctx.quadraticCurveTo(-62, -96, -67, -4);
    ctx.moveTo(28, -145);
    ctx.quadraticCurveTo(62, -96, 67, -4);
    ctx.moveTo(-17, -54);
    ctx.quadraticCurveTo(-34, -11, -40, 44);
    ctx.moveTo(17, -54);
    ctx.quadraticCurveTo(34, -11, 40, 44);
    ctx.stroke();

    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-40, 44);
    ctx.lineTo(-51, 47);
    ctx.moveTo(40, 44);
    ctx.lineTo(51, 47);
    ctx.stroke();

    ctx.fillStyle = `rgba(183, 25, 17, ${0.35 + proximity * 0.55})`;
    ctx.shadowColor = '#b71911';
    ctx.shadowBlur = 8 + proximity * 24;
    ctx.beginPath();
    ctx.ellipse(-12, -190, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(12, -190, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawVignette(proximity) {
    const { width, height } = state;
    const pulse = 0.5 + Math.sin(state.elapsed * 2.3) * 0.5;
    const edgeAlpha = 0.47 + proximity * (0.17 + pulse * 0.1);
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.15,
      width / 2, height / 2, Math.max(width, height) * 0.72
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, `rgba(${16 + proximity * 31}, ${14 + proximity * 4}, ${12 + proximity * 3}, ${edgeAlpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function draw() {
    const { width, height } = state;
    const lookingBack = state.phase === 'playing' && state.lookingBack;
    const sway = state.moving ? Math.sin(state.elapsed * (state.sprinting ? 17 : 11)) * (state.sprinting ? 4 : 1.7) : 0;
    const pitch = state.lookPitch * height * 0.09;
    const cx = width / 2 + sway;
    const horizon = height * 0.39 + pitch;
    const gap = state.monsterDistance - state.playerDistance;
    const proximity = state.phase === 'playing' ? Math.max(0, 1 - gap / 340) : 0;

    drawCorridor(cx, horizon, lookingBack);
    if (lookingBack) drawMonster(cx, horizon + height * 0.27);
    else drawDoor(cx, horizon);
    drawVignette(proximity);
  }

  function frame(time) {
    const delta = state.previousFrame ? Math.min((time - state.previousFrame) / 1000, 0.05) : 0;
    state.previousFrame = time;
    update(delta);
    draw();
    requestAnimationFrame(frame);
  }

  function onKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();

    if (event.code === 'Escape' && state.phase === 'playing') {
      state.phase = 'paused';
      clearControls();
      ui.classList.add('hidden');
      showOverlay('PAUSA', 'Os passos continuam lá fora.', 'Quando estiver pronto, volte para o corredor. Não fique parado por muito tempo.', 'Continuar');
      return;
    }
    if (event.code === 'Enter' && state.phase === 'paused') {
      resumeGame();
      return;
    }
    if (state.phase !== 'playing') return;

    if (event.code === 'KeyW') state.moving = true;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') state.sprinting = true;
    if (event.code === 'KeyS') state.lookingBack = true;
    if (event.code === 'ArrowUp') state.lookPitch = -1;
    if (event.code === 'ArrowDown') state.lookPitch = 1;
  }

  function onKeyUp(event) {
    if (event.code === 'KeyW') state.moving = false;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') state.sprinting = false;
    if (event.code === 'KeyS') state.lookingBack = false;
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') state.lookPitch = 0;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('blur', clearControls);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  startButton.addEventListener('click', () => {
    if (state.phase === 'paused') resumeGame();
    else startGame();
  });

  resize();
  requestAnimationFrame(frame);
})();
