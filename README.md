# Let's Surf Together — home y viajes

Proyecto independiente de Travelhood. Web estática con la home y seis páginas de destino. Mantiene los logos originales, Aura, Work Sans, Space Mono y los colores de LST (#EA5934 / #FFFAE7 / #1B1B1B), a partir del cuestionario y los materiales del cliente.

## Ejecutar y editar

Requiere Node.js 20 o posterior, sin instalar dependencias.

```sh
npm run build
npm run check
npm run dev
```

Abrir http://localhost:4175. El servidor sirve exclusivamente dist/ con Content-Type. La home se edita en dist/index.html. Las páginas de viaje se generan desde data/trips.json y scripts/render-trips.mjs con npm run build. Las salidas HTML se versionan para despliegue estático. El comprobador verifica que no estén desactualizadas.

## Estructura

- dist/index.html: home, calendario y guía de niveles.
- dist/styles.css: estilos y tokens originales compartidos.
- dist/mobile.css: composición de la home desde teléfono, con mejoras para pantallas mayores.
- dist/app.js: menú móvil y pestañas de nivel.
- data/trips.json: seis destinos, estados, textos, imágenes y mensajes de consulta.
- scripts/render-trips.mjs: plantilla común para páginas independientes.
- dist/viajes/*/index.html: páginas publicadas de los seis viajes.
- dist/trip.css: diseño de detalle desde móvil, barra inferior y ficha lateral de escritorio.
- dist/trip.js: galería horizontal, popup de fechas, teclado, bloqueo de scroll y retorno del foco.
- scripts/trip-model.mjs: niveles, salidas, precios y mensajes por fecha.
- scripts/trip-model.test.mjs: pruebas de fechas únicas/múltiples, niveles y consultas.
- dist/assets/: material documental de LST, logos sin modificar y fuentes locales.
- docs/content-inventory.json: datos comerciales, fuentes y pendientes.
- docs/asset-provenance.json: procedencia del material visual.
- docs/propuesta.md: decisiones de diseño de cada revisión.

## Rutas

- /viajes/el-salvador/
- /viajes/asturias/
- /viajes/azores/
- /viajes/euskadi/
- /viajes/marruecos/
- /viajes/cadiz/

Todas las tarjetas de la home enlazan a la página correspondiente. «Ver viaje» y «Ver destino» navegan dentro de la web; WhatsApp queda en las páginas de detalle y en los puntos de ayuda de la home. Se han retirado los paneles de detalle de las revisiones anteriores.

## Datos y estados comerciales

Solo El Salvador tiene una salida futura con datos verificados: 25/10–01/11/2026, siete noches, niveles II–III con autonomía y tarifa general de 1.499 € por persona en habitación compartida. Programa y dossier revisados el 09/10/2026. Disponibilidad por consultar; no se anuncian plazas restantes ni early bird sin confirmar su vigencia.

Asturias es la demo solicitada para presentar al cliente: dos salidas (06–08/11 y 20–22/11/2026), 349 € por persona, dos noches, todos los niveles y programa/inclusiones de demostración. Por petición expresa, la interfaz las presenta igual que una salida confirmada, sin etiquetas de muestra. `demoData` conserva internamente la procedencia y los campos que se sustituirán antes del lanzamiento; no son nuevas fechas comerciales verificadas.

Azores, Euskadi, Marruecos y Cádiz tienen páginas completas de destino con próximas fechas y programa pendientes; sus niveles están configurados como I–IV. Los recuerdos de viajes anteriores y sus fotos se presentan como tales. Sus servicios, alojamientos y precios anteriores no se trasladan a la nueva oferta. Para activar una salida real, actualizar el estado y todos los datos confirmados en data/trips.json y reconstruir las páginas. El sitio no se actualiza automáticamente.

## Fechas y niveles configurables

Cada viaje contiene `departures`, una lista de salidas con `id`, `date`, `start`, `end`, `duration`, `price` opcional y `state`. Una fecha conserva el acceso directo a WhatsApp. Con varias fechas, «Elegir fecha» abre un único popup: desde abajo en móvil y centrado en pantallas mayores. La lista interior admite scroll para muchas salidas; las fechas no se despliegan dentro de la página o la ficha lateral. Cada salida tiene un enlace «Consultar» con destino y fecha en el mensaje, y admite un precio distinto. Una lista vacía muestra las fechas por anunciar.

`levels` admite varios valores entre 1 y 4. Si falta o está vacío, se usa «Todos los niveles». El Salvador conserva [2, 3] y el requisito de autonomía; los otros cinco destinos tienen [1, 2, 3, 4] por indicación del cliente. Los niveles ya están configurados aunque el programa de una próxima salida siga pendiente.

El dossier se enlaza desde la ficha de reserva de escritorio y desde el resumen de reserva en móvil. Se retiran la navegación interna entre plan/nivel/inclusiones y el enlace al PDF dentro del programa. Las acciones en móvil usan texto sin flechas decorativas. Las inclusiones y exclusiones son bloques estáticos siempre visibles. La galería conserva el gesto horizontal y sus controles se llaman Anterior, Siguiente y Cerrar.

## Consulta y reserva

El único canal comercial es WhatsApp, con enlaces wa.me y mensajes contextualizados. No hay formularios, campos de email, mailto, envío automático, pagos online, CRM, almacenamiento ni registro de intereses. «Consultar plaza», «Consultar destino» y «Consultar por WhatsApp» inician una conversación; no suscribe a avisos automáticos. El visitante decide si edita y envía el mensaje.

Se conserva +34 648 18 92 57, el teléfono publicado por LST, pendiente de confirmación del cliente como receptor definitivo. La plaza se confirma con el equipo según las condiciones del viaje; abrir WhatsApp no constituye una reserva. No se prometen tiempos de respuesta, un depósito universal ni condiciones de cancelación no verificadas.

## Móvil y validación

La home ofrece tarjetas más compactas, acciones de al menos 44 px y niveles distribuidos en dos columnas en teléfono. Los detalles muestran destino, fecha y nivel en la portada de la salida confirmada; el precio y la consulta se mantienen accesibles en la barra inferior. El contenido sigue en una columna, con programa y dudas desplegables, galería deslizable y fotos ampliables. La zona inferior respeta safe-area-inset-bottom. A partir de 1000 px se usa una ficha lateral de consulta.

npm test comprueba niveles por defecto, restricciones explícitas, fechas únicas y múltiples, precios y mensajes de consulta. npm run check valida las siete páginas, enlaces locales entre páginas y anclas, imágenes y fuentes, contactos contextuales, contenido de demo y estados pendientes, noindex y sintaxis de JavaScript. La revisión 10 se comprobó en navegador a 320, 390, 768, 1024 y 1440 px, con navegación home–viaje–calendario, menú, niveles, galería, retorno del foco y dudas.

La revisión 11 se comprobó en navegador a 320, 390, 768 y 1440 px: gesto horizontal real en la galería móvil, botones y teclado, retorno del foco, apertura y cierre de varias fechas, dos enlaces de WhatsApp independientes interceptados sin contactar al equipo, niveles, posición del dossier y ausencia de desbordamiento horizontal.

La revisión 12 se comprueba a 320, 390, 768 y 1440 px: popup, foco y teclado, retorno a la posición de lectura, lista larga de fechas, consulta independiente de cada fecha, gesto horizontal de fotos, etiquetas sin flechas en móvil e inclusiones fijas. WhatsApp se intercepta durante las pruebas, sin contactar al equipo.

El efecto sobre ventas requiere medición en producción. La propuesta permanece privada y con noindex,nofollow. No se añaden todavía CMS, automatizaciones ni políticas legales, y no se trasladan datos legales privados del cuestionario.

## Revisión 13 · WhatsApp y legibilidad móvil

La navegación se despliega hasta 999 px y contiene «Consultar por WhatsApp», con el mismo teléfono y mensaje general de la cabecera. Desde 1000 px se conserva el acceso de escritorio. El botón precede al menú en el orden de teclado; Escape, la salida del foco y la navegación cierran el panel.

Los destinos pendientes de la home usan «Ver destino»; sus fichas usan «Consultar destino». Las notas, fechas, estados y condiciones de precio tienen tamaños diferenciados de 12–14 px. La barra de consulta reserva su altura real; pasa al flujo al superar el 25 % de la altura visible para permitir leer con texto ampliado. El selector conserva sus consultas por fecha y desplaza todo el panel cuando su cabecera y ayuda no dejan espacio suficiente para la lista.

La evidencia, límites, capturas antes/después y ejecución opcional del comprobador de navegador están en [el informe de revisión](docs/qa/2026-10-12-whatsapp/README.md). No se añaden dependencias al proyecto.

## Revisión 14 · experiencia y presentación de LST

La apertura conserva «Surfear juntos sabe mejor» y añade una frase sobre aprendizaje, grupo, descubrimiento y acompañamiento. «Así viajamos con LST» concreta la experiencia; «Todo empezó en Marruecos» conserva el origen de Lucas y lo enlaza con «Hoy, un equipo que viaja contigo». La firma «Nos vemos en el pico» se mantiene.

Las fichas dejan de repetir el origen. Las dos salidas con fecha usan `team.title` y `team.text` de `data/trips.json`, limitados a las funciones ya descritas en cada programa. El generador usa un texto de consulta si no hay equipo documentado; en los cuatro destinos pendientes no atribuye un equipo ni servicios al próximo viaje. No se alteran escenarios, fechas, precios, inclusiones o consultas.

Fuentes, texto final, datos de equipo pendientes y validación de esta revisión: [informe de presentación](docs/qa/2026-10-12-presentacion/README.md). El inventario conserva la trazabilidad del cuestionario y los textos específicos.

## Revisión 15 · comunidad y prueba social

La experiencia empieza por la duda de llegar por tu cuenta. Dos extractos breves aportan evidencia distinta dentro del bloque existente: Laura sobre viajar sin compañía, con su contexto de Marruecos, y Ainhoa sobre aprender mediante correcciones en vídeo. Su reseña no indica destino y solo aparece en la home. La foto de surfskate se identifica como Cádiz, 2024; el relato de cultura y paisajes se presenta como recuerdo de Laura.

La ficha de Marruecos conserva únicamente la voz correspondiente a ese destino y añade contexto histórico al extracto. Se reconstruyen las seis fichas; las otras cinco producen HTML idéntico. Datos provisionales, WhatsApp, equipo, fotografías, marca y cambios anteriores se conservan. [Selección, fuentes, texto final, capturas y validación](docs/qa/2026-10-12-comunidad/README.md). No se ha publicado ni hecho push.

## Revisión 16 · respeto al lugar y al océano

«El lugar también importa» añade un único bloque breve al cierre de la presentación de LST. Recupera el respeto al océano, a los surfistas locales y a sus costumbres como principios de marca. No modifica las fichas ni sus datos provisionales.

Las fuentes antiguas publican recogidas de plásticos, una colaboración con Universal Plastic y una aportación del 3 % por reserva. No se ha acreditado su vigencia ni ejecución en las fuentes disponibles. El inventario distingue publicación documentada de acción verificada y contiene tres textos concretos para revisión, con la confirmación necesaria para cada uno. [Texto, fuentes, pendientes y validación local](docs/qa/2026-10-12-responsabilidad/README.md).

## Revisión 17 · equilibrio visual y lectura

Se conserva la portada de la home y el orden de las siete páginas. Las fotos de grupo y aprendizaje recuperan su encuadre; Azores y Cádiz separan la imagen del título. Asturias y Euskadi ajustan únicamente su portada móvil. Tarjetas, precios y encabezados del programa admiten texto ampliado sin solaparse. Se conservan los textos revisados, datos provisionales, fuentes, logos, colores e interacciones.

`heroLayout: "group"`, `heroPositionMobile` y `heroMinHeightMobile` son campos visuales opcionales de `data/trips.json`, consumidos por el generador. No describen servicios ni cambian estados comerciales.

[Comparación antes/después, decisiones conservadas, archivos y validación local](docs/qa/2026-10-12-equilibrio/README.md). No se ha hecho commit, push, publicación ni despliegue.

## Revisión 18 · integración final independiente

Revisada la home y las seis fichas sobre la candidata anterior sin commit. No se observaron regresiones que requirieran cambios de producto. `npm run build`, `npm test` y `npm run check` pasan; se añaden pruebas actuales en Chromium, 140 vistas en los cinco anchos solicitados con pantalla baja/texto ampliado, recorridos por los seis destinos y revisión independiente de contenido. Las consultas se interceptan localmente.

[Tabla de comprobaciones, capturas, versión, alertas contrastadas y límites](docs/qa/2026-10-12-final/README.md). Se conservan los datos provisionales y el historial. El cierre de esta fase no valida un lanzamiento: datos definitivos, contenido pendiente, migración de URLs, indexación y medición quedan anotados para una fase posterior.

## Revisión 19 · cabecera fija

La cabecera de la home permanece fija en móvil y escritorio. Conserva la transparencia al inicio de la portada y muestra fondo crema, logo oscuro y acceso de WhatsApp naranja desde el primer desplazamiento. La separación de las anclas se calcula con la altura real de la cabecera para mantener visibles las secciones con texto ampliado.

Validación sobre la base `d9b7201`: build, tests y check pasan. Chromium comprobó 16 vistas entre 320 y 1440 px, incluida pantalla baja y texto al 200 %, primer scroll, anclas, menú móvil y regreso arriba. Revisión independiente del diff final sin bloqueos. No se alteran las fichas, los datos de viajes ni sus consultas.
