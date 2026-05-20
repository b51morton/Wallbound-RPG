import { combatStatSources, heroConfig, partyRosterKinds, selectablePartyKinds, trainableHeroKinds } from './config/heroes.js';
import { damageTypeRoster } from './config/damageTypes.js';
import { enemyConfig } from './config/enemies.js';
import { createTempUpgradePool } from './config/upgrades.js';
import { distance, shuffle, smoothStep } from './utils/math.js';
import { addActiveCombatTime as addCombatStatsActiveTime, createCombatStats, recordArmorBreak as recordCombatArmorBreak, recordAssistDamage as recordCombatAssistDamage, recordComboTrigger as recordCombatComboTrigger, recordDamage as recordCombatDamage, recordHit as recordCombatHit, recordMiss as recordCombatMiss, recordNearMiss as recordCombatNearMiss, recordShot as recordCombatShot, recordSpikeDamage as recordCombatSpikeDamage, recordStatus as recordCombatStatus, recordUpgradeChoice as recordCombatUpgradeChoice, resetCombatBattleStats as resetCombatBattleStatsForState, resetCombatWaveStats as resetCombatWaveStatsForState } from './core/combatStats.js';
import { drawGame } from './render/drawGame.js';
import { renderCombatDebug } from './ui/debugPanel.js';

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const mainMenuScreen = document.querySelector("#mainMenuScreen");
const prepScreen = document.querySelector("#prepScreen");
const battleScreen = document.querySelector("#battleScreen");
const startRunButton = document.querySelector("#startRunButton");
const prepBattleText = document.querySelector("#prepBattleText");
const prepLootText = document.querySelector("#prepLootText");
const prepWallText = document.querySelector("#prepWallText");
const battleText = document.querySelector("#battleText");
const lootText = document.querySelector("#lootText");
const wallText = document.querySelector("#wallText");
const battlePartyText = document.querySelector("#battlePartyText");
const battleStateText = document.querySelector("#battleStateText");
const battleButton = document.querySelector("#battleButton");
const heroButtons = document.querySelector("#heroButtons");
const wallButtons = document.querySelector("#wallButtons");
const upgradePanel = document.querySelector("#upgradePanel");
const upgradeTitle = document.querySelector("#upgradeTitle");
const upgradeChoices = document.querySelector("#upgradeChoices");
const debugToggle = document.querySelector("#debugToggle");
const manualUpgradeToggle = document.querySelector("#manualUpgradeToggle");
const combatDebug = document.querySelector("#combatDebug");

const state = {
  screen: "mainMenu",
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
  floaters: [],
  heroes: [],
  mainHeroKind: "archer",
  partyMemberSlots: ["fire", "ice", "storm", null],
  heroLevels: {
    archer: 1,
    fire: 1,
    ice: 1,
    storm: 1,
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
  wallY: 535,
  manualUpgradeMode: false,
  combatStats: createCombatStats(combatStatSources)
};

const tempUpgradePool = createTempUpgradePool(state, addComboStack);

function setScreen(screen) {
  state.screen = screen;
  mainMenuScreen.classList.toggle("hidden", screen !== "mainMenu");
  prepScreen.classList.toggle("hidden", screen !== "preparation");
  battleScreen.classList.toggle("hidden", screen !== "battle" && screen !== "partySelect" && screen !== "results");
  if (screen === "battle" || screen === "partySelect" || screen === "results") {
    requestAnimationFrame(resizeCanvas);
  }
  updateHud();
}

function startRun() {
  setScreen("preparation");
}

function freshTempUpgrades() {
  return {
    fireSpread: 0,
    fireDotTime: 1,
    iceDuration: 1,
    iceSplash: 0,
    stormBounces: 0,
    stormPierce: 0,
    attackSpeed: 1,
    archerDamage: 1,
    archerAttackSpeed: 1,
    archerVsBurning: 1,
    archerVsPoisoned: 1,
    archerVsStormMarked: 1,
    poisonDamage: 1,
    poisonDuration: 1,
    poisonAttackSpeed: 1,
    earthDamage: 1,
    earthArmorDamage: 1,
    earthBreakDuration: 1,
    earthStunDuration: 1,
    poisonVsBurning: 1,
    fireSpreadsPoison: 0,
    earthVsControlled: 1,
    archerVsSlowed: 1,
    archerVsBroken: 1,
    stormPoisonRange: 1,
    comboStacks: {}
  };
}

function addComboStack(stackId) {
  state.temp.comboStacks[stackId] = (state.temp.comboStacks[stackId] || 0) + 1;
  return state.temp.comboStacks[stackId];
}

function comboStackCount(stackId) {
  return state.temp.comboStacks[stackId] || 0;
}


function resetCombatBattleStats(now = state.gameTime) {
  resetCombatBattleStatsForState(state, combatStatSources);
  updateDebugVisibility();
}

function resetCombatWaveStats(now = state.gameTime) {
  resetCombatWaveStatsForState(state, combatStatSources, refreshCombatDebug);
}

function addActiveCombatTime(dt) {
  addCombatStatsActiveTime(state, dt);
}

function recordUpgradeChoice(waveNumber, upgrade) {
  recordCombatUpgradeChoice(state, waveNumber, upgrade, comboStackCount, refreshCombatDebug);
}

function toggleManualUpgradeMode() {
  state.manualUpgradeMode = !state.manualUpgradeMode;
  updateManualUpgradeToggle();
  if (state.combatStats) state.combatStats.dirty = true;
  refreshCombatDebug();
}

function updateManualUpgradeToggle() {
  if (!manualUpgradeToggle) return;
  manualUpgradeToggle.classList.toggle("active", state.manualUpgradeMode);
  manualUpgradeToggle.setAttribute("aria-pressed", String(state.manualUpgradeMode));
  manualUpgradeToggle.textContent = state.manualUpgradeMode ? "Manual Upgrades On" : "Manual Upgrades Off";
}

function recordShot(source) {
  recordCombatShot(state, combatStatSources, source, refreshCombatDebug);
}

function recordHit(source) {
  recordCombatHit(state, combatStatSources, source, refreshCombatDebug);
}

function recordMiss(source) {
  recordCombatMiss(state, combatStatSources, source, refreshCombatDebug);
}

function recordNearMiss(source) {
  recordCombatNearMiss(state, combatStatSources, source, refreshCombatDebug);
}

function recordDamage(source, amount, category = "directDamage") {
  recordCombatDamage(state, combatStatSources, source, amount, category, refreshCombatDebug);
}

function recordAssistDamage(source, amount) {
  recordCombatAssistDamage(state, combatStatSources, source, amount, refreshCombatDebug);
}

function recordStatus(source, statusKind, amount = 1) {
  recordCombatStatus(state, combatStatSources, source, statusKind, amount, refreshCombatDebug);
}

function recordArmorBreak(source) {
  recordCombatArmorBreak(state, combatStatSources, source, refreshCombatDebug);
}

function recordSpikeDamage(amount) {
  recordCombatSpikeDamage(state, combatStatSources, amount, refreshCombatDebug);
}

function recordComboTrigger(source, assistSource = null) {
  recordCombatComboTrigger(state, combatStatSources, source, assistSource, refreshCombatDebug);
}

function applyTrackedDamage(enemy, source, amount, category) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  enemy.hp -= amount;
  recordDamage(source, amount, category);
  return amount;
}

function applyTrackedDirectDamage(enemy, source, amount, now, category = "directDamage") {
  const damage = directDamageAfterArmor(enemy, amount, now);
  return applyTrackedDamage(enemy, source, damage, category);
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
  if (state.screen !== "preparation") return;
  if (state.battleActive || !upgradePanel.classList.contains("hidden")) return;
  if (state.battle > state.maxBattles) return;

  showPartySelection();
}

function showPartySelection() {
  setScreen("partySelect");
  upgradeTitle.textContent = "Choose party";
  upgradeChoices.innerHTML = "";

  const selected = new Set(selectedPartyKinds());
  const picker = document.createElement("div");
  picker.className = "party-picker";
  const pickButtons = [];

  for (const kind of selectablePartyKinds) {
    const config = heroConfig[kind];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "party-pick";
    button.dataset.hero = kind;
    setChoiceContent(button, config.name, [`${config.damageType} ${config.role}`, selected.has(kind) ? "Selected" : "Tap to add"]);
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

  addChoice("Preview Wave 1", ["Main Hero: Jeff stays in the centre.", "Choose up to 4 party members, then preview the first wave."], () => {
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
    setChoiceContent(button, config.name, [
      `${config.damageType} ${config.role}`,
      config.description,
      isSelected ? "Selected" : button.disabled ? "Party full" : "Tap to add"
    ]);
  }
}

function selectedPartyKinds() {
  return state.partyMemberSlots.filter(Boolean);
}

function activeCharacterKinds() {
  return new Set([state.mainHeroKind, ...selectedPartyKinds()].filter(Boolean));
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
  state.floaters = [];
  resetCombatBattleStats(state.gameTime);
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
  resetCombatWaveStats(state.gameTime);
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
      applyTrackedDamage(enemy, enemy.burnSource || "fire", (enemy.burnDps ?? 0) * dt, enemy.burnCategory || "burnDamage");
    }

    if ((enemy.poisonUntil ?? 0) > now) {
      const poisonSource = enemy.poisonSource || "poison";
      const poisonCategory = enemy.poisonCategory || "poisonDamage";
      const basePoisonDamage = (enemy.poisonDps ?? 0) * dt;
      applyTrackedDamage(enemy, poisonSource, basePoisonDamage, poisonCategory);

      if ((enemy.burnUntil ?? 0) > now && state.temp.poisonVsBurning > 1) {
        const comboDamage = basePoisonDamage * (state.temp.poisonVsBurning - 1);
        applyTrackedDamage(enemy, poisonSource, comboDamage, "comboDamage");
        recordAssistDamage("fire", comboDamage);
      }

      if (poisonCategory === "comboDamage") {
        recordAssistDamage("fire", basePoisonDamage);
      }
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
        applyTrackedDamage(enemy, "wall", 8, "directDamage");
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
  recordSpikeDamage(spikeDamage);
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

    const target = findTarget(hero, now);
    if (!target) continue;

    const level = state.heroLevels[hero.kind];
    hero.cooldownLeft = config.cooldown / heroAttackSpeed(hero.kind) / (1 + (level - 1) * 0.06);
    recordShot(hero.kind);

    if (hero.kind === "storm" && state.temp.stormPierce > 0) {
      castStormPierce(hero, target, level, now);
      continue;
    }

    const empoweredArrow = hero.kind === "archer" && targetComboAssistSources(hero.kind, target).length > 0;
    state.projectiles.push({
      kind: hero.kind,
      x: hero.x,
      y: hero.y - 10,
      target,
      speed: config.projectileSpeed,
      color: empoweredArrow ? "#f5f0e6" : config.color,
      radius: empoweredArrow ? 5 : hero.kind === "storm" || hero.kind === "archer" ? 4 : 5,
      empowered: empoweredArrow
    });
  }
}

function findTarget(hero, now = state.gameTime) {
  let chosen = null;
  let bestScore = -Infinity;

  for (const enemy of state.enemies) {
    if (!enemyInHeroReach(hero, enemy)) continue;
    const score = scoreTargetForHero(hero, enemy, now);
    if (score > bestScore) {
      chosen = enemy;
      bestScore = score;
    }
  }

  return chosen;
}

function heroReachDepth(kind) {
  return heroDamageReach(kind);
}

function heroDamageReach(kind) {
  const config = heroConfig[kind];
  return config.damageReach ?? config.reachDepth ?? config.range;
}

function heroEffectReach(kind) {
  const config = heroConfig[kind];
  return config.effectReach ?? config.damageReach ?? config.reachDepth ?? config.range;
}

function enemyInHeroReach(hero, enemy) {
  if (enemy.y > state.wallY + 20) return false;
  return enemyDistanceFromWall(enemy) <= heroDamageReach(hero.kind);
}

function enemyInHeroEffectReach(kind, enemy) {
  return enemyDistanceFromWall(enemy) <= heroEffectReach(kind);
}

function enemyDistanceFromWall(enemy) {
  return state.wallY - enemy.y;
}

function scoreTargetForHero(hero, enemy, now = state.gameTime) {
  let score = enemy.y * 0.18;
  const kind = hero.kind;
  const clusterScore = nearbyEnemyCount(enemy, kind === "storm" ? 120 : 86);
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
  const burning = (enemy.burnUntil ?? 0) > now;
  const slowed = (enemy.slowedUntil ?? 0) > now;
  const frozen = (enemy.frozenUntil ?? 0) > now;
  const poisoned = (enemy.poisonUntil ?? 0) > now;
  const armourBroken = (enemy.armourBrokenUntil ?? 0) > now;
  const activeArmor = hasActiveArmor(enemy, now);
  const controlled = slowed || frozen;
  const effectInReach = enemyInHeroEffectReach(kind, enemy);
  const effectBonus = effectInReach ? 1 : 0.45;
  if (effectInReach) score += 8;

  if (kind === "archer") {
    if (state.temp.archerVsBurning > 1 && burning) score += 42;
    if (state.temp.archerVsSlowed > 1 && controlled) score += 58;
    if (state.temp.archerVsStormMarked > 1 && (enemy.stormMarkedUntil ?? 0) > now) score += 46;
    if (state.temp.archerVsPoisoned > 1 && poisoned) score += 48;
    if (state.temp.archerVsBroken > 1 && armourBroken) score += 62;
  }

  if (kind === "fire") {
    if (state.temp.fireSpread > 0 && effectInReach) score += clusterScore * 18;
    if (enemy.pattern === "zigzag") score += (enemy.zigzagPhase === "weave" || enemy.zigzagPhase === "prep" ? 44 : 20) * effectBonus;
    if (state.temp.poisonVsBurning > 1 && poisoned && effectInReach) score += 34;
    if (!burning) score += 18 * effectBonus;
  }

  if (kind === "ice") {
    score += enemy.speed * 0.12;
    if (!controlled) score += effectInReach ? 34 : 14;
    if (enemy.y > state.wallY - 140) score += 22;
    if (state.temp.earthVsControlled > 1 && !controlled && effectInReach) score += 16;
  }

  if (kind === "storm") {
    score += clusterScore * 26;
    if (state.temp.stormPoisonRange > 1 && poisoned) score += 48;
    if (clusterScore === 0) score -= state.temp.stormBounces > 0 ? 16 : 0;
  }

  if (kind === "poison") {
    score += hpRatio * 45;
    if (!poisoned) score += effectInReach ? 38 : 18;
    if (burning && state.temp.poisonVsBurning > 1 && effectInReach) score += 48;
    if (state.temp.fireSpreadsPoison > 0 && burning && effectInReach) score += 36;
    if (enemy.hp > 40) score += 18;
  }

  if (kind === "earth") {
    if (activeArmor) score += effectInReach ? 160 : 78;
    if (enemy.maxArmor > 0 && !armourBroken) score += effectInReach ? 52 : 18;
    if (state.temp.earthVsControlled > 1 && controlled && effectInReach) score += 70;
    if (state.temp.archerVsBroken > 1 && activeArmor && effectInReach) score += 40;
    if (enemy.bounce) score += 34;
    if (enemy.y > state.wallY - 130) score += 18;
  }

  return score;
}

function nearbyEnemyCount(origin, radius) {
  return state.enemies.filter((enemy) => enemy !== origin && distance(enemy, origin) < radius).length;
}

function updateProjectiles(dt, now) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];

    if (!state.enemies.includes(projectile.target)) {
      recordMiss(projectile.kind);
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
  const baseDamageScale = (1 + (level - 1) * 0.18) * heroDamageMultiplier(kind);
  const targetMultiplier = targetDamageMultiplier(kind, target);
  const damageScale = baseDamageScale * targetMultiplier;
  recordHit(kind);

  if (!hasImmunity(target, kind)) {
    const baseDamage = directDamageAfterArmor(target, config.damage * baseDamageScale, now);
    const totalDamage = directDamageAfterArmor(target, config.damage * damageScale, now);
    const comboDamage = Math.max(0, totalDamage - baseDamage);
    applyTrackedDamage(target, kind, totalDamage - comboDamage, "directDamage");
    if (comboDamage > 0) {
      applyTrackedDamage(target, kind, comboDamage, "comboDamage");
      const assistSources = targetComboAssistSources(kind, target);
      for (const assistSource of assistSources) {
        recordAssistDamage(assistSource, comboDamage / assistSources.length);
        recordComboTrigger(kind, assistSource);
      }
      if (kind === "archer") {
        makeHit(target.x, target.y, heroConfig.archer.color, 24);
        makeFloatingText(target.x, target.y - target.radius - 14, "BONUS", heroConfig.archer.color, 0.45, 9);
      }
    }
  } else {
    makeHit(target.x, target.y, "#ffffff", 18);
    return;
  }

  if (kind === "fire") {
    if (enemyInHeroEffectReach(kind, target)) {
      target.burnUntil = now + config.dotTime * state.temp.fireDotTime * 1000;
      target.burnDps = (config.dotDamage * damageScale) / config.dotTime;
      target.burnSource = "fire";
      target.burnCategory = "burnDamage";
      recordStatus("fire", "burnsApplied");
      makeFloatingText(target.x, target.y - target.radius - 10, "BURN", heroConfig.fire.color, 0.5, 10);
      spreadFire(target, now, damageScale);
      spreadPoisonFromFire(target, now, damageScale);
    }
  }

  if (kind === "ice") {
    if (enemyInHeroEffectReach(kind, target)) {
      freezeEnemy(target, now);
      splashIce(target, now, damageScale);
    } else {
      slowEnemy(target, now, 0.45, 0.68);
    }
  }

  if (kind === "storm") {
    markStormForArcher(target, now);
    chainStorm(target, now, damageScale, source);
  }

  if (kind === "poison") {
    poisonEnemy(target, now, damageScale, enemyInHeroEffectReach(kind, target) ? 1 : 0.45);
  }

  if (kind === "earth") {
    if (enemyInHeroEffectReach(kind, target)) {
      earthImpact(target, now, damageScale);
    }
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
  recordMiss(projectile.kind);
  if (projectile.kind === "fire" && projectile.evasiveNearMiss && state.enemies.includes(target)) {
    recordNearMiss("fire");
    applyFireGrazeBurn(target, now);
    makeHit(target.x, target.y, heroConfig.fire.color, 12);
    makeFloatingText(target.x, target.y - target.radius - 10, "BURN", heroConfig.fire.color, 0.45, 9);
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
  enemy.burnSource = "fire";
  enemy.burnCategory = "grazeBurnDamage";
  recordStatus("fire", "grazeBurnsApplied");
}

function directDamageAfterArmor(enemy, amount, now) {
  if (!hasActiveArmor(enemy, now)) return amount;
  return amount * 0.45;
}

function hasActiveArmor(enemy, now = state.gameTime) {
  return (enemy.armor ?? 0) > 0 && (enemy.armourBrokenUntil ?? 0) <= now;
}

function heroAttackSpeed(kind) {
  let speed = state.temp.attackSpeed;
  if (kind === "archer") speed *= state.temp.archerAttackSpeed;
  if (kind === "poison") speed *= state.temp.poisonAttackSpeed;
  return speed;
}

function heroDamageMultiplier(kind) {
  if (kind === "archer") return state.temp.archerDamage;
  if (kind === "earth") return state.temp.earthDamage;
  return 1;
}

function targetDamageMultiplier(kind, target) {
  let multiplier = 1;

  if (kind === "archer" && (target.burnUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsBurning;
  }

  if (kind === "archer" && (target.slowedUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsSlowed;
  }

  if (kind === "archer" && (target.stormMarkedUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsStormMarked;
  }

  if (kind === "archer" && (target.poisonUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsPoisoned;
  }

  if (kind === "archer" && (target.armourBrokenUntil ?? 0) > state.gameTime) {
    multiplier *= state.temp.archerVsBroken;
  }

  return multiplier;
}

function targetComboAssistSources(kind, target) {
  const sources = [];

  if (kind === "archer" && (target.burnUntil ?? 0) > state.gameTime && state.temp.archerVsBurning > 1) {
    sources.push("fire");
  }

  if (kind === "archer" && (target.slowedUntil ?? 0) > state.gameTime && state.temp.archerVsSlowed > 1) {
    sources.push("ice");
  }

  if (kind === "archer" && (target.stormMarkedUntil ?? 0) > state.gameTime && state.temp.archerVsStormMarked > 1) {
    sources.push("storm");
  }

  if (kind === "archer" && (target.poisonUntil ?? 0) > state.gameTime && state.temp.archerVsPoisoned > 1) {
    sources.push("poison");
  }

  if (kind === "archer" && (target.armourBrokenUntil ?? 0) > state.gameTime && state.temp.archerVsBroken > 1) {
    sources.push("earth");
  }

  return sources;
}

function spreadFire(origin, now, damageScale) {
  if (state.temp.fireSpread <= 0) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && !hasImmunity(enemy, "fire") && distance(enemy, origin) < 86)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.fireSpread);

  for (const enemy of candidates) {
    applyTrackedDirectDamage(enemy, "fire", 4 * damageScale, now);
    enemy.burnUntil = now + heroConfig.fire.dotTime * state.temp.fireDotTime * 900;
    enemy.burnDps = (heroConfig.fire.dotDamage * damageScale * 0.65) / heroConfig.fire.dotTime;
    enemy.burnSource = "fire";
    enemy.burnCategory = "burnDamage";
    recordStatus("fire", "burnsApplied");
    makeBeam(origin, enemy, heroConfig.fire.color, 0.18, 4);
    makeHit(enemy.x, enemy.y, heroConfig.fire.color, 14);
    makeFloatingText(enemy.x, enemy.y - enemy.radius - 10, "BURN", heroConfig.fire.color, 0.45, 9);
  }
}

function spreadPoisonFromFire(origin, now, damageScale) {
  if (state.temp.fireSpreadsPoison <= 0 || (origin.poisonUntil ?? 0) <= now) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && distance(enemy, origin) < 86)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.fireSpreadsPoison);

  for (const enemy of candidates) {
    enemy.poisonUntil = now + heroConfig.poison.poisonTime * state.temp.poisonDuration * 800;
    enemy.poisonDps = (heroConfig.poison.poisonDamage * damageScale * state.temp.poisonDamage * 0.45) / heroConfig.poison.poisonTime;
    enemy.poisonSource = "poison";
    enemy.poisonCategory = "comboDamage";
    recordStatus("poison", "poisonApplications");
    recordComboTrigger("poison", "fire");
    recordStatus("poison", "comboTargets");
    recordStatus("fire", "assistTriggers");
    makeBeam(origin, enemy, heroConfig.poison.color, 0.14, 3);
    makeHit(enemy.x, enemy.y, heroConfig.poison.color, 16);
    makeFloatingText(enemy.x, enemy.y - enemy.radius - 10, "POISON", heroConfig.poison.color, 0.5, 9);
  }
}

function freezeEnemy(enemy, now) {
  if (hasImmunity(enemy, "ice")) return;
  const freezeMs = heroConfig.ice.freezeTime * state.temp.iceDuration * 1000;
  const slowMs = heroConfig.ice.slowTime * state.temp.iceDuration * 1000;
  enemy.frozenUntil = now + freezeMs;
  enemy.slowedUntil = now + slowMs;
  enemy.slowAmount = 0.38;
  recordStatus("ice", "freezesApplied");
  recordStatus("ice", "slowsApplied");
  recordStatus("ice", "slowTimeApplied", slowMs / 1000);
  makeHit(enemy.x, enemy.y, heroConfig.ice.color, 24);
  makeFloatingText(enemy.x, enemy.y - enemy.radius - 10, "FREEZE", heroConfig.ice.color, 0.5, 9);
}

function slowEnemy(enemy, now, durationScale = 1, slowAmount = 0.52) {
  if (hasImmunity(enemy, "ice")) return;
  const slowMs = heroConfig.ice.slowTime * state.temp.iceDuration * durationScale * 1000;
  enemy.slowedUntil = Math.max(enemy.slowedUntil ?? 0, now + slowMs);
  enemy.slowAmount = Math.min(enemy.slowAmount ?? 1, slowAmount);
  recordStatus("ice", "slowsApplied");
  recordStatus("ice", "slowTimeApplied", slowMs / 1000);
  makeHit(enemy.x, enemy.y, heroConfig.ice.color, 14);
  makeFloatingText(enemy.x, enemy.y - enemy.radius - 10, "SLOW", heroConfig.ice.color, 0.4, 8);
}

function poisonEnemy(enemy, now, damageScale, effectScale = 1) {
  const poisonTime = heroConfig.poison.poisonTime * state.temp.poisonDuration * effectScale;
  enemy.poisonUntil = now + poisonTime * 1000;
  enemy.poisonDps = (heroConfig.poison.poisonDamage * damageScale * state.temp.poisonDamage * effectScale) / heroConfig.poison.poisonTime;
  enemy.poisonSource = "poison";
  enemy.poisonCategory = "poisonDamage";
  recordStatus("poison", "poisonApplications");
  makeHit(enemy.x, enemy.y, heroConfig.poison.color, 18);
  makeFloatingText(enemy.x, enemy.y - enemy.radius - 10, "POISON", heroConfig.poison.color, 0.5, 9);
  if ((enemy.burnUntil ?? 0) > now && state.temp.poisonVsBurning > 1) {
    recordComboTrigger("poison", "fire");
  }
}

function earthImpact(enemy, now, damageScale) {
  const oldArmor = enemy.armor ?? 0;
  const armorDamage = Math.min(oldArmor, 8 * damageScale * state.temp.earthArmorDamage);
  const hadActiveArmor = hasActiveArmor(enemy, now);
  enemy.armor = Math.max(0, oldArmor - 8 * damageScale * state.temp.earthArmorDamage);
  enemy.armourBrokenUntil = now + heroConfig.earth.armourBreakTime * state.temp.earthBreakDuration * 1000;
  if (armorDamage > 0) recordDamage("earth", armorDamage, "armorDamage");
  if (hadActiveArmor) {
    recordArmorBreak("earth");
    makeHit(enemy.x, enemy.y, heroConfig.earth.color, 30);
    makeFloatingText(enemy.x, enemy.y - enemy.radius - 12, "CRACK", heroConfig.earth.color, 0.6, 11);
  }
  const controlled = (enemy.frozenUntil ?? 0) > now || (enemy.slowedUntil ?? 0) > now;
  const stunMultiplier = controlled ? state.temp.earthVsControlled : 1;
  const baseStunSeconds = heroConfig.earth.stunTime * state.temp.earthStunDuration * 0.7;
  if (controlled && state.temp.earthVsControlled > 1) {
    const bonusStunSeconds = baseStunSeconds * (state.temp.earthVsControlled - 1);
    recordComboTrigger("earth", "ice");
    recordStatus("earth", "comboControlTime", bonusStunSeconds);
    recordStatus("ice", "assistControlTime", bonusStunSeconds);
  }
  enemy.stunnedUntil = now + baseStunSeconds * stunMultiplier * 1000;
  recordStatus("earth", "stunsApplied");
  makeFloatingText(enemy.x, enemy.y + enemy.radius + 18, "STUN", heroConfig.earth.color, 0.45, 9);
}

function splashIce(origin, now, damageScale) {
  if (state.temp.iceSplash <= 0) return;

  const candidates = state.enemies
    .filter((enemy) => enemy !== origin && !hasImmunity(enemy, "ice") && distance(enemy, origin) < 72)
    .sort((a, b) => distance(a, origin) - distance(b, origin))
    .slice(0, state.temp.iceSplash);

  for (const enemy of candidates) {
    applyTrackedDirectDamage(enemy, "ice", heroConfig.ice.damage * damageScale * 0.55, now);
    freezeEnemy(enemy, now);
    makeBeam(origin, enemy, heroConfig.ice.color, 0.16, 4);
  }
}

function chainStorm(origin, now, damageScale, source, chainDamageScale = 1) {
  if (state.temp.stormBounces <= 0) return;

  let current = origin;
  const hit = new Set([origin]);
  const baseChainRange = 115;
  const poisonComboActive = (origin.poisonUntil ?? 0) > now && state.temp.stormPoisonRange > 1;
  const chainRange = baseChainRange * (poisonComboActive ? state.temp.stormPoisonRange : 1);

  for (let i = 0; i < state.temp.stormBounces; i += 1) {
    const next = state.enemies
      .filter((enemy) => !hit.has(enemy) && !hasImmunity(enemy, "storm") && distance(enemy, current) < chainRange)
      .sort((a, b) => distance(a, current) - distance(b, current))[0];

    if (!next) break;
    const chainDistance = distance(next, current);
    const comboEnabledHit = poisonComboActive && chainDistance > baseChainRange;
    const chainDamage = heroConfig.storm.damage * damageScale * 0.72 * chainDamageScale;
    applyTrackedDirectDamage(next, "storm", chainDamage, now, comboEnabledHit ? "comboDamage" : "chainDamage");
    if (comboEnabledHit) {
      recordAssistDamage("poison", directDamageAfterArmor(next, chainDamage, now));
      recordComboTrigger("storm", "poison");
    }
    markStormForArcher(next, now);
    makeBeam(current, next, heroConfig.storm.color, 0.14, 2.5, 0.86);
    hit.add(next);
    current = next;
  }

  if (source) {
    makeBeam({ x: source.x, y: source.y }, origin, heroConfig.storm.color, 0.1, 2.5, 0.8);
  }
}

function markStormForArcher(enemy, now) {
  if (state.temp.archerVsStormMarked <= 1) return;
  enemy.stormMarkedUntil = now + 2200;
}

function castStormPierce(hero, target, level, now) {
  const damageScale = 1 + (level - 1) * 0.18;
  const laneWidth = 30 + state.temp.stormPierce * 10;
  const end = { x: target.x, y: -20 };
  let hits = 0;
  let primaryHit = false;
  makeBeam(hero, end, heroConfig.storm.color, 0.14, 3, 0.82);

  for (const enemy of state.enemies) {
    if (hasImmunity(enemy, "storm")) continue;
    if (Math.abs(enemy.x - target.x) < laneWidth && enemy.y <= hero.y && enemy.y >= -20) {
      hits += 1;
      recordHit("storm");
      recordStatus("storm", "pierceHits");
      applyTrackedDirectDamage(enemy, "storm", heroConfig.storm.damage * damageScale * 0.9, now);
      markStormForArcher(enemy, now);
      makeHit(enemy.x, enemy.y, heroConfig.storm.color, 16);
      if (enemy === target) primaryHit = true;
    }
  }

  if (hits === 0) recordMiss("storm");

  if (primaryHit && state.temp.stormBounces > 0) {
    chainStorm(target, now, damageScale, null, 0.55);
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

  for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
    state.floaters[i].life -= dt;
    state.floaters[i].y -= dt * 28;
    if (state.floaters[i].life <= 0) state.floaters.splice(i, 1);
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
  state.floaters = [];

  if (won && !completedPrototype) {
    state.battle += 1;
  }

  setScreen("results");
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
  const choices = state.manualUpgradeMode ? availableUpgrades : shuffle([...availableUpgrades]).slice(0, 3);
  const upgradeButtons = [];
  let selectedUpgrade = null;

  const chooseUpgrade = (upgrade, upgradeButton) => {
    selectedUpgrade = upgrade;
    for (const button of upgradeButtons) {
      button.classList.toggle("selected", button === upgradeButton);
    }
    startButton.disabled = false;
    setChoiceContent(startButton, `Start Wave ${nextWaveNumber}`, [`Selected: ${upgrade.title}`, "You can still choose a different upgrade before starting."]);
    updateHud();
  };

  if (state.manualUpgradeMode) {
    upgradeChoices.append(buildManualUpgradePicker(choices, upgradeButtons, chooseUpgrade));
  } else {
    for (const upgrade of choices) {
      const upgradeButton = addChoice(`${upgrade.tag}: ${upgrade.title}`, [`Role: ${upgrade.summary}`, upgrade.text], () => {
        chooseUpgrade(upgrade, upgradeButton);
      });
      upgradeButtons.push(upgradeButton);
    }
  }

  const startButton = addChoice(`Start Wave ${nextWaveNumber}`, ["Choose one temporary upgrade first.", "The preview above shows what is coming."], () => {
    if (!selectedUpgrade) return;

    selectedUpgrade.apply();
    recordUpgradeChoice(nextWaveNumber, selectedUpgrade);
    upgradePanel.classList.add("hidden");
    beginWave(nextWaveNumber);
    updateHud();
  });
  startButton.classList.add("planning-start");
  startButton.disabled = true;

  upgradePanel.classList.remove("hidden");
  updateHud();
}

function buildManualUpgradePicker(upgrades, upgradeButtons, onChoose) {
  const picker = document.createElement("div");
  picker.className = "manual-upgrade-picker";

  const groups = new Map();
  for (const upgrade of upgrades) {
    const group = manualUpgradeGroup(upgrade);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(upgrade);
  }

  for (const group of manualUpgradeGroupOrder()) {
    const groupUpgrades = groups.get(group);
    if (!groupUpgrades?.length) continue;

    const section = document.createElement("section");
    section.className = "manual-upgrade-group";

    const heading = document.createElement("h2");
    heading.textContent = group;
    section.append(heading);

    for (const upgrade of groupUpgrades) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "upgrade-choice";
      setChoiceContent(button, `${upgrade.tag}: ${upgrade.title}`, [`Role: ${upgrade.summary}`, upgrade.text]);
      button.addEventListener("click", () => onChoose(upgrade, button));
      section.append(button);
      upgradeButtons.push(button);
    }

    picker.append(section);
  }

  return picker;
}

function manualUpgradeGroup(upgrade) {
  if (upgrade.source === "archer") return "Jeff";
  if (upgrade.source && heroConfig[upgrade.source]) return heroConfig[upgrade.source].name;
  if (upgrade.requiresParty) return "Combo";
  if (upgrade.tag === "Wall") return "Wall";
  if (upgrade.tag === "All") return "All";
  return upgrade.tag;
}

function manualUpgradeGroupOrder() {
  return ["Jeff", "Ashka", "Nyra", "Raika", "Vessa", "Torren", "Combo", "Wall", "All"];
}

function upgradeAvailable(upgrade) {
  if (upgrade.requiresWallDamage && state.wall >= state.maxWall) return false;
  if (upgrade.maxStacks && upgrade.stackId && comboStackCount(upgrade.stackId) >= upgrade.maxStacks) return false;

  const active = activeCharacterKinds();
  if (upgrade.source && !active.has(upgrade.source)) return false;
  if (!upgrade.requiresParty) return true;

  return upgrade.requiresParty.every((kind) => active.has(kind));
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
    setScreen("battle");
    beginWave(waveNumber);
  });

  if (!state.battleActive) {
    addChoice("Back to Training", ["Close this preview and spend loot before starting the battle."], () => {
      state.previewWave = 0;
      upgradePanel.classList.add("hidden");
      setScreen("preparation");
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
    traits.push(`resists ${heroConfig[immunity]?.damageType || immunity}`);
  }

  return traits.length ? traits.join(", ") : "straight melee";
}

function showBattleResult(won, reward, completedPrototype = false) {
  upgradeTitle.textContent = completedPrototype ? "Prototype cleared" : won ? "Battle cleared" : "Wall broken";
  upgradeChoices.innerHTML = "";
  const title = won ? `Secure ${reward} loot` : `Recover ${reward} loot`;
  const text = state.lastBattleSummary;
  addChoice(completedPrototype ? "Return to Main Menu" : title, text, () => {
    upgradePanel.classList.add("hidden");
    setScreen(completedPrototype ? "mainMenu" : "preparation");
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
      ? "Lesson: ranged enemies dealt steady safe damage; faster Raika attacks or Nyra control can reduce that pressure."
      : "Lesson: ranged enemies dealt repeated damage from safety; consider faster attacks or more control.";
  }

  if (state.brawlerHits >= 2) {
    return won
      ? "Lesson: brawlers reached the wall often; Spikes helped if you had them, but more wall strength may help."
      : "Lesson: brawlers reached the wall too often; Fortify or Spikes would directly answer that pressure.";
  }

  if (meleeHits >= 5) {
    return won
      ? "Lesson: many melee enemies reached the wall; area upgrades like Ashka: Fire Spread or Nyra: Ice Splash help clear groups."
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
  if (state.screen !== "preparation") return;
  if (state.battleActive || !upgradePanel.classList.contains("hidden")) return;

  const cost = trainingCost(kind);
  if (state.loot < cost) return;

  state.loot -= cost;
  state.heroLevels[kind] += 1;
  updateHud();
}

function buildWallUpgrade(kind) {
  if (state.screen !== "preparation") return;
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
  prepBattleText.textContent = `${Math.min(state.battle, state.maxBattles)}/${state.maxBattles}`;
  prepLootText.textContent = String(state.loot);
  prepWallText.textContent = `${state.maxWall}`;
  battlePartyText.textContent = activePartyLabel();
  battleStateText.textContent = battleStateLabel(activeWave);

  for (const kind of trainableHeroKinds) {
    document.querySelector(`#${kind}Level`).textContent = state.heroLevels[kind];
    document.querySelector(`#${kind}Cost`).textContent = `Train ${trainingCost(kind)}`;
  }

  for (const button of heroButtons.querySelectorAll("button")) {
    const kind = button.dataset.hero;
    button.disabled = state.screen !== "preparation" || state.battleActive || state.loot < trainingCost(kind) || !upgradePanel.classList.contains("hidden");
  }

  document.querySelector("#fortifyLevel").textContent = state.wallLevels.fortify;
  document.querySelector("#fortifyCost").textContent = `Build ${wallUpgradeCost("fortify")}`;
  document.querySelector("#spikesLevel").textContent = state.wallLevels.spikes;
  document.querySelector("#spikesCost").textContent = `Build ${wallUpgradeCost("spikes")}`;

  for (const button of wallButtons.querySelectorAll("button")) {
    const kind = button.dataset.wallUpgrade;
    button.disabled = state.screen !== "preparation" || state.battleActive || state.loot < wallUpgradeCost(kind) || !upgradePanel.classList.contains("hidden");
  }
  battleButton.disabled = state.screen !== "preparation" || state.battleActive || !upgradePanel.classList.contains("hidden") || state.battle > state.maxBattles;
  battleButton.textContent = state.battle > state.maxBattles ? "Prototype Complete" : "Start Battle";
}

function activePartyLabel() {
  const names = [state.mainHeroKind, ...selectedPartyKinds()]
    .filter(Boolean)
    .map((kind) => heroConfig[kind]?.name || kind);
  return names.join(" / ");
}

function battleStateLabel(activeWave) {
  if (state.waveActive) return `Wave ${activeWave}/${state.wavesPerBattle}`;
  if (state.battleActive && state.previewWave) return `Planning Wave ${state.previewWave}/${state.wavesPerBattle}`;
  if (state.screen === "results") return "Battle result";
  if (state.battleActive) return "Preparing wave";
  return "Ready";
}

function toggleCombatDebug() {
  state.combatStats.visible = !state.combatStats.visible;
  updateDebugVisibility();
}

function toggleManualUpgradeModeFromInput() {
  toggleManualUpgradeMode();
}

function updateDebugVisibility() {
  if (!combatDebug || !debugToggle || !state.combatStats) return;
  combatDebug.classList.toggle("hidden", !state.combatStats.visible);
  debugToggle.classList.toggle("active", state.combatStats.visible);
  debugToggle.setAttribute("aria-expanded", String(state.combatStats.visible));
  debugToggle.textContent = state.combatStats.visible ? "Hide Debug" : "Debug";
  refreshCombatDebug();
}

function refreshCombatDebug() {
  renderCombatDebug({
    container: combatDebug,
    state,
    tempUpgradePool,
    combatStatSources,
    heroConfig,
    comboStackCount
  });
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

function makeFloatingText(x, y, text, color, life = 0.5, size = 10) {
  state.floaters.push({
    x,
    y,
    text,
    color,
    life,
    maxLife: life,
    size
  });
}

function gameLoop(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000);
  state.lastTime = now;
  const scaledDt = dt * state.gameSpeed;
  state.gameTime += scaledDt * 1000;
  addActiveCombatTime(scaledDt);
  updateGame(scaledDt, state.gameTime);
  refreshCombatDebug();
  drawGame(ctx, state, heroConfig, state.gameTime, { enemyImmunities, hasActiveArmor });
  requestAnimationFrame(gameLoop);
}

function enemyImmunities(enemy) {
  return Array.isArray(enemy.immune) ? enemy.immune : [];
}

function hasImmunity(enemy, kind) {
  return enemyImmunities(enemy).includes(kind);
}

function firstImmunityColor(enemy) {
  const immunity = enemyImmunities(enemy)[0];
  return heroConfig[immunity]?.color || "#f5f0e6";
}

window.addEventListener("resize", resizeCanvas);
startRunButton.addEventListener("click", startRun);
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
debugToggle.addEventListener("click", toggleCombatDebug);
manualUpgradeToggle.addEventListener("click", toggleManualUpgradeModeFromInput);
window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  const key = event.key.toLowerCase();
  if (key === "d") {
    toggleCombatDebug();
  }
  if (key === "u") {
    toggleManualUpgradeModeFromInput();
  }
});

resizeCanvas();
recalculateWallStats();
setScreen("mainMenu");
updateDebugVisibility();
updateManualUpgradeToggle();
requestAnimationFrame(gameLoop);
