import { getReadableTextColor, hslToRgb, rgbToHex } from './color.js';

function createDataEntry(label, value) {
  const entry = document.createElement('div');

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');
  dd.textContent = value;

  entry.append(dt, dd);
  return entry;
}

function createSwatchElement(hsl) {
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);
  const textColor = getReadableTextColor(rgb);

  const swatch = document.createElement('li');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = hex;
  swatch.style.color = textColor.hex;

  const hexCode = document.createElement('p');
  hexCode.className = 'swatch-hex';
  hexCode.textContent = hex;

  const dataList = document.createElement('dl');
  dataList.className = 'swatch-data';
  dataList.append(
    createDataEntry('HSL', `${hsl.hue} ${hsl.saturation} ${hsl.lightness}`),
    createDataEntry('AA', `${textColor.contrastRatio.toFixed(1)}:1`),
  );

  swatch.append(hexCode, dataList);

  return swatch;
}

export function renderPalette(container, colors) {
  container.replaceChildren(...colors.map(createSwatchElement));
}
