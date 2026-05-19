const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const battleText = document.querySelector("#battleText");
const lootText = document.querySelector("#lootText");
const wallText = document.querySelector("#wallText");
const battleButton = document.querySelector("#battleButton");
const heroButtons = document.querySelector("#heroButtons");
const wallButtons = document.querySelector("#wallButtons");
const upgradePanel = document.querySelector("#upgradePanel");
const upgradeTitle = document.querySelector("#upgradeTitle");
const upgradeChoices = document.querySelector("#upgradeChoices");

const heroConfig = {
  fire: {
    label: "Fire",
    damageType: "fire",
    color: "#f95738",
    cooldown: 0.82,
    range: 430,
    damage: 14,
    dotDamage: 18,
    dotTime: 2.5,
    projectileSpeed: 520
  },
  ice: {
    label: "Ice",
    damageType: "ice",
    color: "#70d6ff",
    cooldown: 1.05,
    range: 390,
    damage: 9,
    freezeTime: 0.6,
    slowTime: 1.4,
    projectileSpeed: 470
  },
  lightning: {
    label: "Storm",
    damageType: "storm",
    color: "#ffd166",
    cooldown: 0.9,
    range: 420,
    damage: 12,
    projectileSpeed: 650
  },
  archer: {
    label: "Archer",
    damageType: "physical",
    color: "#d9c7a3",
    cooldown: 0.82,
    range: 410,
    damage: 8,
    projectileSpeed: 620
  },
  poison: {
    label: "Poison",
    damageType: "poison",
    color: "#8bd450",
    cooldown: 0.98,
    range: 400,
    damage: 6,
    poisonDamage: 24,
    poisonTime: 4,
    projectileSpeed: 470
  },
  earth: {
    label: "Earth",
    damageType: "earth",
    color: "#b58b5b",
    cooldown: 1.2,
    range: 360,
    damage: 16,
    stunTime: 0.45,
    armourBreakTime: 2.8,
    projectileSpeed: 430
  }
};

const partyRosterKinds = ["fire", "ice", "lightning", "poison", "earth"];
const trainableHeroKinds = partyRosterKinds;

const damageTypeRoster = {
  physical: "Reliable neutral damage. Main Hero Archer uses this for now.",
  fire: "Burn damage over time and future spread effects.",
  ice: "Freeze, slow, and pressure control.",
  storm: "Lightning burst, chains, and pierce.",
  poison: "Attrition, weakening, and damage over time.",
  holy: "Future defensive support, cleansing, shielding, and anti-corruption damage.",
  shadow: "Future curses, drain, fear, ramping damage, and debuffs.",
  arcane: "Future raw magic, resistance piercing, unstable blasts, and random effects.",
  earth: "Armour break, stun, impact, barriers, and terrain slow.",
  wind: "Future knockback, speed manipulation, multi-hit slicing, and pushback.",
  blood: "Future bleed, lifesteal, executes, and wounded-enemy damage."
};

const enemyConfig = {
  grunt: {
    label: "Grunt",
    marker: "G",
    hp: 36,
    speed: 42,
    reward: 1,
    damage: 1,
    radius: 10,
    color: "#ef476f",
    pattern: "straight",
    immune: []
  },
  zigzag: {
    label: "Skitter",
    marker: "Z",
    hp: 30,
    speed: 36,
    reward: 1,
    damage: 1,
    radius: 9,
    color: "#f9c74f",
    pattern: "zigzag",
    immune: []
  },
  ashguard: {
    label: "Ashguard",
    marker: "F",
    hp: 58,
    speed: 34,
    reward: 2,
    damage: 1,
    radius: 12,
    color: "#b86bff",
    armor: 8,
    pattern: "straight",
    immune: ["fire"]
  },
  frostguard: {
    label: "Frostguard",
    marker: "I",
    hp: 62,
    speed: 32,
    reward: 2,
    damage: 1,
    radius: 12,
    color: "#5ec8e5",
    pattern: "straight",
    immune: ["ice"]
  },
  archer: {
    label: "Archer",
    marker: "R",
    hp: 44,
    speed: 35,
    reward: 2,
    damage: 1,
    radius: 10,
    color: "#7dd87d",
    pattern: "straight",
    immune: [],
    ranged: true
  },
  bouncer: {
    label: "Brawler",
    marker: "B",
    hp: 92,
    speed: 29,
    reward: 3,
    damage: 2,
    radius: 14,
    color: "#ff8fab",
    armor: 12,
    pattern: "straight",
    immune: ["lightning"],
    bounce: true
  }
};

const tempUpgradePool = [
  {
    tag: "Fire",
    title: "Fire Spread",
    summary: "Burn jumps to 1 nearby enemy",
    text: "Fire burn spreads to 1 nearby enemy for 65% burn damage.",
    apply: () => state.temp.fireSpread += 1
  },
  {
    tag: "Fire",
    title: "Long Burn",
    summary: "+50% burn duration",
    text: "Fire damage over time lasts 50% longer this battle.",
    apply: () => state.temp.fireDotTime *= 1.5
  },
  {
    tag: "Ice",
    title: "Deep Freeze",
    summary: "+50% freeze and slow duration",
    text: "Ice freeze and slow effects last 50% longer this battle.",
    apply: () => state.temp.iceDuration *= 1.5
  },
  {
    tag: "Ice",
    title: "Ice Splash",
    summary: "Hits 2 nearby enemies",
    text: "Ice also hits up to 2 nearby enemies for 55% damage and applies slow.",
    apply: () => state.temp.iceSplash += 2
  },
  {
    tag: "Storm",
    title: "Storm Chain",
    summary: "Bounces to 2 enemies",
    text: "Lightning jumps to 2 nearby enemies for 72% damage.",
    apply: () => state.temp.lightningBounces += 2
  },
  {
    tag: "Storm",
    title: "Storm Pierce",
    summary: "Hits a lane line",
    text: "Lightning hits enemies in the same lane for 90% damage.",
    apply: () => state.temp.lightningPierce += 1
  },
  {
    tag: "All",
    title: "Battle Rhythm",
    summary: "+18% cast speed",
    text: "All heroes attack 18% faster this battle.",
    apply: () => state.temp.attackSpeed *= 1.18
  },
  {
    tag: "Archer",
    title: "Sharpened Arrows",
    summary: "+20% Archer damage",
    text: "Archer arrows deal 20% more physical damage this battle.",
    apply: () => state.temp.archerDamage *= 1.2
  },
  {
    tag: "Archer",
    title: "Quick Draw",
    summary: "+18% Archer attack speed",
    text: "Archer shoots 18% faster this battle.",
    apply: () => state.temp.archerAttackSpeed *= 1.18
  },
  {
    tag: "Wall",
    title: "Wall Patch",
    summary: "+4 wall strength now",
    text: "Restore 4 wall strength immediately.",
    requiresWallDamage: true,
    apply: () => state.wall = Math.min(state.maxWall, state.wall + 4)
  },
  {
    tag: "Combo",
    title: "Toxic Embers",
    summary: "Burn boosts Poison",
    text: "Poison deals 35% more damage to burning enemies.",
    requiresParty: ["fire", "poison"],
    apply: () => state.temp.poisonVsBurning *= 1.35
  },
  {
    tag: "Combo",
    title: "Contagion Spark",
    summary: "Fire spreads Poison",
    text: "Fire hits on poisoned enemies spread Poison to 1 nearby enemy.",
    requiresParty: ["fire", "poison"],
    apply: () => state.temp.fireSpreadsPoison += 1
  },
  {
    tag: "Combo",
    title: "Shatterstone",
    summary: "Earth extends frozen stuns",
    text: "Earth stuns frozen or slowed enemies 60% longer.",
    requiresParty: ["ice", "earth"],
    apply: () => state.temp.earthVsControlled *= 1.6
  },
  {
    tag: "Combo",
    title: "Marked Target",
    summary: "Archer punishes slow",
    text: "Archer arrows deal 25% more damage to slowed enemies.",
    requiresParty: ["ice"],
    apply: () => state.temp.archerVsSlowed *= 1.25
  },
  {
    tag: "Combo",
    title: "Grounded Arrows",
    summary: "Earth helps Archer",
    text: "Archer deals 30% more damage to armour-broken enemies.",
    requiresParty: ["earth"],
    apply: () => state.temp.archerVsBroken *= 1.3
  },
  {
    tag: "Combo",
    title: "Conductive Venom",
    summary: "Storm chains farther",
    text: "Storm chain range is 35% longer when the first target is poisoned.",
    requiresParty: ["lightning", "poison"],
    apply: () => state.temp.stormPoisonRange *= 1.35
  }
];

const state = {
  battle: 1,
  maxBattles: 3,
  wave: 0,
  previewWave: 0,
  wavesPerBattle: 5,
  gameSpeed: 1.18,
  loot: 0,
  securedLoot: 0,
  enemiesKilled: 0,
  wallHits: 0,
  rangedHits: 0,
  brawlerHits: 0,
  lastBattleSummary: "",
  wall: 30,
  maxWall: 30,
  battleActive: false,
  waveActive: false,
  timeUntilNextSpawn: 0,
  spawnCount: 0,
  enemiesToSpawn: 0,
  enemies: [],
  projectiles: [],
  beams: [],
  hits: [],
  heroes: [],
  mainHeroKind: "archer",
  partyMemberSlots: ["fire", "ice", "lightning", null],
  heroLevels: {
    fire: 1,
    ice: 1,
    lightning: 1,
    archer: 1,
    poison: 1,
    earth: 1
  },
  wallLevels: {
    fortify: 0,
    spikes: 0
  },
  temp: freshTempUpgrades(),
  lastTime: performance.now(),
  gameTime: performance.now(),
  width: 390,
  height: 620,
  wallY: 535
};

function freshTempUpgrades() {
  return {
    fireSpread: 0,
    fireDotTime: 1,
    iceDuration: 1,
    iceSplash: 0,
    lightningBounces: 0,
    lightningPierce: 0,
    attackSpeed: 1,
    archerDamage: 1,
    archerAttackSpeed: 1,
    poisonVsBurning: 1,
    fireSpreadsPoison: 0,
    earthVsControlled: 1,
    archerVsSlowed: 1,
    archerVsBroken: 1,
    stormPoisonRange: 1
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  state.width = rect.width;
  state.height = rect.height;
  state.wallY = rect.height - 86;
  layoutHeroes();
}

function layoutHeroes() {
  const y = state.wallY + 42;
  const xPositions = [0.1, 0.3, 0.5, 0.7, 0.9].map((x) => x * state.width);
  const kinds = [
    state.partyMemberSlots[0],
    state.partyMemberSlots[1],
    state.mainHeroKind,
    state.partyMemberSlots[2],
    state.partyMemberSlots[3]
  ];

  state.heroes = kinds.map((kind, index) => ({
    kind,
    role: index === 2 ? "main" : "party",
    slotIndex: index,
    x: xPositions[index],
    y,
    cooldownLeft: kind ? index * 0.1 : 0,
    inactive: !kind
  }));
}

function startBattle() {
  if (state.battleActive || !upgradePanel.classList.contains("hidden")) return;
  if (state.battle > state.maxBattles) return;

  showPartySelection();
}

function showPartySelection() {
  upgradeTitle.textContent = "Choose party";
  upgradeChoices.innerHTML = "";

  const selected = new Set(selectedPartyKinds());
  const picker = document.createElement("div");
  picker.className = "party-picker";
  const pickButtons = [];

  for (const kind of partyRosterKinds) {
    const config = heroConfig[kind];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "party-pick";
    button.dataset.hero = kind;
    setChoiceContent(button, config.label, [damageTypeRoster[config.damageType], selected.has(kind) ? "Selected" : "Tap to add"]);
    button.addEventListener("click", () => {
      if (selected.has(kind)) {
        selected.delete(kind);
      } else if (selected.size < 4) {
        selected.add(kind);
      }

      refreshPartyPickerButtons(pickButtons, selected);
    });
    picker.append(button);
    pickButtons.push(button);
  }

  upgradeChoices.append(picker);
  refreshPartyPickerButtons(pickButtons, selected);

  addChoice("Preview Wave 1", ["Main Hero: Archer stays in the centre.", "Choose up to 4 party members, then preview the first wave."], () => {
    state.partyMemberSlots = [...selected].slice(0, 4);
    while (state.partyMemberSlots.length < 4) {
      state.partyMemberSlots.push(null);
    }
    layoutHeroes();
    showWavePreview(1);
  });

  upgradePanel.classList.remove("hidden");
  updateHud();
}

function refreshPartyPickerButtons(buttons, selected) {
  for (const button of buttons) {
    const kind = button.dataset.hero;
    const config = heroConfig[kind];
    const isSelected = selected.has(kind);
    button.classList.toggle("selected", isSelected);
    button.disabled = !isSelected && selected.size >= 4;
    setChoiceContent(button, config.label, [
      damageTypeRoster[config.damageType],
      isSelected ? "Selected" : button.disabled ? "Party full" : "Tap to add"
    ]);
  }
}

function selectedPartyKinds() {
  return state.partyMemberSlots.filter(Boolean);
}

function prepareBattleRun() {
  recalculateWallStats();
  state.battleActive = true;
  state.wave = 0;
  state.previewWave = 0;
  state.securedLoot = 0;
  state.enemiesKilled = 0;
  state.wallHits = 0;
  state.rangedHits = 0;
  state.brawlerHits = 0;
  state.lastBattleSummary = "";
  state.wall = state.maxWall;
  state.temp = freshTempUpgrades();
  state.enemies = [];
  state.projectiles = [];
  state.beams = [];
  state.hits = [];
}

function beginWave(waveNumber) {
  if (!state.battleActive) {
    prepareBattleRun();
  }

  state.previewWave = 0;
  state.wave = waveNumber;
  state.waveActive = true;
  state.spawnCount = 0;
  state.enemiesToSpawn = enemyCountForWave(state.wave, state.battle);
  state.timeUntilNextSpawn = 0;
  battleButton.disabled = true;
  battleButton.textContent = `Wave ${state.wave}/${state.wavesPerBattle}`;
  updateHud();
}

function chooseEnemyKind(wave, battle, spawnIndex) {
  const roll = spawnIndex + wave * 3 + battle;
  let kind = "grunt";

  if (wave >= 2 && roll % 4 === 0) kind = "zigzag";
  if (wave >= 3 && roll % 6 === 0) kind = "archer";
  if (wave >= 3 && roll % 8 === 0) kind = "ashguard";
  if (wave >= 4 && roll % 9 === 0) kind = "frostguard";
  if (wave >= 5 && roll % 10 === 0) kind = "bouncer";

  return kind;
}

function enemyCountForWave(wave, battle) {
  return 6 + wave * 2 + battle;
}

function spawnEnemy() {
  const roll = state.spawnCount + state.wave * 3 + state.battle;
  const kind = chooseEnemyKind(state.wave, state.battle, state.spawnCount);

  const base = enemyConfig[kind];
  const laneCount = 5;
  const lane = roll % laneCount;
  const laneGap = state.width / (laneCount + 1);
  const laneX = laneGap * (lane + 1);
  const scale = 1 + (state.battle - 1) * 0.14 + (state.wave - 1) * 0.08;

  state.enemies.push({
    kind,
    label: base.label,
    marker: base.marker,
    x: laneX,
    laneX,
    y: -24,
    hp: base.hp * scale,
    maxHp: base.hp * scale,
    speed: base.speed * (1 + state.battle * 0.025),
    reward: base.reward,
    damage: base.damage,
    radius: base.radius,
    color: base.color,
    armor: base.armor || 0,
    maxArmor: base.armor || 0,
    pattern: base.pattern,
    immune: enemyImmunities(base),
    ranged: Boolean(base.ranged),
    bounce: Boolean(base.bounce),
    zigzagPhase: "straight",
    zigzagTimer: 0,
    zigzagSide: roll % 2 === 0 ? 1 : -1,
    zigzagOffset: 0,
    attackCooldown: 1.4 + Math.random() * 0.6,
    frozenUntil: 0,
    slowedUntil: 0,
    slowAmount: 1,
    burnUntil: 0,
    burnDps: 0,
    poisonUntil: 0,
    poisonDps: 0,
    stunnedUntil: 0,
    armourBrokenUntil: 0,
    bounceCooldown: 0
  });
}

function updateGame(dt, now) {
  if (state.waveActive) {
    state.timeUntilNextSpawn -= dt;
    if (state.spawnCount < state.enemiesToSpawn && state.timeUntilNextSpawn <= 0) {
      spawnEnemy();
      state.spawnCount += 1;
      state.timeUntilNextSpawn = Math.max(0.35, 0.9 - state.wave * 0.04);
    }
  }

  updateEnemies(dt, now);
  updateHeroes(dt, now);
  updateProjectiles(dt, now);
  updateEffects(dt);

  if (state.waveActive && state.spawnCount >= state.enemiesToSpawn && state.enemies.length === 0) {
    finishWave();
  }
}

function updateEnemies(dt, now) {
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];

    if ((enemy.burnUntil ?? 0) > now && !hasImmunity(enemy, "fire")) {
      enemy.hp -= (enemy.burnDps ?? 0) * dt;
    }

    if ((enemy.poisonUntil ?? 0) > now) {
      const burningMultiplier = (enemy.burnUntil ?? 0) > now ? state.temp.poisonVsBurning : 1;
      enemy.hp -= (enemy.poisonDps ?? 0) * burningMultiplier * dt;
    }

    if (enemy.hp <= 0) {
      killEnemy(i, enemy);
      continue;
    }

    enemy.attackCooldown -= dt;
    enemy.bounceCooldown -= dt;

    const frozen = (enemy.frozenUntil ?? 0) > now || (enemy.stunnedUntil ?? 0) > now;
    if (enemy.ranged && enemy.y > state.wallY - 250 && !frozen) {
      if (enemy.attackCooldown <= 0) {
        state.rangedHits += 1;
        damageWall(enemy.damage);
        if (!state.battleActive) return;
        makeHit(enemy.x, enemy.y, "#7dd87d", 22);
        enemy.attackCooldown = 1.8;
      }
      continue;
    }

    if (!frozen) {
      const slow = (enemy.slowedUntil ?? 0) > now ? (enemy.slowAmount ?? 1) : 1;
      enemy.y += enemy.speed * slow * dt;
      if (enemy.pattern === "zigzag") {
        updateZigzagMovement(enemy, dt);
      }
    }

    if (enemy.y >= state.wallY) {
      if (applyWallContact(enemy)) {
        killEnemy(i, enemy);
        continue;
      }

      damageWall(enemy.damage);
      if (!state.battleActive) return;

      if (enemy.bounce && enemy.bounceCooldown <= 0) {
        state.brawlerHits += 1;
        enemy.y = state.wallY - 70;
        enemy.hp -= 8;
        enemy.bounceCooldown = 1.1;
        makeHit(enemy.x, state.wallY, "#ff8fab", 34);
      } else {
        state.enemies.splice(i, 1);
      }
    }
  }
}

function updateZigzagMovement(enemy, dt) {
  const phases = {
    straight: 0.7,
    prep: 0.32,
    weave: 0.82,
    recover: 0.36
  };

  enemy.zigzagTimer += dt;

  if (enemy.zigzagTimer >= phases[enemy.zigzagPhase]) {
    enemy.zigzagTimer = 0;

    if (enemy.zigzagPhase === "straight") {
      enemy.zigzagPhase = "prep";
    } else if (enemy.zigzagPhase === "prep") {
      enemy.zigzagPhase = "weave";
    } else if (enemy.zigzagPhase === "weave") {
      enemy.zigzagPhase = "recover";
    } else {
      enemy.zigzagPhase = "straight";
      enemy.zigzagSide *= -1;
    }
  }

  const progress = Math.min(1, enemy.zigzagTimer / phases[enemy.zigzagPhase]);

  if (enemy.zigzagPhase === "straight") {
    enemy.zigzagOffset *= 0.88;
  }

  if (enemy.zigzagPhase === "prep") {
    enemy.zigzagOffset = enemy.zigzagSide * 10 * progress;
  }

  if (enemy.zigzagPhase === "weave") {
    enemy.zigzagOffset = enemy.zigzagSide * (10 + 30 * smoothStep(progress));
  }

  if (enemy.zigzagPhase === "recover") {
    enemy.zigzagOffset = enemy.zigzagSide * 40 * (1 - smoothStep(progress));
  }

  enemy.x = enemy.laneX + enemy.zigzagOffset;
}

function applyWallContact(enemy) {
  const spikeDamage = wallSpikeDamage();
  if (spikeDamage <= 0 || enemy.ranged) return false;

  enemy.hp -= spikeDamage;
  makeHit(enemy.x, state.wallY, "#c6d1bd", 28);
  return enemy.hp <= 0;
}

function killEnemy(index, enemy) {
  state.securedLoot += enemy.reward;
  state.enemiesKilled += 1;
  state.enemies.splice(index, 1);
  makeHit(enemy.x, enemy.y, enemy.color, 26);
  updateHud();
}

function damageWall(amount) {
  state.wall -= amount;
  state.wallHits += 1;
  makeHit(state.width * 0.5, state.wallY, "#f5f0e6", 42);
  if (state.wall <= 0) {
    endBattle(false);
  }
  updateHud();
}

function updateHeroes(dt, now) {
  if (!state.battleActive) return;

  for (const hero of state.heroes) {
    if (hero.inactive) continue;

    const config = heroConfig[hero.kind];
    hero.cooldownLeft -= dt;

    if (hero.cooldownLeft > 0) continue;

    const target = findTarget(hero, config.range, now);
    if (!target) continue;

    const level = state.heroLevels[hero.kind];
    hero.cooldownLeft = config.cooldown / heroAttackSpeed(hero.kind) / (1 + (level - 1) * 0.06);

    if (hero.kind === "lightning" && state.temp.lightningPierce > 0) {
      castLightningPierce(hero, target, level, now);
      continue;
    }

    state.projectiles.push({
      kind: hero.kind,
      x: hero.x,
      y: hero.y - 10,
      target,
      speed: config.projectileSpeed,
      color: config.color,
      radius: hero.kind === "lightning" || hero.kind === "archer" ? 4 : 5
    });
  }
}

function findTarget(hero, range, now = state.gameTime) {
  if (hero.kind === "earth") {
    const armouredTarget = findArmouredTarget(hero, range, now);
    if (armouredTarget) return armouredTarget;
  }

  let chosen = null;
  let bestY = -Infinity;

  for (const enemy of state.enemies) {
    if (enemy.y > state.wallY + 20) continue;
    const dist = distance(hero, enemy);
    if (dist <= range && enemy.y > bestY) {
      chosen = enemy;
      bestY = enemy.y;
    }
  }

  return chosen;
}

function findArmouredTarget(hero, range, now) {
  let chosen = null;
  let bestDistance = Infinity;

  for (const enemy of state.enemies) {
    if (!hasActiveArmor(enemy, now) || enemy.y > state.wallY + 20) continue;
    const dist = distance(hero, enemy);
    if (dist <= range && dist < bestDistance) {
      chosen = enemy;
      bestDistance = dist;
    }
  }

  return chosen;
}

function updateProjectiles(dt, now) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];

    if (!state.enemies.includes(projectile.target)) {
      state.projectiles.splice(i, 1);
      continue;
    }

    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - projectile.y;
    const length = Math.hypot(dx, dy);
    const travel = projectile.speed * dt;

    if (length <= travel || length <= 3) {
      if (projectileMissedEvasiveTarget(projectile, now)) {
        handleProjectileMiss(projectile, now);
        state.projectiles.splice(i, 1);
        continue;
      }

      applyHeroHit(projectile.kind, projectile.target, now, projectile);
      state.projectiles.splice(i, 1);
      continue;
    }

    projectile.x += (dx / length) * travel;
    projectile.y += (dy / length) * travel;
  }
}

function applyHeroHit(kind, target, now, source) {
  if (!state.enemies.includes(target)) return;

  const config = heroConfig[kind];
  const level = state.heroLevels[kind];
  const damageScale = (1 + (level - 1) * 0.18) * heroDamageMultiplier(kind) * targetDamageMultiplier(kind, target);

  if (!hasImmunity(target, kind)) {
    target.hp -= directDamageAfterArmor(target, config.damage * damageScale, now);
  } else {
    makeHit(target.x, target.y, "#ffffff", 18);
    return;
  }

  if (kind === "fire") {
    target.burnUntil = now + config.dotTime * state.temp.fireDotTime * 1000;
    target.burnDps = (config.dotDamage * damageScale) / config.dotTime;
    spreadFire(target, now, damageScale);
    spreadPoisonFromFire(target, now, damageScale);
  }

  if (kind === "ice") {
    freezeEnemy(target, now);
    splashIce(target, now, damageScale);
  }

  if (kind === "lightning") {
    chainLightning(target, now, damageScale, source);
  }

  if (kind === "poison") {
    poisonEnemy(target, now, damageScale);
  }

  if (kind === "earth") {
    earthImpact(target, now, damageScale);
  }

  makeHit(target.x, target.y, config.color, 20);
}

function projectileMissedEvasiveTarget(projectile, now) {
  const target = projectile.target;
  if (!state.enemies.includes(target)) return false;
  if (target.pattern !== "zigzag" || target.zigzagPhase !== "weave") return false;
  if (!isDirectProjectile(projectile.kind)) return false;

  projectile.evasiveNearMiss = distance(projectile, target) <= target.radius + 18;
  const evadeChance = Math.min(0.55, 0.18 + Math.abs(target.zigzagOffset || 0) / 90);
  return Math.random() < evadeChance;
}

function handleProjectileMiss(projectile, now) {
  const target = projectile.target;
  if (projectile.kind === "fire" && projectile.evasiveNearMiss && state.enemies.includes(target)) {
    applyFireGrazeBurn(target, now);
    makeHit(target.x, target.y, heroConfig.fire.color, 12);
    return;
  }

  makeHit(projectile.x, projectile.y, "#f5f0e6", 10);
}

function isDirectProjectile(kind) {
  return kind === "archer" || kind === "fire" || kind === "ice" || kind === "poison" || kind === "earth";
}

function applyFireGrazeBurn(enemy, now) {
  enemy.burnUntil = now + heroConfig.fire.dotTime * state.temp.fireDotTime * 650;
  enemy.burnDps = heroConfig.fire.dotDamage * 0.3 / heroConfig.fire.dotTime;
}

function directDamageAfterArmor(enemy, amount, now) {
  if (!hasActiveArmor(enemy, now)) return amount;
  return amount * 0.45;
}

function hasActiveArmor(enemy, now = state.gameTime) {
  return (enemy.armor ?? 0) > 0 && (enemy.armourBrokenUntil ?? 0) <= now;
}

function heroAttackSpeed(kind) {
  return state.temp.attackSpeed * (kind === "archer" ? state.temp.archerAttackSpeed : 1);
}

function heroDamageMultiplier(kind) {
  return kind === "archer" ? state.temp.archerDamage : 1;
}

function targetDamageMultiplier(kind, target) {
  let multiplier = 1;

  if (kind === "archer" && (target.slowedUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsSlowed;
  }

  if (kind === "archer" && (target.armourBrokenUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsBroken;
  }

  return multiplier;
}

function spreadFire(origin, now, damageScale) {
  if (state.temp.fireSpread <= 0) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && !hasImmunity(enemy, "fire") && distance(enemy, origin) < 86)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.fireSpread);

  for (const enemy of candidates) {
    enemy.hp -= directDamageAfterArmor(enemy, 4 * damageScale, now);
    enemy.burnUntil = now + heroConfig.fire.dotTime * state.temp.fireDotTime * 900;
    enemy.burnDps = (heroConfig.fire.dotDamage * damageScale * 0.65) / heroConfig.fire.dotTime;
    makeBeam(origin, enemy, heroConfig.fire.color, 0.18, 4);
  }
}

function spreadPoisonFromFire(origin, now, damageScale) {
  if (state.temp.fireSpreadsPoison <= 0 || (origin.poisonUntil ?? 0) <= now) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && distance(enemy, origin) < 86)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.fireSpreadsPoison);

  for (const enemy of candidates) {
    enemy.poisonUntil = now + heroConfig.poison.poisonTime * 800;
    enemy.poisonDps = (heroConfig.poison.poisonDamage * damageScale * 0.45) / heroConfig.poison.poisonTime;
    makeBeam(origin, enemy, heroConfig.poison.color, 0.14, 3);
  }
}

function freezeEnemy(enemy, now) {
  if (hasImmunity(enemy, "ice")) return;
  enemy.frozenUntil = now + heroConfig.ice.freezeTime * state.temp.iceDuration * 1000;
  enemy.slowedUntil = now + heroConfig.ice.slowTime * state.temp.iceDuration * 1000;
  enemy.slowAmount = 0.38;
}

function poisonEnemy(enemy, now, damageScale) {
  enemy.poisonUntil = now + heroConfig.poison.poisonTime * 1000;
  enemy.poisonDps = (heroConfig.poison.poisonDamage * damageScale) / heroConfig.poison.poisonTime;
}

function earthImpact(enemy, now, damageScale) {
  enemy.armor = Math.max(0, (enemy.armor ?? 0) - 8 * damageScale);
  enemy.armourBrokenUntil = now + heroConfig.earth.armourBreakTime * 1000;
  const controlled = (enemy.frozenUntil ?? 0) > now || (enemy.slowedUntil ?? 0) > now;
  const stunMultiplier = controlled ? state.temp.earthVsControlled : 1;
  enemy.stunnedUntil = now + heroConfig.earth.stunTime * stunMultiplier * 700;
}

function splashIce(origin, now, damageScale) {
  if (state.temp.iceSplash <= 0) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && !hasImmunity(enemy, "ice") && distance(enemy, origin) < 72)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.iceSplash);

  for (const enemy of candidates) {
    enemy.hp -= directDamageAfterArmor(enemy, heroConfig.ice.damage * damageScale * 0.55, now);
    freezeEnemy(enemy, now);
    makeBeam(origin, enemy, heroConfig.ice.color, 0.16, 4);
  }
}

function chainLightning(origin, now, damageScale, source) {
  if (state.temp.lightningBounces <= 0) return;

  let current = origin;
  const hit = new Set([origin]);
  const chainRange = 115 * ((origin.poisonUntil ?? 0) > now ? state.temp.stormPoisonRange : 1);

  for (let i = 0; i < state.temp.lightningBounces; i += 1) {
    const next = state.enemies
      .filter((enemy) => !hit.has(enemy) && !hasImmunity(enemy, "lightning") && distance(enemy, current) < chainRange)
      .sort((a, b) => distance(a, current) - distance(b, current))[0];

    if (!next) break;
    next.hp -= directDamageAfterArmor(next, heroConfig.lightning.damage * damageScale * 0.72, now);
    makeBeam(current, next, heroConfig.lightning.color, 0.16, 3);
    hit.add(next);
    current = next;
  }

  if (source) {
    makeBeam({ x: source.x, y: source.y }, origin, heroConfig.lightning.color, 0.1, 3);
  }
}

function castLightningPierce(hero, target, level, now) {
  const damageScale = 1 + (level - 1) * 0.18;
  const laneWidth = 30 + state.temp.lightningPierce * 10;
  const end = { x: target.x, y: -20 };
  makeBeam(hero, end, heroConfig.lightning.color, 0.16, 3);

  for (const enemy of state.enemies) {
    if (hasImmunity(enemy, "lightning")) continue;
    if (Math.abs(enemy.x - target.x) < laneWidth && enemy.y <= hero.y && enemy.y >= -20) {
      enemy.hp -= directDamageAfterArmor(enemy, heroConfig.lightning.damage * damageScale * 0.9, now);
      makeHit(enemy.x, enemy.y, heroConfig.lightning.color, 16);
    }
  }

  if (state.temp.lightningBounces > 0) {
    chainLightning(target, now, damageScale);
  }
}

function updateEffects(dt) {
  for (let i = state.beams.length - 1; i >= 0; i -= 1) {
    state.beams[i].life -= dt;
    if (state.beams[i].life <= 0) state.beams.splice(i, 1);
  }

  for (let i = state.hits.length - 1; i >= 0; i -= 1) {
    state.hits[i].life -= dt;
    state.hits[i].radius += dt * 54;
    if (state.hits[i].life <= 0) state.hits.splice(i, 1);
  }
}

function finishWave() {
  state.waveActive = false;
  state.previewWave = 0;

  if (state.wave >= state.wavesPerBattle) {
    endBattle(true);
    return;
  }

  showTempUpgradeChoices(state.wave + 1);
}

function endBattle(won) {
  const clearBonus = won ? battleClearBonus() : 0;
  const reward = won ? state.securedLoot + clearBonus : Math.floor(state.securedLoot * 0.45);
  const completedPrototype = won && state.battle >= state.maxBattles;
  state.lastBattleSummary = battleOutcomeText(won, reward, clearBonus, completedPrototype);
  state.loot += reward;
  state.battleActive = false;
  state.waveActive = false;
  state.previewWave = 0;
  state.enemies = [];
  state.projectiles = [];
  state.beams = [];
  state.hits = [];

  if (won && !completedPrototype) {
    state.battle += 1;
  }

  battleButton.disabled = false;
  battleButton.textContent = completedPrototype ? "Prototype Complete" : "Start Battle";
  if (completedPrototype) {
    battleButton.disabled = true;
  }
  showBattleResult(won, reward, completedPrototype);
  updateHud();
}

function showTempUpgradeChoices(nextWaveNumber) {
  state.previewWave = nextWaveNumber;
  upgradeTitle.textContent = `Plan Wave ${nextWaveNumber}/${state.wavesPerBattle}`;
  upgradeChoices.innerHTML = "";
  upgradeChoices.append(buildWavePreview(nextWaveNumber));

  const availableUpgrades = tempUpgradePool.filter((upgrade) => upgradeAvailable(upgrade));
  const choices = shuffle([...availableUpgrades]).slice(0, 3);
  const upgradeButtons = [];
  let selectedUpgrade = null;

  for (const upgrade of choices) {
    const upgradeButton = addChoice(`${upgrade.tag}: ${upgrade.title}`, [`Role: ${upgrade.summary}`, upgrade.text], () => {
      selectedUpgrade = upgrade;
      for (const button of upgradeButtons) {
        button.classList.toggle("selected", button === upgradeButton);
      }
      startButton.disabled = false;
      setChoiceContent(startButton, `Start Wave ${nextWaveNumber}`, [`Selected: ${upgrade.title}`, "You can still choose a different upgrade before starting."]);
      updateHud();
    });
    upgradeButtons.push(upgradeButton);
  }

  const startButton = addChoice(`Start Wave ${nextWaveNumber}`, ["Choose one temporary upgrade first.", "The preview above shows what is coming."], () => {
    if (!selectedUpgrade) return;

    selectedUpgrade.apply();
    upgradePanel.classList.add("hidden");
    beginWave(nextWaveNumber);
    updateHud();
  });
  startButton.classList.add("planning-start");
  startButton.disabled = true;

  upgradePanel.classList.remove("hidden");
  updateHud();
}

function upgradeAvailable(upgrade) {
  if (upgrade.requiresWallDamage && state.wall >= state.maxWall) return false;
  if (!upgrade.requiresParty) return true;

  const selected = new Set(selectedPartyKinds());
  return upgrade.requiresParty.every((kind) => selected.has(kind));
}

function showWavePreview(waveNumber) {
  state.previewWave = waveNumber;
  upgradeTitle.textContent = `Wave ${waveNumber}/${state.wavesPerBattle} preview`;
  upgradeChoices.innerHTML = "";

  upgradeChoices.append(buildWavePreview(waveNumber));
  const startTitle = waveNumber === 1 ? `Start Battle ${state.battle}` : `Start Wave ${waveNumber}`;
  const previewHint = waveNumber === 1
    ? "Use this preview to decide whether to train before committing."
    : "Use this preview to judge your latest temporary upgrade choice.";
  addChoice(startTitle, [`Expected: ${enemyCountForWave(waveNumber, state.battle)} enemies`, previewHint], () => {
    upgradePanel.classList.add("hidden");
    beginWave(waveNumber);
  });

  if (!state.battleActive) {
    addChoice("Back to Training", ["Close this preview and spend loot before starting the battle."], () => {
      state.previewWave = 0;
      upgradePanel.classList.add("hidden");
      updateHud();
    });
  }

  upgradePanel.classList.remove("hidden");
  updateHud();
}

function buildWavePreview(waveNumber) {
  const preview = wavePreview(waveNumber, state.battle);
  const previewBox = document.createElement("div");
  previewBox.className = "wave-preview";

  for (const item of preview) {
    const enemy = enemyConfig[item.kind];
    const row = document.createElement("div");
    row.className = "preview-enemy";

    const marker = document.createElement("span");
    marker.className = "preview-marker";
    marker.style.backgroundColor = enemy.color;
    marker.style.borderColor = enemyImmunities(enemy).length ? firstImmunityColor(enemy) : "#101511";
    marker.textContent = enemy.marker;
    row.append(marker);

    const text = document.createElement("span");
    text.className = "preview-text";
    text.textContent = `${item.count}x ${enemy.label}`;
    row.append(text);

    const traits = document.createElement("span");
    traits.className = "preview-traits";
    traits.textContent = enemyTraitText(enemy);
    row.append(traits);

    previewBox.append(row);
  }

  return previewBox;
}

function wavePreview(wave, battle) {
  const counts = new Map();
  const total = enemyCountForWave(wave, battle);

  for (let index = 0; index < total; index += 1) {
    const kind = chooseEnemyKind(wave, battle, index);
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }

  return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
}

function enemyTraitText(enemy) {
  const traits = [];
  if (enemy.pattern === "zigzag") traits.push("zigzag movement");
  if (enemy.ranged) traits.push("ranged wall damage");
  if (enemy.bounce) traits.push("heavy wall brawler");
  if ((enemy.armor ?? 0) > 0) traits.push("armoured");
  for (const immunity of enemyImmunities(enemy)) {
    traits.push(`resists ${heroConfig[immunity]?.label || immunity}`);
  }

  return traits.length ? traits.join(", ") : "straight melee";
}

function showBattleResult(won, reward, completedPrototype = false) {
  upgradeTitle.textContent = completedPrototype ? "Prototype cleared" : won ? "Battle cleared" : "Wall broken";
  upgradeChoices.innerHTML = "";
  const title = won ? `Secure ${reward} loot` : `Recover ${reward} loot`;
  const text = state.lastBattleSummary;
  addChoice(title, text, () => {
    upgradePanel.classList.add("hidden");
    updateHud();
  });
  upgradePanel.classList.remove("hidden");
}

function battleClearBonus() {
  return 3 + state.battle * 2;
}

function battleOutcomeText(won, reward, clearBonus, completedPrototype) {
  const meleeHits = Math.max(0, state.wallHits - state.rangedHits);
  const wallLeft = Math.max(0, state.wall);
  const lesson = battleLesson(won, meleeHits);

  if (won) {
    const finish = completedPrototype ? "3-battle loop complete." : "Train before the next battle.";
    return [
      `Why: wall survived all ${state.wavesPerBattle} waves with ${wallLeft}/${state.maxWall} strength.`,
      `Battle: defeated ${state.enemiesKilled} enemies and took ${meleeHits} melee hits plus ${state.rangedHits} ranged shots.`,
      `Loot: ${state.securedLoot} enemy loot + ${clearBonus} clear bonus = ${reward}.`,
      lesson,
      finish
    ];
  }

  return [
    "Why: wall reached 0 strength.",
    `Battle: defeated ${state.enemiesKilled} enemies and took ${meleeHits} melee hits plus ${state.rangedHits} ranged shots.`,
    lesson,
    `Loot: recovered ${reward} from ${state.securedLoot} secured enemy loot.`
  ];
}

function battleLesson(won, meleeHits) {
  if (state.rangedHits >= meleeHits && state.rangedHits >= 3) {
    return won
      ? "Lesson: ranged enemies dealt steady safe damage; faster Storm or Ice control can reduce that pressure."
      : "Lesson: ranged enemies dealt repeated damage from safety; consider faster attacks or more control.";
  }

  if (state.brawlerHits >= 2) {
    return won
      ? "Lesson: brawlers reached the wall often; Spikes helped if you had them, but more wall strength may help."
      : "Lesson: brawlers reached the wall too often; Fortify or Spikes would directly answer that pressure.";
  }

  if (meleeHits >= 5) {
    return won
      ? "Lesson: many melee enemies reached the wall; area upgrades like Fire Spread or Ice Splash help clear groups."
      : "Lesson: too many melee enemies reached the wall; group damage or wall upgrades would help next time.";
  }

  return won
    ? "Lesson: your damage and control kept pressure manageable."
    : "Lesson: enemies survived too long; training a hero or picking a damage upgrade would help.";
}

function addChoice(title, text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "upgrade-choice";
  setChoiceContent(button, title, text);
  button.addEventListener("click", onClick);
  upgradeChoices.append(button);
  return button;
}

function setChoiceContent(button, title, text) {
  const titleNode = document.createElement("strong");
  titleNode.textContent = title;
  button.replaceChildren(titleNode);

  const lines = Array.isArray(text) ? text : [text];
  for (const line of lines) {
    const lineNode = document.createElement("span");
    lineNode.textContent = line;
    button.append(lineNode);
  }
}

function trainHero(kind) {
  if (state.battleActive || !upgradePanel.classList.contains("hidden")) return;

  const cost = trainingCost(kind);
  if (state.loot < cost) return;

  state.loot -= cost;
  state.heroLevels[kind] += 1;
  updateHud();
}

function buildWallUpgrade(kind) {
  if (state.battleActive || !upgradePanel.classList.contains("hidden")) return;

  const cost = wallUpgradeCost(kind);
  if (state.loot < cost) return;

  state.loot -= cost;
  state.wallLevels[kind] += 1;
  recalculateWallStats();
  state.wall = state.maxWall;
  updateHud();
}

function trainingCost(kind) {
  return 2 + state.heroLevels[kind] * 2;
}

function wallUpgradeCost(kind) {
  return kind === "fortify"
    ? 4 + state.wallLevels.fortify * 3
    : 4 + state.wallLevels.spikes * 4;
}

function recalculateWallStats() {
  state.maxWall = 30 + state.wallLevels.fortify * 6;
}

function wallSpikeDamage() {
  return state.wallLevels.spikes * 7;
}

function updateHud() {
  const activeWave = state.waveActive ? state.wave : state.previewWave || state.wave;
  battleText.textContent = state.battleActive ? `${state.battle}-${activeWave}` : `${Math.min(state.battle, state.maxBattles)}/${state.maxBattles}`;
  lootText.textContent = state.battleActive && state.securedLoot > 0 ? `${state.loot}+${state.securedLoot}` : String(state.loot);
  wallText.textContent = String(Math.max(0, state.wall));

  for (const kind of trainableHeroKinds) {
    document.querySelector(`#${kind}Level`).textContent = state.heroLevels[kind];
    document.querySelector(`#${kind}Cost`).textContent = `Train ${trainingCost(kind)}`;
  }

  for (const button of heroButtons.querySelectorAll("button")) {
    const kind = button.dataset.hero;
    button.disabled = state.battleActive || state.loot < trainingCost(kind) || !upgradePanel.classList.contains("hidden");
  }

  document.querySelector("#fortifyLevel").textContent = state.wallLevels.fortify;
  document.querySelector("#fortifyCost").textContent = `Build ${wallUpgradeCost("fortify")}`;
  document.querySelector("#spikesLevel").textContent = state.wallLevels.spikes;
  document.querySelector("#spikesCost").textContent = `Build ${wallUpgradeCost("spikes")}`;

  for (const button of wallButtons.querySelectorAll("button")) {
    const kind = button.dataset.wallUpgrade;
    button.disabled = state.battleActive || state.loot < wallUpgradeCost(kind) || !upgradePanel.classList.contains("hidden");
  }
}

function drawGame(now) {
  const width = state.width;
  const height = state.height;
  ctx.clearRect(0, 0, width, height);
  drawArena(width, height);
  drawWall(width);
  drawHeroes();
  drawEnemies(now);
  drawProjectiles();
  drawBeams();
  drawHits();
}

function drawArena(width, height) {
  ctx.fillStyle = "#1e2822";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(245, 240, 230, 0.05)";
  ctx.lineWidth = 1;
  for (let x = width / 6; x < width; x += width / 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.wallY);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, state.wallY);
  gradient.addColorStop(0, "rgba(112, 214, 255, 0.08)");
  gradient.addColorStop(1, "rgba(249, 87, 56, 0.05)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, state.wallY);
}

function drawWall(width) {
  ctx.fillStyle = "#514738";
  ctx.fillRect(0, state.wallY, width, 18);
  ctx.fillStyle = "#806b4e";
  for (let x = 0; x < width; x += 42) {
    ctx.fillRect(x + 3, state.wallY - 13, 28, 18);
  }

  if (state.wallLevels.spikes > 0) {
    ctx.fillStyle = "#c6d1bd";
    for (let x = 6; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, state.wallY - 16);
      ctx.lineTo(x + 9, state.wallY);
      ctx.lineTo(x - 9, state.wallY);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(13, 17, 14, 0.72)";
  ctx.fillRect(0, state.wallY + 18, width, state.height - state.wallY - 18);
}

function drawHeroes() {
  drawFormationLabels();

  for (const hero of state.heroes) {
    if (hero.inactive) {
      drawEmptyHeroSlot(hero);
      continue;
    }

    const config = heroConfig[hero.kind];
    const isMainHero = hero.role === "main";

    ctx.beginPath();
    ctx.arc(hero.x, hero.y, isMainHero ? 22 : 18, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.fill();
    ctx.strokeStyle = "#101511";
    ctx.lineWidth = isMainHero ? 5 : 3;
    ctx.stroke();

    if (isMainHero) {
      ctx.beginPath();
      ctx.arc(hero.x, hero.y, 28, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 240, 230, 0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = "#101511";
    ctx.font = "800 12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.label[0], hero.x, hero.y);

    if (!state.battleActive) continue;
    ctx.beginPath();
    ctx.arc(hero.x, hero.y, config.range, -Math.PI * 0.88, -Math.PI * 0.12);
    ctx.strokeStyle = "rgba(245, 240, 230, 0.035)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawFormationLabels() {
  const y = state.wallY + 16;
  const mainHero = state.heroes.find((hero) => hero.role === "main");
  if (!mainHero) return;

  ctx.fillStyle = "rgba(245, 240, 230, 0.58)";
  ctx.font = "800 9px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PARTY", state.width * 0.2, y);
  ctx.fillText("MAIN HERO", mainHero.x, y);
  ctx.fillText("PARTY", state.width * 0.8, y);
}

function drawEmptyHeroSlot(hero) {
  ctx.beginPath();
  ctx.arc(hero.x, hero.y, 17, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245, 240, 230, 0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 240, 230, 0.24)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(245, 240, 230, 0.5)";
  ctx.font = "800 12px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", hero.x, hero.y - 1);
}

function drawEnemies(now) {
  for (const enemy of state.enemies) {
    const burnUntil = enemy.burnUntil ?? 0;
    const slowedUntil = enemy.slowedUntil ?? 0;
    const immunities = enemyImmunities(enemy);
    const marker = enemy.marker || enemy.kind[0].toUpperCase();
    const outlineWidth = enemy.bounce ? 5 : immunities.length ? 3 : 2;
    const drawRadius = enemy.bounce ? enemy.radius + 2 : enemy.radius;

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, drawRadius, 0, Math.PI * 2);
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.strokeStyle = immunities.length ? firstImmunityColor(enemy) : "#101511";
    ctx.lineWidth = outlineWidth;
    ctx.stroke();

    ctx.fillStyle = "#101511";
    ctx.font = "800 10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(marker, enemy.x, enemy.y);

    if (enemy.pattern === "zigzag") {
      drawZigzagMark(enemy);
    }

    drawArmorMarker(enemy, now);

    if (enemy.ranged) {
      ctx.beginPath();
      ctx.moveTo(enemy.x - 6, enemy.y - 12);
      ctx.lineTo(enemy.x + 9, enemy.y);
      ctx.lineTo(enemy.x - 6, enemy.y + 12);
      ctx.strokeStyle = "#101511";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const hpWidth = 28;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "rgba(10, 12, 10, 0.8)";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 10, hpWidth, 4);
    ctx.fillStyle = "#7dd87d";
    ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 10, hpWidth * hpRatio, 4);

    if (burnUntil > now) drawStatusDot(enemy.x - 7, enemy.y + enemy.radius + 7, heroConfig.fire.color);
    if (slowedUntil > now) drawStatusDot(enemy.x + 7, enemy.y + enemy.radius + 7, heroConfig.ice.color);
    if ((enemy.poisonUntil ?? 0) > now) drawStatusDot(enemy.x, enemy.y + enemy.radius + 15, heroConfig.poison.color);
    if ((enemy.armourBrokenUntil ?? 0) > now) drawStatusDot(enemy.x - 11, enemy.y + enemy.radius + 15, heroConfig.earth.color);
    if ((enemy.stunnedUntil ?? 0) > now) drawStatusDot(enemy.x + 11, enemy.y + enemy.radius + 15, heroConfig.earth.color);
    drawEnemyTraitBadges(enemy);
  }
}

function drawEnemyTraitBadges(enemy) {
  const immunities = enemyImmunities(enemy);
  const startX = enemy.x - (immunities.length - 1) * 6;

  immunities.forEach((immunity, index) => {
    const x = startX + index * 12;
    const y = enemy.y - enemy.radius - 18;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = heroConfig[immunity]?.color || "#f5f0e6";
    ctx.fill();
    ctx.fillStyle = "#101511";
    ctx.font = "800 8px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(immunity === "lightning" ? "S" : immunity[0].toUpperCase(), x, y + 0.4);
  });
}

function drawArmorMarker(enemy, now) {
  if ((enemy.maxArmor ?? 0) <= 0) return;

  const broken = !hasActiveArmor(enemy, now);
  const x = enemy.x + enemy.radius + 8;
  const y = enemy.y - enemy.radius - 4;

  ctx.beginPath();
  ctx.rect(x - 5, y - 5, 10, 10);
  ctx.fillStyle = broken ? "#c6d1bd" : "#9ea7a0";
  ctx.fill();
  ctx.strokeStyle = "#101511";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#101511";
  ctx.font = "800 7px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(broken ? "X" : "A", x, y + 0.4);
}

function drawZigzagMark(enemy) {
  const phase = enemy.zigzagPhase || "straight";
  const reach = phase === "weave" ? 16 : phase === "prep" ? 11 : 8;
  const lift = phase === "prep" ? 10 : 7;

  ctx.beginPath();
  ctx.moveTo(enemy.x - reach, enemy.y - 2);
  ctx.lineTo(enemy.x - 5, enemy.y - lift);
  ctx.lineTo(enemy.x + 5, enemy.y + lift);
  ctx.lineTo(enemy.x + reach, enemy.y + 2);
  ctx.strokeStyle = "#101511";
  ctx.lineWidth = phase === "weave" ? 3 : 2;
  ctx.stroke();

  if (phase === "prep") {
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - enemy.radius - 3);
    ctx.lineTo(enemy.x + enemy.zigzagSide * 10, enemy.y - enemy.radius - 8);
    ctx.strokeStyle = "#f5f0e6";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function firstImmunityColor(enemy) {
  const immunity = enemyImmunities(enemy)[0];
  return heroConfig[immunity]?.color || "#f5f0e6";
}

function drawStatusDot(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fillStyle = projectile.color;
    ctx.fill();
  }
}

function drawBeams() {
  for (const beam of state.beams) {
    ctx.beginPath();
    ctx.moveTo(beam.from.x, beam.from.y);
    ctx.lineTo(beam.to.x, beam.to.y);
    ctx.strokeStyle = withAlpha(beam.color, Math.max(0, beam.life / beam.maxLife) * (beam.alpha ?? 1));
    ctx.lineWidth = beam.width ?? 4;
    ctx.stroke();
  }
}

function drawHits() {
  for (const hit of state.hits) {
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, hit.radius, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(hit.color, Math.max(0, hit.life / hit.maxLife));
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function makeBeam(from, to, color, life, width = 4, alpha = 1) {
  state.beams.push({
    from: { x: from.x, y: from.y },
    to: { x: to.x, y: to.y },
    color,
    life,
    maxLife: life,
    width,
    alpha
  });
}

function makeHit(x, y, color, radius) {
  state.hits.push({
    x,
    y,
    color,
    // Hit rings start small here, then expand and fade in updateEffects.
    radius: radius * 0.35,
    life: 0.28,
    maxLife: 0.28
  });
}

function gameLoop(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000);
  state.lastTime = now;
  const scaledDt = dt * state.gameSpeed;
  state.gameTime += scaledDt * 1000;
  updateGame(scaledDt, state.gameTime);
  drawGame(state.gameTime);
  requestAnimationFrame(gameLoop);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

function enemyImmunities(enemy) {
  return Array.isArray(enemy.immune) ? enemy.immune : [];
}

function hasImmunity(enemy, kind) {
  return enemyImmunities(enemy).includes(kind);
}

// Keep hero and effect colors as #rrggbb hex strings; withAlpha depends on that format.
function withAlpha(hex, alpha) {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

window.addEventListener("resize", resizeCanvas);
battleButton.addEventListener("click", startBattle);
heroButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-hero]");
  if (!button || button.disabled) return;
  trainHero(button.dataset.hero);
});
wallButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-wall-upgrade]");
  if (!button || button.disabled) return;
  buildWallUpgrade(button.dataset.wallUpgrade);
});

resizeCanvas();
recalculateWallStats();
updateHud();
requestAnimationFrame(gameLoop);
