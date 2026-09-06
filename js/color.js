export const HUE_MAX = 360;
export const SATURATION_MIN = 45;
export const SATURATION_MAX = 75;
export const LIGHTNESS_MIN = 35;
export const LIGHTNESS_MAX = 70;
const MIN_HUE_SEPARATION = 20;
const MAX_HUE_ATTEMPTS = 50;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function circularHueDistance(a, b) {
  const diff = Math.abs(a - b) % HUE_MAX;
  return Math.min(diff, HUE_MAX - diff);
}

function minDistanceToExisting(hue, existingHues) {
  return existingHues.length === 0
    ? Infinity
    : Math.min(...existingHues.map((existingHue) => circularHueDistance(hue, existingHue)));
}

export function createRandomHsl(existingHues = []) {
  let bestHue = randomInRange(0, HUE_MAX);
  let bestDistance = minDistanceToExisting(bestHue, existingHues);
  let attempts = 0;

  while (attempts < MAX_HUE_ATTEMPTS && bestDistance < MIN_HUE_SEPARATION) {
    const candidateHue = randomInRange(0, HUE_MAX);
    const candidateDistance = minDistanceToExisting(candidateHue, existingHues);
    if (candidateDistance > bestDistance) {
      bestHue = candidateHue;
      bestDistance = candidateDistance;
    }
    attempts += 1;
  }

  return {
    hue: Math.round(bestHue),
    saturation: Math.round(randomInRange(SATURATION_MIN, SATURATION_MAX)),
    lightness: Math.round(randomInRange(LIGHTNESS_MIN, LIGHTNESS_MAX)),
  };
}

function hueToRgbChannel(p, q, hueFraction) {
  let t = hueFraction;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb({ hue, saturation, lightness }) {
  const h = hue / HUE_MAX;
  const s = saturation / 100;
  const l = lightness / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgbChannel(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgbChannel(p, q, h) * 255),
    b: Math.round(hueToRgbChannel(p, q, h - 1 / 3) * 255),
  };
}

function channelToHex(channel) {
  return channel.toString(16).padStart(2, '0').toUpperCase();
}

export function rgbToHex({ r, g, b }) {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

export function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}

export function hslToCss({ hue, saturation, lightness }) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getPrimaryCode(hsl, hex, format) {
  return format === 'hsl' ? hslToCss(hsl) : hex;
}

function channelToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance({ r, g, b }) {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function getContrastRatio(rgbA, rgbB) {
  const luminanceA = getRelativeLuminance(rgbA);
  const luminanceB = getRelativeLuminance(rgbB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextColor(rgb) {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const contrastWithWhite = getContrastRatio(rgb, white);
  const contrastWithBlack = getContrastRatio(rgb, black);

  return contrastWithWhite >= contrastWithBlack
    ? { hex: '#FFFFFF', contrastRatio: contrastWithWhite }
    : { hex: '#000000', contrastRatio: contrastWithBlack };
}
