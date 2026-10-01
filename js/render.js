import {
  getPrimaryCode,
  getReadableTextColor,
  getSecondaryCode,
  hslToHex,
  hslToRgb,
  rgbToHex,
} from './color.js';

const APP_LOCALE = 'es-AR';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createButton({ className, text, label, onClick }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  if (text) {
    button.textContent = text;
  }
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}

function createSvgElement(tagName, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function createLockIcon(locked) {
  const icon = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '20',
    height: '20',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });
  const shackle = createSvgElement('path', {
    d: locked ? 'M8 11V7a4 4 0 0 1 8 0v4' : 'M8 11V7a4 4 0 0 1 7.5-2',
  });
  const body = createSvgElement('rect', {
    x: '5',
    y: '11',
    width: '14',
    height: '10',
    rx: '1',
    fill: locked ? 'currentColor' : 'none',
  });
  icon.append(shackle, body);
  return icon;
}

function createDataEntry(label, value) {
  const entry = document.createElement('div');

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');
  dd.textContent = value;

  entry.append(dt, dd);
  return entry;
}

function createLockButton(locked, onLockToggle) {
  const button = createButton({
    className: 'lock-button',
    label: locked ? 'Desbloquear color' : 'Bloquear color',
    onClick: onLockToggle,
  });
  button.setAttribute('aria-pressed', String(locked));
  button.append(createLockIcon(locked));
  return button;
}

let nextSwatchId = 0;

function createSwatchElement(color, format, onSwatchClick, onLockToggle) {
  const rgb = hslToRgb(color);
  const hex = rgbToHex(rgb);
  const textColor = getReadableTextColor(rgb);
  const primaryCode = getPrimaryCode(color, hex, format);
  const secondaryCode = getSecondaryCode(color, hex, format);
  const dataListId = `swatch-data-${nextSwatchId++}`;

  const swatch = document.createElement('li');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = hex;
  swatch.style.color = textColor.hex;

  const copyButton = createButton({
    className: 'swatch-color',
    label: `Copiar ${primaryCode}`,
    onClick: () => onSwatchClick(primaryCode),
  });
  copyButton.setAttribute('aria-describedby', dataListId);

  const codeDisplay = document.createElement('p');
  codeDisplay.className = 'swatch-code';
  codeDisplay.textContent = primaryCode;

  const dataList = document.createElement('dl');
  dataList.id = dataListId;
  dataList.className = 'swatch-data';
  dataList.append(
    createDataEntry(secondaryCode.label, secondaryCode.value),
    createDataEntry('AA', `${textColor.contrastRatio.toFixed(1)}:1`),
  );

  const details = document.createElement('div');
  details.className = 'swatch-details';
  details.setAttribute('aria-hidden', 'true');
  details.append(codeDisplay, dataList);

  swatch.append(copyButton, details, createLockButton(color.locked, onLockToggle));
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
  container.dataset.count = String(colors.length);
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

export function focusFirstSwatch(container) {
  container.querySelector('.swatch-color')?.focus();
}

export function renderRadioOptions(container, { name, options, selected, onChange = () => {} }) {
  container.replaceChildren(
    ...options.map(({ value, label }) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = value;
      input.className = 'visually-hidden';
      input.checked = value === selected;
      input.addEventListener('change', () => onChange(value));

      const labelElement = document.createElement('label');
      labelElement.append(input, label);
      return labelElement;
    }),
  );
}

export function describePalette(colors) {
  const lockedCount = colors.filter((color) => color.locked).length;
  const lockedText = lockedCount === 1 ? '1 bloqueado' : `${lockedCount} bloqueados`;
  return `${colors.length} colores · ${lockedText}`;
}

export function focusBatchButton(container, selector) {
  container.querySelector(selector)?.focus();
}

function getExitAnimationDuration() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--transition-base');
  return parseFloat(value) || 0;
}

function waitForSwatchExit(swatch, durationMs) {
  if (durationMs === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, durationMs);
    swatch.addEventListener(
      'animationend',
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      { once: true },
    );
  });
}

export function markExitingSwatches(container, colors) {
  const exiting = [];
  Array.from(container.children).forEach((swatch, index) => {
    if (!colors[index].locked) {
      swatch.classList.add('swatch--exiting');
      exiting.push(swatch);
    }
  });
  return exiting;
}

export function waitForSwatchesToExit(swatches) {
  const durationMs = getExitAnimationDuration();
  return Promise.all(swatches.map((swatch) => waitForSwatchExit(swatch, durationMs)));
}

export function renderTopbarMeta(counterElement, clockElement, { count, now }) {
  counterElement.textContent = String(count);
  clockElement.textContent = now.toLocaleTimeString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
  clockElement.dateTime = now.toISOString();
}

export function formatBatchDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(APP_LOCALE, {
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

function createBatchThumbnails(batch) {
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
  return thumbnails;
}

function createDeleteConfirmEntry(batch, { onConfirmDelete, onCancelDelete }) {
  const entry = document.createElement('li');
  entry.className = 'batch-entry';

  const confirmLabel = document.createElement('p');
  confirmLabel.className = 'batch-confirm-label';
  confirmLabel.textContent = `¿Borrar el Lote Nº${batch.number} guardado el ${formatBatchDate(batch.date)}?`;

  const confirmButton = createButton({
    className: 'batch-confirm',
    text: 'Confirmar',
    label: `Confirmar borrado del lote Nº${batch.number}`,
    onClick: () => onConfirmDelete(batch.number),
  });

  const cancelButton = createButton({
    className: 'batch-cancel',
    text: 'Cancelar',
    label: `Cancelar borrado del lote Nº${batch.number}`,
    onClick: onCancelDelete,
  });

  entry.append(createBatchThumbnails(batch), confirmLabel, confirmButton, cancelButton);
  return entry;
}

function createBatchEntry(batch, { onRestore, onRequestDelete }) {
  const entry = document.createElement('li');
  entry.className = 'batch-entry';

  const label = document.createElement('p');
  label.className = 'batch-label';
  label.textContent = `Lote Nº${batch.number} · ${formatBatchDate(batch.date)}`;

  const restoreButton = createButton({
    className: 'batch-restore',
    text: 'Restaurar',
    label: `Restaurar lote Nº${batch.number}`,
    onClick: () => onRestore(batch.number),
  });

  const deleteButton = createButton({
    className: 'batch-delete',
    text: 'Borrar',
    label: `Borrar lote Nº${batch.number}`,
    onClick: () => onRequestDelete(batch.number),
  });

  entry.append(createBatchThumbnails(batch), label, restoreButton, deleteButton);
  return entry;
}

export function renderArchive(container, archive, handlers = {}) {
  const {
    onRestore = () => {},
    onRequestDelete = () => {},
    onConfirmDelete = () => {},
    onCancelDelete = () => {},
    confirmingNumber = null,
  } = handlers;

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
    ...archive.batches.map((batch) =>
      batch.number === confirmingNumber
        ? createDeleteConfirmEntry(batch, { onConfirmDelete, onCancelDelete })
        : createBatchEntry(batch, { onRestore, onRequestDelete }),
    ),
  );
}
