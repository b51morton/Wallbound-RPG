export function createCombatStats(combatStatSources) {
  return {
    visible: false,
    battleDuration: 0,
    waveDuration: 0,
    upgradeHistory: [],
    dirty: true,
    battle: createCombatStatBucket(combatStatSources),
    wave: createCombatStatBucket(combatStatSources)
  };
}

export function createCombatStatBucket(combatStatSources) {
  return Object.fromEntries(combatStatSources.map((source) => [source, createSourceStats()]));
}

export function createSourceStats() {
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

export function resetCombatBattleStats(state, combatStatSources) {
  const visible = state.combatStats?.visible || false;
  state.combatStats = createCombatStats(combatStatSources);
  state.combatStats.visible = visible;
}

export function resetCombatWaveStats(state, combatStatSources, onDirty) {
  state.combatStats.wave = createCombatStatBucket(combatStatSources);
  state.combatStats.waveDuration = 0;
  markCombatStatsDirty(state, onDirty);
}

export function addActiveCombatTime(state, dt) {
  const stats = state.combatStats;
  if (!stats || !state.waveActive) return;
  stats.waveDuration += dt;
  stats.battleDuration += dt;
  stats.dirty = true;
}

export function recordUpgradeChoice(state, waveNumber, upgrade, comboStackCount, onDirty) {
  if (!state.combatStats) return;
  state.combatStats.upgradeHistory.push({
    wave: waveNumber,
    title: upgrade.title,
    stack: upgrade.stackId ? comboStackCount(upgrade.stackId) : null,
    maxStacks: upgrade.maxStacks || null
  });
  markCombatStatsDirty(state, onDirty);
}

export function recordShot(state, combatStatSources, source, onDirty) {
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    stats.shotsFired += 1;
  }, onDirty);
}

export function recordHit(state, combatStatSources, source, onDirty) {
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    stats.hits += 1;
  }, onDirty);
}

export function recordMiss(state, combatStatSources, source, onDirty) {
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    stats.misses += 1;
  }, onDirty);
}

export function recordNearMiss(state, combatStatSources, source, onDirty) {
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    stats.nearMisses += 1;
  }, onDirty);
}

export function recordDamage(state, combatStatSources, source, amount, category = "directDamage", onDirty) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    if (!(category in stats)) stats[category] = 0;
    stats[category] += amount;
    stats.totalDamage += amount;
  }, onDirty);
}

export function recordAssistDamage(state, combatStatSources, source, amount, onDirty) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    stats.assistDamage += amount;
  }, onDirty);
}

export function recordStatus(state, combatStatSources, source, statusKind, amount = 1, onDirty) {
  mutateCombatStats(state, combatStatSources, source, (stats) => {
    if (!(statusKind in stats)) stats[statusKind] = 0;
    stats[statusKind] += amount;
  }, onDirty);
}

export function recordArmorBreak(state, combatStatSources, source, onDirty) {
  recordStatus(state, combatStatSources, source, "armorBreaks", 1, onDirty);
}

export function recordSpikeDamage(state, combatStatSources, amount, onDirty) {
  recordDamage(state, combatStatSources, "spikes", amount, "spikeDamage", onDirty);
  recordStatus(state, combatStatSources, "spikes", "spikeHits", 1, onDirty);
}

export function recordComboTrigger(state, combatStatSources, source, assistSource = null, onDirty) {
  recordStatus(state, combatStatSources, source, "comboTriggers", 1, onDirty);
  if (assistSource) recordStatus(state, combatStatSources, assistSource, "assistTriggers", 1, onDirty);
}

function mutateCombatStats(state, combatStatSources, source, mutate, onDirty) {
  if (!state.combatStats || !source) return;
  ensureCombatSource(state, combatStatSources, source);
  mutate(state.combatStats.wave[source]);
  mutate(state.combatStats.battle[source]);
  markCombatStatsDirty(state, onDirty);
}

function ensureCombatSource(state, combatStatSources, source) {
  if (!state.combatStats.wave[source]) state.combatStats.wave[source] = createSourceStats();
  if (!state.combatStats.battle[source]) state.combatStats.battle[source] = createSourceStats();
}

function markCombatStatsDirty(state, onDirty) {
  if (!state.combatStats) return;
  state.combatStats.dirty = true;
  if (onDirty) onDirty();
}
