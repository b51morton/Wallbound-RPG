import { withAlpha } from '../utils/colors.js';

let ctx;
let state;
let heroConfig;
let enemyImmunities = () => [];
let hasActiveArmor = () => false;

export function drawGame(renderCtx, renderState, renderHeroConfig, now, helpers = {}) {
  ctx = renderCtx;
  state = renderState;
  heroConfig = renderHeroConfig;
  enemyImmunities = helpers.enemyImmunities || (() => []);
  hasActiveArmor = helpers.hasActiveArmor || (() => false);
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
