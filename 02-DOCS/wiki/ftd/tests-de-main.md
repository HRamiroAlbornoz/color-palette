---
author: HRamiroAlbornoz
branch: chore/release-2-closure
status: done
---
# Tests de main.js

## Intent

`js/main.js` es el único módulo sin tests (principio 8). Ahí vive la coordinación que ningún otro
test cubre: la guarda que evita generar dos veces, el aviso con todo bloqueado, restaurar un lote,
el tope del archivo y la persistencia del tema. Hoy se verificó solo a mano, en el navegador.
Hallazgo should-fix de `02-DOCS/wiki/sdd/reviews/release-2.md`.

## Scope

- Dentro: `tests/main.test.js`, que carga `index.html` en jsdom e importa `main.js` como lo hace la
  página. Casos por riesgo: doble generación (F10.3), todo bloqueado (F4.4 y F10.4), restaurar
  (F8.3, F9.4 y F11.8), tope del archivo (F5) y tema (F7.4).
- Fuera: cambios en `js/main.js`. Son tests de caracterización de un comportamiento que ya funciona.

## Checklist

- [x] Los cinco casos pasan contra el código actual — prueba: `npx vitest run tests/main.test.js`.
- [x] Cada caso puede fallar — prueba: romper a propósito la línea que protege y ver el rojo, luego revertir.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde; `git diff js/` vacío.

## Evidence

- Verde: `tests/main.test.js` → `6 passed (6)` (el caso de todo bloqueado corre dos veces: botón y
  Espacio). Repetido tres veces seguidas, siempre `6 passed`.
- Mutaciones, cada una revertida antes de la siguiente:
  1. Sin la guarda `isGenerating` → falla «generates only once…».
  2. Sin el chequeo `isFullyLocked` → fallan los dos casos de todo bloqueado.
  3. Restaurar sin `renderSizeOptions()` → falla «restores a saved batch…».
  4. Sin el `return` tras el aviso de tope → falla «refuses to save a 13th batch…».
  5. Sin `saveThemePreference` → falla «remembers a forced theme…».
- Límite: cada mutación prueba que ese caso detecta la rotura de esa línea, no toda rotura posible del flujo.
- `git diff --stat js/` vacío al terminar.
- Barra: lint sin errores, Prettier limpio tras formatear el archivo nuevo, `9 passed (9)` archivos y
  `146 passed (146)` tests.

## Next

Ninguno. Mergeado en `main` con el PR #13 el 2026-10-21 (`24f58cc`).
