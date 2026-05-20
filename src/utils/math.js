export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

export function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
