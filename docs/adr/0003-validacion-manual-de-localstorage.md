# 0003 · Validación manual de localStorage en vez de Zod

- **Fecha:** 2026-09-04
- **Estado:** Aceptada

## Contexto

La regla de trabajo de este equipo es categórica: todo dato externo se valida con Zod, y
`localStorage` está nombrado explícitamente entre esos datos externos. El motivo también está
escrito: aunque el dato lo haya escrito la propia aplicación, puede estar corrupto, tener el esquema
de una versión anterior, o haber sido editado a mano desde las herramientas de desarrollo.

El proyecto guarda paletas en `localStorage` y las vuelve a leer al cargar la página, así que el
riesgo es real y no teórico.

Pero el proyecto no tiene bundler ni paso de compilación (ver
[0001](0001-javascript-vanilla-sin-framework-ni-build.md)). Zod es un paquete de npm pensado para
resolverse en tiempo de build.

## Decisión

Se valida a mano, con una función dedicada en el módulo de almacenamiento que cumple exactamente la
misma responsabilidad que cumpliría un `safeParse` de Zod: recibe lo que devuelve `localStorage`,
verifica la forma completa del dato, y ante cualquier discrepancia devuelve un estado inicial seguro
en lugar de propagar un dato inválido.

La validación verifica que el valor parseado sea un array, que cada paleta tenga identificador y
marca de tiempo, que sus colores sean un array de tamaño permitido (6, 8 o 9), y que cada color
tenga tono, saturación y luminosidad numéricos dentro de rango. Todo el acceso a `localStorage` está
encapsulado en ese único módulo; ningún otro archivo lo toca.

## Alternativas descartadas

**Importar Zod desde un CDN como módulo ES.** Funcionaría sin bundler. Se descarta porque agrega una
dependencia de red en tiempo de ejecución a una aplicación cuyo principio es funcionar sin red: si
el CDN no responde, la app no arranca. Además introduce una tercera parte en el navegador del
usuario en un proyecto que hoy tiene cero dependencias en producción.

**Incorporar el bundle de Zod como archivo en el repositorio.** Evitaría la dependencia de red. Se
descarta porque es una dependencia sin gestor: no la actualiza `npm audit`, no la reporta
Dependabot, y queda congelada en la versión que se copió.

**Introducir un bundler solo para poder usar Zod.** Se descarta porque invierte la relación entre
problema y solución: se agregaría un paso de compilación a todo el proyecto para validar un único
punto de entrada de datos.

**Un `try/catch` sin validación de forma.** Es lo que se hace habitualmente y es justamente el
anti-patrón que la regla original existe para evitar: atrapa el error de parseo pero deja pasar un
JSON válido con la forma equivocada, que es el caso más probable después de un cambio de esquema.

## Consecuencias

- La regla de validar datos externos se cumple en sustancia, no en la letra: hay verificación de
  forma y hay retorno a un estado seguro. Lo que se pierde es que el esquema y el tipo se deriven de
  una única fuente, porque aquí no hay tipos.
- La función de validación es lógica pura y se testea sin navegador: entrada corrupta, entrada con
  esquema viejo, entrada válida, y `localStorage` no disponible.
- Si el esquema de una paleta cambiara en el futuro, hay que actualizar la validación en el mismo
  cambio. Al no haber tipos, nada rompe la compilación si alguien lo olvida: el test es la única
  red, y por eso es obligatorio.
- Si el proyecto adoptara un bundler más adelante, esta decisión pierde su fundamento y corresponde
  un ADR nuevo que la reemplace.
