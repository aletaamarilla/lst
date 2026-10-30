# Home LST — fechas y botones,24/10/2026

Candidata local sin commit ni publicación sobre HEAD58f338661fc4705364fea08727c836e79b3f2048. Se conserva el árbol previamente modificado. before/ guarda la base exacta (ruta con / sustituida por __), task.patch acota cambios y candidate.sha256.json identifica los cinco archivos revisados.

## Requisitos implementados

- Cards: panel de hover/tap solo con la lista de fechas, sin título, precios, requisitos o notas. Se conserva el control nativo de abrir/cerrar, región enfocada/desplazable y acceso independiente a ficha. Sin fechas, texto honesto Fechas por anunciar.
- Debajo de foto: etiqueta Próxima fecha y primera salida cronológica, sin contador adicional. Precio/estado/nivel mantienen su sitio y lógica. Se regeneró únicamente la región home con el snapshot existente, sin consultar Sanity ni actualizar viajes.
- Ver todos arriba a la derecha de Próximos destinos; ayuda ¿Dudas con tu nivel? debajo, con contorno naranja y símbolo de interrogación. La cabecera permite envolver en texto ampliado.
- Ver viajes naranja en navegación de escritorio, cabecera móvil y botón principal de portada. Foto, titular blanco, estructura y composición se mantienen.
- Ayuda de nivel: botón Escríbenos al con icono de conversación/teléfono para WhatsApp, oculto a accesibilidad y con nombre accesible WhatsApp. Destino directo al mismo wa.me/34648189257 y mensaje orientacion existente; no se envían mensajes automáticamente.
- Historia, guía, reseñas, FAQ, cierre, navegación, versión sinJS y pie usan botones sutiles. Los enlaces de FAQ pasan al final de sus respuestas. Las tarjetas de nivel siguen siendo un único enlace; el CTA interno es un span con apariencia de botón, sin anidar controles. Logos y salto de contenido conservan su función.
- Detalles naranja al hover en contornos, CTA de niveles, reseñas y FAQ, además de botones. Sin movimiento; respeta reduced-motion. Foco tinta en header y superficies claras, crema en fotografía/tinta.

## Validación

- npm run check:19 páginas PASS (check.txt).
- node --test scripts/home-trips.test.mjs:7/7PASS (renderer-tests.txt), cubre fechas-only, precios footer/missing/mixed, primera fecha, rutas, pending/full/empty, IDs y escapes.
-197 checks browser PASS en320/390/768/1024/1440: texto200%, todos CTAs44px, posición Ver todos, fechas-only, WhatsApp, hover/touch/teclado/Escape, fechas largas, rutas y sinJS. browser/results.json.
- Revisión visual propia de escritorio, móvil y panel fechas. Browser real4175 de usuario recargado y AX confirmó destinos/WhatsApp/etiquetas; no se abrieron destinos externos.
- Revisión independiente: revision-independiente.md. Hallazgo resuelto: texto semitransparente del pie daba3,42:1 sobre naranja al hover; ahora tinta opaca4,90:1 también durante la transición de salida. Se añadió aserción específica.

## Preservación y límites

app.js, home.js y check.mjs son idénticos a before/. Modelos, datos, fichas y catálogo no se modifican. Precio por salida sigue en las fichas; el panel de home muestra solo fechas por petición del usuario. La ayuda de nivel cambia de ancla a WhatsApp de forma deliberada. No se ejecuta build que recargue Sanity; se valida el generador sobre datos existentes y sus fixtures.

Chromium local, sin Safari/iOS físico ni auditoría WCAG completa. Sin publicación, analítica ni afirmación de aumento de reservas. El servidor de usuario4175 se conserva activo. Capturas completas finales en browser/home-1440.png y home-390.png; panel de fechas de escritorio en home-dates-desktop.png. La captura móvil de fixture18fechas puede mostrar el highlight transitorio del tap del navegador; no se usa como preview final.
