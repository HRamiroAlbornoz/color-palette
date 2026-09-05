import { copyToClipboard } from './clipboard.js';
import {
  createPalette,
  isFullyLocked,
  regeneratePalette,
  resizePalette,
  toggleLock,
} from './palette.js';
import { renderPalette } from './render.js';
import { createToast } from './toast.js';

const grid = document.querySelector('#palette-grid');
const generateButton = document.querySelector('#generate-button');
const sizeInputs = document.querySelectorAll('input[name="palette-size"]');
const formatInputs = document.querySelectorAll('input[name="color-format"]');
const toast = createToast(document.querySelector('#toast'));

const initialSize = Number(document.querySelector('input[name="palette-size"]:checked').value);
let colors = createPalette(initialSize);
let format = document.querySelector('input[name="color-format"]:checked').value;

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
  render();
}

function render() {
  renderPalette(grid, colors, format, handleSwatchClick, handleLockToggle);
}

render();

generateButton.addEventListener('click', () => {
  if (isFullyLocked(colors)) {
    toast.show('Todos los colores están bloqueados: no hay nada para regenerar.');
    return;
  }

  colors = regeneratePalette(colors);
  render();
});

sizeInputs.forEach((input) => {
  input.addEventListener('change', (event) => {
    colors = resizePalette(colors, Number(event.target.value));
    render();
  });
});

formatInputs.forEach((input) => {
  input.addEventListener('change', (event) => {
    format = event.target.value;
    render();
  });
});
