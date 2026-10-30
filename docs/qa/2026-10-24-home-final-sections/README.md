# Opiniones, preguntas y reservas · 24/10/2026

Petición: distinguir los tres bloques finales, que compartían crema y separadores demasiado débiles.

## Implementación

- Opiniones: fotografía existente del grupo en las dunas, panel editorial y comillas naranjas. La imagen describe un recuerdo general y no identifica a las personas citadas.
- Preguntas: encabezado limpio y tres acordeones de tinta con texto crema. Respuestas en papel; foco interior claro en los controles.
- Reservas: superficie naranja de marca, CTA tinta y tres pasos sobre crema, en columnas en escritorio y filas en móvil.
- Se conservan textos sustantivos, citas, atribuciones, preguntas, pasos y URLs. No se añadieron opiniones, caras identificadas ni datos de venta.

## Versión y alcance

Repositorio letsurftogethersystem. Base Git main `58f338661fc4705364fea08727c836e79b3f2048`; trabajo local sin commit. El árbol contenía otros cambios. `before/` delimita el inicio del turno.

Ediciones propias: wrapper y foto de opiniones en `dist/index.html`; estilos de estos tres bloques en `dist/home.css`; expectativas de superficie/foco y carga de foto en `scripts/check-home-browser.mjs`. Scripts de QA nuevos: `artifacts/home-final-sections/capture-lower.mjs` y `verify-lower.mjs`. Evidencia nueva en esta carpeta.

Durante la revisión otra tarea modificó tarjetas, fechas y su hover en `dist/home.js`, añadió CSS y retiró flechas decorativas de los enlaces. Se preservaron esas ediciones y se revisó su convivencia con los tres bloques. No se atribuyen a esta tarea. La revisión de esta tarea excluye aprobar esa lógica concurrente.

El manifiesto `candidate.sha256.json` identifica los bytes finales: HTML `dc0c7f00…`, CSS `b591df25…`, JS `4fe0c5c5…`. La revisión independiente contrasta el delta final frente al candidato inicial.

## Criterios y evidencia

- Tres composiciones distinguibles en conjunto: `visual/lower-1440.png` y `visual/lower-390.png`, con datos reales.
- Controles, texto y superficies sin colisiones ni desbordamiento a320/390/768/1440 y texto100/200%: `behavior/results.json`.
- Tres FAQs con Enter/Espacio y sin JavaScript, enlaces44px y foco visible, enlaceWA conservado sin abrirlo.
- Contraste textual mínimo medido4,90:1. Naranja sobre crema se reserva para elementos grandes o decorativos.
- Contenido de citas/atribuciones y URLs comparado con before; orden opiniones→FAQ→reservas conservado.

## Validación

- `npm run check`: PASS; registro en `check.txt`.
- Suite home general:234PASS sobre el candidato inicial de este rediseño (HTMLd2090f71/CSS20951a1a/JSaafc9d19), antes de los cambios concurrentes. `browser/results.json`. No se atribuye esa ejecución a la versión final combinada.
- Validación específica:269PASS sobre el candidato final combinado (HTMLdc0c7f00/CSSb591df25). `behavior/results.json` y su manifiesto. Incluye ampliación, teclado, sinJS, contraste y geometría.
- Revisión independiente sin bloqueos: `revision-independiente.md`. Comprobación propia reejecutada sobre los bytes finales, estables durante la ejecución; `independent-check.json` y `independent-check.sha256.json`.

Límites: validación local en Chromium, sin publicación. La comprobación de UI no mide un aumento de reservas ni valida la exactitud de los datos concurrentes.
