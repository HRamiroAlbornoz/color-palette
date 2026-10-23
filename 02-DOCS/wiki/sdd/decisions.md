---
type: decisions
title: color-palette — Registro de decisiones
description: Decisiones significativas del proyecto, con fecha, opciones y motivo. Solo se agregan entradas.
tags: [sdd, decisions]
topic: sdd
---

# Registro de decisiones

Las decisiones anteriores a este registro están en `docs/adr/` (ADR 0001 a 0003) y siguen vigentes.

## 2026-10-21 · Dónde se registran las decisiones

- **Opciones:** seguir con ADRs en `docs/adr/`; pasar a este registro; usar ambos.
- **Elegida:** este registro.
- **Motivo:** es el lugar donde lo leen las fases de rsc-sdd. Los ADRs existentes quedan como
  historial y una decisión que reemplace a uno de ellos lo cita.

## 2026-10-21 · Piso de tests

- **Opciones:** un test por módulo y por criterio, sin porcentaje; cobertura mínima del 80%; TDD estricto.
- **Elegida:** TDD estricto, más un test por módulo y por criterio verificable.
- **Motivo:** es lo que exige la fase `implement`. No se fija porcentaje porque hoy no se mide
  cobertura y medirla agregaría una dependencia de desarrollo.

## 2026-10-21 · Presupuesto de rendimiento

- **Opciones:** solo reglas verificables en el código; además, Lighthouse móvil ≥ 90 en cada preview.
- **Elegida:** solo reglas verificables.
- **Motivo:** sin build, sin dependencias de producción y sin pedidos a terceros, el rendimiento
  queda garantizado por construcción y se comprueba leyendo el código.

## 2026-10-21 · Formato de commits frente a RSC

- **Opciones:** adoptar gitmoji con Conventional Commits, como prescribe RSC; mantener inglés imperativo sin prefijos.
- **Elegida:** mantener inglés imperativo sin prefijos.
- **Motivo:** el historial del repositorio ya sigue ese formato y es la convención declarada en `CLAUDE.md`.

## 2026-10-21 · Se deja de usar Impeccable

- **Opciones:** conservar el contrato de dirección como documento propio; quitar Impeccable solo de
  la constitución; descartar la dirección escrita y tomar como referencia lo construido.
- **Elegida:** conservar el contrato como documento propio en `docs/design-direction.md`.
- **Motivo:** Hernán dejó de usar la herramienta, pero la dirección visual del release 2 sigue
  vigente y es la referencia de cualquier cambio de interfaz. La carpeta `.impeccable/` se borra;
  su historial queda en git.

## 2026-10-21 · Columnas del panel de contraste

- **Opciones:** las mismas columnas que la banda; llenar por ancho sin dejar una tarjeta sola; dejar
  el `auto-fit` y aceptar la tarjeta sola.
- **Elegida:** las mismas columnas que la banda (3 por debajo de 1024px).
- **Motivo:** la dirección visual pide que nada flote y que cada posición se lea contra una única
  división. Alineada con la banda, cada tarjeta queda debajo de su color y la última fila sigue la
  misma regla que la paleta. Se resuelve solo con CSS, con `:has()` sobre el `data-count` de la banda.

## 2026-10-21 · Favicon embebido

- **Opciones:** SVG embebido en el `<link rel="icon">`; archivo `favicon.svg` sumado a la lista
  blanca de `.vercelignore`.
- **Elegida:** SVG embebido: fondo grafito y tres franjas de color.
- **Motivo:** no agrega un archivo ni un pedido de red, y no exige tocar `.vercelignore`.

## 2026-10-23 · RSC 3.3.0 y la skill `design`

- **Opciones:** quedarse en RSC 3.1.4; actualizar y quitar `design`; actualizar y bloquear `design`
  con una regla; actualizar y adoptar `design`.
- **Elegida:** actualizar a 3.3.0 y adoptar `design` (constitución v2.0.0, principio 23).
- **Motivo:** en 3.3.0, `design` forma parte del piso de skills obligatorias. `rsc sync` la vuelve a
  instalar aunque se la desinstale, y `rsc doctor` la reporta como faltante, así que quitarla no
  era sostenible. Se adopta con la identidad existente como base: `docs/design-direction.md` y
  `css/tokens.css` fijan colores y tipografías, y la skill aporta la composición, la verificación en
  navegador y el registro en `DESIGN.md`. Impeccable sigue sin usarse como herramienta; la skill
  adapta algunas de sus ideas.
