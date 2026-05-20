export function renderCombatDebug({ container, state, tempUpgradePool, combatStatSources, heroConfig, comboStackCount }) {
  if (!container || !state.combatStats?.visible) return;
  if (!state.combatStats.dirty && !state.waveActive) return;

  const totalBattleDamage = debugTotalBattleDamage(state, combatStatSources);
  container.replaceChildren(
    buildDebugSummary(state, totalBattleDamage),
    buildUpgradeHistory(state),
    buildComboStackSummary(tempUpgradePool, comboStackCount),
    buildDebugSourceList(state, combatStatSources, heroConfig, totalBattleDamage)
  );
  state.combatStats.dirty = false;
}

function buildDebugSummary(state, totalBattleDamage) {
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

function buildUpgradeHistory(state) {
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

function buildComboStackSummary(tempUpgradePool, comboStackCount) {
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

function buildDebugSourceList(state, combatStatSources, heroConfig, totalBattleDamage) {
  const section = document.createElement("section");
  section.className = "debug-section debug-source-list";

  const heading = document.createElement("h2");
  heading.textContent = "Sources";
  section.append(heading);

  for (const source of combatStatSources) {
    const waveStats = state.combatStats.wave[source];
    const battleStats = state.combatStats.battle[source];
    if (!debugSourceHasActivity(waveStats) && !debugSourceHasActivity(battleStats)) continue;
    section.append(buildDebugSourceRow(state, heroConfig, source, waveStats, battleStats, totalBattleDamage));
  }

  if (section.children.length === 1) {
    const empty = document.createElement("p");
    empty.textContent = "No tracked combat yet.";
    section.append(empty);
  }

  return section;
}

function buildDebugSourceRow(state, heroConfig, source, waveStats, battleStats, totalBattleDamage) {
  const row = document.createElement("div");
  row.className = "debug-row";

  const name = document.createElement("strong");
  name.textContent = debugSourceLabel(heroConfig, source);
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

function debugTotalBattleDamage(state, combatStatSources) {
  return combatStatSources.reduce((total, source) => total + (state.combatStats.battle[source]?.totalDamage || 0), 0);
}

function debugSourceLabel(heroConfig, source) {
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
