# Revisión independiente del detalle comercial · 25/10/2026

Resultado: no se identifican bloqueos pendientes en la implementación revisada. Esta conclusión cubre código, contenido condicionado por los datos comerciales y compatibilidad local; la revisión visual en navegador la ejecuta el agente principal y no forma parte de mi evidencia independiente.

## Versión y alcance

Repositorio `letsurftogethersystem`, HEAD `58f338661fc4705364fea08727c836e79b3f2048`, con un árbol previamente modificado. Se contrastó el renderer con la copia exacta de inicio en `before/scripts/render-trips.mjs`, no se atribuye a esta tarea el resto del diff respecto a HEAD.

Candidata revisada sin commit, SHA-256:

| Archivo | Hash |
| --- | --- |
| `scripts/render-trips.mjs` | `09f5d32b871f4f8fe5a2edb07d17c68b6a7bc580d77d822bd52f67b52326877b` |
| `dist/trip-detail.css` | `b365cb0673f30d19ad5e28b7cfa134f3cc68cb4b54f40eba1854d47056347aa3` |
| `scripts/trip-sales-content.mjs` | `17db2548a84dbce580bfbd963459826fb3968d12acf11969a06b87fcb0e1f7d4` |
| `scripts/trip-detail.test.mjs` | `3ab6898b0c5e04cd89d531bfb0f44b2f339e4333f5c013bc95c8365079adedb8` |
| `scripts/trip-experience.test.mjs` | `d1b89be36153b562a24e1932270d17ed5eb508ee0ce087a0c20cc9d452982b0c` |

La revisión no modifica implementación. Por encargo posterior del agente principal, el revisor adaptó los dos archivos de pruebas anteriores y añadió regresiones de navegación, conservación de condiciones y limpieza de anotaciones. La revisión del código de implementación se mantuvo separada de su autoría.

## Compatibilidad contrastada

- Navegación compartida con Viajes, Niveles, Conócenos, FAQs, consulta contextual, menú móvil, `app.js` y alternativa sin JavaScript. Se conserva `.trip-header`, consumidor requerido por `trip.js`.
- Precios, promociones, estados completos, PDFs y condiciones de pago conservan los modelos existentes. Las fechas múltiples mantienen inscripción y consulta por salida, sin mezclar sus documentos; siguen disponibles sin JavaScript.
- Programa, requisitos de autonomía, alojamiento, inclusiones y exclusiones permanecen accesibles. Las dos propuestas de Marruecos conservan servicios y equipos distintos.
- Las nuevas explicaciones prácticas se derivan del CMS actual. Fuerteventura conserva dos cenas libres, Senegal las comidas del mediodía y bebida del desierto aparte, El Palmar distingue seguro de escuela de seguro de viaje y Maldivas no hereda material ni póliza incluidos.
- No se añaden pagos, inventario, testimonios, condiciones de cancelación universales ni garantías de avistamiento. El snorkel solo se anuncia opcional si el servicio lo dice explícitamente.
- El nuevo precio de portada llama a la misma función de tarifa; las condiciones de la oferta incluyen cupo y fecha cuando corresponde. `publicDetail` limpia referencias de páginas del PDF sin borrar restricciones o paréntesis significativos.
- CSS acota las nuevas reglas al detalle y reutiliza el encabezado existente. Se comprobaron por lectura las correcciones de especificidad de imágenes, foto modal y separación del encabezado fijo; su resultado visual requiere el QA de navegador del agente principal.

## Hallazgos y resolución

1. La primera versión reemplazaba las FAQs editoriales por preguntas nuevas, perdiendo respuestas específicas de seguro, cancelación y pago. La candidata combina ambas y sustituye solo las preguntas enriquecidas con la misma clave. Una regresión comprueba que las condiciones originales permanecen también en destinos pendientes.
2. Las tarifas de vuelos importadas del dossier de Maldivas se presentaban como actuales. Se sustituye esa respuesta por una explicación de vuelos aparte y horarios a consultar, sin importes temporales ni urgencia de compra.
3. El encabezado compartido necesitaba conservar el token `.trip-header` para las mediciones de `trip.js`. Se conserva; el CSS de `html` usa la altura del encabezado compartido para el scroll.
4. El destacado de snorkel podía inferir opcionalidad por el nombre de la actividad. Ahora exige la marca explícita y excluye las expresiones de obligatoriedad.
5. La limpieza de referencias `(p. n)` conserva textos como `(sin ayuda)`, `(alquiler aparte)`, `(opcional)` y `(según el mar)`, comprobados mediante regresión específica.

No quedan defectos accionables conocidos dentro del alcance de esta revisión de implementación.

## Evidencia y límites

Ejecutadas directamente por el revisor en Windows/Node 24:

- `node --test scripts/trip-sales-content.test.mjs scripts/trip-detail.test.mjs scripts/trip-experience.test.mjs scripts/trip-team.test.mjs`: **43/43 PASS**, en [independent-tests.txt](independent-tests.txt).
- `node scripts/check.mjs`: **40 páginas PASS**, en [independent-check.txt](independent-check.txt). Comprueba también que el HTML generado corresponde a la candidata, enlaces, anclas, recursos, scripts, estados y consultas.

Evidencia adicional leída, producida por el agente principal: [tests.txt](tests.txt), **123/123 PASS** en WSL; [check.txt](check.txt), **40 páginas PASS**; [regenerate.txt](regenerate.txt), **15 rutas de detalle regeneradas**.

El build remoto no pudo conectarse a Sanity, según [build.txt](build.txt). La regeneración utiliza el snapshot existente con procedencia `sanity-published`; no demuestra que se hayan refrescado los datos remotos. No se han escrito datos en Sanity ni desplegado la web. El revisor no ha enviado formularios ni mensajes y no ha realizado una inspección visual independiente del navegador. El efecto sobre la conversión necesita medición real posterior.


## Adenda de revisión del último delta CSS

Revisado el único delta de implementación posterior a la candidata anterior: las últimas reglas de la galería y del selector de fechas de escritorio. La versión final de CSS queda identificada en la tabla de hashes de este informe; renderer y helper conservan sus hashes anteriores.

La galería con una sola imagen pasa a una columna y restablece la posición y proporción de esa imagen; las reglas están acotadas por figure:only-child y no afectan las galerías con varias fotos. A partir de 640 px, las opciones de fecha pasan a flujo vertical y la zona de precio e inscripción usa dos columnas, con la promoción y el pago a todo el ancho. Las reglas conservan los controles, PDFs, marcado, orden DOM y comportamiento JavaScript. Por lectura de la cascada, no se identifican bloqueos nuevos en este delta.

No se repitió la suite funcional por este cambio exclusivamente CSS y sin cambios de lógica. La evidencia independiente anterior corresponde al renderer y helper que siguen vigentes. El agente principal informa haber comprobado siete destinos a 320 px, Maldivas a 320/768/1024/1440 px, menú móvil, Escape, galería, PDFs y restauración del foco, sin desbordamientos ni errores de consola. Esa evidencia de navegador es del agente principal y no se presenta como ejecución independiente del revisor.
