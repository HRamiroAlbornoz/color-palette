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

function createLockButton(locked, textColorHex, onLockToggle) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'lock-button';
  button.style.color = textColorHex;
  button.setAttribute('aria-pressed', String(locked));
  button.setAttribute('aria-label', locked ? 'Desbloquear color' : 'Bloquear color');
  button.addEventListener('click', onLockToggle);
  return button;
}

function createSwatchElement(color, format, onSwatchClick, onLockToggle) {
  const rgb = hslToRgb(color);
  const hex = rgbToHex(rgb);
  const textColor = getReadableTextColor(rgb);

  const primaryCode = getPrimaryCode(color, hex, format);
  const [secondaryLabel, secondaryValue] =
    format === 'hsl'
      ? ['HEX', hex]
      : ['HSL', `${color.hue} ${color.saturation} ${color.lightness}`];

  const swatch = document.createElement('li');
  swatch.className = 'swatch';

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

  const lockButton = createLockButton(color.locked, textColor.hex, onLockToggle);

  swatch.append(colorButton, lockButton);

  return swatch;
}

export function renderPalette(
  container,
  colors,
  format,
  onSwatchClick = () => {},
  onLockToggle = () => {},
) {
  container.replaceChildren(
    ...colors.map((color, index) =>
      createSwatchElement(color, format, onSwatchClick, () => onLockToggle(index)),
    ),
  );
}
