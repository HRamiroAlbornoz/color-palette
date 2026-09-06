import { copyToClipboard } from './clipboard.js';
import {
  createPalette,
  isFullyLocked,
  regeneratePalette,
  resizePalette,
  toggleLock,
  unlockAll,
} from './palette.js';
import {
  focusLockButton,
  markExitingSwatches,
  renderArchive,
  renderHeaderMeta,
  renderPalette,
  updateGridColumns,
  waitForSwatchesToExit,
} from './render.js';
import {
  MAX_BATCHES,
  addBatch,
  findBatch,
  loadArchive,
  persistArchive,
  removeBatch,
} from './storage.js';
import { createToast } from './toast.js';

const ANIMATE_ENTRANCE = true;
const CLOCK_UPDATE_INTERVAL_MS = 30000;

const grid = document.querySelector('#palette-grid');
const generateButton = document.querySelector('#generate-button');
const saveBatchButton = document.querySelector('#save-batch-button');
const archiveList = document.querySelector('#archive-list');
const sizeInputs = document.querySelectorAll('input[name="palette-size"]');
const formatInputs = document.querySelectorAll('input[name="color-format"]');
const generationCounterDisplay = document.querySelector('#generation-counter');
const headerClock = document.querySelector('#header-clock');
const toast = createToast(document.querySelector('#toast'));

const initialSize = Number(document.querySelector('input[name="palette-size"]:checked').value);
let colors = createPalette(initialSize);
let format = document.querySelector('input[name="color-format"]:checked').value;
let generationCount = 1;

const initialArchive = loadArchive();
const archiveAvailable = initialArchive.available;
let batches = initialArchive.batches;
let confirmingDeleteNumber = null;

function updateHeaderMeta() {
  renderHeaderMeta(generationCounterDisplay, headerClock, {
    count: generationCount,
    now: new Date(),
  });
}

async function handleSwatchClick(code) {
  const result = await copyToClipboard(code);

  if (result.ok) {
    toast.show(`Copiado ${code}`);
  } else if (result.reason === 'unavailable') {
    toast.show('El portapapeles no está disponible en este navegador.');
  } else {
    toast.show('No se pudo copiar el color.');
  }
}

function handleLockToggle(index) {
  colors = toggleLock(colors, index);
  renderPaletteGrid();
  focusLockButton(grid, index);
}

function handleRestoreBatch(number) {
  const batch = findBatch(batches, number);
  if (!batch) {
    return;
  }

  colors = unlockAll(batch.colors);

  const matchingSizeInput = Array.from(sizeInputs).find(
    (input) => Number(input.value) === colors.length,
  );
  if (matchingSizeInput) {
    matchingSizeInput.checked = true;
  }

  renderPaletteGrid();
}

function handleRequestDelete(number) {
  confirmingDeleteNumber = number;
  renderArchiveList();
}

function handleCancelDelete() {
  confirmingDeleteNumber = null;
  renderArchiveList();
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
}

function renderPaletteGrid(animateEntrance = false) {
  renderPalette(grid, colors, format, handleSwatchClick, handleLockToggle, animateEntrance);
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

renderPaletteGrid();
renderArchiveList();
updateHeaderMeta();
setInterval(updateHeaderMeta, CLOCK_UPDATE_INTERVAL_MS);
window.addEventListener('resize', () => updateGridColumns(grid, colors.length));

generateButton.addEventListener('click', async () => {
  if (isFullyLocked(colors)) {
    toast.show('Todos los colores están bloqueados: no hay nada para regenerar.');
    return;
  }

  generateButton.disabled = true;
  try {
    await waitForSwatchesToExit(markExitingSwatches(grid, colors));

    colors = regeneratePalette(colors);
    generationCount += 1;
    updateHeaderMeta();
    renderPaletteGrid(ANIMATE_ENTRANCE);
  } finally {
    generateButton.disabled = false;
  }
});

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

sizeInputs.forEach((input) => {
  input.addEventListener('change', (event) => {
    colors = resizePalette(colors, Number(event.target.value));
    renderPaletteGrid();
  });
});

formatInputs.forEach((input) => {
  input.addEventListener('change', (event) => {
    format = event.target.value;
    renderPaletteGrid();
  });
});
