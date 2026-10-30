# Rediseño UX/UI de Conócenos y FAQs · 25/10/2026

Candidata local sin commit sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048`; árbol previamente modificado conservado. `before/` contiene la base exacta de esta iteración. `task.patch` delimita siete archivos: cinco de producto y dos comprobadores. `candidate.sha256.json` identifica la versión final, más home.css y app.js compartidos como referencias sin modificar. landing.css es nuevo; su base es un archivo vacío.

## Criterio y resultado

El usuario rechaza la composición anterior y pide un rediseño experto desde móvil, sugiriendo fotos en las aperturas. La propuesta cambia composición y jerarquía: portadas fotográficas reales, texto crema, navegación transparente con contraste protegido y transición a crema al scroll. Reutiliza marca, fuentes, colores, navegación y pie de la home.

Conócenos presenta una apertura emocional con la fotografía del grupo en las dunas. La introducción es breve; el origen se cuenta junto a una fotografía de Marruecos. Tres escenas explican aprendizaje, grupo y descubrimiento. Se sintetiza la prosa anterior, se retiran grandes cajas de color y se conserva el acompañamiento antes/durante el viaje, su dependencia del programa y el respeto al lugar. Las escenas se comparan en tres columnas de escritorio, pasan a filas de foto/texto en tablet y se leen en una columna en móvil. La página sigue siendo un relato con fotografías; su longitud móvil no se oculta mediante carruseles ni contenido cerrado.

FAQs abre con dos surfistas hacia el mar. Cuatro accesos breves sustituyen las grandes tarjetas; son enlaces a secciones, no pestañas que oculten respuestas. En escritorio el índice permanece a la izquierda; en móvil las preguntas siguen inmediatamente al índice. Las preguntas usan líneas y controles +/−, con toda la fila como área pulsable. Se mantienen las ocho respuestas y sus enlaces exactamente, detalles nativos independientes y funcionamiento sinJS. El cierre facilita la consulta contextual por WhatsApp.

Los heroes usan cover y un encuadre específico. Las fotografías del cuerpo mantienen su encuadre completo. Los pies identifican recuerdos; no se añaden servicios, garantías ni condiciones comerciales. Se conservan anclas externas como /conocenos/#acompanamiento, rutas y mensajes de consulta. No hay nuevos scripts de producto ni dependencias. landing.css reúne solo los patrones compartidos por estas dos páginas.

## Validación sobre la candidata final

- `check.txt`: PASS, 24 páginas; enlaces/anclas/recursos locales, sintaxis, generación vigente, WhatsApp y noindex.
- `tests.txt`: 70 pruebas PASS del repositorio actual.
- `about-check.txt`, `about-browser.json`: 15 vistas, 240 comprobaciones PASS. Anchos 320/390/768/1024/1440; normal, texto200 y sinJS. Menú, colores/logos de cabecera, fotos, anclas, entradas desde home/fichas, teclado y consulta interceptada.
- `faq-check.txt`, `faq-browser.json`: 15 vistas y 750 comprobaciones PASS; los mismos anchos y modos. Ocho respuestas abiertas, cierre independiente, teclado, anclas con texto200, menú, colores/logos, consulta interceptada y recorridos por 11 rutas.
- `revision-independiente.md`, `independent-results.json`, `independent-anchors-final.json`: revisión independiente de diseño, contenido y navegador. 24 vistas adicionales y repetición específica de las cuatro anclas a 320/texto200. Sin bloqueos tras las correcciones.
- `capturas/`: versión final móvil/escritorio, aperturas y respuestas abiertas. Se inspeccionaron visualmente ambas páginas, incluyendo sus portadas.

## Hallazgos corregidos

La cabecera inicial necesitaba más contraste sobre cielos claros: un velo superior acotado da aproximadamente 8,3–8,7:1 alrededor de los controles en la comprobación independiente móvil. Se corrigió también la especificidad del modo sinJS para que conserve tinta, fondo crema y logo oscuro.

El círculo de + rotado producía desbordes al abrir respuestas; ahora el contenedor no rota y cambia el signo a −. En tablet, las escenas dejan más anchura al texto ampliado. Las anclas usan la altura real medida en la raíz: evita que el valor por defecto del body oculte títulos tras la cabecera de 107 px al ampliar texto. La comprobación final deja los cuatro encabezados FAQ a 127 px en ese escenario.

Durante la validación hubo desbordes transitorios en /viajes/ mientras continuaba otro trabajo del repositorio. No se modificó el catálogo en esta tarea; la repetición final de los recorridos pasa, también en esa ruta.

## Límites

Chromium local. Sin Safari/iOS físico ni auditoría WCAG completa. La revisión de diseño no predice preferencia del usuario ni conversión comercial. Sin commit, push ni publicación.
