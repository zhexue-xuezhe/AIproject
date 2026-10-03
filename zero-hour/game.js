(() => {
  'use strict';

  if (!window.THREE) {
    document.body.innerHTML = '<div style="padding:40px;color:white;background:#071016;font-family:sans-serif">Three.js 加载失败，请确认 three.min.js 与 index.html 位于同一目录。</div>';
    return;
  }

  const $ = (id) => document.getElementById(id);
  const dom = {
    canvas: $('gameCanvas'), hud: $('gameHud'), menu: $('menuOverlay'), pause: $('pauseOverlay'), result: $('resultOverlay'),
    clock: $('clockText'), modeLabel: $('modeLabel'), roundText: $('roundText'), blueScore: $('blueScore'), redScore: $('redScore'),
    radar: $('radar'), radarMap: $('radarMap'), radarKills: $('radarKills'), objectiveText: $('objectiveText'), objectiveProgress: $('objectiveProgress'),
    aliveCounter: $('aliveCounter'), killFeed: $('killFeed'), announcement: $('announcement'), hitMarker: $('hitMarker'), crosshair: $('crosshair'),
    healthText: $('healthText'), armorText: $('armorText'), healthFill: $('healthFill'), armorFill: $('armorFill'), lowHealth: $('lowHealth'),
weaponName: $('weaponName'), primarySlotName: $('primarySlotName'), scopeOverlay: $('scopeOverlay'), backpackOverlay: $('backpackOverlay'), backpackGrid: $('backpackGrid'), closeBackpackButton: $('closeBackpackButton'), ammoText: $('ammoText'), ammoPips: $('ammoPips'), grenadeText: $('grenadeText'), reloadRing: $('reloadRing'),
    damageVignette: $('damageVignette'), toast: $('messageToast'), actionPrompt: $('actionPrompt'), weaponRail: $('weaponRail'),
    menuFps: $('menuFps'), sensitivity: $('sensitivity'), sensValue: $('sensValue'), difficulty: $('difficulty'), quality: $('quality'),
    touchControls: $('touchControls'), movePad: $('movePad'), moveKnob: $('moveKnob'), touchFire: $('touchFire'), touchJump: $('touchJump'),
touchCrouch: $('touchCrouch'), touchBackpack: $('touchBackpack'), touchReload: $('touchReload'), pauseKills: $('pauseKills'), pauseTime: $('pauseTime'),
    resultKicker: $('resultKicker'), resultTitle: $('resultTitle'), resultReason: $('resultReason'), resultKills: $('resultKills'),
    resultAccuracy: $('resultAccuracy'), resultStreak: $('resultStreak'), resultDamage: $('resultDamage')
  };

  const WEAPONS = [
    { id: 'm4a1', name: 'M4A1', backpack: 1, role: '稳定突击步枪', damage: 26, rpm: 650, mag: 30, reserve: 120, reload: 1850, spread: 0.55, adsSpread: 0.22, moveSpread: 2.3, recoil: 0.014, recover: 4.6, auto: true, pellets: 1, range: 95, model: 'm4a1', sound: 'rifle', bar: 76 },
    { id: 'ak47', name: 'AK47', backpack: 2, role: '高伤害突击步枪', damage: 33, rpm: 600, mag: 30, reserve: 120, reload: 2150, spread: 0.72, adsSpread: 0.3, moveSpread: 2.7, recoil: 0.025, recover: 3.9, auto: true, pellets: 1, range: 92, model: 'ak47', sound: 'ak', bar: 84 },
    { id: 'awm', name: 'AWM', backpack: 3, role: '远程狙击步枪', damage: 125, rpm: 42, mag: 5, reserve: 25, reload: 2950, spread: 0.075, adsSpread: 0.008, moveSpread: 3.2, recoil: 0.12, recover: 2.8, auto: false, pellets: 1, range: 180, model: 'awm', sound: 'sniper', scope: true, bar: 96 },
    { id: 'shotgun', name: '霰弹枪', backpack: 4, role: '近距离火力压制', damage: 17, rpm: 82, mag: 7, reserve: 35, reload: 2450, spread: 2.9, adsSpread: 1.7, moveSpread: 1.35, recoil: 0.067, recover: 5.8, auto: false, pellets: 8, range: 40, model: 'shotgun', sound: 'shotgun', bar: 68 },
    { id: 'smg', name: '冲锋枪', backpack: 5, role: '高射速机动武器', damage: 17, rpm: 900, mag: 35, reserve: 140, reload: 1600, spread: 0.9, adsSpread: 0.42, moveSpread: 1.65, recoil: 0.011, recover: 5.3, auto: true, pellets: 1, range: 68, model: 'smg', sound: 'smg', bar: 72 },
    { id: 'lmg', name: '机枪', backpack: 6, role: '大容量持续火力', damage: 29, rpm: 720, mag: 100, reserve: 200, reload: 3600, spread: 1.15, adsSpread: 0.52, moveSpread: 3.4, recoil: 0.018, recover: 4.0, auto: true, pellets: 1, range: 105, model: 'lmg', sound: 'lmg', bar: 91 },
    { id: 'qbz', name: 'QBZ', backpack: 7, role: '平衡型无托步枪', damage: 25, rpm: 670, mag: 30, reserve: 120, reload: 1780, spread: 0.58, adsSpread: 0.2, moveSpread: 2.1, recoil: 0.014, recover: 4.8, auto: true, pellets: 1, range: 98, model: 'qbz', sound: 'qbz', bar: 80 }
  ];
  const SECONDARY_WEAPON = { id: 'p9', name: 'P9', damage: 34, rpm: 380, mag: 15, reserve: 75, reload: 1350, spread: 0.7, adsSpread: 0.28, moveSpread: 1.85, recoil: 0.024, recover: 5.4, auto: false, pellets: 1, range: 58, model: 'pistol', sound: 'pistol' };
  const C4_WEAPON = { id: 'c4', name: 'C4 炸药包', damage: 0, rpm: 30, mag: 1, reserve: 0, reload: 0, spread: 0, adsSpread: 0, moveSpread: 1, recoil: 0.01, recover: 8, auto: false, pellets: 0, range: 1, model: 'c4', sound: 'knife', melee: false, c4: true };
  const MELEE_WEAPON = { id: 'knife', name: '战术刀', damage: 90, rpm: 125, mag: 1, reserve: 0, reload: 0, spread: 0, adsSpread: 0, moveSpread: 1, recoil: 0.045, recover: 8, auto: false, pellets: 1, range: 2.6, model: 'knife', sound: 'knife', melee: true };

  const WEAPON_VIEW = {
    m4a1: { scale: 1.12, x: 0.1, y: -0.15, z: -0.5, yaw: 0.055, pitch: -0.018 },
    ak47: { scale: 1.05, x: 0.11, y: -0.16, z: -0.52, yaw: 0.055, pitch: -0.018 },
    awm: { scale: 1.0, x: 0.34, y: -0.135, z: -0.85, yaw: 0.16, pitch: -0.015 },
    shotgun: { scale: 1.02, x: 0.115, y: -0.16, z: -0.56, yaw: 0.055, pitch: -0.018 },
    smg: { scale: 1.05, x: 0.115, y: -0.155, z: -0.5, yaw: 0.06, pitch: -0.018 },
    lmg: { scale: 1.05, x: 0.15, y: -0.17, z: -0.62, yaw: 0.05, pitch: -0.018 },
    qbz: { scale: 0.9, x: 0.11, y: -0.16, z: -0.56, yaw: 0.055, pitch: -0.018 },
    pistol: { scale: 1.0, x: 0.135, y: -0.11, z: -0.34, yaw: 0.1, pitch: -0.025 },
    knife: { scale: 1.0, x: 0.14, y: -0.12, z: -0.5, yaw: -0.06, pitch: -0.02 },
    c4: { scale: 1.0, x: 0.16, y: -0.12, z: -0.42, yaw: 0.08, pitch: -0.03 }
  };

  const HAND_LAYOUTS = {
    m4a1: { left: [0.44, -0.24, -1.12], right: [0.37, -0.41, -0.72] },
    ak47: { left: [0.42, -0.25, -1.16], right: [0.36, -0.42, -0.78] },
    awm: { left: [0.48, -0.4, -1.43], right: [0.64, -0.44, -0.9], leftRot: [1.3, 0, 0.15], rightRot: [0, -1.2, 0.1], handScale: 1.2 },
    shotgun: { left: [0.40, -0.30, -1.20], right: [0.37, -0.35, -0.83] },
    smg: { left: [0.39, -0.45, -1.14], right: [0.38, -0.32, -0.60] },
    lmg: { left: [0.29, -0.29, -0.96], right: [0.49, -0.29, -0.87] },
    qbz: { left: [0.37, -0.25, -1.05], right: [0.33, -0.37, -0.74] },
    pistol: { left: [0.28, -0.24, -0.60], right: [0.34, -0.30, -0.48] },
    knife: { left: [-0.05, -0.30, -0.65], right: [0.42, -0.31, -0.66], leftRot: [0.2, 0, 0.3], rightRot: [-0.2, -0.35, 0.1] },
    c4: { left: [0.04, -0.34, -0.5], right: [0.4, -0.32, -0.52], leftRot: [0.3, 0, 0.2], rightRot: [0, -0.45, 0.1] }
  };

  const MODES = {
    strike: { name: '团队歼灭', icon: 'TDM', duration: 300, target: 20, enemies: 6, respawn: 3.6, enemyFire: true, objective: '抵御 5 波敌军进攻', kicker: '作战目标', waves: 5, waveBase: 4, waveGrowth: 1 },
    bomb: { name: '爆破模式', icon: 'C4', duration: 200, target: 5, enemies: 7, respawn: 0, enemyFire: true, objective: '在 A 或 B 点安放 C4 并引爆', kicker: '回合目标', allies: 6, bomb: true },
    range: { name: '靶场训练', icon: 'TRN', duration: 60, target: 30, enemies: 6, respawn: 0.85, enemyFire: false, objective: '60 秒内完成 30 次击倒', kicker: '训练目标' }
  };

  const MAPS = {
    harbor: {
      name: '海港仓储', code: 'HQ-07', ground: 0x33434a, groundLine: 0x587078, skyTop: 0x102a3b, skyBottom: 0x8bb4bd, fog: 0x526d73,
      accent: 0x34b8ba, hemiSky: 0x9edbe7, hemiGround: 0x182226,
      spawns: [[-66,-64],[-46,-66],[0,-65],[46,-66],[66,-62],[62,8],[64,58],[20,65],[-22,65],[-64,56],[-66,8]],
      covers: [
        [-28,-38,18,5,4.2,'container'], [8,-40,20,5,4.2,'container'], [43,-37,18,5,4.2,'container'],
        [-55,-6,5,18,4.8,'container'], [-18,-12,16,4,3.1,'crate'], [24,-12,17,4,3.1,'crate'],
        [55,-6,5,18,4.2,'container'], [-48,19,6,18,3.6,'wall'], [-18,18,21,5,2.8,'crate'],
        [17,18,19,5,2.8,'crate'], [43,21,5,20,4.4,'container'], [-31,45,20,5,4.6,'container'],
        [6,43,21,5,4.6,'container'], [39,47,14,5,3.2,'crate'], [-64,-42,13,5,3.1,'crate'], [65,-42,13,5,3.1,'crate'],
        [-8,-32,6,4,2.6,'crate'], [22,-28,6,4,2.4,'crate'], [-70,20,5,16,3.6,'container'], [70,20,5,16,3.6,'container']
      ],
      decor: [[-44,-47,7,5,2.6,'crate'],[42,-47,7,5,2.6,'crate'],[0,6,14,2.8,2.2,'wall']],
      sites: [{ name: 'A', x: 42, z: -18, radius: 13 }, { name: 'B', x: -42, z: -18, radius: 13 }]
    },
    foundry: {
      name: '废弃铸炉', code: 'IN-13', ground: 0x3b3732, groundLine: 0x695f55, skyTop: 0x281d19, skyBottom: 0xb77d4b, fog: 0x5b493e,
      accent: 0xff8a3d, hemiSky: 0xf2bf88, hemiGround: 0x181513,
      spawns: [[-66,-60],[-35,-66],[5,-65],[39,-63],[66,-51],[67,-5],[65,55],[31,66],[-3,66],[-42,62],[-66,36],[-66,-10]],
      covers: [
        [-34,-35,13,13,4.6,'tank'], [0,-39,20,5,3.4,'wall'], [35,-34,13,13,4.6,'tank'],
        [-57,-13,6,22,4.1,'wall'], [-22,-10,14,5,3.1,'crate'], [20,-10,14,5,3.1,'crate'],
        [55,-10,6,24,4.1,'wall'], [-43,15,13,13,4.2,'tank'], [0,15,15,15,3.2,'crate'],
        [42,16,13,13,4.2,'tank'], [-25,44,20,5,4.3,'wall'], [21,44,20,5,4.3,'wall'],
        [-64,45,12,6,3.2,'crate'], [61,48,13,6,3.2,'crate'], [-3,-16,4,16,2.8,'wall'], [-3,42,4,17,2.8,'wall'],
        [-16,-30,6,5,2.8,'crate'], [16,-30,6,5,2.8,'crate'], [-74,6,5,14,3.8,'tank'], [74,6,5,14,3.8,'tank']
      ],
      decor: [[-59,-41,8,8,1.2,'pipe'],[57,-43,8,8,1.2,'pipe'],[0,-5,11,2,1.8,'wall'],[0,31,11,2,1.8,'wall']],
      sites: [{ name: 'A', x: 40, z: -14, radius: 13 }, { name: 'B', x: -40, z: -14, radius: 13 }]
    },
    frostline: {
      name: '霜线站', code: 'AR-21', ground: 0xa9bcc2, groundLine: 0x718891, skyTop: 0x2c4d65, skyBottom: 0xd2e3e7, fog: 0xa9c0c8,
      accent: 0x85d9ff, hemiSky: 0xe4f7fb, hemiGround: 0x68787c,
      spawns: [[-66,-64],[-29,-66],[13,-66],[52,-64],[67,-35],[67,9],[65,53],[26,66],[-17,65],[-53,61],[-67,27],[-66,-13]],
      covers: [
        [-38,-38,18,6,3.2,'ice'], [4,-40,21,5,4.0,'wall'], [45,-37,17,6,3.2,'ice'],
        [-62,-14,6,24,3.4,'ice'], [-22,-13,18,5,2.6,'ice'], [25,-13,18,5,2.6,'ice'],
        [55,-6,7,20,3.8,'wall'], [-47,20,17,6,3.3,'ice'], [-12,18,19,5,4.0,'wall'],
        [27,19,18,5,4.0,'wall'], [49,44,18,6,3.1,'ice'], [-21,44,22,6,3.8,'wall'],
        [-63,42,12,5,2.7,'ice'], [0,63,19,5,3.0,'ice'], [-4,-5,5,17,3.1,'wall'], [-4,33,5,17,3.1,'wall'],
        [-16,-30,6,5,2.6,'ice'], [16,-30,6,5,2.6,'ice'], [-74,4,5,14,3.4,'ice'], [74,4,5,14,3.4,'ice']
      ],
      decor: [[-58,-50,10,6,1.3,'pipe'],[52,-53,11,6,1.3,'pipe'],[19,5,7,3,2.2,'ice'],[-26,6,7,3,2.2,'ice']],
      sites: [{ name: 'A', x: 40, z: -14, radius: 13 }, { name: 'B', x: -40, z: -14, radius: 13 }]
    },
    dust: {
      name: '沙漠灰', code: 'DS-02', ground: 0xc7ac7c, groundLine: 0x9c8258, skyTop: 0x5f86b0, skyBottom: 0xead8b6, fog: 0xd9c4a0,
      accent: 0xd9a441, hemiSky: 0xffe9c4, hemiGround: 0x6b5334,
      spawns: [[0,-68],[-24,-68],[24,-68],[-48,-64],[48,-64],[36,-56],[-36,-56],[-48,-20],[48,-20],[-48,20],[48,20],[-10,-40],[10,-40]],
      covers: [
        [-13,26,5,22,5,'sand'], [-13,6,5,10,5,'sand'], [-13,-16,5,20,5,'sand'],
        [13,26,5,22,5,'sand'], [13,6,5,10,5,'sand'], [13,-16,5,20,5,'sand'],
        [34,24,5,40,5,'sand'], [34,-22,5,24,5,'sand'], [58,10,5,68,5,'sand'],
        [-34,24,5,40,5,'sand'], [-34,-22,5,24,5,'sand'], [-58,10,5,68,5,'sand'],
        [44,-64,10,10,3,'crate'], [54,-34,6,6,2.8,'crate'], [26,-54,6,5,3.2,'sand'],
        [-44,-64,10,10,3,'crate'], [-54,-34,6,6,2.8,'crate'], [-26,-54,6,5,3.2,'sand'],
        [-18,-56,10,5,3.4,'sand'], [18,-56,10,5,3.4,'sand'], [-24,-64,8,5,2.8,'crate'], [24,-64,8,5,2.8,'crate'],
        [-24,50,12,5,3,'crate'], [24,50,12,5,3,'crate'],
        [0,10,7,5,2.6,'crate'], [0,-14,7,5,2.6,'crate'],
        [-20,34,8,4,2.6,'crate'], [20,34,8,4,2.6,'crate']
      ],
      decor: [[-64,52,8,8,1.2,'pipe'],[64,52,8,8,1.2,'pipe'],[-7,38,3,3,1.6,'crate'],[7,38,3,3,1.6,'crate'],[-7,-34,3,3,1.6,'crate'],[7,-34,3,3,1.6,'crate']],
      sites: [{ name: 'A', x: 44, z: -24, radius: 13 }, { name: 'B', x: -44, z: -24, radius: 13 }]
    },
    blacktown: {
      name: '黑色城镇', code: 'BT-05', ground: 0x4d5154, groundLine: 0x707679, skyTop: 0x1d2836, skyBottom: 0x8f9296, fog: 0x6a6f73,
      accent: 0xd94f3d, hemiSky: 0xbcc6d0, hemiGround: 0x22262a,
      spawns: [[-66,-62],[-40,-66],[0,-68],[40,-66],[66,-62],[62,-20],[-62,-20],[64,40],[-64,40],[30,62],[-30,62]],
      covers: [
        [-14,30,6,34,6,'wall'], [14,30,6,34,6,'wall'],
        [-14,-12,6,26,6,'wall'], [14,-12,6,26,6,'wall'],
        [0,12,8,5,2.6,'crate'], [0,-18,8,5,2.6,'crate'],
        [32,20,6,44,6,'wall'], [56,14,6,60,6,'wall'],
        [-32,20,6,44,6,'wall'], [-56,14,6,60,6,'wall'],
        [32,-50,10,10,3.2,'container'], [64,-56,8,6,3,'crate'],
        [-32,-50,10,10,3.2,'container'], [-64,-56,8,6,3,'crate'],
        [-22,50,12,5,3,'crate'], [22,50,12,5,3,'crate'],
        [-18,-58,10,5,3.2,'wall'], [18,-58,10,5,3.2,'wall'],
        [0,-46,14,5,3.4,'wall']
      ],
      decor: [[-66,52,8,8,1.2,'pipe'],[66,52,8,8,1.2,'pipe'],[-7,40,3,3,1.6,'crate'],[7,40,3,3,1.6,'crate']],
      sites: [{ name: 'A', x: 40, z: -16, radius: 13 }, { name: 'B', x: -40, z: -16, radius: 13 }]
    }
  };

  const state = {
    phase: 'menu', config: { mode: 'strike', map: 'harbor', difficulty: 'normal', quality: 'high' },
    scene: null, camera: null, renderer: null, clock: null, world: null, sky: null, weaponHolder: null,
    colliders: [], worldMeshes: [], spawns: [], enemies: [], allies: [], bomb: null, tracers: [], impacts: [], grenades: [], muzzleLight: null,
    currentMap: null, raycaster: new THREE.Raycaster(), audio: null, qualityHigh: true, soldierAsset: { scene: null, animations: [], ready: false, loading: false, error: null, promise: null },
    player: null, match: null, lastFrame: performance.now(), fps: 0, fpsFrames: 0, fpsTime: 0, elapsed: 0,
    pointerLocked: false, suppressPointerPause: false, transitionTimer: 0, previewAngle: 0
  };

  const input = {
    keys: Object.create(null), fireHeld: false, firePressed: false, ads: false, touchMoveX: 0, touchMoveY: 0,
    yaw: 0, pitch: 0, lastShot: 0, lastGrenade: 0, justReloaded: false, isTouch: matchMedia('(pointer: coarse)').matches
  };

  const tempVector = new THREE.Vector3();
  const tempVector2 = new THREE.Vector3();
  const yAxis = new THREE.Vector3(0, 1, 0);
  let damageVignetteTimer = 0;

  class SynthAudio {
    constructor() { this.ctx = null; this.noise = null; this.master = null; }
    resume() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          this.ctx = new AudioCtx();
          this.master = this.ctx.createGain();
          this.master.gain.value = 0.66;
          this.master.connect(this.ctx.destination);
          const len = this.ctx.sampleRate * 0.25;
          this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
          const data = this.noise.getChannelData(0);
          for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (_) { /* 音频失败不影响游戏 */ }
    }
    tone(freq, endFreq, duration, volume, type) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain); gain.connect(this.master); osc.start(now); osc.stop(now + duration + 0.02);
    }
    noiseBurst(duration, volume, filterFreq, type) {
      if (!this.ctx || !this.noise) return;
      const now = this.ctx.currentTime;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      source.buffer = this.noise;
      filter.type = type || 'bandpass';
      filter.frequency.value = filterFreq;
      filter.Q.value = 0.75;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.connect(filter); filter.connect(gain); gain.connect(this.master);
      source.start(now); source.stop(now + duration);
    }
    play(name) {
      if (!this.ctx) return;
      switch (name) {
        case 'ak': this.noiseBurst(0.14, 0.47, 1050, 'bandpass'); this.tone(96, 34, 0.13, 0.34, 'square'); break;
        case 'sniper': this.noiseBurst(0.34, 0.62, 620, 'lowpass'); this.tone(74, 24, 0.3, 0.48, 'sawtooth'); break;
        case 'lmg': this.noiseBurst(0.16, 0.43, 880, 'bandpass'); this.tone(105, 42, 0.14, 0.29, 'square'); break;
        case 'qbz': this.noiseBurst(0.105, 0.38, 1420, 'bandpass'); this.tone(128, 48, 0.1, 0.26, 'square'); break;
        case 'knife': this.noiseBurst(0.12, 0.16, 2600, 'highpass'); this.tone(420, 170, 0.08, 0.06, 'triangle'); break;
        case 'rifle': this.noiseBurst(0.12, 0.42, 1300, 'bandpass'); this.tone(115, 42, 0.11, 0.3, 'square'); break;
        case 'smg': this.noiseBurst(0.075, 0.3, 1800, 'bandpass'); this.tone(150, 70, 0.07, 0.2, 'square'); break;
        case 'shotgun': this.noiseBurst(0.23, 0.55, 750, 'lowpass'); this.tone(82, 28, 0.22, 0.4, 'sawtooth'); break;
        case 'pistol': this.noiseBurst(0.08, 0.34, 1550, 'bandpass'); this.tone(170, 55, 0.075, 0.24, 'square'); break;
        case 'hit': this.tone(920, 740, 0.055, 0.17, 'sine'); break;
        case 'headshot': this.tone(1380, 960, 0.11, 0.22, 'sine'); break;
        case 'kill': this.tone(1050, 1580, 0.18, 0.2, 'sine'); this.tone(180, 115, 0.1, 0.12, 'triangle'); break;
        case 'reload': this.tone(180, 260, 0.08, 0.12, 'square'); setTimeout(() => this.tone(260, 190, 0.09, 0.1, 'square'), 430); break;
        case 'hurt': this.noiseBurst(0.18, 0.4, 280, 'lowpass'); this.tone(95, 45, 0.2, 0.2, 'sine'); break;
        case 'enemyShot': this.noiseBurst(0.08, 0.11, 1000, 'bandpass'); break;
        case 'grenade': this.tone(420, 110, 0.35, 0.15, 'sawtooth'); break;
        case 'explode': this.noiseBurst(0.55, 0.58, 330, 'lowpass'); this.tone(72, 25, 0.5, 0.45, 'sawtooth'); break;
        case 'round': this.tone(460, 920, 0.28, 0.19, 'triangle'); break;
        case 'empty': this.tone(180, 140, 0.04, 0.1, 'square'); break;
      }
    }
  }

  function hexColor(hex) { return '#' + hex.toString(16).padStart(6, '0'); }

  function createSurfaceTexture(baseHex, lineHex, size, lines, dots) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size || 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hexColor(baseHex);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(image, 0, 0);
    ctx.strokeStyle = hexColor(lineHex);
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = 1;
    const step = size / (lines || 8);
    for (let p = 0; p <= size; p += step) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < (dots || 80); i++) {
      const r = 0.5 + Math.random() * 2.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
      ctx.beginPath(); ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2); ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function createSkyMaterial(top, bottom) {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { topColor: { value: new THREE.Color(top) }, bottomColor: { value: new THREE.Color(bottom) }, offset: { value: 10 }, exponent: { value: 0.8 } },
      vertexShader: 'varying vec3 vWorldPosition; void main(){ vec4 worldPosition=modelMatrix*vec4(position,1.0); vWorldPosition=worldPosition.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+vec3(0.0,offset,0.0)).y; gl_FragColor=vec4(mix(bottomColor,topColor,pow(max(h,0.0),exponent)),1.0); }'
    });
  }

  function initEngine() {
    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.08, 260);
    state.scene.add(state.camera);
    state.renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, powerPreference: 'high-performance' });
    state.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    state.renderer.setSize(innerWidth, innerHeight, false);
    state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.08;
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFShadowMap;
    state.clock = new THREE.Clock();
    state.audio = new SynthAudio();
    state.weaponHolder = new THREE.Group();
    state.camera.add(state.weaponHolder);
    const weaponFill = new THREE.PointLight(0xc8f5f1, 1.35, 3.2, 2);
    weaponFill.position.set(0.45, 0.25, 0.2);
    state.camera.add(weaponFill);
    const hemi = new THREE.HemisphereLight(0xd7edf2, 0x1b2528, 1.45);
    state.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe8ca, 2.45);
    sun.position.set(42, 70, 24);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.025;
    sun.shadow.camera.left = -85; sun.shadow.camera.right = 85;
    sun.shadow.camera.top = 85; sun.shadow.camera.bottom = -85;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 170;
    state.scene.add(sun);
  }

  function onResize() {
    if (!state.renderer) return;
    state.camera.aspect = innerWidth / innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(innerWidth, innerHeight, false);
  }

  function qualityChanged() {
    const high = dom.quality.value === 'high';
    state.qualityHigh = high;
    state.renderer.setPixelRatio(Math.min(devicePixelRatio, high ? 1.5 : 1));
    state.renderer.shadowMap.enabled = high;
    state.scene.traverse((obj) => { if (obj.isMesh) obj.material.needsUpdate = true; });
    showToast(high ? '已切换高画质' : '已切换性能模式');
  }

  function showToast(message, duration) {
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => dom.toast.classList.remove('show'), duration || 1400);
  }

  function announce(message, color) {
    dom.announcement.textContent = message;
    dom.announcement.style.color = color || '#fff';
    dom.announcement.classList.remove('show');
    void dom.announcement.offsetWidth;
    dom.announcement.classList.add('show');
  }

  function addKillFeed(killer, victim, weapon, against) {
    const row = document.createElement('div');
    row.className = 'feed-row' + (against ? ' against' : '');
    row.innerHTML = '<b>' + killer + '</b>  [' + weapon + ']  ' + victim;
    dom.killFeed.appendChild(row);
    while (dom.killFeed.children.length > 5) dom.killFeed.firstChild.remove();
    setTimeout(() => row.remove(), 4200);
  }

  function clearWorld() {
    if (state.sky) { state.scene.remove(state.sky); state.sky = null; }
    if (state.world) { state.scene.remove(state.world); state.world = null; }
    state.colliders = [];
    state.worldMeshes = [];
    state.spawns = [];
  }

  function buildMap(mapId) {
    clearWorld();
    const map = MAPS[mapId];
    state.currentMap = map;
    const world = new THREE.Group();
    state.world = world;
    state.scene.add(world);
    state.scene.background = new THREE.Color(map.skyBottom);
    state.scene.fog = new THREE.Fog(map.fog, 48, 205);

    const sky = new THREE.Mesh(new THREE.SphereGeometry(230, 32, 16), createSkyMaterial(map.skyTop, map.skyBottom));
    sky.frustumCulled = false;
    state.sky = sky;
    state.scene.add(sky);

    const groundTexture = createSurfaceTexture(map.ground, map.groundLine, 256, 8, 70);
    groundTexture.repeat.set(18, 18);
    const groundMat = new THREE.MeshStandardMaterial({ map: groundTexture, color: 0xffffff, roughness: 0.96, metalness: 0.02 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(178, 178), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    world.add(ground);

    const grid = new THREE.GridHelper(178, 44, map.accent, map.groundLine);
    grid.position.y = 0.015;
    grid.material.opacity = 0.17;
    grid.material.transparent = true;
    world.add(grid);

    const padMat = new THREE.MeshBasicMaterial({ color: map.accent, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const pad = new THREE.Mesh(new THREE.RingGeometry(9, 12, 48), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.02;
    world.add(pad);

    const materials = {
      container: new THREE.MeshStandardMaterial({ color: mapId === 'harbor' ? 0x8e3e35 : mapId === 'foundry' ? 0x545a59 : mapId === 'dust' ? 0xb08b52 : mapId === 'blacktown' ? 0x5f6875 : 0x4c7787, roughness: 0.68, metalness: 0.46 }),
      crate: new THREE.MeshStandardMaterial({ color: mapId === 'frostline' ? 0x718892 : mapId === 'dust' ? 0x8a6239 : mapId === 'blacktown' ? 0x6b4a33 : 0x76512d, roughness: 0.86, metalness: 0.06 }),
      wall: new THREE.MeshStandardMaterial({ color: mapId === 'frostline' ? 0x899ba1 : mapId === 'dust' ? 0xb59272 : mapId === 'blacktown' ? 0x737a80 : 0x5b5c58, roughness: 0.9, metalness: 0.08 }),
      sand: new THREE.MeshStandardMaterial({ color: 0xcdb489, roughness: 0.93, metalness: 0.03 }),
      ice: new THREE.MeshStandardMaterial({ color: 0x9ec6d2, roughness: 0.72, metalness: 0.05 }),
      tank: new THREE.MeshStandardMaterial({ color: 0x565e5d, roughness: 0.55, metalness: 0.68 }),
      pipe: new THREE.MeshStandardMaterial({ color: 0xa55a31, roughness: 0.5, metalness: 0.7 })
    };
    const edgeMat = new THREE.LineBasicMaterial({ color: map.accent, transparent: true, opacity: 0.22 });

    const siteZones = map.sites || [];
    const insideSite = (spec) => {
      if (!siteZones.length) return false;
      const halfW = spec[2] / 2;
      const halfD = spec[3] / 2;
      return siteZones.some((site) => {
        const dx = Math.max(Math.abs(spec[0] - site.x) - halfW, 0);
        const dz = Math.max(Math.abs(spec[1] - site.z) - halfD, 0);
        return Math.hypot(dx, dz) < site.radius + 1.5;
      });
    };
    map.covers.filter((spec) => !insideSite(spec)).forEach((spec) => addCover(world, materials, edgeMat, spec, true));
    map.decor.filter((spec) => !insideSite(spec)).forEach((spec) => addCover(world, materials, edgeMat, spec, spec[5] !== 'pipe'));
    map.spawns.forEach(([x, z]) => state.spawns.push(new THREE.Vector3(x, 0, z)));
    if (map.sites) {
      map.sites.forEach((site) => addBombSite(world, site));
      map.sites.forEach((site) => addSiteCover(world, materials, edgeMat, site));
    }

    const bounds = 86;
    addBoundaryWall(world, materials.wall, -bounds, 0, 3, 6, 176);
    addBoundaryWall(world, materials.wall, bounds, 0, 3, 6, 176);
    addBoundaryWall(world, materials.wall, 0, -bounds, 176, 6, 3);
    addBoundaryWall(world, materials.wall, 0, bounds, 176, 6, 3);

    const beaconMat = new THREE.MeshBasicMaterial({ color: map.accent, transparent: true, opacity: 0.76 });
    [[-62,-62],[62,-62],[62,62],[-62,62]].forEach(([x,z]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.5, 8), materials.wall);
      post.position.set(x, 2.75, z); post.castShadow = state.qualityHigh; world.add(post);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), beaconMat);
      lamp.position.set(x, 5.55, z); world.add(lamp);
    });

    if (mapId === 'harbor') {
      const dockLight = new THREE.PointLight(0x9fdce6, 1.6, 86, 2);
      dockLight.position.set(0, 13, -12);
      world.add(dockLight);
    } else if (mapId === 'foundry') {
      const fireLight = new THREE.PointLight(0xff6f36, 2.2, 42, 2);
      fireLight.position.set(0, 5, 0);
      world.add(fireLight);
    } else if (mapId === 'frostline') {
      const coldLight = new THREE.PointLight(0x9edcff, 1.4, 58, 2);
      coldLight.position.set(-12, 8, 4);
      world.add(coldLight);
    } else if (mapId === 'dust') {
      const sunLight = new THREE.PointLight(0xffd9a0, 1.8, 96, 2);
      sunLight.position.set(-28, 16, -12);
      world.add(sunLight);
    } else if (mapId === 'blacktown') {
      const streetLight = new THREE.PointLight(0xff9a6a, 1.7, 88, 2);
      streetLight.position.set(6, 12, 6);
      world.add(streetLight);
    }

    state.player.pos.set(0, 0, 58);
    state.player.velocity.set(0, 0, 0);
    state.player.yaw = 0;
    input.yaw = 0;
    input.pitch = -0.05;
  }

  function addCover(world, materials, edgeMat, spec, collide) {
    const [x, z, w, d, h, kind] = spec;
    let mesh;
    if (kind === 'tank') {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(Math.min(w, d) * 0.48, Math.min(w, d) * 0.52, h, 20), materials.tank);
    } else if (kind === 'pipe') {
      const pipeRadius = h * 0.45;
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, w, 14), materials.pipe);
      mesh.rotation.z = Math.PI / 2;
    } else {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials[kind] || materials.wall);
    }
    mesh.position.set(x, h / 2 + (kind === 'pipe' ? 1 : 0), z);
    mesh.castShadow = state.qualityHigh && h < 8;
    mesh.receiveShadow = true;
    mesh.userData.hitKind = 'world';
    world.add(mesh);
    state.worldMeshes.push(mesh);
    if (kind === 'pipe') {
      const legHeight = h + 0.9;
      [-w * 0.32, w * 0.32].forEach((offset) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, legHeight, 0.2), materials.wall);
        leg.position.set(x + offset, legHeight / 2, z);
        leg.receiveShadow = true;
        world.add(leg);
        state.worldMeshes.push(leg);
        state.colliders.push({ x: x + offset, z, hw: 0.14, hd: 0.14, h: legHeight });
      });
    }
    if (kind !== 'pipe' && kind !== 'tank') {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat);
      edges.position.copy(mesh.position);
      world.add(edges);
    }
    if (kind === 'tank') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.min(w, d) * 0.51, 0.08, 6, 24), new THREE.MeshBasicMaterial({ color: edgeMat.color, transparent: true, opacity: 0.35 }));
      ring.material.opacity = 0.35;
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, h + 0.05, z);
      world.add(ring);
    }
    if (collide) state.colliders.push({ x, z, hw: w / 2, hd: d / 2, h });
  }

  function addSiteCover(world, materials, edgeMat, site) {
    // 在包点外围一圈放置防守/下包后的架点位，内部保持空旷
    site.coverPoints = [];
    const angles = [25, 115, 205, 295, 70, 250];
    angles.forEach((deg) => {
      const rad = deg * Math.PI / 180;
      const dist = site.radius + 5;
      const x = site.x + Math.cos(rad) * dist;
      const z = site.z + Math.sin(rad) * dist;
      if (Math.abs(x) > 76 || Math.abs(z) > 76) return;
      if (collidesAt(x, z, 4.2)) return;
      addCover(world, materials, edgeMat, [x, z, 5.5, 5.5, 2.8, 'crate'], true);
      site.coverPoints.push({ x, z });
    });
  }

  function addBombSite(world, site) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(255,176,64,.9)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(128, 128, 106, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,196,92,.95)';
    ctx.font = 'bold 140px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(site.name, 128, 138);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(site.radius * 2, site.radius * 2), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(site.x, 0.04, site.z);
    mesh.renderOrder = 2;
    world.add(mesh);
  }

  function createBombModel() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.15, 0.26), createGunMaterial(0x23282c, 0.45, 0.62));
    body.position.y = 0.08;
    group.add(body);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xff8c2b }));
    panel.position.set(0, 0.11, -0.135);
    group.add(panel);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
    light.position.set(0.12, 0.19, 0);
    group.add(light);
    group.userData.light = light;
    return group;
  }

  function assignBombCarrier() {
    if (!state.player) return;
    state.player.hasC4 = false;
    state.allies.forEach((ally) => { ally.hasC4 = false; });
    if (state.config.mode !== 'bomb') return;
    const total = 1 + state.allies.length;
    const pick = Math.floor(Math.random() * total);
    if (pick === 0 || state.allies.length === 0) state.player.hasC4 = true;
    else {
      const carrier = state.allies[pick - 1];
      if (carrier) carrier.hasC4 = true;
      else state.player.hasC4 = true;
    }
  }

  function dropC4() {
    const bomb = state.bomb;
    if (!bomb || bomb.planted || !state.player.hasC4 || state.player.dead) return;
    state.player.hasC4 = false;
    const forward = new THREE.Vector3(-Math.sin(input.yaw), 0, -Math.cos(input.yaw));
    const dropPos = state.player.pos.clone().addScaledVector(forward, 1.4);
    bomb.dropped = true;
    bomb.dropPosition = dropPos;
    if (!bomb.dropModel) bomb.dropModel = createBombModel();
    bomb.dropModel.position.copy(dropPos);
    if (!bomb.dropModel.parent) state.scene.add(bomb.dropModel);
    if (state.player.currentWeapon === 3) selectWeaponSlot(0);
    announce('C4 已丢下', '#ffcf6b');
    updateHud();
  }

  function clearBombState() {
    if (state.bomb && state.bomb.model && state.bomb.model.parent) state.scene.remove(state.bomb.model);
    if (state.bomb && state.bomb.dropModel && state.bomb.dropModel.parent) state.scene.remove(state.bomb.dropModel);
    state.bomb = { planted: false, site: null, position: null, timer: 0, defuseProgress: 0, plantProgress: 0, model: null, dropped: false, dropPosition: null, dropModel: null };
  }

  function currentBombSite() {
    const sites = state.currentMap && state.currentMap.sites;
    if (!sites || !state.player) return null;
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      const dx = state.player.pos.x - site.x;
      const dz = state.player.pos.z - site.z;
      if (dx * dx + dz * dz <= site.radius * site.radius) return site;
    }
    return null;
  }

  function plantBomb(site, position) {
    const bomb = state.bomb;
    if (!bomb || bomb.planted) return;
    bomb.planted = true;
    bomb.site = site.name;
    bomb.position = position ? position.clone() : new THREE.Vector3(state.player.pos.x, 0, state.player.pos.z);
    bomb.position.y = 0;
    bomb.timer = 60;
    bomb.plantProgress = 3.2;
    bomb.model = createBombModel();
    bomb.model.position.copy(bomb.position);
    state.scene.add(bomb.model);
    state.player.hasC4 = false;
    state.allies.forEach((ally) => { ally.hasC4 = false; });
    if (state.player.currentWeapon === 3) selectWeaponSlot(0);
    state.audio.play('round');
    announce('C4 已安放 · ' + site.name + ' 点', '#ff9b3d');
    updateHud();
  }

  function updateBombPlant(dt) {
    const bomb = state.bomb;
    if (!bomb || bomb.planted || state.player.dead) return;
    if (bomb.dropped && bomb.dropPosition && !state.player.hasC4) {
      const dropDist = Math.hypot(state.player.pos.x - bomb.dropPosition.x, state.player.pos.z - bomb.dropPosition.z);
      if (dropDist < 2.2 && input.keys.KeyE) {
        state.player.hasC4 = true;
        bomb.dropped = false;
        if (bomb.dropModel && bomb.dropModel.parent) state.scene.remove(bomb.dropModel);
        announce('已拾取 C4 · 按 5 取出，长按 E 安放', '#ffcf6b');
        updateHud();
      }
      return;
    }
    if (!state.player.hasC4) return;
    const site = currentBombSite();
    if (!site || !input.keys.KeyE) {
      bomb.plantProgress = Math.max(0, bomb.plantProgress - dt * 2.5);
      return;
    }
    bomb.plantProgress += dt;
    if (bomb.plantProgress >= 6) plantBomb(site, state.player.pos);
  }

  function updateBombDefuse(dt) {
    const bomb = state.bomb;
    if (!bomb || !bomb.planted || !bomb.position) return;
    let defuser = null;
    let best = 2.4;
    state.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      const d = Math.hypot(enemy.root.position.x - bomb.position.x, enemy.root.position.z - bomb.position.z);
      if (d < best) { best = d; defuser = enemy; }
    });
    if (defuser) {
      bomb.defuseProgress += dt;
      if (bomb.defuseProgress >= 10) endBombRound(false, 'C4 已被保卫者拆除');
    } else {
      bomb.defuseProgress = Math.max(0, bomb.defuseProgress - dt * 0.6);
    }
  }

  function addBoundaryWall(world, material, x, z, w, h, d) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, h / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.userData.hitKind = 'world';
    world.add(mesh);
    state.worldMeshes.push(mesh);
    state.colliders.push({ x, z, hw: w / 2, hd: d / 2, h });
  }

  function createPrimaryAmmoState() {
    return WEAPONS.map((weapon) => ({ ammo: weapon.mag, reserve: weapon.reserve }));
  }

  function createSecondaryAmmoState() {
    return { ammo: SECONDARY_WEAPON.mag, reserve: SECONDARY_WEAPON.reserve };
  }

  function createPlayer() {
    state.player = {
      pos: new THREE.Vector3(0, 0, 58), velocity: new THREE.Vector3(), verticalVelocity: 0,
      onGround: true, crouching: false, sprinting: false, yaw: 0, pitch: -0.05,
      eyeHeight: 1.68, radius: 0.46, hp: 100, armor: 50, dead: false, respawnAt: 0,
      loadout: 0, currentWeapon: 0, previousWeapon: 1, primaryAmmo: createPrimaryAmmoState(), secondaryAmmo: createSecondaryAmmoState(),
      reloading: false, reloadEnd: 0, lastShot: 0, shots: 0, hits: 0, kills: 0, deaths: 0,
      streak: 0, bestStreak: 0, damageTaken: 0, recoil: 0, recoilVelocity: 0, cameraShake: 0,
      bobTime: 0, walking: 0, ads: 0, grenades: 2, invulnerableUntil: 0, hasC4: false
    };
    buildWeaponModel(0);
  }

  function createGunMaterial(color, metalness, roughness) {
    const base = new THREE.Color(color); return new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive: base.clone().multiplyScalar(0.055) });
  }

  function addBoxPart(parent, size, pos, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.castShadow = false;
    parent.add(mesh);
    return mesh;
  }

  function addCylinderPart(parent, radius, length, pos, material, segments) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments || 10), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(pos[0], pos[1], pos[2]);
    parent.add(mesh);
    return mesh;
  }

  function addRotatedBoxPart(parent, size, pos, rotation, material) {
    const mesh = addBoxPart(parent, size, pos, material);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    return mesh;
  }

  function addTorusPart(parent, radius, tube, pos, material, segments) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, segments || 14), material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    parent.add(mesh);
    return mesh;
  }

  function addRailedTop(parent, z, length, material) {
    addBoxPart(parent, [0.075, 0.018, length], [0.22, -0.015, z], material);
    const count = Math.max(4, Math.floor(length / 0.055));
    for (let i = 0; i < count; i++) {
      const railZ = z + length / 2 - 0.025 - i * (length / count);
      addBoxPart(parent, [0.082, 0.014, 0.018], [0.22, 0.002, railZ], material);
    }
  }

  function addProfilePart(parent, points, depth, material, position, bevel) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: bevel === undefined ? 0.004 : bevel,
      bevelThickness: bevel === undefined ? 0.004 : bevel,
      curveSegments: 2
    });
    geometry.rotateY(Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    parent.add(mesh);
    return mesh;
  }

  function addLimbBetween(parent, start, end, radius, material) {
    const from = new THREE.Vector3(start[0], start[1], start[2]);
    const to = new THREE.Vector3(end[0], end[1], end[2]);
    const delta = to.clone().sub(from);
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.16, delta.length(), 10), material);
    limb.position.copy(from).add(to).multiplyScalar(0.5);
    limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    parent.add(limb);
    return limb;
  }

  function addHandModel(parent, position, side, skinMaterial, gloveMaterial, pose) {
    const hand = new THREE.Group();
    hand.position.set(position[0], position[1], position[2]);
    const open = pose === 'open';
    const palmWidth = 0.082;
    const palmHeight = 0.036;
    // 掌体：战术手套包住手掌，露出指节皮肤
    const palm = new THREE.Mesh(new THREE.BoxGeometry(palmWidth, palmHeight, 0.075), gloveMaterial);
    palm.position.z = -0.018;
    hand.add(palm);
    // 掌根加厚，连接手腕
    const heel = new THREE.Mesh(new THREE.BoxGeometry(palmWidth * 0.9, palmHeight * 1.15, 0.042), gloveMaterial);
    heel.position.z = 0.022;
    hand.add(heel);
    // 掌指关节护甲
    const knuckleGuard = new THREE.Mesh(new THREE.BoxGeometry(palmWidth * 0.92, 0.014, 0.03), gloveMaterial);
    knuckleGuard.position.set(0, palmHeight * 0.55, -0.042);
    hand.add(knuckleGuard);
    // 四指：近节 + 远节两段关节，握持时自然弯曲
    for (let i = 0; i < 4; i++) {
      const base = new THREE.Group();
      base.position.set((i - 1.5) * 0.02, 0, -0.05);
      base.rotation.x = open ? -0.18 : -0.6;
      base.rotation.y = (i - 1.5) * (open ? 0.1 : 0.03);
      hand.add(base);
      const proximal = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.022, 3, 7), skinMaterial);
      proximal.rotation.x = Math.PI / 2;
      proximal.position.z = -0.013;
      base.add(proximal);
      const distal = new THREE.Group();
      distal.position.z = -0.027;
      distal.rotation.x = open ? -0.22 : -0.8;
      base.add(distal);
      const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.02, 3, 7), skinMaterial);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = -0.012;
      distal.add(tip);
    }
    // 拇指两节，朝掌心侧合拢
    const thumb = new THREE.Group();
    thumb.position.set(side * 0.04, -0.004, -0.014);
    thumb.rotation.set(-0.3, 0, side * (open ? 1.0 : 0.82));
    hand.add(thumb);
    const thumbBase = new THREE.Mesh(new THREE.CapsuleGeometry(0.0125, 0.024, 3, 7), skinMaterial);
    thumbBase.rotation.x = Math.PI / 2;
    thumbBase.position.z = -0.014;
    thumb.add(thumbBase);
    const thumbTip = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.018, 3, 7), skinMaterial);
    thumbTip.rotation.x = Math.PI / 2;
    thumbTip.position.set(0, open ? 0 : -0.012, -0.034);
    thumb.add(thumbTip);
    // 手腕与收紧的袖口
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.05, 12), gloveMaterial);
    wrist.rotation.x = Math.PI / 2;
    wrist.position.z = 0.055;
    hand.add(wrist);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.052, 0.06, 12), gloveMaterial);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.z = 0.095;
    hand.add(cuff);
    hand.traverse((node) => { if (node.isMesh) node.renderOrder = 30; });
    parent.add(hand);
    return hand;
  }
  function buildWeaponModel(index) {
    while (state.weaponHolder.children.length) state.weaponHolder.remove(state.weaponHolder.children[0]);
    const spec = currentWeaponSpec();
    const view = WEAPON_VIEW[spec.model] || WEAPON_VIEW.pistol;
    const group = new THREE.Group();
    const dark = createGunMaterial(0x171b1e, 0.65, 0.38);
    const metal = createGunMaterial(0x68757a, 0.92, 0.24);
    const steel = createGunMaterial(0x9ba5a8, 0.94, 0.2);
    const accent = createGunMaterial(0x2c8d89, 0.5, 0.4);
    const grip = createGunMaterial(0x252b2e, 0.3, 0.72);
    const wood = createGunMaterial(0x7a4828, 0.12, 0.72);
    const olive = createGunMaterial(0x5d7054, 0.28, 0.62);
    const tan = createGunMaterial(0x9b8058, 0.22, 0.68);
    let muzzlePosition = [0.24, -0.11, -0.88];
    let spinPart = null;

    if (spec.model === 'm4a1') {
      addBoxPart(group, [0.078, 0.105, 0.72], [0.22, -0.12, -0.3], dark);
      addProfilePart(group, [[0.24,0.02],[0.24,-0.13],[-0.22,-0.13],[-0.25,-0.02],[-0.12,0.04]], 0.078, dark, [0.18,0,0], 0.005);
      addBoxPart(group, [0.075, 0.075, 0.34], [0.22, -0.115, -0.4], dark);
      addBoxPart(group, [0.07, 0.06, 0.24], [0.22, -0.18, -0.37], dark);
      addCylinderPart(group, 0.017, 0.48, [0.22, -0.09, -0.79], metal, 12);
      addBoxPart(group, [0.082, 0.065, 0.31], [0.22, -0.095, -0.58], grip);
      for (let i = 0; i < 6; i++) addTorusPart(group, 0.044, 0.006, [0.22, -0.095, -0.44 - i * 0.052], grip, 12);
      addBoxPart(group, [0.022, 0.1, 0.025], [0.22, -0.02, -0.73], dark);
      addBoxPart(group, [0.065, 0.018, 0.035], [0.22, 0.035, -0.73], dark);
      addBoxPart(group, [0.06, 0.045, 0.24], [0.22, -0.045, -0.33], dark);
      addBoxPart(group, [0.055, 0.05, 0.12], [0.22, -0.07, -0.22], dark);
      addBoxPart(group, [0.025, 0.075, 0.025], [0.22, -0.005, -0.39], dark);
      addBoxPart(group, [0.025, 0.075, 0.025], [0.22, -0.005, -0.22], dark);
      addCylinderPart(group, 0.025, 0.23, [0.22, -0.11, 0.02], dark, 12);
      addBoxPart(group, [0.09, 0.1, 0.15], [0.22, -0.135, 0.1], dark);
      addBoxPart(group, [0.1, 0.115, 0.024], [0.22, -0.145, 0.19], grip);
      addRotatedBoxPart(group, [0.065, 0.19, 0.087], [0.22, -0.255, -0.4], [0.12, 0, 0], dark);
      addRotatedBoxPart(group, [0.07, 0.15, 0.09], [0.22, -0.27, -0.22], [-0.32, 0, 0], grip);
      addRailedTop(group, -0.32, 0.27, dark);
      muzzlePosition = [0.22, -0.09, -1.04];
    } else if (spec.model === 'ak47') {
      addBoxPart(group, [0.08, 0.095, 0.62], [0.22, -0.13, -0.27], dark);
      addProfilePart(group, [[0.24,0.02],[0.24,-0.14],[-0.24,-0.14],[-0.27,-0.02],[-0.13,0.05]], 0.08, dark, [0.18,0,0], 0.005);
      addBoxPart(group, [0.08, 0.075, 0.34], [0.22, -0.14, -0.4], dark);
      addBoxPart(group, [0.085, 0.085, 0.27], [0.22, -0.105, -0.66], wood);
      addCylinderPart(group, 0.018, 0.55, [0.22, -0.105, -0.91], metal, 12);
      addCylinderPart(group, 0.012, 0.38, [0.22, -0.025, -0.73], metal, 10);
      addBoxPart(group, [0.025, 0.105, 0.028], [0.22, 0.005, -0.97], dark);
      addBoxPart(group, [0.07, 0.02, 0.04], [0.22, 0.065, -0.97], dark);
      addBoxPart(group, [0.075, 0.11, 0.21], [0.22, -0.12, 0.08], wood);
      addBoxPart(group, [0.08, 0.12, 0.028], [0.22, -0.14, 0.2], dark);
      addRotatedBoxPart(group, [0.07, 0.095, 0.12], [0.22, -0.23, -0.32], [0.28, 0, 0], dark);
      addRotatedBoxPart(group, [0.07, 0.09, 0.11], [0.22, -0.31, -0.25], [0.55, 0, 0], dark);
      addRotatedBoxPart(group, [0.07, 0.09, 0.105], [0.22, -0.37, -0.16], [0.8, 0, 0], dark);
      addBoxPart(group, [0.065, 0.15, 0.085], [0.22, -0.28, -0.47], wood);
      addBoxPart(group, [0.09, 0.1, 0.28], [0.22, -0.14, -0.06], dark);
      muzzlePosition = [0.22, -0.105, -1.21];
    } else if (spec.model === 'awm') {
      // AWM：厚重枪托、粗机匣、大倍镜、长枪管、两脚架，尺寸与 M4A1/AK47 同基准后按狙击枪比例拉长
      addBoxPart(group, [0.082, 0.14, 0.03], [0.23, -0.15, 0.31], dark);
      addBoxPart(group, [0.1, 0.15, 0.26], [0.23, -0.14, 0.13], olive);
      addBoxPart(group, [0.008, 0.05, 0.2], [0.176, -0.14, 0.12], grip);
      addBoxPart(group, [0.008, 0.05, 0.2], [0.284, -0.14, 0.12], grip);
      addBoxPart(group, [0.075, 0.055, 0.24], [0.23, -0.05, 0.12], olive);
      addBoxPart(group, [0.105, 0.026, 0.26], [0.23, -0.222, 0.13], grip);
      addBoxPart(group, [0.115, 0.15, 0.68], [0.23, -0.125, -0.21], olive);
      addBoxPart(group, [0.006, 0.075, 0.5], [0.17, -0.135, -0.22], grip);
      addBoxPart(group, [0.006, 0.075, 0.5], [0.29, -0.135, -0.22], grip);
      addBoxPart(group, [0.07, 0.035, 0.42], [0.23, -0.045, -0.24], dark);
      addRotatedBoxPart(group, [0.075, 0.215, 0.1], [0.23, -0.305, -0.015], [0.26, 0, 0], grip);
      addBoxPart(group, [0.082, 0.028, 0.105], [0.23, -0.412, 0.02], dark);
      const awmTrigger = addTorusPart(group, 0.05, 0.009, [0.23, -0.245, -0.145], steel, 12);
      awmTrigger.rotation.y = Math.PI / 2;
      addBoxPart(group, [0.09, 0.075, 0.18], [0.23, -0.245, -0.295], metal);
      addBoxPart(group, [0.105, 0.105, 0.66], [0.23, -0.135, -0.82], olive);
      addBoxPart(group, [0.08, 0.028, 0.5], [0.23, -0.195, -0.82], dark);
      addCylinderPart(group, 0.03, 0.78, [0.23, -0.115, -1.14], metal, 16);
      addCylinderPart(group, 0.048, 0.18, [0.23, -0.115, -1.58], dark, 16);
      addCylinderPart(group, 0.034, 0.06, [0.23, -0.115, -1.7], metal, 14);
      addCylinderPart(group, 0.048, 0.46, [0.23, 0.035, -0.36], dark, 18);
      addCylinderPart(group, 0.066, 0.11, [0.23, 0.035, -0.63], metal, 18);
      addCylinderPart(group, 0.061, 0.09, [0.23, 0.035, -0.1], metal, 18);
      addCylinderPart(group, 0.052, 0.02, [0.23, 0.035, -0.685], steel, 18);
      addBoxPart(group, [0.055, 0.085, 0.055], [0.23, -0.035, -0.52], dark);
      addBoxPart(group, [0.055, 0.085, 0.055], [0.23, -0.035, -0.16], dark);
      addBoxPart(group, [0.034, 0.05, 0.045], [0.23, 0.085, -0.36], metal);
      addBoxPart(group, [0.045, 0.034, 0.045], [0.29, 0.045, -0.36], metal);
      addBoxPart(group, [0.1, 0.017, 0.017], [0.315, -0.075, -0.235], metal);
      addBoxPart(group, [0.03, 0.03, 0.03], [0.365, -0.075, -0.235], steel);
      addRotatedBoxPart(group, [0.017, 0.3, 0.017], [0.185, -0.335, -1.0], [0, 0, -0.28], metal);
      addRotatedBoxPart(group, [0.017, 0.3, 0.017], [0.275, -0.335, -1.0], [0, 0, 0.28], metal);
      addBoxPart(group, [0.03, 0.02, 0.06], [0.155, -0.475, -1.06], dark);
      addBoxPart(group, [0.03, 0.02, 0.06], [0.305, -0.475, -1.06], dark);
      muzzlePosition = [0.23, -0.115, -1.73];
    } else if (spec.model === 'shotgun') {
      addBoxPart(group, [0.11, 0.12, 0.62], [0.24, -0.16, -0.3], olive);
      addProfilePart(group, [[0.22,0.04],[0.22,-0.16],[-0.27,-0.15],[-0.31,-0.02],[-0.16,0.06]], 0.11, olive, [0.18,0,0], 0.006);
      addBoxPart(group, [0.11, 0.12, 0.36], [0.24, -0.15, -0.48], olive);
      addCylinderPart(group, 0.025, 0.69, [0.24, -0.09, -0.89], metal, 12);
      addCylinderPart(group, 0.022, 0.6, [0.24, -0.17, -0.84], dark, 12);
      addBoxPart(group, [0.11, 0.09, 0.25], [0.24, -0.205, -0.7], dark);
      for (let i = 0; i < 7; i++) addBoxPart(group, [0.14, 0.09, 0.015], [0.24, -0.205, -0.59 - i * 0.04], olive);
      addBoxPart(group, [0.08, 0.14, 0.13], [0.24, -0.29, -0.34], grip);
      addBoxPart(group, [0.12, 0.14, 0.08], [0.24, -0.17, -0.12], dark);
      addRotatedBoxPart(group, [0.055, 0.07, 0.2], [0.24, -0.08, 0.07], [0.15, 0, 0], dark);
      addBoxPart(group, [0.12, 0.08, 0.04], [0.24, -0.05, 0.31], grip);
      muzzlePosition = [0.24, -0.13, -1.25];
    } else if (spec.model === 'smg') {
      addBoxPart(group, [0.12, 0.12, 0.46], [0.23, -0.16, -0.36], tan);
      addProfilePart(group, [[0.24,0.03],[0.24,-0.16],[-0.2,-0.16],[-0.24,0.02],[-0.1,0.06]], 0.12, tan, [0.17,0,0], 0.006);
      addBoxPart(group, [0.02, 0.018, 0.32], [0.19, -0.08, 0.2], metal);
      addBoxPart(group, [0.02, 0.018, 0.32], [0.27, -0.08, 0.2], metal);
      addBoxPart(group, [0.13, 0.13, 0.3], [0.23, -0.17, -0.43], tan);
      addBoxPart(group, [0.085, 0.09, 0.34], [0.23, -0.1, -0.48], dark);
      addCylinderPart(group, 0.017, 0.28, [0.23, -0.16, -0.77], metal, 10);
      addCylinderPart(group, 0.032, 0.11, [0.23, -0.16, -0.93], dark, 12);
      addBoxPart(group, [0.07, 0.09, 0.3], [0.23, -0.04, -0.36], dark);
      addBoxPart(group, [0.07, 0.14, 0.24], [0.23, -0.17, -0.08], grip);
      addRotatedBoxPart(group, [0.06, 0.2, 0.085], [0.23, -0.32, -0.31], [0.12, 0, 0], dark);
      addBoxPart(group, [0.06, 0.12, 0.1], [0.23, -0.3, -0.61], grip);
      addBoxPart(group, [0.028, 0.025, 0.35], [0.23, -0.01, -0.33], dark);
      addBoxPart(group, [0.022, 0.055, 0.28], [0.23, -0.1, 0.25], metal);
      addBoxPart(group, [0.1, 0.13, 0.04], [0.23, -0.12, 0.41], dark);
      muzzlePosition = [0.23, -0.16, -1.02];
    } else if (spec.model === 'lmg') {
      addBoxPart(group, [0.18, 0.16, 0.42], [0.24, -0.16, -0.17], dark);
      addProfilePart(group, [[0.28,0.07],[0.28,-0.15],[-0.27,-0.15],[-0.31,0.05],[-0.21,0.09]], 0.18, dark, [0.15,0,0], 0.006);
      spinPart = new THREE.Group();
      spinPart.position.set(0.24, -0.11, -0.69);
      group.add(spinPart);
      for (let i = 0; i < 6; i++) {
        const angle = i / 6 * Math.PI * 2;
        addCylinderPart(spinPart, 0.013, 0.75, [Math.cos(angle) * 0.045, Math.sin(angle) * 0.045, -0.36], metal, 8);
      }
      addTorusPart(spinPart, 0.07, 0.01, [0, 0, -0.67], dark, 16);
      addTorusPart(spinPart, 0.07, 0.01, [0, 0, -0.12], dark, 16);
      addCylinderPart(group, 0.09, 0.3, [0.24, -0.11, -0.3], dark, 16);
      addBoxPart(group, [0.18, 0.16, 0.34], [0.24, -0.16, -0.12], dark);
      addBoxPart(group, [0.17, 0.18, 0.16], [0.24, -0.3, -0.07], olive);
      addBoxPart(group, [0.075, 0.15, 0.27], [0.24, -0.18, 0.17], grip);
      addBoxPart(group, [0.035, 0.2, 0.035], [0.24, 0.02, 0.08], dark);
      addRotatedBoxPart(group, [0.045, 0.17, 0.04], [0.17, 0.08, 0.16], [0, 0, -0.28], grip);
      addRotatedBoxPart(group, [0.045, 0.17, 0.04], [0.31, 0.08, 0.16], [0, 0, 0.28], grip);
      muzzlePosition = [0.24, -0.11, -1.42];
    } else if (spec.model === 'qbz') {
      addBoxPart(group, [0.082, 0.095, 0.6], [0.23, -0.13, -0.34], dark);
      addProfilePart(group, [[0.25,0.03],[0.25,-0.15],[-0.28,-0.15],[-0.32,0.02],[-0.18,0.06]], 0.082, dark, [0.18,0,0], 0.005);
      addBoxPart(group, [0.085, 0.09, 0.47], [0.23, -0.14, -0.42], dark);
      addBoxPart(group, [0.075, 0.085, 0.31], [0.23, -0.105, -0.68], dark);
      addCylinderPart(group, 0.018, 0.52, [0.23, -0.105, -0.94], metal, 12);
      addBoxPart(group, [0.06, 0.055, 0.3], [0.23, -0.035, -0.49], dark);
      addBoxPart(group, [0.075, 0.1, 0.17], [0.23, -0.12, -0.1], dark);
      addBoxPart(group, [0.075, 0.1, 0.17], [0.23, -0.13, 0.16], dark);
      addBoxPart(group, [0.085, 0.12, 0.03], [0.23, -0.14, 0.3], grip);
      addRotatedBoxPart(group, [0.055, 0.18, 0.085], [0.23, -0.27, -0.27], [0.08, 0, 0], dark);
      addRotatedBoxPart(group, [0.055, 0.15, 0.08], [0.23, -0.32, -0.16], [0.35, 0, 0], dark);
      addBoxPart(group, [0.06, 0.12, 0.09], [0.23, -0.28, -0.46], grip);
      addRailedTop(group, -0.46, 0.48, dark);
      muzzlePosition = [0.23, -0.105, -1.22];
    }
    else if (spec.model === 'pistol') {
      addBoxPart(group, [0.09, 0.115, 0.36], [0.24, -0.13, -0.48], dark);
      addBoxPart(group, [0.075, 0.075, 0.24], [0.24, -0.205, -0.39], metal);
      addCylinderPart(group, 0.018, 0.22, [0.24, -0.11, -0.73], steel, 12);
      addCylinderPart(group, 0.028, 0.075, [0.24, -0.11, -0.86], dark, 12);
      addRotatedBoxPart(group, [0.075, 0.19, 0.085], [0.24, -0.31, -0.34], [-0.38, 0, 0], grip);
      const triggerGuard = addTorusPart(group, 0.044, 0.009, [0.24, -0.25, -0.31], steel, 12);
      triggerGuard.rotation.y = Math.PI / 2;
      addBoxPart(group, [0.018, 0.035, 0.025], [0.24, -0.055, -0.65], steel);
      addBoxPart(group, [0.018, 0.028, 0.025], [0.24, -0.055, -0.19], steel);
      muzzlePosition = [0.24, -0.11, -0.9];
    } else if (spec.model === 'c4') {
      addBoxPart(group, [0.3, 0.14, 0.22], [0.22, -0.13, -0.18], dark);
      addBoxPart(group, [0.19, 0.055, 0.02], [0.22, -0.085, -0.29], accent);
      addBoxPart(group, [0.05, 0.05, 0.05], [0.32, -0.05, -0.18], new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
      muzzlePosition = [0.22, -0.13, -0.3];
    } else if (spec.model === 'knife') {
      const gold = createGunMaterial(0xd4a52f, 0.88, 0.22);
      addProfilePart(group, [[0.98,0.08],[0.82,0.18],[0.34,0.17],[0.12,0.08],[0.32,0.015],[0.82,0.04]], 0.035, gold, [0.205,-0.24,0], 0.004);
      for (let i = 0; i < 7; i++) addBoxPart(group, [0.04, 0.018, 0.035], [0.205, -0.055 - i * 0.002, -0.34 - i * 0.065], gold);
      addBoxPart(group, [0.12, 0.035, 0.07], [0.205, -0.18, -0.16], gold);
      addCylinderPart(group, 0.035, 0.25, [0.205, -0.25, 0.02], grip, 12);
      addBoxPart(group, [0.055, 0.075, 0.045], [0.205, -0.25, 0.16], gold);
      muzzlePosition = [0.205, -0.19, -1.0];
    } else {
      addBoxPart(group, [0.1, 0.13, 0.28], [0.24, -0.2, -0.48], dark);
      muzzlePosition = [0.24, -0.14, -0.68];
    }

    const flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffc35b, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    const flash = new THREE.Mesh(new THREE.SphereGeometry(spec.scope ? 0.085 : 0.06, 10, 8), flashMaterial);
    flash.position.set(muzzlePosition[0], muzzlePosition[1], muzzlePosition[2]);
    flash.visible = false;
    group.add(flash);
    const muzzleAnchor = new THREE.Object3D();
    muzzleAnchor.position.set(muzzlePosition[0], muzzlePosition[1], muzzlePosition[2]);
    group.add(muzzleAnchor);

    group.position.set(view.x, view.y, view.z);
    group.rotation.set(view.pitch, view.yaw, -0.012);
    group.scale.setScalar(view.scale);
    state.weaponHolder.add(group);
    const handLayout = HAND_LAYOUTS[spec.model] || HAND_LAYOUTS.m4a1;
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xc08a6a, roughness: 0.82, metalness: 0.02, depthTest: false, depthWrite: false });
    const sleeveMaterial = createGunMaterial(0x263138, 0.12, 0.86);
    const handsGroup = new THREE.Group();
    handsGroup.userData.firstPersonHands = true;
    addLimbBetween(handsGroup, [-0.08, -0.58, -0.1], handLayout.left, 0.057, sleeveMaterial);
    addLimbBetween(handsGroup, [0.43, -0.58, -0.1], handLayout.right, 0.057, sleeveMaterial);
    const leftHand = addHandModel(handsGroup, handLayout.left, -1, skinMaterial, sleeveMaterial, spec.model === 'knife' ? 'open' : 'grip');
    const rightHand = addHandModel(handsGroup, handLayout.right, 1, skinMaterial, sleeveMaterial);
    const leftRot = handLayout.leftRot || [0.55, 0, 0.1];
    const rightRot = handLayout.rightRot || [-0.28, -0.45, 0.08];
    leftHand.rotation.set(leftRot[0], leftRot[1], leftRot[2]);
    rightHand.rotation.set(rightRot[0], rightRot[1], rightRot[2]);
    if (handLayout.handScale) { leftHand.scale.setScalar(handLayout.handScale); rightHand.scale.setScalar(handLayout.handScale); }
    state.weaponHolder.add(handsGroup);

    state.weaponHolder.userData.model = group;
    state.weaponHolder.userData.flash = flash;
    state.weaponHolder.userData.muzzle = muzzleAnchor;
    state.weaponHolder.userData.scope = !!spec.scope;
    state.weaponHolder.userData.spinPart = spinPart;
    dom.weaponName.textContent = spec.name + (state.player.currentWeapon === 0 ? ' · 背包 ' + (state.player.loadout + 1) : '');
    if (dom.primarySlotName) dom.primarySlotName.textContent = WEAPONS[state.player.loadout].name + ' · 背包 ' + (state.player.loadout + 1);
    if (dom.weaponRail) Array.from(dom.weaponRail.children).forEach((slot, i) => slot.classList.toggle('active', i === index));
    updateAmmoUI();
  }

  function collidesAt(x, z, radius) {
    if (Math.abs(x) > 84.2 || Math.abs(z) > 84.2) return true;
    for (let i = 0; i < state.colliders.length; i++) {
      const c = state.colliders[i];
      if (x + radius > c.x - c.hw && x - radius < c.x + c.hw && z + radius > c.z - c.hd && z - radius < c.z + c.hd) return true;
    }
    return false;
  }

  function moveWithCollision(position, dx, dz, radius) {
    const oldX = position.x;
    const oldZ = position.z;
    if (!collidesAt(oldX + dx, oldZ, radius)) position.x += dx;
    else position.x = oldX;
    if (!collidesAt(position.x, oldZ + dz, radius)) position.z += dz;
    else position.z = oldZ;
  }

  function getEyePosition(target) {
    const eye = target || new THREE.Vector3();
    return eye.set(state.player.pos.x, state.player.pos.y + (state.player.crouching ? 1.15 : state.player.eyeHeight), state.player.pos.z);
  }

  function currentWeaponSpec() {
    if (state.player.currentWeapon === 0) return WEAPONS[state.player.loadout];
    if (state.player.currentWeapon === 1) return SECONDARY_WEAPON;
    if (state.player.currentWeapon === 3) return C4_WEAPON;
    return MELEE_WEAPON;
  }
  function currentWeaponState() {
    if (state.player.currentWeapon === 0) return state.player.primaryAmmo[state.player.loadout];
    if (state.player.currentWeapon === 1) return state.player.secondaryAmmo;
    return { ammo: 1, reserve: 0, infinite: true };
  }
  function degreesToRadians(value) { return value * Math.PI / 180; }

  function getAimDirection() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(state.camera.quaternion);
    return direction.normalize();
  }

  let enemySerial = 0;

  function difficultyStats() {
    const selected = state.config.difficulty;
    if (selected === 'easy') return { hp: 90, accuracy: 0.25, damage: 11, fireDelay: [0.8, 1.35], reaction: 0.42 };
    if (selected === 'hard') return { hp: 115, accuracy: 0.9, damage: 14, fireDelay: [0.45, 0.85], reaction: 0.2 };
    return { hp: 100, accuracy: 0.75, damage: 13, fireDelay: [0.55, 1.0], reaction: 0.28 };
  }

  function loadSoldierAsset() {
    const asset = state.soldierAsset;
    if (asset.promise) return asset.promise;
    if (!THREE.GLTFLoader || !THREE.SkeletonUtils || location.protocol === 'file:') {
      asset.error = location.protocol === 'file:' ? 'file-protocol' : 'loader-unavailable';
      asset.promise = Promise.resolve(false);
      return asset.promise;
    }
    asset.loading = true;
    asset.promise = new Promise((resolve) => {
      const loader = new THREE.GLTFLoader();
      loader.load('./assets/Soldier.glb', (gltf) => {
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const targetHeight = 1.88;
        const scale = size.y > 0.01 ? targetHeight / size.y : 1;
        model.scale.multiplyScalar(scale);
        model.updateMatrixWorld(true);
        bounds.setFromObject(model);
        model.position.y -= bounds.min.y;
        model.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = false;
          node.receiveShadow = true;
          const sourceMaterials = Array.isArray(node.material) ? node.material : [node.material];
          const cloned = sourceMaterials.map((material) => {
            const copy = material.clone();
            if (/visor/i.test(material.name)) {
              copy.color = new THREE.Color(0xff3348);
              if ('emissive' in copy) {
                copy.emissive = new THREE.Color(0x8c0717);
                copy.emissiveIntensity = 1.8;
              }
            }
            return copy;
          });
          node.material = Array.isArray(node.material) ? cloned : cloned[0];
        });
        asset.scene = model;
        asset.animations = gltf.animations.slice();
        asset.ready = true;
        asset.loading = false;
        resolve(true);
      }, undefined, (error) => {
        asset.error = error && error.message ? error.message : 'load-failed';
        asset.loading = false;
        resolve(false);
      });
    });
    return asset.promise;
  }

  function createSoldierEnemyModel() {
    const root = THREE.SkeletonUtils.clone(state.soldierAsset.scene);
    const mixer = new THREE.AnimationMixer(root);
    const actions = Object.create(null);
    state.soldierAsset.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
    });
    const idle = actions.Idle || actions.idle;
    if (idle) idle.play();

    root.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = true;
    });

    const hitHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitHead.position.y = 1.65;
    hitHead.userData.zone = 'head';
    root.add(hitHead);

    const hitBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.22, 0.44),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitBody.position.y = 1.05;
    hitBody.userData.zone = 'body';
    root.add(hitBody);

    const healthBar = new THREE.Group();
    const healthBack = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.09), new THREE.MeshBasicMaterial({ color: 0x14090a, transparent: true, opacity: 0.78, depthTest: false }));
    const healthFill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.055), new THREE.MeshBasicMaterial({ color: 0xff4d5c, depthTest: false }));
    healthFill.position.z = 0.001;
    healthBar.add(healthBack); healthBar.add(healthFill); healthBar.position.y = 2.18; root.add(healthBar);

    const gunAnchor = new THREE.Object3D();
    gunAnchor.position.set(0.3, 1.22, -0.5);
    root.add(gunAnchor);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa23c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
    flash.position.set(0, 0, -0.45); flash.visible = false; gunAnchor.add(flash);

    return {
      root, mixer, actions, currentAction: idle ? 'Idle' : '', healthBar, healthFill, flash,
      legL: null, legR: null, armL: null, armR: null, head: hitHead, gun: gunAnchor, is3D: true
    };
  }

  function playEnemyAction(enemy, name) {
    const parts = enemy.parts;
    if (!parts.mixer || !parts.actions[name] || parts.currentAction === name) return;
    const previous = parts.actions[parts.currentAction];
    const next = parts.actions[name];
    if (previous) previous.fadeOut(0.18);
    next.reset().fadeIn(0.18).play();
    parts.currentAction = name;
  }

  function createEnemyModel() {
    if (state.soldierAsset.ready) return createSoldierEnemyModel();
    const root = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8f2932, roughness: 0.66, metalness: 0.2 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x242c30, roughness: 0.63, metalness: 0.48 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xbd665f, roughness: 0.7, metalness: 0.12 });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xff4d5c, emissive: 0x8c1019, emissiveIntensity: 2.0, roughness: 0.3, metalness: 0.6 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x171b1e, roughness: 0.4, metalness: 0.75 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x121618, roughness: 0.86, metalness: 0.2 });

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.25, 0.28), armorMat); hips.position.y = 0.86; root.add(hips);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.34), bodyMat); torso.position.y = 1.3; root.add(torso);
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.48, 0.37), armorMat); vest.position.set(0, 1.32, -0.02); root.add(vest);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.31, 0.31), headMat); head.position.y = 1.86; head.userData.zone = 'head'; root.add(head);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.075, 0.035), visorMat); visor.position.set(0, 1.88, -0.17); root.add(visor);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.2), armorMat); legL.position.set(-0.15, 0.43, 0); root.add(legL);
    const legR = legL.clone(); legR.position.x = 0.15; root.add(legR);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.3), bootMat); bootL.position.set(-0.15, 0.08, -0.04); root.add(bootL);
    const bootR = bootL.clone(); bootR.position.x = 0.15; root.add(bootR);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.56, 0.18), bodyMat); armL.position.set(-0.39, 1.29, -0.03); root.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 0.18), armorMat); armR.position.set(0.39, 1.28, -0.04); root.add(armR);
    const gun = new THREE.Group();
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.7), gunMat); gunBody.position.z = -0.25; gun.add(gunBody);
    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), gunMat); gunBarrel.rotation.x = Math.PI / 2; gunBarrel.position.z = -0.72; gun.add(gunBarrel);
    gun.position.set(0.28, 1.25, -0.32); root.add(gun);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa23c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })); flash.position.set(0, 0, -1.0); flash.visible = false; gun.add(flash);
    const healthBar = new THREE.Group();
    const healthBack = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.09), new THREE.MeshBasicMaterial({ color: 0x14090a, transparent: true, opacity: 0.78, depthTest: false }));
    const healthFill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.055), new THREE.MeshBasicMaterial({ color: 0xff4d5c, depthTest: false }));
    healthFill.position.z = 0.001; healthBar.add(healthBack); healthBar.add(healthFill); healthBar.position.y = 2.22; root.add(healthBar);

    root.traverse((node) => {
      if (!node.isMesh) return;
      node.userData.zone = node.userData.zone || 'body';
      node.castShadow = false;
      node.receiveShadow = true;
    });
    return { root, legL, legR, armL, armR, head, healthBar, healthFill, gun, flash };
  }

  function spawnEnemy(forcedPosition, guardSite, weaponSpec) {
    if (!state.currentMap) return null;
    const stats = difficultyStats();
    const weapon = weaponSpec || WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
    const weaponStats = aiWeaponStats(weapon);
    const siteList = state.currentMap.sites || [];
    const resolvedGuard = guardSite || (siteList.length ? siteList[enemySerial % siteList.length].name : null);
    const guardSiteObj = resolvedGuard ? siteList.find((site) => site.name === resolvedGuard) : null;
    const coverPool = guardSiteObj && guardSiteObj.coverPoints ? guardSiteObj.coverPoints : [];
    const guardCover = coverPool.length ? coverPool[Math.floor(Math.random() * coverPool.length)] : null;
    let spawn = forcedPosition ? forcedPosition.clone() : null;
    if (!spawn) {
      let best = null;
      let bestScore = -1;
      for (let i = 0; i < 10; i++) {
        const candidate = state.spawns[Math.floor(Math.random() * state.spawns.length)].clone();
        candidate.x += (Math.random() - 0.5) * 5;
        candidate.z += (Math.random() - 0.5) * 5;
        if (collidesAt(candidate.x, candidate.z, 0.7)) continue;
        const distance = candidate.distanceToSquared(state.player.pos);
        if (distance > bestScore) { bestScore = distance; best = candidate; }
      }
      spawn = best || state.spawns[0].clone();
    }
    const model = createEnemyModel();
    const enemy = {
      id: ++enemySerial, root: model.root, parts: model, hp: stats.hp, maxHp: stats.hp, accuracy: stats.accuracy,
      weapon: weapon.id, weaponName: weapon.name,
      damage: weaponStats.damage, fireDelay: weaponStats.fireDelay, reaction: stats.reaction, speed: 4.1 + (state.config.difficulty === 'hard' ? 0.8 : state.config.difficulty === 'easy' ? -0.3 : 0),
      dead: false, deathAt: 0, alerted: false, lastShot: performance.now() + stats.reaction * 1000, targetAt: 0,
      strafe: Math.random() > 0.5 ? 1 : -1, position: spawn, radius: 0.54, walkPhase: Math.random() * 10, velocity: new THREE.Vector3(),
      stuckTime: 0, detourUntil: 0, detourDir: 1,
      hurtAt: 0,
      guardSite: resolvedGuard,
      guardCover,
      offsetX: (Math.random() - 0.5) * 15,
      offsetZ: (Math.random() - 0.5) * 15
    };
    enemy.root.position.copy(spawn);
    enemy.root.rotation.y = Math.atan2(-state.player.pos.x + spawn.x, -state.player.pos.z + spawn.z) + Math.PI;
    enemy.root.traverse((node) => { node.userData.enemyId = enemy.id; });
    enemy.parts.healthFill.scale.x = 1;
    enemy.parts.healthBar.renderOrder = 10;
    buildAILightGun(model.gun, weapon);
    state.scene.add(enemy.root);
    state.enemies.push(enemy);
    return enemy;
  }

  function currentWaveSize() {
    const mode = MODES[state.config.mode];
    if (state.config.mode !== 'strike' || !state.match) return mode.enemies;
    const base = mode.waveBase || 4;
    const growth = mode.waveGrowth || 1;
    return base + Math.max(0, state.match.wave - 1) * growth;
  }

  function pickSpawnPoints(count) {
    const valid = state.spawns.map((point) => point.clone()).filter((point) => !collidesAt(point.x, point.z, 0.9));
    const midRange = valid.filter((point) => { const d = point.distanceTo(state.player.pos); return d > 24 && d < 85; });
    const farRange = valid.filter((point) => point.distanceTo(state.player.pos) > 22);
    const usable = midRange.length >= count ? midRange : (farRange.length >= count ? farRange : valid);
    for (let i = usable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = usable[i]; usable[i] = usable[j]; usable[j] = swap;
    }
    const chosen = [];
    usable.forEach((point) => {
      if (chosen.length >= count) return;
      if (chosen.some((picked) => picked.distanceTo(point) < 10)) return;
      chosen.push(point);
    });
    let guard = 0;
    while (chosen.length < count && guard++ < 120) {
      const base = usable[Math.floor(Math.random() * usable.length)] || state.spawns[0];
      if (!base) break;
      const point = base.clone();
      point.x += (Math.random() - 0.5) * 12;
      point.z += (Math.random() - 0.5) * 12;
      if (Math.abs(point.x) > 80 || Math.abs(point.z) > 80) continue;
      if (collidesAt(point.x, point.z, 0.9)) continue;
      if (point.distanceTo(state.player.pos) < 18) continue;
      chosen.push(point);
    }
    return chosen;
  }

  function pickSpawnNearSite(site) {
    if (!site) return null;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 11;
      const x = site.x + Math.cos(angle) * radius;
      const z = site.z + Math.sin(angle) * radius;
      if (Math.abs(x) > 78 || Math.abs(z) > 78) continue;
      if (collidesAt(x, z, 0.95)) continue;
      return new THREE.Vector3(x, 0, z);
    }
    return null;
  }

  function spawnEnemyWave() {
    state.enemies.forEach((enemy) => { if (enemy.root.parent) state.scene.remove(enemy.root); });
    state.enemies = [];
    const count = currentWaveSize();
    const sites = (state.currentMap && state.currentMap.sites) || [];
    const weaponPool = shuffledWeaponIds();
    if (state.config.mode === 'bomb' && sites.length) {
      // 爆破模式：保卫者按 A/B 分组部署，武器在七种背包枪中不重复分配
      for (let i = 0; i < count; i++) {
        const site = sites[i % sites.length];
        const weapon = WEAPONS.find((item) => item.id === weaponPool[i % weaponPool.length]);
        spawnEnemy(pickSpawnNearSite(site), site.name, weapon);
      }
      return;
    }
    const points = pickSpawnPoints(count);
    for (let i = 0; i < count; i++) {
      const weapon = WEAPONS.find((item) => item.id === weaponPool[i % weaponPool.length]);
      spawnEnemy(points[i % Math.max(1, points.length)], null, weapon);
    }
  }

  function shuffledWeaponIds() {
    const ids = WEAPONS.map((weapon) => weapon.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = ids[i]; ids[i] = ids[j]; ids[j] = swap;
    }
    return ids;
  }

  let aiGunDark = null;
  let aiGunMetal = null;

  function buildAILightGun(parent, weapon) {
    if (!parent || !weapon) return;
    if (!aiGunDark) {
      aiGunDark = createGunMaterial(0x1b2024, 0.6, 0.45);
      aiGunMetal = createGunMaterial(0x6b757a, 0.9, 0.3);
    }
    // 只保留枪身与枪管两个部件，材质全局共享，控制 draw call
    const length = weapon.model === 'awm' ? 1.35 : weapon.model === 'lmg' ? 1.15 : weapon.model === 'smg' ? 0.62 : weapon.model === 'shotgun' ? 0.95 : 0.85;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, length * 0.55), aiGunDark);
    body.position.z = -length * 0.28;
    parent.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, length * 0.62, 6), aiGunMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -length * 0.74;
    parent.add(barrel);
    if (weapon.scope) {
      const scope = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.24), aiGunDark);
      scope.position.set(0, 0.1, -0.2);
      parent.add(scope);
    }
  }

  function aiWeaponStats(weapon) {
    const damage = Math.max(6, Math.round(6 + weapon.damage * 0.22));
    const burstMin = Math.min(1.6, Math.max(0.5, 240 / Math.max(1, weapon.rpm)));
    const burstMax = Math.min(3.2, Math.max(1.0, 420 / Math.max(1, weapon.rpm)));
    return { damage, fireDelay: [burstMin, burstMax] };
  }

  function spawnAllies(count) {
    if (!state.currentMap) return;
    const allyWeapons = shuffledWeaponIds();
    for (let i = 0; i < count; i++) {
      const model = createEnemyModel();
      // 队友辨识：隐藏血条、面罩改青色、头顶加青色标记
      if (model.healthBar) model.healthBar.visible = false;
      model.root.traverse((node) => {
        if (!node.isMesh || !node.material) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          if (!mat || !/visor/i.test(mat.name || '')) return;
          mat.color = new THREE.Color(0x35e0c8);
          if ('emissive' in mat) { mat.emissive = new THREE.Color(0x0a6b60); mat.emissiveIntensity = 1.6; }
        });
      });
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), new THREE.MeshBasicMaterial({ color: 0x35e0c8, transparent: true, opacity: 0.9 }));
      marker.position.y = 2.12;
      model.root.add(marker);
      const weapon = WEAPONS.find((item) => item.id === allyWeapons[i % allyWeapons.length]);
      const weaponStats = aiWeaponStats(weapon);
      buildAILightGun(model.gun, weapon);
      const spawn = new THREE.Vector3(-8 + i * 2.6, 0, 53 + (i % 3) * 2);
      const siteList = (state.currentMap && state.currentMap.sites) || [];
      const assignedSite = siteList.length ? siteList[i % siteList.length] : null;
      const ally = {
        id: 'ally-' + i, root: model.root, parts: model, hp: 100, maxHp: 100, dead: false, deathAt: 0,
        speed: 4.1 + (i % 3) * 0.12, radius: 0.54, walkPhase: Math.random() * 10, strafe: Math.random() > 0.5 ? 1 : -1,
        weapon: weapon.id, weaponName: weapon.name,
        lastShot: 0, fireDelay: weaponStats.fireDelay, accuracy: 0.5, damage: weaponStats.damage, stuckTime: 0, detourUntil: 0, detourDir: 1,
        site: assignedSite ? assignedSite.name : null,
        offsetX: (Math.random() - 0.5) * 14,
        offsetZ: (Math.random() - 0.5) * 14,
        strafePhase: Math.random() * Math.PI * 2,
        plantTimer: 0,
        coverIndex: i
      };
      ally.root.position.copy(spawn);
      ally.root.rotation.y = Math.PI;
      ally.root.userData.ally = true;
      ally.root.traverse((node) => { node.userData.allyId = ally.id; node.userData.ally = true; });
      state.scene.add(ally.root);
      state.allies.push(ally);
    }
  }

  function damageAlly(ally, damage) {
    if (!ally || ally.dead) return;
    ally.hp -= damage;
    if (ally.hp <= 0) {
      ally.dead = true;
      ally.deathAt = performance.now();
      spawnBurst(ally.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x3fd8c0, 12, 4);
      // 携带 C4 的队友阵亡：C4 掉落，队友跑过去捡
      if (ally.hasC4 && state.bomb && !state.bomb.planted) {
        ally.hasC4 = false;
        const dropPos = ally.root.position.clone();
        state.bomb.dropped = true;
        state.bomb.dropPosition = dropPos;
        if (!state.bomb.dropModel) state.bomb.dropModel = createBombModel();
        state.bomb.dropModel.position.copy(dropPos);
        if (!state.bomb.dropModel.parent) state.scene.add(state.bomb.dropModel);
        announce('队友阵亡，C4 已掉落', '#ffcf6b');
        updateHud();
      }
    }
  }

  function allyShoot(ally, target) {
    const start = new THREE.Vector3(ally.root.position.x, 1.35, ally.root.position.z);
    const end = target.root.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    spawnTracer(start, end, 0x6fe8ff, 0.05);
    state.audio.play('enemyShot');
    if (Math.random() < ally.accuracy) damageEnemy(target, ally.damage, false, '队友掩护', true);
  }

  function updateAllies(dt, now) {
    for (let i = state.allies.length - 1; i >= 0; i--) {
      const ally = state.allies[i];
      if (ally.dead) {
        const deadFor = (now - ally.deathAt) / 1000;
        if (deadFor < 0.3) {
          ally.root.rotation.z = Math.min(Math.PI / 2, deadFor * 3.6);
          ally.root.position.y -= dt * 0.55;
        } else {
          ally.root.visible = false;
        }
        continue;
      }
      let target = null;
      let targetDist = Infinity;
      state.enemies.forEach((enemy) => {
        if (enemy.dead) return;
        const d = Math.hypot(enemy.root.position.x - ally.root.position.x, enemy.root.position.z - ally.root.position.z);
        if (d < targetDist) { targetDist = d; target = enemy; }
      });
      const siteList = (state.currentMap && state.currentMap.sites) || [];
      const carrierSite = (state.config.mode === 'bomb' && state.bomb && !state.bomb.planted && ally.hasC4)
        ? siteList.find((site) => Math.hypot(ally.root.position.x - site.x, ally.root.position.z - site.z) <= site.radius)
        : null;
      // 地上有 C4 且没人携带时，派最近的一名队友去捡
      const droppedBomb = state.config.mode === 'bomb' && state.bomb && !state.bomb.planted && state.bomb.dropped && state.bomb.dropPosition;
      let fetchBomb = null;
      if (droppedBomb && !ally.hasC4 && !state.player.hasC4) {
        let nearest = null;
        let nearestDist = Infinity;
        state.allies.forEach((other) => {
          if (other.dead) return;
          const d = Math.hypot(other.root.position.x - state.bomb.dropPosition.x, other.root.position.z - state.bomb.dropPosition.z);
          if (d < nearestDist) { nearestDist = d; nearest = other; }
        });
        if (nearest === ally) fetchBomb = state.bomb.dropPosition;
      }
      let goalX;
      let goalZ;
      let holding = false;
      let rushing = false;
      const assigned = ally.site ? siteList.find((site) => site.name === ally.site) : null;
      if (state.config.mode === 'bomb' && state.bomb && state.bomb.planted) {
        // C4 已安放：所有潜伏者必须赶到安放点守包
        const plantedSite = siteList.find((site) => site.name === state.bomb.site);
        const coverList = plantedSite && plantedSite.coverPoints ? plantedSite.coverPoints : [];
        const siteRadius = (plantedSite && plantedSite.radius) || 8;
        const siteX = (plantedSite && plantedSite.x) || state.bomb.position.x;
        const siteZ = (plantedSite && plantedSite.z) || state.bomb.position.z;
        const distToSite = Math.hypot(ally.root.position.x - siteX, ally.root.position.z - siteZ);
        // 检查该包点范围内是否有队友正在被攻击，有则全体转过去支援
        const plantedEnemy = target && targetDist < 30 ? target : null;
        let alliedUnderAttack = null;
        if (plantedEnemy) {
          // 敌人离自己很近，直接支援
          alliedUnderAttack = plantedEnemy;
        } else if (distToSite > siteRadius + 3) {
          // 自己还没到包点范围内，检查包点里是否有队友在交战
          state.allies.forEach((other) => {
            if (other === ally || other.dead || !other.fightingTarget) return;
            const d = Math.hypot(other.root.position.x - siteX, other.root.position.z - siteZ);
            if (d <= siteRadius + 3) alliedUnderAttack = other.fightingTarget;
          });
        }
        if (alliedUnderAttack) {
          // 放弃守包，去支援被攻击的队友
          goalX = alliedUnderAttack.root.position.x;
          goalZ = alliedUnderAttack.root.position.z;
        } else if (coverList.length) {
          const pick = coverList[ally.coverIndex % coverList.length];
          const ox = state.bomb.position.x - pick.x;
          const oz = state.bomb.position.z - pick.z;
          const od = Math.hypot(ox, oz) || 1;
          goalX = pick.x + (ox / od) * 1.7;
          goalZ = pick.z + (oz / od) * 1.7;
        } else {
          goalX = state.bomb.position.x + ally.offsetX * 0.7;
          goalZ = state.bomb.position.z + ally.offsetZ * 0.7;
        }
        // 还没到安放点范围内时快速冲过去，到了再站定
        holding = distToSite <= siteRadius + 2 && !alliedUnderAttack;
        rushing = distToSite > siteRadius + 2;
      } else if (carrierSite) {
        // 已经在包点里准备下包：留在原地边打边下，不追出去
        goalX = carrierSite.x;
        goalZ = carrierSite.z;
        holding = true;
      } else if (assigned && target && targetDist < 35 && !state.bomb.planted) {
        // 潜袭去分配包点的路上遇到近处敌人：先冲过去打，打完再继续去包点
        goalX = target.root.position.x;
        goalZ = target.root.position.z;
      } else if (fetchBomb) {
        goalX = fetchBomb.x;
        goalZ = fetchBomb.z;
      } else if (assigned) {
        goalX = assigned.x + ally.offsetX;
        goalZ = assigned.z + ally.offsetZ;
        // 潜伏者未安包时快速冲向分配的包点
        rushing = true;
      } else if (target && targetDist < 30) {
        goalX = target.root.position.x;
        goalZ = target.root.position.z;
      } else if (Math.hypot(state.player.pos.x - ally.root.position.x, state.player.pos.z - ally.root.position.z) > 18) {
        goalX = state.player.pos.x;
        goalZ = state.player.pos.z;
      } else {
        goalX = ally.root.position.x;
        goalZ = ally.root.position.z;
      }
      const dx = goalX - ally.root.position.x;
      const dz = goalZ - ally.root.position.z;
      const dist = Math.hypot(dx, dz) || 1;
      const allyFrozen = !!(state.match && state.match.freezeUntil && now < state.match.freezeUntil);
      const desired = holding ? 1.8 : (rushing ? ally.speed : (target && targetDist < 30 ? 13 : 1.8));
      // 守包/蹲点站定带滞后，避免在边界来回抖动
      if (holding || rushing) {
        if (dist < 2.6) ally.settled = true;
        else if (dist > 4.5) ally.settled = false;
      } else {
        ally.settled = false;
      }
      const allySettled = !!ally.settled;
      // rushing 状态下用全速前进，到达后与 holding 一样站定
      const forward = (allyFrozen || allySettled) ? 0 : (dist > desired + 1.5 ? 1 : dist < desired - 2 ? -1 : 0);
      const strafe = allySettled ? 0 : Math.sin(now * 0.0011 + ally.strafePhase) * 0.4;
      const oldX = ally.root.position.x;
      const oldZ = ally.root.position.z;
      moveWithCollision(ally.root.position, ((dx / dist) * forward + (-dz / dist) * strafe) * ally.speed * dt, ((dz / dist) * forward + (dx / dist) * strafe) * ally.speed * dt, ally.radius);
      // 同伴分离，避免整队挤在同一个墙角（限频执行）
      if (!allySettled && (!ally.nextSepAt || now >= ally.nextSepAt)) {
        ally.nextSepAt = now + 120;
        state.allies.forEach((other) => {
        if (other === ally || other.dead) return;
        const ox = ally.root.position.x - other.root.position.x;
        const oz = ally.root.position.z - other.root.position.z;
        const od = Math.hypot(ox, oz);
          if (od > 0.01 && od < 2.4) moveWithCollision(ally.root.position, (ox / od) * 1.9 * dt, (oz / od) * 1.9 * dt, ally.radius);
        });
      }
      const moved = Math.abs(ally.root.position.x - oldX) + Math.abs(ally.root.position.z - oldZ) > 0.001;
      if (!moved && forward !== 0) {
        ally.stuckTime += dt;
        if (ally.stuckTime > 0.22) {
          ally.stuckTime = 0;
          moveWithCollision(ally.root.position, (-dz / dist) * ally.detourDir * ally.speed * dt, (dx / dist) * ally.detourDir * ally.speed * dt, ally.radius);
          if (now > ally.detourUntil) { ally.detourUntil = now + 520; ally.detourDir *= -1; }
        }
      } else {
        ally.stuckTime = Math.max(0, ally.stuckTime - dt);
      }
      const movedX = ally.root.position.x - oldX;
      const movedZ = ally.root.position.z - oldZ;
      let faceX;
      let faceZ;
      if (target && targetDist < 22) {
        faceX = target.root.position.x - ally.root.position.x;
        faceZ = target.root.position.z - ally.root.position.z;
      } else if (Math.abs(movedX) + Math.abs(movedZ) > 0.00005) {
        faceX = movedX;
        faceZ = movedZ;
      } else {
        faceX = dx;
        faceZ = dz;
      }
      ally.root.rotation.y = Math.atan2(faceX, faceZ) + Math.PI;
      // 交战状态：有 LOS 通的近处敌人即算"正在交战"，持续 3 秒保持，便于其他队友支援
      if (target && targetDist < 30 && ally.losResult) {
        ally.fightingTarget = target;
        ally.fightingUntil = now + 3000;
      } else if (now < (ally.fightingUntil || 0)) {
        ally.fightingTarget = ally.fightingTarget;
      } else {
        ally.fightingTarget = null;
      }
      if (target && targetDist < 42 && now > ally.lastShot) {
        if (!ally.nextLosAt || now >= ally.nextLosAt || ally.losTargetId !== target.id || targetDist < 18) {
          ally.nextLosAt = now + 170 + Math.random() * 130;
          ally.losTargetId = target.id;
          ally.losResult = hasLineOfSight(new THREE.Vector3(ally.root.position.x, 1.55, ally.root.position.z), new THREE.Vector3(target.root.position.x, 1.35, target.root.position.z));
        }
        if (ally.losResult) {
          ally.lastShot = now + (ally.fireDelay[0] + Math.random() * (ally.fireDelay[1] - ally.fireDelay[0])) * 1000;
          allyShoot(ally, target);
        }
      }
      if (fetchBomb) {
        const pickDist = Math.hypot(ally.root.position.x - state.bomb.dropPosition.x, ally.root.position.z - state.bomb.dropPosition.z);
        if (pickDist < 2.2) {
          state.bomb.dropped = false;
          ally.hasC4 = true;
          if (state.bomb.dropModel && state.bomb.dropModel.parent) state.scene.remove(state.bomb.dropModel);
          announce('队友拾取了 C4', '#ffe14d');
          updateHud();
        }
      }
      if (carrierSite) {
        ally.plantTimer += dt;
        if (ally.plantTimer >= 6) plantBomb(carrierSite, ally.root.position);
      } else if (ally.hasC4) {
        ally.plantTimer = Math.max(0, ally.plantTimer - dt);
      }
      const allyToPlayer = Math.hypot(state.player.pos.x - ally.root.position.x, state.player.pos.z - ally.root.position.z);
      const allyFar = allyToPlayer > 70;
      ally.root.visible = !allyFar;
      if (ally.parts.gun) ally.parts.gun.visible = allyToPlayer < 42;
      if (ally.parts.mixer && !allyFar) {
        playEnemyAction(ally, moved ? (Math.hypot(movedX, movedZ) > 0.02 ? 'Run' : 'Walk') : 'Idle');
        ally.animAccum = (ally.animAccum || 0) + dt;
        if (ally.animAccum >= (allyToPlayer < 45 ? 0.033 : 0.1)) { ally.parts.mixer.update(ally.animAccum); ally.animAccum = 0; }
      }
    }
  }

  function findEnemyById(id) { return state.enemies.find((enemy) => enemy.id === id) || null; }

  function findEnemyFromObject(object) {
    let node = object;
    while (node) {
      if (node.userData && node.userData.enemyId) return findEnemyById(node.userData.enemyId);
      node = node.parent;
    }
    return null;
  }

  function hasLineOfSight(from, to) {
    tempVector.subVectors(to, from);
    const distance = tempVector.length();
    state.raycaster.set(from, tempVector.normalize());
    state.raycaster.far = distance;
    const hits = state.raycaster.intersectObjects(state.worldMeshes, false);
    return hits.length === 0 || hits[0].distance > distance - 0.35;
  }

  function aimEnemyAt(enemy, targetPos) {
    const eye = tempVector.set(enemy.root.position.x, 1.55, enemy.root.position.z);
    enemy.root.rotation.y = Math.atan2(targetPos.x - eye.x, targetPos.z - eye.z) + Math.PI;
    enemy.parts.healthBar.quaternion.copy(state.camera.quaternion);
  }

  function aimEnemyAtPlayer(enemy) { aimEnemyAt(enemy, getEyePosition(tempVector2)); }

  function updateEnemies(dt, now) {
    const mode = MODES[state.config.mode];
    const playerEye = getEyePosition(new THREE.Vector3());
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (enemy.dead) {
        const deadFor = (now - enemy.deathAt) / 1000;
        if (deadFor < 0.3) {
          enemy.root.rotation.z = Math.min(Math.PI / 2, deadFor * 3.6);
          enemy.root.position.y -= dt * 0.55;
        } else {
          enemy.root.visible = false;
          if (state.config.mode === 'range' && deadFor >= mode.respawn) {
            state.scene.remove(enemy.root);
            state.enemies.splice(i, 1);
            spawnEnemy();
          }
        }
        continue;
      }

      // 交战目标：玩家或队友中最近者
      let targetPos = state.player.pos;
      let targetKind = 'player';
      let targetAlly = null;
      let distance = state.player.dead ? Infinity : Math.hypot(state.player.pos.x - enemy.root.position.x, state.player.pos.z - enemy.root.position.z);
      state.allies.forEach((ally) => {
        if (ally.dead) return;
        const d = Math.hypot(ally.root.position.x - enemy.root.position.x, ally.root.position.z - enemy.root.position.z);
        if (d < distance) { distance = d; targetPos = ally.root.position; targetKind = 'ally'; targetAlly = ally; }
      });
      if (!isFinite(distance)) { distance = 999; targetPos = state.player.pos; targetKind = 'player'; targetAlly = null; }
      const losTargetKey = targetKind + (targetAlly ? targetAlly.id : 'player');
      let canSee = !!enemy.losResult;
      if (!enemy.nextLosAt || now >= enemy.nextLosAt || enemy.losTargetKey !== losTargetKey || distance < 18) {
        enemy.nextLosAt = now + 170 + Math.random() * 130;
        enemy.losTargetKey = losTargetKey;
        canSee = distance < 55 && hasLineOfSight(new THREE.Vector3(enemy.root.position.x, 1.55, enemy.root.position.z), new THREE.Vector3(targetPos.x, 1.45, targetPos.z));
        enemy.losResult = canSee;
      }
      if (canSee) { enemy.alerted = true; enemy.targetAt = now; }

      // 行进目标：C4 安放后冲去拆包；未安放且附近没有交战时，回到自己负责的包点驻守
      let goalX = targetPos.x;
      let goalZ = targetPos.z;
      let guarding = false;
      let supporting = false;
      if (state.config.mode === 'bomb') {
        if (state.bomb && state.bomb.planted) {
          goalX = state.bomb.position.x;
          goalZ = state.bomb.position.z;
        } else if (!canSee || distance > 28) {
          const sites = (state.currentMap && state.currentMap.sites) || [];
          const guard = enemy.guardSite ? sites.find((site) => site.name === enemy.guardSite) : null;
          if (guard) {
            const siteRadius = guard.radius || 8;
            // 潜伏者（玩家或任何 AI 队友）闯入本包点：驻守该点的全部保卫者立刻放弃驻守，冲过去围攻
            let intruder = null;
            let intruderDist = Infinity;
            const checkIntruder = (pos, dead) => {
              if (dead) return;
              const d = Math.hypot(pos.x - guard.x, pos.z - guard.z);
              if (d <= siteRadius && d < intruderDist) { intruderDist = d; intruder = pos; }
            };
            checkIntruder(state.player.pos, state.player.dead);
            state.allies.forEach((other) => checkIntruder(other.root.position, other.dead));
            // 先检查同包点的队友是否刚受过伤，是则立刻赶去支援
            let supportMate = null;
            state.enemies.forEach((other) => {
              if (other === enemy || other.dead) return;
              if (now - other.hurtAt > 4000) return;
              if (other.guardSite && other.guardSite !== enemy.guardSite) return;
              const d = Math.hypot(other.root.position.x - guard.x, other.root.position.z - guard.z);
              if (d <= siteRadius + 4 && !supportMate) supportMate = other;
            });
            if (intruder) {
              // 有潜伏者闯进包里：全部保卫者冲过去攻击，不站定
              goalX = intruder.x;
              goalZ = intruder.z;
            } else if (supportMate) {
              goalX = supportMate.root.position.x;
              goalZ = supportMate.root.position.z;
              supporting = true;
            } else if (enemy.guardCover) {
              // 借包点周围的掩体隐蔽架枪：站在掩体背对包点的一侧
              const ox = enemy.guardCover.x - guard.x;
              const oz = enemy.guardCover.z - guard.z;
              const od = Math.hypot(ox, oz) || 1;
              goalX = enemy.guardCover.x + (ox / od) * 2.2;
              goalZ = enemy.guardCover.z + (oz / od) * 2.2;
              guarding = true;
            } else {
              goalX = guard.x + enemy.offsetX;
              goalZ = guard.z + enemy.offsetZ;
              guarding = true;
            }
          }
        }
      }

      let moving = false;
      const prevX = enemy.root.position.x;
      const prevZ = enemy.root.position.z;
      const frozenNow = !!(state.match && state.match.freezeUntil && now < state.match.freezeUntil);
      if (!frozenNow && state.config.mode !== 'range') {
        const detouring = now < enemy.detourUntil;
        const goalDx = goalX - enemy.root.position.x;
        const goalDz = goalZ - enemy.root.position.z;
        const goalDist = Math.hypot(goalDx, goalDz) || 1;
        const defusing = state.config.mode === 'bomb' && state.bomb && state.bomb.planted;
        const desired = defusing ? 0.5 : (supporting ? 8 : (guarding ? 1.8 : 6.5 + (enemy.id % 3) * 1.4));
        const rush = goalDist > 18 ? 1.32 : 1;
        // 站定判定带滞后：进入 2.6 米即锁定居，超过 4.5 米才重新移动，避免边界反复切换
        if (guarding && !supporting) {
          if (goalDist < 2.6) enemy.settled = true;
          else if (goalDist > 4.5) enemy.settled = false;
        } else {
          enemy.settled = false;
        }
        const settled = !!enemy.settled;
        const forward = settled ? 0 : (detouring ? 0.25 : (goalDist > desired + 1.5 ? 1 : goalDist < desired - 2 ? -1 : 0));
        const weave = settled ? 0 : (detouring ? 1.6 : (goalDist > 12 ? 0.25 : 0.5));
        const side = detouring ? enemy.detourDir : enemy.strafe;
        const moveX = (goalDx / goalDist) * forward + (-goalDz / goalDist) * side * weave;
        const moveZ = (goalDz / goalDist) * forward + (goalDx / goalDist) * side * weave;
        const speed = enemy.speed * rush * (canSee ? 0.92 : 1.12);
        const oldX = enemy.root.position.x;
        const oldZ = enemy.root.position.z;
        moveWithCollision(enemy.root.position, moveX * speed * dt, moveZ * speed * dt, enemy.radius);
        // 同伴分离，避免多人挤在同一个墙角落（限频执行）
        if (!settled && (!enemy.nextSepAt || now >= enemy.nextSepAt)) {
          enemy.nextSepAt = now + 120;
          state.enemies.forEach((other) => {
          if (other === enemy || other.dead) return;
          const ox = enemy.root.position.x - other.root.position.x;
          const oz = enemy.root.position.z - other.root.position.z;
          const od = Math.hypot(ox, oz);
            if (od > 0.01 && od < 2.4) moveWithCollision(enemy.root.position, (ox / od) * 1.9 * dt, (oz / od) * 1.9 * dt, enemy.radius);
          });
        }
        moving = Math.abs(enemy.root.position.x - oldX) + Math.abs(enemy.root.position.z - oldZ) > 0.001;
        if (moving) {
          enemy.stuckTime = Math.max(0, enemy.stuckTime - dt * 2);
        } else {
          enemy.stuckTime += dt;
          if (enemy.stuckTime > 0.22 && now >= enemy.detourUntil) {
            enemy.stuckTime = 0;
            enemy.detourUntil = now + 1200 + Math.random() * 900;
            enemy.detourDir = Math.random() > 0.5 ? 1 : -1;
          }
          enemy.strafe *= -1;
        }
      } else {
        enemy.root.rotation.y += dt * 0.6;
      }

      const movedX = enemy.root.position.x - prevX;
      const movedZ = enemy.root.position.z - prevZ;
      if (state.config.mode !== 'range') {
        // 走姿：近距离交火才转头看目标，行军时朝向移动方向，避免侧身滑步
        let faceX;
        let faceZ;
        if (canSee && distance < 22) {
          faceX = targetPos.x - enemy.root.position.x;
          faceZ = targetPos.z - enemy.root.position.z;
        } else if (Math.abs(movedX) + Math.abs(movedZ) > 0.00005) {
          faceX = movedX;
          faceZ = movedZ;
        } else {
          faceX = goalX - enemy.root.position.x;
          faceZ = goalZ - enemy.root.position.z;
        }
        enemy.root.rotation.y = Math.atan2(faceX, faceZ) + Math.PI;
        enemy.parts.healthBar.quaternion.copy(state.camera.quaternion);
      }

      if (mode.enemyFire && canSee && now > enemy.lastShot) {
        enemy.lastShot = now + (enemy.fireDelay[0] + Math.random() * (enemy.fireDelay[1] - enemy.fireDelay[0])) * 1000;
        enemyShoot(enemy, distance, targetKind, targetAlly);
      }

      const enemyFar = distance > 70;
      enemy.root.visible = !enemyFar;
      if (enemy.parts.gun) enemy.parts.gun.visible = distance < 42;
      if (enemy.parts.mixer) {
        if (!enemyFar) {
          const moveSpeed = dt > 0 ? Math.hypot(movedX, movedZ) / dt : 0;
          playEnemyAction(enemy, moving ? (moveSpeed > 2.2 ? 'Run' : 'Walk') : 'Idle');
          enemy.animAccum = (enemy.animAccum || 0) + dt;
          if (enemy.animAccum >= (distance < 45 ? 0.033 : 0.1)) { enemy.parts.mixer.update(enemy.animAccum); enemy.animAccum = 0; }
        }
      } else {
        const phase = moving ? now * 0.012 : now * 0.004;
        enemy.parts.legL.rotation.x = Math.sin(phase + enemy.walkPhase) * (moving ? 0.55 : 0.02);
        enemy.parts.legR.rotation.x = -Math.sin(phase + enemy.walkPhase) * (moving ? 0.55 : 0.02);
        enemy.parts.armL.rotation.x = -Math.sin(phase + enemy.walkPhase) * (moving ? 0.34 : 0.15);
      }
      enemy.parts.healthBar.quaternion.copy(state.camera.quaternion);
    }
  }

  function enemyShoot(enemy, distance, targetKind, targetAlly) {
    enemy.parts.flash.visible = true;
    setTimeout(() => { if (enemy.parts) enemy.parts.flash.visible = false; }, 55);
    state.audio.play('enemyShot');
    const chance = Math.max(0.08, enemy.accuracy - Math.max(0, distance - 16) * 0.006);
    const start = new THREE.Vector3(); enemy.parts.flash.getWorldPosition(start);
    const target = targetKind === 'ally' && targetAlly
      ? targetAlly.root.position.clone().add(new THREE.Vector3(0, 1.35, 0))
      : getEyePosition(new THREE.Vector3());
    // 弹道遮挡：枪口到玩家之间只要被掩体挡住，子弹就打在掩体上，不再造成伤害
    const blockPoint = firstBlockingPoint(start, target);
    const hit = !blockPoint && Math.random() < chance;
    if (!hit) { target.x += (Math.random() - 0.5) * 1.8; target.y += (Math.random() - 0.5) * 1.1; target.z += (Math.random() - 0.5) * 1.8; }
    spawnTracer(start, blockPoint || target, 0xff6e72, 0.075);
    if (hit) { if (targetKind === 'ally' && targetAlly) damageAlly(targetAlly, enemy.damage); else damagePlayer(enemy.damage, enemy); }
  }

  function firstBlockingPoint(from, to) {
    const direction = to.clone().sub(from);
    const distance = direction.length();
    if (distance < 0.01) return null;
    state.raycaster.set(from, direction.normalize());
    state.raycaster.far = distance;
    const hits = state.raycaster.intersectObjects(state.worldMeshes, false);
    if (hits.length && hits[0].distance < distance - 0.35) return hits[0].point.clone();
    return null;
  }

  function spawnTracer(start, end, color, life) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start.clone(), end.clone()]);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(geometry, material);
    state.scene.add(line);
    state.tracers.push({ line, life: life || 0.07, maxLife: life || 0.07 });
  }

  function spawnBurst(position, color, count, force) {
    count = count || 10;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x; positions[i * 3 + 1] = position.y; positions[i * 3 + 2] = position.z;
      velocities[i * 3] = (Math.random() - 0.5) * (force || 3.5);
      velocities[i * 3 + 1] = Math.random() * (force || 3.5) * 0.75;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * (force || 3.5);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: 0.12, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geometry, material);
    state.scene.add(points);
    state.impacts.push({ points, velocities, life: 0.55, maxLife: 0.55 });
  }

  function updateEffects(dt) {
    for (let i = state.tracers.length - 1; i >= 0; i--) {
      const tracer = state.tracers[i];
      tracer.life -= dt;
      tracer.line.material.opacity = Math.max(0, tracer.life / tracer.maxLife);
      if (tracer.life <= 0) { state.scene.remove(tracer.line); tracer.line.geometry.dispose(); tracer.line.material.dispose(); state.tracers.splice(i, 1); }
    }
    for (let i = state.impacts.length - 1; i >= 0; i--) {
      const impact = state.impacts[i];
      impact.life -= dt;
      const positions = impact.points.geometry.attributes.position.array;
      for (let p = 0; p < positions.length; p += 3) {
        impact.velocities[p + 1] -= 7.5 * dt;
        positions[p] += impact.velocities[p] * dt;
        positions[p + 1] += impact.velocities[p + 1] * dt;
        positions[p + 2] += impact.velocities[p + 2] * dt;
      }
      impact.points.geometry.attributes.position.needsUpdate = true;
      impact.points.material.opacity = Math.max(0, impact.life / impact.maxLife);
      if (impact.life <= 0) { state.scene.remove(impact.points); impact.points.geometry.dispose(); impact.points.material.dispose(); state.impacts.splice(i, 1); }
    }
  }

  function fireWeapon() {
    const player = state.player;
    if (state.phase !== 'running' || player.dead || player.reloading) return;
    const weapon = currentWeaponSpec();
    if (weapon.c4) return;
    const ammo = currentWeaponState();
    const now = performance.now();
    if (state.match && state.match.freezeUntil && now < state.match.freezeUntil) return;
    if (now - player.lastShot < 60000 / weapon.rpm) return;
    if (!ammo.infinite && ammo.ammo <= 0) { state.audio.play('empty'); reloadWeapon(); return; }
    player.lastShot = now;
    if (!ammo.infinite) ammo.ammo--;
    player.shots++;
    player.recoilVelocity += degreesToRadians(weapon.recoil * 58);
    player.cameraShake = Math.max(player.cameraShake, weapon.model === 'shotgun' ? 0.11 : 0.042);
    state.audio.play(weapon.sound);
    const flash = state.weaponHolder.userData.flash;
    flash.visible = !weapon.melee; flash.rotation.z = Math.random() * Math.PI;
    clearTimeout(flash.userData.timer);
    flash.userData.timer = setTimeout(() => { flash.visible = false; }, 48);
    state.muzzleLight = state.muzzleLight || new THREE.PointLight(0xffb75d, 0, 7, 2);
    if (!state.muzzleLight.parent) state.scene.add(state.muzzleLight);
    flash.getWorldPosition(state.muzzleLight.position);
    state.muzzleLight.intensity = weapon.melee ? 0 : 6.5;
    setTimeout(() => { if (state.muzzleLight) state.muzzleLight.intensity = 0; }, 45);

    const moving = player.walking > 0.25 || !player.onGround;
    const baseSpread = player.ads > 0.7 ? weapon.adsSpread : weapon.spread;
    const spread = degreesToRadians(baseSpread * (moving ? weapon.moveSpread : 1) + (player.crouching ? -0.08 : 0));
    const origin = getEyePosition(new THREE.Vector3());
    for (let pellet = 0; pellet < weapon.pellets; pellet++) {
      const direction = getAimDirection();
      direction.x += (Math.random() - 0.5) * spread * 2;
      direction.y += (Math.random() - 0.5) * spread * 2;
      direction.z += (Math.random() - 0.5) * spread * 2;
      direction.normalize();
      state.raycaster.set(origin, direction);
      state.raycaster.far = weapon.range;
      const targets = state.worldMeshes.concat(state.enemies.filter((enemy) => !enemy.dead).map((enemy) => enemy.root));
      const hits = state.raycaster.intersectObjects(targets, true);
      const end = origin.clone().addScaledVector(direction, weapon.range);
      if (hits.length) {
        const hit = hits[0];
        end.copy(hit.point);
        const enemy = findEnemyFromObject(hit.object);
        if (enemy) {
          const headshot = hit.object.userData.zone === 'head';
          const falloff = Math.max(0.62, 1 - hit.distance / (weapon.range * 1.5));
          damageEnemy(enemy, weapon.damage * falloff * (headshot ? 1.85 : 1), headshot, weapon.name);
          spawnBurst(hit.point, headshot ? 0xffd76d : 0xff626d, headshot ? 12 : 7, 3.2);
        } else {
          spawnBurst(hit.point, 0xb8e5e2, 6, 2.3);
        }
      }
      const tracerDistance = Math.max(0.15, Math.min(0.7, end.distanceTo(origin) * 0.4));
      const tracerStart = origin.clone().addScaledVector(direction, tracerDistance);
      if (!weapon.melee) spawnTracer(tracerStart, end, 0xffe2a3, weapon.model === 'shotgun' ? 0.045 : 0.07);
    }
    updateAmmoUI();
  }

  function damageEnemy(enemy, damage, headshot, weaponName, byAlly) {
    if (!enemy || enemy.dead) return;
    enemy.hp -= damage;
    enemy.hurtAt = performance.now();
    state.player.hits++;
    state.audio.play(headshot ? 'headshot' : 'hit');
    dom.hitMarker.classList.remove('show', 'kill');
    void dom.hitMarker.offsetWidth;
    dom.hitMarker.classList.add('show');
    enemy.parts.healthFill.scale.x = Math.max(0, enemy.hp / enemy.maxHp);
    if (enemy.parts.head && enemy.parts.head.material && enemy.parts.head.material.emissive) {
      enemy.parts.head.material.emissive.setHex(0x990000); enemy.parts.head.material.emissiveIntensity = 1.8;
      setTimeout(() => { if (enemy.parts.head.material.emissive) enemy.parts.head.material.emissiveIntensity = 0; }, 70);
    }
    if (enemy.hp > 0) return;

    enemy.dead = true;
    enemy.deathAt = performance.now();
    if (!byAlly) {
      state.player.kills++;
      state.player.streak++;
      state.player.bestStreak = Math.max(state.player.bestStreak, state.player.streak);
      state.audio.play('kill');
      addKillFeed('你', '毒蛇 ' + enemy.id, weaponName || currentWeaponSpec().name, false);
    } else {
      addKillFeed('队友', '毒蛇 ' + enemy.id, weaponName || '掩护射击', false);
    }
    if (state.config.mode === 'strike' || state.config.mode === 'range') state.match.blueScore++;
    spawnBurst(enemy.root.position.clone().add(new THREE.Vector3(0, 1.25, 0)), 0xff4f61, 18, 5.5);
    if (headshot) announce('精准爆头', '#ffd36c');
    dom.hitMarker.classList.add('kill');
    if (state.config.mode === 'strike' && state.match.blueScore >= MODES.strike.target) finishMatch(true, '你在倒计时结束前率队达到击倒目标。');
    if (state.config.mode === 'range' && state.match.blueScore >= MODES.range.target) finishMatch(true, '训练目标全部完成。');
    updateHud();
  }

  function reloadWeapon() {
    const player = state.player;
    if (state.phase !== 'running' || player.dead || player.reloading) return;
    const weapon = currentWeaponSpec();
    if (weapon.melee) return;
    const ammo = currentWeaponState();
    if (ammo.ammo >= weapon.mag || ammo.reserve <= 0) return;
    player.reloading = true;
    player.reloadEnd = performance.now() + weapon.reload;
    dom.reloadRing.classList.add('show');
    state.audio.play('reload');
  }

  function completeReload() {
    const player = state.player;
    const weapon = currentWeaponSpec();
    const ammo = currentWeaponState();
    const needed = weapon.mag - ammo.ammo;
    const moved = Math.min(needed, ammo.reserve);
    ammo.ammo += moved;
    ammo.reserve -= moved;
    player.reloading = false;
    dom.reloadRing.classList.remove('show');
    updateAmmoUI();
  }

  function refreshBackpackUI() {
    if (!dom.backpackGrid) return;
    Array.from(dom.backpackGrid.children).forEach((card, i) => card.classList.toggle('active', i === state.player.loadout));
  }

  function selectWeaponSlot(slot) {
    if (state.phase !== 'running' || slot < 0 || slot > 3 || slot === state.player.currentWeapon) return;
    if (slot === 3 && !state.player.hasC4) return;
    state.player.previousWeapon = state.player.currentWeapon;
    state.player.currentWeapon = slot;
    input.ads = false;
    state.player.reloading = false;
    dom.reloadRing.classList.remove('show');
    buildWeaponModel(slot);
    showToast(currentWeaponSpec().name, 800);
  }

  function switchWeapon(index) { selectWeaponSlot(index); }

  function quickSwitchWeapon() {
    if (state.phase !== 'running' || state.player.dead) return;
    const target = state.player.previousWeapon;
    if (target < 0 || target > 3 || target === state.player.currentWeapon) return;
    if (target === 3 && !state.player.hasC4) return;
    const from = state.player.currentWeapon;
    state.player.currentWeapon = target;
    state.player.previousWeapon = from;
    input.ads = false;
    state.player.reloading = false;
    dom.reloadRing.classList.remove('show');
    buildWeaponModel(target);
    showToast('快速切枪 · ' + currentWeaponSpec().name, 700);
  }

  function openBackpack() {
    if (state.phase !== 'running') return;
    state.phase = 'backpack';
    input.fireHeld = false; input.firePressed = false; input.ads = false;
    state.suppressPointerPause = true;
    if (document.pointerLockElement) document.exitPointerLock();
    refreshBackpackUI();
    dom.backpackOverlay.classList.remove('hidden');
  }

  function closeBackpack(resume) {
    if (state.phase !== 'backpack') return;
    dom.backpackOverlay.classList.add('hidden');
    state.phase = 'running';
    state.suppressPointerPause = false;
    if (resume !== false && !input.isTouch) requestPointerLockSafe();
  }

  function selectBackpack(index) {
    if (index < 0 || index >= WEAPONS.length) return;
    state.player.loadout = index;
    if (state.player.currentWeapon !== 0) state.player.previousWeapon = state.player.currentWeapon;
    if (state.player.previousWeapon === 0) state.player.previousWeapon = 1;
    state.player.currentWeapon = 0;
    input.ads = false;
    state.player.reloading = false;
    buildWeaponModel(0);
    refreshBackpackUI();
    closeBackpack(true);
    announce('背包 ' + (index + 1) + ' · ' + WEAPONS[index].name, '#ffb54a');
  }

  function throwGrenade() {
    if (state.phase !== 'running' || state.player.dead || state.player.grenades <= 0 || performance.now() - input.lastGrenade < 800) return;
    input.lastGrenade = performance.now();
    state.player.grenades--;
    const material = new THREE.MeshStandardMaterial({ color: 0x2f4e3c, roughness: 0.5, metalness: 0.65 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), material);
    const origin = getEyePosition(new THREE.Vector3());
    const direction = getAimDirection();
    mesh.position.copy(origin).addScaledVector(direction, 0.55);
    direction.y += 0.16; direction.normalize();
    state.scene.add(mesh);
    state.grenades.push({ mesh, velocity: direction.multiplyScalar(16), time: 1.55 });
    state.audio.play('grenade');
    updateAmmoUI();
  }

  function updateGrenades(dt) {
    for (let i = state.grenades.length - 1; i >= 0; i--) {
      const grenade = state.grenades[i];
      grenade.time -= dt;
      grenade.velocity.y -= 13.5 * dt;
      grenade.mesh.position.addScaledVector(grenade.velocity, dt);
      grenade.mesh.rotation.x += dt * 8;
      grenade.mesh.rotation.z += dt * 6;
      if (grenade.mesh.position.y < 0.16) { grenade.mesh.position.y = 0.16; grenade.velocity.y *= -0.34; grenade.velocity.x *= 0.72; grenade.velocity.z *= 0.72; }
      if (grenade.time <= 0) {
        const point = grenade.mesh.position.clone();
        state.scene.remove(grenade.mesh); grenade.mesh.geometry.dispose(); grenade.mesh.material.dispose();
        state.grenades.splice(i, 1);
        state.audio.play('explode');
        spawnBurst(point, 0xff9b43, 34, 9.5);
        const flash = new THREE.PointLight(0xff6a2e, 6, 18, 2); flash.position.copy(point); state.scene.add(flash);
        setTimeout(() => state.scene.remove(flash), 180);
        state.enemies.forEach((enemy) => {
          if (enemy.dead) return;
          const distance = enemy.root.position.distanceTo(point);
          if (distance < 7.5 && hasLineOfSight(point, enemy.root.position.clone().add(new THREE.Vector3(0, 1, 0)))) damageEnemy(enemy, 115 * (1 - distance / 8.5), false, '战术手雷');
        });
      }
    }
  }

  async function startMatch(options) {
    const config = options || {
      mode: document.querySelector('#modeOptions .active').dataset.mode,
      map: document.querySelector('#mapOptions .active').dataset.map,
      difficulty: dom.difficulty.value,
      quality: dom.quality.value
    };
    state.config = Object.assign({}, config);
    await loadSoldierAsset();
    state.audio.resume();
    state.phase = 'running';
    state.suppressPointerPause = false;
    state.weaponHolder.visible = true;
    state.enemies.forEach((enemy) => { if (enemy.root.parent) state.scene.remove(enemy.root); });
    state.enemies = [];
    state.allies.forEach((ally) => { if (ally.root.parent) state.scene.remove(ally.root); });
    state.allies = [];
    clearBombState();
    state.tracers.forEach((tracer) => state.scene.remove(tracer.line)); state.tracers = [];
    state.impacts.forEach((impact) => state.scene.remove(impact.points)); state.impacts = [];
    state.grenades.forEach((grenade) => state.scene.remove(grenade.mesh)); state.grenades = [];
    createPlayer();
    buildMap(state.config.map);
    const mode = MODES[state.config.mode];
    state.match = {
      mode: state.config.mode, timeLeft: mode.duration, duration: mode.duration, blueScore: 0, redScore: 0,
      round: 1, roundEnded: false, startedAt: performance.now(), endReason: '',
      wave: 1, waveTotal: mode.waves || 0, waveState: 'active', waveTimer: 0,
      freezeUntil: mode.bomb ? performance.now() + 4000 : 0
    };
    spawnEnemyWave();
    if (mode.bomb) { spawnAllies(mode.allies || 2); assignBombCarrier(); }
    dom.menu.classList.add('hidden');
    dom.pause.classList.add('hidden');
    dom.result.classList.add('hidden');
    dom.backpackOverlay.classList.add('hidden');
    document.body.classList.remove('scoped');
    dom.hud.classList.remove('hidden');
    if (input.isTouch) dom.touchControls.classList.remove('hidden');
    updateHud();
    announce(mode.name.toUpperCase(), '#70e6df');
    if (state.config.quality !== dom.quality.value) { dom.quality.value = state.config.quality; qualityChanged(); }
    if (!input.isTouch && config && config.requestLock !== false) {
      requestPointerLockSafe();
    }
    return getDebugState();
  }

  function resetBombRound() {
    const mode = MODES.bomb;
    state.match.timeLeft = mode.duration;
    state.match.roundEnded = false;
    state.match.freezeUntil = performance.now() + 4000;
    state.player.dead = false;
    state.player.hp = 100;
    state.player.armor = 50;
    state.player.invulnerableUntil = performance.now() + 1200;
    state.player.streak = 0;
    state.player.primaryAmmo = createPrimaryAmmoState();
    state.player.secondaryAmmo = createSecondaryAmmoState();
    state.player.currentWeapon = 0;
    state.player.pos.set(0, 0, 58);
    state.player.verticalVelocity = 0;
    state.player.crouching = false;
    state.player.spectate = false;
    state.player.spectateTarget = null;
    clearBombState();
    state.enemies.forEach((enemy) => { if (enemy.root.parent) state.scene.remove(enemy.root); });
    state.enemies = [];
    state.allies.forEach((ally) => { if (ally.root.parent) state.scene.remove(ally.root); });
    state.allies = [];
    spawnEnemyWave();
    spawnAllies(mode.allies || 2);
    assignBombCarrier();
    updateHud();
    announce('第 ' + state.match.round + ' 回合 · 潜伏者', '#70e6df');
  }

  function endBombRound(bomberWon, reason) {
    if (state.phase !== 'running' || state.match.roundEnded) return;
    state.match.roundEnded = true;
    state.phase = 'intermission';
    state.transitionTimer = 3.2;
    if (bomberWon) state.match.blueScore++; else state.match.redScore++;
    state.audio.play('round');
    announce(reason || (bomberWon ? '潜伏者赢得回合' : '保卫者赢得回合'), bomberWon ? '#ffcf6b' : '#ff6f78');
    updateHud();
    if (state.match.blueScore >= MODES.bomb.target) finishMatch(true, '潜伏者率先赢下 5 个爆破回合。');
    else if (state.match.redScore >= MODES.bomb.target) finishMatch(false, '保卫者率先赢下 5 个爆破回合。');
  }

  function finishMatch(playerWon, reason) {
    if (state.phase === 'gameover') return;
    state.phase = 'gameover';
    state.suppressPointerPause = true;
    if (document.pointerLockElement) document.exitPointerLock();
    if (state.match) state.match.endReason = reason;
    const accuracy = state.player.shots ? Math.round(state.player.hits / state.player.shots * 100) : 0;
    dom.resultKicker.textContent = playerWon ? 'MISSION COMPLETE' : 'MISSION FAILED';
    dom.resultTitle.textContent = playerWon ? '任务完成' : '行动失败';
    dom.resultReason.textContent = reason;
    dom.resultKills.textContent = state.player.kills;
    dom.resultAccuracy.textContent = accuracy + '%';
    dom.resultStreak.textContent = state.player.bestStreak;
    dom.resultDamage.textContent = Math.round(state.player.damageTaken);
    dom.result.querySelector('.dialog-panel').classList.toggle('win', playerWon);
    dom.result.querySelector('.dialog-panel').classList.toggle('lose', !playerWon);
    dom.result.classList.remove('hidden');
  }

  function pauseGame(reason) {
    if (state.phase !== 'running') return;
    state.phase = 'paused';
    state.pauseReason = reason || 'manual';
    input.fireHeld = false; input.ads = false;
    dom.pause.classList.remove('hidden');
    dom.pauseKills.textContent = state.player.kills;
    dom.pauseTime.textContent = formatTime(state.match.timeLeft);
    state.suppressPointerPause = true;
    if (document.pointerLockElement) document.exitPointerLock();
  }

  function resumeGame() {
    if (state.phase !== 'paused') return;
    state.phase = 'running';
    state.suppressPointerPause = false;
    dom.pause.classList.add('hidden');
    if (!input.isTouch) requestPointerLockSafe();
  }

  function returnToMenu() {
    state.phase = 'menu';
    state.suppressPointerPause = false;
    input.fireHeld = false; input.ads = false;
    if (document.pointerLockElement) document.exitPointerLock();
    dom.hud.classList.add('hidden');
    document.body.classList.remove('low-health');
    state.weaponHolder.visible = false;
    dom.touchControls.classList.add('hidden');
    dom.pause.classList.add('hidden');
    dom.result.classList.add('hidden');
    dom.backpackOverlay.classList.add('hidden');
    document.body.classList.remove('scoped');
    dom.menu.classList.remove('hidden');
    state.enemies.forEach((enemy) => { if (enemy.root.parent) state.scene.remove(enemy.root); });
    state.enemies = [];
    state.grenades.forEach((grenade) => state.scene.remove(grenade.mesh)); state.grenades = [];
    buildMap(state.config.map);
    state.previewAngle = 0;
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(seconds / 60);
    return String(minutes).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function respawnPlayer() {
    const player = state.player;
    let spawn = state.spawns[0];
    let bestDistance = -1;
    state.spawns.forEach((candidate) => {
      let distance = 999;
      state.enemies.forEach((enemy) => { if (!enemy.dead) distance = Math.min(distance, candidate.distanceTo(enemy.root.position)); });
      if (distance > bestDistance) { bestDistance = distance; spawn = candidate; }
    });
    player.pos.set(spawn.x, 0, spawn.z);
    player.verticalVelocity = 0;
    player.hp = 100;
    player.armor = 50;
    player.dead = false;
    player.streak = 0;
    player.invulnerableUntil = performance.now() + 1400;
    player.primaryAmmo = createPrimaryAmmoState();
    player.secondaryAmmo = createSecondaryAmmoState();
    player.currentWeapon = 0;
    updateHud();
    announce('重新部署', '#70e6df');
    if (!input.isTouch) requestPointerLockSafe();
  }

  function damagePlayer(amount, source) {
    const player = state.player;
    const now = performance.now();
    if (player.dead || now < player.invulnerableUntil || state.phase !== 'running') return;
    const armorAbsorb = Math.min(player.armor, amount * 0.46);
    player.armor -= armorAbsorb;
    player.hp -= amount - armorAbsorb;
    player.damageTaken += amount;
    player.cameraShake = Math.max(player.cameraShake, 0.11);
    state.audio.play('hurt');
    dom.damageVignette.style.opacity = Math.min(0.9, 0.25 + (100 - player.hp) / 130);
    clearTimeout(damageVignetteTimer);
    damageVignetteTimer = setTimeout(() => { dom.damageVignette.style.opacity = 0; }, 130);
    updateVitalsUI();
    if (player.hp > 0) return;
    player.hp = 0;
    player.dead = true;
    player.deaths++;
    state.match.redScore++;
    addKillFeed(source && source.id ? '毒蛇 ' + source.id : '毒蛇小队', '你', '战术射击', true);
    updateHud();
    // 玩家携带 C4 阵亡：C4 落地，队友跑过去捡
    if (player.hasC4 && state.bomb && !state.bomb.planted) {
      player.hasC4 = false;
      const dropPos = player.pos.clone();
      state.bomb.dropped = true;
      state.bomb.dropPosition = dropPos;
      if (!state.bomb.dropModel) state.bomb.dropModel = createBombModel();
      state.bomb.dropModel.position.copy(dropPos);
      if (!state.bomb.dropModel.parent) state.scene.add(state.bomb.dropModel);
      announce('你已阵亡，C4 已掉落', '#ffcf6b');
      updateHud();
    }
    if (state.config.mode === 'bomb') {
      const allyStillAlive = state.allies.some((ally) => !ally.dead);
      if (allyStillAlive) {
        player.spectate = true;
        player.spectateTarget = null;
        announce('你已阵亡，进入观战模式', '#ffcf6b');
      } else {
        endBombRound(false, '潜伏者全部阵亡，保卫者获胜');
      }
    } else if (state.config.mode === 'strike' && state.match.redScore >= MODES.strike.target) {
      finishMatch(false, '毒蛇小队率先达到击倒目标。');
    } else {
      player.respawnAt = performance.now() + 2800;
      announce('你被击倒', '#ff6f78');
    }
  }

  function updatePlayer(dt, now) {
    const player = state.player;
    if (player.dead) {
      if (state.config.mode !== 'bomb' && now >= player.respawnAt) respawnPlayer();
      else if (state.config.mode === 'bomb' && player.spectate) {
        // 观战模式：切换到最近存活的队友视角
        if (!player.spectateTarget || player.spectateTarget.dead) {
          let best = null, bestDist = Infinity;
          state.allies.forEach((ally) => {
            if (ally.dead) return;
            const d = Math.hypot(ally.root.position.x - player.pos.x, ally.root.position.z - player.pos.z);
            if (d < bestDist) { bestDist = d; best = ally; }
          });
          player.spectateTarget = best;
        }
        const target = player.spectateTarget;
        state.weaponHolder.visible = false;
        if (target) {
          const tx = target.root.position.x;
          const ty = target.root.position.y + 1.68;
          const tz = target.root.position.z;
          state.camera.position.x += (tx - state.camera.position.x) * Math.min(1, dt * 5);
          state.camera.position.y += (ty - state.camera.position.y) * Math.min(1, dt * 5);
          state.camera.position.z += (tz - state.camera.position.z) * Math.min(1, dt * 5);
          state.camera.lookAt(tx, ty, tz);
          state.camera.fov += (58 - state.camera.fov) * Math.min(1, dt * 5);
          state.camera.updateProjectionMatrix();
        }
      }
      return;
    }
    const frozen = !!(state.match && state.match.freezeUntil && now < state.match.freezeUntil);
    const forwardInput = frozen ? 0 : ((input.keys.KeyW ? 1 : 0) - (input.keys.KeyS ? 1 : 0) - input.touchMoveY);
    const strafeInput = frozen ? 0 : ((input.keys.KeyD ? 1 : 0) - (input.keys.KeyA ? 1 : 0) + input.touchMoveX);
    if (frozen) { player.velocity.set(0, 0, 0); player.verticalVelocity = 0; player.sprinting = false; }
    const hasInput = Math.abs(forwardInput) + Math.abs(strafeInput) > 0.05;
    const wantsSprint = (input.keys.ShiftLeft || input.keys.ShiftRight) && forwardInput > 0.2 && player.ads < 0.35 && !player.crouching;
    player.sprinting = wantsSprint;
    const speed = player.crouching ? 3.45 : wantsSprint ? 8.3 : player.ads > 0.55 ? 4.65 : 6.35;
    const forward = new THREE.Vector3(-Math.sin(input.yaw), 0, -Math.cos(input.yaw));
    const right = new THREE.Vector3(Math.cos(input.yaw), 0, -Math.sin(input.yaw));
    const desired = new THREE.Vector3();
    if (hasInput) {
      desired.addScaledVector(forward, forwardInput).addScaledVector(right, strafeInput).normalize().multiplyScalar(speed);
    }
    const acceleration = player.onGround ? 18 : 6.5;
    player.velocity.x += (desired.x - player.velocity.x) * Math.min(1, acceleration * dt);
    player.velocity.z += (desired.z - player.velocity.z) * Math.min(1, acceleration * dt);
    if (!hasInput && player.onGround) { player.velocity.x *= Math.pow(0.0004, dt); player.velocity.z *= Math.pow(0.0004, dt); }
    moveWithCollision(player.pos, player.velocity.x * dt, player.velocity.z * dt, player.radius);
    const targetWalking = Math.min(1, Math.hypot(player.velocity.x, player.velocity.z) / 6);
    player.walking += (targetWalking - player.walking) * Math.min(1, dt * 9);

    player.crouching = !!input.keys.ControlLeft || !!input.keys.ControlRight || !!input.touchCrouch;
    if (!player.onGround && !frozen) {
      player.verticalVelocity -= 22 * dt;
      player.pos.y += player.verticalVelocity * dt;
      if (player.pos.y <= 0) { player.pos.y = 0; player.verticalVelocity = 0; player.onGround = true; }
    }
    if (!frozen && input.keys.Space && player.onGround && !player.crouching) { player.verticalVelocity = 7.6; player.onGround = false; }

    const targetAds = input.ads && !player.sprinting ? 1 : 0;
    player.ads += (targetAds - player.ads) * Math.min(1, dt * 12);
    const activeWeapon = currentWeaponSpec();
    const scoped = !!activeWeapon.scope && player.ads > 0.68 && !player.sprinting;
    const targetFov = scoped ? 18 : 72 - player.ads * (activeWeapon.scope ? 10 : 19);
    dom.scopeOverlay.classList.toggle('show', scoped);
    document.body.classList.toggle('scoped', scoped);
    state.weaponHolder.visible = !scoped;
    state.camera.fov += (targetFov - state.camera.fov) * Math.min(1, dt * 12);
    state.camera.updateProjectionMatrix();

    player.recoilVelocity *= Math.pow(0.01, dt);
    player.recoil += player.recoilVelocity * dt;
    player.recoil *= Math.pow(0.12, dt);
    input.pitch = Math.max(-1.42, Math.min(1.42, input.pitch));
    state.camera.rotation.set(input.pitch + player.recoil, input.yaw, player.sprinting && player.walking > 0.3 ? -0.025 : 0, 'YXZ');
    player.cameraShake *= Math.pow(0.002, dt);
    const shakeX = (Math.random() - 0.5) * player.cameraShake;
    const shakeY = (Math.random() - 0.5) * player.cameraShake;
    player.bobTime += dt * (1.9 + player.walking * 6.6);
    const bobAmount = player.onGround ? player.walking * (player.sprinting ? 0.034 : 0.019) : 0;
    const eyeHeight = player.crouching ? 1.16 : 1.68;
    state.camera.position.set(player.pos.x + shakeX, player.pos.y + eyeHeight + Math.sin(player.bobTime * 2) * bobAmount + shakeY, player.pos.z);


    const weapon = currentWeaponSpec();
    const adsOffset = player.ads;
    const baseX = 0.03 - adsOffset * 0.19;
    const baseY = -0.065 + adsOffset * 0.09;
    const baseZ = -0.08 + adsOffset * 0.15;
    const bobX = Math.sin(player.bobTime) * bobAmount * 1.05;
    const bobY = Math.abs(Math.cos(player.bobTime * 2)) * bobAmount * 0.7;
    const reloadDrop = player.reloading ? -0.2 : 0;
    state.weaponHolder.position.set(baseX + bobX, baseY - bobY + reloadDrop, baseZ);
    state.weaponHolder.rotation.x = -player.recoil * 2.1 - (player.sprinting ? 0.11 : 0) - (player.reloading ? 0.28 : 0);
    state.weaponHolder.rotation.z = player.sprinting ? -0.06 : 0;
    state.weaponHolder.rotation.y = state.weaponHolder.userData.model ? -state.weaponHolder.userData.model.rotation.y * player.ads : 0;
    if (state.weaponHolder.userData.spinPart) state.weaponHolder.userData.spinPart.rotation.z += dt * (input.fireHeld ? 25 : 3);

    if (player.reloading && now >= player.reloadEnd) completeReload();
    const shouldFire = weapon.auto ? input.fireHeld : input.firePressed;
    if (shouldFire) fireWeapon();
    input.firePressed = false;
    if (state.config.mode === 'bomb') { updateBombPlant(dt); updateActionPrompt(); }
    updateCrosshair();
  }

  function updateMatch(dt, now) {
    if (!state.match) return;
    if (state.phase === 'intermission') {
      state.transitionTimer -= dt;
      if (state.transitionTimer <= 0 && state.match.blueScore < MODES.bomb.target && state.match.redScore < MODES.bomb.target) {
        state.match.round++;
        state.phase = 'running';
        resetBombRound();
      }
      return;
    }
    if (state.phase !== 'running') return;
    state.match.timeLeft -= dt;
    updatePlayer(dt, now);
    updateEnemies(dt, now);
    updateAllies(dt, now);
    updateGrenades(dt);
    if (state.config.mode === 'strike' && state.phase === 'running') {
      const anyAlive = state.enemies.some((enemy) => !enemy.dead);
      if (!anyAlive && state.match.waveState === 'active' && now - state.match.startedAt > 900) {
        if (state.match.wave >= state.match.waveTotal) {
          finishMatch(true, '你率队抵御了全部 ' + state.match.waveTotal + ' 波进攻。');
          return;
        }
        state.match.waveState = 'clearing';
        state.match.waveTimer = now + 2600;
        announce('第 ' + state.match.wave + ' 波已肃清', '#ffd36c');
      }
      if (state.match.waveState === 'clearing' && now >= state.match.waveTimer) {
        state.match.wave++;
        state.match.waveState = 'active';
        spawnEnemyWave();
        announce('第 ' + state.match.wave + ' 波来袭', '#ff6f78');
        updateHud();
      }
    }
    if (state.config.mode === 'bomb' && !state.match.roundEnded) {
      const bomberAlive = !state.player.dead || state.allies.some((ally) => !ally.dead);
      const guardAlive = state.enemies.some((enemy) => !enemy.dead);
      // 任意一方被全部消灭，另一方立即获得本回合胜利（C4 已安放时同样生效）
      if (now - state.match.startedAt > 500) {
        if (!bomberAlive) endBombRound(false, '潜伏者全部阵亡，保卫者获胜');
        else if (!guardAlive) endBombRound(true, '保卫者全部阵亡，潜伏者获胜');
      }
      if (!state.match.roundEnded && state.bomb && state.bomb.planted) {
        state.bomb.timer -= dt;
        if (state.bomb.model && state.bomb.model.userData.light) {
          state.bomb.model.userData.light.visible = Math.sin(now * 0.014) > -0.2;
        }
        updateBombDefuse(dt);
        if (!state.match.roundEnded && state.bomb.timer <= 0) endBombRound(true, 'C4 成功引爆，潜伏者获胜');
      }
    }
    if (state.match.timeLeft <= 0 && state.phase === 'running') {
      if (state.config.mode === 'strike') finishMatch(state.match.blueScore >= state.match.redScore, state.match.blueScore >= state.match.redScore ? '时间结束，零点小队取得领先。' : '时间结束，毒蛇小队取得领先。');
      else if (state.config.mode === 'bomb') endBombRound(false);
      else finishMatch(false, '训练时间结束，再次挑战以完成全部目标。');
    }
  }

  let actionPromptCache = '';
  function updateActionPrompt() {
    if (!dom.actionPrompt) return;
    let text = '';
    if (state.config.mode === 'bomb' && state.bomb && !state.bomb.planted && !state.player.dead) {
      const site = currentBombSite();
      if (state.player.hasC4 && site) {
        const pct = Math.min(100, Math.round(state.bomb.plantProgress / 6 * 100));
        text = state.bomb.plantProgress > 0.05 ? '安放 C4 ' + pct + '%（保持不动）' : '长按 E 安放 C4 · ' + site.name + ' 点';
      } else if (state.bomb.dropped && state.bomb.dropPosition) {
        const dropDist = Math.hypot(state.player.pos.x - state.bomb.dropPosition.x, state.player.pos.z - state.bomb.dropPosition.z);
        if (dropDist < 2.2) text = '按 E 拾取 C4';
      } else if (!state.player.hasC4 && !state.bomb.dropped) {
        text = 'C4 在队友身上';
      }
    }
    if (text !== actionPromptCache) {
      actionPromptCache = text;
      dom.actionPrompt.textContent = text;
      dom.actionPrompt.classList.toggle('hidden', !text);
    }
  }

  function updateCrosshair() {
    const weapon = currentWeaponSpec();
    const movePenalty = state.player.walking * weapon.moveSpread;
    const spread = (state.player.ads > 0.7 ? weapon.adsSpread : weapon.spread) + movePenalty;
    const pixels = 22 + Math.min(46, spread * 5.5);
    dom.crosshair.style.setProperty('--spread', pixels.toFixed(1) + 'px');
  }

  function updateVitalsUI() {
    const player = state.player;
    dom.healthText.textContent = Math.max(0, Math.round(player.hp));
    dom.armorText.textContent = Math.max(0, Math.round(player.armor));
    dom.healthFill.style.width = Math.max(0, Math.min(100, player.hp)) + '%';
    dom.armorFill.style.width = Math.max(0, Math.min(100, player.armor)) + '%';
    document.body.classList.toggle('low-health', player.hp <= 30 && !player.dead);
  }

  let ammoPipEls = null;
  function updateAmmoUI() {
    if (!state.player) return;
    const weapon = currentWeaponSpec();
    const ammo = currentWeaponState();
    if (weapon.c4) {
      dom.ammoText.innerHTML = '<strong>C4</strong><span>/--</span>';
      dom.ammoPips.innerHTML = '';
      dom.grenadeText.textContent = state.player.grenades;
      ammoPipEls = null;
      return;
    }
    if (weapon.melee) {
      dom.ammoText.innerHTML = '<strong>∞</strong><span>/--</span>';
      dom.ammoPips.innerHTML = '';
      dom.grenadeText.textContent = state.player.grenades;
      ammoPipEls = null;
      return;
    }
    dom.ammoText.innerHTML = '<strong>' + ammo.ammo + '</strong><span>/</span>' + ammo.reserve;
    const pips = 5;
    const lit = Math.ceil(ammo.ammo / weapon.mag * pips);
    if (!ammoPipEls || ammoPipEls.length !== pips) {
      dom.ammoPips.innerHTML = '';
      ammoPipEls = [];
      for (let i = 0; i < pips; i++) {
        const pip = document.createElement('i');
        dom.ammoPips.appendChild(pip);
        ammoPipEls.push(pip);
      }
    }
    for (let i = 0; i < pips; i++) {
      ammoPipEls[i].className = i < lit ? 'on' : '';
    }
    dom.grenadeText.textContent = state.player.grenades;
  }

  function updateHud() {
    if (!state.match || !state.player) return;
    const mode = MODES[state.config.mode];
    const alive = state.enemies.filter((enemy) => !enemy.dead).length;
    const bombPlanted = state.config.mode === 'bomb' && state.bomb && state.bomb.planted;
    dom.clock.textContent = bombPlanted ? Math.ceil(Math.max(0, state.bomb.timer)) + 's' : formatTime(state.match.timeLeft);
    dom.modeLabel.textContent = mode.name + '  ' + mode.icon;
    dom.blueScore.textContent = state.match.blueScore;
    dom.redScore.textContent = state.match.redScore;
    if (state.config.mode === 'bomb') {
      if (state.bomb && state.bomb.planted) dom.roundText.textContent = 'C4 已安放 · ' + state.bomb.site + ' 点';
      else {
        const carrierText = state.player.hasC4 ? '你携带 C4' : (state.allies.some((ally) => ally.hasC4 && !ally.dead) ? '队友携带 C4' : 'C4 已丢下');
        dom.roundText.textContent = '第 ' + state.match.round + ' 回合 · ' + carrierText;
      }
    }
    else if (state.config.mode === 'strike') dom.roundText.textContent = '第 ' + state.match.wave + ' / ' + state.match.waveTotal + ' 波';
    else dom.roundText.textContent = '目标 ' + mode.target + ' 击倒';
    dom.radarMap.textContent = state.currentMap ? state.currentMap.name : '';
    dom.radarKills.textContent = state.player.kills + ' K';
    dom.objectiveText.textContent = mode.objective;
    const progressValue = state.config.mode === 'strike' ? (state.match.wave - 1) / Math.max(1, state.match.waveTotal) : state.match.blueScore / mode.target;
    dom.objectiveProgress.style.width = Math.min(100, progressValue * 100) + '%';
    if (state.config.mode === 'bomb') {
      const allyAlive = state.allies.filter((ally) => !ally.dead).length + (state.player.dead ? 0 : 1);
      dom.aliveCounter.innerHTML = '<b>' + allyAlive + '</b> 名潜伏者 · <b>' + alive + '</b> 名保卫者';
    } else {
      dom.aliveCounter.innerHTML = '<b>' + alive + '</b> 名敌方作战单位 · 死亡 ' + state.player.deaths;
    }
    updateVitalsUI();
    updateAmmoUI();
  }

  function drawRadar() {
    const ctx = dom.radar.getContext('2d');
    const w = dom.radar.width;
    const h = dom.radar.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 1.62;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(4,17,20,.92)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(112,230,223,.10)';
    ctx.lineWidth = 1;
    for (let r = 50; r < 190; r += 45) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.strokeStyle = 'rgba(112,230,223,.14)'; ctx.stroke();
    ctx.fillStyle = 'rgba(140,177,180,.34)';
    state.colliders.forEach((c) => {
      if (Math.abs(c.x) > 86 || Math.abs(c.z) > 86) return;
      ctx.fillRect(cx + (c.x - c.hw) * scale, cy + (c.z - c.hd) * scale, Math.max(2, c.hw * 2 * scale), Math.max(2, c.hd * 2 * scale));
    });
    ctx.save();
    ctx.translate(cx + state.player.pos.x * scale, cy + state.player.pos.z * scale);
    ctx.rotate(-input.yaw);
    ctx.fillStyle = '#70e6df';
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 7); ctx.lineTo(0, 4); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (state.currentMap && state.currentMap.sites) {
      state.currentMap.sites.forEach((site) => {
        const sx = cx + site.x * scale;
        const sy = cy + site.z * scale;
        ctx.strokeStyle = 'rgba(255,176,64,.85)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy, site.radius * scale * 0.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,196,92,.95)';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(site.name, sx, sy);
      });
    }
    if (state.bomb) {
      const bombPos = state.bomb.planted ? state.bomb.position : (state.bomb.dropped ? state.bomb.dropPosition : null);
      if (bombPos) {
        const bx = cx + bombPos.x * scale;
        const by = cy + bombPos.z * scale;
        const blink = Math.sin(performance.now() * 0.009) > 0;
        if (state.bomb.planted) {
          ctx.fillStyle = blink ? '#ff3b30' : '#7d1d16';
          ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, Math.PI * 2); ctx.fill();
        } else {
          // 掉落在地的 C4：高亮金色 + 外圈脉冲，方便快速找到
          ctx.fillStyle = blink ? '#ffe14d' : '#8a6a10';
          ctx.beginPath(); ctx.arc(bx, by, 4.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = blink ? 'rgba(255,225,77,.9)' : 'rgba(255,225,77,.3)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(bx, by, 7 + Math.sin(performance.now() * 0.009) * 1.6, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }
    state.allies.forEach((ally) => {
      if (ally.dead || !ally.root.visible) return;
      const ax = cx + ally.root.position.x * scale;
      const ay = cy + ally.root.position.z * scale;
      ctx.fillStyle = '#4fe0c6';
      ctx.beginPath(); ctx.arc(ax, ay, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(79,224,198,.45)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, 6.2, 0, Math.PI * 2); ctx.stroke();
    });
    state.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      const x = cx + enemy.root.position.x * scale;
      const y = cy + enemy.root.position.z * scale;
      ctx.fillStyle = '#ff5964';
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,89,100,.3)'; ctx.beginPath(); ctx.arc(x, y, 8 + Math.sin(performance.now() * 0.008) * 2, 0, Math.PI * 2); ctx.stroke();
    });
  }

  function updateEffectsAndFeedback(dt, now) {
    updateEffects(dt);
    if (state.player) {
      state.uiAccum = (state.uiAccum || 0) + dt;
      if (state.uiAccum >= 0.1) { state.uiAccum = 0; updateVitalsUI(); }
      if (state.player.reloading && now >= state.player.reloadEnd) completeReload();
    }
    if (state.match) {
      const freezeLeft = state.match.freezeUntil && now < state.match.freezeUntil ? Math.ceil((state.match.freezeUntil - now) / 1000) : 0;
      const c4Active = state.config.mode === 'bomb' && state.bomb && state.bomb.planted;
      if (freezeLeft > 0) dom.clock.textContent = '准备 ' + freezeLeft + 's';
      else dom.clock.textContent = c4Active ? Math.ceil(Math.max(0, state.bomb.timer)) + 's' : formatTime(state.match.timeLeft);
      dom.pauseTime.textContent = formatTime(state.match.timeLeft);
    }
  }

  function updateFps(dt) {
    state.fpsTime += dt;
    state.fpsFrames++;
    if (state.fpsTime >= 0.5) {
      state.fps = Math.round(state.fpsFrames / state.fpsTime);
      state.fpsTime = 0; state.fpsFrames = 0;
      dom.menuFps.textContent = state.fps + ' FPS';
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, state.clock.getDelta());
    const now = performance.now();
    state.elapsed += dt;
    updateFps(dt);
    if (state.phase === 'menu') {
      state.previewAngle += dt * 0.08;
      const radius = 61;
      state.camera.position.set(Math.sin(state.previewAngle) * radius, 19 + Math.sin(state.previewAngle * 0.7) * 3, Math.cos(state.previewAngle) * radius);
      state.camera.lookAt(0, 2.5, 0);
      state.camera.fov += (58 - state.camera.fov) * Math.min(1, dt * 2);
      state.camera.updateProjectionMatrix();
    } else if (state.phase === 'running') {
      updateMatch(dt, now);
      updateEffectsAndFeedback(dt, now);
      state.radarAccum = (state.radarAccum || 0) + dt;
      if (state.radarAccum >= 0.08) { state.radarAccum = 0; drawRadar(); }
    } else if (state.phase === 'intermission') {
      updateMatch(dt, now);
      updateEffectsAndFeedback(dt, now);
      state.radarAccum = (state.radarAccum || 0) + dt;
      if (state.radarAccum >= 0.08) { state.radarAccum = 0; drawRadar(); }
    } else {
      updateEffects(dt);
    }
    state.renderer.render(state.scene, state.camera);
  }

  function handleKeyDown(event) {
    if (['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','ControlLeft','ControlRight','Space'].includes(event.code)) event.preventDefault();
    input.keys[event.code] = true;
    if (state.phase === 'backpack') {
      if (event.code === 'KeyB' || event.code === 'Escape') { closeBackpack(true); return; }
      const packMatch = /^Digit([1-7])$/.exec(event.code);
      if (packMatch) selectBackpack(Number(packMatch[1]) - 1);
      return;
    }
    if (state.phase === 'menu' && event.code === 'Enter') { startMatch({ mode: document.querySelector('#modeOptions .active').dataset.mode, map: document.querySelector('#mapOptions .active').dataset.map, difficulty: dom.difficulty.value, quality: dom.quality.value, requestLock: true }); return; }
    if (event.repeat && ['Digit1','Digit2','Digit3','Digit5','KeyR','KeyG','KeyP','KeyB','KeyQ'].includes(event.code)) return;
    if (event.code === 'KeyB') { openBackpack(); return; }
    if (event.code === 'KeyQ') { quickSwitchWeapon(); return; }
    if (event.code === 'KeyR') reloadWeapon();
    if (event.code === 'KeyG') {
      if (state.config.mode === 'bomb' && state.player.currentWeapon === 3 && state.player.hasC4) dropC4();
      else throwGrenade();
    }
    if (event.code === 'Digit1') selectWeaponSlot(0);
    if (event.code === 'Digit2') selectWeaponSlot(1);
    if (event.code === 'Digit3') selectWeaponSlot(2);
    if (event.code === 'Digit5') selectWeaponSlot(3);
    if (event.code === 'KeyP') {
      if (state.phase === 'running') pauseGame('key');
      else if (state.phase === 'paused') resumeGame();
    }
  }

  function handleKeyUp(event) {
    input.keys[event.code] = false;
    if (event.code === 'Space') input.keys.Space = false;
  }

  function requestPointerLockSafe() {
    try {
      const request = dom.canvas.requestPointerLock();
      if (request && typeof request.catch === 'function') request.catch(() => {});
    } catch (_) {
      if (state.phase === 'running') showToast('点击画面锁定鼠标');
    }
  }

  function setupEvents() {
    addEventListener('resize', onResize);
    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);
    addEventListener('blur', () => { input.keys = Object.create(null); input.fireHeld = false; input.ads = false; });
    document.addEventListener('mousemove', (event) => {
      if (!state.pointerLocked || state.phase !== 'running') return;
      const sensitivity = parseFloat(dom.sensitivity.value) * 0.00062;
      input.yaw -= event.movementX * sensitivity;
      input.pitch -= event.movementY * sensitivity;
      input.pitch = Math.max(-1.42, Math.min(1.42, input.pitch));
    });
    document.addEventListener('pointerlockchange', () => {
      state.pointerLocked = document.pointerLockElement === dom.canvas;
      if (!state.pointerLocked && state.phase === 'running' && !state.suppressPointerPause) pauseGame('pointer');
    });
    dom.canvas.addEventListener('mousedown', (event) => {
      if (state.phase !== 'running') return;
      if (event.button === 0) { input.fireHeld = true; input.firePressed = true; }
      if (event.button === 2) input.ads = !input.ads;
    });
    addEventListener('mouseup', (event) => {
      if (event.button === 0) { input.fireHeld = false; input.firePressed = false; }
    });
    dom.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    dom.canvas.addEventListener('wheel', (event) => {
      if (state.phase !== 'running') return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      selectWeaponSlot((state.player.currentWeapon + direction + 3) % 3);
    }, { passive: false });
    dom.canvas.addEventListener('click', () => {
      if (state.phase === 'running' && !input.isTouch && !document.pointerLockElement) requestPointerLockSafe();
    });

    document.querySelectorAll('#modeOptions .choice-card').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('#modeOptions .choice-card').forEach((item) => item.classList.remove('active'));
      button.classList.add('active'); state.audio.resume();
    }));
    document.querySelectorAll('#mapOptions .map-card').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('#mapOptions .map-card').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const mapId = button.dataset.map;
      createPlayer(); buildMap(mapId); state.previewAngle = mapId === 'harbor' ? 0 : mapId === 'foundry' ? 2.1 : 4.2;
    }));
    dom.weaponRail.addEventListener('click', (event) => {
      const button = event.target.closest('.weapon-slot');
      if (button) switchWeapon(Number(button.dataset.slot));
    });
    dom.backpackGrid.addEventListener('click', (event) => {
      const card = event.target.closest('.backpack-card');
      if (card) selectBackpack(Number(card.dataset.backpack));
    });
    dom.closeBackpackButton.addEventListener('click', () => closeBackpack(true));
    $('startButton').addEventListener('click', () => startMatch({
      mode: document.querySelector('#modeOptions .active').dataset.mode,
      map: document.querySelector('#mapOptions .active').dataset.map,
      difficulty: dom.difficulty.value, quality: dom.quality.value, requestLock: !input.isTouch
    }));
    $('resumeButton').addEventListener('click', resumeGame);
    $('restartButton').addEventListener('click', () => startMatch(Object.assign({}, state.config, { requestLock: !input.isTouch })));
    $('menuButton').addEventListener('click', returnToMenu);
    $('againButton').addEventListener('click', () => startMatch(Object.assign({}, state.config, { requestLock: !input.isTouch })));
    $('resultMenuButton').addEventListener('click', returnToMenu);
    dom.sensitivity.addEventListener('input', () => { dom.sensValue.textContent = Number(dom.sensitivity.value).toFixed(1); });
    dom.quality.addEventListener('change', () => { state.config.quality = dom.quality.value; if (state.phase === 'menu') qualityChanged(); });
    setupTouchControls();
  }

  function setupTouchControls() {
    if (!input.isTouch) return;
    let movePointer = null;
    function movePad(event) {
      const rect = dom.movePad.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;
      const max = rect.width * 0.34;
      const length = Math.hypot(dx, dy) || 1;
      if (length > max) { dx = dx / length * max; dy = dy / length * max; }
      input.touchMoveX = dx / max;
      input.touchMoveY = dy / max;
      dom.moveKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
    }
    dom.movePad.addEventListener('pointerdown', (event) => { movePointer = event.pointerId; dom.movePad.setPointerCapture(event.pointerId); movePad(event); });
    dom.movePad.addEventListener('pointermove', (event) => { if (event.pointerId === movePointer) movePad(event); });
    dom.movePad.addEventListener('pointerup', (event) => { if (event.pointerId !== movePointer) return; movePointer = null; input.touchMoveX = input.touchMoveY = 0; dom.moveKnob.style.transform = 'translate(-50%,-50%)'; });
    dom.movePad.addEventListener('pointercancel', () => { movePointer = null; input.touchMoveX = input.touchMoveY = 0; dom.moveKnob.style.transform = 'translate(-50%,-50%)'; });
    dom.touchFire.addEventListener('pointerdown', (event) => { event.preventDefault(); input.fireHeld = true; input.firePressed = true; });
    dom.touchFire.addEventListener('pointerup', () => { input.fireHeld = false; input.firePressed = false; });
    dom.touchFire.addEventListener('pointercancel', () => { input.fireHeld = false; input.firePressed = false; });
    dom.touchJump.addEventListener('pointerdown', (event) => { event.preventDefault(); input.keys.Space = true; setTimeout(() => { input.keys.Space = false; }, 90); });
    dom.touchCrouch.addEventListener('pointerdown', (event) => { event.preventDefault(); input.touchCrouch = !input.touchCrouch; dom.touchCrouch.style.borderColor = input.touchCrouch ? '#70e6df' : ''; });
    dom.touchBackpack.addEventListener('pointerdown', (event) => { event.preventDefault(); openBackpack(); });
    dom.touchReload.addEventListener('pointerdown', (event) => { event.preventDefault(); reloadWeapon(); });
    let lookPointer = null;
    let lookX = 0; let lookY = 0;
    dom.canvas.addEventListener('pointerdown', (event) => { if (!input.isTouch || state.phase !== 'running') return; lookPointer = event.pointerId; lookX = event.clientX; lookY = event.clientY; dom.canvas.setPointerCapture(event.pointerId); });
    dom.canvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== lookPointer || state.phase !== 'running') return;
      input.yaw -= (event.clientX - lookX) * 0.006;
      input.pitch -= (event.clientY - lookY) * 0.005;
      input.pitch = Math.max(-1.42, Math.min(1.42, input.pitch));
      lookX = event.clientX; lookY = event.clientY;
    });
    dom.canvas.addEventListener('pointerup', (event) => { if (event.pointerId === lookPointer) lookPointer = null; });
  }

  function setCrouch(value) {
    input.touchCrouch = !!value;
    if (state.player) state.player.crouching = !!value;
    return getDebugState();
  }

  function getFirstEnemyHp() {
    const enemy = state.enemies.find((item) => !item.dead);
    return enemy ? enemy.hp : null;
  }

  function aimAtFirstEnemy() {
    const enemy = state.enemies.find((item) => !item.dead);
    if (!enemy || !state.player) return getDebugState();
    const eye = getEyePosition(new THREE.Vector3());
    const target = enemy.root.position.clone().add(new THREE.Vector3(0, 1.08, 0));
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    input.yaw = Math.atan2(-dx, -dz);
    input.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    return getDebugState();
  }

  function placeEnemyInView() {
    const enemy = state.enemies.find((item) => !item.dead);
    if (!enemy || !state.player) return getDebugState();
    const direction = new THREE.Vector3(-Math.sin(input.yaw), 0, -Math.cos(input.yaw)).normalize();
    enemy.root.position.copy(state.player.pos).addScaledVector(direction, 6.5);
    enemy.root.position.y = 0;
    enemy.root.rotation.set(0, Math.PI, 0);
    enemy.dead = false;
    enemy.hp = enemy.maxHp;
    input.pitch = -0.02;
    enemy.root.updateMatrixWorld(true);
    return getDebugState();
  }

  function getDebugState() {
    return {
      phase: state.phase, map: state.config.map, mode: state.config.mode, fps: Math.round(state.fps),
      player: state.player ? { x: state.player.pos.x, y: state.player.pos.y, z: state.player.pos.z, hp: state.player.hp, armor: state.player.armor, kills: state.player.kills, deaths: state.player.deaths, weapon: currentWeaponSpec().name, weaponModel: currentWeaponSpec().model, ammo: currentWeaponState().ammo, infiniteAmmo: !!currentWeaponState().infinite, slot: state.player.currentWeapon + 1, backpack: state.player.loadout + 1 } : null,
      ads: input.ads,
      scoped: !!currentWeaponSpec().scope && input.ads,
      scores: state.match ? { blue: state.match.blueScore, red: state.match.redScore, time: state.match.timeLeft, round: state.match.round } : null,
      wave: state.match ? state.match.wave : 0,
      waveTotal: state.match ? state.match.waveTotal : 0,
      waveState: state.match ? state.match.waveState : '',
      allies: state.allies ? state.allies.filter((ally) => !ally.dead).length : 0,
      allyPositions: state.allies.filter((ally) => !ally.dead).map((ally) => ({ x: Math.round(ally.root.position.x), z: Math.round(ally.root.position.z), site: ally.site })),
      guardSites: state.enemies.filter((enemy) => !enemy.dead).map((enemy) => enemy.guardSite),
      enemyWeapons: state.enemies.filter((enemy) => !enemy.dead).map((enemy) => enemy.weapon || null),
      allyWeapons: state.allies.filter((ally) => !ally.dead).map((ally) => ally.weapon || null),
      playerC4: !!(state.player && state.player.hasC4),
      allyC4: state.allies.filter((ally) => ally.hasC4 && !ally.dead).length,
      bomb: state.bomb ? { planted: state.bomb.planted, site: state.bomb.site, timer: Math.round(state.bomb.timer), defuse: Math.round(state.bomb.defuseProgress * 10) / 10, x: state.bomb.position ? Math.round(state.bomb.position.x) : null, z: state.bomb.position ? Math.round(state.bomb.position.z) : null } : null,
      enemyPositions: state.enemies.filter((enemy) => !enemy.dead).map((enemy) => ({ x: Math.round(enemy.root.position.x), z: Math.round(enemy.root.position.z), distance: Math.round(enemy.root.position.distanceTo(state.player.pos)) })),
      enemies: state.enemies.filter((enemy) => !enemy.dead).length,
      colliders: state.colliders.length,
      handGroups: state.weaponHolder.children.filter((child) => child.userData.firstPersonHands).length,
      soldierReady: state.soldierAsset.ready,
      soldierError: state.soldierAsset.error,
      soldierType: state.enemies[0] && state.enemies[0].parts.is3D ? 'glb' : 'primitive',
      pointerLocked: state.pointerLocked
    };
  }

  function boot() {
    initEngine();
    createPlayer();
    if (state.renderer.capabilities.isWebGL2) state.renderer.shadowMap.enabled = true;
    buildMap('harbor');
    loadSoldierAsset();
    state.weaponHolder.visible = false;
    setupEvents();
    state.previewAngle = 0;
    window.ZeroHour = {
      getState: getDebugState, start: startMatch, pause: pauseGame, resume: resumeGame, fire: fireWeapon,
      reload: reloadWeapon, switchWeapon, selectWeaponSlot, quickSwitchWeapon, openBackpack, closeBackpack, selectBackpack, throwGrenade, respawn: respawnPlayer, returnToMenu,
      placeEnemyInView, aimAtFirstEnemy, setCrouch, getFirstEnemyHp,
      debugTeleport: (x, z) => { state.player.pos.set(x, 0, z); state.player.velocity.set(0, 0, 0); state.player.verticalVelocity = 0; },
      debugLook: (yaw, pitch) => { input.yaw = yaw; input.pitch = pitch; },
      debugGiveC4: () => {
        if (state.config.mode !== 'bomb' || !state.bomb || state.bomb.planted) return false;
        state.allies.forEach((ally) => { ally.hasC4 = false; });
        state.player.hasC4 = true;
        updateHud();
        return true;
      },
      debugRayInfo: () => {
        state.scene.updateMatrixWorld(true);
        const origin = getEyePosition(new THREE.Vector3());
        const direction = getAimDirection();
        state.raycaster.set(origin, direction);
        state.raycaster.far = 95;
        const targets = state.worldMeshes.concat(state.enemies.filter((enemy) => !enemy.dead).map((enemy) => enemy.root));
        const hits = state.raycaster.intersectObjects(targets, true);
        return {
          origin: [Math.round(origin.x * 10) / 10, Math.round(origin.y * 10) / 10, Math.round(origin.z * 10) / 10],
          dir: [Math.round(direction.x * 100) / 100, Math.round(direction.y * 100) / 100, Math.round(direction.z * 100) / 100],
          directHit: (() => {
            const first = state.enemies.find((enemy) => !enemy.dead);
            if (!first) return null;
            const probe = state.raycaster.intersectObject(first.root, true);
            return probe.length ? Math.round(probe[0].distance * 10) / 10 : 0;
          })(),
          firstChildTypes: (() => {
            const first = state.enemies.find((enemy) => !enemy.dead);
            if (!first) return [];
            const types = [];
            first.root.traverse((node) => { if (types.length < 8) types.push(node.type + (node.userData.zone ? ':' + node.userData.zone : '')); });
            return types;
          })(),
          camRot: [Math.round(state.camera.rotation.x * 100) / 100, Math.round(state.camera.rotation.y * 100) / 100],
          enemies: state.enemies.filter((enemy) => !enemy.dead).map((enemy) => ({ x: Math.round(enemy.root.position.x), y: Math.round(enemy.root.position.y * 10) / 10, z: Math.round(enemy.root.position.z), visible: enemy.root.visible })),
          hits: hits.slice(0, 3).map((hit) => ({ d: Math.round(hit.distance * 10) / 10, enemyId: hit.object.userData.enemyId || null, zone: hit.object.userData.zone || null }))
        };
      },
      debugAimAndFire: () => {
        state.enemies.forEach((enemy) => { if (!enemy.dead) enemy.root.updateMatrixWorld(true); });
        aimAtFirstEnemy();
        state.camera.rotation.set(input.pitch + (state.player ? state.player.recoil : 0), input.yaw, 0, 'YXZ');
        state.camera.updateMatrixWorld(true);
        fireWeapon();
      },
      debugDropC4: () => {
        if (state.config.mode !== 'bomb' || !state.bomb || state.bomb.planted || !state.player.hasC4) return false;
        dropC4();
        return true;
      },
      debugSpeed: () => (state.player ? Math.round(Math.hypot(state.player.velocity.x, state.player.velocity.z) * 100) / 100 : 0),
      debugTryMove: (dx, dz) => {
        const beforeX = state.player.pos.x;
        const beforeZ = state.player.pos.z;
        moveWithCollision(state.player.pos, dx, dz, state.player.radius);
        return { moved: Math.round(Math.hypot(state.player.pos.x - beforeX, state.player.pos.z - beforeZ) * 100) / 100 };
      },
      debugForcePlant: () => {
        if (state.config.mode !== 'bomb' || !state.bomb || state.bomb.planted) return false;
        const site = currentBombSite();
        if (!site) return false;
        plantBomb(site);
        return true;
      },
      debugPlaceEnemy: (x, z) => {
        const enemy = state.enemies.find((item) => !item.dead);
        if (!enemy) return false;
        enemy.root.position.set(x, 0, z);
        enemy.root.rotation.set(0, Math.PI, 0);
        enemy.hp = enemy.maxHp;
        enemy.root.updateMatrixWorld(true);
        return true;
      },
      debugCheckShotBlocked: () => {
        const enemy = state.enemies.find((item) => !item.dead);
        if (!enemy) return null;
        enemy.root.updateMatrixWorld(true);
        const start = new THREE.Vector3(); enemy.parts.flash.getWorldPosition(start);
        const target = getEyePosition(new THREE.Vector3());
        return !!firstBlockingPoint(start, target);
      }, damageEnemy: (amount) => { const enemy = state.enemies.find((item) => !item.dead); if (enemy) damageEnemy(enemy, amount || 999, false, 'DEBUG'); }
    };
    animate();
  }

  boot();
})();
