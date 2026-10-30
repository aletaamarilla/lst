# Revisión independiente de la home LST

Fecha: 24 de octubre de 2026. Revisión de solo lectura del producto; este informe es el único archivo creado por el revisor. No se ha usado ni detenido el servidor del usuario en el puerto 4175.

## Versión y alcance

Repositorio letsurftogethersystem, HEAD 58f338661fc4705364fea08727c836e79b3f2048, con cambios locales previos. La comparación específica del turno usa before/; no se atribuyen todos los cambios del estado Git a esta petición.

Candidato combinado inspeccionado:

| Archivo | SHA-256 |
| --- | --- |
| dist/index.html | 20643b7a9e2b06dda0ff8d2e28980b2703dbe41ef320273feb4734cd22d9cec4 |
| dist/home.css | 7daaf1c17beb5924060d40787c441ea18e40252923b0625c847e5be3096df7f6 |
| dist/home.js | aafc9d1980ec085ede47fefc4a550efa9403ae33235bce7323ebfbe4c2c39e5f |
| scripts/render-home-trips.mjs | 9a3570f1c2038b1ec62649c88a1fbaa7533e3fbb14f7e7e07faa6399ce29cd1b |

Se revisan los cambios pedidos en Más viajes, el enlace redundante de dudas, la pregunta de niveles, las dos acciones de cada nivel y las uniones visuales entre secciones, junto con sus consumidores de navegación.

Durante la revisión llegó una actualización concurrente del catálogo/modelo ajena a este trabajo: Marruecos y Maldivas se agruparon por destino con sus salidas, por lo que el catálogo final contiene seis destinos y Más viajes muestra tres adicionales. Se ha conservado. La igualdad de bytes fuera de home-trips:start/end con el candidato UI 161c278f94b04b62530ed2e8ff029870f4710ac810be8bec55a8326a4e09d9c5 se comprobó programáticamente. El CSS combinado añade al final una regla .home-trip-date-level, usada por la agrupación de fechas de niveles diferentes. La revisión abarca su integración con la home; no certifica la exactitud de los nuevos datos, importación o reglas del modelo concurrente.

## Resultado

Sin hallazgos bloqueantes en el alcance UI revisado.

| Requisito | Evidencia contrastada |
| --- | --- |
| Más viajes más visible y elegante | Se conserva details/summary nativo, con forma asimétrica, fondo suave y flecha naranja. Apertura/cierre y foco comprobados de forma independiente. |
| Retirar la llamada redundante antes de niveles | No existe .lst-level-help en el candidato; la sección de niveles sigue inmediatamente después de viajes. La ayuda por WhatsApp permanece tras la explicación de los cuatro niveles. |
| Pregunta sobre el nivel percibido | H2 «¿Qué nivel crees que tienes?» y texto que invita a reconocerse en la guía, sin afirmar una evaluación del usuario. |
| Dos acciones por nivel | Cuatro article con aria-labelledby válido y dos enlaces hermanos nativos; no hay enlaces anidados. Ver viajes conserva /viajes/?nivel=1–4 y Saber más usa los cuatro hashes existentes de /niveles/. |
| Enfocar el nivel elegido | Los cuatro destinos de la guía tienen id y tabindex=-1; los consumidores de anclas y navegación nativa son compatibles. |
| Uniones entre secciones | Revisadas capturas de escritorio y móvil: curva del hero y símbolo original, acento sobre niveles, bloque naranja del equipo, separador con símbolo en opiniones y marco de reservas. Se mantienen fotografías, Aura, Work Sans y los colores LST. |

Se revisaron directamente dist/app.js, dist/levels.js, dist/levels.css, dist/catalog.js, dist/catalog-filter.js, la página de niveles y los validadores afectados. El catálogo interpreta los parámetros numéricos 1–4 con JavaScript. Sin JavaScript mantiene su comportamiento existente y explícito: catálogo completo legible, con una nota que orienta a consultar el nivel de cada viaje; esta revisión no presenta el filtrado como disponible sin JavaScript.

## Prueba ejecutada por el revisor

Servidor HTTP temporal aislado sobre dist y Chromium local. Dieciséis escenarios: 320, 390, 768 y 1440 px, con/sin JavaScript y texto al 100/200 %. Todos aprobados sobre HTML 20643b7… y CSS 22f179…:

- Espacio abre Más viajes y Enter lo cierra.
- Foco visible de 3 px y control de al menos 44 px; altura mínima observada 78 px.
- Sin recortes de texto ni desbordamiento horizontal.
- Tres cards adicionales y contador tres, contrastados con los seis destinos confirmados del snapshot.

La ejecución independiente se realizó en memoria, sin crear otro script ni alterar archivos del producto. Resultado: 16/16, cero errores.

## Evidencia complementaria examinada

- [Browser](browser/results.json): 234 comprobaciones, cero errores en la ejecución final examinada sobre HTML 20643b7…/CSS 7daaf1c…. Se contrastaron las mediciones de badge, panel de fechas y título, además del código de sus aserciones.
- [Acciones de nivel](levels/results.json): 48/48, incluidos los cuatro enlaces por nivel con/sin JavaScript, foco de destino, teclado, objetivos de 44 px y texto al 200 %. El registro examinado identifica HTML 20643b7…/CSS 22f179…; el último ajuste afecta únicamente al panel de fechas, sin modificar las acciones de nivel.
- Capturas revisadas: browser/home-1440.png y browser/home-390.png, además de visual/hero-join-390.png, visual/levels-390.png, visual/story-390.png y visual/booking-390.png.

La línea vertical inicial sobre niveles parecía un cursor: observación visual opcional, resuelta en el candidato mediante un acento horizontal de 44×3 px alineado con el contenido. No quedan correcciones solicitadas por este revisor.

## Revisión final del ajuste de fechas

Tras agruparse Marruecos, la etiqueta «Nivel según la fecha» se solapaba con el panel en 768 px y texto al 200 %. La diferencia de CSS 22f179… a 7daaf1c… contiene una única regla modificada: top pasa de 5em a 5.5em y max-height de calc(100% - 6em) a calc(100% - 6.5em). Los demás estilos, el override de estado y el HTML permanecen iguales. Al bajar el inicio y reducir la altura máxima en la misma cantidad se conserva el límite inferior reservado al título.

La evidencia final para Marruecos en ese escenario mide el borde inferior del badge en 1259.234 px, el inicio del panel en 1263.234 px y su final en 1398.234 px; el título comienza en 1424.234 px. Quedan 4 px de separación sobre el panel y 26 px antes del título. No hay desbordamiento horizontal y el contenido largo conserva desplazamiento. Las aserciones comprueban estas relaciones en los cinco anchos, texto normal/ampliado, sin JavaScript y listas largas.

No se repitieron los dieciséis escenarios de Más viajes porque la diferencia final no altera su control ni estilos. Se conserva su evidencia anterior con el hash correspondiente y se revisa por separado el incremento final. Sin bloqueos pendientes en este ajuste.

## Límites

Validación local en Chromium; no equivale a prueba de Safari/iOS físico, despliegue o medición de reservas. Las preferencias de estilo se han separado de los defectos funcionales. El efecto comercial no se ha medido y no se ha incorporado analítica.
