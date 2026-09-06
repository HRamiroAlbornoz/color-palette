import { getPrimaryCode, getReadableTextColor, hslToHex, hslToRgb, rgbToHex } from './color.js';

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

let nextSwatchId = 0;

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

  const dataListId = `swatch-data-${nextSwatchId++}`;

  const colorButton = document.createElement('button');
  colorButton.type = 'button';
  colorButton.className = 'swatch-color';
  colorButton.style.backgroundColor = hex;
  colorButton.style.color = textColor.hex;
  colorButton.setAttribute('aria-label', `Copiar ${primaryCode}`);
  colorButton.setAttribute('aria-describedby', dataListId);
  colorButton.addEventListener('click', () => onSwatchClick(primaryCode));

  const codeDisplay = document.createElement('p');
  codeDisplay.className = 'swatch-code';
  codeDisplay.textContent = primaryCode;

  const dataList = document.createElement('dl');
  dataList.id = dataListId;
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

const STAGGER_STEP_MS = 40;

export function renderPalette(
  container,
  colors,
  format,
  onSwatchClick = () => {},
  onLockToggle = () => {},
  animateEntrance = false,
) {
  container.replaceChildren(
    ...colors.map((color, index) => {
      const swatch = createSwatchElement(color, format, onSwatchClick, () => onLockToggle(index));
      if (animateEntrance && !color.locked) {
        swatch.classList.add('swatch--entering');
        swatch.style.animationDelay = `${index * STAGGER_STEP_MS}ms`;
      }
      return swatch;
    }),
  );
}

export function focusLockButton(container, index) {
  container.querySelectorAll('.lock-button')[index]?.focus();
}

export function formatBatchDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function createArchiveMessage(text) {
  const message = document.createElement('li');
  message.className = 'archive-message';
  message.textContent = text;
  return message;
}

function createBatchEntry(batch, onRestore, onDelete) {
  const entry = document.createElement('li');
  entry.className = 'batch-entry';

  const thumbnails = document.createElement('div');
  thumbnails.className = 'batch-thumbnails';
  thumbnails.append(
    ...batch.colors.map((color) => {
      const thumbnail = document.createElement('span');
      thumbnail.className = 'batch-thumbnail';
      thumbnail.style.backgroundColor = hslToHex(color);
      return thumbnail;
    }),
  );

  const label = document.createElement('p');
  label.className = 'batch-label';
  label.textContent = `Lote Nº${batch.number} · ${formatBatchDate(batch.date)}`;

  const restoreButton = document.createElement('button');
  restoreButton.type = 'button';
  restoreButton.className = 'batch-restore';
  restoreButton.textContent = 'Restaurar';
  restoreButton.addEventListener('click', () => onRestore(batch.number));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'batch-delete';
  deleteButton.textContent = 'Borrar';
  deleteButton.addEventListener('click', () => onDelete(batch.number));

  entry.append(thumbnails, label, restoreButton, deleteButton);
  return entry;
}

export function renderArchive(container, archive, onRestore = () => {}, onDelete = () => {}) {
  if (!archive.available) {
    container.replaceChildren(
      createArchiveMessage('En este navegador no se puede guardar el archivo de paletas.'),
    );
    return;
  }

  if (archive.batches.length === 0) {
    container.replaceChildren(
      createArchiveMessage('Guardá tu primera paleta para empezar el archivo.'),
    );
    return;
  }

  container.replaceChildren(
    ...archive.batches.map((batch) => createBatchEntry(batch, onRestore, onDelete)),
  );
}
