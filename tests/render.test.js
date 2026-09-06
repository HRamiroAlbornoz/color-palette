import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  markExitingSwatches,
  pickColumnCount,
  renderArchive,
  renderHeaderMeta,
  renderPalette,
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

    const colorButton = container.querySelector('.swatch-color');
    expect(colorButton.textContent).toContain('#4A91D9');
    expect(colorButton.style.backgroundColor).toBe('rgb(74, 145, 217)');
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
      expect(swatch.children).toHaveLength(2);
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
  });
});

describe('pickColumnCount', () => {
  it('keeps the preferred column count when it does not orphan a single item', () => {
    expect(pickColumnCount(3, 6)).toBe(3);
    expect(pickColumnCount(3, 8)).toBe(3);
    expect(pickColumnCount(3, 9)).toBe(3);
    expect(pickColumnCount(5, 9)).toBe(5);
  });

  it('picks a smaller column count when it avoids stranding one item alone', () => {
    expect(pickColumnCount(5, 6)).toBe(4);
  });

  it('picks a larger column count when going smaller is not possible', () => {
    expect(pickColumnCount(2, 9)).toBe(3);
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

describe('renderHeaderMeta', () => {
  it('writes the count and a formatted time onto the given elements', () => {
    const counterElement = document.createElement('span');
    const clockElement = document.createElement('time');
    const now = new Date('2026-09-05T21:05:00.000Z');

    renderHeaderMeta(counterElement, clockElement, { count: 3, now });

    expect(counterElement.textContent).toBe('3');
    expect(clockElement.textContent).not.toBe('');
    expect(clockElement.dateTime).toBe(now.toISOString());
  });
});
