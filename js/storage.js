import { HUE_MAX, LIGHTNESS_MAX, LIGHTNESS_MIN, SATURATION_MAX, SATURATION_MIN } from './color.js';
import { PALETTE_SIZES } from './palette.js';

export const MAX_BATCHES = 12;
const STORAGE_KEY = 'colorfly-palette-archive';

function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

function isNumberInRange(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isValidColor(color) {
  return (
    isRecord(color) &&
    isNumberInRange(color.hue, 0, HUE_MAX) &&
    isNumberInRange(color.saturation, SATURATION_MIN, SATURATION_MAX) &&
    isNumberInRange(color.lightness, LIGHTNESS_MIN, LIGHTNESS_MAX)
  );
}

function isValidBatch(batch) {
  return (
    isRecord(batch) &&
    Number.isInteger(batch.number) &&
    typeof batch.date === 'string' &&
    !Number.isNaN(Date.parse(batch.date)) &&
    Array.isArray(batch.colors) &&
    PALETTE_SIZES.includes(batch.colors.length) &&
    batch.colors.every(isValidColor)
  );
}

function isValidArchiveShape(data) {
  return isRecord(data) && Array.isArray(data.batches);
}

export function loadArchive() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { available: false, batches: [] };
  }

  if (!raw) {
    return { available: true, batches: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    const batches = isValidArchiveShape(parsed) ? parsed.batches.filter(isValidBatch) : [];
    return { available: true, batches };
  } catch {
    return { available: true, batches: [] };
  }
}

export function persistArchive(batches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ batches }));
    return true;
  } catch {
    return false;
  }
}

export function addBatch(batches, colors) {
  if (batches.length >= MAX_BATCHES) {
    return { ok: false, reason: 'full' };
  }

  const nextNumber = batches.reduce((max, batch) => Math.max(max, batch.number), 0) + 1;
  const newBatch = {
    number: nextNumber,
    date: new Date().toISOString(),
    colors: colors.map(({ hue, saturation, lightness }) => ({ hue, saturation, lightness })),
  };

  return { ok: true, batches: [newBatch, ...batches] };
}

export function removeBatch(batches, number) {
  return batches.filter((batch) => batch.number !== number);
}

export function findBatch(batches, number) {
  return batches.find((batch) => batch.number === number);
}
