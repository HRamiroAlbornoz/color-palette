import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, THEME_OPTIONS, THEME_STORAGE_KEY } from '../js/storage.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(currentDir, '..', 'index.html'), 'utf-8');

describe('index.html', () => {
  it('declares the HTML5 doctype', () => {
    expect(indexHtml.trim().toLowerCase()).toMatch(/^<!doctype html>/);
  });

  it('sets a responsive viewport meta tag', () => {
    expect(indexHtml).toMatch(/<meta name="viewport" content="width=device-width/);
  });

  it('declares a page title', () => {
    expect(indexHtml).toMatch(/<title>.+<\/title>/);
  });

  it('embeds its own SVG icon, so the browser never requests a missing favicon.ico', () => {
    expect(indexHtml).toMatch(/<link\s+rel="icon"\s+href="data:image\/svg\+xml,[^"]+"/);
  });

  it('describes the page for search results and link previews', () => {
    const description = indexHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];

    expect(description?.trim().length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('links the design tokens and base stylesheets', () => {
    expect(indexHtml).toMatch(/href="css\/tokens\.css"/);
    expect(indexHtml).toMatch(/href="css\/base\.css"/);
  });

  it('preloads the self-hosted fonts from the same origin', () => {
    expect(indexHtml).toMatch(/rel="preload"\s+href="fonts\/Geist-Variable\.woff2"/);
    expect(indexHtml).toMatch(/rel="preload"\s+href="fonts\/GeistMono-Variable\.woff2"/);
  });

  it('loads nothing from another domain; the only external URL is the GitHub credit link', () => {
    const externalUrls = indexHtml.match(/(?:src|href)="https?:\/\/[^"]+"/g) ?? [];

    expect(externalUrls).toEqual(['href="https://github.com/HRamiroAlbornoz/color-palette"']);
  });

  describe('inline theme script', () => {
    const inlineScript = indexHtml.match(/<script>([\s\S]*?)<\/script>/)[1];

    it('runs before any stylesheet, so the page never paints with the wrong theme', () => {
      expect(indexHtml.indexOf('<script>')).toBeLessThan(indexHtml.indexOf('rel="stylesheet"'));
    });

    it('reads the same storage key that storage.js writes', () => {
      expect(inlineScript).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
    });

    it('only applies the forced themes that storage.js accepts, and never writes', () => {
      const appliedValues = [...inlineScript.matchAll(/=== '(\w+)'/g)].map((match) => match[1]);

      expect(appliedValues).toEqual(THEME_OPTIONS.filter((option) => option !== DEFAULT_THEME));
      expect(inlineScript).not.toContain('setItem');
    });
  });

  it('does not hardcode any radio; size options come from PALETTE_SIZES via renderRadioOptions', () => {
    expect(indexHtml).not.toMatch(/type="radio"/);
  });
});

describe('security headers in vercel.json', () => {
  const vercelConfig = JSON.parse(readFileSync(join(currentDir, '..', 'vercel.json'), 'utf-8'));
  const headersForEveryRoute = Object.fromEntries(
    (vercelConfig.headers ?? [])
      .filter(({ source }) => source === '/(.*)')
      .flatMap(({ headers }) => headers)
      .map(({ key, value }) => [key, value]),
  );
  const contentSecurityPolicy = headersForEveryRoute['Content-Security-Policy'] ?? '';
  const inlineScript = indexHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
  const inlineScriptHash = createHash('sha256').update(inlineScript, 'utf-8').digest('base64');

  it('authorizes the inline theme script by its exact hash, never with unsafe-inline', () => {
    expect(contentSecurityPolicy).toContain(`script-src 'self' 'sha256-${inlineScriptHash}'`);
    expect(contentSecurityPolicy).not.toContain('unsafe-inline');
    expect(contentSecurityPolicy).not.toContain('unsafe-eval');
  });

  it('only lets the page load resources from its own origin', () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).not.toMatch(/https?:/);
  });

  it('forbids embedding the page in another site and guessing content types', () => {
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(headersForEveryRoute['X-Frame-Options']).toBe('DENY');
    expect(headersForEveryRoute['X-Content-Type-Options']).toBe('nosniff');
  });
});
