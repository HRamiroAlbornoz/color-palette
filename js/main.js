import { createPalette, resizePalette } from './palette.js';
import { renderPalette } from './render.js';

const grid = document.querySelector('#palette-grid');
const generateButton = document.querySelector('#generate-button');
const sizeInputs = document.querySelectorAll('input[name="palette-size"]');
const formatInputs = document.querySelectorAll('input[name="color-format"]');

const initialSize = Number(document.querySelector('input[name="palette-size"]:checked').value);
let colors = createPalette(initialSize);
let format = document.querySelector('input[name="color-format"]:checked').value;

function render() {
  renderPalette(grid, colors, format);
}

render();

generateButton.addEventListener('click', () => {
  colors = createPalette(colors.length);
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
