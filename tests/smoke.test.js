import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

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

  it('links the design tokens and base stylesheets', () => {
    expect(indexHtml).toMatch(/href="css\/tokens\.css"/);
    expect(indexHtml).toMatch(/href="css\/base\.css"/);
  });
});
