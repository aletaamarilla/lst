# Tarjetas de nivel y consulta visible · versión actual

Se aplican las mejoras solicitadas sobre la versión anterior de conversión. Candidata sin commit sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de`; los cambios previos se conservan. Sin push, publicación ni despliegue.

## Cambios

- Tarjetas con identidad claramente separada: cabecera oscura, numeral naranja, descripción y situaciones en una zona de lectura clara, objetivos y acciones al final. El nivel seleccionado tiene cabecera naranja y un lateral destacado que permanece con foco.
- «Consultar por WhatsApp» es un botón completo, oscuro y de contraste alto, con icono y etiqueta explícita. Mantiene el mensaje específico de cada nivel. La consulta final también gana tamaño y contraste.
- Viajes con fecha visibles primero. Los pendientes están en el desplegable nativo «Otros destinos por anunciar», inicialmente cerrado, con contador actualizado al filtrar. Conserva todos los destinos en el HTML.
- Una única ayuda final «¿Encaja tu nivel? Lo vemos contigo». Se retira el bloque duplicado de la lista de viajes y se traslada su contexto al enlace de consulta final.
- El resumen distingue cuántos viajes tienen fecha y cuántos destinos están pendientes. La configuración y autonomía de los viajes siguen intactas.

[Texto final visible al abrir la página](texto-final.txt) · [Versión y hashes](version.json) · [Datos y recursos preservados](preservation.json).

## Capturas

- [Tarjeta seleccionada en móvil](capturas/card-aprendices-390.png) · [en escritorio](capturas/card-aprendices-1440.png).
- [Viajes priorizados en móvil](capturas/viajes-390.png) · [en escritorio](capturas/viajes-1440.png).
- [Destinos pendientes desplegados en móvil](capturas/pendientes-390.png) · [en escritorio](capturas/pendientes-1440.png).
- [Página completa móvil](capturas/niveles-390-completa.png) · [escritorio](capturas/niveles-1440-completa.png).

Las capturas completas muestran el desplegable cerrado. Se revisaron visualmente esas páginas y la tarjeta seleccionada en móvil. Las fotos de las capturas de viaje se cargaron antes de guardarlas.

## Archivos y fuentes

Esta iteración modifica `dist/niveles/index.html`, `dist/levels.css`, `dist/levels.js`, `scripts/render-level-trips.mjs`, `scripts/check-levels.mjs` y la documentación README/propuesta/inventario. No cambia la home, sus scripts, las cabeceras compartidas ni las seis fichas. El build mantiene sus salidas al día.

Definiciones, fuentes editoriales y datos comerciales siguen siendo los de las entregas anteriores; no se investiga ni modifica ningún viaje. `data/trips.json` y los 32 recursos de marca conservan sus hashes. La guía sigue orientando y no certifica nivel; consultar no confirma plaza. Se mantiene noindex.

El generador incorpora el desplegable nativo en el bloque de destinos; el JS filtra los viajes y actualiza contadores y la ayuda compartida. La lectura de niveles, expansión de pendientes y navegación funcionan sin JS. El estado de apertura del desplegable se conserva al cambiar el filtro dentro de la página; al cargar o recargar empieza cerrado.

## Validación final

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Correcto, ambos generadores. [Log](build.log) |
| `npm test` | 5/5. [Log](test.log) |
| `npm run check` | Ocho páginas correctas, fuentes generadas sincronizadas. [Log](check.log) |
| `git diff --check` | Correcto |
| Matriz de guía/integración | 1.419 verificaciones, sin incidencias ni errores JS; 68 enlaces WhatsApp interceptados. [JSON](browser.json) |
| Revisión independiente | 35/35, sin hallazgos accionables ni errores JS. [Informe](revision-independiente.md), [evidencia](revision-browser.json), [hashes](revision-hashes.txt) |

Móvil y escritorio a 320, 390, 768, 1024 y 1440 px, pantallas bajas, texto al 200 %, teclado, anclas, destacado único, filtros comparados con el JSON, mensajes específicos, historial y recarga. Los destinos pendientes se abren y cierran con Enter/Espacio, también sin JavaScript. La consulta de las cuatro tarjetas se activa realmente por teclado y se intercepta localmente. No se envían mensajes.

La revisión independiente incluye tarjeta seleccionada a 320 px con texto al 200 % sin recorte, prioridad de salidas, desplegable, contexto de WhatsApp y las regresiones de la selección/historial. Los archivos de producto finales coinciden con los revisados.

No se repite la matriz amplia de `check-ux.mjs` de la entrega anterior: sus archivos de producto siguen idénticos. Se vuelven a comprobar los recorridos afectados de home/guía/seis fichas en la matriz de la guía. Validación en Chromium local; sin Safari, Firefox, lector de pantalla, teléfono físico ni app nativa de WhatsApp. No se afirma una mejora medida de ventas o posicionamiento.
