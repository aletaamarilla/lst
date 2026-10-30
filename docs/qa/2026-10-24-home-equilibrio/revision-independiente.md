# Revisión independiente — home equilibrio

24/10/2026. Sin hallazgos bloqueantes dentro del alcance comprobado. Esta conclusión corresponde únicamente a la candidata identificada abajo, sin trasladar aprobaciones anteriores. No se modificó producto.

Base Git: 58f338661fc4705364fea08727c836e79b3f2048; candidata local sin commit sobre un árbol previamente modificado. Comparación exacta de esta iteración: before/ y task.patch.

| Archivo cambiado | SHA-256 final |
| --- | --- |
| dist/home.css | 7924a627792e61e379d10594a6ad6cdb96840f08ad63f4606bb7cad4b98d328e |
| scripts/check-home-browser.mjs | 3414a4f67c5bac59aea0219e7e87b706e326c1e1c81efa15853e94b5816de630 |

El diff CSS se limita al relleno y hover de Ver viaje, panel interior de personas y cierre compacto. La separación del selector compartido de gap para personas conserva la declaración de FAQ. Se comprobó independientemente igualdad byte a byte de index.html, app.js, home.js y render-home-trips.mjs con before/. Las líneas de reglas hero/degradado y niveles son idénticas al normalizar terminadores de línea. No cambian contenido, assets, paleta, analítica o dependencias.

Validación propia mediante diff -u y un script Playwright de Node ESM/Chromium1228 contra localhost:4196, a320/390/1440px, normal y texto al200 %. Resultados en comparacion-independiente.json y browser-independiente.json:

- Panel naranja interior de284/346/1224px, separado18/22/108px de los bordes de pantalla; exterior crema. Padding24px y radio26px en móvil;48px y32px en escritorio. Ningún descendiente desborda horizontalmente el panel; tampoco aparece overflow de página al200 %.
- Ver viaje mantiene38,19px de altura visual, texto13px y enlace táctil de78,89–81,09px. Crece a56,39px al200 %, sin altura fija que corte el texto. Foco naranja de3px con offset5px.
- Texto y caption de personas usan tinta opaca sobre naranja: contraste4,90:1. Cierre, etiqueta y nota usan crema sobre tinta:16,47:1; el botón invierte estos colores. El cierre mide333,55px en móvil y341,61px en escritorio normal, y crece con el texto ampliado.

Evidencia del implementador, separada de las comprobaciones propias:131 verificaciones browser y npm run check con19 páginas PASS; manifiesto registra también las ocho fichas sin cambios. Las capturas completas de390/1440 las genera el implementador; no se tomaron nuevas capturas independientes ni se repitieron raster del hero, suites de datos o navegación ajenas al cambio.

Límites: Chromium local en los tres anchos indicados;200 % simulado duplicando tamaños computados. No es auditoría completa de accesibilidad ni prueba física Safari/iOS. No se comprueba conversión ni publicación. La geometría y colores se evaluaron directamente; no se promete ausencia absoluta de defectos.
