# 0001 · JavaScript vanilla sin framework ni build step

- **Fecha:** 2026-09-04
- **Estado:** Aceptada

## Contexto

El default de este equipo para cualquier frontend es Vite + React + TypeScript en strict mode, con
validación de datos externos mediante Zod. Es la configuración con la que se arranca sin discutir.

Este proyecto llega con un stack fijado desde afuera: HTML, CSS y JavaScript, servidos como archivos
estáticos. El alcance es una sola pantalla sin rutas, sin backend, sin autenticación y sin datos
remotos. El estado total del dominio son entre 6 y 9 colores y una lista de paletas guardadas.

## Decisión

Se construye con HTML, CSS y JavaScript vanilla usando ES modules nativos del navegador, sin
bundler y sin paso de compilación. Los archivos que se editan son exactamente los que se sirven.

Se conserva un `package.json` con `devDependencies` (ESLint, Prettier, Vitest, jsdom) para lint y
tests. Nada de eso llega al sitio publicado.

## Alternativas descartadas

**Vite + React + TypeScript.** Es el default del equipo y el que más se parece a un trabajo real.
Se descarta porque el stack está fijado por un requisito externo, y porque React resolvería un
problema que este proyecto no tiene: no hay estado compartido entre pantallas, no hay rutas, y el
árbol de UI es una lista de 9 elementos que se repinta entera. El costo de traer un framework aquí
se paga entero y el beneficio no aparece.

**Vite + TypeScript sin framework.** Conservaría el chequeo de tipos y Zod sin sumar React. Se
descarta porque reintroduce el paso de compilación: lo que se edita deja de ser lo que se sirve, y
eso contradice el stack fijado y complica la publicación de un sitio estático.

**Verificación de tipos con `// @ts-check` y anotaciones JSDoc.** Daría chequeo de tipos sin
compilar. Se descarta porque las anotaciones JSDoc son comentarios, y este proyecto tiene una
instrucción explícita de no escribir comentarios en el código.

## Consecuencias

**Se pierde:**

- Chequeo estático de tipos. Los errores que TypeScript atrapa en el editor acá se atrapan en los
  tests o en el navegador. Se compensa con ESLint, con una suite de tests sobre la lógica pura y
  con CI corriendo ambos en cada push.
- Validación de datos externos con Zod. Ver [0003](0003-validacion-manual-de-localstorage.md).
- Los tres estados de carga que impondría un framework con fetch. No aplican: todo es síncrono y
  local.

**Se gana:**

- El sitio se publica copiando archivos. No hay build que pueda fallar entre lo que se probó y lo
  que se sirve.
- Cero dependencias en producción, y por lo tanto cero superficie de vulnerabilidades de terceros
  en el navegador del usuario.
- Los nombres de funciones y módulos cargan solos el significado, porque no hay tipos ni comentarios
  que lo expliquen. Eso vuelve la disciplina de nombres un requisito, no una preferencia.

**Cuándo revisar esta decisión:** si el proyecto sumara rutas, sesión de usuario o datos remotos,
las tres razones que sostienen esta decisión desaparecen a la vez y corresponde escribir un ADR
nuevo que reemplace a este.
