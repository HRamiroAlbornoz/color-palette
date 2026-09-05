import { getPrimaryCode, getReadableTextColor, hslToRgb, rgbToHex } from './color.js';

function createDataEntry(label, value) {
  const entry = document.createElement('div');

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');
  dd.textContent = value;

  entry.append(dt, dd);
  return entry;
}

function createSwatchElement(hsl, format) {
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);
  const textColor = getReadableTextColor(rgb);

  const primaryCode = getPrimaryCode(hsl, hex, format);
  const [secondaryLabel, secondaryValue] =
    format === 'hsl' ? ['HEX', hex] : ['HSL', `${hsl.hue} ${hsl.saturation} ${hsl.lightness}`];

  const swatch = document.createElement('li');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = hex;
  swatch.style.color = textColor.hex;

  const codeDisplay = document.createElement('p');
  codeDisplay.className = 'swatch-code';
  codeDisplay.textContent = primaryCode;

  const dataList = document.createElement('dl');
  dataList.className = 'swatch-data';
  dataList.append(
    createDataEntry(secondaryLabel, secondaryValue),
    createDataEntry('AA', `${textColor.contrastRatio.toFixed(1)}:1`),
  );

  swatch.append(codeDisplay, dataList);

  return swatch;
}

export function renderPalette(container, colors, format) {
  container.replaceChildren(...colors.map((hsl) => createSwatchElement(hsl, format)));
}
