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
320/768/1024, tema claro y oscuro (por defecto según `prefers-color-scheme`, con selector manual
desde el release 2), `prefers-reduced-motion`, y CSS plano con custom properties (sin build step,
sin Tailwind, sin preprocesadores).

## Direction contract

Release 2 · reemplaza la dirección «Carta de Lote» del release 1. Elegida por el autor entre tres
propuestas (Instrumento, Muestrario, Estudio) el 2026-10-01.

THESIS: La pantalla es un espacio de trabajo, no una página: la paleta es el objeto sobre la mesa y
todo lo demás son herramientas alrededor.

OWN-WORLD: Barra lateral siempre oscura (grafito #17181B en el tema claro, #0A0B0C en el oscuro,
separada del área de trabajo por un filete), área de trabajo neutra clara (#F7F7F6) u oscura
(#111214) según el tema. Geist para la interfaz, Geist Mono para todo dato y
código, ambas autoalojadas. Un único acento azul (#2F5FD0) reservado a «Generar paleta». Filetes de
1px, radios de 4px o menos, sin sombras ni degradados. El color generado es lo único saturado en
pantalla.

STORY: El diseñador entiende que está en su mesa de trabajo, genera y fija colores hasta que la
banda cierra, verifica el contraste en el panel y se lleva la paleta copiada, color por color o
entera como variables CSS.

FIRST VIEWPORT: Desde 1024px, barra lateral con marca, «Generar paleta» (con el atajo «Espacio»
dentro del botón en dispositivos con mouse o trackpad), tamaño y formato como controles segmentados, archivo de lotes como tiras de
color y el crédito del autor al pie. A la derecha, cabecera con «Generación Nº», conteo, hora y
selector de tema; la paleta como banda continua con candado
arriba y código, H/S/L y contraste al pie; debajo, panel de contraste y bloque de variables CSS.
Por debajo de 1024px, todo apilado en una columna.

FORM: Estudio (propuesta C del lienzo de diseño del release 2).

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

Regenerar. Las muestras no bloqueadas se retiran de la banda y las nuevas se depositan escalonadas,
en una sola coreografía; las bloqueadas no se mueven en ningún momento, y esa inmovilidad es la
prueba visible de que el bloqueo funcionó. Bajo `prefers-reduced-motion` el reemplazo es inmediato y
el estado sigue siendo legible sin el movimiento.

## Unresolved

- Ninguno. El ratio de contraste se calcula entre el color generado y el texto que la muestra elige
  escribir encima (resuelto en el release 1, F2.6).
