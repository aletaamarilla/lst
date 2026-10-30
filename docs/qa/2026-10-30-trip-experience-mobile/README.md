# Experiencia de surf y navegación móvil · 30 octubre 2026

Iteración local sobre el detalle compartido. Base Git `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo sin commit. La base real de esta tarea está en `before/`; `template.diff`, `style.diff` y `candidate.sha256` delimitan la versión revisada, no el diff completo respecto a HEAD.

## Petición y cambios

- WhatsApp circular, solo icono, añadido junto a la reserva en la barra móvil. Área de 44×44 px, nombre accesible y mensaje contextual del viaje. Precio, promoción, señal y acción principal siguen disponibles; la promoción ocupa una fila propia para dejar espacio a los controles. La etiqueta de señal se abrevia sin cambiar el importe.
- «Tu nivel. Tu gente.» pasa a «Compártelo.»; «Dónde buscamos las olas.» pasa a «Spots.».
- Número y título comparten fila en spots y actividades. Los títulos largos pueden continuar debajo de su primera línea cuando lo requiere el ancho; el número queda junto al principio del título.
- Plan de surf con «Cada ola cuenta.» y una foto propia de surf antes del ritmo y los servicios. La foto abre su posición correcta en la galería. Ritmo más compacto y servicios en dos columnas en escritorio/una en móvil. Se conservan el texto fuente, las restricciones, la nota de secuencia orientativa y la variante de programa en acordeones.
- Relacionados como tarjetas con foto ancha, nombre expresivo, fechas compactas y flecha visible. Una columna en móvil, distribución automática hasta tres columnas en escritorio. Cada tarjeta mantiene el enlace a su viaje; fechas editoriales no estándar y estados pendientes/múltiples conservados.

Alcance: `scripts/render-trips.mjs`, `dist/trip-conversion.css`, nuevo `scripts/trip-experience-mobile.test.mjs` y 30 páginas regeneradas desde el catálogo público (15 detalles y 15 formularios; sin cambio intencional de formulario). No se modificaron datos, precios, promociones, CMS ni JavaScript. La portada y el cierre carbón anteriores se conservan.

## Evidencia ejecutada

- Base: 175/175 pruebas, `baseline-tests.log`.
- Candidato: 178/178 pruebas, `tests.log`. Los tres casos nuevos cubren WhatsApp contextual y reserva en estados abiertos/múltiples/completos/pendientes, fuente y restricciones del plan y variantes de relacionados.
- `render.log`: regeneración desde `sanity-published`, sin consulta ni escritura al CMS.
- `check.log`: PASS de 40 páginas, rutas, anclas, recursos, catálogo, datos opcionales, fechas, JavaScript y noindex. Repetido tras los dos últimos ajustes de CSS.
- Revisión independiente en `independent-review.md`: fuente, consumidores, pruebas y huellas. La revisión visual pertenece al implementador; el revisor no dispuso de navegador.

## Navegador real

| Vista | Resultado observado |
| --- | --- |
| Marruecos 390×844 | Sin desbordamiento horizontal. WhatsApp de 44×44 px sin texto visible, mensaje del viaje correcto; barra de 112,6 px. Foto real de surf inmediatamente después del titular. «Compártelo.» y «Spots.» presentes. Números y títulos en la misma fila por alineación de línea base. Relacionados de 335 px de ancho con foto de 333 px, fechas compactas y flecha. |
| Marruecos 320×740 | Sin desbordamiento. WhatsApp de 44×44 px, reserva de 104×48 px, barra de 122,7 px. Los tres nombres de relacionados, incluido Fuerteventura, en una línea. Foco visible en tarjeta y flechas restauradas pese a la regla global que ocultaba SVG en móvil. |
| Marruecos 1440×1000 | Foto del programa de 826 px de ancho, servicios en dos columnas de 398 px, tres relacionados de 377,3 px; barra móvil oculta. Ampliación de la sesión abre galería en foto 5/6 y cierra correctamente. |
| Maldivas 320×740 | Sin desbordamiento; WhatsApp de 44 px, «Elegir fecha» funcional. Barra de 144,7 px, mantiene posición fija en esta altura. Modal oculta la barra. Segunda salida abre `/inscripciones/maldivas/?salida=maldivas-2027-03-28` con `VIAJE_SURF=8` seleccionado. No se envió formulario ni mensaje de WhatsApp. |
| El Palmar 320×740 | Variante anterior sin `surfPlan`: una foto propia, cuatro acordeones del programa, primero abierto, sin desbordamiento. |

Capturas observadas en la herramienta, sin archivo de captura exportado. No hay pruebas con usuarios ni despliegue de producción. La vista previa usa las promociones locales ya existentes; la generación estática usa únicamente el catálogo público. Vista previa: `http://localhost:40091/viajes/marruecos/#plan`.
