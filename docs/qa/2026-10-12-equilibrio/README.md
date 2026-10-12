# LST · equilibrio visual y lectura · 12/10/2026

Implementación y validación local terminadas. No hay bloqueos conocidos en el alcance comprobado. No se ha hecho commit, push, publicación ni despliegue. Se conserva el trabajo previo sin commit.

**[Abrir la comparación visual antes/después](comparativa.html)** · [Diff exclusivo de este encargo](task-only.diff) · [Versión y hashes](version.json) · [Revisión independiente](revision-independiente.md)

## Qué se ha ajustado y por qué

Cada comparación procede del mismo navegador y ancho. Los detalles al 200 % usan los estilos del snapshot anterior mediante interceptación local, con el mismo HTML, para aislar las correcciones de CSS. Las imágenes se cargaron antes de capturarlas.

| Ajuste | Antes → después y problema resuelto | Evidencia |
| --- | --- | --- |
| Tarjetas de próximos destinos | Miniaturas verticales con grupos cortados → fotografía completa y estado debajo. Se mantiene la tarjeta horizontal; al ampliar texto se apila. Marruecos cabe completo a 320 px. | [Antes](capturas/destinos-antes.png) · [Después](capturas/destinos-despues.png) |
| Escena de aprendizaje | Altura fija de 455 px en tablet → proporción original, centrada junto al texto. Recupera la tabla y a quienes observan la demostración. | [Antes](capturas/aprendizaje-antes.png) · [Después](capturas/aprendizaje-despues.png) |
| Azores | El borde cortaba parte del grupo → fotografía completa y título separado. Se conservan lago, paisaje y personas. | [Antes](capturas/azores-antes.png) · [Después](capturas/azores-despues.png) |
| Cádiz | Título sobre rostros y recorte panorámico → variante compartida con Azores, con título e imagen en espacios propios. Dos columnas en pantallas mayores; una en teléfono. | [Antes](capturas/cadiz-antes.png) · [Después](capturas/cadiz-despues.png) |
| Asturias móvil | Datos y nombre sobre la maniobra → mínimo de portada de 300 a 400 px y posición horizontal propia. El aumento responde a la imagen observada. | [Antes](capturas/asturias-antes.png) · [Después](capturas/asturias-despues.png) |
| Euskadi móvil | Surfista detrás del título → foco horizontal de 55 % a 15 %. Altura y escritorio conservados. | [Antes](capturas/euskadi-antes.png) · [Después](capturas/euskadi-despues.png) |
| Galerías | Miniaturas casi cuadradas → marco horizontal 3:2 con imagen completa. Conserva grupos, tablas y contexto; no cambia la ampliación ni sus controles. | [Antes](capturas/galerias-antes.png) · [Después](capturas/galerias-despues.png) |
| Tarjetas con fecha y texto 200 % | Fecha y nombre superpuestos, precio partido → filas separadas sobre la foto, precio indivisible y ancho de condiciones ligado al tamaño del texto. | [Antes](capturas/tarjetas200-antes.png) · [Después](capturas/tarjetas200-despues.png) |
| Jerarquía del programa | Una regla global imponía 26 px a títulos de filas definidas a 16 px → heredan el tamaño de la fila y quedan subordinados al título de sección. Columnas de números/controles adaptables. | [Antes 100 %](capturas/plan-antes.png) · [Después 100 %](capturas/plan-despues.png) · [Antes 200 %](capturas/plan200-antes.png) · [Después 200 %](capturas/plan200-despues.png) |
| Salto al contenido | El enlace oculto asomaba 27 px sobre el logo con texto ampliado → ocultación según su propia altura, manteniendo su aparición al recibir foco. | [Antes](capturas/salto-antes.png) · [Después](capturas/salto-despues.png) |

## Decisiones conservadas

- **Portada de la home:** mantiene fotografía, composición, slogan, frase y altura. A texto normal la maniobra queda visible y el CTA entra en la primera pantalla; no se justifica reducirla. El CTA y el menú siguen dando acceso al catálogo.
- **Tarjetas con fecha:** conservan fotografía amplia, descripción, duración, nivel, precio, condiciones y acción. Los ajustes al texto ampliado no eliminan información.
- **Recorrido:** catálogo → experiencia y voces → reserva → niveles → historia/equipo/responsabilidad → dudas/cierre. Se conserva la continuidad del bloque de responsabilidad dentro de la presentación.
- **Fichas:** se mantiene resumen → programa → fotos → nivel → alojamiento cuando existe → inclusiones → equipo → dudas → consulta. El resumen y los datos ya explican el encaje, incluida la autonomía de El Salvador. No se duplica ese resumen ni se añaden anclas de navegación o desplegables.
- **Equilibrio de contenidos:** surf y maniobras en apertura/salidas; aprendizaje en la demostración y los programas; comunidad en fotografías y voces; aventura y descubrimiento en Azores, Marruecos y sus relatos; respeto en el bloque ya revisado. Se recupera contexto visual sin introducir historias o promesas.
- Logos y los 32 assets de imagen/fuentes permanecen idénticos, así como Aura, Work Sans, Space Mono y los tokens `#EA5934`, `#FFFAE7`, `#1B1B1B`.
- Textos, slogans, historias, testimonios y responsabilidad intactos. No se investigan ni cambian datos comerciales, precios, fechas, estados o inclusiones. Sin nuevos recursos fotográficos ni descargas.
- WhatsApp y mensajes, selector de fechas en ventana, inclusiones siempre abiertas y ausencia de flechas decorativas en móvil conservados. JavaScript intacto.

## Verificación final

| Criterio | Evidencia final |
| --- | --- |
| Siete páginas en 320, 390, 768, 1024 y 1440 px | [35 vistas normales](after-browser.json): HTTP 200, fuentes cargadas, ninguna imagen ausente, sin overflow del documento ni errores JS. Capturas completas tomadas en cada vista. |
| Ampliación de texto | [35 vistas al 200 %](text200-browser.json): sin overflow de documento ni de los elementos de texto comprobados, sin errores JS, sin cruce foto/título en portadas de grupo. |
| Antes/después de problemas al ampliar | [Comparación focalizada](focused-browser.json), [medidas del enlace de salto y plan contra la base](zoom-baseline-comparison.json) y [contraste independiente de tarjetas](review-final/cards-comparison.json). |
| Navegación y comportamiento existente | [1.225 comprobaciones sin fallos](interacciones.json): menú/teclado, acceso al catálogo, fechas, galería, retorno de foco y scroll, reducción de movimiento, pie accesible. 43 aperturas de WhatsApp interceptadas localmente, sin mensajes enviados. |
| Build y comprobador del proyecto | [Pipeline final](pipeline.txt): `npm run build`, `npm run check`, `npm test` (5/5) y `git diff --check`, todos correctos. Se regeneran seis fichas. |
| Contenido y trabajo anterior | [73 comprobaciones de conservación](preservation.json): datos previos idénticos al retirar los campos visuales nuevos; texto, enlaces, imágenes, encabezados y cantidad de desplegables conservados en las siete páginas. |
| Revisión independiente | [Informe final](revision-independiente.md): 650 comprobaciones finales, cero fallos. Comparó snapshot, consumidores, semántica, capturas y comportamiento; hashes de implementación confirmados. Documentación añadida después fuera de esa aceptación de código. |

La inspección visual directa cubrió las portadas de las siete páginas mediante láminas, las zonas modificadas y la continuidad de la home en móvil/escritorio. La matriz de navegador cubre todas las combinaciones de páginas/ancho/tamaño indicadas; no se confunde con una auditoría manual exhaustiva de cada píxel.

[Lámina 320](capturas/siete-portadas-320.png) · [390](capturas/siete-portadas-390.png) · [768](capturas/siete-portadas-768.png) · [1024](capturas/siete-portadas-1024.png) · [1440](capturas/siete-portadas-1440.png)

[Home 390 antes](capturas/home-390-before-full.png) · [después](capturas/home-390-after-full.png) · [Home 1440 antes](capturas/home-1440-before-full.png) · [después](capturas/home-1440-after-full.png)

## Archivos y versión

- `dist/styles.css`: ocultación del enlace de salto.
- `dist/mobile.css`: encuadres en home, adaptación de tarjetas y condiciones de precio.
- `dist/trip.css`: portadas de grupo, posiciones móviles, miniaturas y títulos del programa.
- `data/trips.json`: solo cinco campos visuales nuevos repartidos entre Asturias, Euskadi, Azores y Cádiz.
- `scripts/render-trips.mjs`: consume `heroLayout`, `heroPositionMobile` y `heroMinHeightMobile` como opciones; conserva valores por defecto sin esos campos.
- `dist/viajes/{el-salvador,asturias,azores,euskadi,marruecos,cadiz}/index.html`: salidas regeneradas. Su texto y enlaces permanecen idénticos.
- `README.md`, `docs/propuesta.md`: revisión 17 añadida, preservando documentación anterior.
- Este directorio: comparativa, capturas y evidencias nuevas. No se sirve desde `dist/`.

Repositorio `aletaamarilla/lst`, base Git `6053e6173d6114ee741bc0f4310d79418f22199e`, sobre el checkout previo sin commit. Candidata `be842dcb6ccfa5ec36c1c8d5d6d3d06b96151af0baa3207ef978a814ac596590`; [13 archivos existentes modificados](candidate-hashes.json), incluido el alcance de documentación, y este directorio nuevo. [Estado inicial](initial-status.txt), [hashes de partida](baseline-hashes.json) y [diff exclusivo](task-only.diff). La revisión independiente identifica específicamente los 11 archivos de implementación, sin atribuirle la documentación posterior.

## Límites y reproducción

Chromium real local mediante Playwright; no Safari, Firefox, dispositivos físicos o lector de pantalla. El texto al 200 % se simula duplicando tamaños calculados: no certifica cada modalidad de zoom de cada navegador. Algunos títulos grandes pueden dividirse en varias líneas con texto ampliado, sin ocultar contenido. No se ensaya la aplicación nativa de WhatsApp ni se contacta con el equipo.

Se reutilizaron Playwright y Chromium instalados, con bibliotecas locales vía `LD_LIBRARY_PATH`; no se añadieron dependencias ni se modificó el sistema. `capture.cjs`, `text200.cjs` y `focused.cjs` conservan el procedimiento de esta máquina y sus rutas temporales. `npm run dev` sirve el proyecto en `http://localhost:4175`; `scripts/check-ux.mjs` admite las rutas del runtime mediante las variables descritas en la documentación anterior. La comparación independiente no usa sus capturas diagnósticas con artefactos de carga diferida: se entregan las capturas cargadas de esta tarea.

La primera llamada a las herramientas falló por el entorno de la sesión; se resolvió el acceso al checkout indicado antes de editar. Una captura auxiliar tuvo un error sintáctico en su script temporal; fue corregida y repetida. No son fallos de la aplicación ni se cuentan como verificaciones aprobadas. Los problemas de texto ampliado se reprodujeron con los estilos de base antes de atribuirlos al estado anterior, y la candidata final se volvió a verificar.

La entrega acredita implementación y validación local dentro de este alcance. No verifica datos comerciales provisionales, preparación para lanzamiento ni mejoras de ventas; siguen vigentes los pendientes anteriores del inventario.
