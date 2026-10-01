# Pendientes

Deuda abierta. Cada entrada se borra de este archivo cuando el slice que la resuelve cierra.

La deuda del Cierre del release 1 (candado sin silueta propia, `<dl>` dentro de `<button>`, tamaños
escritos a mano en el HTML, lectura duplicada de radios, creación de botones repetida y ternario de
formato duplicado) se resolvió en los slices 1 y 2 del release 2.

## `DESIGN.md` nunca se generó

- **Dónde apareció:** planificación del release 2 (cuarta revisión del plan)
- **Qué pasa:** el contrato de dirección (`FINISH`) dice que el trabajo de diseño termina con la
  revisión final, el veredicto y `DESIGN.md`, y `CLAUDE.md` aclara que en Impeccable 4.x ese archivo
  lo escribe el documenter al final, desde lo construido. El release 1 cerró sin ejecutar ese paso.
- **Por qué no se arregló:** no se detectó en el Cierre del release 1; el flujo de Hernán no tiene
  un paso explícito para el documenter.
- **Qué habría que hacer:** en el Cierre del release 2, después de `impeccable critique`, correr el
  documenter de Impeccable para que escriba `DESIGN.md` desde la interfaz «Estudio» terminada.
