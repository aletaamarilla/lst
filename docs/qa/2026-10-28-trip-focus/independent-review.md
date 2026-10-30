# Revisión independiente · fondos neutros y jerarquía del sidebar · 28/10/2026

> Esta revisión completa corresponde a la candidata previa al resumen tarifario generado. La versión final actual (renderer `ad6479…`) está cubierta por [la revisión incremental específica](independent-review-generated-note.md), con manifest final y comprobaciones propias distinguidas.

Revisión enfocada de `trip-focus/before/` y `task-source-diff.patch`, sin modificar implementación. Base Git `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo conservado. La base del renderer coincide con el SHA de la última candidata revisada de `trip-depth`: `94e1c6023c60e822c25d71d3f27557e76ca0c89d98fd11a4a5d8ae9d781f0b79`.

La candidata final de **19 archivos** se identifica en `independent-candidate-before-generated-note-sha256.json` y coincide con el manifest del implementador: renderer, CSS, prueba ajustada, prueba nueva y 15 HTML generados.

## Resultado

Sin hallazgos accionables pendientes dentro del alcance comprobado. Se conservan los destinos de las acciones, los importes y las restricciones; los nuevos iconos son SVG decorativos sin interacciones. La promoción compacta solo afecta al sidebar: mantiene tarifa actual/anterior, etiqueta, cupo y fecha aplicable cuando hay varias salidas.

## Hallazgos resueltos

1. **Restricción comercial personalizada con promoción.** El atajo inicial `offer || notaGenérica` eliminaba del sidebar cualquier nota personalizada cuando había una promoción. La versión final solo resume la nota genérica literal o vacía. La reproducción independiente cruza promoción activa/inactiva con nota personalizada, genérica y vacía: las seis combinaciones son correctas; se conservan y escapan `&` y los ángulos de la restricción.
2. **Preferencia de movimiento reducido.** La regla general de una clase no vencía a la nueva transición del CTA, de dos clases. La regla final específica dentro de `prefers-reduced-motion: reduce` elimina `transition` y `transform` tanto en el botón como en su hover. Comprobación estática de selectores y orden de cascada; sin atribuir una emulación de navegador no ejecutada.

## Evidencia propia final

- **145/145 pruebas** correctas en WSL/Node22: `independent-tests.txt`.
- **40 páginas** correctas, con coherencia generada, enlaces, anclas, recursos y sintaxis: `independent-check.txt`.
- `independent-focus.mjs` / `independent-validation.json`: siete viajes publicados y sus **15 rutas** coinciden con el renderer final; todo el HTML fuera del sidebar permanece idéntico a la base y todos los destinos y atributos de acción conservan sus valores.
- Seis escenarios propios de nota/promoción mantienen también idéntico el HTML fuera del sidebar. En la promoción aplicable a una fecha posterior permanecen su fecha, tarifa anterior/actual y las primeras cinco plazas; «100 € de descuento» sigue en las otras ubicaciones y se omite solo en la ficha lateral.
- **10 hashes protegidos idénticos**, incluido el PNG provisional; no cambian catálogo publicado, promociones privadas locales, modelo/adaptador/agrupación, Brevo, JS de viaje ni estilos compartidos.
- **18 parejas de contraste** calculadas: todas superan 4,5:1. CTA naranja/tinta **4.902:1**; hover **16.470:1**; disponibilidad verde **6.220:1**; nota de señal **5.582:1**. Los textos sobre las superficies nuevas comprobadas superan 5,09:1. Detalle en `independent-contrast.json`.

## Versión y límites

Renderer final `aeb5525541fdc43980e1a487e508a4b1ca29f0e401f9d72ebe2d8d8d6938384a`; CSS final `33626242ce60148ae148d98e87b23602e79504b726a4cb2c8f1da8f4305a96bf`. No se ha repetido la auditoría completa de pagos de la iteración anterior: el diff mantiene sus helpers y los datos protegidos; la suite existente vuelve a pasar. No he realizado QA independiente de navegador ni validado geométricamente la composición. La evaluación visual y los recorridos de navegador corresponden al implementador. No se han enviado formularios o mensajes ni ejecutado despliegues.
