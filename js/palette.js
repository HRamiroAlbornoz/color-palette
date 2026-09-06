import { createRandomHsl } from './color.js';

export const PALETTE_SIZES = [6, 8, 9];

export function createPalette(size) {
  return resizePalette([], size);
}

function createUnlockedColor(existingHues) {
  return { ...createRandomHsl(existingHues), locked: false };
}

function generateNonClashingColors(count, anchorHues) {
  const usedHues = [...anchorHues];
  return Array.from({ length: count }, () => {
    const newColor = createUnlockedColor(usedHues);
    usedHues.push(newColor.hue);
    return newColor;
  });
}

export function resizePalette(colors, newSize) {
  if (newSize <= colors.length) {
    return colors.slice(0, newSize);
  }

  const anchorHues = colors.map((color) => color.hue);
  return [...colors, ...generateNonClashingColors(newSize - colors.length, anchorHues)];
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
  const lockedHues = colors.filter((color) => color.locked).map((color) => color.hue);
  const unlockedCount = colors.filter((color) => !color.locked).length;
  const replacements = generateNonClashingColors(unlockedCount, lockedHues);

  let nextReplacementIndex = 0;
  return colors.map((color) => {
    if (color.locked) {
      return color;
    }
    return replacements[nextReplacementIndex++];
  });
}
