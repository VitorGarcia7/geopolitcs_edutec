const CANVAS = document.getElementById('game');
  const CTX = CANVAS.getContext('2d');
  const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  function fitCanvas() {
    const cssWidth = CANVAS.clientWidth;
    const ratio = cssWidth / CANVAS.width; // mantém aspect via CSS
    const targetW = Math.round(CANVAS.width * DPR);
    const targetH = Math.round(CANVAS.height * DPR);
    CANVAS.width = targetW;
    CANVAS.height = targetH;
    CTX.setTransform(DPR, 0, 0, DPR, 0, 0); // desemha cordenadas
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  
  const BIRD_SPRITE_URL = "./assets/aviao.png";
  const SPRITE_SCALE = 9.0;   // tamanho do sprite
  const HITBOX_SHRINK =0.1;  

  
  const GRAVITY = 1800; 
  const JUMP_VELOCITY = -520; 
  const PIPE_SPEED = 220; 
  const PIPE_GAP = 160;   // espaço entre canos
  const PIPE_WIDTH = 86;
  const PIPE_INTERVAL = 1.4; 
  const GROUND_Y = 600;   // "chão" imaginário para colisão

 
 const COLORS = {
  pipe: '#4eb464',       // verde claro
  pipeDark: '#1f6d2d',   // verde ainda mais escuro
  cloud: '#ffffff',
  text: '#0b1220',
  hud: '#e5e7eb',
  shadow: 'rgba(0,0,0,.25)'
};


  
  let state = {
    playing: false,
    paused: false,
    gameOver: false,
    lastTime: 0,
    acc: 0,
    bird: null,
    pipes: [],
    timeSincePipe: 0,
    score: 0,
    best: Number(localStorage.getItem('flappy_best') || 0)
  };

  const sprite = new Image();
  if (BIRD_SPRITE_URL) sprite.src = BIRD_SPRITE_URL;

  function newBird() {
    return {
      x: 100,
      y: 100,
      w: 20 * SPRITE_SCALE,
      h: 20 * SPRITE_SCALE,
      vy: 0,
      rot: 0
    };
  }

  function reset() {
    state.playing = false;
    state.paused = false;
    state.gameOver = false;
    state.lastTime = 0;
    state.acc = 0;
    state.bird = newBird();
    state.pipes = [];
    state.timeSincePipe = 0;
    state.score = 0;
  }

  reset();

  
  function flap() {
    if (state.gameOver) return; // evita pulo pós-game over
    state.bird.vy = JUMP_VELOCITY;
    state.playing = true;
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'arrowup' || k === 'w') { e.preventDefault(); flap(); }
    if (k === 'p') state.paused = !state.paused;
    if (k === 'r') { reset(); }
    if (k === 'enter' && state.gameOver) { reset(); }
  });
  CANVAS.addEventListener('mousedown', flap);
  CANVAS.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });

  
  function spawnPipePair() {
    const minTop = 60;
    const maxTop = 380;
    const topHeight = Math.round(minTop + Math.random() * (maxTop - minTop));
    const bottomY = topHeight + PIPE_GAP;
    state.pipes.push({
      x: CANVAS.width / DPR + 40,
      top: { y: 0, h: topHeight },
      bottom: { y: bottomY, h: GROUND_Y - bottomY },
      passed: false
    });
  }

  function updatePipes(dt) {
    for (const p of state.pipes) p.x -= PIPE_SPEED * dt;
    // remove fora da tela
    state.pipes = state.pipes.filter(p => p.x + PIPE_WIDTH > -40);
  }

  
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function getBirdHitbox(b) {
    const hw = b.w * HITBOX_SHRINK;
    const hh = b.h * HITBOX_SHRINK;
    return { x: b.x + (b.w - hw) / 2, y: b.y + (b.h - hh) / 2, w: hw, h: hh };
  }

  function checkCollisions() {
    const b = state.bird;
    const hb = getBirdHitbox(b);

    
    
    const CEILING_BUFFER = 0; 

if (b.y + b.h >= GROUND_Y || b.y <= CEILING_BUFFER) {
  return true;
}
    
    for (const p of state.pipes) {
      const topRect = { x: p.x, y: p.top.y, w: PIPE_WIDTH, h: p.top.h };
      const botRect = { x: p.x, y: p.bottom.y, w: PIPE_WIDTH, h: p.bottom.h };
      if (rectsOverlap(hb, topRect) || rectsOverlap(hb, botRect)) return true;
    }
    return false;
  }

  
  function update(dt) {
    if (!state.playing || state.paused || state.gameOver) return;

    const b = state.bird;
    b.vy += GRAVITY * dt;
    b.y += b.vy * dt;
    b.rot = Math.atan2(b.vy, 400);

    state.timeSincePipe += dt;
    if (state.timeSincePipe >= PIPE_INTERVAL) {
      state.timeSincePipe = 0;
      spawnPipePair();
    }

    updatePipes(dt);

    
    for (const p of state.pipes) {
      if (!p.passed && p.x + PIPE_WIDTH < b.x) {
        p.passed = true;
        state.score++;
        if (state.score > state.best) {
          state.best = state.score;
          localStorage.setItem('flappy_best', String(state.best));
        }
      }
    }

    // colisões
    if (checkCollisions()) {
      state.gameOver = true;
    }
  }

 
  // Céu com paralaxe simples
  let skyOffset = 0;
  function drawBackground(dt) {
    // gradiente já vem do CSS do canvas; aqui desenhamos nuvens e chão
    skyOffset += (PIPE_SPEED * 0.25) * dt;
    const cloudW = 120;
    const cloudH = 60;
    const rows = 2;

    CTX.save();
    CTX.globalAlpha = 0.9;
    for (let r = 0; r < rows; r++) {
      const y = 80 + r * 70;
      const speedMul = 0.3 + r * 0.2;
      for (let i = -2; i < 10; i++) {
        const x = ((i * (cloudW + 80)) - (skyOffset * speedMul)) % (CANVAS.width / DPR + cloudW + 80);
        drawCloud(x, y, cloudW, cloudH);
      }
    }
    CTX.restore();

    // chão
    CTX.fillStyle = '#94d82d';
    CTX.fillRect(0, GROUND_Y, CANVAS.width / DPR, (CANVAS.height / DPR) - GROUND_Y);

    // faixa de chão
    CTX.fillStyle = '#65a30d';
    CTX.fillRect(0, GROUND_Y, CANVAS.width / DPR, 8);
  }

  function drawCloud(x, y, w, h) {
    CTX.save();
    CTX.fillStyle = COLORS.cloud;
    CTX.shadowColor = COLORS.shadow;
    CTX.shadowBlur = 16;
    roundRect(x, y, w, h, 24);
    roundRect(x + 32, y - 12, w * 0.8, h * 0.9, 24);
    roundRect(x - 22, y - 8, w * 0.6, h * 0.8, 24);
    CTX.restore();
  }

  function roundRect(x, y, w, h, r) {
    CTX.beginPath();
    CTX.moveTo(x + r, y);
    CTX.arcTo(x + w, y, x + w, y + h, r);
    CTX.arcTo(x + w, y + h, x, y + h, r);
    CTX.arcTo(x, y + h, x, y, r);
    CTX.arcTo(x, y, x + w, y, r);
    CTX.closePath();
    CTX.fill();
  }

  function drawPipes() {
    for (const p of state.pipes) {
      drawPipe(p.x, 0, PIPE_WIDTH, p.top.h, true);
      drawPipe(p.x, p.bottom.y, PIPE_WIDTH, p.bottom.h, false);
    }
  }

  function drawPipe(x, y, w, h, flipped) {
    // corpo
    CTX.fillStyle = COLORS.pipe;
    CTX.fillRect(x, y, w, h);
    // borda/escuro
    CTX.fillStyle = COLORS.pipeDark;
    CTX.fillRect(x + 6, y, 10, h);
    // lábio
    CTX.fillStyle = COLORS.pipe;
    const lipH = 20;
    if (flipped) {
      CTX.fillRect(x - 4, y + h - lipH, w + 8, lipH);
    } else {
      CTX.fillRect(x - 4, y, w + 8, lipH);
    }
  }

  function drawBird() {
    const b = state.bird;
    CTX.save();
    CTX.translate(b.x + b.w / 2, b.y + b.h / 2);
    CTX.rotate(b.rot);
    CTX.translate(-b.w / 2, -b.h / 2);

    if (sprite.complete && sprite.src) {
      CTX.drawImage(sprite, 0, 0, b.w, b.h);
    } else {
       //passarinho vetorial
      CTX.fillStyle = '#fde047';
      roundRect(0, 0, b.w, b.h, 10);
      // asa
      CTX.fillStyle = '#facc15';
      roundRect(b.w * 0.15, b.h * 0.45, b.w * 0.4, b.h * 0.25, 8);
      // olho
      CTX.fillStyle = '#111827';
      CTX.beginPath();
      CTX.arc(b.w * 0.72, b.h * 0.32, Math.max(2, b.w * 0.07), 0, Math.PI * 2);
      CTX.fill();
      // bico
      CTX.fillStyle = '#fb923c';
      CTX.beginPath();
      CTX.moveTo(b.w * 0.92, b.h * 0.5);
      CTX.lineTo(b.w * 1.08, b.h * 0.58);
      CTX.lineTo(b.w * 0.92, b.h * 0.66);
      CTX.closePath();
      CTX.fill();
    }

    
    CTX.restore();
  }

  function drawHUD() {
    CTX.save();
    CTX.font = '28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    CTX.textAlign = 'left';
    CTX.textBaseline = 'top';
    CTX.fillStyle = COLORS.hud;

    CTX.fillText(`Pontuação: ${state.score}`, 16, 14);
    CTX.fillText(`Recorde: ${state.best}`, 16, 46);

    if (!state.playing && !state.gameOver) {
      CTX.textAlign = 'center';
      CTX.font = 'bold 34px system-ui';
      CTX.fillText('Pressione Espaço/Click para começar', (CANVAS.width/DPR)/2, 160);
      CTX.font = '16px system-ui';
      CTX.fillText('Dica: toque leve e cadenciado rende mais pontos', (CANVAS.width/DPR)/2, 200);
    }

    if (state.paused) {
      CTX.textAlign = 'center';
      CTX.font = 'bold 40px system-ui';
      CTX.fillText('Pausado', (CANVAS.width/DPR)/2, 240);
    }

    if (state.gameOver) {
      CTX.textAlign = 'center';
      CTX.font = 'bold 46px system-ui';
      CTX.fillStyle = COLORS.hud;
      CTX.fillText('Game Over', (CANVAS.width/DPR)/2, 210);
      CTX.font = '20px system-ui';
      CTX.fillText('Pressione R ou Enter para reiniciar', (CANVAS.width/DPR)/2, 252);
    }

    CTX.restore();
  }

  //===================== LOOP =====================
  function loop(ts) {
    const t = ts / 1000;
    const dt = state.lastTime ? Math.min(0.033, t - state.lastTime) : 0;
    state.lastTime = t;

    // limpa
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // update/desenho
    drawBackground(dt);
    update(dt);
    drawPipes();
    drawBird();
    drawHUD();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  