---
author: HRamiroAlbornoz
branch: fix/keep-focus-after-generate
status: done
---
# Foco después de generar

## Intent

Con el teclado en «Generar paleta», Enter genera la paleta pero el foco salta al `<body>`. Durante
la animación de salida `setControlsDisabled(true)` deshabilita el botón, y el navegador no deja el
foco en un control deshabilitado. Al rehabilitarlo, el foco no vuelve. Quien navega con teclado o
lector de pantalla queda fuera de la página: el siguiente Tab arranca desde el principio. Rompe
WCAG 2.4.3 y el principio 18 de la constitución.

Reproducido en producción el 2026-10-23: `activeElement` pasó de `generate-button` a `BODY`.

## Scope

- Dentro: devolver el foco al control que lo tenía antes de generar, si ese control sigue en la
  página. Cubre el botón y los radios de tamaño y formato, que también se deshabilitan.
- Fuera: las muestras, que se vuelven a dibujar en cada generación; su foco solo llega por clic, y
  después de un clic Espacio genera igual (F10.2).

## Checklist

- [x] Test en `tests/main.test.js`: el foco sigue en «Generar paleta» después de generar — prueba: rojo antes del arreglo.
- [x] Arreglo en `js/main.js` — prueba: el mismo test en verde.
- [x] Comportamiento real — prueba: Tab hasta el botón, Enter, `activeElement` sigue siendo el botón en el navegador.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.
- [x] Documento cerrado en el último commit del PR — prueba: `status: done` antes del merge.

## Evidence

- Primer intento de rojo, descartado: el test pasaba sin el arreglo. jsdom no implementa la regla de
  los navegadores que saca el foco de un control al deshabilitarlo, y además su `blur()` no actúa
  sobre un control deshabilitado (comprobado con una sonda temporal, ya borrada). El test emula esa
  regla con un `MutationObserver` que rehabilita el control un instante, le quita el foco y lo
  vuelve a deshabilitar.
- Rojo correcto: `keeps the focus on Generar paleta after generating…` → el foco terminaba en `<body>`.
- Verde: `returnFocusLostWhileDisabled` devuelve el foco al elemento que lo tenía, solo si el foco
  quedó en `<body>` y ese elemento sigue en la página. `tests/main.test.js` → `7 passed (7)`.
- Navegador, sitio servido en local: tres Tab hasta «Generar paleta», Enter → generación 2 con el
  foco en el botón y `:focus-visible`; otro Enter → generación 3, foco en el botón. Con el foco en la
  página, Espacio → generación 4, el foco sigue en la página y no hay desplazamiento.
- Barra: lint sin errores, Prettier limpio tras formatear, `9 passed (9)` archivos y `151 passed (151)` tests.

## Next

Ninguno. Entra a `main` con el PR de la rama `fix/keep-focus-after-generate`.
