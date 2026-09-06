import { getPrimaryCode, getReadableTextColor, hslToHex, hslToRgb, rgbToHex } from './color.js';

const APP_LOCALE = 'es-AR';

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

export function pickColumnCount(preferred, itemCount) {
  if (itemCount % preferred !== 1) {
    return preferred;
  }

  for (let delta = 1; delta <= preferred; delta += 1) {
    if (preferred - delta >= 2 && itemCount % (preferred - delta) !== 1) {
      return preferred - delta;
    }
    if (itemCount % (preferred + delta) !== 1) {
      return preferred + delta;
    }
  }

  return preferred;
}

function updateGridColumnOverride(container, itemCount) {
  container.style.removeProperty('grid-template-columns');
  const preferred = getComputedStyle(container)
    .gridTemplateColumns.split(' ')
    .filter(Boolean).length;
  const adjusted = pickColumnCount(preferred, itemCount);
  if (adjusted !== preferred) {
    container.style.setProperty('grid-template-columns', `repeat(${adjusted}, 1fr)`);
  }
}

export function updateGridColumns(container, itemCount) {
  updateGridColumnOverride(container, itemCount);
}

export function renderPalette(
  container,
  colors,
  format,
  onSwatchClick = () => {},
  onLockToggle = () => {},
  animateEntrance = false,
) {
  updateGridColumnOverride(container, colors.length);
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

function getExitAnimationDuration() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--transition-base');
  return parseFloat(value) || 0;
}

const EXIT_DURATION_MS = getExitAnimationDuration();

function waitForSwatchExit(swatch) {
  if (EXIT_DURATION_MS === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, EXIT_DURATION_MS);
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
  return Promise.all(swatches.map(waitForSwatchExit));
}

export function renderHeaderMeta(counterElement, clockElement, { count, now }) {
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

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'batch-confirm';
  confirmButton.textContent = 'Confirmar';
  confirmButton.addEventListener('click', () => onConfirmDelete(batch.number));

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'batch-cancel';
  cancelButton.textContent = 'Cancelar';
  cancelButton.addEventListener('click', () => onCancelDelete());

  entry.append(createBatchThumbnails(batch), confirmLabel, confirmButton, cancelButton);
  return entry;
}

function createBatchEntry(batch, { onRestore, onRequestDelete }) {
  const entry = document.createElement('li');
  entry.className = 'batch-entry';

  const label = document.createElement('p');
  label.className = 'batch-label';
  label.textContent = `Lote Nº${batch.number} · ${formatBatchDate(batch.date)}`;

  const restoreButton = document.createElement('button');
  restoreButton.type = 'button';
  restoreButton.className = 'batch-restore';
  restoreButton.textContent = 'Restaurar';
  restoreButton.setAttribute('aria-label', `Restaurar lote Nº${batch.number}`);
  restoreButton.addEventListener('click', () => onRestore(batch.number));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'batch-delete';
  deleteButton.textContent = 'Borrar';
  deleteButton.setAttribute('aria-label', `Borrar lote Nº${batch.number}`);
  deleteButton.addEventListener('click', () => onRequestDelete(batch.number));

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
