(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    level: document.getElementById('level'),
    lives: document.getElementById('lives'),
    themeName: document.getElementById('themeName'),
    progressLabel: document.getElementById('progressLabel'),
    progressFill: document.getElementById('progressFill'),
    soundBtn: document.getElementById('soundBtn'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlaySubtitle: document.getElementById('overlaySubtitle'),
    overlayControls: document.getElementById('overlayControls'),
    overlayHint: document.getElementById('overlayHint'),
    playBtn: document.getElementById('playBtn'),
    continueBtn: document.getElementById('continueBtn'),
    selectBtn: document.getElementById('selectBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    scoresBtn: document.getElementById('scoresBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    timeBtn: document.getElementById('timeBtn'),
    menuCard: document.getElementById('menuCard'),
    selectCard: document.getElementById('selectCard'),
    settingsCard: document.getElementById('settingsCard'),
    scoresCard: document.getElementById('scoresCard'),
    levelGrid: document.getElementById('levelGrid'),
    difficultyRow: document.getElementById('difficultyRow'),
    skinRow: document.getElementById('skinRow'),
    toggleRow: document.getElementById('toggleRow'),
    scoreList: document.getElementById('scoreList'),
    backBtn: document.getElementById('backBtn'),
    settingsBackBtn: document.getElementById('settingsBackBtn'),
    scoresBackBtn: document.getElementById('scoresBackBtn'),
    toastStack: document.getElementById('toastStack'),
  };

  // --- Constants ----------------------------------------------------------
  const W = 800;
  const H = 600;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const COLS = 9;
  const BRICK_W = 78;
  const BRICK_H = 24;
  const GAP_X = 8;
  const GAP_Y = 9;
  const GRID_W = COLS * BRICK_W + (COLS - 1) * GAP_X;
  const GRID_X = (W - GRID_W) / 2;
  const GRID_Y = 88;
  const BALL_R = 8;
  const BASE_SPEED = 5.2;

  const THEMES = [
    {
      name: 'NEON CITY', tag: 'Classic rhythm — find your flow', mode: 'classic', flags: [], decor: 'grid',
      bg: ['#0a1130', '#050814'], grid: 'rgba(130,170,255,0.05)',
      accent: '#00e5ff', accent2: '#ff3cac',
      bricks: ['#ff4d6d', '#ff8c42', '#ffd166', '#2ec4b6', '#4cc9f0'],
      paddle: ['#6c5ce7', '#00e5ff', '#6c5ce7'], ball: '#f2fdff', ballGlow: '#8cecff',
    },
    {
      name: 'INFERNO', tag: 'Fortified bricks — hit them twice', mode: 'armored', flags: [], decor: 'embers',
      bg: ['#2a0a12', '#0d0308'], grid: 'rgba(255,120,80,0.06)',
      accent: '#ff6b35', accent2: '#ffd166',
      bricks: ['#ff2d55', '#ff5e3a', '#ff9f1c', '#ffd166', '#ffe066'],
      paddle: ['#b4213a', '#ff6b35', '#b4213a'], ball: '#fff3e0', ballGlow: '#ff9f1c',
    },
    {
      name: 'GLACIER', tag: 'Drifting bricks — time your bounces', mode: 'drift', flags: [], decor: 'snow',
      bg: ['#0a1f38', '#030c1a'], grid: 'rgba(180,230,255,0.07)',
      accent: '#7dd3fc', accent2: '#e0f2fe',
      bricks: ['#38bdf8', '#7dd3fc', '#a5f3fc', '#e0f2fe', '#818cf8'],
      paddle: ['#0369a1', '#7dd3fc', '#0369a1'], ball: '#ffffff', ballGlow: '#bae6fd',
    },
    {
      name: 'TOXIC LAB', tag: 'Low gravity — curved shots', mode: 'gravity', flags: [], decor: 'bubbles',
      bg: ['#0d2417', '#030a06'], grid: 'rgba(120,255,160,0.06)',
      accent: '#39ff88', accent2: '#d9ff4d',
      bricks: ['#22c55e', '#4ade80', '#a3e635', '#d9ff4d', '#14b8a6'],
      paddle: ['#166534', '#39ff88', '#166534'], ball: '#f0ffe8', ballGlow: '#a3e635',
    },
    {
      name: 'SYNTHWAVE', tag: 'Small paddle — big speed', mode: 'narrow', flags: [], decor: 'sun',
      bg: ['#1b0b36', '#07021a'], grid: 'rgba(255,100,220,0.08)',
      accent: '#ff5edb', accent2: '#7c5cff',
      bricks: ['#ff2fb9', '#c04cff', '#7c5cff', '#3b82f6', '#22d3ee'],
      paddle: ['#7c3aed', '#ff5edb', '#7c3aed'], ball: '#fff0ff', ballGlow: '#ff5edb',
    },
    {
      name: 'COSMOS', tag: 'Everything at once — survive', mode: 'chaos', flags: [], decor: 'stars',
      bg: ['#141033', '#04030f'], grid: 'rgba(200,180,255,0.06)',
      accent: '#c4b5fd', accent2: '#fbbf24',
      bricks: ['#fbbf24', '#f472b6', '#a78bfa', '#60a5fa', '#34d399'],
      paddle: ['#6d28d9', '#fbbf24', '#6d28d9'], ball: '#fffbeb', ballGlow: '#fbbf24',
    },
    {
      name: 'DEEP SEA', tag: 'Buoyant ball — bricks regenerate', mode: 'buoyant', flags: ['regen'], decor: 'waves',
      bg: ['#062b3a', '#010a14'], grid: 'rgba(120,230,255,0.06)',
      accent: '#22d3ee', accent2: '#5eead4',
      bricks: ['#0891b2', '#22d3ee', '#67e8f9', '#5eead4', '#2dd4bf'],
      paddle: ['#0e7490', '#22d3ee', '#0e7490'], ball: '#f0fdff', ballGlow: '#67e8f9',
    },
    {
      name: 'DUST STORM', tag: 'Heat waves — explosive bricks', mode: 'heat', flags: ['explosive'], decor: 'sand',
      bg: ['#3a1f0b', '#120803'], grid: 'rgba(255,180,100,0.06)',
      accent: '#fb923c', accent2: '#fde68a',
      bricks: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fde68a'],
      paddle: ['#9a3412', '#fb923c', '#9a3412'], ball: '#fff7ed', ballGlow: '#fdba74',
    },
    {
      name: 'CANDY SHOP', tag: 'Bricks split when broken', mode: 'split', flags: [], decor: 'sprinkles',
      bg: ['#2b0a2e', '#100414'], grid: 'rgba(255,190,230,0.06)',
      accent: '#f472b6', accent2: '#a7f3d0',
      bricks: ['#fb7185', '#f472b6', '#c084fc', '#f9a8d4', '#6ee7b7'],
      paddle: ['#be185d', '#f472b6', '#be185d'], ball: '#fff1f2', ballGlow: '#fda4af',
    },
    {
      name: 'MATRIX', tag: 'Phasing bricks — strike when solid', mode: 'ghost', flags: [], decor: 'rain',
      bg: ['#02180c', '#000803'], grid: 'rgba(80,255,140,0.06)',
      accent: '#4ade80', accent2: '#a3e635',
      bricks: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#a3e635'],
      paddle: ['#14532d', '#4ade80', '#14532d'], ball: '#f0fff4', ballGlow: '#86efac',
    },
    {
      name: 'HAZARD ZONE', tag: 'Steel blocks + chain reactions', mode: 'steel', flags: ['explosive'], decor: 'sparks',
      bg: ['#2b1205', '#0d0502'], grid: 'rgba(255,210,90,0.06)',
      accent: '#facc15', accent2: '#f87171',
      bricks: ['#dc2626', '#f97316', '#facc15', '#a3a3a3', '#f87171'],
      paddle: ['#713f12', '#facc15', '#713f12'], ball: '#fffbeb', ballGlow: '#fde047',
    },
    {
      name: 'OMEGA CORE', tag: 'Final boss — everything at once', mode: 'chaos',
      flags: ['drift', 'gravity', 'armored', 'ghost', 'steel', 'explosive', 'boss'], decor: 'aurora',
      bg: ['#1b0b2e', '#04020c'], grid: 'rgba(220,180,255,0.07)',
      accent: '#e879f9', accent2: '#fbbf24',
      bricks: ['#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#34d399'],
      paddle: ['#6d28d9', '#e879f9', '#6d28d9'], ball: '#fffbeb', ballGlow: '#f0abfc',
    },
  ];

  const CAMPAIGN_LEVELS = THEMES.length;

  const DIFFICULTIES = {
    chill:  { label: 'CHILL', speed: 0.82, lives: 5, paddle: 1.15, power: 1.4 },
    normal: { label: 'NORMAL', speed: 1, lives: 3, paddle: 1, power: 1 },
    chaos:  { label: 'CHAOS', speed: 1.18, lives: 2, paddle: 0.86, power: 0.8 },
  };

  const SKINS = [
    { name: 'THEME', colors: null, need: 0 },
    { name: 'CHROME', colors: ['#94a3b8', '#f8fafc', '#64748b'], need: 2000 },
    { name: 'GOLD', colors: ['#b45309', '#fde047', '#b45309'], need: 5000 },
    { name: 'VOID', colors: ['#4c1d95', '#c084fc', '#4c1d95'], need: 10000 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first', name: 'FIRST BLOOD', desc: 'Destroy your first brick' },
    { id: 'flawless', name: 'FLAWLESS', desc: 'Clear a level without losing a life' },
    { id: 'combo3', name: 'CHAIN REACTION', desc: 'Reach a ×3 combo' },
    { id: 'collector', name: 'COLLECTOR', desc: 'Grab 10 power-ups' },
    { id: 'level6', name: 'HALFWAY HERO', desc: 'Reach level 6' },
    { id: 'score10k', name: 'SCORE HUNTER', desc: 'Score 10,000 points' },
    { id: 'boss', name: 'CORE BREACH', desc: 'Defeat the Omega Core' },
  ];

  const POWERUP_STYLE = {
    wide: '#00e5ff', slow: '#a78bfa', life: '#ff5d8f', multi: '#ffd166',
    laser: '#22d3ee', fire: '#fb923c', magnet: '#a3e635',
  };

  const SFX = {
    wall:   [180, 130, 0.045, 0.025, 'square'],
    paddle: [260, 380, 0.07, 0.045, 'square'],
    brick:  [520, 300, 0.08, 0.04, 'triangle'],
    clear:  [480, 960, 0.3, 0.055, 'sine'],
    power:  [620, 1100, 0.22, 0.055, 'sine'],
    lose:   [280, 70, 0.36, 0.06, 'sawtooth'],
    launch: [380, 620, 0.1, 0.035, 'triangle'],
    laser:  [900, 300, 0.1, 0.035, 'sawtooth'],
  };

  // --- Profile / state ----------------------------------------------------
  const profile = safeGet('neonBreakoutProfile', {});

  const game = {
    mode: 'menu',
    prevMode: 'playing',
    score: 0,
    displayScore: 0,
    best: profile.best ?? safeGet('neonBreakoutBest', 0),
    lives: 3,
    level: 1,
    combo: 0,
    comboTimer: 0,
    muted: false,
    difficulty: DIFFICULTIES[profile.difficulty] ? profile.difficulty : 'normal',
    skin: Number.isInteger(profile.skin) ? profile.skin : 0,
    musicOn: profile.musicOn !== false,
    reducedMotion: profile.reducedMotion === true,
    highContrast: profile.highContrast === true,
    scores: Array.isArray(profile.scores) ? profile.scores : [],
    levelBest: profile.levelBest && typeof profile.levelBest === 'object' ? profile.levelBest : {},
    achievements: new Set(Array.isArray(profile.achievements) ? profile.achievements : []),
    progress: profile.progress && typeof profile.progress === 'object' ? profile.progress : null,
    shake: 0,
    flashColor: '#ffffff',
    flashAlpha: 0,
    clearTimer: 0,
    slowTimer: 0,
    wideTimer: 0,
    wideActive: false,
    laserTimer: 0,
    fireTimer: 0,
    magnetTimer: 0,
    lastLifeSlow: 0,
    timeAttack: false,
    timeLeft: 0,
    daily: false,
    seed: 0,
    ngPlus: 0,
    message: '',
    messageTimer: 0,
    introTimer: 0,
    introDuration: 110,
    time: 0,
    musicClock: 0,
    musicStep: 0,
    regenTimer: 240,
    chainDepth: 0,
    theme: THEMES[0],
    stats: { levelLivesLost: 0, powerups: 0, bricks: 0 },
  };

  const paddle = {
    x: (W - 110) / 2, y: H - 46, w: 110, h: 14,
    speed: 11, targetX: null, squash: 0,
  };

  let balls = [];
  let bricks = [];
  let particles = [];
  let powerups = [];
  let lasers = [];
  let popups = [];
  let rings = [];
  let decor = [];
  let lastTime = performance.now();
  let audioCtx = null;

  const keys = { left: false, right: false, magnet: false };

  // --- Helpers ------------------------------------------------------------
  function safeGet(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) { return fallback; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function saveProfile() {
    safeSet('neonBreakoutProfile', {
      best: game.best,
      difficulty: game.difficulty,
      skin: game.skin,
      musicOn: game.musicOn,
      reducedMotion: game.reducedMotion,
      highContrast: game.highContrast,
      scores: game.scores.slice(0, 5),
      levelBest: game.levelBest,
      achievements: [...game.achievements],
      progress: game.progress,
    });
    safeSet('neonBreakoutBest', game.best);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function easeOut(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
  function hasMode(name) { return game.theme.mode === name || (game.theme.flags || []).includes(name); }
  function diff() { return DIFFICULTIES[game.difficulty]; }

  function shade(hex, amount) {
    const n = parseInt(hex.replace('#', ''), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amount >= 0) { r += (255 - r) * amount; g += (255 - g) * amount; b += (255 - b) * amount; }
    else { r *= 1 + amount; g *= 1 + amount; b *= 1 + amount; }
    return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
  }

  function rgbTriplet(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  function roundRectPath(c, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + w, y, x + w, y + h, radius);
    c.arcTo(x + w, y + h, x, y + h, radius);
    c.arcTo(x, y + h, x, y, radius);
    c.arcTo(x, y, x + w, y, radius);
    c.closePath();
  }

  function circleRect(circle, rect) {
    const nx = clamp(circle.x, rect.x, rect.x + rect.w);
    const ny = clamp(circle.y, rect.y, rect.y + rect.h);
    const dx = circle.x - nx;
    const dy = circle.y - ny;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dateSeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function ensureAudio() {
    if (audioCtx) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) audioCtx = new AudioCtor();
    } catch (e) { /* audio optional */ }
  }

  function tone(from, to, duration, volume, type, music = false) {
    if (game.muted || !audioCtx || (music && !game.musicOn)) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) { /* ignore */ }
  }

  function sfx(name) {
    const p = SFX[name];
    if (p) tone(p[0], p[1], p[2], p[3], p[4]);
  }

  function vibrate(ms) {
    try {
      const activated = !navigator.userActivation || navigator.userActivation.hasBeenActive;
      if (navigator.vibrate && activated) navigator.vibrate(ms);
    } catch (e) { /* ignore */ }
  }

  function updateMusic(dt) {
    if (!game.musicOn || game.muted || !audioCtx || game.mode !== 'playing') return;
    game.musicClock += dt;
    if (game.musicClock < Math.max(190, 460 - game.combo * 12)) return;
    game.musicClock = 0;
    const scale = [220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33];
    const note = scale[(game.musicStep++) % scale.length];
    tone(note, note, 0.16, 0.016, 'triangle', true);
    if (game.musicStep % 4 === 0) tone(110, 110, 0.22, 0.02, 'sine', true);
  }

  function flash(color, amount) {
    game.flashColor = color;
    game.flashAlpha = Math.max(game.flashAlpha, amount);
  }

  function showMessage(text, frames) {
    game.message = text;
    game.messageTimer = frames;
  }

  function toast(name, desc) {
    const el = document.createElement('div');
    el.className = 'toast';
    const strong = document.createElement('strong');
    strong.textContent = name;
    const small = document.createElement('small');
    small.textContent = desc;
    el.append(strong, small);
    ui.toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  function unlock(id) {
    if (game.achievements.has(id)) return;
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement) return;
    game.achievements.add(id);
    toast(`★ ${achievement.name}`, achievement.desc);
    sfx('power');
    saveProfile();
  }

  function applyTheme(theme) {
    game.theme = theme;
    document.documentElement.style.setProperty('--cyan', theme.accent);
    document.documentElement.style.setProperty('--pink', theme.accent2);
    document.documentElement.style.setProperty('--cyan-rgb', rgbTriplet(theme.accent));
    document.documentElement.style.setProperty('--pink-rgb', rgbTriplet(theme.accent2));
    ui.themeName.textContent = theme.name;
    ui.themeName.style.color = theme.accent;
  }

  function updateHUD() {
    ui.best.textContent = String(game.best).padStart(5, '0');
    ui.level.textContent = String(game.level).padStart(2, '0');
    ui.lives.textContent = game.lives > 0 ? '♥ '.repeat(game.lives).trim() : '—';
  }

  function tickHUD(f) {
    const difference = game.score - game.displayScore;
    if (Math.abs(difference) > 0.5) {
      game.displayScore += difference * Math.min(1, 0.16 * f);
      ui.score.textContent = String(Math.round(game.displayScore)).padStart(5, '0');
    }
  }

  function updateProgress() {
    const total = bricks.filter((b) => !b.indestructible).length || 1;
    const cleared = bricks.filter((b) => b.indestructible ? false : !b.alive).length;
    ui.progressFill.style.width = `${(cleared / total) * 100}%`;
  }

  function addScore(points) {
    game.score += points;
    if (game.score >= 10000) unlock('score10k');
    if (game.score > game.best) {
      game.best = game.score;
      safeSet('neonBreakoutBest', game.best);
    }
    updateHUD();
  }

  function applySettings() {
    document.body.classList.toggle('high-contrast', game.highContrast);
    document.body.classList.toggle('reduced-motion', game.reducedMotion);
  }

  // --- Menus --------------------------------------------------------------
  function showOverlay({ title, subtitle, button, hint, controls = false, select = false, cont = false }) {
    ui.overlayTitle.textContent = title;
    ui.overlaySubtitle.textContent = subtitle;
    ui.playBtn.dataset.tip = button;
    ui.playBtn.setAttribute('title', button);
    ui.playBtn.setAttribute('aria-label', button);
    ui.overlayHint.textContent = hint;
    ui.overlayControls.style.display = controls ? 'flex' : 'none';
    ui.selectBtn.style.display = select ? '' : 'none';
    ui.continueBtn.style.display = cont && game.progress ? '' : 'none';
    ui.menuCard.classList.remove('is-hidden');
    ui.selectCard.classList.add('is-hidden');
    ui.settingsCard.classList.add('is-hidden');
    ui.scoresCard.classList.add('is-hidden');
    ui.overlay.classList.remove('hidden');
  }

  function hideOverlay() { ui.overlay.classList.add('hidden'); }

  function starText(level) {
    const best = game.levelBest[level] || 0;
    if (best >= 3000) return ' ★★★';
    if (best >= 1500) return ' ★★';
    if (best > 0) return ' ★';
    return '';
  }

  function buildLevelGrid() {
    ui.levelGrid.innerHTML = '';
    for (let i = 0; i < CAMPAIGN_LEVELS; i++) {
      const theme = THEMES[i];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'level-card';
      card.style.setProperty('--card-accent', theme.accent);
      card.style.setProperty('--card-rgb', rgbTriplet(theme.accent));

      const number = document.createElement('span');
      number.className = 'level-number';
      number.textContent = `LEVEL ${String(i + 1).padStart(2, '0')}${starText(i + 1)}`;

      const name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = theme.name;

      const tag = document.createElement('span');
      tag.className = 'level-tag';
      tag.textContent = theme.tag;

      const swatches = document.createElement('span');
      swatches.className = 'level-swatches';
      for (const color of theme.bricks) {
        const swatch = document.createElement('i');
        swatch.style.setProperty('--swatch', color);
        swatches.appendChild(swatch);
      }

      card.append(number, name, tag, swatches);
      card.addEventListener('click', () => startGame(i + 1));
      ui.levelGrid.appendChild(card);
    }
  }

  function showLevelSelect() {
    game.mode = 'levelselect';
    buildLevelGrid();
    ui.menuCard.classList.add('is-hidden');
    ui.settingsCard.classList.add('is-hidden');
    ui.scoresCard.classList.add('is-hidden');
    ui.selectCard.classList.remove('is-hidden');
    ui.overlay.classList.remove('hidden');
  }

  function makeChip(label, active, locked, onClick) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (active ? ' active' : '') + (locked ? ' locked' : '');
    chip.textContent = label;
    if (!locked) chip.addEventListener('click', onClick);
    return chip;
  }

  function buildSettings() {
    ui.difficultyRow.innerHTML = '';
    for (const [key, value] of Object.entries(DIFFICULTIES)) {
      ui.difficultyRow.appendChild(makeChip(value.label, game.difficulty === key, false, () => {
        game.difficulty = key;
        saveProfile();
        buildSettings();
      }));
    }

    ui.skinRow.innerHTML = '';
    SKINS.forEach((skin, index) => {
      const locked = game.best < skin.need;
      const label = locked ? `${skin.name} · ${skin.need}` : skin.name;
      ui.skinRow.appendChild(makeChip(label, game.skin === index, locked, () => {
        game.skin = index;
        saveProfile();
        buildSettings();
      }));
    });

    ui.toggleRow.innerHTML = '';
    const toggles = [
      ['MUSIC ' + (game.musicOn ? 'ON' : 'OFF'), () => { game.musicOn = !game.musicOn; ensureAudio(); }],
      ['REDUCED MOTION ' + (game.reducedMotion ? 'ON' : 'OFF'), () => { game.reducedMotion = !game.reducedMotion; applySettings(); }],
      ['HIGH CONTRAST ' + (game.highContrast ? 'ON' : 'OFF'), () => { game.highContrast = !game.highContrast; applySettings(); }],
    ];
    for (const [label, onClick] of toggles) {
      ui.toggleRow.appendChild(makeChip(label, false, false, () => { onClick(); saveProfile(); buildSettings(); }));
    }
  }

  function showSettings() {
    game.mode = 'settings';
    buildSettings();
    ui.menuCard.classList.add('is-hidden');
    ui.selectCard.classList.add('is-hidden');
    ui.scoresCard.classList.add('is-hidden');
    ui.settingsCard.classList.remove('is-hidden');
    ui.overlay.classList.remove('hidden');
  }

  function buildScores() {
    ui.scoreList.innerHTML = '';
    if (!game.scores.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No runs recorded yet — go break some bricks.';
      ui.scoreList.appendChild(li);
      return;
    }
    game.scores.slice(0, 5).forEach((entry, index) => {
      const li = document.createElement('li');
      const rank = document.createElement('span');
      rank.textContent = `${index + 1}. LV ${entry.level} · ${entry.date}`;
      const points = document.createElement('span');
      points.textContent = String(entry.score).padStart(5, '0');
      li.append(rank, points);
      ui.scoreList.appendChild(li);
    });
  }

  function showScores() {
    game.mode = 'scores';
    buildScores();
    ui.menuCard.classList.add('is-hidden');
    ui.selectCard.classList.add('is-hidden');
    ui.settingsCard.classList.add('is-hidden');
    ui.scoresCard.classList.remove('is-hidden');
    ui.overlay.classList.remove('hidden');
  }

  function showMenu() {
    game.mode = 'menu';
    showOverlay({
      title: 'NEON BREAKOUT',
      subtitle: "Break every brick. Don't drop the ball.",
      button: 'Start Game',
      hint: 'Press Space or Enter to begin',
      controls: true,
      select: true,
      cont: true,
    });
  }

  // --- Level setup --------------------------------------------------------
  function makeBall(x, y, vx = 0, vy = 0) {
    return { x, y, vx, vy, r: BALL_R, stuck: true, slowed: false, trail: [] };
  }

  function ballSpeed() {
    const extra = (hasMode('narrow') || hasMode('chaos') ? 0.6 : 0) + game.ngPlus * 0.25;
    return Math.min(BASE_SPEED + (game.level - 1) * 0.3 + extra, 10) * diff().speed;
  }

  function resetBall() {
    balls = [makeBall(paddle.x + paddle.w / 2, paddle.y - BALL_R - 1)];
  }

  function resetPaddle() {
    paddle.w = (hasMode('narrow') || hasMode('chaos') ? 84 : 110) * diff().paddle;
    paddle.x = (W - paddle.w) / 2;
    paddle.targetX = null;
    paddle.squash = 0;
    game.slowTimer = 0;
    game.wideTimer = 0;
    game.laserTimer = 0;
    game.fireTimer = 0;
    game.magnetTimer = 0;
    game.wideActive = false;
  }

  function makeDecor() {
    const arr = [];
    for (let i = 0; i < 38; i++) {
      arr.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 1 + Math.random() * 2.4,
        speed: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }

  function buildLevel() {
    const theme = THEMES[(game.level - 1) % CAMPAIGN_LEVELS];
    applyTheme(theme);
    ui.progressLabel.textContent = hasMode('boss') ? 'BOSS CORE INTEGRITY' : 'LEVEL PROGRESS';

    bricks = [];
    particles = [];
    powerups = [];
    lasers = [];
    popups = [];
    rings = [];
    decor = makeDecor();
    game.combo = 0;
    game.comboTimer = 0;
    game.regenTimer = 240;
    game.stats.levelLivesLost = 0;

    const random = game.seed ? mulberry32(game.seed + game.level * 7919) : Math.random;
    let rows = Math.min(5 + Math.floor((game.level - 1) / 3), 8);
    if (hasMode('boss')) rows = 3;
    const moving = hasMode('drift');
    const fortified = hasMode('armored');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        if (game.seed && random() < 0.14) continue;
        const x = GRID_X + c * (BRICK_W + GAP_X);
        let hp = 1;
        if (fortified && r < Math.min(2, 1 + Math.floor(game.level / 3))) hp = 2;
        if (game.level >= 4 && r === 0) hp = Math.max(hp, 3);
        if (hasMode('boss') && r === 0) hp = Math.max(hp, 2);

        const steel = hasMode('steel') && !hasMode('boss') && random() < 0.1 && r > 0;
        bricks.push({
          x, baseX: x,
          y: GRID_Y + r * (BRICK_H + GAP_Y),
          w: BRICK_W, h: BRICK_H,
          color: steel ? '#a3a3a3' : theme.bricks[r % theme.bricks.length],
          hp, maxHp: hp,
          alive: true, flash: 0, alpha: 1,
          appear: 0, appearDelay: (r + c) * 1.4,
          points: (8 - r) * 10,
          phase: r * 0.55 + c * 0.28,
          amp: moving ? 5 + r * 1.7 : 0,
          indestructible: steel,
          explosive: hasMode('explosive') && !steel && random() < 0.18,
          split: hasMode('split') && r < 3,
          mini: false,
          boss: false,
        });
      }
    }

    if (hasMode('boss')) {
      const hp = 18 + game.ngPlus * 6 + Math.floor(game.level / 2);
      bricks.push({
        x: W / 2 - 118, baseX: W / 2 - 118, y: 48,
        w: 236, h: 36,
        color: theme.accent2, hp, maxHp: hp,
        alive: true, flash: 0, alpha: 1,
        appear: 0, appearDelay: 0,
        points: 500, phase: 0, amp: 110,
        indestructible: false, explosive: false, split: false, mini: false, boss: true,
      });
    }

    resetPaddle();
    resetBall();
    updateProgress();
    game.introTimer = game.introDuration;
  }

  function startGame(level = 1, keepFlags = false, preserveNg = false) {
    ensureAudio();
    if (!keepFlags) {
      game.daily = false;
      game.timeAttack = false;
    }
    if (!preserveNg) game.ngPlus = 0;
    game.score = 0;
    game.displayScore = 0;
    ui.score.textContent = '00000';
    game.lives = diff().lives;
    game.level = level;
    game.shake = 0;
    game.flashAlpha = 0;
    game.messageTimer = 0;
    game.timeLeft = 90 * 60;
    buildLevel();
    game.mode = 'ready';
    hideOverlay();
    updateHUD();
  }

  function startDaily() {
    game.daily = true;
    game.timeAttack = false;
    game.seed = dateSeed();
    startGame(1, true);
    showMessage('DAILY CHALLENGE', 100);
  }

  function startTimeAttack() {
    game.timeAttack = true;
    game.daily = false;
    game.seed = 0;
    startGame(1, true);
    showMessage('TIME ATTACK — 90s', 100);
  }

  function continueGame() {
    if (!game.progress) return;
    const saved = game.progress;
    game.daily = false;
    game.timeAttack = false;
    game.seed = 0;
    startGame(saved.level);
    game.score = saved.score || 0;
    game.displayScore = game.score;
    game.lives = saved.lives || diff().lives;
    ui.score.textContent = String(game.score).padStart(5, '0');
    updateHUD();
  }

  function saveProgress() {
    game.progress = { level: game.level, score: game.score, lives: game.lives };
    saveProfile();
  }

  function launch() {
    if (game.mode !== 'ready') return;
    const speed = ballSpeed();
    for (const ball of balls) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      ball.stuck = false;
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
    }
    game.mode = 'playing';
    saveProgress();
    sfx('launch');
  }

  function primaryAction() {
    if (game.mode === 'menu') startGame(1);
    else if (game.mode === 'victory') {
      game.ngPlus++;
      startGame(1, true, true);
    } else if (game.mode === 'gameover') {
      if (game.timeAttack) startTimeAttack();
      else if (game.daily) startDaily();
      else startGame(1);
    } else if (game.mode === 'paused') togglePause();
    else if (game.mode === 'ready') launch();
  }

  function togglePause() {
    if (game.mode === 'playing' || game.mode === 'ready') {
      game.prevMode = game.mode;
      game.mode = 'paused';
      showOverlay({
        title: 'PAUSED',
        subtitle: 'Take a breath — the bricks will wait.',
        button: 'Resume',
        hint: 'Press P or Space to resume',
        select: true,
      });
    } else if (game.mode === 'paused') {
      game.mode = game.prevMode;
      hideOverlay();
      lastTime = performance.now();
    }
  }

  function recordRun() {
    game.scores.push({ score: game.score, level: game.level, date: new Date().toLocaleDateString() });
    game.scores.sort((a, b) => b.score - a.score);
    game.scores = game.scores.slice(0, 5);
    game.progress = null;
    saveProfile();
  }

  function loseLife() {
    game.lives--;
    game.combo = 0;
    game.comboTimer = 0;
    game.shake = 16;
    game.stats.levelLivesLost++;
    flash('#ff2d55', 0.5);
    vibrate(90);
    updateHUD();
    sfx('lose');

    if (game.lives <= 0) {
      game.mode = 'gameover';
      recordRun();
      showOverlay({
        title: 'GAME OVER',
        subtitle: `You scored ${game.score} points and reached level ${game.level}.`,
        button: 'Try Again',
        hint: 'Press Space or Enter to play again',
        select: true,
      });
    } else {
      if (game.lives === 1) {
        game.lastLifeSlow = 180;
        showMessage('TIME DILATION', 100);
      } else {
        showMessage('LIFE LOST', 90);
      }
      resetBall();
      game.mode = 'ready';
    }
  }

  function victory() {
    game.mode = 'victory';
    recordRun();
    flash(game.theme.accent, 0.5);
    showOverlay({
      title: 'CAMPAIGN COMPLETE',
      subtitle: `All ${CAMPAIGN_LEVELS} stages cleared with ${game.score} points. New Game+ awaits!`,
      button: 'New Game+',
      hint: 'Press Space or Enter to start New Game+',
    });
  }

  function checkClear() {
    const cleared = bricks.every((b) => !b.alive || b.indestructible);
    if (!cleared || game.mode !== 'playing') return;
    game.mode = 'levelclear';
    game.clearTimer = 100;
    addScore(250 * game.level);
    game.levelBest[game.level] = Math.max(game.levelBest[game.level] || 0, game.score);
    if (game.stats.levelLivesLost === 0) unlock('flawless');
    if (game.level >= 6) unlock('level6');
    if (hasMode('boss')) unlock('boss');
    saveProgress();
    flash(game.theme.accent, 0.28);
    showMessage(`LEVEL ${game.level} CLEARED`, 100);
    sfx('clear');
  }

  function nextLevel() {
    if (game.timeLeft <= 0) return;
    if (game.level >= CAMPAIGN_LEVELS) {
      victory();
      return;
    }
    game.level++;
    buildLevel();
    game.mode = 'ready';
    updateHUD();
    saveProgress();
  }

  // --- Effects ------------------------------------------------------------
  function spawnParticles(x, y, color, count = 12) {
    if (game.reducedMotion) count = Math.ceil(count / 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.6;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3, life: 25 + Math.random() * 20, maxLife: 45, color,
      });
    }
  }

  function addRing(x, y, color, size = 38) {
    if (!game.reducedMotion) rings.push({ x, y, r: 6, maxR: size, life: 24, maxLife: 24, color });
  }

  function maybeSpawnPowerup(brick) {
    const chance = (hasMode('chaos') ? 0.24 : 0.14) * diff().power;
    if (Math.random() > chance) return;
    const types = ['wide', 'slow', 'life', 'multi', 'laser', 'fire', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      x: brick.x + brick.w / 2 - 18, y: brick.y + brick.h / 2 - 12,
      w: 36, h: 24, vy: 3.2, type, appear: 0, bob: Math.random() * Math.PI * 2,
    });
  }

  function applyPowerup(type) {
    game.stats.powerups++;
    if (game.stats.powerups >= 10) unlock('collector');
    sfx('power');
    vibrate(25);
    flash(POWERUP_STYLE[type], 0.18);
    addRing(paddle.x + paddle.w / 2, paddle.y, POWERUP_STYLE[type], 70);

    if (type === 'life') {
      game.lives++;
      updateHUD();
      showMessage('+1 LIFE', 70);
    } else if (type === 'wide') {
      if (game.wideTimer === 0) {
        paddle.w = 170 * diff().paddle;
        paddle.x = clamp(paddle.x, 0, W - paddle.w);
        game.wideActive = true;
      }
      game.wideTimer = 12 * 60;
      showMessage('WIDE PADDLE', 70);
    } else if (type === 'slow') {
      if (game.slowTimer === 0) {
        for (const ball of balls) {
          ball.vx *= 0.72; ball.vy *= 0.72; ball.slowed = true;
        }
      }
      game.slowTimer = 8 * 60;
      showMessage('SLOW MOTION', 70);
    } else if (type === 'multi') {
      const src = balls[0];
      if (src) {
        const speed = Math.hypot(src.vx, src.vy) || ballSpeed();
        const baseAngle = Math.atan2(src.vy, src.vx);
        for (const offset of [-0.55, 0.55]) {
          const extra = makeBall(src.x, src.y, Math.cos(baseAngle + offset) * speed, Math.sin(baseAngle + offset) * speed);
          extra.stuck = false;
          extra.slowed = src.slowed;
          balls.push(extra);
        }
      }
      showMessage('MULTI-BALL', 70);
    } else if (type === 'laser') {
      game.laserTimer = 10 * 60;
      showMessage('LASER — CLICK / SPACE TO FIRE', 90);
    } else if (type === 'fire') {
      game.fireTimer = 10 * 60;
      showMessage('FIREBALL — SMASH THROUGH', 90);
    } else if (type === 'magnet') {
      game.magnetTimer = 12 * 60;
      showMessage('MAGNET — HOLD SHIFT', 90);
    }
  }

  function updateEffects(f) {
    const timers = ['slowTimer', 'wideTimer', 'laserTimer', 'fireTimer', 'magnetTimer', 'lastLifeSlow'];
    for (const key of timers) {
      if (game[key] > 0) game[key] = Math.max(0, game[key] - f);
    }
    if (game.slowTimer === 0) {
      for (const ball of balls) {
        if (ball.slowed) {
          ball.vx /= 0.72; ball.vy /= 0.72; ball.slowed = false;
        }
      }
    }
    if (game.wideTimer === 0 && game.wideActive) {
      game.wideActive = false;
      paddle.w = (hasMode('narrow') || hasMode('chaos') ? 84 : 110) * diff().paddle;
      paddle.x = clamp(paddle.x, 0, W - paddle.w);
    }
  }

  function explodeChain(brick) {
    if (game.chainDepth > 1) return;
    game.chainDepth++;
    const x = brick.x + brick.w / 2;
    const y = brick.y + brick.h / 2;
    addRing(x, y, '#ffffff', 80);
    spawnParticles(x, y, brick.color, 18);
    for (const other of bricks) {
      if (other === brick || !other.alive || other.indestructible) continue;
      const dx = Math.abs(other.x - brick.x);
      const dy = Math.abs(other.y - brick.y);
      if (dx <= BRICK_W + GAP_X + 4 && dy <= BRICK_H + GAP_Y + 4) {
        other.hp = 1;
        damageBrick(other, other.x + other.w / 2, other.y + other.h / 2);
      }
    }
    game.chainDepth--;
  }

  function spawnSplitBricks(brick) {
    if (brick.mini) return;
    const half = (brick.w - 6) / 2;
    for (let i = 0; i < 2; i++) {
      bricks.push({
        x: brick.x + i * (half + 6), baseX: brick.x + i * (half + 6), y: brick.y,
        w: half, h: brick.h, color: brick.color,
        hp: 1, maxHp: 1, alive: true, flash: 0, alpha: 1,
        appear: 1, appearDelay: 0, points: Math.ceil(brick.points / 2),
        phase: brick.phase + i, amp: brick.amp * 0.6,
        indestructible: false, explosive: false, split: false, mini: true, boss: false,
      });
    }
  }

  function damageBrick(brick, x, y) {
    if (!brick.alive || brick.indestructible) return false;
    brick.hp--;
    brick.flash = 1;
    game.combo++;
    game.comboTimer = 180;
    const multiplier = 1 + Math.floor(game.combo / 5);
    const gained = brick.points * multiplier;
    addScore(gained);
    if (game.combo >= 15) unlock('combo3');
    popups.push({ x, y, text: `+${gained}`, color: brick.color, life: 46, maxLife: 46 });
    game.shake = Math.max(game.shake, brick.hp <= 0 ? 5 : 2);
    sfx('brick');
    vibrate(8);

    if (brick.hp <= 0) {
      brick.alive = false;
      game.stats.bricks++;
      addRing(x, y, brick.color, brick.boss ? 140 : 40);
      spawnParticles(x, y, brick.color, brick.boss ? 40 : 14);
      if (brick.explosive) explodeChain(brick);
      if (brick.split) spawnSplitBricks(brick);
      maybeSpawnPowerup(brick);
      updateProgress();
    } else {
      spawnParticles(x, y, brick.color, 6);
    }
    checkClear();
    return true;
  }

  function updateVisuals(f) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.05 * f; p.life -= f;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.y -= 0.7 * f; p.life -= f;
      if (p.life <= 0) popups.splice(i, 1);
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += (r.maxR - r.r) * 0.12 * f + 0.6 * f;
      r.life -= f;
      if (r.life <= 0) rings.splice(i, 1);
    }
    for (const p of powerups) p.appear = Math.min(1, p.appear + 0.075 * f);

    if (game.comboTimer > 0) {
      game.comboTimer -= f;
      if (game.comboTimer <= 0) game.combo = 0;
    }

    if (hasMode('regen')) {
      game.regenTimer -= f;
      if (game.regenTimer <= 0) {
        game.regenTimer = 240;
        const dead = bricks.filter((b) => !b.alive && !b.indestructible && !b.boss && !b.mini);
        const alive = bricks.filter((b) => b.alive && !b.indestructible).length;
        if (dead.length && alive < bricks.length * 0.7) {
          const brick = dead[Math.floor(Math.random() * dead.length)];
          brick.alive = true;
          brick.hp = 1;
          brick.appear = 0;
          brick.appearDelay = 0;
          addRing(brick.x + brick.w / 2, brick.y + brick.h / 2, game.theme.accent, 32);
          updateProgress();
        }
      }
    }

    for (const brick of bricks) {
      if (brick.appearDelay > 0) brick.appearDelay -= f;
      else brick.appear = Math.min(1, brick.appear + 0.075 * f);
      if (brick.flash > 0) brick.flash = Math.max(0, brick.flash - 0.08 * f);
      if (hasMode('ghost') && !brick.indestructible) {
        brick.alpha = 0.32 + 0.68 * (0.5 + 0.5 * Math.sin(game.time * 0.0018 + brick.phase * 2));
      } else {
        brick.alpha = 1;
      }
      if (brick.boss || brick.amp > 0) {
        brick.x = brick.baseX + Math.sin(game.time * 0.0012 + brick.phase) * brick.amp;
      }
    }
  }

  // --- Gameplay -----------------------------------------------------------
  function updatePaddle(f) {
    let dir = 0;
    if (keys.left) dir -= 1;
    if (keys.right) dir += 1;
    if (dir !== 0) {
      paddle.x += dir * paddle.speed * f;
      paddle.targetX = null;
    } else if (paddle.targetX !== null) {
      paddle.x += (paddle.targetX - paddle.x) * Math.min(1, 0.3 * f);
    }
    paddle.x = clamp(paddle.x, 0, W - paddle.w);
    if (paddle.squash > 0) paddle.squash *= Math.pow(0.85, f);
  }

  function resolveBrickCollision(ball, brick) {
    const overlapX = Math.min(ball.x + ball.r - brick.x, brick.x + brick.w - (ball.x - ball.r));
    const overlapY = Math.min(ball.y + ball.r - brick.y, brick.y + brick.h - (ball.y - ball.r));
    if (overlapX < overlapY) {
      if (ball.x < brick.x + brick.w / 2) {
        ball.x = brick.x - ball.r; ball.vx = -Math.abs(ball.vx);
      } else {
        ball.x = brick.x + brick.w + ball.r; ball.vx = Math.abs(ball.vx);
      }
    } else if (ball.y < brick.y + brick.h / 2) {
      ball.y = brick.y - ball.r; ball.vy = -Math.abs(ball.vy);
    } else {
      ball.y = brick.y + brick.h + ball.r; ball.vy = Math.abs(ball.vy);
    }
  }

  function hitBrick(ball, brick) {
    const x = brick.x + brick.w / 2;
    const y = brick.y + brick.h / 2;
    if (brick.indestructible) {
      resolveBrickCollision(ball, brick);
      spawnParticles(ball.x, ball.y, '#e5e7eb', 5);
      sfx('wall');
      return;
    }
    if (game.fireTimer > 0) {
      brick.hp = 1;
      damageBrick(brick, x, y);
      return;
    }
    resolveBrickCollision(ball, brick);
    damageBrick(brick, x, y);
  }

  function fireLasers() {
    if (game.mode !== 'playing' || game.laserTimer <= 0) return;
    const center = paddle.x + paddle.w / 2;
    for (const offset of [-paddle.w * 0.34, paddle.w * 0.34]) {
      lasers.push({ x: center + offset - 3, y: paddle.y - 10, w: 6, h: 16, vy: -10 });
    }
    sfx('laser');
  }

  function updateLasers(f) {
    for (let i = lasers.length - 1; i >= 0; i--) {
      const laser = lasers[i];
      laser.y += laser.vy * f;
      let consumed = false;
      for (const brick of bricks) {
        if (!brick.alive || brick.appear < 0.75 || brick.alpha < 0.32) continue;
        if (laser.x + laser.w > brick.x && laser.x < brick.x + brick.w &&
            laser.y + laser.h > brick.y && laser.y < brick.y + brick.h) {
          if (!brick.indestructible) damageBrick(brick, laser.x, laser.y);
          else spawnParticles(laser.x, laser.y, '#e5e7eb', 5);
          consumed = true;
          break;
        }
      }
      if (consumed || laser.y < -20) lasers.splice(i, 1);
      if (game.mode !== 'playing') return;
    }
  }

  function updateMagnet(f) {
    if (game.magnetTimer <= 0 || !keys.magnet) return;
    const target = paddle.x + paddle.w / 2;
    for (const ball of balls) {
      if (ball.y < H - 200) continue;
      ball.x += (target - ball.x) * 0.05 * f;
      if (ball.vy > 0) ball.vy *= 1 - 0.02 * f;
    }
  }

  function updateBalls(f) {
    const gravity = hasMode('gravity');
    const buoyant = hasMode('buoyant');
    const heat = hasMode('heat');

    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];

      if (!ball.stuck && gravity) ball.vy += 0.011 * f;
      if (!ball.stuck && buoyant) ball.vy -= 0.007 * f;
      if (!ball.stuck && heat) {
        const target = ballSpeed() * (1 + Math.sin(game.time * 0.002) * 0.22);
        const current = Math.hypot(ball.vx, ball.vy) || 1;
        const scale = 1 + ((target - current) / current) * 0.02 * f;
        ball.vx *= scale; ball.vy *= scale;
      }
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed > 11.5) { ball.vx = ball.vx / speed * 11.5; ball.vy = ball.vy / speed * 11.5; }

      ball.x += ball.vx * f;
      ball.y += ball.vy * f;
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 11) ball.trail.shift();

      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); sfx('wall'); }
      else if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); sfx('wall'); }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); sfx('wall'); }

      if (ball.vy > 0 && circleRect(ball, paddle)) {
        ball.y = paddle.y - ball.r;
        const hit = clamp((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2), -1, 1);
        const paddleSpeed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.008, 11);
        const angle = hit * (Math.PI / 3);
        ball.vx = Math.sin(angle) * paddleSpeed;
        ball.vy = -Math.abs(Math.cos(angle) * paddleSpeed);
        game.combo = 0;
        game.comboTimer = 0;
        paddle.squash = 1;
        addRing(ball.x, paddle.y, game.theme.accent, 26);
        sfx('paddle');
      }

      for (const brick of bricks) {
        if (!brick.alive || brick.appear < 0.75 || brick.alpha < 0.32) continue;
        if (circleRect(ball, brick)) {
          hitBrick(ball, brick);
          break;
        }
      }
      if (game.mode !== 'playing') return;

      if (ball.y - ball.r > H) balls.splice(i, 1);
    }

    if (balls.length === 0) loseLife();
  }

  function updatePowerups(f) {
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy * f;
      const hit =
        p.x + p.w > paddle.x && p.x < paddle.x + paddle.w &&
        p.y + p.h > paddle.y && p.y < paddle.y + paddle.h;
      if (hit) {
        applyPowerup(p.type);
        powerups.splice(i, 1);
      } else if (p.y > H + 20) {
        powerups.splice(i, 1);
      }
    }
  }

  function update(f, dt) {
    game.time += dt;
    tickHUD(f);
    updateMusic(dt);

    if (game.shake > 0) game.shake *= Math.pow(0.88, f);
    if (game.flashAlpha > 0) game.flashAlpha = Math.max(0, game.flashAlpha - 0.028 * f);
    if (game.messageTimer > 0) game.messageTimer -= f;
    if (game.introTimer > 0) game.introTimer -= f;

    updateVisuals(f);

    if (game.mode === 'levelclear') {
      game.clearTimer -= f;
      if (game.clearTimer <= 0) nextLevel();
      return;
    }
    if (['menu', 'levelselect', 'settings', 'scores', 'paused', 'gameover', 'victory'].includes(game.mode)) return;

    updatePaddle(f);

    const ballFactor = game.lastLifeSlow > 0 ? f * 0.55 : f;

    if (game.timeAttack && (game.mode === 'playing' || game.mode === 'ready')) {
      game.timeLeft -= f;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        game.mode = 'gameover';
        recordRun();
        showOverlay({
          title: 'TIME UP',
          subtitle: `You scored ${game.score} points in 90 seconds.`,
          button: 'Try Again',
          hint: 'Press Space or Enter to play again',
          select: true,
        });
        return;
      }
    }

    if (game.mode === 'ready') {
      for (const ball of balls) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 1;
        ball.trail.length = 0;
      }
    } else if (game.mode === 'playing') {
      updateBalls(ballFactor);
      updatePowerups(ballFactor);
      updateLasers(ballFactor);
      updateMagnet(f);
      updateEffects(f);
    }
  }

  // --- Rendering ----------------------------------------------------------
  function drawBackground(theme) {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, theme.bg[0]);
    gradient.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 40) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();

    if (!game.reducedMotion) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0, (game.time * 0.05) % H, W, 2);
    }
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(0, H - 2, W, 2);
    ctx.globalAlpha = 1;
  }

  function drawDecor(theme) {
    ctx.save();
    const t = game.reducedMotion ? 0 : game.time;
    const speed = game.reducedMotion ? 0.25 : 1;

    if (theme.decor === 'sun') {
      const sunY = 205, radius = 108;
      const g = ctx.createLinearGradient(0, sunY - radius, 0, sunY + radius);
      g.addColorStop(0, 'rgba(255,225,140,0.55)');
      g.addColorStop(1, 'rgba(255,45,185,0.28)');
      ctx.fillStyle = g;
      ctx.shadowColor = '#ff5edb'; ctx.shadowBlur = 55;
      ctx.beginPath(); ctx.arc(W / 2, sunY, radius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(10,3,26,0.92)';
      for (let i = 0; i < 7; i++) ctx.fillRect(W / 2 - radius, sunY + i * 9, radius * 2, 2 + i * 0.8);
      ctx.strokeStyle = 'rgba(255,94,219,0.13)'; ctx.lineWidth = 1;
      for (let i = -9; i <= 9; i++) {
        ctx.beginPath(); ctx.moveTo(W / 2 + i * 22, H); ctx.lineTo(W / 2 + i * 3, 310); ctx.stroke();
      }
    } else if (theme.decor === 'aurora') {
      for (let band = 0; band < 3; band++) {
        const g = ctx.createLinearGradient(0, 0, 0, 260);
        g.addColorStop(0, `rgba(${rgbTriplet(band === 0 ? theme.accent : theme.accent2)},0.14)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= W; x += 24) {
          ctx.lineTo(x, 60 + band * 34 + Math.sin(x * 0.009 + t * 0.0006 + band) * 26);
        }
        ctx.lineTo(W, 0);
        ctx.closePath();
        ctx.fill();
      }
    } else if (theme.decor === 'waves') {
      ctx.strokeStyle = 'rgba(103,232,249,0.14)';
      ctx.lineWidth = 2;
      for (let row = 0; row < 5; row++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const y = H - 30 - row * 26 + Math.sin(x * 0.017 + t * 0.001 + row) * 7;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } else if (theme.decor === 'rain') {
      ctx.strokeStyle = 'rgba(74,222,128,0.22)';
      ctx.lineWidth = 1.5;
      for (const d of decor) {
        const y = (d.y + t * 0.16 * d.speed * speed) % (H + 60) - 30;
        ctx.beginPath(); ctx.moveTo(d.x, y); ctx.lineTo(d.x - 4, y + 18 + d.r * 4); ctx.stroke();
      }
    } else if (theme.decor === 'sand') {
      ctx.strokeStyle = 'rgba(253,230,138,0.16)';
      ctx.lineWidth = 1.5;
      for (const d of decor) {
        const x = (d.x + t * 0.06 * d.speed * speed) % (W + 80) - 40;
        ctx.beginPath(); ctx.moveTo(x, d.y); ctx.lineTo(x + 22, d.y - 7); ctx.stroke();
      }
    } else if (theme.decor === 'sprinkles') {
      for (const d of decor) {
        const y = (d.y + t * 0.035 * d.speed * speed) % (H + 30) - 15;
        ctx.strokeStyle = theme.bricks[Math.floor(d.phase * 3) % theme.bricks.length];
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(d.x, y); ctx.lineTo(d.x + 4, y + 6); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (theme.decor === 'sparks') {
      for (let i = 0; i < 16; i++) {
        const angle = -Math.PI / 2 + Math.sin(t * 0.0006 + i) * 0.5;
        const length = 40 + Math.sin(t * 0.003 + i) * 26;
        ctx.strokeStyle = `rgba(250,204,21,${0.15 + Math.sin(t * 0.004 + i) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W / 2 + (i - 8) * 34, H);
        ctx.lineTo(W / 2 + (i - 8) * 34 + Math.cos(angle) * length, H + Math.sin(angle) * length);
        ctx.stroke();
      }
    } else if (theme.decor === 'grid') {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, (t * 0.05) % H, W, 1);
    } else {
      for (const d of decor) {
        const alpha = 0.3 + (Math.sin(t * 0.003 + d.phase) + 1) * 0.2;
        let x = d.x;
        let y = d.y;
        if (theme.decor === 'embers') {
          y = H - ((t * 0.035 * d.speed * speed + d.y) % (H + 40));
          x = d.x + Math.sin(t * 0.002 + d.phase) * 12;
          ctx.fillStyle = `rgba(255,150,60,${alpha})`; ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 10;
        } else if (theme.decor === 'snow') {
          y = (d.y + t * 0.02 * d.speed * speed) % (H + 40) - 20;
          x = d.x + Math.sin(t * 0.0015 + d.phase) * 10;
          ctx.fillStyle = `rgba(225,245,255,${alpha + 0.15})`; ctx.shadowColor = '#bae6fd'; ctx.shadowBlur = 8;
        } else if (theme.decor === 'bubbles') {
          y = H - ((t * 0.025 * d.speed * speed + d.y) % (H + 40));
          x = d.x + Math.sin(t * 0.002 + d.phase) * 14;
          ctx.strokeStyle = `rgba(120,255,150,${alpha})`;
          ctx.lineWidth = 1.4; ctx.shadowColor = '#39ff88'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(x, y, d.r * 1.9, 0, Math.PI * 2); ctx.stroke();
          continue;
        } else {
          ctx.fillStyle = `rgba(235,225,255,${Math.max(0.12, alpha)})`;
          ctx.shadowColor = theme.accent2; ctx.shadowBlur = 7;
        }
        ctx.beginPath(); ctx.arc(x, y, d.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawBrick(brick, theme) {
    if (!brick.alive || brick.appear <= 0) return;
    const e = easeOut(brick.appear);
    ctx.save();
    ctx.translate(brick.x + brick.w / 2, brick.y + brick.h / 2);
    ctx.scale(e, e);
    const x = -brick.w / 2;
    const y = -brick.h / 2;
    ctx.globalAlpha = (0.55 + 0.45 * (brick.hp / brick.maxHp)) * Math.min(1, brick.appear * 1.6) * brick.alpha;

    if (brick.indestructible) {
      const metal = ctx.createLinearGradient(x, y, x + brick.w, y + brick.h);
      metal.addColorStop(0, '#f8fafc'); metal.addColorStop(0.45, '#64748b'); metal.addColorStop(1, '#334155');
      ctx.fillStyle = metal;
      roundRectPath(ctx, x, y, brick.w, brick.h, 5); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 6, y + brick.h - 5); ctx.lineTo(x + brick.w - 6, y + 5); ctx.stroke();
    } else {
      let grad;
      if (theme.decor === 'snow') {
        grad = ctx.createLinearGradient(x, y, x + brick.w, y + brick.h);
        grad.addColorStop(0, 'rgba(255,255,255,0.92)'); grad.addColorStop(1, brick.color);
      } else if (theme.decor === 'bubbles') {
        grad = ctx.createRadialGradient(0, 0, 2, 0, 0, brick.w / 2);
        grad.addColorStop(0, shade(brick.color, 0.2)); grad.addColorStop(1, shade(brick.color, -0.5));
      } else {
        grad = ctx.createLinearGradient(0, y, 0, y + brick.h);
        grad.addColorStop(0, shade(brick.color, 0.26)); grad.addColorStop(1, shade(brick.color, -0.4));
      }
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = game.reducedMotion ? 0 : 11 + Math.sin(game.time * 0.004 + brick.x * 0.05) * 3;
      ctx.fillStyle = grad;
      roundRectPath(ctx, x, y, brick.w, brick.h, 5); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      roundRectPath(ctx, x + 4, y + 3, brick.w - 8, 4, 2); ctx.fill();
    }

    if (brick.explosive) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '800 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✸', 0, 2);
    }
    if (brick.boss) {
      const pulse = 0.5 + 0.5 * Math.sin(game.time * 0.005);
      ctx.strokeStyle = theme.accent2;
      ctx.lineWidth = 2;
      ctx.shadowColor = theme.accent2; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(0, 0, 11 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      const ratio = clamp(brick.hp / brick.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRectPath(ctx, -brick.w / 2, y - 12, brick.w, 5, 2.5); ctx.fill();
      ctx.fillStyle = theme.accent2;
      roundRectPath(ctx, -brick.w / 2, y - 12, brick.w * ratio, 5, 2.5); ctx.fill();
    }
    if (brick.maxHp > 1 && brick.hp > 1 && !brick.boss) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(brick.w / 2 - 8, y + 7, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (brick.flash > 0) {
      ctx.globalAlpha = brick.flash * 0.8;
      ctx.fillStyle = '#ffffff';
      roundRectPath(ctx, x, y, brick.w, brick.h, 5); ctx.fill();
    }
    ctx.restore();
  }

  function drawBricks(theme) {
    for (const brick of bricks) drawBrick(brick, theme);
  }

  function drawPowerupIcon(type, size, color) {
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.13);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const s = size;

    if (type === 'wide') {
      ctx.beginPath(); ctx.moveTo(-s * 0.42, 0); ctx.lineTo(s * 0.42, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.42, 0); ctx.lineTo(-s * 0.18, -s * 0.2); ctx.lineTo(-s * 0.18, s * 0.2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.42, 0); ctx.lineTo(s * 0.18, -s * 0.2); ctx.lineTo(s * 0.18, s * 0.2); ctx.closePath(); ctx.fill();
    } else if (type === 'slow') {
      ctx.beginPath(); ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 0.24); ctx.moveTo(0, 0); ctx.lineTo(s * 0.2, s * 0.1); ctx.stroke();
    } else if (type === 'life') {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.34);
      ctx.bezierCurveTo(-s * 0.58, -s * 0.04, -s * 0.34, -s * 0.44, 0, -s * 0.17);
      ctx.bezierCurveTo(s * 0.34, -s * 0.44, s * 0.58, -s * 0.04, 0, s * 0.34);
      ctx.closePath(); ctx.fill();
    } else if (type === 'multi') {
      for (const [dx, dy] of [[-s * 0.3, s * 0.14], [0, -s * 0.26], [s * 0.3, s * 0.14]]) {
        ctx.beginPath(); ctx.arc(dx, dy, s * 0.13, 0, Math.PI * 2); ctx.fill();
      }
    } else if (type === 'laser') {
      ctx.beginPath(); ctx.moveTo(0, s * 0.38); ctx.lineTo(0, -s * 0.38); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.16); ctx.lineTo(0, -s * 0.4); ctx.lineTo(s * 0.18, -s * 0.16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s * 0.36, s * 0.3); ctx.lineTo(-s * 0.36, -s * 0.05); ctx.moveTo(s * 0.36, s * 0.3); ctx.lineTo(s * 0.36, -s * 0.05); ctx.stroke();
    } else if (type === 'fire') {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.42);
      ctx.bezierCurveTo(s * 0.42, -s * 0.05, s * 0.3, s * 0.4, 0, s * 0.4);
      ctx.bezierCurveTo(-s * 0.36, s * 0.4, -s * 0.4, -s * 0.02, 0, -s * 0.42);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.ellipse(0, s * 0.14, s * 0.1, s * 0.17, 0, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'magnet') {
      ctx.lineWidth = s * 0.22;
      ctx.beginPath(); ctx.arc(0, -s * 0.02, s * 0.27, Math.PI, 0); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.27, -s * 0.02); ctx.lineTo(-s * 0.27, s * 0.28);
      ctx.moveTo(s * 0.27, -s * 0.02); ctx.lineTo(s * 0.27, s * 0.28);
      ctx.stroke();
      ctx.lineWidth = Math.max(2, s * 0.14);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(-s * 0.27, s * 0.28); ctx.lineTo(-s * 0.27, s * 0.4); ctx.moveTo(s * 0.27, s * 0.28); ctx.lineTo(s * 0.27, s * 0.4); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPowerups() {
    for (const p of powerups) {
      const color = POWERUP_STYLE[p.type];
      const bob = Math.sin(game.time * 0.005 + p.bob) * 2.2;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + bob);
      const scale = easeOut(p.appear) * (1 + Math.sin(game.time * 0.008 + p.bob) * 0.04);
      ctx.scale(scale, scale);
      ctx.shadowColor = color; ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(5,12,28,0.94)';
      roundRectPath(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 8); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.save(); ctx.rotate(Math.sin(game.time * 0.004 + p.bob) * 0.12);
      drawPowerupIcon(p.type, 18, color);
      ctx.restore();
      ctx.globalAlpha = 0.55; ctx.strokeStyle = color; ctx.lineWidth = 1;
      const orbit = p.w * 0.72 + Math.sin(game.time * 0.006 + p.bob) * 2;
      ctx.beginPath(); ctx.arc(0, 0, orbit, game.time * 0.004 + p.bob, game.time * 0.004 + p.bob + Math.PI * 0.7); ctx.stroke();
      ctx.restore();
    }
  }

  function drawRings() {
    for (const r of rings) {
      const t = r.life / r.maxLife;
      ctx.save();
      ctx.globalAlpha = t * 0.8;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1 + t * 2.5;
      ctx.shadowColor = r.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 8;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.life + p.x) * 0.05);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  function drawLasers() {
    ctx.save();
    ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#e0fbff';
    for (const laser of lasers) {
      roundRectPath(ctx, laser.x, laser.y, laser.w, laser.h, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  function currentPaddleColors(theme) {
    const skin = SKINS[game.skin];
    return skin && skin.colors ? skin.colors : theme.paddle;
  }

  function drawPaddle(theme) {
    ctx.save();
    ctx.translate(paddle.x + paddle.w / 2, paddle.y + paddle.h / 2);
    ctx.scale(1 + paddle.squash * 0.05, 1 - paddle.squash * 0.32);
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = game.reducedMotion ? 8 : 22 + paddle.squash * 18;
    const colors = currentPaddleColors(theme);
    const gradient = ctx.createLinearGradient(-paddle.w / 2, 0, paddle.w / 2, 0);
    gradient.addColorStop(0, colors[0]); gradient.addColorStop(0.5, colors[1]); gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    roundRectPath(ctx, -paddle.w / 2, -paddle.h / 2, paddle.w, paddle.h, 7); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRectPath(ctx, -paddle.w / 2 + 8, -paddle.h / 2 + 2, paddle.w - 16, 3, 1.5); ctx.fill();
    if (game.magnetTimer > 0) {
      ctx.strokeStyle = 'rgba(163,230,53,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, paddle.w * 0.7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    }
    if (game.laserTimer > 0) {
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-paddle.w * 0.34 - 2, -paddle.h / 2 - 5, 4, 6);
      ctx.fillRect(paddle.w * 0.34 - 2, -paddle.h / 2 - 5, 4, 6);
    }
    ctx.restore();
  }

  function drawBalls(theme) {
    for (const ball of balls) {
      if (!game.reducedMotion) {
        for (let i = 0; i < ball.trail.length; i++) {
          const point = ball.trail[i];
          const a = (i + 1) / ball.trail.length;
          ctx.save();
          ctx.globalAlpha = a * (game.fireTimer > 0 ? 0.55 : 0.35);
          ctx.fillStyle = game.fireTimer > 0 ? '#fb923c' : theme.ballGlow;
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(point.x, point.y, ball.r * (0.22 + 0.62 * a), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.save();
      ctx.shadowColor = game.fireTimer > 0 ? '#fb923c' : theme.ballGlow;
      ctx.shadowBlur = game.reducedMotion ? 8 : 20 + Math.sin(game.time * 0.012) * 6;
      ctx.fillStyle = game.fireTimer > 0 ? '#fff7ed' : theme.ball;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawPopups() {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 14px Segoe UI, sans-serif';
    for (const p of popups) {
      ctx.globalAlpha = Math.min(1, (p.life / p.maxLife) * 1.6);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.restore();
  }

  function drawCombo() {
    if (game.combo < 5 || game.mode !== 'playing') return;
    const mult = 1 + Math.floor(game.combo / 5);
    const pulse = game.reducedMotion ? 1 : 1 + Math.sin(game.time * 0.012) * 0.07;
    ctx.save();
    ctx.translate(W - 92, 44);
    ctx.scale(pulse, pulse);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 17px Segoe UI, sans-serif';
    ctx.fillStyle = game.theme.accent2;
    ctx.shadowColor = game.theme.accent2; ctx.shadowBlur = 16;
    ctx.fillText(`COMBO ×${mult}`, 0, 0);
    ctx.shadowBlur = 0;
    const ratio = clamp(game.comboTimer / 180, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRectPath(ctx, -56, 14, 112, 4, 2); ctx.fill();
    ctx.fillStyle = game.theme.accent2;
    roundRectPath(ctx, -56, 14, 112 * ratio, 4, 2); ctx.fill();
    ctx.restore();
  }

  function drawCanvasHUD() {
    ctx.save();
    ctx.font = '800 13px Segoe UI, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    let y = 28;
    if (game.timeAttack) {
      const seconds = Math.ceil(game.timeLeft / 60);
      ctx.fillStyle = seconds <= 10 ? '#ff5d8f' : game.theme.accent;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.fillText(`TIME  ${seconds}s`, 18, y);
      y += 20;
    }
    if (game.daily) {
      ctx.fillStyle = game.theme.accent2;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fillText(`DAILY  ${dateSeed()}`, 18, y);
      y += 20;
    }
    if (game.ngPlus > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fillText(`NEW GAME+ ${game.ngPlus}`, 18, y);
      y += 20;
    }
    if (game.lastLifeSlow > 0) {
      ctx.fillStyle = '#a78bfa';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fillText('TIME DILATION', 18, y);
    }
    ctx.restore();
  }

  function drawFlash() {
    if (game.flashAlpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.flashAlpha);
    ctx.fillStyle = game.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawMessages() {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (game.introTimer > 0) {
      const t = game.introTimer / game.introDuration;
      const alpha = Math.min(1, t * 5, (1 - t) * 8);
      const slide = (1 - easeOut(Math.min(1, (1 - t) * 3))) * 26;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(W / 2, H / 2 - 20 - slide);
      ctx.fillStyle = 'rgba(5,10,26,0.88)';
      roundRectPath(ctx, -190, -52, 380, 104, 16); ctx.fill();
      ctx.strokeStyle = game.theme.accent; ctx.lineWidth = 1.5;
      ctx.shadowColor = game.theme.accent; ctx.shadowBlur = 18; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = '800 12px Segoe UI, sans-serif';
      ctx.fillStyle = game.theme.accent;
      ctx.fillText(`LEVEL ${String(game.level).padStart(2, '0')}`, 0, -26);
      ctx.font = '900 30px Segoe UI, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = game.theme.accent; ctx.shadowBlur = 16;
      ctx.fillText(game.theme.name, 0, 3);
      ctx.shadowBlur = 0;
      ctx.font = '500 12px Segoe UI, sans-serif';
      ctx.fillStyle = '#a9bde0';
      ctx.fillText(game.theme.tag, 0, 30);
      ctx.restore();
    }

    if (game.messageTimer > 0) {
      ctx.globalAlpha = Math.min(1, game.messageTimer / 30);
      ctx.font = '800 24px Segoe UI, sans-serif';
      ctx.fillStyle = '#eafcff';
      ctx.shadowColor = game.theme.accent; ctx.shadowBlur = 18;
      ctx.fillText(game.message, W / 2, H / 2 + 62);
      ctx.shadowBlur = 0;
    }

    if (game.mode === 'ready' && game.messageTimer <= 0 && game.introTimer <= 0) {
      ctx.globalAlpha = 0.85;
      ctx.font = '700 15px Segoe UI, sans-serif';
      ctx.fillStyle = '#dcecff';
      ctx.fillText('CLICK OR PRESS SPACE TO LAUNCH', W / 2, H / 2 + 62);
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (game.shake > 0.4 && !game.reducedMotion) {
      ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
    }
    const theme = game.theme;
    drawBackground(theme);
    drawDecor(theme);
    drawBricks(theme);
    drawRings();
    drawPowerups();
    drawParticles();
    drawLasers();
    drawPaddle(theme);
    drawBalls(theme);
    drawPopups();
    drawCombo();
    drawCanvasHUD();
    drawFlash();
    drawMessages();
    ctx.restore();
  }

  // --- Main loop ----------------------------------------------------------
  function loop(now) {
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;
    update(dt / (1000 / 60), dt);
    draw();
    requestAnimationFrame(loop);
  }

  // --- Input --------------------------------------------------------------
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', ' ', 'spacebar', 'shift'].includes(key)) event.preventDefault();

    if (key === 'shift') keys.magnet = true;
    if (key === 'arrowleft' || key === 'a') keys.left = true;
    if (key === 'arrowright' || key === 'd') keys.right = true;

    if (key === 'escape') {
      if (game.mode === 'levelselect' || game.mode === 'settings' || game.mode === 'scores') showMenu();
      else if (game.mode === 'playing' || game.mode === 'ready') togglePause();
      return;
    }
    if (game.mode === 'levelselect' && /^[1-9]$/.test(key)) {
      const chosen = Number(key);
      if (chosen <= CAMPAIGN_LEVELS) startGame(chosen);
      return;
    }
    if (key === 'p') { togglePause(); return; }
    if (key === ' ' || key === 'spacebar' || key === 'enter') {
      if (game.mode === 'playing') { fireLasers(); return; }
      if (game.mode === 'ready') launch();
      else primaryAction();
    }
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'shift') keys.magnet = false;
    if (key === 'arrowleft' || key === 'a') keys.left = false;
    if (key === 'arrowright' || key === 'd') keys.right = false;
  });

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    paddle.targetX = px - paddle.w / 2;
  });

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (event.shiftKey) keys.magnet = true;
    if (game.mode === 'ready') launch();
    else if (game.mode === 'playing') fireLasers();
    else if (game.mode !== 'paused') primaryAction();
  });

  window.addEventListener('pointerup', () => { keys.magnet = false; });

  ui.playBtn.addEventListener('click', () => primaryAction());
  ui.continueBtn.addEventListener('click', continueGame);
  ui.selectBtn.addEventListener('click', showLevelSelect);
  ui.settingsBtn.addEventListener('click', showSettings);
  ui.scoresBtn.addEventListener('click', showScores);
  ui.dailyBtn.addEventListener('click', startDaily);
  ui.timeBtn.addEventListener('click', startTimeAttack);
  ui.backBtn.addEventListener('click', showMenu);
  ui.settingsBackBtn.addEventListener('click', showMenu);
  ui.scoresBackBtn.addEventListener('click', showMenu);

  ui.soundBtn.addEventListener('click', () => {
    game.muted = !game.muted;
    ui.soundBtn.setAttribute('aria-pressed', String(game.muted));
    ui.soundBtn.setAttribute('title', game.muted ? 'Unmute sound' : 'Mute sound');
  });

  window.addEventListener('blur', () => {
    if (game.mode === 'playing' || game.mode === 'ready') togglePause();
    keys.left = false;
    keys.right = false;
    keys.magnet = false;
  });

  // --- Boot ---------------------------------------------------------------
  applySettings();
  buildLevelGrid();
  buildLevel();
  updateHUD();
  ui.score.textContent = '00000';
  showMenu();
  requestAnimationFrame(loop);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support optional */ });
  }
})();
