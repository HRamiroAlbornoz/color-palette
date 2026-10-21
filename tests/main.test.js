import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(currentDir, '..', 'index.html'), 'utf-8');
const indexBody = indexHtml.match(/<body>([\s\S]*)<\/body>/)[1];

async function loadApp() {
  document.body.innerHTML = indexBody;
  delete document.documentElement.dataset.theme;
  vi.resetModules();
  await import('../js/main.js');
}

async function startApp() {
  localStorage.clear();
  await loadApp();
}

function waitForPendingWork() {
  return new Promise((resolve) => setTimeout(resolve));
}

function pressSpaceOnPage() {
  document.activeElement?.blur();
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }),
  );
}

function clickByLabel(label) {
  document.querySelector(`[aria-label="${label}"]`).click();
}

function chooseOption(groupSelector, value) {
  document.querySelector(`${groupSelector} input[value="${value}"]`).click();
}

const generationNumber = () => document.querySelector('#generation-counter').textContent;
const toastMessage = () => document.querySelector('#toast').textContent;
const checkedOption = (groupSelector) =>
  document.querySelector(`${groupSelector} input:checked`).value;

describe('main.js', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates only once when Space is pressed again while a generation is still running', async () => {
    await startApp();

    pressSpaceOnPage();
    pressSpaceOnPage();
    await waitForPendingWork();

    expect(generationNumber()).toBe('2');
  });

  it.each([
    ['the Generar paleta button', () => document.querySelector('#generate-button').click()],
    ['the Space shortcut', pressSpaceOnPage],
  ])('shows the all-locked notice instead of generating, when using %s', async (_, generate) => {
    await startApp();
    document.querySelectorAll('[aria-label="Bloquear color"]').forEach((button) => button.click());

    generate();
    await waitForPendingWork();

    expect(toastMessage()).toBe('Todos los colores están bloqueados: no hay nada para regenerar.');
    expect(generationNumber()).toBe('1');
  });

  it('restores a saved batch with its own size, updating the swatches, contrast panel, CSS block and summary', async () => {
    await startApp();
    chooseOption('#size-options', '8');
    document.querySelector('#save-batch-button').click();
    chooseOption('#size-options', '6');

    clickByLabel('Restaurar lote Nº1');

    expect(checkedOption('#size-options')).toBe('8');
    expect(document.querySelectorAll('#palette-grid > li')).toHaveLength(8);
    expect(document.querySelectorAll('#contrast-list > li')).toHaveLength(8);
    expect(document.querySelector('#css-export-code').textContent.match(/--color-/g)).toHaveLength(
      8,
    );
    expect(document.querySelector('#palette-summary').textContent).toBe('8 colores · 0 bloqueados');
  });

  it('refuses to save a 13th batch and tells the user to delete one first', async () => {
    await startApp();
    const saveButton = document.querySelector('#save-batch-button');
    for (let saved = 0; saved < 12; saved += 1) {
      saveButton.click();
    }

    saveButton.click();

    expect(toastMessage()).toBe(
      'El archivo llegó a su tope de 12 lotes: borrá alguno para guardar uno nuevo.',
    );
    expect(document.querySelectorAll('#archive-list > li')).toHaveLength(12);
  });

  it('remembers a forced theme across reloads, and forgets it when going back to Sistema', async () => {
    await startApp();

    chooseOption('#theme-options', 'dark');
    await loadApp();

    expect(checkedOption('#theme-options')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    chooseOption('#theme-options', 'system');
    await loadApp();

    expect(checkedOption('#theme-options')).toBe('system');
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
