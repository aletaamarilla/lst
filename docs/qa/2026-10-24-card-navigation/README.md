# Tarjetas y navegación · 24/10/2026

Candidata local sin commit sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048`. Se conserva el trabajo previo de unificación, home y limpieza. [Estado inicial](initial-status.txt), [base de archivos](before/), [diff exclusivo de esta tarea](task.patch), [versión exacta](version.json).

## Resultado

- Cada fecha ocupa una fila con separador; el nivel efectivo queda en una columna a la derecha. La misma estructura se usa en home, catálogo y guía; el selector del detalle también separa fecha y nivel en columnas.
- El panel de fechas de la home usa fondo crema al 78 % y desenfoque, conservando el texto opaco y legible.
- La tarjeta completa usa un enlace nativo extendido. El panel abierto también tiene un enlace nativo; «Ver fechas/Cerrar» sigue siendo un control independiente. Se conserva scroll, teclado, touch, apertura en otra pestaña y funcionamiento sin JS.
- Las cabeceras de home, catálogo, niveles, Conócenos, FAQs y detalle usan acciones textuales, sin píldoras, borde ni fondos de botón. Mantienen tamaño táctil mínimo de 44 px, foco y menú móvil.
- Se eliminan las flechas decorativas repetidas en navegación, CTA, tarjetas y consultas. Se conservan las funciones de volver, descargar y desplegar.
- No cambian destinos, niveles efectivos, fechas, precios, condiciones, PDF, disponibilidad ni rutas.

## Implementación

`render-departure-rows.mjs` reutiliza el modelo de salidas y escapa textos. El enlace de tarjeta está separado del control nativo details/summary; no hay enlaces anidados ni navegación mediante onclick. La apertura con hover se conserva sobre la tarjeta, y el panel sigue desplazándose cuando hay muchas fechas.

Las tarjetas se redistribuyen según una anchura mínima para mantener legibles las dos columnas al ampliar texto. Los niveles largos pueden ocupar varias líneas dentro de su columna derecha. Se adaptaron las expectativas existentes de QA al nuevo diseño, manteniendo las comprobaciones de foco, scroll, tap y fechas largas.

## Evidencia final

| Comprobación | Resultado |
| --- | --- |
| Pruebas | [65/65 aprobadas](tests.txt) |
| Build publicado real | [6 destinos](build.txt) |
| Check | [24 páginas](check.txt), enlaces, alias, recursos y generación coherentes |
| Home en Chromium | [234 comprobaciones](home-browser.txt), 320/390/768/1024/1440 px, 200 %, hover, touch, teclado, listas largas y sin JS |
| Cabeceras y tarjetas | [31 comprobaciones](browser.txt) en 6 rutas a 390/1440 px; transparencia y niveles a la derecha en panel y selector. [Detalle](headers-and-cards.json) |
| Revisión independiente | [Informe](revision-independiente.md), incluidos hit testing y navegación con mouse/touch/sin JS |
| Formato del diff | `git diff --check` sin incidencias |

Capturas: [tarjeta móvil](marruecos-card-390.png), [tarjeta escritorio](marruecos-card-1440.png), [cabecera móvil](header-390.png), [cabecera escritorio](header-1440.png), [selector móvil](date-selector-390.png).

Se corrigió en revisión el área del panel de fechas que inicialmente interceptaba clics sin navegar. La versión final usa su propio enlace nativo y se volvió a comprobar.

## Alcance de publicación

No se ha hecho commit, push, despliegue ni escritura en Sanity. Las pruebas son locales en Chromium; no se enviaron mensajes ni reservas. La evidencia acredita estos casos y esta candidata, sin afirmar ausencia absoluta de defectos.
