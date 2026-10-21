---
author: HRamiroAlbornoz
branch: chore/release-2-closure
status: done
---
# Documentación del Cierre del release 2

## Intent

Dejar la spec y la deuda al día con lo que se verificó en el Cierre: el recorrido del release 2 en
la sección 9 de `docs/spec.md`, las tres desviaciones conocidas y `docs/pendientes.md` sin el
pendiente que ya se resolvió.

## Scope

- Dentro: sección 9 de `docs/spec.md`; `docs/pendientes.md`.
- Fuera: código. El nit de `getExitAnimationDuration` se anota como deuda, no se arregla.

## Checklist

- [x] Sección 9 reescrita — prueba: cada afirmación respaldada por `verifications/release-2-2026-10-21.md` o atribuida al release 1.
- [x] Desviaciones anotadas — prueba: las tres de la memoria del release 2 contrastadas con el código (`js/shortcut.js`, `js/render.js`, `js/main.js`).
- [x] `docs/pendientes.md` al día — prueba: sin la revisión de diseño, con el nit de la revisión.
- [x] Barra de calidad — prueba: `npm run format:check` y `npm test` en verde.

## Evidence

- Sección 9: los flujos del release 2 (teclado, tema, todo bloqueado, tope, tema inválido) salen del
  registro de verificación. Los tres casos de error no recorridos hoy quedan atribuidos al release 1
  y a sus tests de `storage.js` y `clipboard.js`.
- Desviaciones: `trackKeyboardFocus` en `js/shortcut.js:15`; el foco diferido con `setTimeout` en
  `js/main.js:281`; la nota real con `describeContrast` en `js/render.js:94`.
- Prettier limpio; `9 passed (9)` archivos y `147 passed (147)` tests.

## Next

Ninguno. Mergeado en `main` con el PR #13 el 2026-10-21 (`24f58cc`).
