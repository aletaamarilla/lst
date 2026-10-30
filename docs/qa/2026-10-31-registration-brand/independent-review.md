# Revisión independiente — inscripción LST

Fecha: 2026-10-31. Revisor: subagente independiente, sin modificaciones de implementación.

## Versión y alcance

Base real de esta iteración: `artifacts/registration-brand-before/`. HEAD del repositorio: `58f338661fc4705364fea08727c836e79b3f2048`; sus cambios previos no se atribuyen a esta tarea.

Se revisaron los 17 archivos identificados en [candidate.json](candidate.json): `dist/registration.css`, `scripts/render-registration.mjs` y las 15 páginas generadas de inscripción. Los 17 SHA-256 actuales coinciden con el manifiesto. SHA-256 del CSS final: `3b3c60d14c7b03ebc746415ce8b8225503f905453034c3c691bb85b27d40038c`. El [diff de la tarea](task.diff) se contrastó con la base real.

## Resultado

No quedan hallazgos accionables bloqueantes en el alcance revisado. Se preservan los contratos del formulario y sus consumidores. La composición adopta la dirección LST mediante la postal de viaje existente, tipografía, estructura crema/negro y acentos naranjas contenidos, sin incorporar imágenes ni funcionalidades nuevas.

## Hallazgo resuelto

**Selector de fecha: etiquetas giradas al abrir.** La regla global `details[open] summary>span{transform:rotate(45deg)}` de `dist/styles.css` alcanzaba las etiquetas y la acción del selector de fecha. Al abrirlo, «Tu fecha» y «Cambiar» giraban y podían superponerse al contenido. La regla también estaba presente en la base real; no se considera una regresión introducida por esta iteración.

La candidata final incorpora en `dist/registration.css` el reset acotado `.registration-page .registration-date-picker>summary>span{transform:none}`. Se revisaron su especificidad y convivencia con los estilos globales. La evidencia integrada [date-picker.json](date-picker.json) muestra los tres spans con transform `none` a 320, 390 y 1440 px; la captura final [maldivas-date-open-390.png](maldivas-date-open-390.png) permite comprobar la desaparición del solapamiento. Hallazgo cerrado sobre el CSS final identificado arriba.

## Comprobaciones independientes

- Se compararon con la base las etiquetas completas de `form`, `input`, `select`, `option`, `button` y `a` en las 15 páginas: idénticas. También se comparó el texto visible normalizado de cada página: idéntico.
- `dist/registration.js` es idéntico byte a byte a la base. La introducción de wrappers e iconos no cambia los selectores de pasos, validación, campos, navegación ni envío.
- Se revisaron la cascada de campos y radios seleccionados/con foco, progreso actual/completado/deshabilitado, los breakpoints 359/479/799, el selector de fecha y sus estados, las secciones sin JavaScript y los paneles de error/éxito/no disponibilidad. No se detectaron incompatibilidades nuevas con sus consumidores.
- `npm test`: 190/190 pruebas aprobadas, ejecutadas por el revisor. `npm run check`: 40 páginas aprobadas; repetido tras los últimos ajustes del CSS y el reset de fecha, también aprobado.
- Se comprobaron de nuevo los 17 hashes del manifiesto al cierre de la revisión.

## Evidencia de navegador contrastada

La ejecución en navegador integrado pertenece al implementador; el revisor examinó sus capturas y datos, sin iniciar otro navegador. [viewport-metrics.json](viewport-metrics.json) contiene 75 vistas (15 rutas por 5 anchos), sin desbordamientos registrados. [browser-steps.json](browser-steps.json) documenta los cinco pasos a 320, 390 y 1440 px, bloqueo de campos inválidos, pasos futuros deshabilitados y conservación de valores al volver. [date-picker.json](date-picker.json) cubre apertura por teclado, fecha ausente, elección, enlace con fecha inválida y recuperación. Las capturas examinadas incluyen el radio seleccionado y enfocado a 320 px y el contexto/formulario a 1440 px.

No se realizó un envío real al servicio externo desde la revisión. Los estados de respuesta se contrastaron mediante código sin cambios, pruebas y estructura generada; esto no equivale a validar una transacción de producción. No se publicó ni desplegó.
