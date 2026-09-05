import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createRandomHsl,
  getContrastRatio,
  getReadableTextColor,
  hslToHex,
  hslToRgb,
  rgbToHex,
} from '../js/color.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createRandomHsl', () => {
  it('returns a hue between 0 and 360', () => {
    for (let i = 0; i < 50; i += 1) {
      const { hue } = createRandomHsl();
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(360);
    }
  });

  it('returns saturation within the usable range', () => {
    for (let i = 0; i < 50; i += 1) {
      const { saturation } = createRandomHsl();
      expect(saturation).toBeGreaterThanOrEqual(45);
      expect(saturation).toBeLessThanOrEqual(75);
    }
  });

  it('returns lightness within the usable range', () => {
    for (let i = 0; i < 50; i += 1) {
      const { lightness } = createRandomHsl();
      expect(lightness).toBeGreaterThanOrEqual(35);
      expect(lightness).toBeLessThanOrEqual(70);
    }
  });

  it('retries a hue that is too close to an existing one', () => {
    const draws = [0.05, 0.5];
    let callIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => draws[callIndex++ % draws.length]);

    const { hue } = createRandomHsl([10]);

    expect(hue).toBe(180);
  });

  it('accepts the best candidate once the retry budget is exhausted', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { hue } = createRandomHsl([0]);

    expect(hue).toBe(0);
  });
});

describe('hslToRgb and hslToHex', () => {
  it('converts pure red', () => {
    const hsl = { hue: 0, saturation: 100, lightness: 50 };
    expect(hslToRgb(hsl)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToHex(hsl)).toBe('#FF0000');
  });

  it('converts pure green', () => {
    expect(hslToHex({ hue: 120, saturation: 100, lightness: 50 })).toBe('#00FF00');
  });

  it('converts pure blue', () => {
    expect(hslToHex({ hue: 240, saturation: 100, lightness: 50 })).toBe('#0000FF');
  });

  it('converts a fully desaturated color to gray', () => {
    expect(hslToHex({ hue: 0, saturation: 0, lightness: 50 })).toBe('#808080');
  });
});

describe('rgbToHex', () => {
  it('formats each channel as two uppercase hex digits', () => {
    expect(rgbToHex({ r: 74, g: 145, b: 217 })).toBe('#4A91D9');
  });

  it('pads single-digit channels with a leading zero', () => {
    expect(rgbToHex({ r: 0, g: 5, b: 255 })).toBe('#0005FF');
  });
});

describe('getContrastRatio', () => {
  it('returns 21:1 for black against white', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(getContrastRatio(black, white)).toBeCloseTo(21, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { r: 74, g: 145, b: 217 };
    const b = { r: 255, g: 255, b: 255 };
    expect(getContrastRatio(a, b)).toBeCloseTo(getContrastRatio(b, a), 10);
  });
});

describe('getReadableTextColor', () => {
  it('picks black text on a white background', () => {
    const result = getReadableTextColor({ r: 255, g: 255, b: 255 });
    expect(result.hex).toBe('#000000');
    expect(result.contrastRatio).toBeCloseTo(21, 5);
  });

  it('picks white text on a black background', () => {
    const result = getReadableTextColor({ r: 0, g: 0, b: 0 });
    expect(result.hex).toBe('#FFFFFF');
    expect(result.contrastRatio).toBeCloseTo(21, 5);
  });
});
