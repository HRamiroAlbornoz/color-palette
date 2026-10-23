# Generador de Paletas Interactivo

Herramienta web para generar paletas de colores aleatorias, construida para el flujo de trabajo de un
estudio de branding: generar un lote, fijar los colores que sirven, volver a tirar sobre el resto
hasta que la paleta cierra, y llevarse los códigos.

Sin servidor, sin cuentas y sin red: todo ocurre en el navegador.

**Demo:** [color-palette-alpha.vercel.app](https://color-palette-alpha.vercel.app)

---

## Qué hace

- Genera paletas de **6, 8 o 9 colores** aleatorios desde un único botón.
- Muestra el **código HEX de cada color siempre**, más su triplete H/S/L y su ratio de contraste.
- Permite alternar el formato destacado entre **HEX y HSL**; el HEX nunca se oculta.
- **Copia el código al portapapeles** con un clic sobre el color, con confirmación visible.
- **Bloquea colores individualmente**: al regenerar, los bloqueados se conservan.
- **Archiva hasta 12 paletas** en el navegador, con restaurar y borrar.
- Muestra un **panel de contraste** con el ratio y la nota WCAG (AA o AAA) de cada color.
- **Exporta la paleta como variables CSS** (`--color-1`, `--color-2`…) lista para copiar.
- Genera con la **barra espaciadora**, sin pisar el comportamiento de los controles.
- Ofrece **tema claro, oscuro o el del sistema**, y recuerda la elección.

La interfaz es un espacio de trabajo: barra lateral con los controles y el archivo, y la paleta como
una banda continua en el centro. En pantallas angostas todo se apila en una columna.

El detalle completo, con criterios de aceptación verificables, está en
[`docs/spec.md`](docs/spec.md).

---

## Cómo ejecutarlo

Necesitás [Node.js](https://nodejs.org/) 24 (la versión fijada en `.nvmrc`), únicamente para las
herramientas de calidad.
La aplicación en sí no lo necesita.

```bash
git clone https://github.com/HRamiroAlbornoz/color-palette.git
cd color-palette
npm install
npx serve .
```

Después abrí la dirección que imprime `serve` (habitualmente `http://localhost:3000`).

**Servirlo es obligatorio, no una comodidad.** La API del portapapeles del navegador solo funciona en
contexto seguro (HTTPS o `localhost`). Si abrís `index.html` con doble clic, el navegador usa el
protocolo `file://` y la función de copiado no está disponible.

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run lint` | Revisa el código con ESLint |
| `npm run format:check` | Verifica el formato con Prettier |
| `npm run format` | Aplica el formato |
| `npm test` | Corre la suite de tests con Vitest |

---

## Decisiones técnicas

Las decisiones fundacionales están documentadas una por archivo en [`docs/adr/`](docs/adr/); las
posteriores, en el [registro de decisiones](02-DOCS/wiki/sdd/decisions.md). Las reglas que todo
cambio debe cumplir están en la [constitución del proyecto](02-DOCS/wiki/sdd/constitution.md). En
resumen:

**Sin framework, sin bundler y sin paso de compilación.** Los archivos que se editan son exactamente
los que se sirven. El proyecto tiene una sola pantalla, sin rutas ni estado compartido: el costo de
traer React se pagaría entero y el beneficio no aparecería.
→ [ADR 0001](docs/adr/0001-javascript-vanilla-sin-framework-ni-build.md)

**HSL como único modelo interno de color.** El HEX se deriva por conversión, nunca se almacena en
paralelo. Es lo que permite acotar la aleatoriedad a rangos usables, garantizar separación entre
tonos y calcular el contraste; sortear dígitos hexadecimales no permite ninguna de las tres.
→ [ADR 0002](docs/adr/0002-hsl-como-modelo-interno-de-color.md)

**Validación de `localStorage` escrita a mano.** Sin bundler no hay forma limpia de usar Zod sin
introducir una dependencia de red o una copia congelada. La función cumple la misma responsabilidad:
verifica la forma completa y vuelve a un estado inicial seguro ante cualquier discrepancia.
→ [ADR 0003](docs/adr/0003-validacion-manual-de-localstorage.md)

**Cero dependencias en producción.** Las únicas dependencias son de desarrollo (ESLint, Prettier,
Vitest, jsdom) y ninguna llega al navegador del usuario.

---

## Accesibilidad

El proyecto apunta a **WCAG 2.2 nivel AA**:

- Contraste suficiente en todo texto, incluido el que se superpone a un color generado al azar: el
  color de ese texto se calcula según la luminancia del fondo.
- Navegación completa por teclado con foco visible. Ningún control es accesible solo por hover. Un
  enlace «Saltar a la paleta» evita recorrer el archivo antes de llegar a los colores.
- Controles agrupados y etiquetados; la confirmación de copiado se anuncia a lectores de pantalla.
- Ningún estado se comunica únicamente con color.
- El tema sigue a `prefers-color-scheme` hasta que el usuario elige uno, y nunca muestra un instante
  el tema equivocado al recargar. Con `prefers-reduced-motion` no hay animaciones.

---

## Cómo se trabaja

- **Reglas escritas antes del código.** La [constitución](02-DOCS/wiki/sdd/constitution.md) fija lo
  que ningún cambio puede romper: stack, calidad, accesibilidad, seguridad y rendimiento.
- **Tests primero.** Cada cambio de código empieza con un test que falla; recién después se escribe
  el código que lo hace pasar.
- **Una rama y un Pull Request por cambio.** `main` está protegida: nada entra sin lint, formato y
  tests en verde en GitHub Actions.
- **Verificación en un navegador real.** Cada criterio de la [especificación](docs/spec.md) se prueba
  sobre el sitio publicado, en varios anchos y en los dos temas, y queda registrado con su evidencia
  ([verificación del release 2](02-DOCS/wiki/sdd/verifications/release-2-2026-10-21.md)).
- **Revisión antes del merge.** El código se revisa contra la spec y la constitución
  ([revisión del release 2](02-DOCS/wiki/sdd/reviews/release-2.md)), y cada decisión importante se
  anota en el [registro de decisiones](02-DOCS/wiki/sdd/decisions.md).

---

## Cómo se despliega

El sitio se publica en **Vercel** como sitio estático, sin build.

1. Importar el repositorio en Vercel con el preset de framework **Other**.
2. Dejar el comando de build **vacío**. `vercel.json` declara `outputDirectory` y no declara
   `buildCommand`, lo que hace que Vercel sirva los archivos tal cual en lugar de intentar
   construirlos.
3. Cada rama genera un deploy de preview con URL propia; `main` genera el de producción.

---

## Estructura

```
index.html          única pantalla
css/                tokens, base y componentes
js/                 módulos de una responsabilidad cada uno
tests/              suite de Vitest
docs/               producto, especificación, dirección visual y ADRs
02-DOCS/            constitución, decisiones y registros del flujo de desarrollo
```

`js/storage.js` es el único módulo que lee y escribe `localStorage`. La única excepción es un script
de pocas líneas en el `<head>` que lee el tema guardado antes de pintar la página, para que no
aparezca un instante el tema equivocado; solo lee, y valida el valor contra las mismas opciones que
define `storage.js`.

---

## Licencia

[MIT](LICENSE). Las tipografías Geist y Geist Mono se distribuyen bajo su propia licencia,
[SIL Open Font License 1.1](fonts/OFL.txt).

---

## Autor

**Hernán Albornoz** — [github.com/HRamiroAlbornoz](https://github.com/HRamiroAlbornoz)
