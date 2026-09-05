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

    renderPalette(container, colors, 'hex');

    expect(container.children).toHaveLength(2);
  });

  it('shows the exact HEX code matching the swatch background color', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57 }], 'hex');

    const swatch = container.firstElementChild;
    expect(swatch.textContent).toContain('#4A91D9');
    expect(swatch.style.backgroundColor).toBe('rgb(74, 145, 217)');
  });

  it('shows the HSL triplet and a contrast ratio', () => {
    renderPalette(container, [{ hue: 210, saturation: 65, lightness: 57 }], 'hex');

    const swatch = container.firstElementChild;
    expect(swatch.textContent).toContain('210 65 57');
    expect(swatch.textContent).toMatch(/\d+(\.\d)?:1/);
  });

  it('replaces previous content on re-render instead of appending', () => {
    renderPalette(container, [{ hue: 0, saturation: 50, lightness: 50 }], 'hex');
    renderPalette(
      container,
      [
        { hue: 0, saturation: 50, lightness: 50 },
        { hue: 180, saturation: 50, lightness: 50 },
      ],
      'hex',
    );

    expect(container.children).toHaveLength(2);
  });

  describe('format', () => {
    const hsl = { hue: 210, saturation: 65, lightness: 57 };

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
