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
const debugToggle = document.querySelector("#debugToggle");
const manualUpgradeToggle = document.querySelector("#manualUpgradeToggle");
const combatDebug = document.querySelector("#combatDebug");

const heroConfig = {
  archer: {
    kind: "archer",
    name: "Jeff",
    damageType: "Physical",
    role: "Main Hero",
    label: "Jeff",
    shortLabel: "J",
    description: "Reliable neutral arrow damage.",
    implemented: true,
    color: "#d9c7a3",
    cooldown: 0.82,
    range: 410,
    damage: 8,
    projectileSpeed: 620
  },
  fire: {
    kind: "fire",
    name: "Ashka",
    damageType: "Fire",
    role: "Party Member",
    label: "Ashka",
    shortLabel: "F",
    description: "Burns enemies and can graze evasive targets.",
    implemented: true,
    color: "#f95738",
    cooldown: 0.82,
    range: 430,
    damage: 14,
    dotDamage: 18,
    dotTime: 2.5,
    projectileSpeed: 520
  },
  ice: {
    kind: "ice",
    name: "Nyra",
    damageType: "Ice",
    role: "Party Member",
    label: "Nyra",
    shortLabel: "I",
    description: "Slows, freezes, and manages pressure.",
    implemented: true,
    color: "#70d6ff",
    cooldown: 1.05,
    range: 390,
    damage: 9,
    freezeTime: 0.6,
    slowTime: 1.4,
    projectileSpeed: 470
  },
  storm: {
    kind: "storm",
    name: "Raika",
    damageType: "Storm",
    role: "Party Member",
    label: "Raika",
    shortLabel: "S",
    description: "Lightning burst, chain damage, and pierce effects.",
    implemented: true,
    color: "#ffd166",
    cooldown: 0.9,
    range: 420,
    damage: 12,
    projectileSpeed: 650
  },
  poison: {
    kind: "poison",
    name: "Vessa",
    damageType: "Poison",
    role: "Party Member",
    label: "Vessa",
    shortLabel: "P",
    description: "Damage over time, weakening, and attrition pressure.",
    implemented: true,
    color: "#8bd450",
    cooldown: 0.98,
    range: 400,
    damage: 6,
    poisonDamage: 24,
    poisonTime: 4,
    projectileSpeed: 470
  },
  earth: {
    kind: "earth",
    name: "Torren",
    damageType: "Earth",
    role: "Party Member",
    label: "Torren",
    shortLabel: "E",
    description: "Breaks armour with heavy impact.",
    implemented: true,
    color: "#b58b5b",
    cooldown: 1.2,
    range: 360,
    damage: 16,
    stunTime: 0.45,
    armourBreakTime: 2.8,
    projectileSpeed: 430
  },
  holy: {
    kind: "holy",
    name: "Solen",
    damageType: "Holy",
    role: "Party Member",
    label: "Solen",
    shortLabel: "H",
    description: "Future defensive support, cleansing, and anti-corruption party member.",
    implemented: false
  },
  shadow: {
    kind: "shadow",
    name: "Morvane",
    damageType: "Shadow",
    role: "Party Member",
    label: "Morvane",
    shortLabel: "M",
    description: "Future curses, life drain, fear, and enemy debuffs.",
    implemented: false
  },
  arcane: {
    kind: "arcane",
    name: "Elowen",
    damageType: "Arcane",
    role: "Party Member",
    label: "Elowen",
    shortLabel: "A",
    description: "Future raw magic, resistance piercing, and unstable blasts.",
    implemented: false
  },
  wind: {
    kind: "wind",
    name: "Kael",
    damageType: "Wind",
    role: "Party Member",
    label: "Kael",
    shortLabel: "W",
    description: "Future knockback, speed manipulation, and pushback.",
    implemented: false
  },
  blood: {
    kind: "blood",
    name: "Riven",
    damageType: "Blood",
    role: "Party Member",
    label: "Riven",
    shortLabel: "B",
    description: "Future bleed, lifesteal, executes, and wounded-enemy damage.",
    implemented: false
  }
};

const partyRosterKinds = ["fire", "ice", "storm", "poison", "earth", "holy", "shadow", "arcane", "wind", "blood"];
const selectablePartyKinds = partyRosterKinds.filter((kind) => heroConfig[kind].implemented);
const trainableHeroKinds = selectablePartyKinds;
const combatStatSources = ["archer", "fire", "ice", "storm", "poison", "earth", "spikes", "wall"];

const damageTypeRoster = {
  Physical: "Reliable neutral damage. Main Hero Jeff uses this for now.",
  Fire: "Burn damage over time and future spread effects.",
  Ice: "Freeze, slow, and pressure control.",
  Storm: "Lightning burst, chains, and pierce.",
  Poison: "Attrition, weakening, and damage over time.",
  Earth: "Armour break, stun, impact, barriers, and terrain slow.",
  Holy: "Future defensive support, cleansing, shielding, and anti-corruption damage.",
  Shadow: "Future curses, drain, fear, ramping damage, and debuffs.",
  Arcane: "Future raw magic, resistance piercing, unstable blasts, and random effects.",
  Wind: "Future knockback, speed manipulation, multi-hit slicing, and pushback.",
  Blood: "Future bleed, lifesteal, executes, and wounded-enemy damage."
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
    immune: ["storm"],
    bounce: true
  }
};

const tempUpgradePool = [
  {
    tag: "Ashka",
    title: "Ashka: Fire Spread",
    source: "fire",
    summary: "Burn jumps to 1 nearby enemy",
    text: "Ashka's Fire burn spreads to 1 nearby enemy for 65% burn damage.",
    apply: () => state.temp.fireSpread += 1
  },
  {
    tag: "Ashka",
    title: "Ashka: Burn Duration",
    source: "fire",
    summary: "+50% burn duration",
    text: "Ashka's Fire damage over time lasts 50% longer this battle.",
    apply: () => state.temp.fireDotTime *= 1.5
  },
  {
    tag: "Nyra",
    title: "Nyra: Deep Freeze",
    source: "ice",
    summary: "+50% freeze and slow duration",
    text: "Nyra's Ice freeze and slow effects last 50% longer this battle.",
    apply: () => state.temp.iceDuration *= 1.5
  },
  {
    tag: "Nyra",
    title: "Nyra: Ice Splash",
    source: "ice",
    summary: "Hits 2 nearby enemies",
    text: "Nyra's Ice also hits up to 2 nearby enemies for 55% damage and applies slow.",
    apply: () => state.temp.iceSplash += 2
  },
  {
    tag: "Raika",
    title: "Raika: Chain Strike",
    source: "storm",
    summary: "Bounces to 2 enemies",
    text: "Storm damage jumps to 2 nearby enemies for 72% damage.",
    apply: () => state.temp.stormBounces += 2
  },
  {
    tag: "Raika",
    title: "Raika: Piercing Bolt",
    source: "storm",
    stackId: "piercingBolt",
    maxStacks: 1,
    summary: "Hits a lane line",
    text: "One-time unlock: Raika's Storm damage hits enemies in the same lane for 90% damage.",
    apply: () => state.temp.stormPierce = addComboStack("piercingBolt")
  },
  {
    tag: "Vessa",
    title: "Vessa: Potent Venom",
    source: "poison",
    summary: "+25% poison damage",
    text: "Vessa's Poison damage over time is 25% stronger this battle.",
    apply: () => state.temp.poisonDamage *= 1.25
  },
  {
    tag: "Vessa",
    title: "Vessa: Lingering Toxin",
    source: "poison",
    summary: "+35% poison duration",
    text: "Vessa's Poison lasts 35% longer this battle.",
    apply: () => state.temp.poisonDuration *= 1.35
  },
  {
    tag: "Vessa",
    title: "Vessa: Toxic Needles",
    source: "poison",
    summary: "+18% attack speed",
    text: "Vessa shoots Poison needles 18% faster this battle.",
    apply: () => state.temp.poisonAttackSpeed *= 1.18
  },
  {
    tag: "Torren",
    title: "Torren: Crushing Stone",
    source: "earth",
    summary: "+20% Earth impact",
    text: "Torren's Earth hits deal 20% more damage and impact this battle.",
    apply: () => state.temp.earthDamage *= 1.2
  },
  {
    tag: "Torren",
    title: "Torren: Shatter Armour",
    source: "earth",
    summary: "Stronger armour break",
    text: "Torren breaks 35% more armour and armour stays broken longer this battle.",
    apply: () => {
      state.temp.earthArmorDamage *= 1.35;
      state.temp.earthBreakDuration *= 1.25;
    }
  },
  {
    tag: "Torren",
    title: "Torren: Heavy Impact",
    source: "earth",
    summary: "+35% stun duration",
    text: "Torren's stuns last 35% longer this battle.",
    apply: () => state.temp.earthStunDuration *= 1.35
  },
  {
    tag: "All",
    title: "Battle Rhythm",
    summary: "+18% cast speed",
    text: "All heroes attack 18% faster this battle.",
    apply: () => state.temp.attackSpeed *= 1.18
  },
  {
    tag: "Jeff",
    title: "Jeff: Sharpened Arrows",
    source: "archer",
    summary: "+20% arrow damage",
    text: "Jeff's arrows deal 20% more Physical damage this battle.",
    apply: () => state.temp.archerDamage *= 1.2
  },
  {
    tag: "Jeff",
    title: "Jeff: Faster Shots",
    source: "archer",
    summary: "+18% attack speed",
    text: "Jeff shoots arrows 18% faster this battle.",
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
    title: "Ashka + Jeff: Ember Arrows",
    stackId: "emberArrows",
    summary: "Archer punishes burn",
    text: "Each stack makes Jeff's arrows deal +20% damage to burning enemies.",
    requiresParty: ["archer", "fire"],
    apply: () => state.temp.archerVsBurning = 1 + addComboStack("emberArrows") * 0.2
  },
  {
    tag: "Combo",
    title: "Ashka + Vessa: Toxic Flame",
    stackId: "toxicFlame",
    summary: "Burn boosts Poison",
    text: "Each stack makes Vessa's Poison deal +35% damage to burning enemies.",
    requiresParty: ["fire", "poison"],
    apply: () => state.temp.poisonVsBurning = 1 + addComboStack("toxicFlame") * 0.35
  },
  {
    tag: "Combo",
    title: "Ashka + Vessa: Contagion Spark",
    stackId: "contagionSpark",
    summary: "Fire spreads Poison",
    text: "Each stack lets Ashka's Fire hits on poisoned enemies spread Poison to +1 nearby enemy.",
    requiresParty: ["fire", "poison"],
    apply: () => state.temp.fireSpreadsPoison = addComboStack("contagionSpark")
  },
  {
    tag: "Combo",
    title: "Nyra + Torren: Frostcrack",
    stackId: "frostcrack",
    summary: "Earth extends frozen stuns",
    text: "Each stack makes Torren's Earth stuns on frozen or slowed enemies +60% longer.",
    requiresParty: ["ice", "earth"],
    apply: () => state.temp.earthVsControlled = 1 + addComboStack("frostcrack") * 0.6
  },
  {
    tag: "Combo",
    title: "Nyra + Jeff: Marked Target",
    stackId: "markedTarget",
    summary: "Archer punishes slow",
    text: "Each stack makes Jeff's arrows deal +25% damage to slowed enemies.",
    requiresParty: ["archer", "ice"],
    apply: () => state.temp.archerVsSlowed = 1 + addComboStack("markedTarget") * 0.25
  },
  {
    tag: "Combo",
    title: "Raika + Jeff: Charged Arrows",
    stackId: "chargedArrows",
    summary: "Storm marks targets",
    text: "Each stack makes Jeff's arrows deal +20% damage to enemies recently hit by Raika.",
    requiresParty: ["archer", "storm"],
    apply: () => state.temp.archerVsStormMarked = 1 + addComboStack("chargedArrows") * 0.2
  },
  {
    tag: "Combo",
    title: "Vessa + Jeff: Venom-Tipped Arrows",
    stackId: "venomTippedArrows",
    summary: "Archer punishes Poison",
    text: "Each stack makes Jeff's arrows deal +20% damage to poisoned enemies.",
    requiresParty: ["archer", "poison"],
    apply: () => state.temp.archerVsPoisoned = 1 + addComboStack("venomTippedArrows") * 0.2
  },
  {
    tag: "Combo",
    title: "Torren + Jeff: Grounded Arrows",
    stackId: "groundedArrows",
    summary: "Earth helps Archer",
    text: "Each stack makes Jeff's arrows deal +30% damage to armour-broken enemies.",
    requiresParty: ["archer", "earth"],
    apply: () => state.temp.archerVsBroken = 1 + addComboStack("groundedArrows") * 0.3
  },
  {
    tag: "Combo",
    title: "Raika + Vessa: Conductive Venom",
    stackId: "conductiveVenom",
    summary: "Storm chains farther",
    text: "Each stack makes Storm chain range +35% longer when the first target is poisoned.",
    requiresParty: ["storm", "poison"],
    apply: () => state.temp.stormPoisonRange = 1 + addComboStack("conductiveVenom") * 0.35
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
  combatStats: createCombatStats()
};

function createCombatStats() {
  return {
    visible: false,
    battleDuration: 0,
    waveDuration: 0,
    upgradeHistory: [],
    dirty: true,
    battle: createCombatStatBucket(),
    wave: createCombatStatBucket()
  };
}

function createCombatStatBucket() {
  return Object.fromEntries(combatStatSources.map((source) => [source, createSourceStats()]));
}

function createSourceStats() {
  return {
    shotsFired: 0,
    hits: 0,
    misses: 0,
    nearMisses: 0,
    directDamage: 0,
    burnDamage: 0,
    grazeBurnDamage: 0,
    poisonDamage: 0,
    chainDamage: 0,
    spikeDamage: 0,
    armorDamage: 0,
    comboDamage: 0,
    assistDamage: 0,
    burnsApplied: 0,
    grazeBurnsApplied: 0,
    freezesApplied: 0,
    slowsApplied: 0,
    slowTimeApplied: 0,
    poisonApplications: 0,
    armorBreaks: 0,
    stunsApplied: 0,
    pierceHits: 0,
    spikeHits: 0,
    comboTriggers: 0,
    comboTargets: 0,
    assistTriggers: 0,
    comboControlTime: 0,
    assistControlTime: 0,
    totalDamage: 0
  };
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
  const visible = state.combatStats?.visible || false;
  state.combatStats = createCombatStats();
  state.combatStats.visible = visible;
  updateDebugVisibility();
}

function resetCombatWaveStats(now = state.gameTime) {
  state.combatStats.wave = createCombatStatBucket();
  state.combatStats.waveDuration = 0;
  state.combatStats.dirty = true;
  refreshCombatDebug();
}

function addActiveCombatTime(dt) {
  const stats = state.combatStats;
  if (!stats || !state.waveActive) return;
  stats.waveDuration += dt;
  stats.battleDuration += dt;
  stats.dirty = true;
}

function recordUpgradeChoice(waveNumber, upgrade) {
  if (!state.combatStats) return;
  state.combatStats.upgradeHistory.push({
    wave: waveNumber,
    title: upgrade.title,
    stack: upgrade.stackId ? comboStackCount(upgrade.stackId) : null,
    maxStacks: upgrade.maxStacks || null
  });
  state.combatStats.dirty = true;
  refreshCombatDebug();
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
  mutateCombatStats(source, (stats) => {
    stats.shotsFired += 1;
  });
}

function recordHit(source) {
  mutateCombatStats(source, (stats) => {
    stats.hits += 1;
  });
}

function recordMiss(source) {
  mutateCombatStats(source, (stats) => {
    stats.misses += 1;
  });
}

function recordNearMiss(source) {
  mutateCombatStats(source, (stats) => {
    stats.nearMisses += 1;
  });
}

function recordDamage(source, amount, category = "directDamage") {
  if (!Number.isFinite(amount) || amount <= 0) return;
  mutateCombatStats(source, (stats) => {
    if (!(category in stats)) stats[category] = 0;
    stats[category] += amount;
    stats.totalDamage += amount;
  });
}

function recordAssistDamage(source, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  mutateCombatStats(source, (stats) => {
    stats.assistDamage += amount;
  });
}

function recordStatus(source, statusKind, amount = 1) {
  mutateCombatStats(source, (stats) => {
    if (!(statusKind in stats)) stats[statusKind] = 0;
    stats[statusKind] += amount;
  });
}

function recordArmorBreak(source) {
  recordStatus(source, "armorBreaks");
}

function recordSpikeDamage(amount) {
  recordDamage("spikes", amount, "spikeDamage");
  recordStatus("spikes", "spikeHits");
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

function recordComboTrigger(source, assistSource = null) {
  recordStatus(source, "comboTriggers");
  if (assistSource) recordStatus(assistSource, "assistTriggers");
}

function mutateCombatStats(source, mutate) {
  if (!state.combatStats || !source) return;
  ensureCombatSource(source);
  mutate(state.combatStats.wave[source]);
  mutate(state.combatStats.battle[source]);
  state.combatStats.dirty = true;
  refreshCombatDebug();
}

function ensureCombatSource(source) {
  if (!state.combatStats.wave[source]) state.combatStats.wave[source] = createSourceStats();
  if (!state.combatStats.battle[source]) state.combatStats.battle[source] = createSourceStats();
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

    const target = findTarget(hero, config.range, now);
    if (!target) continue;

    const level = state.heroLevels[hero.kind];
    hero.cooldownLeft = config.cooldown / heroAttackSpeed(hero.kind) / (1 + (level - 1) * 0.06);
    recordShot(hero.kind);

    if (hero.kind === "storm" && state.temp.stormPierce > 0) {
      castStormPierce(hero, target, level, now);
      continue;
    }

    state.projectiles.push({
      kind: hero.kind,
      x: hero.x,
      y: hero.y - 10,
      target,
      speed: config.projectileSpeed,
      color: config.color,
      radius: hero.kind === "storm" || hero.kind === "archer" ? 4 : 5
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
    }
  } else {
    makeHit(target.x, target.y, "#ffffff", 18);
    return;
  }

  if (kind === "fire") {
    target.burnUntil = now + config.dotTime * state.temp.fireDotTime * 1000;
    target.burnDps = (config.dotDamage * damageScale) / config.dotTime;
    target.burnSource = "fire";
    target.burnCategory = "burnDamage";
    recordStatus("fire", "burnsApplied");
    spreadFire(target, now, damageScale);
    spreadPoisonFromFire(target, now, damageScale);
  }

  if (kind === "ice") {
    freezeEnemy(target, now);
    splashIce(target, now, damageScale);
  }

  if (kind === "storm") {
    markStormForArcher(target, now);
    chainStorm(target, now, damageScale, source);
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
  recordMiss(projectile.kind);
  if (projectile.kind === "fire" && projectile.evasiveNearMiss && state.enemies.includes(target)) {
    recordNearMiss("fire");
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
}

function poisonEnemy(enemy, now, damageScale) {
  const poisonTime = heroConfig.poison.poisonTime * state.temp.poisonDuration;
  enemy.poisonUntil = now + poisonTime * 1000;
  enemy.poisonDps = (heroConfig.poison.poisonDamage * damageScale * state.temp.poisonDamage) / heroConfig.poison.poisonTime;
  enemy.poisonSource = "poison";
  enemy.poisonCategory = "poisonDamage";
  recordStatus("poison", "poisonApplications");
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
  if (hadActiveArmor) recordArmorBreak("earth");
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
    makeBeam(current, next, heroConfig.storm.color, 0.16, 3);
    hit.add(next);
    current = next;
  }

  if (source) {
    makeBeam({ x: source.x, y: source.y }, origin, heroConfig.storm.color, 0.1, 3);
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
  makeBeam(hero, end, heroConfig.storm.color, 0.16, 3);

  for (const enemy of state.enemies) {
    if (hasImmunity(enemy, "storm")) continue;
    if (Math.abs(enemy.x - target.x) < laneWidth && enemy.y <= hero.y && enemy.y >= -20) {
      hits += 1;
      recordHit("storm");
      recordStatus("storm", "pierceHits");
      applyTrackedDirectDamage(enemy, "storm", heroConfig.storm.damage * damageScale * 0.9, now);
      markStormForArcher(enemy, now);
      makeHit(enemy.x, enemy.y, heroConfig.storm.color, 16);
    }
  }

  if (hits === 0) recordMiss("storm");

  if (state.temp.stormBounces > 0) {
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
    traits.push(`resists ${heroConfig[immunity]?.damageType || immunity}`);
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
  if (!combatDebug || !state.combatStats?.visible) return;
  if (!state.combatStats.dirty && !state.waveActive) return;

  const totalBattleDamage = debugTotalBattleDamage();
  combatDebug.replaceChildren(
    buildDebugSummary(totalBattleDamage),
    buildUpgradeHistory(),
    buildComboStackSummary(),
    buildDebugSourceList(totalBattleDamage)
  );
  state.combatStats.dirty = false;
}

function buildDebugSummary(totalBattleDamage) {
  const section = document.createElement("section");
  section.className = "debug-summary";

  const heading = document.createElement("h2");
  heading.textContent = "Combat Debug";
  section.append(heading);

  const timing = document.createElement("span");
  timing.textContent = `Wave ${formatDebugNumber(state.combatStats.waveDuration)}s active | Battle ${formatDebugNumber(state.combatStats.battleDuration)}s active | Tracked ${formatDebugNumber(totalBattleDamage)} dmg`;
  section.append(timing);

  const manualMode = document.createElement("span");
  manualMode.textContent = `Debug Mode: Manual upgrades ${state.manualUpgradeMode ? "ON" : "OFF"}`;
  section.append(manualMode);

  return section;
}

function buildUpgradeHistory() {
  const section = document.createElement("section");
  section.className = "debug-section debug-upgrades";

  const heading = document.createElement("h2");
  heading.textContent = "Selected upgrades";
  section.append(heading);

  if (!state.combatStats.upgradeHistory.length) {
    const empty = document.createElement("p");
    empty.textContent = "No temporary upgrades selected yet.";
    section.append(empty);
    return section;
  }

  for (const upgrade of state.combatStats.upgradeHistory) {
    const line = document.createElement("span");
    const stackText = upgrade.stack
      ? upgrade.maxStacks === 1 ? " (One-time)" : ` (Stack ${upgrade.stack})`
      : "";
    line.textContent = `Wave ${upgrade.wave}: ${upgrade.title}${stackText}`;
    section.append(line);
  }

  return section;
}

function buildComboStackSummary() {
  const section = document.createElement("section");
  section.className = "debug-section debug-upgrades";

  const heading = document.createElement("h2");
  heading.textContent = "Combo stacks";
  section.append(heading);

  const comboUpgrades = tempUpgradePool.filter((upgrade) => upgrade.stackId && comboStackCount(upgrade.stackId) > 0);
  if (!comboUpgrades.length) {
    const empty = document.createElement("p");
    empty.textContent = "No combo stacks yet.";
    section.append(empty);
    return section;
  }

  for (const upgrade of comboUpgrades) {
    const line = document.createElement("span");
    line.textContent = `${upgrade.title}: ${comboStackCount(upgrade.stackId)} stack${comboStackCount(upgrade.stackId) === 1 ? "" : "s"}`;
    section.append(line);
  }

  return section;
}

function buildDebugSourceList(totalBattleDamage) {
  const section = document.createElement("section");
  section.className = "debug-section debug-source-list";

  const heading = document.createElement("h2");
  heading.textContent = "Sources";
  section.append(heading);

  for (const source of combatStatSources) {
    const waveStats = state.combatStats.wave[source];
    const battleStats = state.combatStats.battle[source];
    if (!debugSourceHasActivity(waveStats) && !debugSourceHasActivity(battleStats)) continue;
    section.append(buildDebugSourceRow(source, waveStats, battleStats, totalBattleDamage));
  }

  if (section.children.length === 1) {
    const empty = document.createElement("p");
    empty.textContent = "No tracked combat yet.";
    section.append(empty);
  }

  return section;
}

function buildDebugSourceRow(source, waveStats, battleStats, totalBattleDamage) {
  const row = document.createElement("div");
  row.className = "debug-row";

  const name = document.createElement("strong");
  name.textContent = debugSourceLabel(source);
  row.append(name);

  const waveDps = state.combatStats.waveDuration > 0 ? waveStats.totalDamage / state.combatStats.waveDuration : 0;
  const battleDps = state.combatStats.battleDuration > 0 ? battleStats.totalDamage / state.combatStats.battleDuration : 0;
  const share = totalBattleDamage > 0 ? (battleStats.totalDamage / totalBattleDamage) * 100 : 0;

  const wave = document.createElement("span");
  wave.textContent = `Wave: ${formatDebugNumber(waveStats.totalDamage)} dmg / ${formatDebugNumber(waveDps)} DPS`;
  row.append(wave);

  const battle = document.createElement("span");
  battle.textContent = `Battle: ${formatDebugNumber(battleStats.totalDamage)} dmg / ${formatDebugNumber(battleDps)} DPS / ${formatDebugNumber(share)}%`;
  row.append(battle);

  const accuracy = document.createElement("span");
  accuracy.textContent = `Shots ${battleStats.shotsFired} Hit ${battleStats.hits} Miss ${battleStats.misses}`;
  row.append(accuracy);

  const waveUtility = document.createElement("small");
  waveUtility.textContent = `Wave: ${debugUtilityText(waveStats)}`;
  row.append(waveUtility);

  const battleUtility = document.createElement("small");
  battleUtility.textContent = `Battle: ${debugUtilityText(battleStats)}`;
  row.append(battleUtility);

  return row;
}

function debugSourceHasActivity(stats) {
  return Boolean(stats) && Object.values(stats).some((value) => value > 0);
}

function debugTotalBattleDamage() {
  return combatStatSources.reduce((total, source) => total + (state.combatStats.battle[source]?.totalDamage || 0), 0);
}

function debugSourceLabel(source) {
  if (heroConfig[source]) {
    return `${heroConfig[source].name} / ${source}`;
  }
  return source === "spikes" ? "Wall Spikes" : "Wall";
}

function debugUtilityText(stats) {
  const parts = [];
  if (stats.directDamage) parts.push(`direct ${formatDebugNumber(stats.directDamage)}`);
  if (stats.burnDamage) parts.push(`burn ${formatDebugNumber(stats.burnDamage)}`);
  if (stats.grazeBurnDamage) parts.push(`graze ${formatDebugNumber(stats.grazeBurnDamage)}`);
  if (stats.poisonDamage) parts.push(`poison ${formatDebugNumber(stats.poisonDamage)}`);
  if (stats.chainDamage) parts.push(`chain ${formatDebugNumber(stats.chainDamage)}`);
  if (stats.comboDamage) parts.push(`combo dmg ${formatDebugNumber(stats.comboDamage)}`);
  if (stats.assistDamage) parts.push(`assist dmg ${formatDebugNumber(stats.assistDamage)}`);
  if (stats.spikeDamage) parts.push(`spikes ${formatDebugNumber(stats.spikeDamage)}`);
  if (stats.armorDamage) parts.push(`armor ${formatDebugNumber(stats.armorDamage)}`);
  if (stats.burnsApplied) parts.push(`burns ${stats.burnsApplied}`);
  if (stats.grazeBurnsApplied) parts.push(`graze burns ${stats.grazeBurnsApplied}`);
  if (stats.nearMisses) parts.push(`near misses ${stats.nearMisses}`);
  if (stats.freezesApplied) parts.push(`freezes ${stats.freezesApplied}`);
  if (stats.slowsApplied) parts.push(`slows ${stats.slowsApplied}`);
  if (stats.slowTimeApplied) parts.push(`slow ${formatDebugNumber(stats.slowTimeApplied)}s`);
  if (stats.poisonApplications) parts.push(`poisons ${stats.poisonApplications}`);
  if (stats.armorBreaks) parts.push(`breaks ${stats.armorBreaks}`);
  if (stats.stunsApplied) parts.push(`stuns ${stats.stunsApplied}`);
  if (stats.pierceHits) parts.push(`pierce ${stats.pierceHits}`);
  if (stats.spikeHits) parts.push(`spike hits ${stats.spikeHits}`);
  if (stats.comboTriggers) parts.push(`combo ${stats.comboTriggers}`);
  if (stats.comboTargets) parts.push(`combo targets ${stats.comboTargets}`);
  if (stats.assistTriggers) parts.push(`assist ${stats.assistTriggers}`);
  if (stats.comboControlTime) parts.push(`combo ctrl ${formatDebugNumber(stats.comboControlTime)}s`);
  if (stats.assistControlTime) parts.push(`assist ctrl ${formatDebugNumber(stats.assistControlTime)}s`);
  return parts.join(" | ") || "utility none";
}

function formatDebugNumber(value) {
  return value >= 10 ? String(Math.round(value)) : value.toFixed(1);
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
    ctx.fillText(config.shortLabel || config.label[0], hero.x, hero.y);

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
  const config = heroConfig[mainHero.kind];

  ctx.fillStyle = "rgba(245, 240, 230, 0.58)";
  ctx.font = "800 9px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PARTY", state.width * 0.2, y);
  ctx.fillText("PARTY", state.width * 0.8, y);
  ctx.fillText(config.name.toUpperCase(), mainHero.x, y - 5);
  ctx.font = "800 7px system-ui";
  ctx.fillText(`${config.role.toUpperCase()} / ${config.damageType.toUpperCase()}`, mainHero.x, y + 6);
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
    ctx.fillText(heroConfig[immunity]?.shortLabel || immunity[0].toUpperCase(), x, y + 0.4);
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
  addActiveCombatTime(scaledDt);
  updateGame(scaledDt, state.gameTime);
  refreshCombatDebug();
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
updateHud();
updateDebugVisibility();
updateManualUpgradeToggle();
requestAnimationFrame(gameLoop);
