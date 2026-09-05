# 0002 · HSL como modelo interno de color

- **Fecha:** 2026-09-04
- **Estado:** Aceptada

## Contexto

El requisito pide generar colores aleatorios en dos formatos, HSL y uno de HEX o RGBA, y además
mostrar siempre el código HEX de cada color. Eso admite dos lecturas: que haya dos generadores
distintos, o que haya un único modelo interno que se presente en dos formatos.

Además, el producto necesita tres cosas que dependen de cómo esté representado el color: acotar la
aleatoriedad para que ninguna paleta salga inservible, garantizar que el texto superpuesto a un
color aleatorio tenga contraste suficiente, y evitar que dos colores de la misma paleta salgan casi
idénticos.

## Decisión

El color se representa internamente como un triplete HSL: tono (0-360), saturación (0-100) y
luminosidad (0-100). Es la única fuente de verdad. HEX se deriva por conversión cada vez que hace
falta mostrarlo o copiarlo, nunca se almacena en paralelo.

La aleatoriedad se acota sobre ese modelo: tono libre, saturación y luminosidad restringidas a
rangos usables, y separación mínima de tono entre los colores de una misma paleta.

## Alternativas descartadas

**Sortear seis dígitos hexadecimales.** Es la lectura más literal de "generar en formato HEX" y es
trivial de implementar. Se descarta por tres razones concretas:

1. No permite acotar la aleatoriedad de forma significativa. Restringir dígitos hexadecimales no se
   corresponde con ninguna propiedad perceptual del color, así que aparecen casi-negros,
   casi-blancos y grises apagados sin forma limpia de excluirlos.
2. No permite garantizar separación entre colores. Dos valores hexadecimales lejanos como números
   pueden ser indistinguibles al ojo.
3. Obliga a convertir a otro espacio igual para calcular contraste, con lo cual la conversión no se
   evita, solo se corre de lugar.

**Mantener HEX y HSL como dos campos almacenados en paralelo.** Evitaría convertir en cada render.
Se descarta porque son dos representaciones del mismo dato y mantenerlas sincronizadas es una fuente
de desincronización silenciosa: un cambio que actualice una y olvide la otra no rompe nada
visiblemente, solo muestra un código que no corresponde al color en pantalla. El costo de convertir
es despreciable para 9 colores.

## Consecuencias

- Toda conversión y todo cálculo de contraste parte de HSL. El módulo de color expone la generación,
  la conversión a HEX, y el cálculo de luminancia relativa y ratio de contraste.
- El selector de formato de la interfaz es una decisión de presentación, no de generación: cambia
  qué código se muestra destacado y cuál se copia, y nunca oculta el HEX.
- El triplete H/S/L es visible en cada muestra como dato, lo que se alinea con la dirección de
  diseño registrada en el brief de superficie: el dato es lo que decora la pantalla.
- La conversión HSL a HEX es una función pura con entrada y salida conocidas, así que se puede
  testear contra valores de referencia sin navegador.
