# Home LST — equilibrio de color, 24/10/2026

Candidato local sin commit ni publicación sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. Comparación contra before/, copia exacta previa a esta tarea. Se conserva el resto del trabajo existente.

## Alcance y criterios

Solo cambian dist/home.css y scripts/check-home-browser.mjs. Versión por SHA-256 en candidate.sha256.json, diff acotado en task.patch. No se añaden assets ni dependencias.

- «Ver viaje» recupera el relleno naranja original #EA5934, manteniendo el formato fino: 13 px/peso 500 y unos 38,19 px de alto. El enlace que lo contiene mantiene al menos 44 px de área de pulsación y crece con el texto.
- El bloque de personas es un panel naranja contenido dentro del ancho de página, con 48 px de padding y radio 32 px en escritorio; 24 px y radio 26 px en móvil. La sección exterior permanece crema y deja margen visible alrededor. Texto, fotografía y caption no cambian.
- El cierre es la única sección grande con fondo tinta #1B1B1B. Tiene 48 px de padding vertical (40 px móvil), título más contenido y CTA crema. Footer, FAQs y opiniones permanecen claros.
- El hero blanco y su degradado, los niveles completos, los contenidos y los contratos se conservan. El cambio de selector compartido del gap 38 px retira únicamente el panel de personas para darle su propia separación; no modifica la FAQ ni la reserva.
- index.html, app.js, home.js, renderer y las ocho fichas generadas son idénticos a la versión previa. El manifiesto contrasta esos archivos con sus hashes anteriores.

## Evidencia ejecutada

- npm run check: 19 páginas PASS, rutas/enlaces/anclas/recursos/JavaScript. check.txt.
- scripts/check-home-browser.mjs: 131 comprobaciones PASS. Cinco anchos 320/390/768/1024/1440 px, texto 200%, navegación, paneles de fechas con teclado/hover/touch, lista larga, estados de precio y modo sin JavaScript. browser-check.txt y browser/results.json.
- Revisión independiente acotada en revision-independiente.md: diff e igualdad de secciones conservadas; panel y cierre a 320/390/1440 normal/200%, contraste de las dos combinaciones de marca y ausencia de recortes. No se repiten mediciones raster del hero porque sus reglas y fuentes permanecen exactas.
- Capturas completas finales browser/home-1440.png y browser/home-390.png; detalles people-final-1440.png y closing-final-1440.png.

No se repiten build ni pruebas de datos: esta iteración modifica únicamente CSS y sus comprobaciones visuales. La suite unitaria anterior es evidencia previa, no una ejecución actual.

## Límites

Validación local en Chromium; sin publicación ni analítica. No se ha medido conversión comercial ni probado Safari/iOS físico. La foto de grupo de Lucas sigue siendo provisional por decisión previa del usuario.
