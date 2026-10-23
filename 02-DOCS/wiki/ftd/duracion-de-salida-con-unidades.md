---
author: HRamiroAlbornoz
branch: fix/exit-duration-units
status: done
---
# Duración de salida con unidades

## Intent

`getExitAnimationDuration` (`js/render.js`) lee el token `--transition-base` con `parseFloat` y toma
el número como milisegundos. Si el token se escribiera en segundos (`0.2s`), la app esperaría 0,2 ms
en lugar de 200 ms y cortaría la animación de salida. Es la deuda anotada en `docs/pendientes.md`.

## Scope

- Dentro: leer la unidad del token (`ms` o `s`) y convertir a milisegundos; un valor vacío o que no
  sea una duración válida no espera nada, igual que hoy con movimiento reducido.
- Fuera: el valor del token en `css/tokens.css`, que sigue siendo `200ms`.

## Checklist

- [x] Tests en `tests/render.test.js` para `200ms`, `0.2s` y valor vacío — prueba: `0.2s` falla antes del arreglo (rojo).
- [x] Arreglo en `js/render.js` — prueba: los mismos tests pasan (verde).
- [x] La app sigue esperando 200 ms con el token real — prueba: test con `200ms` en verde.
- [x] `docs/pendientes.md` sin esta deuda — prueba: la entrada ya no está.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.
- [x] Documento cerrado en el último commit del PR — prueba: `status: done` antes del merge.

## Evidence

- Primer intento de rojo, descartado: fallaban `200ms` y el valor vacío, y `0.2s` pasaba. El fallo
  era del test: la función auxiliar esperaba un solo paso de microtareas y `Promise.all` necesita
  varios. Corregida para vaciar la cola antes de mirar.
- Rojo correcto: `waits the full 200 milliseconds when the token is 0.2s` → `expected true to be
  false` (la espera terminaba antes de los 199 ms); `200ms` y el valor vacío en verde.
- Verde: `parseCssDurationInMs` lee `ms` o `s`; `tests/render.test.js` → `54 passed (54)`.
- `docs/pendientes.md`: entrada quitada; queda «No hay deuda abierta».
- Barra: lint sin errores, Prettier limpio, `9 passed (9)` archivos y `150 passed (150)` tests.

## Next

Ninguno. Entra a `main` con el PR de la rama `fix/exit-duration-units`.
