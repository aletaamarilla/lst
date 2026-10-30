# Revisión independiente: tarjetas, fechas y navegación

Fecha: 24 de octubre de 2026. Revisor: subagente independiente, sin cambios en implementación.

## Versión revisada

Repositorio letsurftogethersystem. HEAD 58f338661fc4705364fea08727c836e79b3f2048 con cambios sin commit; base específica de esta tarea en before/. Se preserva y no se atribuye a esta tarea el resto del trabajo previo del checkout. Nuevo archivo de implementación: scripts/render-departure-rows.mjs. Las huellas al final identifican la candidata final revisada, incluidos renders, estilos, interacciones y HTML de home.

## Resultado

Sin defectos bloqueantes identificados en el alcance comprobado. El enlace nativo extendido cubre la tarjeta visible y el panel de fechas enlaza al mismo viaje mediante un enlace propio. El summary de fechas queda separado y conserva su control nativo. No se introducen anchors anidados ni navegación programada con JavaScript.

## Comprobaciones ejecutadas por el revisor

- npm test: 65/65 aprobadas en la candidata final.
- npm run check: PASS, 24 páginas generadas y sus rutas, enlaces, anclas y contratos contextuales.
- git diff --check: sin errores en la candidata final.
- Chromium independiente a 320, 390, 768, 1024 y 1440 px: hit-testing en el padding visible y título de tarjeta llega al enlace nativo del viaje; filas con fechas a la izquierda y niveles a la derecha; sin solapamiento ni overflow lateral. El fondo calculado del panel es rgba(255, 250, 231, 0.78).
- En esos cinco anchos se verificaron Enter/Space para las fechas, Tab hacia su zona desplazable y Escape para cerrar y recuperar foco. Abrir fechas conserva la URL.
- JavaScript deshabilitado a 390 px: summary nativo abre las fechas; el enlace principal navega con Enter.
- Reproducción final del hallazgo de panel: la segunda fila de Marruecos navega a /viajes/marruecos/ con clic desktop a 1440 px, toque real de contexto móvil a 390 px y clic sin JavaScript a 390 px. Summary sin enlaces anidados y un único enlace dentro del panel.
- Texto al 200 % en los cinco anchos: sin solapamiento entre fecha/nivel ni overflow lateral, incluido Todos los niveles. Comprobación adicional a 320 px de cada destino real con el panel desplazado al final: fecha y nivel finales completos dentro del panel, incluido Marruecos y Maldivas.
- Headers de catálogo, niveles, conócenos, FAQs y detalle a 390 y 1440 px: enlaces visibles con fondo transparente, borde/radio cero y alturas de 44–48 px; menú móvil operativo y sin overflow.

Estas comprobaciones fueron ejecutadas por el revisor mediante su propio servidor y aserciones de Chromium, además de las pruebas del repositorio. No se toma como prueba suficiente el relato del implementador. El alcance es local; no certifica un despliegue remoto ni ausencia absoluta de defectos.

## Hallazgos cerrados y límites

El panel de fechas abierto interceptaba el clic sobre sus filas y dejaba una zona de la tarjeta sin navegación. Se reprodujo en Chromium sobre Marruecos y se resolvió con .home-trip-dates-link, enlace nativo que envuelve la lista y conserva el summary separado. El padding pasa al enlace, cubriendo también el área interior; la corrección se verificó con mouse, toque y sin JavaScript.

El espacio residual generado en el catálogo fue corregido: diff --check final limpio.

Una prueba exploratoria con 24 cadenas manuales completas de noviembre y Todos los niveles, a 320 px y texto al 200 %, necesitaba desplazar el texto para leer la fecha completa; no había overflow lateral ni pérdida del texto. Esa cadena no la produce el adaptador, que utiliza mes abreviado a partir de start/end. Las fechas reales publicadas pasan la comprobación de visibilidad completa indicada arriba. No se considera bloqueo del alcance publicado.

No se modificaron datos ni se hicieron escrituras remotas durante esta revisión. La huella del snapshot público se registra para identificar los datos usados.

## Huellas SHA-256

```text
8de4a27f038a0901daad27444a53a182fab789a1fd5fcaa8e8d07ea077c0efe3  scripts/render-departure-rows.mjs
686eaa931be366f60b57393812dbcdb6bbe53af15974f56e4b0045dba9f63615  scripts/render-home-trips.mjs
24907b210199646185b967c740c7c2464b1833ef2e37d0d4a511d990b3ac09be  scripts/render-catalog.mjs
f38271e9632b81f50db4bdb7ad3a479eefd25d4e17c1f81d61908471be755b97  scripts/render-level-trips.mjs
3e9deb8c17b8d2a385831a3516b1d4f3c734799e4812a3a7243a49aeea2de45d  scripts/render-trips.mjs
1217df8ce3ef273f6f518abcee354ebb8e266b062967d1ed6af49e209c265287  scripts/home-trips.test.mjs
5d0671eb4f3b44231b3fc219524a4835011977b433c423075ccfb40c5be76a6f  dist/home.css
4fe0c5c5a0f3d88216da7a7dda1b454a2c08375d8e220924d97d763f78fa2c91  dist/home.js
0e22dc9fd3d848ed0d27bf52f841f446f3d67fafcd34d22c5dfecb560ef6d7d7  dist/index.html
93a80d643d1d88b366f1e2c8a2011edde989ea980ba3f53acefa919d133990c7  dist/styles.css
7fb0639a7fff177d6e12f91066ec4843045c9a572b1eab5906a4672d3d14f83a  dist/mobile.css
4f52e4f99e765620a5d9972282e9a8f7fda498531d7def0a1ebb3dc163ceffee  dist/catalog.css
5c4e05d9ab720b2c3a1173096ec559db9c6a474feccc4f2f7835a9771e498ff9  dist/about.css
a91513ed07a4c57468bfe86d412d2f6f009e54cd011f274750de15ef8ba5fa66  dist/faq.css
68a9f92d6eb12b1cd4b8938ce46c73287d9d5c741801ffccc169ff8ecad453df  dist/levels.css
234d33645809254b0092ea1baf699f47f1e91094600dff8872533488db4da08a  dist/trip.css
e68265fb86ac95666b33336f099b916d4bf5f41a4517f354800160c5d471f25a  dist/catalog-snapshot.json
```
