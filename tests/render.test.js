import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  describePalette,
  focusBatchButton,
  focusFirstSwatch,
  markExitingSwatches,
  renderArchive,
  renderContrastPanel,
  renderPalette,
  renderRadioOptions,
  renderTopbarMeta,
  waitForSwatchesToExit,
} from '../js/render.js';

describe('renderPalette', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('ul');
  });

  it('renders one list item per color', () => {
    const colors = [
      { hue: 210, saturation: 65, lightness: 57, locked: false },
      { hue: 30, saturation: 60, lightness: 50, locked: false },
    ];

    renderPalette(container, colors, 'hex');

    expect(container.children).toHaveLength(2);
  });

  it('shows the exact HEX code matching the swatch background color', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    const swatch = container.firstElementChild;
    expect(swatch.querySelector('.swatch-code').textContent).toBe('#4A91D9');
    expect(swatch.style.backgroundColor).toBe('rgb(74, 145, 217)');
  });

  it('keeps the copy button free of block content, with the code and data as its siblings', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    const colorButton = container.querySelector('.swatch-color');
    expect(colorButton.children).toHaveLength(0);
    expect(colorButton.parentElement.querySelector('.swatch-code')).not.toBeNull();
  });

  it('hides the visible code from assistive tech, which already gets it from the button label', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    expect(container.querySelector('.swatch-details').getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.swatch-color').getAttribute('aria-label')).toBe(
      'Copiar #4A91D9',
    );
  });

  it('exposes the HSL/contrast data to assistive tech via aria-describedby, since aria-label hides it', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    const colorButton = container.querySelector('.swatch-color');
    const describedById = colorButton.getAttribute('aria-describedby');
    const describedByElement = container.querySelector(`#${describedById}`);

    expect(describedByElement).toBe(container.querySelector('.swatch-data'));
  });

  it('shows the HSL triplet and a contrast ratio', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    const swatch = container.firstElementChild;
    expect(swatch.textContent).toContain('210 65 57');
    expect(swatch.textContent).toMatch(/\d+(\.\d)?:1/);
  });

  it('marks the grid with its color count, so CSS can lay the band out in one or two rows', () => {
    renderPalette(
      container,
      [
        { hue: 0, saturation: 50, lightness: 50, locked: false },
        { hue: 180, saturation: 50, lightness: 50, locked: false },
      ],
      'hex',
    );

    expect(container.dataset.count).toBe('2');
  });

  it('replaces previous content on re-render instead of appending', () => {
    renderPalette(container, [{ hue: 0, saturation: 50, lightness: 50, locked: false }], 'hex');
    renderPalette(
      container,
      [
        { hue: 0, saturation: 50, lightness: 50, locked: false },
        { hue: 180, saturation: 50, lightness: 50, locked: false },
      ],
      'hex',
    );

    expect(container.children).toHaveLength(2);
  });

  it('renders the color area as a button reachable by keyboard', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57, locked: false }], 'hex');

    const colorButton = container.querySelector('.swatch-color');
    expect(colorButton.tagName).toBe('BUTTON');
    expect(colorButton.type).toBe('button');
  });

  it('invokes the click callback with the primary code shown on the swatch', () => {
    const onSwatchClick = vi.fn();
    renderPalette(
      container,
      [{ hue: 210, saturation: 65, lightness: 57, locked: false }],
      'hex',
      onSwatchClick,
    );

    container.querySelector('.swatch-color').click();

    expect(onSwatchClick).toHaveBeenCalledWith('#4A91D9');
  });

  describe('entrance animation', () => {
    const colors = [
      { hue: 210, saturation: 65, lightness: 57, locked: false },
      { hue: 30, saturation: 60, lightness: 50, locked: true },
      { hue: 90, saturation: 55, lightness: 45, locked: false },
    ];

    it('does not animate any swatch when entrance animation is not requested', () => {
      renderPalette(container, colors, 'hex');

      expect(container.querySelectorAll('.swatch--entering')).toHaveLength(0);
    });

    it('animates only the unlocked swatches when entrance animation is requested', () => {
      const animateEntrance = true;
      renderPalette(
        container,
        colors,
        'hex',
        () => {},
        () => {},
        animateEntrance,
      );

      const swatches = container.querySelectorAll('.swatch');
      expect(swatches[0].classList.contains('swatch--entering')).toBe(true);
      expect(swatches[1].classList.contains('swatch--entering')).toBe(false);
      expect(swatches[2].classList.contains('swatch--entering')).toBe(true);
    });

    it('staggers the animation delay by swatch index', () => {
      const animateEntrance = true;
      renderPalette(
        container,
        colors,
        'hex',
        () => {},
        () => {},
        animateEntrance,
      );

      const swatches = container.querySelectorAll('.swatch');
      expect(swatches[0].style.animationDelay).toBe('0ms');
      expect(swatches[2].style.animationDelay).toBe('80ms');
    });
  });

  describe('lock button', () => {
    const colors = [
      { hue: 210, saturation: 65, lightness: 57, locked: false },
      { hue: 30, saturation: 60, lightness: 50, locked: true },
    ];

    it('renders it as a sibling of the color button, never nested inside it', () => {
      renderPalette(container, colors, 'hex');

      const swatch = container.firstElementChild;
      expect(swatch.querySelector('.swatch-color .lock-button')).toBeNull();
      expect(swatch.querySelector(':scope > .lock-button')).not.toBeNull();
    });

    it('draws a closed, filled padlock when locked and an open outlined one when unlocked', () => {
      renderPalette(container, colors, 'hex');

      const [unlockedIcon, lockedIcon] = container.querySelectorAll('.lock-button svg');
      expect(unlockedIcon.querySelector('rect').getAttribute('fill')).toBe('none');
      expect(lockedIcon.querySelector('rect').getAttribute('fill')).toBe('currentColor');
      expect(unlockedIcon.querySelector('path').getAttribute('d')).not.toBe(
        lockedIcon.querySelector('path').getAttribute('d'),
      );
    });

    it('exposes the locked state through aria-pressed', () => {
      renderPalette(container, colors, 'hex');

      const lockButtons = container.querySelectorAll('.lock-button');
      expect(lockButtons[0].getAttribute('aria-pressed')).toBe('false');
      expect(lockButtons[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('changes the accessible label depending on the locked state', () => {
      renderPalette(container, colors, 'hex');

      const lockButtons = container.querySelectorAll('.lock-button');
      expect(lockButtons[0].getAttribute('aria-label')).toBe('Bloquear color');
      expect(lockButtons[1].getAttribute('aria-label')).toBe('Desbloquear color');
    });

    it('invokes the lock toggle callback with the index of the clicked swatch', () => {
      const onLockToggle = vi.fn();
      renderPalette(container, colors, 'hex', () => {}, onLockToggle);

      container.querySelectorAll('.lock-button')[1].click();

      expect(onLockToggle).toHaveBeenCalledWith(1);
    });
  });

  describe('format', () => {
    const hsl = { hue: 210, saturation: 65, lightness: 57, locked: false };

    it('shows the HEX code as the primary text in hex format', () => {
      renderPalette(container, [hsl], 'hex');

      const swatch = container.firstElementChild;
      expect(swatch.querySelector('.swatch-code').textContent).toBe('#4A91D9');
    });

    it('keeps the HEX code visible as secondary data in hsl format', () => {
      renderPalette(container, [hsl], 'hsl');

      const swatch = container.firstElementChild;
      expect(swatch.textContent).toContain('#4A91D9');
    });

    it('shows the HSL code as the primary text in hsl format', () => {
      renderPalette(container, [hsl], 'hsl');

      const swatch = container.firstElementChild;
      expect(swatch.querySelector('.swatch-code').textContent).toBe('hsl(210, 65%, 57%)');
    });
  });
});

describe('renderArchive', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('ul');
  });

  it('shows an explanatory message when localStorage is not available', () => {
    renderArchive(container, { available: false, batches: [] });

    expect(container.textContent).toContain('En este navegador no se puede guardar');
  });

  it('shows an explanatory empty state when there are no saved batches yet', () => {
    renderArchive(container, { available: true, batches: [] });

    expect(container.textContent).toContain('Guardá tu primera paleta');
  });

  it('renders one entry per batch with its number, date and color thumbnails', () => {
    const batches = [
      {
        number: 3,
        date: '2026-09-05T12:00:00.000Z',
        colors: [
          { hue: 210, saturation: 65, lightness: 57 },
          { hue: 30, saturation: 60, lightness: 50 },
        ],
      },
    ];

    renderArchive(container, { available: true, batches });

    const entry = container.querySelector('.batch-entry');
    expect(entry.textContent).toContain('Lote Nº3');
    expect(entry.querySelectorAll('.batch-thumbnail')).toHaveLength(2);
  });

  it('invokes the restore callback with the clicked batch number', () => {
    const onRestore = vi.fn();
    const batches = [{ number: 5, date: new Date().toISOString(), colors: [] }];

    renderArchive(container, { available: true, batches }, { onRestore });

    container.querySelector('.batch-restore').click();

    expect(onRestore).toHaveBeenCalledWith(5);
  });

  it('gives each restore/delete button an accessible name naming its own batch', () => {
    const batches = [
      { number: 5, date: new Date().toISOString(), colors: [] },
      { number: 6, date: new Date().toISOString(), colors: [] },
    ];

    renderArchive(container, { available: true, batches });

    const restoreButtons = container.querySelectorAll('.batch-restore');
    const deleteButtons = container.querySelectorAll('.batch-delete');
    expect(restoreButtons[0].getAttribute('aria-label')).toBe('Restaurar lote Nº5');
    expect(restoreButtons[1].getAttribute('aria-label')).toBe('Restaurar lote Nº6');
    expect(deleteButtons[0].getAttribute('aria-label')).toBe('Borrar lote Nº5');
    expect(deleteButtons[1].getAttribute('aria-label')).toBe('Borrar lote Nº6');
  });

  describe('delete confirmation', () => {
    it('requests confirmation instead of deleting immediately when Borrar is clicked', () => {
      const onRequestDelete = vi.fn();
      const batches = [{ number: 5, date: new Date().toISOString(), colors: [] }];

      renderArchive(container, { available: true, batches }, { onRequestDelete });

      container.querySelector('.batch-delete').click();

      expect(onRequestDelete).toHaveBeenCalledWith(5);
    });

    it('shows an in-place confirmation naming the batch when it matches confirmingNumber', () => {
      const batches = [
        { number: 5, date: '2026-09-05T12:00:00.000Z', colors: [] },
        { number: 6, date: new Date().toISOString(), colors: [] },
      ];

      renderArchive(container, { available: true, batches }, { confirmingNumber: 5 });

      const entries = container.querySelectorAll('.batch-entry');
      expect(entries[0].textContent).toContain('¿Borrar el Lote Nº5');
      expect(entries[0].querySelector('.batch-restore')).toBeNull();
      expect(entries[1].querySelector('.batch-confirm')).toBeNull();
    });

    it('invokes onConfirmDelete with the batch number when Confirmar is clicked', () => {
      const onConfirmDelete = vi.fn();
      const batches = [{ number: 5, date: new Date().toISOString(), colors: [] }];

      renderArchive(
        container,
        { available: true, batches },
        { confirmingNumber: 5, onConfirmDelete },
      );

      container.querySelector('.batch-confirm').click();

      expect(onConfirmDelete).toHaveBeenCalledWith(5);
    });

    it('invokes onCancelDelete when Cancelar is clicked', () => {
      const onCancelDelete = vi.fn();
      const batches = [{ number: 5, date: new Date().toISOString(), colors: [] }];

      renderArchive(
        container,
        { available: true, batches },
        { confirmingNumber: 5, onCancelDelete },
      );

      container.querySelector('.batch-cancel').click();

      expect(onCancelDelete).toHaveBeenCalled();
    });

    it('gives Confirmar/Cancelar an accessible name naming the batch being deleted', () => {
      const batches = [{ number: 5, date: new Date().toISOString(), colors: [] }];

      renderArchive(container, { available: true, batches }, { confirmingNumber: 5 });

      expect(container.querySelector('.batch-confirm').getAttribute('aria-label')).toBe(
        'Confirmar borrado del lote Nº5',
      );
      expect(container.querySelector('.batch-cancel').getAttribute('aria-label')).toBe(
        'Cancelar borrado del lote Nº5',
      );
    });
  });
});

describe('markExitingSwatches', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('ul');
    container.innerHTML =
      '<li class="swatch"></li><li class="swatch"></li><li class="swatch"></li>';
  });

  it('marks only the swatches whose color is unlocked, and returns them', () => {
    const colors = [{ locked: true }, { locked: false }, { locked: false }];

    const exiting = markExitingSwatches(container, colors);

    const swatches = container.querySelectorAll('.swatch');
    expect(swatches[0].classList.contains('swatch--exiting')).toBe(false);
    expect(swatches[1].classList.contains('swatch--exiting')).toBe(true);
    expect(swatches[2].classList.contains('swatch--exiting')).toBe(true);
    expect(exiting).toEqual([swatches[1], swatches[2]]);
  });
});

describe('renderTopbarMeta', () => {
  it('writes the count and a formatted time onto the given elements', () => {
    const counterElement = document.createElement('span');
    const clockElement = document.createElement('time');
    const now = new Date('2026-09-05T21:05:00.000Z');

    renderTopbarMeta(counterElement, clockElement, { count: 3, now });

    expect(counterElement.textContent).toBe('3');
    expect(clockElement.textContent).not.toBe('');
    expect(clockElement.dateTime).toBe(now.toISOString());
  });
});

describe('renderRadioOptions', () => {
  const options = [
    { value: 'hex', label: 'HEX' },
    { value: 'hsl', label: 'HSL' },
  ];

  it('renders one radio per option, sharing a name, with only the selected one checked', () => {
    const container = document.createElement('div');

    renderRadioOptions(container, { name: 'color-format', options, selected: 'hsl' });

    const inputs = container.querySelectorAll('input[type="radio"]');
    expect(Array.from(inputs, (input) => input.value)).toEqual(['hex', 'hsl']);
    expect(Array.from(inputs, (input) => input.name)).toEqual(['color-format', 'color-format']);
    expect(Array.from(inputs, (input) => input.checked)).toEqual([false, true]);
  });

  it('wraps each radio in a label that shows its option as visible text', () => {
    const container = document.createElement('div');

    renderRadioOptions(container, { name: 'color-format', options, selected: 'hex' });

    const labels = container.querySelectorAll('label');
    expect(Array.from(labels, (label) => label.textContent)).toEqual(['HEX', 'HSL']);
  });

  it('calls onChange with the value of the option the user picks', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const onChange = vi.fn();
    renderRadioOptions(container, { name: 'color-format', options, selected: 'hex', onChange });

    container.querySelectorAll('input')[1].click();

    expect(onChange).toHaveBeenCalledWith('hsl');
    container.remove();
  });

  it('replaces the previous options when rendered again with another selection', () => {
    const container = document.createElement('div');
    renderRadioOptions(container, { name: 'color-format', options, selected: 'hex' });

    renderRadioOptions(container, { name: 'color-format', options, selected: 'hsl' });

    expect(container.querySelectorAll('input')).toHaveLength(2);
    expect(container.querySelectorAll('input')[1].checked).toBe(true);
  });
});

describe('applyTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('forces light or dark through data-theme on the root element', () => {
    applyTheme('dark');

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('removes data-theme for system, so CSS follows prefers-color-scheme', () => {
    applyTheme('dark');

    applyTheme('system');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('renderRadioOptions with icons', () => {
  it('adds a decorative icon and keeps the option text available to assistive tech', () => {
    const container = document.createElement('div');

    renderRadioOptions(container, {
      name: 'color-theme',
      options: [{ value: 'dark', label: 'Oscuro', icon: 'dark' }],
      selected: 'dark',
    });

    const label = container.querySelector('label');
    expect(label.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
    expect(label.textContent).toBe('Oscuro');
  });
});

describe('renderContrastPanel', () => {
  const midBlue = { hue: 210, saturation: 65, lightness: 57, locked: false };
  const paleYellow = { hue: 60, saturation: 70, lightness: 70, locked: false };

  it('renders one item per color, in palette order, with an Aa sample painted like the swatch', () => {
    const container = document.createElement('ul');

    renderContrastPanel(container, [midBlue, paleYellow]);

    const samples = container.querySelectorAll('.contrast-sample');
    expect(samples).toHaveLength(2);
    expect(samples[0].textContent).toBe('Aa');
    expect(samples[0].style.backgroundColor).toBe('rgb(74, 145, 217)');
    expect(samples[0].style.color).toBe('rgb(0, 0, 0)');
  });

  it('writes the ratio and the grade as text, not only as color', () => {
    const container = document.createElement('ul');

    renderContrastPanel(container, [midBlue, paleYellow]);

    const [blueItem, yellowItem] = container.children;
    expect(blueItem.querySelector('.contrast-ratio').textContent).toMatch(/^\d+\.\d:1$/);
    expect(blueItem.querySelector('.contrast-grade').textContent).toBe('AA');
    expect(yellowItem.querySelector('.contrast-grade').textContent).toBe('AAA');
  });

  it('reads as a sentence to assistive tech, with the decorative sample hidden', () => {
    const container = document.createElement('ul');

    renderContrastPanel(container, [midBlue]);

    const item = container.firstElementChild;
    expect(item.querySelector('.contrast-sample').getAttribute('aria-hidden')).toBe('true');
    expect(item.textContent).toMatch(/^AaColor 1, contraste \d+\.\d:1, nota AA$/);
  });

  it('replaces the previous items when the palette changes', () => {
    const container = document.createElement('ul');
    renderContrastPanel(container, [midBlue, paleYellow, midBlue]);

    renderContrastPanel(container, [paleYellow]);

    expect(container.children).toHaveLength(1);
  });
});

describe('describePalette', () => {
  it('counts colors and locked colors', () => {
    const colors = [{ locked: true }, { locked: false }, { locked: true }];

    expect(describePalette(colors)).toBe('3 colores · 2 bloqueados');
  });

  it('uses the singular for exactly one locked color', () => {
    expect(describePalette([{ locked: true }, { locked: false }])).toBe('2 colores · 1 bloqueado');
  });
});

describe('focusFirstSwatch', () => {
  it('moves focus to the copy button of the first swatch', () => {
    const container = document.createElement('ul');
    document.body.append(container);
    renderPalette(
      container,
      [
        { hue: 210, saturation: 65, lightness: 57, locked: false },
        { hue: 30, saturation: 60, lightness: 50, locked: false },
      ],
      'hex',
    );

    focusFirstSwatch(container);

    expect(document.activeElement).toBe(container.querySelector('.swatch-color'));
    container.remove();
  });
});

describe('focusBatchButton', () => {
  it('focuses the element matching the selector, if it exists', () => {
    const container = document.createElement('ul');
    container.innerHTML = '<button class="batch-confirm">Confirmar</button>';
    document.body.append(container);

    focusBatchButton(container, '.batch-confirm');

    expect(document.activeElement).toBe(container.querySelector('.batch-confirm'));
    container.remove();
  });

  it('does nothing when no element matches the selector', () => {
    const container = document.createElement('ul');

    expect(() => focusBatchButton(container, '.batch-confirm')).not.toThrow();
  });
});

describe('waitForSwatchesToExit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves as soon as every swatch fires animationend', async () => {
    const swatches = [document.createElement('li'), document.createElement('li')];
    document.documentElement.style.setProperty('--transition-base', '200ms');

    const donePromise = waitForSwatchesToExit(swatches);
    swatches.forEach((swatch) => swatch.dispatchEvent(new Event('animationend')));

    await expect(donePromise).resolves.toEqual([undefined, undefined]);
    document.documentElement.style.removeProperty('--transition-base');
  });

  it('falls back to a timeout if animationend never fires', async () => {
    vi.useFakeTimers();
    document.documentElement.style.setProperty('--transition-base', '200ms');

    const donePromise = waitForSwatchesToExit([document.createElement('li')]);
    vi.advanceTimersByTime(200);

    await expect(donePromise).resolves.toEqual([undefined]);
    document.documentElement.style.removeProperty('--transition-base');
  });
});
