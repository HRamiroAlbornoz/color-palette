# Datos operativos del proyecto

Este archivo **se suma** a las instrucciones globales de `~/.claude/CLAUDE.md`, no las reemplaza.
Solo registra lo específico de este proyecto y lo que se aparta del default.

---

## Repositorio y ramas

- **Remoto:** `https://github.com/HRamiroAlbornoz/color-palette.git`
- **Rama principal:** `main`, protegida. Sin push directo; todo entra por Pull Request con CI en verde.
- **Ramas:** una por feature, creada desde `main`. Prefijos: `feature/`, `fix/`, `chore/`.
- **Idioma de los commits:** inglés, imperativo. Sin excepción: es un repositorio público destinado al
  portfolio.
- **Merge a `main`:** siempre desde la interfaz de GitHub, nunca local.

---

## Reglas que sobrescriben el default global

Las tres tienen su motivo escrito en un ADR o en la spec. No son olvidos.

| Regla global | Qué se hace acá | Dónde está el motivo |
|---|---|---|
| «Comentarios siempre en español» | **No se escriben comentarios en el código.** Los nombres de funciones y módulos tienen que cargar solos el significado | Instrucción explícita del autor |
| «Usá siempre TypeScript con strict mode» | JavaScript vanilla, sin tipos y sin build step | [ADR 0001](docs/adr/0001-javascript-vanilla-sin-framework-ni-build.md) |
| «Validá los datos externos con Zod» | Validación de forma escrita a mano en `js/storage.js` | [ADR 0003](docs/adr/0003-validacion-manual-de-localstorage.md) |

Regla adicional derivada de la primera: **si una función necesita explicación, se renombra, no se
comenta.** Es la única herramienta de documentación que queda dentro del código.

---

## Stack

HTML, CSS y JavaScript vanilla con ES modules nativos. Sin framework, sin bundler, sin paso de
compilación: los archivos que se editan son exactamente los que se sirven.

`package.json` contiene **solo `devDependencies`**: ESLint 9 (flat config), Prettier, Vitest y jsdom.
Nada de eso llega al sitio publicado. Agregar una dependencia de producción a este proyecto
contradice el ADR 0001 y necesita un ADR nuevo que lo reemplace.

CSS plano con custom properties. Sin Tailwind y sin preprocesadores.

---

## Deploy

**Vercel, único proveedor.** GitHub Pages está descartado por decisión del autor; el motivo está en
la sección 2 de `docs/spec.md`. No agregar un workflow de Pages ni mencionarlo en el README.

### Configuración de Vercel, verificada en el código fuente del builder

El proyecto tiene `package.json` pero **ningún script `build`**. Ese caso es una trampa conocida:

- Si se declara `buildCommand`, Vercel enruta a `@vercel/static-build`, que espera un build y **lanza
  un error** cuando no encuentra ni script ni comando.
- Si se declara **solo `outputDirectory`**, enruta a `@vercel/static`, que sirve los archivos tal cual
  sin ejecutar nada. **Este es el camino correcto.**
- El directorio de salida por defecto en zero-config es `public/`, no la raíz, así que declararlo es
  obligatorio.

Por lo tanto `vercel.json` lleva `outputDirectory` y **no** lleva `buildCommand`.

`.vercelignore` es obligatorio: `@vercel/static` publica todo lo que matchea el glob, incluidos
`tests/`, `docs/` y `node_modules/`.

### Previews

Vercel crea un deploy de preview por rama y comenta su URL en el Pull Request. Esa URL es donde se
verifican los criterios de aceptación en el paso 7 del ciclo.

---

## Herramientas específicas

- **Impeccable** gestiona el diseño. El contrato de dirección vive en
  `.impeccable/surfaces/index-html.md`, bajo `## Direction contract`, y es lo que audita la revisión
  de cierre. **No copiar ese contrato dentro del código ni de ningún archivo que llegue al
  navegador.**
- `.impeccable/config.local.json` fija `buildPath: "code"` porque este entorno no genera imágenes. Va
  fuera de git a propósito: es una condición de la máquina, no del proyecto.
- `DESIGN.md` **todavía no existe**. En Impeccable 4.x lo escribe el documenter al final, desde lo
  construido, no antes de construir.

---

## Verificación local

`navigator.clipboard` exige contexto seguro. Abrir `index.html` con doble clic (protocolo `file://`)
**no** permite probar el copiado al portapapeles. Siempre servir el sitio:

```bash
npx serve .
```

---

## Notas del flujo de desarrollo

Desvíos detectados respecto de `~/.claude/flujo-desarrollo.md` durante este proyecto, para revisarlos
al terminar:

- El flujo dice que `impeccable shape` produce `DESIGN.md`. En la versión 4.1.3 no lo hace: `shape`
  devuelve un brief y se detiene, y `DESIGN.md` se escribe al final.
- El flujo asume previews por rama del proveedor de hosting. Con Vercel se cumple; con GitHub Pages
  no habría sido posible.
