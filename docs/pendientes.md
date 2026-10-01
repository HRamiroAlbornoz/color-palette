# Pendientes

Deuda detectada en el Cierre del release 1. Ninguno de estos hallazgos bloqueó el cierre: se
clasificaron como deuda porque son mejoras de mantenibilidad de bajo riesgo, no bugs de
comportamiento ni brechas de la spec.

**Release 2 (2026-10-01): todas las entradas entran en el alcance.** El rediseño «Estudio» reescribe
las muestras, así que el candado (F4.3), el `<dl>` dentro del `<button>` y los tamaños en el HTML
(restricciones de implementación 1 y 2 de la spec) quedan escritos en la spec; la fábrica de botones y los dos helpers se hacen en
la misma reescritura. Cada entrada se borra de este archivo cuando su slice cierra.

## `DESIGN.md` nunca se generó

- **Dónde apareció:** planificación del release 2 (cuarta revisión del plan)
- **Qué pasa:** el contrato de dirección (`FINISH`) dice que el trabajo de diseño termina con la
  revisión final, el veredicto y `DESIGN.md`, y `CLAUDE.md` aclara que en Impeccable 4.x ese archivo
  lo escribe el documenter al final, desde lo construido. El release 1 cerró sin ejecutar ese paso.
- **Por qué no se arregló:** no se detectó en el Cierre del release 1; el flujo de Hernán no tiene
  un paso explícito para el documenter.
- **Qué habría que hacer:** en el Cierre del release 2, después de `impeccable critique`, correr el
  documenter de Impeccable para que escriba `DESIGN.md` desde la interfaz «Estudio» terminada.

## El candado distingue bloqueado/desbloqueado por relleno, no por una silueta distinta

- **Dónde apareció:** release 1, revisión de Cierre (`mattpocock-skills:code-review`, eje Spec)
- **Qué pasa:** F4.3 pide que "cambie la forma del indicador" además del texto accesible. El
  candado actual (`.lock-button` en `css/components.css`) distingue el estado con un círculo hueco
  (desbloqueado) vs. relleno (bloqueado) del mismo tamaño y `border-radius`: es una distinción de
  forma real (disco vs. anillo), pero más sutil que una silueta completamente distinta. Dos rondas
  de QA humano lo validaron sin objeciones como "no depende del color".
- **Por qué no se arregló:** un indicador con silueta más inequívoca (ej. un glifo de candado
  abierto/cerrado) requiere diseño custom que hoy no existe en el proyecto, y la dirección visual de
  Impeccable para esta superficie prohíbe explícitamente iconografía genérica de librería —
  cualquier glifo nuevo tendría que dibujarse a mano. No se justificaba ese trabajo de diseño en esta
  vuelta del release con el criterio ya satisfecho de forma razonable.
- **Qué habría que hacer:** en un release futuro, diseñar (a mano, sin librería de íconos) un
  glifo de candado abierto/cerrado que reemplace el círculo relleno/hueco, y verificarlo con
  `impeccable critique` si el bloqueo de Windows Smart App Control para el binario se resuelve.

## Creación de botones repetida sin factory compartida

- **Dónde apareció:** release 1, revisión de Cierre (`/code-review`)
- **Qué pasa:** `js/render.js` repite el mismo patrón (`createElement('button')` + `type` +
  `className` + `addEventListener`) en cuatro lugares: el candado, el botón de copiar color, y los
  botones «Restaurar»/«Borrar» del archivo.
- **Por qué no se arregló:** bajo riesgo, cero impacto de comportamiento; el release ya tenía
  suficientes cambios de fondo (correctitud, accesibilidad) para esta vuelta.
- **Qué habría que hacer:** extraer un `createButton(className, { text, onClick })` en `render.js`
  y usarlo en los cuatro sitios.

## Ternario `format === 'hsl'` duplicado entre `color.js` y `render.js`

- **Dónde apareció:** release 1, revisión de Cierre (`/code-review`)
- **Qué pasa:** `getPrimaryCode` (color.js) decide el código primario según el formato; 
  `createSwatchElement` (render.js) vuelve a testear la misma condición para el dato secundario, en
  vez de derivarlo de una única fuente.
- **Por qué no se arregló:** bajo riesgo hoy (solo dos formatos); se vuelve más urgente si se agrega
  un tercer formato.
- **Qué habría que hacer:** un `getSecondaryCode(color, hex, format)` en `color.js`, simétrico a
  `getPrimaryCode`.

## `<dl>` y `<p>` anidados dentro de un `<button>` (HTML inválido)

- **Dónde apareció:** release 1, revisión de Cierre (`/code-review`, eje cross-file)
- **Qué pasa:** `createSwatchElement` mete un `<p>` y un `<dl>` (contenido de flujo) dentro de un
  `<button>`, que según el modelo de contenido de HTML5 solo admite contenido de frase. El problema
  de accesibilidad que esto causaba (el `aria-label` del botón ocultaba el ratio de contraste a
  lectores de pantalla) ya se resolvió con `aria-describedby` en este mismo Cierre. Lo que queda
  pendiente es solo la validez estructural del HTML, no un problema de accesibilidad activo.
- **Por qué no se arregló:** arreglarlo de raíz implica sacar el `<dl>` del `<button>` y
  reposicionarlo con CSS (grid o absolute) para mantener el mismo layout visual — cambio de mayor
  superficie y riesgo de regresión visual que no se justificaba en esta vuelta, con el síntoma real
  ya resuelto.
- **Qué habría que hacer:** mover `codeDisplay` y `dataList` a hermanos del botón dentro de
  `<li class="swatch">`, y lograr la superposición visual sobre el color con `position: absolute`
  en vez de con anidamiento en el DOM.
