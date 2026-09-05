import { createRandomHsl } from './color.js';

export const PALETTE_SIZES = [6, 8, 9];

export function createPalette(size) {
  return resizePalette([], size);
}

function createUnlockedColor(existingHues) {
  return { ...createRandomHsl(existingHues), locked: false };
}

export function resizePalette(colors, newSize) {
  if (newSize <= colors.length) {
    return colors.slice(0, newSize);
  }

  const resized = [...colors];
  const usedHues = resized.map((color) => color.hue);
  while (resized.length < newSize) {
    const newColor = createUnlockedColor(usedHues);
    usedHues.push(newColor.hue);
    resized.push(newColor);
  }
  return resized;
}

export function toggleLock(colors, index) {
  return colors.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color));
}

export function isFullyLocked(colors) {
  return colors.every((color) => color.locked);
}

export function unlockAll(colors) {
  return colors.map((color) => ({ ...color, locked: false }));
}

export function regeneratePalette(colors) {
  const usedHues = colors.filter((color) => color.locked).map((color) => color.hue);
  const regenerated = [];

  for (const color of colors) {
    if (color.locked) {
      regenerated.push(color);
      continue;
    }

    const newColor = createUnlockedColor(usedHues);
    usedHues.push(newColor.hue);
    regenerated.push(newColor);
  }

  return regenerated;
}
