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
