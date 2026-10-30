# Home LST — separación de superficies, 24/10/2026

Candidata local sin commit ni publicación, sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048 y un árbol previamente modificado. before/ guarda la base exacta de esta iteración. candidate.sha256.json identifica la candidata revisada.

## Alcance y aceptación

El usuario pide distinguir destinos de niveles, el tramo inferior y las tarjetas, manteniendo marca y diseño aprobado. Producto: dist/home.css y dos puntos de salto opcional <wbr> en los títulos Aprendices/Supercracks de dist/index.html. Se conservan texto, tamaño, columnas y padding; evita letras huérfanas en móvil. El resto del HTML, contenido, orden, enlaces, datos, JS, hero y fuentes no se modifica. scripts/check-home-browser.mjs añade verificaciones de superficies efectivas, evitando confundir fondo transparente con un color distinto.

- Destinos conserva el crema original #FFFAE7. Tarjetas de viajes blancas, borde tinta algo más definido y sombra contenida; el botón naranja fino conserva sus reglas.
- Niveles usa #FBDDC7, mezcla opaca redondeada de 18 % naranja #EA5934 y 82 % crema. El panel completo tiene esquinas redondeadas; foto, tarjetas crema, copy, rutas y disposición interior se conservan. Dos títulos admiten un salto preferente para resolver un corte heredado, contrastado con la base. Se ajusta el espacio al final de destinos para marcar la entrada al nuevo panel.
- FAQ usa esa misma superficie cálida, separándose de opiniones y reserva, que conservan crema. No se añaden nuevas secciones oscuras o naranja puro.

## Validación

- npm run check: 19 páginas PASS (check.txt).
- Browser: 161 checks PASS en 320/390/768/1024/1440 px y texto al 200 %. Se comprueba también el foco de tinta en enlaces y resúmenes sobre el fondo cálido (13,34:1 frente al 2,72:1 del naranja). Además de superficies efectivas, conserva cobertura de fechas hover/touch/teclado, navegación, rutas y sin JS (browser/results.json).
- Inspección visual del conjunto desktop y detalles de niveles y FAQ en móvil. Capturas completas en browser/; detalles destinos/niveles/dudas a 390 y 1440 px.
- Revisión independiente: revision-independiente.md, con versión identificada por SHA.

## Límites

Validación local en Chromium; sin publicación ni analítica. No se afirma mejora de reservas. No se repiten pruebas de datos/renderer ni build con Sanity porque no cambian modelos, contratos ni generación de viajes; el único HTML cambiado son dos saltos tipográficos opcionales; las comprobaciones de páginas y navegador cubren el cambio visual. No se ha probado Safari/iOS físico ni se presenta esto como auditoría WCAG completa.
