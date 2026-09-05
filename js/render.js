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

function createSwatchElement(hsl, format, onSwatchClick) {
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);
  const textColor = getReadableTextColor(rgb);

  const primaryCode = getPrimaryCode(hsl, hex, format);
  const [secondaryLabel, secondaryValue] =
    format === 'hsl' ? ['HEX', hex] : ['HSL', `${hsl.hue} ${hsl.saturation} ${hsl.lightness}`];

  const swatch = document.createElement('li');

  const colorButton = document.createElement('button');
  colorButton.type = 'button';
  colorButton.className = 'swatch-color';
  colorButton.style.backgroundColor = hex;
  colorButton.style.color = textColor.hex;
  colorButton.setAttribute('aria-label', `Copiar ${primaryCode}`);
  colorButton.addEventListener('click', () => onSwatchClick(primaryCode));

  const codeDisplay = document.createElement('p');
  codeDisplay.className = 'swatch-code';
  codeDisplay.textContent = primaryCode;

  const dataList = document.createElement('dl');
  dataList.className = 'swatch-data';
  dataList.append(
    createDataEntry(secondaryLabel, secondaryValue),
    createDataEntry('AA', `${textColor.contrastRatio.toFixed(1)}:1`),
  );

  colorButton.append(codeDisplay, dataList);
  swatch.append(colorButton);

  return swatch;
}

export function renderPalette(container, colors, format, onSwatchClick = () => {}) {
  container.replaceChildren(
    ...colors.map((hsl) => createSwatchElement(hsl, format, onSwatchClick)),
  );
}
