---
author: HRamiroAlbornoz
branch: chore/security-headers
status: in-progress
---
# Cabeceras de seguridad

## Intent

La auditoría del 2026-10-23 encontró que el sitio publicado solo devuelve `Strict-Transport-Security`,
que Vercel pone por su cuenta. Faltan las capas de defensa que limitan el daño si alguna vez se
colara una inyección o si otro sitio quisiera meter la página en un `<iframe>`.

## Scope

- Dentro: un bloque `headers` en `vercel.json` para todas las rutas con `Content-Security-Policy`,
  `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. El script
  inline del `<head>` se autoriza por su hash, nunca con `'unsafe-inline'` (spec, restricción 6), y
  un test verifica que el hash declarado coincide con el script.
- Fuera: HSTS, que Vercel ya aplica.

## Checklist

- [x] Tests en `smoke.test.js` — prueba: rojo antes de escribir las cabeceras.
- [x] Cabeceras en `vercel.json` — prueba: los mismos tests en verde.
- [ ] La app funciona con la CSP — prueba: preview de Vercel sin violaciones de CSP en la consola y con generar, copiar, tema y archivo andando.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.
- [ ] Documento cerrado en el último commit del PR — prueba: `status: done` antes del merge.

## Evidence

- Rojo: los tres tests de `security headers in vercel.json` fallaron sin las cabeceras (`3 failed | 12 passed`).
- Verde: con las cabeceras, `smoke.test.js` → `15 passed (15)`.
- El test del hash puede fallar: con un espacio de más en el script del `<head>` falló, y volvió a
  verde al revertirlo; `git diff index.html` quedó vacío.
- Barra: lint sin errores, Prettier limpio, `9 passed (9)` archivos y `154 passed (154)` tests.

## Next

Verificar la CSP en el preview de Vercel: cabeceras recibidas, consola sin violaciones propias de la
app, y generar, copiar, cambiar tema y guardar un lote andando.
