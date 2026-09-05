import { describe, expect, it } from 'vitest';
import { PALETTE_SIZES, createPalette, resizePalette } from '../js/palette.js';

describe('createPalette', () => {
  it('creates exactly the requested number of colors for every allowed size', () => {
    for (const size of PALETTE_SIZES) {
      expect(createPalette(size)).toHaveLength(size);
    }
  });

  it('creates colors within the usable HSL ranges', () => {
    const colors = createPalette(9);

    for (const { hue, saturation, lightness } of colors) {
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(360);
      expect(saturation).toBeGreaterThanOrEqual(45);
      expect(saturation).toBeLessThanOrEqual(75);
      expect(lightness).toBeGreaterThanOrEqual(35);
      expect(lightness).toBeLessThanOrEqual(70);
    }
  });
});

describe('resizePalette', () => {
  it('keeps the first colors unchanged when shrinking', () => {
    const original = createPalette(9);

    const resized = resizePalette(original, 6);

    expect(resized).toHaveLength(6);
    expect(resized).toEqual(original.slice(0, 6));
  });

  it('keeps every existing color unchanged when growing', () => {
    const original = createPalette(6);

    const resized = resizePalette(original, 9);

    expect(resized).toHaveLength(9);
    expect(resized.slice(0, 6)).toEqual(original);
  });

  it('returns the same colors when the size does not change', () => {
    const original = createPalette(8);

    const resized = resizePalette(original, 8);

    expect(resized).toEqual(original);
  });
});
