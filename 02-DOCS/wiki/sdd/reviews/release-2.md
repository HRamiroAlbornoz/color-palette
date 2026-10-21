---
type: review
title: Revisión — release-2
description: Revisión adversarial del release 2 («Estudio») contra la spec y la constitución.
tags: [sdd, review]
timestamp: 2026-10-21T23:10:00Z
topic: sdd
slug: release-2
source_state: a16a624 (clean)
---

# Revisión — release-2

Alcance: `git diff 069a3de aeed920` sobre `index.html`, `css/`, `js/` y `tests/`. Sin spec ni plan
en `02-DOCS`: se revisa contra `docs/spec.md` y la constitución v1.0.0.

## Pasadas

1. **Fidelidad a la spec** — limpia. Los criterios F7 a F11 están cumplidos con evidencia en
   `verifications/release-2-2026-10-21.md`.
2. **Correctitud** — limpia. Generar, restaurar, bloquear y el atajo respetan `isGenerating`;
   tamaño y formato quedan deshabilitados durante la salida.
3. **Contratos y datos** — limpia. El tema y el archivo se validan contra listas cerradas antes de usarse.
4. **Seguridad** — limpia. Sin `innerHTML`; todo dato llega por `textContent` o atributos; sin pedidos a terceros.
5. **Tests como evidencia** — ver hallazgo 1.
6. **Constitución y encaje** — ver hallazgos 2 a 6.

## Hallazgos

```text
[should-fix] tests: main.js no tiene tests (principio 8)
  where:  js/main.js:255  generatePalette, y los handlers de restaurar y guardar
  why:    la guarda isGenerating (F10.3), el aviso con todo bloqueado (F4.4/F10.4) y que restaurar
          sincronice el tamaño solo se prueban a mano. Un cambio que los rompa deja la suite en verde.
  fix:    tests/main.test.js con jsdom que cargue index.html y main.js y ejercite esos caminos.

[should-fix] docs: README desactualizado
  where:  README.md:9, 13-20, 29, 83, 90, 116
  why:    dice "en desarrollo" sin demo; no lista ninguna feature del release 2; pide Node 20 cuando
          .nvmrc fija 24; dice WCAG 2.1 (la constitución fija 2.2); dice que solo se respeta
          prefers-color-scheme; y que ningún otro archivo toca localStorage, olvidando la excepción
          del <head>.
  fix:    actualizarlo en este Cierre.

[should-fix] seo: falta <meta name="description">
  where:  index.html:3-26
  why:    Lighthouse SEO 75. Es una pieza de portfolio: el resultado de búsqueda y la vista previa al
          compartir el enlace salen sin descripción.
  fix:    agregar la meta description en el <head>.

[nit] favicon.ico responde 404 y deja un error en la consola
  where:  index.html (sin <link rel="icon">)
  fix:    agregar un ícono propio o un <link rel="icon"> que apunte a uno.

[nit] panel de contraste con 9 colores deja una tarjeta sola en la última fila
  where:  css/components.css (.contrast-list), visto a 1440px
  why:    F8.5 se cumple (no desborda), pero la banda de la paleta nunca deja un color solo (F11.4)
          y docs/design-direction.md pide que "nada flote".
  fix:    aplicar al panel la misma regla de filas que a la banda, o aceptarlo.

[nit] la duración de salida se lee con parseFloat y asume milisegundos
  where:  js/render.js:263  getExitAnimationDuration
  why:    si --transition-base se escribiera en segundos ("0.2s"), el tiempo de espera sería 0,2 ms.
          Hoy está en ms y funciona.
```

## Herramientas de desarrollo

`npm audit` reporta 4 avisos en `devDependencies` (vitest, vite, brace-expansion, source-map-js).
No llegan al sitio; se corrigen con `npm audit fix`.

## Veredicto: APPROVE WITH NITS para el código publicado; los should-fix entran en el Cierre.
