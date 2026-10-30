# Revisión independiente del diff · 23/10/2026

Subagente `review_sanity`, inicialmente y durante toda la revisión sin editar archivos. Requisitos: conservar consumidores/diseño/rutas/filtros/SEO/solicitud; comerciales manuales; publicados únicamente; secretos fuera del cliente; importación específica idempotente y con colisiones. Base HEAD `73dc52dca750482853b1fc5973953ea1675b1fc2`, candidata sin commit. Se proporcionó copia de estado inicial y evidencia de base, distinguiendo el Studio y documentos preexistentes. El revisor contrastó código, consumidores, datos y pruebas; no aceptó la descripción del implementador como evidencia.

## Hallazgos bloqueantes corregidos

1. **Colisión omitida en preflight (P2).** La consulta raw original solo leía documentos trip o con slug, omitiendo otros tipos sin slug que ocuparan un ID reservado. Corregido mediante metadatos de todos los documentos. La prueba integra la consulta con el importador, tanto ID publicado como draft: aborta antes de escribir. Resolución comprobada independientemente.
2. **Texto editorial insertado como HTML (P2).** `priceNote` podía contener markup ejecutable y se interpolaba sin escape en la ficha lateral. Corregido escapando `summaryPrice` en el punto de inserción. Prueba adversarial comprueba literal escapado sin etiqueta ejecutable. Resolución comprobada independientemente.
3. **Condiciones/exclusiones ocultas sin includes (P2).** La sección dependía solo de includes; podía ocultar gastos/coberturas y mostrar programa pendiente aunque hubiese exclusiones/nota válida. Corregido renderizando cada parte independientemente. Prueba con exclusiones+nota y con nota sola; sin inventar incluidos. Resolución comprobada independientemente.

Conclusión del revisor sobre la candidata funcional corregida: **no quedan bloqueos identificados en el alcance revisado**. Reejecutó `npm test` 41/41, `npm run check` y `npm run studio:check`: PASS. Repitió la simulación local: ocho IDs, cero escrituras, preflight autenticado pendiente. No realizó llamadas remotas, no repitió Chromium, Studio build o schema extract; esas comprobaciones corresponden al implementador.

El único detalle de higiene señalado fue una línea vacía extra al final de `render-trips.mjs`, retirada después sin cambio funcional. Los hashes finales y el alcance del diff constan en `candidate.sha256` y `implementation.patch`. Tras la primera revisión, se solicitó una revisión final acotada de la presentación de `unavailablePage` (reutilizar logo/cabecera/fuentes/trip.css), sin cambiar la lógica de build; también concluyó sin bloqueos nuevos. Repitió `npm run check`, las 16 pruebas de Sanity y `git diff --check`: PASS. El README de QA que aún estaba pendiente durante esa última lectura ya está completado.

Hashes finales de ese delta revisado: `build.mjs` = `6380d35442297ca4814db67ad1fad6866b91413107d77c39f7e0b2552bb6d657`; `render-trips.mjs` = `2eb2c184603f42a58ad638ee84c29e04440ee5fdd921d7babcbfb42134bd57f7`.
