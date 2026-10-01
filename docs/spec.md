# Especificación · Generador de Paletas Interactivo

- **Fecha:** 2026-09-04 (release 1) · 2026-10-01 (release 2)
- **Release:** 2

---

## 1 · Qué se construye

Una aplicación web estática de una sola pantalla que genera paletas de colores aleatorias para el
equipo de Colorfly Studio. El usuario elige cuántos colores quiere (6, 8 o 9), pulsa un único botón
para generar, bloquea los colores que le sirven, vuelve a generar sobre el resto hasta que la paleta
cierra, copia los códigos con un clic, y puede archivar hasta doce paletas en su navegador. Todo
ocurre en el cliente: no hay servidor, ni cuentas, ni red.

El release 2 rediseña la pantalla como un espacio de trabajo («Estudio»): controles y archivo en una
barra lateral, la paleta como una banda continua, un panel que muestra el contraste de cada color,
la paleta lista para copiar como variables CSS, un atajo de teclado para generar, y un selector de
tema claro/oscuro que por defecto sigue al sistema.

---

## 2 · Qué queda afuera

Lista explícita. Nada de esto es un olvido ni un bug: son decisiones tomadas.

- **Backend, base de datos y cuentas de usuario.** Lo guardado vive en un solo navegador y no se
  sincroniza entre dispositivos.
- **Exportar la paleta a un archivo descargable** (PNG, SVG, ASE o cualquier otro). Desde el
  release 2 la paleta se puede *copiar* como variables CSS (F9), pero no se descarga nada.
- **Atajos de teclado más allá de Espacio.** Uno solo, para la acción principal (F10).
- **Compartir una paleta por URL.**
- **Modos de armonía cromática** (análoga, complementaria, tríada). La aleatoriedad es acotada, pero
  los colores de una paleta no guardan relación entre sí.
- **Editar un color a mano.** No hay selector de color: se genera o se bloquea, no se ajusta.
- **Renombrar paletas guardadas.** Se identifican por número de lote y fecha.
- **Deshacer.** Una vez regenerado, el color anterior no vuelve.
- **GitHub Pages.** El proyecto se publica únicamente en Vercel. Motivo: el destino de esta pieza es
  el portfolio, y Vercel aporta deploys de preview por rama —que Pages no tiene— además del dominio
  que usa la industria. Es una decisión tomada, no un requisito pendiente.
- **TypeScript, Zod y cualquier framework.** Ver ADR [0001](adr/0001-javascript-vanilla-sin-framework-ni-build.md)
  y [0003](adr/0003-validacion-manual-de-localstorage.md).
- **Persistir el estado de la sesión.** Al recargar, la paleta en pantalla se genera de nuevo; solo
  el archivo de lotes y la preferencia de tema (F7) sobreviven. Se persiste lo que el usuario guardó
  o eligió explícitamente, no lo que estaba haciendo: la paleta en pantalla, el tamaño y el formato
  no se recuerdan.

---

## 3 · Decisiones de infraestructura

| Decisión | Elección | Estado | Motivo |
|---|---|---|---|
| Base de datos | Ninguna | Decidida con motivo | No hay datos que sobrevivan al navegador ni se compartan entre usuarios |
| Persistencia local | `localStorage` | Decidida con motivo | Único requisito de persistencia: doce paletas y, desde el release 2, la preferencia de tema |
| Tipografía | Geist y Geist Mono autoalojadas (`.woff2` en el repo, con su licencia SIL OFL) | Decidida con motivo | La app sigue funcionando sin red y no hace pedidos a terceros; no requiere build step. Se cargan con `font-display: swap` y precarga, para que el texto nunca quede invisible mientras llegan |
| Autenticación | Ninguna | Decidida con motivo | Superficie única pública; no hay nada que proteger |
| Tiempo real | No hace falta | Decidida con motivo | Un solo usuario, una sola pestaña, sin estado compartido |
| Archivos | No hace falta | Decidida con motivo | No se sube ni se descarga nada |
| Servicios externos | Ninguno | Decidida con motivo | Cero dependencias en producción; la app funciona sin red |
| Repos | Uno solo | Decidida con motivo | No hay backend del que separarse |
| Dónde vive el contrato | No aplica | Decidida con motivo | Una sola punta; no hay frontera cliente-servidor que acordar |
| Hosting | Vercel | Decidida con motivo | Previews por rama y dominio de industria; ver sección 2 |
| Lenguaje y build | HTML/CSS/JS vanilla, sin build | Decidida con motivo | Requisito externo del stack; ver ADR 0001 |
| Herramientas de calidad | ESLint, Prettier, Vitest, jsdom | Decidida con motivo | Solo `devDependencies`; habilitan CI sin tocar lo que se publica |
| CI | GitHub Actions | Decidida con motivo | Lint y tests en cada push y PR; `main` protegida |

Ninguna decisión queda como "por decidir" ni como "decidida por costumbre".

---

## 5 · Features con criterios de aceptación

Cada criterio se responde con sí o no mirando la aplicación.

### F1 · Generación de paleta

1. Al abrir la página se muestra una paleta de 6 colores, sin que el usuario haga nada.
2. Al pulsar «Generar paleta», todos los colores no bloqueados son reemplazados por colores nuevos.
3. El selector de tamaño ofrece 6, 8 y 9. Al elegir uno, la rejilla pasa a mostrar exactamente esa
   cantidad de muestras.
4. Todo color generado tiene saturación entre 45% y 75% y luminosidad entre 35% y 70%.
5. Dos colores de la misma paleta nunca tienen tonos separados por menos de 20 grados, medidos sobre
   el círculo cromático (350 y 10 están a 20 grados, no a 340).
6. Si tras un número acotado de intentos el generador no consigue un tono que respete la separación,
   acepta el mejor candidato obtenido. En ningún caso la interfaz se congela ni queda una muestra
   vacía.
7. Al bajar de 9 a 6, se conservan las primeras 6 muestras con su estado de bloqueo y se descartan
   las demás.
8. Al subir de 6 a 9, se conservan las 6 existentes con su estado de bloqueo y se generan 3 nuevas.

### F2 · Formato de color

1. Cada muestra muestra su código HEX en mayúsculas y con almohadilla (`#4A90D9`), **siempre**, en
   cualquier formato activo.
2. Cada muestra muestra además su triplete H/S/L como dato secundario.
3. El selector de formato ofrece HEX y HSL. HEX está seleccionado al cargar la página.
4. Cambiar el formato cambia cuál de los dos códigos aparece destacado y cuál se copia al hacer
   clic. Ninguno de los dos desaparece de la pantalla.
5. El código HEX de una muestra corresponde exactamente a su color de fondo, verificable con un
   cuentagotas.
6. Cada muestra expone su ratio de contraste (ej. «4.8:1») calculado entre el color de fondo de la
   tarjeta y el color de texto que la propia tarjeta eligió para escribir encima.

### F3 · Copiar al portapapeles y microfeedback

1. Al hacer clic sobre el área de color de una muestra se copia al portapapeles el código en el
   formato activo.
2. Tras copiar con éxito aparece un aviso que nombra el código copiado y desaparece solo pasados
   unos 2 segundos.
3. El aviso se anuncia a lectores de pantalla mediante una región `role="status"` con
   `aria-live="polite"`.
4. Si el portapapeles no está disponible (por ejemplo, al abrir el archivo sin servidor), aparece un
   aviso que lo explica en lenguaje llano. Nunca se muestra el mensaje técnico del error, y nunca
   queda la aplicación en silencio.
5. Copiar dos colores seguidos reemplaza el mensaje anterior. No se apilan avisos.
6. El área de color es alcanzable con Tab y se activa con Enter y con Espacio.

### F4 · Bloqueo de colores

1. Cada muestra tiene su propio botón de bloqueo, que expone su estado con `aria-pressed`.
2. Con uno o más colores bloqueados, generar deja esos colores idénticos y reemplaza únicamente el
   resto.
3. El estado bloqueado se distingue sin depender del color: el indicador es un candado cerrado
   (relleno) o abierto (contorno, con el arco separado del cuerpo), dos siluetas distintas, y cambia
   el texto accesible del botón.
4. Con todos los colores bloqueados, pulsar «Generar paleta» muestra un aviso explicando que no hay
   nada para regenerar, y ninguna muestra cambia.
5. Cambiar el tamaño de la paleta conserva el estado de bloqueo de las muestras que siguen en ella.
6. El botón de bloqueo y el área de color son dos botones hermanos, nunca uno dentro del otro.

### F5 · Archivo de paletas

1. Un botón «Guardar lote» agrega la paleta actual al archivo.
2. El archivo muestra una entrada por lote: sus colores en miniatura, su número de lote y su fecha.
   Dónde se ubica en la pantalla lo decide F11.
3. Al recargar la página, el archivo conserva lo guardado.
4. El archivo admite un máximo de 12 lotes. Al intentar guardar el decimotercero aparece un aviso
   que explica el tope; no se borra nada de forma automática.
5. Restaurar un lote lo carga como paleta actual, y el selector de tamaño se actualiza para
   coincidir con la cantidad de colores de ese lote.
6. Borrar un lote pide confirmación nombrando cuál se va a borrar. La entrada desaparece solo
   después de confirmar.
7. Si `localStorage` no está disponible, la aplicación funciona igual y el archivo muestra un
   mensaje explicando que en este navegador no se puede guardar.
8. Si el contenido guardado está corrupto o corresponde a un esquema anterior, la aplicación arranca
   con el archivo vacío en lugar de romperse.
9. El archivo vacío muestra un mensaje que explica cómo llenarlo, no un espacio en blanco.

### F6 · Movimiento y pulido visual

1. Al generar, las muestras no bloqueadas entran de forma escalonada; las bloqueadas no se mueven en
   ningún momento.
2. Con `prefers-reduced-motion: reduce` no ocurre ninguna animación de entrada y el reemplazo es
   inmediato, sin que se pierda la señal de qué cambió.
3. Todo control alcanzable con teclado tiene foco visible, y ningún control es accesible solo por
   hover.
4. La aplicación tiene un tema claro y uno oscuro; el oscuro tiene elevación y contraste propios,
   no es una inversión del claro. Cuál se muestra lo decide F7.
5. Ningún estado (bloqueado, copiado, guardado, tope alcanzado) se comunica únicamente con color.
6. Todo texto cumple contraste WCAG AA, incluido el que se superpone a un color generado al azar.

### F7 · Selector de tema *(release 2)*

1. La cabecera ofrece un selector de tema con tres opciones: «Sistema», «Claro» y «Oscuro». Es un
   grupo de radios con su leyenda «Tema», igual que tamaño y formato: se elige exactamente una. Desde
   768px cada opción muestra ícono y texto; por debajo, solo el ícono, y el texto queda disponible
   para lectores de pantalla.
2. En la primera visita está seleccionada «Sistema». Con «Sistema», el tema sigue a
   `prefers-color-scheme`, y si el sistema cambia con la página abierta, la página cambia sin
   recargar.
3. «Claro» y «Oscuro» fuerzan ese tema sin importar la configuración del sistema, incluidos los
   controles nativos del navegador (radios, barras de desplazamiento): con «Oscuro» forzado sobre
   un sistema claro, no queda ningún control nativo pintado en claro.
4. La opción elegida sobrevive a recargar la página.
5. Al recargar con un tema forzado distinto del que pide el sistema, la página no muestra ni un
   instante el otro tema.
6. La opción activa se anuncia como seleccionada a lectores de pantalla (radio marcado) y se
   distingue a la vista por algo que no es solo color: fondo relleno más un borde visible.
7. Si `localStorage` no está disponible, lanza un error al leerlo, o el valor guardado no es una de
   las tres opciones, la aplicación usa «Sistema» y funciona igual. Ningún valor leído de
   `localStorage` llega a la página sin pasar por esa lista de tres opciones. Si la elección no se
   puede guardar, el tema elegido igual se aplica durante esa visita, sin mostrar un error.
8. Todo texto de interfaz cumple contraste WCAG AA en los dos temas, y el foco es visible tanto
   sobre la barra lateral oscura como sobre el área de trabajo y sobre cualquier color generado.

### F8 · Panel de contraste *(release 2)*

1. Un panel muestra, por cada color de la paleta actual y en el mismo orden, una muestra «Aa»
   escrita con el color de texto que la tarjeta eligió, su ratio de contraste y su nota.
2. La nota se refiere a texto de tamaño normal (los códigos de las muestras lo son): «AAA» con un
   ratio de 7:1 o más, y «AA» con un ratio desde 4.5:1 hasta menos de 7:1. No existe una nota por
   debajo de AA porque los rangos de F1.4 garantizan al menos 4.5:1 en todo color generado o
   restaurado; si ese rango cambia alguna vez, este criterio se revisa en el mismo cambio.
3. El panel se actualiza al generar, al cambiar el tamaño y al restaurar un lote.
4. La nota se lee como texto; no depende del color.
5. Con 9 colores y en cualquier ancho, el panel no desborda: si las muestras no entran en una fila,
   pasan a varias.

### F9 · Exportar como variables CSS *(release 2)*

1. Un bloque muestra la paleta actual como variables CSS dentro de `:root`, una por color y en el
   orden de la paleta: `--color-1`, `--color-2`, etc.
2. Los valores siguen el formato activo: `#3980D0` en HEX, `hsl(212, 62%, 52%)` en HSL.
3. Un botón «Copiar» copia el bloque completo al portapapeles y muestra un aviso que lo confirma.
   Si el portapapeles falla, el aviso lo explica en lenguaje llano, igual que F3.4. Su nombre
   accesible es «Copiar variables CSS», para no confundirse con el copiado de cada color.
4. El bloque se actualiza al generar, al cambiar el tamaño o el formato, y al restaurar un lote.
5. El texto que se copia es idéntico, carácter por carácter, al que muestra el bloque.

### F10 · Atajo de teclado para generar *(release 2)*

1. Pulsar Espacio con el foco fuera de cualquier control equivale a pulsar «Generar paleta», y la
   página no se desplaza (Espacio normalmente baja la página). Con Ctrl, Alt, Shift o Meta
   presionadas, no hace nada. Mantener Espacio apretado genera una sola vez, no una por repetición
   de la tecla.
2. Si el foco llegó a un botón, un radio o un enlace **con el teclado** (Tab, flechas), Espacio hace
   lo que hace normalmente ese control (F3.6) y no genera una paleta. Si el foco quedó en un control
   porque se lo pulsó con el mouse, Espacio genera: quien copia un color con un clic, va a pegarlo a
   otro programa y vuelve, espera que Espacio genere, no que copie otra vez el mismo color.
3. Mientras se espera la animación de salida de una generación, el atajo no hace nada, igual que el
   botón deshabilitado.
4. Con todos los colores bloqueados, el atajo muestra el mismo aviso que F4.4.
5. En dispositivos con mouse o trackpad, el botón «Generar paleta» muestra el atajo dentro de sí
   mismo («Espacio»). En pantallas táctiles no se muestra, sea cual sea su ancho (una tablet
   apaisada supera los 1024px y no tiene teclado); el atajo igual funciona si hay un teclado
   conectado.

### F11 · Disposición «Estudio» *(release 2)*

1. Desde 1024px: una barra lateral a la izquierda con la marca, «Generar paleta», tamaño, formato,
   archivo y, al pie, el crédito del autor con el enlace a GitHub; a la derecha, la cabecera (número
   de generación, cantidad de colores y de bloqueados, hora, selector de tema), la paleta, y debajo
   el panel de contraste y el bloque de variables CSS.
2. Por debajo de 1024px: una sola columna, en este orden: cabecera (con la marca), controles,
   paleta, panel de contraste, variables CSS, archivo y pie con el crédito del autor. A 320px de
   ancho y 568px de alto, «Generar paleta» se ve sin desplazar la página.
3. Por debajo de 768px cada color es una banda horizontal a todo el ancho; desde 768px, una grilla
   de 3 columnas; desde 1024px, una banda continua de columnas.
4. Desde 1024px la banda ocupa una sola fila mientras cada color tenga al menos 110px de ancho; si
   no, se parte en dos filas, y la última fila nunca queda con un solo color.
5. En ningún ancho desde 320px aparece desplazamiento horizontal, y ningún texto se corta ni se
   superpone a otro.
6. Hacer clic en cualquier punto del color de una muestra copia el código, también encima del
   texto (código, dato secundario, ratio). El botón de bloqueo es la única zona de la muestra que
   no copia.
7. Cada lote del archivo mantiene sus dos acciones, «Restaurar» y «Borrar», como botones separados
   de al menos 44×44px, y la confirmación de borrado (F5.6) cabe dentro del ancho de la barra
   lateral sin desbordarla. El botón para archivar sigue diciendo «Guardar lote».
8. La cantidad de colores y de bloqueados de la cabecera se actualiza en el momento en que se
   bloquea o desbloquea un color, se cambia el tamaño o se restaura un lote.
9. En la pestaña Red del navegador, la página no hace ningún pedido a otro dominio.
10. Con el teclado se llega a la paleta sin recorrer el archivo: el primer Tab de la página muestra
    un enlace «Saltar a la paleta» que lleva el foco a la primera muestra. Sin este enlace, con 12
    lotes guardados, la barra lateral sumaría 24 paradas de Tab antes de la paleta.

### Restricciones de implementación del release 2

No se verifican mirando la aplicación, sino en el código o con un test. Están acá para que no se
pierdan.

1. El botón que copia un color no contiene elementos de bloque (HTML válido): el código, el dato
   secundario y el ratio de contraste son hermanos del botón, no hijos. Por eso F11.6 exige que el
   clic sobre ese texto igual copie.
2. Los radios de tamaño se generan a partir de `PALETTE_SIZES`, la misma lista que valida el
   archivo, no se escriben a mano en el HTML. Conservan su `fieldset` y su leyenda, y 6 queda
   marcado al cargar (F1.1).
3. `js/storage.js` sigue siendo el único módulo que lee y escribe `localStorage`, con **una sola
   excepción documentada**: el script inline del `<head>` que aplica el tema antes de pintar. Ese
   script solo lee (nunca escribe), solo la clave del tema, y la valida contra la lista de opciones.
   La clave y la lista se definen una sola vez en `storage.js`, y un test verifica que el script del
   `<head>` usa exactamente esas mismas.
4. El script inline del tema va en el `<head>` **antes** de las hojas de estilo; si va después, el
   navegador puede pintar una vez con el tema equivocado.
5. Los radios generados desde `PALETTE_SIZES` tienen su espacio reservado en el CSS, para que la
   página no salte cuando el JavaScript los inserta.
6. Si en algún momento se agrega una Content-Security-Policy, el script inline del `<head>` se
   autoriza por su hash (`sha256-…`), nunca con `'unsafe-inline'`, y un test verifica que el hash
   declarado coincide con el script.

---

## 6 · Superficie y estructura

**Superficie única: pública sin sesión.** Modo de visitante: *Operate* — se viene a completar una
tarea, no a ser persuadido.

| Aspecto | Resolución |
|---|---|
| Patrón de listado | Release 2: bandas horizontales a 320px, grilla de 3 columnas desde 768px, banda continua (una o dos filas) desde 1024px. Detalle en F11 |
| Pantallas y navegación | Una sola pantalla, sin rutas. Desde 1024px, barra lateral con controles y archivo; por debajo, una sola columna |
| Pasos para la acción principal | Uno: pulsar «Generar paleta» |
| Estado de carga | No existe. Todo es síncrono y local; introducir un estado de carga falso sería mentir sobre lo que hace la aplicación |
| Estado vacío | Solo en el archivo de lotes, que arranca sin nada y explica cómo llenarse. La paleta nunca está vacía: se genera una al cargar |
| Estado de error | En el aviso emergente: portapapeles no disponible, `localStorage` no disponible, tope de archivo alcanzado, y nada para regenerar. Una preferencia de tema ilegible no es un error visible: se vuelve a «Sistema» en silencio (F7.7) |

El plan de diseño de esta superficie —tipografía, paleta de interfaz, composición e interacción
distintiva— vive en `.impeccable/surfaces/index-html.md`, bajo `## Direction contract`. Esta
especificación responde **qué hace** la pantalla; ese archivo responde **cómo se ve**.

---

## 7 · ADRs

- [0001 · JavaScript vanilla sin framework ni build step](adr/0001-javascript-vanilla-sin-framework-ni-build.md)
- [0002 · HSL como modelo interno de color](adr/0002-hsl-como-modelo-interno-de-color.md)
- [0003 · Validación manual de localStorage en vez de Zod](adr/0003-validacion-manual-de-localstorage.md)

---

## 9 · Flujos del recorrido

Completado en el Cierre del release 1, recorriendo la aplicación publicada en producción
(https://color-palette-alpha.vercel.app).

**Principal.** Generar paleta → bloquear dos colores → regenerar (los bloqueados no cambian) →
cambiar tamaño → cambiar formato → copiar un color → guardar el lote → restaurar (el selector de
tamaño se sincroniza) → borrar el lote con confirmación. Las seis features componen sin fricción:
ninguna pisa el estado de la otra.

**Usuario nuevo.** Al abrir la página sin datos previos: paleta de 6 colores ya generada, formato
HEX, archivo vacío con el mensaje que explica cómo llenarlo. No hay pantalla en blanco en ningún
punto de este camino.

**Recuperación.** Recargar a mitad de una interacción (color bloqueado, tamaño cambiado) reinicia la
paleta en pantalla —es la decisión tomada en la sección 2— pero el archivo de lotes guardados
sobrevive intacto a la recarga, incluida la sincronización del tamaño al restaurar un lote después de
recargar.

**Error.** Portapapeles no disponible → aviso en lenguaje llano, nunca el error técnico.
`localStorage` no disponible → el archivo lo explica y el resto de la app sigue funcionando. Un lote
corrupto en `localStorage` (probado escribiendo un valor fuera de rango a mano) se descarta solo a
él, sin perder los demás lotes guardados.

Ningún bug de interacción entre features apareció en este recorrido.
