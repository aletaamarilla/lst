# Revisión independiente del detalle de viaje · 25/10/2026

Resultado: sin bloqueos conocidos dentro del alcance revisado, sobre la candidata local identificada abajo. No constituye validación de un despliegue ni del envío real a Brevo.

## Versión y alcance

Repositorio `letsurftogethersystem`, base Git `58f338661fc4705364fea08727c836e79b3f2048`, con cambios previos ajenos a esta tarea. Se contrastaron el renderer, estilos y pruebas con la copia exacta de entrada en [before/](before/), además de sus consumidores `departuresFor`, `registrationUrl`, el adaptador Sanity, el esquema y `trip.js`. No se modificó implementación durante esta revisión.

Candidata sin commit, SHA-256 comprobados al cierre:

| Archivo | SHA-256 |
| --- | --- |
| `scripts/render-trips.mjs` | `c841039d3c2cb5b52f119048e3129ef9af21be0a7a4623fc19917795238ffabb` |
| `dist/trip-detail.css` | `ada42de348ed9c970fefb52979c07e1f470d064d5b91b9773b94b8a6ce5253ed` |
| `dist/trip.js` (sin cambios de esta tarea) | `ef85741b19c1d190d7275671c97e989ef5d2c0947f3f9ef0877922c3131cde13` |
| `scripts/check.mjs` | `d828402eda860b64bfb52f1aa0a2906eb9d057e8c0c8ef31188bd8c0eb4f2e31` |
| `scripts/trip-detail.test.mjs` | `d2d2a92a095354166ac5637a142b13a5a8d3b3c64f63a65a454e25aec7a53c20` |
| `scripts/trip-team.test.mjs` | `ecef70b5129104da49bdf24c42f2ce2c339da1ec7154a852e30c86bb8feea3ec` |
| `scripts/sanity.test.mjs` | `f0c211d9baa90506dacebd9e399044b1f418765c6a7e36e70ed83da42b2f3d8c` |
| `scripts/trip-groups.test.mjs` | `ff4833b1cf88ccfcb975ab92d8494ed29c0e7f4ea075377e2179608f4426509c` |

## Hallazgos resueltos

- **Requisito de autonomía perdido al acortar el lateral.** La primera candidata usaba solamente el rango en el lateral y `levelText || levelRequirement` en el cuerpo. Una explicación editorial distinta ocultaba el requisito, pese a que Studio admite ambos campos independientes. Reproducción propia: con explicación «Coaching para progresar en el agua» y requisito de autonomía, `renderTrip` omitía el segundo. La candidata final presenta ambos en `#nivel` cuando son diferentes y evita duplicarlos si coinciden. La reproducción propia pasa y hay una prueba de regresión para ambos casos.
- **Contraste de la ficha lateral.** El agente de QA detectó texto heredado claro sobre papel. Se revisaron la corrección explícita de colores en CSS y la [captura final de escritorio](browser/maldivas-programme-1440.png): precio, datos y ayudas se leen con tinta sobre papel. El lateral conserva únicamente el rango de surf; el requisito está en el bloque correspondiente.
- **Estado global completo frente a fechas marcadas disponibles.** La apertura de fechas para viajes completos podía mostrar estados disponibles heredados. La candidata final aplica el cierre global al estado visible y al CTA de cada fecha y no genera inscripción. Reproducción propia sobre Maldivas globalmente completo con ambas fechas disponibles: dos opciones «Completo», dos consultas de alternativas, ningún `data-registration`, y los dos PDF exactos conservados.
- **Comprobación de retorno de lectura con texto ampliado.** El primer informe de navegador leyó el scroll antes de terminar el cierre nativo. El harness espera ahora el evento y la restauración del cuerpo; `trip.js` no cambia. El [informe final de QA](browser/results.json) no reproduce el fallo. Esta conclusión se basa en la evidencia del agente de QA, no en una ejecución propia de su matriz.

## Verificación

Ejecutado por el revisor sobre los hashes finales: `node --test --test-reporter=dot scripts/*.test.mjs` (111 pruebas correctas) y `node scripts/check.mjs` (40 páginas correctas). Se revisaron los fallos iniciales de expectativas antiguas de WhatsApp y bloqueo de fechas completas; sus ajustes mantienen cobertura de contexto, registro, disponibilidad y PDF.

Se revisaron el código y los resultados de la matriz separada de navegador: [485 comprobaciones correctas, sin errores JavaScript](browser/results.json), con hashes iniciales y finales iguales; incluye anchos 320/390/768/1440, texto al 200 %, altura reducida, foco/cierre, lista larga, ausencia de JavaScript, PDF por fecha y registro preseleccionado. Sus ejecuciones corresponden al agente de QA. Inspección visual propia de las capturas finales de [fechas en móvil](browser/maldivas-dates-390.png), [nivel móvil](browser/maldivas-level-390.png) y [programa/lateral en escritorio](browser/maldivas-programme-1440.png).

## Límites

No se ha enviado ningún formulario ni mensaje real. La recepción y configuración remota de Brevo, Safari/iOS físico, un refresco nuevo de contenido CMS y la publicación no se validan aquí. Las fotos de parte de la matriz están interceptadas; existen capturas adicionales con fotos reales. La conclusión se limita a la implementación local y los escenarios comprobados; los datos comerciales y las restricciones editoriales requieren mantener su actualización habitual.
