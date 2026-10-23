# Pendientes

Deuda abierta. Cada entrada se borra de este archivo cuando el slice que la resuelve cierra.

La deuda del Cierre del release 1 (candado sin silueta propia, `<dl>` dentro de `<button>`, tamaños
escritos a mano en el HTML, lectura duplicada de radios, creación de botones repetida y ternario de
formato duplicado) se resolvió en los slices 1 y 2 del release 2.

La revisión de diseño pendiente desde el release 1 se hizo en el Cierre del release 2: la interfaz
«Estudio» se recorrió contra `docs/design-direction.md` y su único hallazgo, la tarjeta sola en el
panel de contraste, quedó resuelto.

La duración de la animación de salida, que asumía milisegundos, ahora lee la unidad del token (`ms`
o `s`); se resolvió en la rama `fix/exit-duration-units`.

No hay deuda abierta.
