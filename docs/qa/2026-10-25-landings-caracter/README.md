# Voz y carácter de LST · 25/10/2026

Candidata local sin commit sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048`. El árbol previamente modificado se conserva. `before/` es la base exacta; `task.patch` delimita siete archivos de esta iteración, y `candidate.sha256.json` identifica la entrega final y home.css/app.js como referencias compartidas sin modificar.

## Decisión editorial y visual

El usuario aprecia la nueva estructura, pero pide carácter: percibe una lectura plana y genérica. Esta iteración reescribe Conócenos y las ocho respuestas FAQ. La voz es cercana, directa y cómplice, con detalles propios de LST: el viaje de Lucas y su comunidad a Marruecos, el inicio a finales de 2024, surfskate en Cádiz, mesa y convivencia.

«Tú trae las ganas» abre la página. «El together va en serio» liga el nombre al valor del grupo; la historia cuenta el viaje de prueba y el año de preparación. «El equipo también se moja» conduce a información concreta antes/durante el viaje. Se retira un párrafo de bienvenida redundante. Los titulares usan acentos naranja, una banda tinta da contraste al texto sobre fotografía y las escenas alternan alineación y tamaños. La fotografía de comunidad de 2025 se identifica como posterior al origen; no se asignan identidades a los retratados. Las fotos del cuerpo se mantienen completas.

Las FAQs conservan sus ocho preguntas, los destinos de enlaces y las condiciones. Las respuestas se escriben con frases más directas, manteniendo requisitos por salida, material/alquiler por consultar, llegada antes de comprar billetes, necesidades alimentarias y confirmación de plaza con el equipo. Su portada dice «Antes del baño, las cosas claras». Los enlaces dentro de respuestas abiertas ahora muestran subrayado visible.

El contenido factual procede de la base y de docs/content-inventory.json: fuentes y referencias al cuestionario de marca ya documentadas en presentationRevision14 y aboutRevision26. Los titulares nuevos son redacción editorial; no son testimonios ni citas atribuidas. No hay nuevas garantías de progreso, amistad, disponibilidad, asistencia de Lucas a cada viaje ni servicios universales.

## Alcance

Producto: dist/conocenos/index.html, dist/preguntas-frecuentes/index.html, dist/about.css, dist/faq.css y dist/landing.css. Sin cambios de rutas, consultas WhatsApp, datos comerciales, generadores, home o JavaScript de producto.

scripts/check-about.mjs actualiza la expectativa del titular y diferencia las fotos documentales del SVG decorativo aria-hidden, oculto en tablet por diseño. Ambos comprobadores añaden una comprobación de separación entre copia/pie de foto; el de FAQs comprueba el subrayado de enlaces abiertos. Son verificaciones de regresiones observadas.

## Evidencia final

- baseline-check.txt y check.txt: PASS, 24 páginas; enlaces, anclas, recursos, consultas, generación vigente, sintaxis y noindex.
- about-check.txt / about-browser.json: 15 vistas y 255 comprobaciones PASS. Anchos 320/390/768/1024/1440 en normal, texto200 y sinJS; fotos, menú, teclado, anclas, cabecera y consultas interceptadas.
- faq-check.txt / faq-browser.json: 15 vistas, 780 comprobaciones y 11 rutas PASS. Ocho respuestas simultáneas, cierre independiente, teclado, anclas, menú, colores, fotos, pie separado, enlaces subrayados y consultas interceptadas.
- capturas/: aperturas y páginas completas finales a 390/1440 px, además de respuestas abiertas.
- revision-independiente.md y archivos independent-*: revisión independiente de voz, hechos, condiciones, navegación, contraste y geometría. Su ejecución se distingue de las suites del implementador. La comprobación completa pasa sobre la candidata, con repetición de los ajustes afectados.
- task.patch y candidate.sha256.json registran el alcance final, incluida normalización de saltos de línea sin cambio semántico posterior a las pruebas.

No se repite la suite de lógica de datos ni se reconstruye desde Sanity: el cambio es editorial y CSS, y el comprobador estático confirma que las vistas generadas siguen vigentes.

## Correcciones de lectura

El naranja sobre partes claras de las fotos tenía contraste insuficiente. La banda tinta compartida por ambos h1 protege el texto; la medición independiente registra aproximadamente 4,82–4,90:1. Un solapamiento del pie al ampliar texto se contrastó con la base y se corrigió reservando el mismo espacio normal en unidades em, que crece con la letra. El subrayado de respuestas recupera prioridad sobre el reset de la home.

## Límites

Conócenos sigue siendo una página editorial larga en móvil; se ha cambiado el ritmo, no ocultado contenido. Chromium local, sin Safari/iOS físico ni auditoría completa WCAG. La revisión de voz no prueba la preferencia del usuario ni una mejora de conversión. Sin commit, push ni publicación.
