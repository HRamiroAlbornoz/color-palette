import { createPalette, resizePalette } from './palette.js';
import { renderPalette } from './render.js';

const grid = document.querySelector('#palette-grid');
const generateButton = document.querySelector('#generate-button');
const sizeInputs = document.querySelectorAll('input[name="palette-size"]');

const initialSize = Number(document.querySelector('input[name="palette-size"]:checked').value);
let colors = createPalette(initialSize);

renderPalette(grid, colors);

generateButton.addEventListener('click', () => {
  colors = createPalette(colors.length);
  renderPalette(grid, colors);
});

sizeInputs.forEach((input) => {
  input.addEventListener('change', (event) => {
    colors = resizePalette(colors, Number(event.target.value));
    renderPalette(grid, colors);
  });
});
