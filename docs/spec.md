# Especificación · Generador de Paletas Interactivo

- **Fecha:** 2026-09-04
- **Release:** 1

---

## 1 · Qué se construye

Una aplicación web estática de una sola pantalla que genera paletas de colores aleatorias para el
equipo de Colorfly Studio. El usuario elige cuántos colores quiere (6, 8 o 9), pulsa un único botón
para generar, bloquea los colores que le sirven, vuelve a generar sobre el resto hasta que la paleta
cierra, copia los códigos con un clic, y puede archivar hasta doce paletas en su navegador. Todo
ocurre en el cliente: no hay servidor, ni cuentas, ni red.

---

## 2 · Qué queda afuera

Lista explícita. Nada de esto es un olvido ni un bug: son decisiones tomadas.

- **Backend, base de datos y cuentas de usuario.** Lo guardado vive en un solo navegador y no se
  sincroniza entre dispositivos.
- **Exportar la paleta** a PNG, SVG, ASE o cualquier archivo descargable.
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
  el archivo de lotes sobrevive. Se persiste lo que el usuario guardó explícitamente, no lo que
  estaba haciendo.

---

## 3 · Decisiones de infraestructura

| Decisión | Elección | Estado | Motivo |
|---|---|---|---|
| Base de datos | Ninguna | Decidida con motivo | No hay datos que sobrevivan al navegador ni se compartan entre usuarios |
| Persistencia local | `localStorage` | Decidida con motivo | Único requisito de persistencia; el volumen es de doce paletas |
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
3. El estado bloqueado se distingue sin depender del color: cambia la forma del indicador y cambia
   el texto accesible del botón.
4. Con todos los colores bloqueados, pulsar «Generar paleta» muestra un aviso explicando que no hay
   nada para regenerar, y ninguna muestra cambia.
5. Cambiar el tamaño de la paleta conserva el estado de bloqueo de las muestras que siguen en ella.
6. El botón de bloqueo y el área de color son dos botones hermanos, nunca uno dentro del otro.

### F5 · Archivo de paletas

1. Un botón «Guardar lote» agrega la paleta actual al archivo.
2. El archivo se muestra debajo de la paleta, con una entrada por lote: sus colores en miniatura, su
   número de lote y su fecha.
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
4. La aplicación respeta `prefers-color-scheme`, con un tema claro y uno oscuro; el oscuro tiene
   elevación y contraste propios, no es una inversión del claro.
5. Ningún estado (bloqueado, copiado, guardado, tope alcanzado) se comunica únicamente con color.
6. Todo texto cumple contraste WCAG AA, incluido el que se superpone a un color generado al azar.

---

## 6 · Superficie y estructura

**Superficie única: pública sin sesión.** Modo de visitante: *Operate* — se viene a completar una
tarea, no a ser persuadido.

| Aspecto | Resolución |
|---|---|
| Patrón de listado | Rejilla de tarjetas: 2 columnas desde 320px, 3 desde 768px, 4-5 desde 1024px |
| Pantallas y navegación | Una sola pantalla, sin rutas. El archivo de lotes es una sección de la misma página |
| Pasos para la acción principal | Uno: pulsar «Generar paleta» |
| Estado de carga | No existe. Todo es síncrono y local; introducir un estado de carga falso sería mentir sobre lo que hace la aplicación |
| Estado vacío | Solo en el archivo de lotes, que arranca sin nada y explica cómo llenarse. La paleta nunca está vacía: se genera una al cargar |
| Estado de error | En el aviso emergente: portapapeles no disponible, `localStorage` no disponible, tope de archivo alcanzado, y nada para regenerar |

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

Se completa en el Cierre del release 1, recorriendo la aplicación publicada. Hasta entonces queda
vacía a propósito: los caminos reales se descubren usando, no imaginando.
