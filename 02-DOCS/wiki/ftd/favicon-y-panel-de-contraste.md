---
author: HRamiroAlbornoz
branch: chore/release-2-closure
status: in-progress
---
# Favicon y panel de contraste alineado con la banda

## Intent

Dos nits de `02-DOCS/wiki/sdd/reviews/release-2.md`. El navegador pide `favicon.ico`, recibe un 404 y
deja un error en la consola de cualquiera que inspeccione la página. Y el panel de contraste reparte
sus tarjetas por ancho (`auto-fit`), así que con 9 colores puede dejar una sola en la última fila,
contra el «nada flota» de `docs/design-direction.md`.

## Scope

- Dentro: un `<link rel="icon">` con un SVG embebido (fondo grafito y tres franjas de color), y el
  panel de contraste con las mismas columnas que la banda desde 1024px y 3 columnas por debajo.
  `docs/design-direction.md` y `decisions.md` actualizados.
- Fuera: el contenido de las tarjetas; F8 no cambia.

## Checklist

- [x] Test de favicon en `smoke.test.js` — prueba: rojo antes de agregar el `<link>`, verde después.
- [x] Panel sin tarjeta sola — prueba: medición en el navegador, rojo antes (9 colores a 1440px: 8 + 1) y verde después en 320, 768, 1024 y 1440 con 6, 8 y 9 colores.
- [x] Desde 1024px, cada tarjeta empieza bajo su color — prueba: diferencia de borde izquierdo por columna medida en el navegador.
- [x] Sin pedido a `favicon.ico` ni errores en consola — prueba: pestaña de red servida en local.
- [x] La banda sigue igual — prueba: misma cantidad de filas que en la verificación del release 2.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.

## Evidence

- Favicon, rojo: `1 failed | 11 passed (12)`. Verde: `12 passed (12)`.
- Panel, rojo (antes del cambio, 1440px): 9 colores → tarjetas `[8, 1]` con la banda en `[9]`.
- Panel, verde (filas de tarjetas = filas de la banda, sin tarjeta sola ni desborde):
  - 1440px: `[6]`, `[8]`, `[9]`.
  - 1024px: `[3, 3]`, `[4, 4]`, `[5, 4]`.
  - 768px: `[3, 3]`, `[3, 3, 2]`, `[3, 3, 3]`.
  - 320px: `[3, 3]`, `[3, 3, 2]`, `[3, 3, 3]`; tarjetas de 91px, la nota pasa a una segunda línea.
- Alineación: cada tarjeta empieza a 7px o menos del borde de su color. Los 7px son el espacio entre
  tarjetas (la banda no tiene espacio entre colores); con 6 colores no se nota.
- Banda: mismas filas que en `verifications/release-2-2026-10-21.md` en los cuatro anchos.
- Red en local: 14 pedidos, ninguno a `favicon.ico`; consola sin mensajes.
- Barra: lint sin errores, Prettier limpio, `9 passed (9)` archivos y `147 passed (147)` tests.

## Next

Commit (lo corre Hernán). Después, abrir el PR del Cierre.
