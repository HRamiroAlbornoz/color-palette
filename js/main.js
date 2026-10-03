import { copyToClipboard } from './clipboard.js';
import { formatPaletteAsCss } from './color.js';
import {
  PALETTE_SIZES,
  createPalette,
  isFullyLocked,
  regeneratePalette,
  resizePalette,
  toggleLock,
  unlockAll,
} from './palette.js';
import {
  applyTheme,
  describePalette,
  focusBatchButton,
  focusFirstSwatch,
  focusLockButton,
  markExitingSwatches,
  renderArchive,
  renderContrastPanel,
  renderPalette,
  renderRadioOptions,
  renderTopbarMeta,
  waitForSwatchesToExit,
} from './render.js';
import {
  MAX_BATCHES,
  THEME_OPTIONS,
  addBatch,
  findBatch,
  loadArchive,
  loadThemePreference,
  persistArchive,
  removeBatch,
  saveThemePreference,
} from './storage.js';
import { getSpaceShortcutAction, trackKeyboardFocus } from './shortcut.js';
import { createToast } from './toast.js';

const ANIMATE_ENTRANCE = true;
const CLOCK_UPDATE_INTERVAL_MS = 30000;

const SIZE_OPTIONS = PALETTE_SIZES.map((size) => ({ value: String(size), label: String(size) }));
const FORMAT_OPTIONS = [
  { value: 'hex', label: 'HEX' },
  { value: 'hsl', label: 'HSL' },
];
const THEME_LABELS = { system: 'Sistema', light: 'Claro', dark: 'Oscuro' };
const THEME_SELECTOR_OPTIONS = THEME_OPTIONS.map((value) => ({
  value,
  label: THEME_LABELS[value],
  icon: value,
}));

const grid = document.querySelector('#palette-grid');
const contrastList = document.querySelector('#contrast-list');
const cssExportCode = document.querySelector('#css-export-code');
const copyCssButton = document.querySelector('#copy-css-button');
const generateButton = document.querySelector('#generate-button');
const saveBatchButton = document.querySelector('#save-batch-button');
const archiveList = document.querySelector('#archive-list');
const sizeFieldset = document.querySelector('#size-fieldset');
const formatFieldset = document.querySelector('#format-fieldset');
const sizeOptions = document.querySelector('#size-options');
const formatOptions = document.querySelector('#format-options');
const themeOptions = document.querySelector('#theme-options');
const paletteSummary = document.querySelector('#palette-summary');
const skipLink = document.querySelector('#skip-link');
const generationCounterDisplay = document.querySelector('#generation-counter');
const topbarClock = document.querySelector('#topbar-clock');
const toast = createToast(document.querySelector('#toast'));
const focusCameFromKeyboard = trackKeyboardFocus(document);

let colors = createPalette(PALETTE_SIZES[0]);
let format = FORMAT_OPTIONS[0].value;
let theme = loadThemePreference();
let generationCount = 1;

const initialArchive = loadArchive();
const archiveAvailable = initialArchive.available;
let batches = initialArchive.batches;
let confirmingDeleteNumber = null;
let isGenerating = false;

function setControlsDisabled(disabled) {
  generateButton.disabled = disabled;
  sizeFieldset.disabled = disabled;
  formatFieldset.disabled = disabled;
}

function updateTopbarMeta() {
  renderTopbarMeta(generationCounterDisplay, topbarClock, {
    count: generationCount,
    now: new Date(),
  });
}

function renderSizeOptions() {
  renderRadioOptions(sizeOptions, {
    name: 'palette-size',
    options: SIZE_OPTIONS,
    selected: String(colors.length),
    onChange: handleSizeChange,
  });
}

function renderFormatOptions() {
  renderRadioOptions(formatOptions, {
    name: 'color-format',
    options: FORMAT_OPTIONS,
    selected: format,
    onChange: handleFormatChange,
  });
}

function renderThemeOptions() {
  renderRadioOptions(themeOptions, {
    name: 'color-theme',
    options: THEME_SELECTOR_OPTIONS,
    selected: theme,
    onChange: handleThemeChange,
  });
}

function handleThemeChange(value) {
  theme = value;
  applyTheme(theme);
  saveThemePreference(theme);
}

async function copyAndAnnounce(text, { successMessage, failureMessage }) {
  const result = await copyToClipboard(text);

  if (result.ok) {
    toast.show(successMessage);
  } else if (result.reason === 'unavailable') {
    toast.show('El portapapeles no está disponible en este navegador.');
  } else {
    toast.show(failureMessage);
  }
}

function handleSwatchClick(code) {
  return copyAndAnnounce(code, {
    successMessage: `Copiado ${code}`,
    failureMessage: 'No se pudo copiar el color.',
  });
}

function handleCopyCssClick() {
  return copyAndAnnounce(cssExportCode.textContent, {
    successMessage: 'Variables CSS copiadas.',
    failureMessage: 'No se pudieron copiar las variables CSS.',
  });
}

function handleSizeChange(value) {
  colors = resizePalette(colors, Number(value));
  renderPaletteViews();
}

function handleFormatChange(value) {
  format = value;
  renderPaletteViews();
}

function handleLockToggle(index) {
  if (isGenerating) {
    return;
  }

  colors = toggleLock(colors, index);
  renderPaletteViews();
  focusLockButton(grid, index);
}

function handleRestoreBatch(number) {
  if (isGenerating) {
    return;
  }

  const batch = findBatch(batches, number);
  if (!batch) {
    return;
  }

  colors = unlockAll(batch.colors);
  renderSizeOptions();
  renderPaletteViews();
}

function handleRequestDelete(number) {
  confirmingDeleteNumber = number;
  renderArchiveList();
  focusBatchButton(archiveList, '.batch-confirm');
}

function handleCancelDelete() {
  const cancelledNumber = confirmingDeleteNumber;
  confirmingDeleteNumber = null;
  renderArchiveList();
  focusBatchButton(archiveList, `[aria-label="Borrar lote Nº${cancelledNumber}"]`);
}

function handleConfirmDelete(number) {
  confirmingDeleteNumber = null;

  const updatedBatches = removeBatch(batches, number);
  const persisted = persistArchive(updatedBatches);
  if (persisted) {
    batches = updatedBatches;
  } else {
    toast.show('No se pudo borrar la paleta en este navegador.');
  }

  renderArchiveList();
  saveBatchButton.focus();
}

function renderPaletteViews(animateEntrance = false) {
  renderPalette(grid, colors, format, handleSwatchClick, handleLockToggle, animateEntrance);
  paletteSummary.textContent = describePalette(colors);
  renderContrastPanel(contrastList, colors);
  cssExportCode.textContent = formatPaletteAsCss(colors, format);
}

function renderArchiveList() {
  renderArchive(
    archiveList,
    { available: archiveAvailable, batches },
    {
      onRestore: handleRestoreBatch,
      onRequestDelete: handleRequestDelete,
      onConfirmDelete: handleConfirmDelete,
      onCancelDelete: handleCancelDelete,
      confirmingNumber: confirmingDeleteNumber,
    },
  );
}

applyTheme(theme);
renderThemeOptions();
renderSizeOptions();
renderFormatOptions();
renderPaletteViews();
renderArchiveList();
updateTopbarMeta();
setInterval(updateTopbarMeta, CLOCK_UPDATE_INTERVAL_MS);

skipLink.addEventListener('click', (event) => {
  event.preventDefault();
  focusFirstSwatchAfterKeyActivation();
});

async function generatePalette() {
  if (isGenerating) {
    return;
  }

  if (isFullyLocked(colors)) {
    toast.show('Todos los colores están bloqueados: no hay nada para regenerar.');
    return;
  }

  isGenerating = true;
  setControlsDisabled(true);
  try {
    await waitForSwatchesToExit(markExitingSwatches(grid, colors));

    colors = regeneratePalette(colors);
    generationCount += 1;
    updateTopbarMeta();
    renderPaletteViews(ANIMATE_ENTRANCE);
  } finally {
    isGenerating = false;
    setControlsDisabled(false);
  }
}

function focusFirstSwatchAfterKeyActivation() {
  setTimeout(() => focusFirstSwatch(grid));
}

function handleShortcutKeydown(event) {
  const action = getSpaceShortcutAction(event, {
    focusCameFromKeyboard: focusCameFromKeyboard(),
  });

  if (action === 'ignore') {
    return;
  }

  event.preventDefault();
  if (action === 'generate') {
    generatePalette();
  }
}

generateButton.addEventListener('click', generatePalette);
document.addEventListener('keydown', handleShortcutKeydown);

copyCssButton.addEventListener('click', handleCopyCssClick);

saveBatchButton.addEventListener('click', () => {
  if (!archiveAvailable) {
    toast.show('En este navegador no se puede guardar el archivo de paletas.');
    return;
  }

  const result = addBatch(batches, colors);
  if (!result.ok) {
    toast.show(
      `El archivo llegó a su tope de ${MAX_BATCHES} lotes: borrá alguno para guardar uno nuevo.`,
    );
    return;
  }

  const persisted = persistArchive(result.batches);
  if (!persisted) {
    toast.show('No se pudo guardar la paleta en este navegador.');
    return;
  }

  batches = result.batches;
  toast.show('Paleta guardada en el archivo.');
  renderArchiveList();
});
