# Rediseño de home — 24 octubre 2026

Implementación local sin commit ni despliegue, sobre HEAD 58f3386. El árbol ya contenía trabajo de Sanity, limpieza y WhatsApp. Se conservó; los diff globales contra HEAD incluyen ese trabajo previo. Baseline de esta tarea: /tmp/lst-home-baseline-20261024, con originales de index, renderer y checkers, estado Git y hashes compartidos. Identificación de la versión candidata: candidate.sha256.

## Alcance y aceptación

- Portada con foto real de atardecer en Francia, Bricolage Grotesque y frase «¿Te vienes a surfear?». Composición responsive, sin dependencias nuevas ni vídeo.
- Cards con foto y nivel de Sanity, destino, precio y acceso permanente «Ver viaje». Fechas cerradas inicialmente, todas las salidas y precios propios en panel sobre foto: hover, clic/tap, Enter/Espacio, Escape y cierre exterior. Panel con desplazamiento mediante teclado para muchas fechas. Funciona sin JavaScript.
- Tres salidas destacadas en orden cronológico; todos los demás viajes permanecen en HTML y en «Más viajes», además del catálogo. Estados completo, pendiente, foto ausente y precio desconocido conservan los helpers comerciales existentes.
- Conservados navegación compartida, anclas anteriores, guía de niveles, FAQs cortas, contactos WhatsApp y noindex. Sin cambios de contratos, datos CMS ni páginas de detalle.

## Evidencia

- tests.txt: 48/48 pruebas (baseline previo 44/44); cuatro nuevas de fechas múltiples, precios desconocidos, orden y acceso al resto, estados y escape de contenido.
- check.txt: 19 páginas y enlaces/activos/generación/sintaxis correctos.
- build.txt y check-live-build.txt: build aislado con los ocho viajes publicados en Sanity y comprobación de sus 19 páginas. No modifica las fichas de dist.
- results.json y capturas: 46 comprobaciones Chromium de home, 320/390/768/1024/1440 px, texto al 200 %, interacción, 18 fechas, teclado, móvil táctil y sin JavaScript. Fotos reales CDN de las tres tarjetas destacadas cargadas; imágenes en colecciones cerradas mantienen lazy loading y pueden figurar aún sin cargar.
- check-sanity-browser.mjs: 196 aserciones aprobadas, fixtures de catálogo vacío, viajes múltiples, sin imagen, completo/pendiente, navegación, filtros/historial, modales, WhatsApp y texto al 200 %. Ejecutado con runtime Playwright externo, no añadido como dependencia.
- shared-files.txt: ocho archivos compartidos idénticos al estado previo (styles.css, mobile.css, app.js, trip.css, catalog.css y renderers de detalle, catálogo y niveles).

## Revisión independiente

Subagente review_home contrastó código y consumidores, ejecutó independientemente las cuatro pruebas nuevas y el checker de 19 páginas. Detectó que el estilo compartido de details giraba los controles 45°. Corregido con reset scoped y comprobación de transform en navegador. También revisó el delta final height:auto para respetar proporciones de fotos. Sin bloqueos adicionales en el alcance revisado; CSS final revisado 066ce59e…, hashes completos en candidate.sha256. Pruebas de navegador ejecutadas por el implementador.

## Fuentes y límites

Fotos del usuario: Francia_2024_11.jpg → francia-atardecer.webp; Cantabria DSC06393.jpg → cantabria-sesion.webp; Marruecos_2025_29.jpg → marruecos-grupo.webp. Cards siguen usando imágenes publicadas por Sanity. Bricolage Grotesque autoalojada desde Google Fonts, licencia OFL junto al archivo. No se han generado fotos con IA.

Validación local en Chromium; no certifica Safari/Firefox ni dispositivos físicos. No se ha desplegado, enviado mensajes ni publicado cambios. Archivos modificados de esta tarea: index.html, render-home-trips.mjs, check.mjs, check-sanity-browser.mjs. Nuevos: home.css, home.js, 3 fotos, fuente/licencia, dos scripts de prueba y esta evidencia. El resto del árbol sucio pertenece al trabajo previo.
