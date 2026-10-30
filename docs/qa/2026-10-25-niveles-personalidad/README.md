# Niveles con personalidad · 25/10/2026

Candidata local sin commit de aletaamarilla/lst sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. El alcance de producto de esta revisión es dist/niveles/index.html y dist/levels.css. before/ conserva ambos archivos al comenzar; candidate.sha256.json identifica la versión revisada y dependencias. Los demás cambios previos/concurrentes del repositorio no se atribuyen a esta tarea. Sin publicación.

## Propuesta

La petición era dar carácter de viaje de surf a una guía percibida como plana y con demasiado texto. La nueva portada usa el recuerdo de Marruecos, un titular breve, un sello decorativo y una franja naranja con los cuatro niveles. Las fichas pasan a ser pequeñas historias fotográficas con crema, naranja y tinta, números de nivel, una frase de entrada, la habilidad técnica y el siguiente objetivo. La autonomía, la ayuda y el cierre pierden explicaciones repetidas.

El texto visible de las cuatro fichas pasa de 315 a 159 palabras (49,52% menos): copy-metrics.json. Se conservan espumas/olas suaves y puesta en pie en I; pared, olas sin romper, condiciones moderadas y primeros giros en II; giros con postura/control y autonomía en III; fluidez, fuerza y lectura de secciones en IV. Tubos y aéreos siguen siendo objetivos. Se mantienen nombres, anclas, consultas y enlaces a viajes por nivel.

No se añade lógica de evaluación ni código de componentes duplicado. JS, controlador de fechas y generadores de tarjetas conservan sus hashes. Las tarjetas de viaje siguen siendo las de la home. No se modifica ningún binario de imagen ni se añaden dependencias.

## Fotografías

Se reutilizan /assets/marruecos-day.webp (portada), /assets/home/cantabria-sesion.webp (práctica en arena), /assets/surf-session.webp (pared) y /assets/el-salvador.webp (giro), inspeccionadas visualmente. Supercracks usa la fotografía de Senegal ya presente en el catálogo publicado. La ayuda usa /assets/community.webp. La página presenta estos recursos como recuerdos de viajes; las fotos ilustran la guía y no certifican el nivel de las personas retratadas. No se atribuyen actividades de archivo a una próxima salida.

## Evidencia

- 79/79 pruebas PASS en la última ejecución del árbol compartido: tests.txt.
- Comprobador final del árbol: 24 páginas PASS, check-current.txt.
- Build aislado con catálogo publicado y check de 24 páginas PASS: build.txt.
- 356 comprobaciones de diseño/UX PASS: browser/results.json. Anchos 320/390/768/1024/1440, pantalla baja, texto al 200 %, cuatro fotos, contención, acciones de 44 px, anclas/foco, URLs/filtros, contactos y navegación sin JS. Incluye colores de texto y foco, y apoyo del título sobre fotografía.
- 157 comprobaciones del componente de viajes compartido PASS: shared-cards/results.json, con estilos, datos, precios/promociones, filtros, fechas largas, pin, teclado, tacto y sinJS.
- Revisión independiente final sin bloqueos en el alcance: revision-independiente.md.

La revisión encontró y corrigió contraste del CTA de Riders, foco de Aprendices/ayuda naranja y títulos sobre foto al ampliar texto. El apoyo oscuro protege h2 y etiqueta cuando cambia su altura; el resto de la imagen conserva luminosidad.

Capturas antes/después en browser/before-390.png, before-1440.png, after-390.png y after-1440.png. after-top-* muestra portada; level-posters-* recorta las cuatro fichas y oculta navegación fija solo al capturar. En la comparación de antes se inserta el mismo bloque comercial generado y se fija la misma versión de home.css para que las modificaciones paralelas no falseen la comparación del diseño. Las alturas comparadas en browser/results.json son evidencia bajo esas condiciones, no un contrato de altura.

## Estado compartido y límites

Durante la revisión cambiaron home.css, precios/promociones y fichas de viaje en otro trabajo. No se revirtieron esos cambios. El manifiesto registra los hashes de estilos compartidos usados en la revisión. Hubo un estado transitorio de fichas desactualizadas; el registro final del comprobador vuelve a PASS. Esta aprobación se refiere al HTML/CSS de niveles identificado, no a una revisión de toda la implementación paralela.

La evidencia visual es Chromium local y no una auditoría WCAG completa ni una prueba en dispositivos físicos o Safari. Que una composición resulte más atractiva es una decisión de diseño; no demuestra más reservas. Las consultas de las pruebas se interceptan, sin enviar mensajes.
