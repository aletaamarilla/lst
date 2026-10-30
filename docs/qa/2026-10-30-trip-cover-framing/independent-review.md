# Revisión independiente — encuadre y navegación de portada

Fecha: 30/10/2026. Revisor distinto del implementador; sin modificaciones de implementación.

## Alcance y versión

- Repositorio `letsurftogethersystem`, HEAD `58f338661fc4705364fea08727c836e79b3f2048`; el trabajo previo sin commit queda fuera de esta revisión.
- Base exacta de esta iteración: `before/`, contrastada mediante `template.diff`, `style.diff` y `carousel.diff`.
- Candidata inicial: render `6c1169843c193f3db90fdfc77cb55f357d787522d9fd7ba5184e39ef5353fc09`, CSS `514a7b372dd862e1b05fc578a52e0cb58c9df9f8ef283be157b89b643122941d`, JS `a1deedded17f2b1ea8a22714643b04066eb3f9d28da1265980d4d28b06a0ccf0`.
- Candidata final simplificada, con protección del resize, revisada de nuevo contra `before/`: render `a3993948840ecd52dddb47332a744743ca92f3f02b5e89e670cafde67d82ba8a`, CSS `d2c19ec768a363a53f5db769ab82308b1f00a5097dc861de3763224dec7db045`, JS `c68e8b2648eac96a686de7955b5edca9f4d89ffa9a1725168fa69231f026ccfa`.

Estado: revisión finalizada sobre la galería final de marcos uniformes. No se traslada automáticamente la conclusión de las versiones intermedias: se contrastaron nuevamente fuente, CSS, controlador, pruebas afectadas y manifiesto. No quedan bloqueos conocidos dentro del alcance comprobado.

## Hallazgo resuelto

**P2 — Las dos fotos estrechas finales pueden atascar el avance y retroceso de la portada.**

- Ubicación inicial: `dist/trip.js`, `current()` (línea 245), `select()` y manejador de Anterior (líneas 269–273).
- Escenario real: Senegal a 1440 × 1000, portada de 600 px. Las anchuras derivadas de los seis assets publicados son aproximadamente `[899.56, 800, 900, 900, 450.05, 399.93]`.
- Reproducción independiente en memoria con el controlador real y el harness de geometría existente: Siguiente produce `01 → 02 → 03 → 04 → 06`; desde `06`, Anterior sigue mostrando `06` y mantiene `scrollLeft=2949.54`, pese a estar habilitado.
- Causa: `current()` fuerza el último índice al alcanzar el extremo físico. La posición necesaria para centrar la penúltima también queda limitada a ese mismo extremo; no se puede distinguir de la última mediante el desplazamiento actual.
- Impacto: se omite una posición de la secuencia y el control de retroceso deja de funcionar. La prueba inicial con anchuras `[900,400,900,400]` no cubre una penúltima estrecha.
- Cobertura adicional sugerida: el caso simétrico de dos primeras fotos estrechas (`[400,400,900]`, viewport 1440) también limita a cero la posición de la segunda. No ocurre en las primeras fotos actuales del catálogo; es un límite del controlador genérico que debe comprobarse al corregir los extremos.

El implementador confirmó el defecto y lo corrigió inicialmente con espacios de centrado. Esa solución intermedia se descartó posteriormente por su resultado visual a poca altura.

En la solución intermedia se reprodujeron independientemente el avance y retroceso correctos de Senegal y el extremo inicial; esos resultados no constituyen por sí solos la validación de la versión final.

La candidata final elimina la causa del P2 mediante diapositivas uniformes del ancho completo del viewport, sin espacios ni cálculos de centrado. La proporción variable pertenece a la imagen contenida dentro de cada marco. El controlador vuelve a la alineación izquierda y las pruebas finales recorren las seis fotos y ambos extremos sin saltos ni atascos. Los carruseles de alojamiento mantienen su geometría y alineación anteriores.

**Regresión de resize encontrada por el implementador, corregida en la candidata final.** El registro `resize-before-fix.log` muestra que un evento de scroll nativo anterior a ResizeObserver podía reinterpretar el desplazamiento con el ancho nuevo y sustituir `02 / 06` por `05 / 06`. La nueva prueba reproduce ese orden de eventos; el revisor la ejecutó satisfactoriamente sobre la candidata final. En `update()` se compara primero `track.clientWidth` con `frameWidth`, se registra el ancho nuevo y se alinea `selectedThumb` sin animación antes de calcular `current()`.

La revisión del orden de ejecución no encuentra acceso a `select` durante su zona temporal muerta: su declaración se completa antes del registro de eventos, `observe()` y el primer `update()`. El ancho se actualiza antes de llamar a `select`, por lo que un scroll síncrono reentrante no vuelve a activar el mismo ajuste; el harness ejecutado emite scroll desde `scrollTo` y cubre esa reentrada. La condición está limitada a portada y la prueba de alojamiento conserva desplazamiento, carga y comportamiento de resize anteriores.

## Conclusión sobre la candidata final simplificada

- Bloqueo P2 eliminado por la geometría uniforme de la versión identificada arriba.
- Los controles se separan de la foto y conservan sus nombres accesibles; la visibilidad de las flechas móviles está acotada a la barra de portada.
- La precarga dinámica afecta a la foto elegida y vecinas de la portada. No cambia el estado de carga ni la alineación de los carruseles de alojamiento comprobados.
- Las variantes de imagen conservan las dimensiones conocidas y limitan las solicitudes a la resolución original o al techo de 3840 px. Las fuentes locales no reciben URLs de derivados inventadas.
- El fondo es una segunda imagen decorativa con `alt=""`, `aria-hidden="true"`, carga diferida y prioridad baja. Está fuera del contenido accesible, no recibe foco ni eventos de puntero y reutiliza exactamente los mismos `src`, `srcset` y `sizes` que la imagen principal. No se midió en navegador la cantidad efectiva de peticiones o la reutilización de caché.
- No se identifican nuevos bloqueos ni mejoras opcionales necesarias dentro del alcance comprobado. La nitidez y el encuadre percibidos dependen también del material original y de la comprobación visual, fuera de la capacidad de navegador de esta sesión.
- El ajuste final del degradado está limitado a la cabecera inicial con fotografía, sin menú abierto ni estado de desplazamiento. Refuerza el fondo oscuro bajo el texto claro y no altera geometría, controles ni navegación. No se detectan bloqueos en este último ajuste; su resultado visual no fue comprobado independientemente.

## Evidencia independiente inicial

- Suite completa: **185 aprobadas, 0 fallos**.
- `npm run check`: **PASS, 40 páginas**.
- `sha256sum -c candidate.sha256`: todas las entradas de la candidata inicial coinciden.
- Revisión de generación responsive de imágenes, límites de resolución, parámetros de calidad, intrínsecos y prioridades; comparación del controlador de portada con el recorrido de alojamiento y modal.
- La reproducción del atasco se ejecutó sin escribir pruebas ni archivos fuente.

## Evidencia independiente de la versión final simplificada

- Pruebas afectadas de controlador, imágenes, apertura editorial y navegación, repetidas después del último cambio de resize: **17 aprobadas, 0 fallos**.
- `npm run check`: **PASS, 40 páginas**.
- `sha256sum -c candidate.sha256`: todas las entradas de la candidata final simplificada coinciden.
- Lectura completa de las diferencias finales respecto a la base, incluidos fondo decorativo, prioridades, precarga, foco, resize, alojamiento y la nueva geometría uniforme representada explícitamente en el harness.
- El implementador comunicó una suite completa de **188 aprobadas** para esta versión; se distingue de las 17 pruebas afectadas ejecutadas por el revisor sobre la versión final con protección del resize.

## Límites

El inventario de esta sesión devuelve `browsers: []`; no hubo comprobación visual independiente. La reproducción del defecto usa el controlador real con geometría calculada desde los assets publicados, no una interacción de navegador. La evidencia visual del implementador debe registrarse como suya.

No se enviaron formularios ni mensajes, no se editaron datos ni CMS y no se comprobó producción.
