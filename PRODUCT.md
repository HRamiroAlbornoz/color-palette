# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS y JavaScript vanilla con ES modules nativos. Sin framework, sin bundler y sin build step:
los archivos se sirven tal cual. Hay `package.json` con devDependencies (ESLint, Prettier, Vitest,
jsdom) para lint y tests, pero nada de eso llega al sitio publicado. Decidido por el usuario.

Deploy en Vercel. Sin backend, sin base de datos y sin variables de entorno.

## Users

Equipo creativo de **Colorfly Studio**, un estudio de branding que produce propuestas visuales para
más de 300 clientes en distintas ciudades.

El usuario primario es un **diseñador con oficio**: trabaja con color todos los días, entiende HSL,
sabe leer un ratio de contraste y quiere velocidad antes que explicaciones. La situación de uso es el
arranque de una propuesta, cuando todavía no hay dirección de color y hace falta material para
empezar a descartar.

En consecuencia, la interfaz no explica lo que este usuario ya sabe: sin tutoriales, sin tooltips
sobre qué es HSL, sin textos de ayuda que ocupen el lugar del producto.

## Product Purpose

Acelerar el arranque del flujo creativo y estandarizar la propuesta inicial de color.

El éxito es que un diseñador llegue con las manos vacías y salga en menos de un minuto con una paleta
que pueda pegar en una presentación: colores generados, los que sirven bloqueados, el resto
regenerado hasta que cierre, y el código copiado.

## Positioning

No es un banco de paletas curadas ni un editor de color completo. Es un **generador de arranque con
bloqueo selectivo**: el valor no está en el primer resultado aleatorio sino en poder fijar lo que
sirve y volver a tirar los dados sobre el resto, hasta converger.

El mecanismo que lo distingue de un generador cualquiera: **el dato técnico viaja al lado del color**.
Cada color muestra su código, su triplete H/S/L y su ratio de contraste, de modo que la propuesta se
puede evaluar sin salir de la herramienta ni llevarla antes a una maqueta.

## Operating Context

Uso de escritorio durante una sesión de trabajo, con la herramienta abierta al lado del programa de
diseño donde se está armando la propuesta. El flujo real es de ida y vuelta: generar, mirar, bloquear,
regenerar, copiar, pegar en el otro programa, volver.

Eso impone dos cosas: copiar tiene que ser un clic y tiene que confirmar que copió, y la paleta tiene
que sobrevivir a que el usuario se vaya a otra ventana y vuelva.

## Capabilities and Constraints

Confirmado:

- Generar una paleta de colores aleatorios desde un único botón principal.
- Elegir el tamaño de la paleta: 6, 8 o 9 colores.
- Modelo interno HSL, con aleatoriedad acotada en saturación y luminosidad y separación mínima de
  tono entre colores, para que ninguna paleta salga inservible.
- El código HEX de cada color está visible siempre. Un selector de formato decide si el código
  destacado (y el que se copia) es HEX o HSL, pero nunca oculta el HEX.
- Cada tarjeta expone además el triplete H/S/L y el ratio de contraste del color.
- Copiar el código al portapapeles haciendo clic sobre el color, con confirmación visible.
- Bloquear colores individualmente: al regenerar, los bloqueados se conservan.
- Guardar paletas en el navegador, con un tope de 12, y poder restaurarlas o borrarlas.

Restricciones técnicas:

- Todo ocurre en el cliente. Sin backend, sin cuentas de usuario y sin sincronización entre
  dispositivos: lo que se guarda vive solo en ese navegador.
- El portapapeles requiere contexto seguro (HTTPS o localhost); fuera de él, la app debe explicarlo
  en lugar de fallar en silencio.
- El almacenamiento del navegador puede estar deshabilitado o contener datos corruptos de una versión
  anterior: la app tiene que arrancar limpia en vez de romperse.

Fuera de alcance, decidido explícitamente: exportar a PNG o ASE, modos de armonía cromática
(análoga, complementaria), compartir una paleta por URL, y editar un color a mano.

## Brand Commitments

- La aplicación se presenta como herramienta de **Colorfly Studio**. El nombre aparece en el header.
- El tono es el de una herramienta profesional interna, no el de una web de producto: enunciativo,
  breve, sin entusiasmo publicitario ni signos de exclamación.
- Footer con atribución del autor, **Hernán Albornoz**, y link al repositorio en GitHub.
- Idioma de la interfaz: español.

## Evidence on Hand

**Ninguna.** Colorfly Studio es un cliente ficticio del enunciado que originó el proyecto. No existe
logo, ni identidad visual previa, ni clientes reales, ni casos, ni testimonios, ni métricas de uso.

El dato "más de 300 clientes en distintas ciudades" pertenece a la ficción del ejercicio y **no debe
aparecer en la interfaz como si fuera un hecho verificable**. Ningún trabajo futuro debe fabricar
logos, cifras, testimonios ni referencias de clientes para llenar espacio.

## Product Principles

1. **El dato es el adorno.** Lo que decora la pantalla es información real sobre el color, no
   ornamento. Si un elemento no informa, sobra.
2. **Una acción principal, un clic.** Generar es la única acción primaria; todo lo demás la modifica
   o la conserva, y ninguna acción cuesta más de un clic.
3. **Nada se pierde en silencio.** Toda acción del usuario confirma que ocurrió o explica por qué no,
   incluidos los casos en que la respuesta correcta es no hacer nada.
4. **Paridad de teclado.** Todo lo que se puede hacer con el mouse se puede hacer con el teclado, con
   el foco siempre visible.
5. **Funciona sola.** Sin red, sin servidor y sin cuenta. Un fallo del navegador degrada la
   experiencia, nunca la rompe.

## Accessibility & Inclusion

Requisito del proyecto: **WCAG 2.1 nivel AA**.

- Contraste suficiente en todo texto, incluido el que se superpone a un color generado al azar (el
  color de ese texto se calcula según la luminancia del fondo, no se fija a mano).
- Navegación completa por teclado con foco visible; ningún control accesible solo por hover.
- Controles agrupados y etiquetados: los selectores de tamaño y formato son grupos de radios con su
  etiqueta, no botones sueltos.
- La confirmación de copiado se anuncia a lectores de pantalla, no solo visualmente.
- Se respetan `prefers-color-scheme` (tema claro y oscuro) y `prefers-reduced-motion`.
