import { describe, expect, it } from 'vitest';
import {
  PALETTE_SIZES,
  createPalette,
  regeneratePalette,
  resizePalette,
  toggleLock,
} from '../js/palette.js';

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

  it('creates colors that start unlocked', () => {
    const colors = createPalette(6);

    colors.forEach((color) => expect(color.locked).toBe(false));
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

describe('toggleLock', () => {
  it('flips the locked state of only the targeted color', () => {
    const original = createPalette(6);

    const toggled = toggleLock(original, 2);

    expect(toggled[2].locked).toBe(true);
    toggled.forEach((color, i) => {
      if (i !== 2) expect(color.locked).toBe(original[i].locked);
    });
  });

  it('toggles back to unlocked on a second call', () => {
    const lockedOnce = toggleLock(createPalette(6), 0);

    const toggledTwice = toggleLock(lockedOnce, 0);

    expect(toggledTwice[0].locked).toBe(false);
  });
});

describe('regeneratePalette', () => {
  it('keeps every locked color unchanged', () => {
    const original = createPalette(6).map((color, i) => ({ ...color, locked: i % 2 === 0 }));

    const regenerated = regeneratePalette(original);

    original.forEach((color, i) => {
      if (color.locked) expect(regenerated[i]).toEqual(color);
    });
  });

  it('replaces every unlocked color with a new one inside the usable ranges', () => {
    const original = createPalette(6).map((color) => ({ ...color, locked: false }));

    const regenerated = regeneratePalette(original);

    regenerated.forEach((color) => {
      expect(color.locked).toBe(false);
      expect(color.hue).toBeGreaterThanOrEqual(0);
      expect(color.hue).toBeLessThanOrEqual(360);
    });
  });

  it('changes nothing when every color is locked', () => {
    const original = createPalette(6).map((color) => ({ ...color, locked: true }));

    const regenerated = regeneratePalette(original);

    expect(regenerated).toEqual(original);
  });
});
