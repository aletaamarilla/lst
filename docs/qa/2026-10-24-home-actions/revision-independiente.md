# Revisión independiente — acciones de la home

Revisión sololectura de producto, realizada el 24/10/2026. Base: instantáneas exactas de before/ sobre el repositorio con HEAD 58f338661fc4705364fea08727c836e79b3f2048 y cambios previos sin commit. Candidata: los cinco archivos y SHA-256 completos de [candidate.sha256.json](candidate.sha256.json). Se comprobó que los SHA de la revisión propia de navegador coinciden con el manifiesto y los archivos finales. No se atribuye revisión a otros cambios del árbol.

**Resultado final: sin bloqueos pendientes dentro del alcance revisado.**

## Requisitos y compatibilidad

El renderer produce paneles con una única lista de fechas y sin precio, título, requisitos ni texto comercial. La ausencia de fechas conserva «Fechas por anunciar», sin inventar una salida. El precio sigue fuera del panel y el preview incorpora «Próxima fecha». La ordenación cronológica, disponibilidad distinta de disponible, enlaces directos y escape de texto permanecen en el renderer. Los siete casos unitarios cubren listas, precios ausentes/mixtos, fechas sin ordenar, próximos destinos y escape.

Se contrastaron los consumidores: build.mjs, check.mjs, check-home-browser.mjs, check-sanity-browser.mjs y home.js. Continúan los marcadores de generación, data-home-dates, details/summary, región con tabindex=0, IDs y referencias ARIA. Los ocho enlaces de tarjetas y todos los IDs son exactos frente a la base y no hay IDs duplicados. El control «Cerrar ×» está fuera del contenido del panel.

«Ver todos» aparece junto al encabezado y enlaza al catálogo. La ayuda de nivel gana presencia y mantiene su ancla. El nuevo botón «Escríbenos al» tiene icono decorativo y nombre accesible WhatsApp; conserva número, mensaje, data-whatsapp=orientacion y apertura segura. Se comprobó el href sin abrir WhatsApp ni enviar mensajes. Historia, guía, opiniones, FAQ, cierre, navegación, pie y alternativa sin JavaScript reciben tratamiento de botón mediante enlaces semánticos. Las acciones visuales de las tarjetas de niveles son spans dentro de un único enlace; no se anidan controles interactivos.

El HTML del hero y las fuentes fotográficas no cambian. Su CTA y las acciones de viajes del encabezado son naranja original. La composición de niveles, orden de secciones y ruta de reserva se conservan. app.js, home.js y check.mjs son idénticos a la base. Los estilos añadidos están limitados a body.home-modern, sin alcance sobre interiores.

## Hallazgo resuelto

[P2] En dist/home.css, los nuevos botones del pie heredaban texto con alfa 0,73 mientras el hover añadía fondo naranja. Escenario comprobado: enlace «Viajes», 11 px; composición aproximada RGB 83/44/34 sobre 234/89/52, contraste 3,42:1. La candidata final usa tinta opaca en la regla base del enlace: 4,90:1 sobre naranja y 16,47:1 sobre crema. También queda cubierto el retorno de la transición. Evidencia anterior: [footer-hover-before-fix.json](footer-hover-before-fix.json); revalidación final propia: [footer-hover-independiente.json](footer-hover-independiente.json).

## Evidencia y límites

Comprobación propia en Chromium a 320, 390 y 1440 px: enlaces, dimensiones internas y reflujo con texto al 200 %, foco visible de 3 px, hover de fechas y ayuda, Escape y menú móvil. Sin desbordamientos de página ni de acciones. [browser-independiente.json](browser-independiente.json) registra valores y SHA; [comparacion-independiente.json](comparacion-independiente.json) recoge preservación de contratos. Se inspeccionaron capturas desktop y móvil del candidato final. Los botones conservan jerarquía primaria/secundaria y las fechas se leen sin texto adicional.

Evidencia del implementador contrastada: 197 comprobaciones del navegador sin errores, siete pruebas de renderer aprobadas y comprobación estática de 19 páginas aprobada. No se repitió toda su suite ni se ejecutó una compilación que recargue datos de Sanity; esta revisión no atribuye esos trabajos como propios. La prueba independiente sí se repitió después de la corrección final del pie.

No se han validado Safari/iOS físicos, servicio externo de WhatsApp, publicación ni incremento de reservas. La apariencia más operable es un criterio de interfaz, no evidencia de conversión. No se añadieron analíticas.
