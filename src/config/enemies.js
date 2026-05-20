export const enemyConfig = {
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
