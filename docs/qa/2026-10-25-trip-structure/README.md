# Detalle del viaje: estructura, fechas e inscripción · 25/10/2026

Cambios locales en las siete fichas, conservando portada, datos comerciales, promociones, rangos, programas, formularios Brevo, alias y galería. No se ha hecho commit, push ni despliegue.

## Resultado y aceptación

| Petición | Resultado | Evidencia |
| --- | --- | --- |
| Nivel lateral demasiado largo | Solo rango, con requisitos completos en el bloque de nivel. También se conservan cuando el CMS tiene una descripción diferente. | `trip-detail.test.mjs`, capturas nivel |
| Fechas y PDF propio | CTA «Fechas»; PDF junto a cada salida y formulario con su `?salida`. Se conserva la alternativa sin JavaScript y los PDFs de salidas completas. | tests de detalle/grupos y matriz de navegador |
| Diseño del selector | Papel, tinta, naranja y Aura, con jerarquía entre fecha, programa, precio e inscripción. | capturas Fechas escritorio, móvil y texto 200 % |
| Acciones de nivel | Guía y consulta en la misma fila, también en móvil. | navegador a 320/390/768/1440 y texto 200 % |
| Alojamiento sin foto | Bloque compacto, sin imagen ficticia ni párrafos vacíos. Se limpian únicamente anotaciones de importación; los datos originales siguen intactos. | pruebas foto/no foto y captura programa |
| Acompañamiento | «Lucas va contigo» para confirmados sin texto editorial propio; pendientes sin prometer personal confirmado. | pruebas de equipo |
| Incluido/no incluido | Etiquetas explícitas y todos los servicios y exclusiones conservados. | pruebas de inclusiones |
| Inscripción y estructura | Formulario como acción principal cuando está disponible. WhatsApp queda para consultas. Índice de secciones, programa concreto primero y contexto en «Sobre este viaje». | navegador y tests de estados, registro y ausencia de flujo antiguo |

## Validación de la candidata

- [111/111 pruebas de comportamiento](tests.txt).
- [Construcción correcta](build.txt) con los ocho documentos publicados retenidos: antes de construir se comprobó `adaptTrips(raw)` profundamente igual al snapshot de partida. No se afirma un refresco remoto nuevo de Sanity.
- [Comprobación estática correcta de 40 páginas](check.txt): rutas, enlaces, anclas, recursos, generación y sintaxis.
- [485/485 comprobaciones de navegador](browser/results.json), cero errores JS: siete viajes, cuatro anchos, teclado, foco, scroll, galería, texto 200 %, ventana baja, lista larga de fechas, estados completos y alternativa sin JS. [Ejecución](browser-run.txt), [harness reproducible](browser-check.mjs).
- [Revisión independiente](revision-independiente.md). La pérdida del requisito de autonomía con dos textos diferentes se corrigió y tiene regresión. El contraste del lateral y el estado completo dominante en el selector se corrigieron y se recomprobaron en navegador. El primer fallo de scroll era una carrera del harness: esperaba el cierre visual antes del evento `close`; se corrigió la espera, sin cambiar `trip.js`.

Capturas finales: [programa y lateral](browser/real-el-palmar-programme-1440.png), [nivel](browser/real-el-palmar-level-1440.png), [Fechas escritorio](browser/maldivas-dates-1440.png), [Fechas móvil](browser/maldivas-dates-390.png), [Fechas texto 200 %](browser/maldivas-dates-text200.png).

## Versión y alcance

Base Git: `58f338661fc4705364fea08727c836e79b3f2048`, con numerosos cambios previos que se han conservado. Las [copias previas](before/) identifican exactamente los archivos compartidos modificados en esta tarea; [patch propio](task.patch) y [manifiesto final con hashes y rutas](version.json).

Fuentes modificadas: `scripts/render-trips.mjs`, `dist/trip-detail.css`, `scripts/check.mjs` y cuatro archivos de pruebas (`trip-detail`, `trip-team`, `sanity`, `trip-groups`). Se regeneran las fichas y sus alias a partir de los mismos documentos. Sin cambios en contratos Brevo, datos de Sanity, `trip-model.mjs`, `trip-experience.mjs`, `trip.css` ni `trip.js` durante esta tarea.

Navegador Chrome Windows local; sin Safari/iOS físico. No se han enviado formularios ni mensajes reales; la entrega a Brevo y sus automatizaciones conservan los límites documentados en la integración anterior. La disponibilidad sigue siendo editorial, sin inventario ni pago online.
