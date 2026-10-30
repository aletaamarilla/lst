# Limpieza del dominio de viajes tras Sanity · 24/10/2026

Implementación local sin commit sobre `58f338661fc4705364fea08727c836e79b3f2048`. El HEAD inicial era `50ffb54`; durante la tarea se incorporó el commit de PDF `58f3386`, cuyo contenido se ha conservado. Identificación exacta de los 45 archivos del diff y sus hashes en [version.json](version.json). El resto de archivos de QA/Sanity que ya estaban sin seguimiento al empezar no pertenece a esta tarea.

## Eliminaciones y consumidores

- Retirados `data/trips.json` (493 líneas de catálogo antiguo) y `build:demo`/`--demo`. El build solo consulta Sanity publicado; el snapshot es una salida generada, no un respaldo de datos.
- Retiradas ramas exclusivas de aquel modelo: fechas/precios/duración a nivel de viaje, etiqueta de fechas de la demo, conversión a assets locales, testimonios/enlaces del viaje anterior, portada de grupo y ajustes móviles asociados. Eliminados imports, helper de assets, estilos y textos de FAQ/respaldo inalcanzables porque el adaptador ya entrega arrays y strings.
- Eliminadas 13 imágenes que solo utilizaba aquel catálogo: 1.371.728 bytes. No se han eliminado imágenes compartidas con la home, Conócenos o niveles; tampoco recursos sin uso cuya obsolescencia no pudiera atribuirse a esta integración.
- Retirados `check-catalog.mjs`, `check-home-cards.mjs` y `check-ux.mjs`, dependientes del catálogo demo. Sus escenarios vigentes se comprueban en la suite Sanity, los diálogos conservados y QA editorial. Las pruebas unitarias usan casos pequeños de comportamiento. Los datos sintéticos de navegador solo viven en directorios temporales o respuestas interceptadas de QA.

Se buscaron referencias en código versionado de build, servidor, scripts/pruebas, Studio, JS, HTML, CSS y JSON. Además se revisaron manualmente las rutas dinámicas (`readdir`, `cp`, construcción de slugs, filtros, selección de assets y generación de fichas). [reference-audit.json](reference-audit.json) registra los 17 archivos borrados, cero referencias activas restantes y las rutas conservadas. Las menciones históricas en documentación/evidencia no son consumidores de producción y se conservan como historial.

## Compatibilidad conservada

Las 15 rutas bajo `/viajes/` permanecen en las mismas URLs: catálogo, ocho fichas y seis avisos históricos. Ninguna URL se ha sustituido, por lo que no hace falta una redirección nueva. Se mantiene la conversión de rutas anteriormente publicadas en avisos al despublicar.

Se conservan el catálogo vacío, los estados pendientes, los precios desconocidos, las consultas WhatsApp, el programa/equipo por confirmar, la recuperación del último build válido y el bloqueo de escritores concurrentes. También se conserva `dossierFile → dossier`, la compatibilidad de documentos con `capacity.available` y el contrato del snapshot público. No se han eliminado documentos, assets ni borradores de Sanity. Solo se ha leído el catálogo publicado; no se ha desplegado.

El único esquema `trip`, los campos editoriales y las dependencias de Studio siguen teniendo consumidores. No se ha eliminado un campo por no aparecer en las ocho fichas actuales. El importador protegido permanece como herramienta explícita de importación, con preflight, detección de colisiones y pruebas; no es una fuente del build.

## Validación y límites

| Comprobación | Resultado y evidencia |
| --- | --- |
| Base inicial | `npm test`: 44/44; `npm run check`: 19 páginas. [test](base-test.txt), [check](base-check.txt). |
| Candidata final | `npm test`: 44/44; `npm run check`: 19 páginas, enlaces/anclas/assets, generación coherente y WhatsApp. [test](tests.txt), [check](check.txt). |
| Lectura/build real | Sanity publicado, 8 viajes; snapshot y contenido editorial conservados. [build](build.txt). |
| Tipos Studio | `npm run studio:check` pasa. [salida](studio-check.txt). No se ha cambiado código de Studio. |
| Navegador Sanity | 172 aserciones a 320/390/1440 px: vistas, vacío, rutas, filtros/historial, completos/pendientes, fechas, galería/foco, FAQs, datos opcionales, no-JS y tarjetas con texto al 200 %. [salida](sanity-browser.txt). |
| Diálogos | 420 comprobaciones en escenarios seleccionados a 390 px, incluidas pantallas cortas, texto al 200 %, dos/16 fechas, teclado, foco y tres gestos táctiles. [salida](dialogs.txt), [detalle](dialogs-results.json). No se ejecutó la matriz completa de todas las anchuras. |
| Consumidores editoriales | Conócenos: 245 comprobaciones; FAQs: 770 y 13 rutas. [Conócenos](about.txt), [FAQs](faqs.txt). |
| Guía de niveles | La suite completa ejecuta 1.412 comprobaciones y falla en 28 escenarios de visibilidad total del foco sobre tarjetas altas. Repetida con la misma harness y snapshot contra `dist` original de `58f3386`: los 28 registros coinciden exactamente, incluidos texto y coordenadas; cero errores JS en ambas versiones. [comparación](levels-comparison.json), [base](levels-base.json), [candidata](levels-candidate.json). |
| Revisión independiente | [Informe](revision-independiente.md), [test ejecutado por el revisor](independent-test.txt), [check ejecutado por el revisor](independent-check.txt). |

Los fallos de foco de la guía son una limitación previa reproducida y quedan fuera del alcance de esta limpieza; no se presenta esa suite como aprobada ni se afirma una validación global sin incidencias. Las imágenes de los fixtures de viajes se interceptan localmente: esas pruebas validan interfaz y datos, no disponibilidad remota de todo el CDN. No se enviaron mensajes ni solicitudes comerciales.
