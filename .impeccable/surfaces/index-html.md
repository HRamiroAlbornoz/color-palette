---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

## Scope

Superficie única, pública sin sesión. Modo de visitante: **Operate** — el visitante viene a completar
una tarea, no a ser persuadido. Una sola pantalla, sin navegación entre rutas.

## Audience and job

Diseñador con oficio de Colorfly Studio, arrancando una propuesta de color sin dirección previa.
Tarea principal: obtener una paleta usable y llevarse los códigos. Un clic para generar; el valor
real está en fijar lo que sirve y volver a tirar sobre el resto hasta converger.

## Content and constraints

Todo el contenido es generado en el cliente: no hay copy de marketing, no hay imágenes, no hay datos
externos. Restricciones vinculantes: WCAG AA, teclado completo con foco visible, mobile-first
320/768/1024, ambos temas por `prefers-color-scheme`, `prefers-reduced-motion`, y CSS plano con
custom properties (sin build step, sin Tailwind, sin preprocesadores).

## Direction contract

THESIS: Cada paleta es un lote de tinte, no una fila de franjas; rechaza la columna a sangre de la
categoría.

OWN-WORLD: Fondo neutro frío, tinta casi negra, filete gris de 1px y un único violeta de sello. Mono
para todo dato, sans solo para chrome. Sin sombras, degradados ni radios mayores a 4px. El color
generado es lo único saturado en pantalla.

STORY: El diseñador entiende que la pantalla es una carta de lote, cree que puede fijar lo que sirve
y volver a teñir el resto, y se lleva el código copiado.

FIRST VIEWPORT: Cabecera reglada con número de lote y hora. Controles: «Generar paleta» en violeta
como única acción primaria, tamaño y formato como grupos de radios. Rejilla de muestras (2/3/5
columnas) con candado sobre el color y HEX, H/S/L y contraste al pie. Archivo de lotes abajo.

FORM: Carta de Lote, candidata 7 de 7 de la lista ordenada; semilla 8845c37e.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Raises

Cada línea nombra al retador que la donó. La donación transfiere disciplina de sistema, nunca ropa.

- **De Osciloscopio de Banco:** nada flota. Cada posición y cada tamaño se lee contra una única
  división visible, como una graticula.
- **De Pila HyperCard:** leer y editar son el mismo objeto. Un lote guardado vuelve en su lugar, no
  se abre en un modal aparte.
- **De Pliegue Miura:** cambiar el tamaño no re-renderiza una lista; redespliega el campo entero en
  un solo movimiento.
- **De Ciclorama al Alba:** ningún estado se comunica solo con color. Bloqueado, copiado, guardado y
  tope alcanzado tienen nombre y forma propios.

## Signature interaction

Regenerar. Las muestras no bloqueadas se retiran de la carta y las nuevas se depositan escalonadas,
en una sola coreografía; las bloqueadas no se mueven en ningún momento, y esa inmovilidad es la
prueba visible de que el bloqueo funcionó. Bajo `prefers-reduced-motion` el reemplazo es inmediato y
el estado sigue siendo legible sin el movimiento.

## Unresolved

- El ratio de contraste por muestra está aprobado como dato visible, pendiente de confirmar contra
  qué fondo se calcula (decisión de implementación, no de dirección).
