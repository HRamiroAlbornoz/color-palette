import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from '../js/clipboard.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyToClipboard', () => {
  it('resolves ok when the clipboard API writes successfully', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const result = await copyToClipboard('#4A91D9');

    expect(result).toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith('#4A91D9');
  });

  it('reports an unavailable clipboard when the API does not exist', async () => {
    vi.stubGlobal('navigator', {});

    const result = await copyToClipboard('#4A91D9');

    expect(result).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('reports a denied copy when the API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('not allowed'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const result = await copyToClipboard('#4A91D9');

    expect(result).toEqual({ ok: false, reason: 'denied' });
  });
});
