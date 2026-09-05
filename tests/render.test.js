import { beforeEach, describe, expect, it } from 'vitest';
import { renderPalette } from '../js/render.js';

describe('renderPalette', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('ul');
  });

  it('renders one list item per color', () => {
    const colors = [
      { hue: 210, saturation: 65, lightness: 57 },
      { hue: 30, saturation: 60, lightness: 50 },
    ];

    renderPalette(container, colors);

    expect(container.children).toHaveLength(2);
  });

  it('shows the exact HEX code matching the swatch background color', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57 }]);

    const swatch = container.firstElementChild;
    expect(swatch.textContent).toContain('#4A91D9');
    expect(swatch.style.backgroundColor).toBe('rgb(74, 145, 217)');
  });

  it('shows the HSL triplet and a contrast ratio', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57 }]);

    const swatch = container.firstElementChild;
    expect(swatch.textContent).toContain('210 65 57');
    expect(swatch.textContent).toMatch(/\d+(\.\d)?:1/);
  });

  it('replaces previous content on re-render instead of appending', () => {
    renderPalette(container, [{ hue: 0, saturation: 50, lightness: 50 }]);
    renderPalette(container, [
      { hue: 0, saturation: 50, lightness: 50 },
      { hue: 180, saturation: 50, lightness: 50 },
    ]);

    expect(container.children).toHaveLength(2);
  });
});
