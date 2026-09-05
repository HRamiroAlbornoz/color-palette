# Generador de Paletas Interactivo

Herramienta web para generar paletas de colores aleatorias, construida para el flujo de trabajo de un
estudio de branding: generar un lote, fijar los colores que sirven, volver a tirar sobre el resto
hasta que la paleta cierra, y llevarse los códigos.

Sin servidor, sin cuentas y sin red: todo ocurre en el navegador.

> **Estado:** en desarrollo. El enlace a la demo se publica al cerrar el primer release.

---

## Qué hace

- Genera paletas de **6, 8 o 9 colores** aleatorios desde un único botón.
- Muestra el **código HEX de cada color siempre**, más su triplete H/S/L y su ratio de contraste.
- Permite alternar el formato destacado entre **HEX y HSL**; el HEX nunca se oculta.
- **Copia el código al portapapeles** con un clic sobre el color, con confirmación visible.
- **Bloquea colores individualmente**: al regenerar, los bloqueados se conservan.
- **Archiva hasta 12 paletas** en el navegador, con restaurar y borrar.

El detalle completo, con criterios de aceptación verificables, está en
[`docs/spec.md`](docs/spec.md).

---

## Cómo ejecutarlo

Necesitás [Node.js](https://nodejs.org/) 20 o superior, únicamente para las herramientas de calidad.
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

Las decisiones caras de revertir están documentadas una por archivo en
[`docs/adr/`](docs/adr/). En resumen:

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

El proyecto apunta a **WCAG 2.1 nivel AA**:

- Contraste suficiente en todo texto, incluido el que se superpone a un color generado al azar: el
  color de ese texto se calcula según la luminancia del fondo.
- Navegación completa por teclado con foco visible. Ningún control es accesible solo por hover.
- Controles agrupados y etiquetados; la confirmación de copiado se anuncia a lectores de pantalla.
- Ningún estado se comunica únicamente con color.
- Se respetan `prefers-color-scheme` y `prefers-reduced-motion`.

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
docs/               especificación y decisiones de arquitectura
```

`js/storage.js` es el único módulo que accede a `localStorage`. Ningún otro archivo lo toca.

---

## Autor

**Hernán Albornoz** — [github.com/HRamiroAlbornoz](https://github.com/HRamiroAlbornoz)
