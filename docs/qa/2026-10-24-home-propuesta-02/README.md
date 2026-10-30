# Propuesta 02 de home · 24 octubre 2026

Ejemplo local navegable para revisión de dirección visual, contenido y recorrido comercial. Base Git: 58f338661fc4705364fea08727c836e79b3f2048, main, con trabajo previo sin commit de Sanity, limpieza, consultas WhatsApp y rediseño. No se modifica la home actual ni sus generadores, catálogo, fichas o datos de Sanity. Sin commit, push ni despliegue.

## Resultado y aceptación

- Se conserva el HTML completo de la portada actual y sus variables originales en modo claro. Hero con Bricolage y foto documental de Francia.
- El resto recupera Aura, Work Sans, Space Mono y los colores #EA5934 / #FFFAE7 / #1B1B1B. Alterna papel, naranja y negro, con composición editorial y fotografías propias.
- Recorrido: portada → propuesta de LST y acceso a orientación → próximas salidas → cuatro niveles → experiencia → testimonio → origen/acompañamiento → dudas → pasos de reserva → consulta o catálogo.
- Fechas compactas y duración siempre visibles bajo las imágenes, sin etiquetas sobre foto, hover, panel ni control Cerrar. Nivel y encaje técnico explícitos, incluyendo autonomía en Hossegor. Un enlace nativo por tarjeta al detalle.
- Los cuatro niveles conservan nombres, significado y parámetros del catálogo existente. La guía sigue disponible para quien dude; no se evalúa ni asigna un nivel.
- Fotos de Cantabria y Laga conservan su proporción 3:2 y el grupo completo. Fotografías históricas identificadas como tales, sin atribuir identidades a personas.
- WhatsApp mantiene el mismo canal, número y función de consulta. No se envían mensajes ni se añaden formularios, reservas, suscripciones o pagos.

## Archivos y reproducción

La propuesta está en artifacts/home-propuesta-02/, ignorado por Git como los demás artefactos locales. Nuevos: template.html, index.html generado, proposal.css, render.mjs y serve.mjs. baseline.sha256.json registra siete archivos originales, todos idénticos al cierre. evidence/ guarda capturas y browser-results.json. Este informe y candidate.sha256.json identifican el alcance nuevo y la versión revisada.

Desde la raíz: node artifacts/home-propuesta-02/render.mjs y node artifacts/home-propuesta-02/serve.mjs. Vista: http://127.0.0.1:4186/. El servidor sirve la propuesta en /, sus estilos en /proposal.css y los recursos/rutas existentes desde dist. Solo escucha en loopback; no configura hosting ni modifica el servidor normal.

render.mjs toma las tres próximas salidas confirmadas de dist/catalog-snapshot.json, que exige source sanity-published. Reutiliza helpers de fechas, niveles, precios y disponibilidad de scripts/trip-model.mjs. Las descripciones editoriales de los tres programas están escritas para esta muestra fechada. No es un nuevo consumidor de producción ni sustituye el build: antes de integrar, estas descripciones deben incorporarse al flujo editorial/CMS y definirse sus estados y actualización.

## Fuentes

- Datos comerciales y programas actuales: snapshot publicado local de Sanity, sin nuevas consultas ni escrituras al CMS.
- Niveles: dist/niveles/index.html. Origen y acompañamiento: dist/conocenos/index.html.
- Identidad e imágenes: activos originales en dist/assets, inventario de marca y procedencia ya existentes.
- Laura, Marruecos: cita documentada en docs/qa/2026-10-12-comunidad/task-only.diff y contrastada por el revisor con la home pública de LST. Atribución y contexto histórico conservados; sin puntuaciones ni cifras inventadas.

## Validación ejecutada

- Generación local: node artifacts/home-propuesta-02/render.mjs, tres salidas del snapshot; salida reproducible.
- node --test scripts/*.test.mjs: 48/48 aprobadas al ejecutar fuera del aislamiento. El primer intento dentro del sandbox falló en una prueba de integración al renombrar su carpeta temporal (EPERM de Windows); la repetición con los mismos archivos y permisos del host pasó. No se declara un defecto heredado de código.
- node scripts/check.mjs: PASS, 19 páginas del producto actual; coherencia de generación, rutas, anclas, assets, contactos y JavaScript. Este checker valida dist; no se presenta como prueba del diseño nuevo.
- Navegador de la propuesta: 16 comprobaciones registradas en evidence/browser-results.json. Anchos 320, 390, 768 y 1440, sin desbordamiento horizontal; menú móvil y Escape; FAQ nativa con clic y teclado; Rookies abre catálogo nivel=1 y selecciona su filtro; Hossegor abre la ficha correcta; fotografías cargadas después de recorrer la página; sin errores de consola.
- Las capturas completas de escritorio y móvil recogen la versión final, con las fotografías ya cargadas. Las capturas de detalle son evidencia visual, no una medición de conversión.
- Revisión independiente de código, contenido y compatibilidad sobre los hashes de candidate.sha256.json, sin bloqueos. El revisor contrastó el delta final de proporción de fotos. Navegador ejecutado por el implementador; no se atribuye al revisor.

## Pendientes y límites

El ejemplo permite decidir dirección y evolucionar la home. Quedan fuera la publicación y la integración con el build de producción. Retratos identificados y funciones actuales del equipo permitirían reforzar la confianza; no se han inventado ni inferido a partir de fotos. El efecto comercial requiere medición real, y la comprobación visual se limita al navegador disponible, sin certificar dispositivos físicos ni Safari/Firefox. La muestra usa el snapshot local de esta fecha, no una actualización automática del catálogo.
