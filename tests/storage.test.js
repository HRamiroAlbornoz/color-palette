import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_BATCHES,
  addBatch,
  findBatch,
  loadArchive,
  persistArchive,
  removeBatch,
} from '../js/storage.js';

const validColor = { hue: 210, saturation: 65, lightness: 57 };

function makeColors(size) {
  return Array.from({ length: size }, () => ({ ...validColor }));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadArchive', () => {
  it('returns an empty, available archive when nothing was ever saved', () => {
    expect(loadArchive()).toEqual({ available: true, batches: [] });
  });

  it('returns the previously persisted batches', () => {
    const batches = [{ number: 1, date: new Date().toISOString(), colors: makeColors(6) }];
    persistArchive(batches);

    expect(loadArchive()).toEqual({ available: true, batches });
  });

  it('starts empty instead of breaking when the stored value is not valid JSON', () => {
    localStorage.setItem('colorfly-palette-archive', '{not json');

    expect(loadArchive()).toEqual({ available: true, batches: [] });
  });

  it('starts empty instead of breaking when a batch is missing required fields', () => {
    localStorage.setItem(
      'colorfly-palette-archive',
      JSON.stringify({ batches: [{ colors: makeColors(6) }] }),
    );

    expect(loadArchive()).toEqual({ available: true, batches: [] });
  });

  it('starts empty instead of breaking when a color is outside the usable ranges', () => {
    const corruptColors = [{ hue: 999, saturation: 65, lightness: 57 }, ...makeColors(5)];
    localStorage.setItem(
      'colorfly-palette-archive',
      JSON.stringify({
        batches: [{ number: 1, date: new Date().toISOString(), colors: corruptColors }],
      }),
    );

    expect(loadArchive()).toEqual({ available: true, batches: [] });
  });

  it('starts empty instead of breaking when the palette size is not an allowed one', () => {
    localStorage.setItem(
      'colorfly-palette-archive',
      JSON.stringify({
        batches: [{ number: 1, date: new Date().toISOString(), colors: makeColors(7) }],
      }),
    );

    expect(loadArchive()).toEqual({ available: true, batches: [] });
  });

  it('reports the archive as unavailable when localStorage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    expect(loadArchive()).toEqual({ available: false, batches: [] });
  });
});

describe('persistArchive', () => {
  it('writes the batches so a later load reads them back', () => {
    const batches = [{ number: 1, date: new Date().toISOString(), colors: makeColors(8) }];

    const result = persistArchive(batches);

    expect(result).toBe(true);
    expect(loadArchive().batches).toEqual(batches);
  });

  it('reports failure instead of throwing when the write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(persistArchive([])).toBe(false);
  });
});

describe('addBatch', () => {
  it('adds a new batch at the front, stripped of any lock state', () => {
    const colors = makeColors(6).map((color) => ({ ...color, locked: true }));

    const result = addBatch([], colors);

    expect(result.ok).toBe(true);
    expect(result.batches).toHaveLength(1);
    expect(result.batches[0].number).toBe(1);
    expect(result.batches[0].colors).toEqual(makeColors(6));
    expect(result.batches[0].colors[0].locked).toBeUndefined();
  });

  it('numbers each new batch above the highest existing number, never reusing one', () => {
    const existing = [{ number: 3, date: new Date().toISOString(), colors: makeColors(6) }];

    const result = addBatch(existing, makeColors(6));

    expect(result.batches[0].number).toBe(4);
  });

  it('refuses to add past the maximum number of batches', () => {
    const fullArchive = Array.from({ length: MAX_BATCHES }, (_, i) => ({
      number: i + 1,
      date: new Date().toISOString(),
      colors: makeColors(6),
    }));

    const result = addBatch(fullArchive, makeColors(6));

    expect(result).toEqual({ ok: false, reason: 'full' });
  });
});

describe('removeBatch', () => {
  it('removes only the batch with the matching number', () => {
    const batches = [
      { number: 1, date: new Date().toISOString(), colors: makeColors(6) },
      { number: 2, date: new Date().toISOString(), colors: makeColors(8) },
    ];

    const result = removeBatch(batches, 1);

    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(2);
  });
});

describe('findBatch', () => {
  it('returns the batch with the matching number', () => {
    const batches = [
      { number: 1, date: new Date().toISOString(), colors: makeColors(6) },
      { number: 2, date: new Date().toISOString(), colors: makeColors(8) },
    ];

    expect(findBatch(batches, 2)).toBe(batches[1]);
  });

  it('returns undefined when no batch matches', () => {
    expect(findBatch([], 1)).toBeUndefined();
  });
});
