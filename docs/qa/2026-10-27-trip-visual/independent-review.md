# Revisión independiente · composición compacta del detalle · 27/10/2026

Revisión de implementación, compatibilidad y accesibilidad de las miniaturas, sin modificar archivos de implementación. Base Git compartida `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo sin commit; base específica de esta iteración en `before/`. Versión final revisada identificada mediante `independent-candidate-sha256.json`.

## Resultado

Sin hallazgos accionables pendientes dentro del alcance comprobado. La nueva composición conserva portada con nombre/nivel, fechas visibles en móvil, consulta e inscripción persistentes, programas, condiciones y relacionados. El bloque de cifras y la barra horizontal de secciones del contenido desaparecen; los enlaces de secciones permanecen en la ficha lateral. Las nuevas miniaturas tienen nombres accesibles, anclas válidas, estado `aria-current` y navegación por teclado.

## Evidencia propia

- `independent-tests.txt`: 132/132 pruebas pasan.
- `independent-check.txt`: control de 40 páginas, coherencia generada, rutas, anclas, recursos, contacto y sintaxis pasa.
- `independent-browser.json`: ejecución propia en Edge sobre el HTML final generado, interceptado como documento principal bajo el origen local; los recursos CSS/JS son los archivos locales actuales. Se evita atribuir el resultado a un renderer importado antes del último cambio.
- Click en miniatura de índice 3: contador `04 / 06`, track desplazado 4320 px a 1440 px de viewport, `aria-current` en índice 3. End selecciona la última foto y conserva el foco en miniatura 5; Home vuelve a la primera y foco en miniatura 0.
- Gesto táctil nativo vía CDP en viewport móvil de 390 px: pasa a `02 / 06`, sincroniza miniatura 1 y no abre accidentalmente la ampliación. El dock permanece fijo y la fecha del viaje sigue visible.
- Sin JavaScript, el enlace a la miniatura 3 desplaza nativamente el track a 1170 px con un viewport de 390 px; las anclas constituyen una alternativa funcional.
- Comprobación geométrica independiente del último CSS: a 1440 px, card de actividad 238 px, imagen 148 px, alojamiento 300 px/imagen 200 px y portada 490 px. A 390/320 px, imágenes de actividad 132 px, alojamiento 164 px y portada 360 px. No hay desbordamiento global.
- Comprobación del header final: marca de 130 px en 320, 154 px en 390 y 190 px en escritorio; todos los elementos visibles del header quedan dentro del viewport a esos anchos. La ejecución anterior no produjo errores de JavaScript.

## Compatibilidad

Se compararon hashes con la versión independiente anterior: `sanity-trips.mjs`, `sanity.mjs`, `trip-groups.mjs`, schema de Studio, snapshot publicado y consumidor de promociones permanecen idénticos. No cambian datos del CMS, precios, fechas, pagos, autonomía, disponibilidad, inscripciones ni proyección de documentos. El diff del renderer conserva las funciones de reserva y condiciones, reubica únicamente la navegación de secciones y añade miniaturas/fotografía de plan. El control de carruseles mantiene la solución previa de conservación del foco al deshabilitar un extremo.

## Límites

No se enviaron mensajes ni formularios, no se ejecutaron mutaciones del CMS y no se desplegó la web. La valoración estética completa y el recorrido de todos los viajes pertenecen a la QA del implementador; esta revisión aporta comprobación propia de código, contratos, pruebas y las interacciones concretas descritas. No se atribuyen al revisor las pruebas visuales adicionales del implementador.

## Precisión final de la prueba de una foto

Revisado el último ajuste de `trip-editorial.test.mjs`: el caso de una única foto inyecta expresamente `hero` y `heroAlt`, comprueba que se produce exactamente un slide y conserva la comprobación de que no aparecen miniaturas redundantes. El manifest confirma que este es el único archivo modificado desde la revisión final; no cambia código de producción ni datos. Hash del test actualizado.
