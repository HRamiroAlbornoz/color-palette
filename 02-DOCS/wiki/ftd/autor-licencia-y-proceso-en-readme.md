---
author: HRamiroAlbornoz
branch: chore/author-license-and-workflow
status: done
---
# Autor, licencia y proceso en el README

## Intent

El repositorio es una pieza de portfolio. `package.json` tenía el autor vacío y declaraba una
licencia ISC sin archivo `LICENSE`, así que para GitHub el código no tenía licencia. Y el README
mostraba el resultado pero no cómo se trabaja.

## Scope

- Dentro: `author` en `package.json`; licencia MIT (`LICENSE` y `package.json`); secciones
  «Cómo se trabaja» y «Licencia» en el README.
- Fuera: el contenido de la aplicación.

## Checklist

- [x] `author` completo — prueba: `node -p "require('./package.json').author"`.
- [x] Licencia MIT coherente — prueba: `LICENSE` existe y `package.json` dice `MIT`.
- [x] README con «Cómo se trabaja» y «Licencia» — prueba: cada enlace apunta a un archivo que existe.
- [x] Barra de calidad — prueba: lint, Prettier y `npm test` en verde.

## Evidence

- `author`: `Hernán Albornoz (https://github.com/HRamiroAlbornoz)`, en el formato de persona de npm.
  Sin email, para no publicarlo en un archivo más.
- Licencia: `package.json` y la entrada raíz de `package-lock.json` dicen `MIT`; `LICENSE` existe.
- README: los 14 enlaces internos apuntan a archivos que existen.
- Barra: lint sin errores, Prettier limpio, `150 passed (150)` tests.

## Next

Ninguno. Entra a `main` con el PR de la rama `chore/author-license-and-workflow`.
