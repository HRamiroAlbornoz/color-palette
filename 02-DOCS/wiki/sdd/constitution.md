---
type: constitution
title: color-palette — Constitución
description: Los principios no negociables que obedece cada fase de rsc-sdd.
tags: [sdd, constitution]
timestamp: 2026-10-21T22:30:00Z
topic: sdd
version: v1.0.0
---

# color-palette — Constitución

> Versión: v1.0.0 · Ratificada: 2026-10-21 · Última enmienda: —
> Los principios no negociables que obedece cada fase de rsc-sdd. Qué hace la aplicación vive en
> `docs/spec.md`; cómo se ve, en `docs/design-direction.md`. Este archivo ratifica el
> principio y enlaza el detalle.

## 1. Canon del stack

1. HTML, CSS y JavaScript vanilla con ES modules nativos, sin framework y sin build step: los
   archivos que se editan son los que se sirven. `package.json` no tiene script `build`.
   Detalle: `docs/adr/0001-javascript-vanilla-sin-framework-ni-build.md`.
2. Cero dependencias de producción: `package.json` no tiene `dependencies`, solo
   `devDependencies` (ESLint, Prettier, Vitest, jsdom). Agregar una es enmienda MAJOR y exige una
   decisión registrada que reemplace al ADR 0001.
3. CSS plano con custom properties, sin Tailwind ni preprocesadores.
4. Node según `.nvmrc`, solo para las herramientas. npm con `package-lock.json` commiteado; el CI
   instala con `npm ci`.

## 2. Barra de calidad

5. `npm run lint` y `npm run format:check` pasan sin errores. Lo exige el job `quality` del CI,
   que es check obligatorio para mergear en `main`.
6. No hay type checker: el código no lleva tipos (ADR 0001). Su lugar lo ocupan los tests y el lint.
7. TDD estricto: cada tarea de código empieza con un test que falla (rojo), sigue con el código
   mínimo que lo pasa (verde) y termina con el refactor. La evidencia queda en el registro de
   progreso de la fase `implement`.
8. Cada módulo de `js/` tiene su `tests/<módulo>.test.js`, y cada criterio de aceptación de
   `docs/spec.md` que se pueda verificar en código tiene al menos un test. `npm test` pasa.

## 3. Convenciones

9. El código no lleva comentarios. Si una función necesita explicación, se renombra.
10. Commits en inglés y en modo imperativo, sin gitmoji ni prefijos de Conventional Commits.
11. `js/storage.js` es el único módulo que lee y escribe `localStorage`, salvo la excepción
    documentada del script de tema en el `<head>` (`docs/spec.md`, restricción 3). Los datos
    leídos se validan a mano antes de usarse, sin Zod (`docs/adr/0003-validacion-manual-de-localstorage.md`).

## 4. Ramas y publicación

12. Una rama por feature, creada desde `main`, con prefijo `feature/`, `fix/` o `chore/`. Entra
    solo por Pull Request con el CI en verde y se mergea desde la interfaz de GitHub. `main` está
    protegida: sin push directo y sin force push, también para administradores.
13. **La autoría de git es humana.** Commits y PRs son de Hernán: sin `Co-Authored-By` de una IA y
    sin pie «generated with». Los comandos de git que escriben, los de `gh` que tocan el remoto y
    los que instalan dependencias los corre Hernán.
14. Vercel es el único proveedor. Cada PR se verifica en su deploy de preview antes del merge.
    `vercel.json` declara `outputDirectory` y no `buildCommand`, y `.vercelignore` funciona como
    lista blanca.

## 5. Piso de seguridad y privacidad

15. No se commitea ningún secreto. Si alguna herramienta lo necesita, va en
    `01-TOOLS/<proveedor>/.env`, que está gitignorado.
16. La aplicación no hace pedidos a terceros: tipografías autoalojadas, sin CDN y sin analytics.
    El único enlace externo es el crédito al repositorio.
17. Ningún dato dinámico se inserta como HTML: se usa `textContent` o se crean nodos, nunca
    `innerHTML`. Si se agrega una Content-Security-Policy, el script inline se autoriza por hash y
    nunca con `'unsafe-inline'` (`docs/spec.md`, restricción 6).

## 6. Piso de accesibilidad e interfaz

18. Todo texto cumple el contraste WCAG 2.2 AA en ambos temas, incluido el texto superpuesto a un
    color aleatorio. Todo control se alcanza con el teclado y tiene foco visible. Con
    `prefers-reduced-motion: reduce` no hay animaciones de entrada. Detalle: `docs/spec.md`, F6, F7 y F11.
19. Mobile-first: la interfaz funciona desde 320px de ancho sin scroll horizontal.
20. Todo cambio visual se revisa contra `docs/design-direction.md`, sin herramientas externas de
    diseño. Si la interfaz construida se aparta del documento, el documento se actualiza en el
    mismo PR. Su contenido no se copia al código ni a ningún archivo que llegue al navegador.

## 7. Presupuesto de rendimiento

21. El rendimiento se garantiza por construcción: sin build, sin dependencias de producción y sin
    pedidos de red fuera del propio origen (principios 1, 2 y 16). Las fuentes son `.woff2`
    precargadas con `font-display: swap`. No se muestra un estado de carga falso.

## 8. Conocimiento y decisiones

22. Toda decisión significativa se agrega a `02-DOCS/wiki/sdd/decisions.md` con fecha, opciones y
    motivo. Los ADR 0001 a 0003 de `docs/adr/` siguen vigentes como historial. Una decisión que
    reemplace a uno de ellos se registra en `decisions.md` y lo cita. Esta constitución es el
    registro de decisiones de mayor rango.

## Definición de terminado (la barra que corre `verify`)

Un cambio se publica solo si se cumple todo:

- [ ] Lint y Prettier limpios (principio 5).
- [ ] TDD seguido y tests en verde; módulo y criterios cubiertos (principios 7 y 8).
- [ ] Sin dependencias de producción ni build step nuevos (principios 1 a 3).
- [ ] Sin comentarios, commits en inglés imperativo y `localStorage` solo vía `storage.js` (principios 9 a 11).
- [ ] En rama propia, por PR con CI en verde, con autoría humana y verificado en el preview de Vercel (principios 12 a 14).
- [ ] Sin secretos, sin pedidos a terceros y sin `innerHTML` con datos (principios 15 a 17).
- [ ] Contraste AA, teclado, foco, movimiento reducido y 320px; dirección visual auditada (principios 18 a 20).
- [ ] Decisiones significativas registradas (principio 22).

## Registro de enmiendas (solo se agregan filas)

| Fecha | Versión | Cambio | Motivo |
|-------|---------|--------|--------|
| 2026-10-21 | draft | Borrador generado por `rsc onboard`. | El piso SDD necesita una constitución; ratificarla le corresponde a la fase `constitution`. |
| 2026-10-21 | v1.0.0 | Ratificada con 22 principios. El principio 20 revisa contra `docs/design-direction.md` en lugar de Impeccable. | Hernán aprobó la propuesta y dejó de usar Impeccable. |
