# LST · revisión independiente final · 12/10/2026

Revisión local cerrada dentro de esta fase: no quedan regresiones observadas en el alcance comprobado. No equivale a autorización de lanzamiento ni a una auditoría de todos los navegadores. La implementación anterior se conserva íntegra: **ningún archivo de producto corregido**. Solo se añaden este informe, evidencias y referencias en la documentación vigente.

Repositorio `aletaamarilla/lst`, base `6053e6173d6114ee741bc0f4310d79418f22199e`, con el diff previo sin commit. La candidata se identifica con los hashes de [version.json](version.json), y el punto de partida con [initial-status.txt](initial-status.txt) e [initial-hashes.json](initial-hashes.json). [Resumen de resultados](summary.json).

## Tabla de comprobaciones

| Comprobación | Resultado | Evidencia de esta revisión | Pendiente / límite |
| --- | --- | --- | --- |
| 1. Home y seis destinos: enlaces, imágenes, títulos, contenido e identidad | Conforme dentro del alcance local. Siete rutas, un h1 por página, imágenes decodificadas, sin placeholders editoriales. Los estados «Por confirmar» son intencionales. | [check.log](check.log), [140 vistas](matrix.json), [cinco anchos](#capturas), [contenido](content-review.md). Los 10 enlaces públicos externos devolvieron HTTP 200 mediante HEAD: [registro](external-links.json). | HEAD no certifica el contenido externo, disponibilidad futura ni aplicación nativa de WhatsApp. |
| 2. Experiencia LST y respaldo de nuevas afirmaciones | Presentación, origen de Lucas, acompañamiento y recuerdos respaldados por fuentes retenidas. Laura: Marruecos; Ainhoa: sin destino atribuido. Sin personas, credenciales o testimonios nuevos inventados. | [Contraste independiente directo](content-review.md) y [huellas](content-review-hashes.json). | Nombres/funciones del equipo actual y retratos autorizados siguen pendientes. |
| 3. Contenido ambiental | La UI expresa principios; no promete recogidas, colaboración vigente con Universal Plastic ni aportación del 3 %. | [Revisión de inventario y siete HTML](content-review.md), `docs/content-inventory.json` con tres propuestas internas `publicUI:false`. | Confirmar vigencia, alcance y evidencia antes de convertirlas en compromisos públicos. |
| 4. Home → viaje → nivel → fotos → fecha → consulta | Recorrido ejecutado para los seis destinos a 390 y 1440 px, incluida guía de niveles y regreso a la ficha/catálogo. | [journey.json](journey.json), 14 aperturas interceptadas; [resolución de formato de fecha](resolved-signals.json). | No se envió nada ni se ensayó WhatsApp nativo. |
| 5. Etiquetas y contexto | «Ver viaje/destino» navega, «Ver fotos» amplía, «Elegir fecha» abre selector y «Consultar» abre una consulta contextual. La ayuda de nivel conserva destino y propósito. | [Recorridos](journey.json), [prueba UX](ux.json), [selector](capturas/dates-390.png). | Receptor de WhatsApp definitivo pendiente. |
| 6. Una fecha, varias y pendientes | El Salvador conserva fecha y consulta directa; Asturias ofrece dos consultas distintas; cuatro destinos sin fechas/precios nuevos. Lista larga de 16 salidas en fixture temporal. | [5 pruebas de modelo](test.log), [dialogs.json](dialogs.json), [consulta de fecha escrita completa](resolved-signals.json). | La demo de Asturias se conserva por decisión expresa; no valida una oferta comercial real. |
| 7. Menú, niveles, desplegables, galería y selector | Apertura, selección y navegación comprobadas. Desplegables de los seis destinos mediante Enter/Espacio; niveles con flechas/Home/End; fotos desde cada miniatura. | [UX: 1.225 comprobaciones](ux.json), [diálogos: 1.744](dialogs.json), [recorridos: 459 observaciones iniciales](journey.json), con las dos alertas de formato resueltas. | Los conteos acreditan ejecución; el alcance lo describen las filas y escenarios. |
| 8. Teclado, foco, cierre y scroll | Tab/Shift+Tab, Escape, cierre con botón, extremos de galería, retorno al disparador y posición de lectura; fondo bloqueado y barra inferior oculta en modal. | [dialogs.json](dialogs.json), [ux.json](ux.json). 18 pares de gestos nativos CDP de ida/vuelta en fotos, más galería de página. | Sin lector de pantalla ni dispositivo físico. |
| 9. Adaptación, pantalla baja, texto y movimiento | Siete páginas × cinco anchos × dos alturas × texto 100/200 % = 140 vistas. Movimiento normal/reducido en pruebas de diálogos. | [matrix.json](matrix.json), [dialogs.json](dialogs.json), capturas de [320](capturas/covers-320.png), [390](capturas/covers-390.png), [768](capturas/covers-768.png), [1024](capturas/covers-1024.png) y [1440](capturas/covers-1440.png). | Texto 200 % simulado duplicando tamaños calculados; no certifica todos los modos de zoom. |
| 10. Solapamientos y scroll horizontal | Sin desbordamiento horizontal del documento ni recorte en los elementos de texto comprobados. No se observaron cruces de contenido/controles en las capturas inspeccionadas. | [Matriz](matrix.json), [geometría detallada](geometry.json), [alertas resueltas con métricas de texto dibujado](resolved-signals.json). | Las intersecciones de contenedores vacíos y cajas métricas no se cuentan como defectos; explicación abajo. No es inspección manual de cada píxel. |
| 11. Formularios, pagos y envíos automáticos | Ausentes. Sin formularios/inputs, fetch, XHR, beacon, almacenamiento ni SDK de pago/medición. Ninguna solicitud externa automática en la matriz. | [matrix.json](matrix.json), [check.log](check.log), revisión de `dist/app.js` y `dist/trip.js`. | Aperturas de consulta interceptadas localmente. |
| 12. Fuentes, plantilla y HTML sincronizados | `build`, `test` y `check` pasan. Seis HTML regenerados idénticos. Fuentes locales y assets conservados. | [build.log](build.log), [test.log](test.log), [check.log](check.log), [preservation.json](preservation.json). | La home es editable directa y las fichas se generan; cambios comerciales futuros deben sincronizar ambas. |
| 13. Documentación vigente e historia | README, inventario y propuesta coherentes con revisiones 13–17. Se añade esta revisión conservando las anteriores. | [Revisión documental independiente](content-review.md), entradas nuevas de revisión 18 en README y propuesta. | Los informes previos se conservan como historia, no sustituyen la evidencia actual. |

## Qué está integrado y qué sigue siendo una recomendación

Comprobados en esta candidata: WhatsApp en menú móvil y etiquetas contextuales; legibilidad y barra de consulta adaptable; presentación/origen/equipo; voces de Laura/Ainhoa con contexto; bloque de respeto; encuadres documentales, títulos separados en Azores/Cádiz, portadas móviles y tarjetas con texto ampliado; galería completa y cierre/foco; selector de fechas con desplazamiento en pantallas bajas. No se confunden los datos provisionales ni los pendientes de contenido, indexación o medición con funcionalidades implementadas.

## Alertas contrastadas y descartadas

Se conservan los registros originales para que el resultado sea auditable:

- La matriz inicial señaló 62 intersecciones entre el contenedor `.trip-cover-copy` (incluido su padding y ancho vacío) y «Ver fotos». No demostraban ocultación. La comprobación adicional de 120 portadas midió las cajas de texto y redujo las señales a 14 casos con Aura al 200 %. Estas cajas incluyen espacio de ascendente/descendente sin glifos. El contraste de métricas `actualBoundingBoxAscent/Descent` no presenta colisión entre texto dibujado y botón; se inspeccionaron capturas representativas. Véanse [Asturias 1024](capturas/actual-overlap-asturias-1024x900-2.png), [Marruecos 768](capturas/actual-overlap-marruecos-768x1024-2.png) y [resolución](resolved-signals.json). No se cambió CSS para satisfacer un detector incorrecto.
- Dos aserciones del recorrido suponían que el mensaje de El Salvador contenía literalmente «25 oct — 1 nov 2026». El contrato permite un mensaje específico y conserva «25 de octubre al 1 de noviembre de 2026». La fecha es correcta. Se repitieron solo ambas aperturas afectadas y se comprobaron fechas y contexto, con interceptación local. [Evidencia](resolved-signals.json).

No se tocaron ni debilitaron `npm test`, `npm run check` ni los comprobadores de UX/diálogos anteriores. Los scripts `matrix.cjs`, `geometry.cjs`, `journey.cjs` y `resolve-signals.cjs` conservan los procedimientos diagnósticos y sus supuestos para interpretar los JSON; no son nuevos comandos de CI ni reemplazan los tests del proyecto.

## Archivos corregidos y conservación

**Producto: ninguno.** No se observó una regresión que justificara cambiar implementación, copy, datos, imágenes, fuentes o validaciones. [Preservación byte a byte](preservation.json) y [hashes de candidata](version.json).

- `README.md`: añade enlace y resultado de la revisión 18, con límites y pendientes.
- `docs/propuesta.md`: añade el cierre de la fase sin reescribir la historia.
- `docs/qa/2026-10-12-final/`: informe, matriz, logs, scripts diagnósticos, capturas y versión.

Los cambios previos sin commit se mantienen. No se ha hecho commit, push, publicación, despliegue ni envío de mensajes.

## Capturas

Portadas de las siete páginas: [320](capturas/covers-320.png) · [390](capturas/covers-390.png) · [768](capturas/covers-768.png) · [1024](capturas/covers-1024.png) · [1440](capturas/covers-1440.png).

Home completa: [móvil](capturas/home-390x844-text100-full.png) · [escritorio](capturas/home-1440x900-text100-full.png). Láminas de lectura móvil inspeccionadas: [home](capturas/reading-home.png), [El Salvador](capturas/reading-el-salvador.png), [Asturias](capturas/reading-asturias.png), [Azores](capturas/reading-azores.png), [Euskadi](capturas/reading-euskadi.png), [Marruecos](capturas/reading-marruecos.png), [Cádiz](capturas/reading-cadiz.png).

Interacción: [menú móvil](capturas/menu-390.png), [niveles](capturas/levels-390.png), [fechas móvil](capturas/dates-390.png), [fechas escritorio](capturas/dates-1440.png), [foto vertical](capturas/photo-asturias-390.png), [foto escritorio](capturas/photo-asturias-1440.png), [destino pendiente](capturas/photo-azores-390.png).

Casos límite: [foto en 320 × 320 con texto 200 %](capturas/large-photo-320x320.png) y [última de 16 fechas, 390 × 360 con texto 200 %](capturas/long-dates-390x360-text200-last-date.png). Estas 16 salidas pertenecen exclusivamente a una fixture temporal.

Las láminas de lectura recortan una captura completa en tramos, de izquierda a derecha y después de arriba abajo. La barra fija aparece una sola vez en esas capturas completas; no representa un corte permanente del contenido al desplazarse.

## Límites reales

Chromium local real mediante Playwright, con eventos táctiles CDP y navegación de teclado; sin Safari, Firefox, teléfono físico, lector de pantalla ni app nativa de WhatsApp. La inspección visual directa cubrió las cinco láminas de portadas, lectura completa de las siete páginas en móvil, home de escritorio y capturas de interacciones/casos límite. La matriz automatizada cubre las 140 combinaciones, pero no es una inspección manual exhaustiva de cada una.

No se investigó ni revalidó la exactitud comercial de precios, fechas, servicios o disponibilidad. Las fuentes retenidas acreditan respaldo documental; no vigencia actual ni identidades de personas fotografiadas. Las peticiones HEAD a enlaces públicos solo acreditan respuesta HTTP en esta revisión.

El primer acceso local falló por el entorno de ejecución restringido. Se resolvió mediante la ejecución autorizada antes de inspeccionar o escribir el checkout. Se reutilizaron Playwright/Chromium y bibliotecas locales; no se instalaron dependencias ni se cambió el sistema.

## Futuro lanzamiento — anotado, sin implementar

1. **Datos definitivos:** confirmar ofertas, fechas, precios, niveles, programa, inclusiones, condiciones y receptor de WhatsApp; sustituir explícitamente la demo de Asturias. Mantener coherencia entre home, JSON y HTML generado.
2. **Contenido pendiente:** equipo actual y funciones, fotografías/retratos autorizados, contenidos definitivos de próximos destinos. Resolver por separado recogidas de plásticos, Universal Plastic y 3 % con evidencia y alcance vigente antes de publicarlos como compromisos.
3. **Migración de URLs:** inventariar rutas antiguas y nuevas, acordar redirecciones, conservar enlaces a fuentes históricas donde corresponda y revisar enlaces de niveles, testimonios y dossier. No cambiar rutas en esta fase.
4. **Indexación:** decidir dominio final; ajustar OG/URLs/canonical/sitemap y controles de rastreo; retirar `noindex,nofollow` solo con aprobación de lanzamiento. El prototipo sigue sin indexar por diseño.
5. **Medición:** acordar eventos y objetivos (viaje visto, nivel consultado, fotos, fecha, apertura de WhatsApp), consentimiento aplicable y comprobación posterior con tráfico real. Abrir WhatsApp no equivale a mensaje enviado ni reserva confirmada; ninguna mejora de conversión está medida.

## Reproducción local

`npm run dev` sirve la candidata en `http://127.0.0.1:4175`. Se ejecutaron `npm run build`, `npm test` y `npm run check` sobre el checkout indicado. Para navegador se reutilizaron `/home/amfernandez/.cache/ms-playwright-go/1.50.1/package`, Chromium `/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` y `LD_LIBRARY_PATH=/tmp/top4982-browser/libs/usr/lib/x86_64-linux-gnu`.

Los comprobadores existentes admiten `LST_PLAYWRIGHT_MODULE`, `LST_CHROMIUM_PATH` y `LST_QA_OUTPUT`. Los diagnósticos de esta carpeta conservan rutas temporales de esta máquina; antes de repetirlos, adaptar sus rutas de salida/runtime. Los JSON y capturas son la evidencia de esta ejecución, no una promesa de que existan esas rutas en otra máquina.
