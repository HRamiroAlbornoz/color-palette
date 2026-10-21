# Pendientes

Deuda abierta. Cada entrada se borra de este archivo cuando el slice que la resuelve cierra.

La deuda del Cierre del release 1 (candado sin silueta propia, `<dl>` dentro de `<button>`, tamaños
escritos a mano en el HTML, lectura duplicada de radios, creación de botones repetida y ternario de
formato duplicado) se resolvió en los slices 1 y 2 del release 2.

La revisión de diseño pendiente desde el release 1 se hizo en el Cierre del release 2: la interfaz
«Estudio» se recorrió contra `docs/design-direction.md` y su único hallazgo, la tarjeta sola en el
panel de contraste, quedó resuelto.

## La duración de la animación de salida asume milisegundos

- **Dónde apareció:** revisión del Cierre del release 2 (`02-DOCS/wiki/sdd/reviews/release-2.md`).
- **Qué pasa:** `getExitAnimationDuration` en `js/render.js` lee `--transition-base` con `parseFloat`
  y toma el número como milisegundos. Si el token se escribiera en segundos (`0.2s`), la espera
  duraría 0,2 ms y la animación de salida se cortaría.
- **Por qué no se arregló:** hoy el token está en milisegundos (`200ms`) y funciona. Es un riesgo
  para un cambio futuro, no un bug actual.
- **Qué habría que hacer:** leer la unidad del valor y convertir los segundos, con un test para cada
  unidad.
