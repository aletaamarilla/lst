# Revisión independiente de fechas en cards de home

Revisión solo de lectura de implementación; único archivo creado: este reporte. Base Git informativa: 58f338661fc4705364fea08727c836e79b3f2048. La comparación de esta tarea se realiza contra `before/`, porque el checkout incluye trabajo previo sin commit.

## Candidato revisado

- `dist/home.css`: SHA-256 `142d64fa824f471d43623ee14488982e41adfa301c8fed0639f98594a84b6a30`.
- `scripts/check-home-browser.mjs`: SHA-256 `edd07b57a7c6102c35d92560edd1b437febd682cab95dbe2f33eb8d39b19f1a2`.
- `dist/index.html`, `dist/home.js` y `scripts/render-home-trips.mjs` coinciden con sus copias de inicio de turno. No se cambian datos, orden de salidas, enlaces ni lógica JavaScript.

## Resultado

Sin defectos bloqueantes pendientes dentro del alcance comprobado. La lista ocupa la parte superior de la fotografía y el título tiene su propia fila de grid; el nombre no queda detrás del panel. El panel conserva scroll y el control nativo details/summary. La composición y colores restantes no cambian por este diff.

Se detectó y corrigió un límite antes de cerrar la revisión: la reserva inicial de fila permitía un panel de 83px en una card estrecha con texto al 200%, mientras el texto de una fecha de tres líneas ocupaba 113.19px. El candidato final aumenta la reserva mínima; el panel mide 147/148px en ese caso y permite leer la fecha completa. El hallazgo no se atribuye a la versión final.

## Evidencia contrastada

- Lectura del diff de CSS y del generador, consumidores de home.js y pruebas de navegador; inspección visual de captura mobile.
- Evidencia del implementador inspeccionada en `browser/results.json`: 234 comprobaciones, sin errores de página; apertura por hover, tap, teclado y sin JavaScript; anchuras 320, 390, 768, 1024 y 1440; textos al 200%; lista larga. Estas 234 comprobaciones no se presentan como ejecutadas por el revisor.
- Ejecución propia con servidor HTTP temporal y Chromium de pruebas, sin modificar producto ni usar/detener localhost:4175: 12 escenarios (320/768/1440 × JavaScript activo/inactivo × texto 100/200%), 36 cards. Fixtures: nombre de varias líneas, sin fotografía, disponibilidad completa/disponible/por consultar, 18 fechas completas y fecha pendiente.
- En los 36 casos el panel quedó debajo de los badges y por encima del título, con separación mínima de 13 px normal/26 px ampliado; el título completo quedó dentro de la foto. La última fecha pudo colocarse completamente en el panel mediante scroll. En 768/200%, texto de 113.19 px y panel de 147/148 px.

## Observaciones y límites

La zona del summary ahora corresponde a la fila superior de la foto: el botón Ver fechas conserva la apertura táctil, y hover sigue asociado a toda la foto; tocar exclusivamente el título ya no alterna el details. No se considera bloqueo de la petición de reubicar fechas. No se probaron motores Safari/Firefox ni se realizó publicación. La captura mobile inicial tenía un velo azul transitorio de tap highlight; no representa un cambio de paleta del CSS y se recomienda entregar captura sin ese estado transitorio.
