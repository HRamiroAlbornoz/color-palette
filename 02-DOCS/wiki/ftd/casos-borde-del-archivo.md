---
author: HRamiroAlbornoz
branch: fix/archive-edge-cases
status: done
---
# Casos borde del archivo

## Intent

Dos errores menores que encontró la auditoría del 2026-10-23, ambos en el archivo de lotes:

1. **Guardar durante la animación.** «Guardar lote» era la única acción que no esperaba a que
   terminara una generación: en los 200 ms de la salida guardaba la paleta que estaba
   desapareciendo. Restaurar y bloquear ya ignoraban el clic en ese momento.
2. **Números de lote repetidos.** La validación de `localStorage` aceptaba dos lotes con el mismo
   número. La app nunca los genera así, pero si alguien edita el almacenamiento a mano, «Borrar»
   eliminaba los dos de una vez.

## Scope

- Dentro: «Guardar lote» ignora el clic mientras se genera, igual que restaurar y bloquear. Al leer el
  archivo, de cada número repetido se conserva solo el primer lote y se descartan los demás, igual
  que ya se descarta un lote corrupto.
- Fuera: deshabilitar visualmente el botón durante la animación; haría parpadear «Guardar lote» en
  cada generación.

## Checklist

- [x] Test en `tests/main.test.js`: guardar durante la generación no agrega un lote — prueba: rojo antes del arreglo.
- [x] Test en `tests/storage.test.js`: un número repetido deja un solo lote — prueba: rojo antes del arreglo.
- [x] Arreglos en `js/main.js` y `js/storage.js` — prueba: los dos tests en verde.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.
- [x] Documento cerrado en el último commit del PR — prueba: `status: done` antes del merge.

## Evidence

- Rojo, guardar durante la generación: `expected <li class="batch-entry">… to have a length of +0
  but got 1` (se guardaba la paleta que estaba saliendo).
- Rojo, número repetido: `loadArchive` devolvía los tres lotes en lugar de dos.
- Verde: el clic en «Guardar lote» sale temprano con `isGenerating`, igual que restaurar y
  bloquear; `keepFirstBatchOfEachNumber` en `js/storage.js` descarta los números repetidos después
  de validar cada lote. `tests/storage.test.js` y `tests/main.test.js` → `30 passed (30)`.
- Barra: lint sin errores, Prettier limpio, `9 passed (9)` archivos y `156 passed (156)` tests.
- No verificado en el navegador: los dos casos dependen de una ventana de 200 ms y de editar
  `localStorage` a mano; los cubren los tests de integración y de almacenamiento.

## Next

Ninguno. Entra a `main` con el PR de la rama `fix/archive-edge-cases`.
