# Revisión independiente · Jerarquía de la home

24 de octubre de 2026. Revisión nueva contra la baseline de esta iteración, sin trasladar aprobaciones anteriores. Resultado: no se detectan bloqueos ni hallazgos accionables pendientes dentro del alcance comprobado.

## Base y alcance

Repositorio letsurftogethersystem. HEAD de referencia: `58f338661fc4705364fea08727c836e79b3f2048`. Candidata sin commit sobre un árbol con trabajo previo. Comparación contra `docs/qa/2026-10-24-home-jerarquia/before/`; no se atribuye a esta tarea el diff completo respecto de HEAD.

Archivos de producto revisados: `dist/index.html` y `dist/home.css`. También se revisó el ajuste del script `scripts/check-home-browser.mjs`. El renderer de tarjetas y `app.js` / `home.js` son idénticos a before, byte a byte. No se añaden dependencias, analítica ni publicación.

## Requisitos y consumidores

- CTA Ver viaje más sutil: altura visual computada de 38,1875 px, fuente de 13 px y peso 500 en 320, 390 y 1440 px. El enlace interactivo conserva altura de 81,09 px en móvil y 78,89 px en escritorio, superior a 44 px. Al ampliar texto al 200 %, el CTA crece a 56,39 px; no tiene una altura fija que recorte el texto.
- Se elimina el gran bloque Viajar con LST. Opiniones queda tras destinos e incorpora la frase Puedes apuntarte aunque no conozcas a nadie.
- El ID experiencia se conserva en el contenedor interior de opiniones. Se localizaron consumidores reales de /#experiencia en catálogo, niveles, Conócenos, FAQs y las ocho fichas. El destino existe y el scroll conserva separación respecto de la cabecera; a 390 px y texto 200 %, el título empieza en y189,81 y la cabecera termina en y113,59.
- Hero, bloque completo de niveles, personas y cierre mantienen exactamente su HTML anterior. Se conservan los cuatro niveles, sus textos, enlaces y fotografía; no se detectan variaciones visuales dentro de lo comprobado.
- Las tres preguntas y respuestas de FAQ mantienen exactamente el HTML de before; únicamente se mueven antes de reservas. El panel FAQ tiene fondo tinta y texto crema, bordes redondeados y símbolos naranjas. Reservas continúa sobre crema.
- El bloque generado de los ocho viajes es idéntico a before. No se eliminan datos del programa, fechas, precios, requisitos, estados comerciales ni rutas. Los contratos de WhatsApp y la interacción de fechas se conservan.

## Validación propia

- `npm run check`: PASS en 19 páginas; vistas generadas, rutas, enlaces, anchors, assets y contacto válidos.
- Chromium mediante Playwright sobre el preview local 4194: 320 × 844, 390 × 844 y 1440 × 900 px. Cero errores JavaScript y ningún desbordamiento horizontal con texto normal o al 200 %.
- FAQ: Enter abre la primera pregunta y un clic abre la segunda sin cerrar la anterior; estados observados true / true / false. Colores computados: panel rgb(27,27,27), preguntas rgb(255,250,231) y respuestas rgba(255,250,231,0.85). Se inspeccionó visualmente el panel de escritorio y la home móvil.
- Sin JavaScript a 320 y 390 px: FAQ y fechas abren de forma nativa; el enlace de navegación alternativa llega a /viajes/.
- Todas las imágenes se decodificaron antes de las capturas; se cerró de nuevo la colección adicional y se volvió a scroll 0. Ninguna imagen quedó pendiente de carga.

Las mediciones están en [browser-independiente-final.json](browser-independiente-final.json). El build de ocho viajes, las 53 pruebas unitarias y la suite browser de 116 comprobaciones fueron ejecutados por el implementador; no se presentan como ejecuciones propias del revisor. No se repitió la suite unitaria independiente porque esta iteración no modifica el renderer, el modelo ni la lógica de interacción.

## Evidencia visual

- [Home móvil](home-final-390.png).
- [Home de escritorio](home-final-1440.png).
- [Panel de FAQ](faq-final-1440.png).

La captura cards-final-1440.png muestra las tres tarjetas, pero tiene espacio sobrante y no recoge el tramo Más viajes/nota. No se usa como evidencia de la sección completa; esa parte se contrasta con las capturas completas de la home.

## Candidata final: SHA-256

| Archivo | SHA-256 |
| --- | --- |
| dist/index.html | c29fb61c4aa8d2e3d1db970e2e68622b60578dba1b9cb4ade77b5b4a290ba227 |
| dist/home.css | cff96d48ad35a41285c8bae9e63d460310b053010d0ce9adcbad1b16c75be4d8 |
| scripts/check-home-browser.mjs | 1f2682bc1e81a9331c88f26b6d021fde3d1b98dde940bc86cb30ffdf737b92b7 |

El [manifiesto de candidata](candidate.sha256.json) y el [diff de la tarea](task.patch) identifican el alcance adicional de la entrega. Los hashes anteriores se calcularon directamente sobre los archivos revisados.

## Límites

Validación local en Chromium, con los anchos y ampliación indicados. No se ha validado producción, conversión comercial ni Safari/iOS físico. La revisión no cubre todo el trabajo previo del árbol ni garantiza ausencia absoluta de defectos.
