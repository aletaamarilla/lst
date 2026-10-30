# Home LST · continuidad y niveles · 24/10/2026

Petición: dar presencia a Más viajes, retirar el salto redundante a niveles, preguntar por el nivel de forma natural, ofrecer dos acciones por nivel y conectar visualmente las secciones.

## Alcance propio

Base Git: `58f338661fc4705364fea08727c836e79b3f2048`, rama main, cambios locales sin commit. El árbol ya estaba modificado. `before/` conserva los archivos al comienzo de este turno.

- `dist/index.html`: símbolo de unión después del hero; eliminación de Dudas con tu nivel; título «¿Qué nivel crees que tienes?»; cuatro artículos de nivel con dos enlaces hermanos y nombres accesibles.
- `dist/home.css`: Más viajes con contorno, tipografía Aura y control naranja; curvas y símbolo original en las uniones; espacios ajustados; marco de reservas; acciones de nivel. Se amplió el espacio antes de las fechas para admitir la etiqueta nueva del catálogo a200%.
- `scripts/check-home-browser.mjs`: expectativa de navegación adaptada a la retirada del botón y el nuevo título.
- Nuevo `scripts/check-home-level-actions.mjs`: geometría, teclado y navegación real desde cada acción de nivel.
- Script de capturas: `artifacts/home-transitions/capture-sections.mjs`. Evidencia nueva en esta carpeta.

## Cambios concurrentes preservados

Durante la revisión, otra escritura actualizó el catálogo y sus generadores: agrupó las salidas en6destinos y regeneró las páginas. También añadió `.home-trip-date-level` al CSS. Estos cambios no pertenecen a esta implementación. Se conservaron y se comprobó la convivencia de la home con el resultado actual. La región HTML fuera de `home-trips:start/end` mantuvo nuestros cambios.

Las ejecuciones intermedias que coincidieron con esa escritura fallaron por6tarjetasfrentea7leídasalinicio y por el detector de archivos modificados durante una prueba. Se repitió sobre la versión estable. Después se detectó un solapamiento real de la etiqueta «Nivel según la fecha» con las fechas a768px/200%; el ajuste de5em a5.5em lo corrige y la suite de geometría vuelve a pasar.

## Versión revisada

`candidate.sha256.json` identifica los archivos finales y dependencias. HTMLfinal: `20643b7a9e2b06dda0ff8d2e28980b2703dbe41ef320273feb4734cd22d9cec4`. CSSfinal: `7daaf1c17beb5924060d40787c441ea18e40252923b0625c847e5be3096df7f6`. La revisión independiente identifica las versiones y su alcance en `revision-independiente.md`.

## Criterios y evidencia

- Más viajes tiene presencia propia y conserva su apertura nativa: teclado, sin JavaScript,320/390/768/1440 y texto100/200% revisados independientemente.
- El botón anterior a niveles se ha retirado. El título propone una autoidentificación, sin evaluar a la persona.
- Cada Saber más abre `/niveles/#rookies`, `#aprendices`, `#riders` o `#supercracks`; la guía recibe foco y el encabezado queda bajo la cabecera. Ver viajes conserva `/viajes/?nivel=N`.
- Las acciones mantienen44px de altura mínima y caben a320/390/768/1440, con texto200%. Son enlaces hermanos; no hay enlaces anidados.
- Las uniones y el marco usan los colores, fotografía, fuentes y símbolo existentes. Las capturas finales están en `visual/`; `browser/` contiene la home completa a cinco anchuras.

## Comprobaciones

- `npm run check`: resultado actual en `check.txt`; rutas, anclas, activos y sintaxis.
- Suite home:234PASS sobre HTML20643b7/CSS7daaf1c;320/390/768/1024/1440, texto200%, fechas largas, hover, tap, teclado, enlaces y apertura sin JavaScript. `browser/results.json`.
- Acciones de nivel:48/48PASS sobre HTML20643b7/CSS22f179; `levels/results.json` y su manifiesto identifican esos bytes. El único cambio posterior del CSS son los dos valores de posición/altura máxima del panel de fechas; no afecta los enlaces ni el diseño de niveles. La suite home final y la revisión del diff cubren ese ajuste.
- Revisión independiente: sin bloqueos en el alcance de UI. El reporte diferencia las pruebas propias y complementarias por versión.

Limitaciones: comprobación local en Chromium; no es una prueba de todos los navegadores ni de la exactitud del modelo/datos concurrentes. Sin JavaScript, el catálogo conserva su alternativa existente de mostrar todos los viajes; los enlaces de nivel mantienen sus destinos. La tarea queda implementada y validada localmente, sin publicación.
