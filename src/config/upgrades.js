export function createTempUpgradePool(state, addComboStack) {
  return [
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
}
