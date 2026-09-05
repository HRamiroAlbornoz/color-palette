import { createRandomHsl } from './color.js';

export const PALETTE_SIZES = [6, 8, 9];

export function createPalette(size) {
  return resizePalette([], size);
}

export function resizePalette(colors, newSize) {
  if (newSize <= colors.length) {
    return colors.slice(0, newSize);
  }

  const resized = [...colors];
  while (resized.length < newSize) {
    resized.push(createRandomHsl(resized.map((color) => color.hue)));
  }
  return resized;
}
