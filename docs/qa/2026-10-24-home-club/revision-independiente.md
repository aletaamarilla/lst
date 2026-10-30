# Revisión independiente de la home · 24 de octubre de 2026

Revisión realizada por un subagente independiente, sin modificar la implementación. Resultado: no quedan bloqueos conocidos dentro del alcance revisado. Esta conclusión se limita a la candidata y las comprobaciones descritas aquí.

## Versión y alcance

Repositorio: letsurftogethersystem. HEAD de referencia: `58f338661fc4705364fea08727c836e79b3f2048`. La candidata está sin commit y el árbol ya contenía otros cambios previos. La comparación de esta tarea usa la instantánea `docs/qa/2026-10-24-home-club/before/`, no atribuye a esta tarea el diff completo respecto de HEAD.

Se revisaron la estructura y el contenido de la home, CSS aislado de la home, el generador de tarjetas y sus pruebas. Se contrastaron los contratos de `trip-model.mjs`, la validación de `sanity-trips.mjs`, el catálogo publicado, `dist/conocenos/index.html` y `docs/guia-cliente.md`. Se comprobó que `dist/home.js` coincide con la instantánea anterior de esta tarea.

Candidata final identificada por SHA-256:

| Archivo | SHA-256 |
| --- | --- |
| dist/index.html | d029b875557e4cff28f5766cbe90010d3a37e596814dcbbd73564ab17ec863a9 |
| dist/home.css | d1b3c290a514a17e32f246039072ad22a168e7517961c18c935d92ad50e84489 |
| scripts/render-home-trips.mjs | 2d88e7e821e3f77e82cf2c083291d206b01519bcdc41e28764428bfa9b7d12ce |
| scripts/home-trips.test.mjs | 47f5b70f21845cc4f8756f17628b516e1f18fa2eac683bb77256cfb18a8bc334 |

## Evidencia propia

- `npm test`, ejecutado desde WSL en el repositorio: 49 pruebas aprobadas, ninguna fallida. Incluye fechas y precios por salida, catálogo completo, ausencia de precios inventados, estados completos/pendientes, escape de contenido y requisito de nivel literal. El generador y las pruebas mantuvieron los hashes anteriores durante el cierre.
- `npm run check`, repetido tras la corrección final del caption: PASS en 19 páginas; rutas, enlaces, anchors, assets, vistas generadas y WhatsApp válidos.
- Inspección propia en Chromium mediante Playwright sobre `http://localhost:4191`: 320, 390 y 1440 px; sin errores JavaScript ni desbordamiento horizontal. CTA del hero visible, títulos dentro del viewport y requisitos de nivel separados de la fecha. Se cargaron las fotografías visibles antes de las capturas finales y se volvió a scroll 0 para situar correctamente la cabecera sticky.
- Contraste calculado: texto principal 11,25:1, texto secundario 5,73:1 y titular naranja grande 3,35:1.

Capturas finales propias, relativas a este informe:

- [Home 320](home-final-320.png), [home 390](home-final-390.png), [home 1440](home-final-1440.png).
- [Hero 320](hero-final-320.png), [hero 390](hero-final-390.png), [hero 1440](hero-final-1440.png).

## Hallazgo y resolución

P2: el sello naranja del hero invadía la primera línea del caption derecho en móvil. La combinación de `bottom:38px` en el sello y el caption estrecho de varias líneas hacía que parte del texto quedase tapada; se observó en la captura de 390 px.

Se eliminó la segunda frase decorativa del caption. Se verificó la versión final en 320, 390 y 1440 px: el sello queda dentro de la imagen y el caption queda libre. En 390 px, el borde inferior del sello es 644,23 px, el de la imagen 647,64 px y el caption empieza en 657,64 px. En 320 px son 673,84 / 677,25 / 687,25 px, respectivamente. El hallazgo queda resuelto en los hashes finales indicados.

## Conclusión y límites

La home cubre próximos viajes, experiencia LST, niveles, origen humano, reserva y dudas, con accesos al catálogo y consulta por WhatsApp. Las fechas proceden de las salidas configuradas y el requisito de nivel se presenta literal y escapado. No se detectaron cambios incompatibles en rutas, estados comerciales, precios, fuente Sanity ni canal de contacto dentro de lo revisado.

No quedan hallazgos accionables pendientes de esta revisión. No se ha validado un despliegue de producción, conversión comercial real, Safari/iOS físico ni toda la funcionalidad ajena a la home. La suite ampliada de 46 comprobaciones browser y el build real fueron ejecutados por el agente implementador; no se presentan aquí como ejecución independiente propia. Este informe no afirma ausencia absoluta de defectos.
