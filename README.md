# Let's Surf Together — home y viajes

Estado operativo 24/10/2026: web estática Node en Vercel `lts-laura-moreno-ferre/lst`, salida `dist/`; Sanity `q5bj2rn2/production`. [Guía actual de edición y publicación](docs/guia-cliente.md). Los apartados de revisiones siguientes conservan el historial; sus pendientes antiguos no describen necesariamente el estado actual.

Proyecto independiente de Travelhood. Web estática con la home, Conócenos, la guía de niveles y seis páginas de destino. Mantiene los logos originales, Aura, Work Sans, Space Mono y los colores de LST (#EA5934 / #FFFAE7 / #1B1B1B), a partir del cuestionario y los materiales del cliente.

## Ejecutar y editar

Requiere Node.js 20 o posterior, sin instalar dependencias.

```sh
npm run build
npm run check
npm run dev
```

Abrir http://localhost:4175. El servidor sirve exclusivamente dist/ con Content-Type. La home se edita en dist/index.html. Las páginas de viaje, catálogo, niveles y tarjetas de home se generan desde Sanity publicado mediante `scripts/build.mjs` con `npm run build`. `data/trips.json` se conserva como fixture de compatibilidad; la demo exige salida local explícita fuera de `dist/`. Las salidas HTML se versionan para despliegue estático. El comprobador verifica que no estén desactualizadas.

## Estructura

- dist/index.html: home, calendario y resumen de niveles.
- dist/conocenos/index.html: presentación, historia y forma de viajar de LST.
- dist/about.css: composición responsive de Conócenos, con cabecera y navegación compartidas.
- scripts/check-about.mjs: comprobaciones opcionales de navegador para Conócenos y sus entradas.
- dist/niveles/index.html: guía estática de los cuatro niveles, autonomía y orientación.
- dist/levels.css: estilos de la guía; reutiliza la cabecera y los tokens compartidos.
- dist/levels.js: destacado manual del nivel, filtros de viajes e historial.
- scripts/render-level-trips.mjs: bloque de destinos de la guía generado desde el JSON de viajes.
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

- /conocenos/

- /niveles/

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

npm test comprueba niveles por defecto, restricciones explícitas, fechas únicas y múltiples, precios y mensajes de consulta. npm run check valida las nueve páginas, enlaces locales entre páginas y anclas, imágenes y fuentes, contactos contextuales, contenido de demo y estados pendientes, noindex y sintaxis de JavaScript. La revisión 10 se comprobó en navegador a 320, 390, 768, 1024 y 1440 px, con navegación home–viaje–calendario, menú, niveles, galería, retorno del foco y dudas.

La revisión 11 se comprobó en navegador a 320, 390, 768 y 1440 px: gesto horizontal real en la galería móvil, botones y teclado, retorno del foco, apertura y cierre de varias fechas, dos enlaces de WhatsApp independientes interceptados sin contactar al equipo, niveles, posición del dossier y ausencia de desbordamiento horizontal.

La revisión 12 se comprueba a 320, 390, 768 y 1440 px: popup, foco y teclado, retorno a la posición de lectura, lista larga de fechas, consulta independiente de cada fecha, gesto horizontal de fotos, etiquetas sin flechas en móvil e inclusiones fijas. WhatsApp se intercepta durante las pruebas, sin contactar al equipo.

El efecto sobre ventas requiere medición en producción. La propuesta permanece privada y con noindex,nofollow. Esta fase inicial no añadía CMS, automatizaciones ni políticas legales, y no se trasladan datos legales privados del cuestionario.

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


## Revisión 20 · guía de niveles

`/niveles/` se edita directamente en `dist/niveles/index.html`. Presenta Rookies, Aprendices, Riders y Supercracks con anclas nativas, situaciones reconocibles y objetivos de trabajo; distingue técnica y autonomía y orienta a quien duda. No puntúa ni asigna niveles. Reutiliza la cabecera fija y `app.js` sin requerir pestañas en la nueva página.

El calendario y la duda de nivel en la home enlazan a la guía. Su resumen conserva las pestañas y lleva al ancla correspondiente. Las seis fichas actualizan el enlace desde `scripts/render-trips.mjs` y se reconstruyen con `npm run build`. La exploración de viajes continúa en `/#viajes`. Los datos provisionales, consultas comerciales y recursos de marca permanecen intactos.

El comprobador estático exige home, guía y las rutas derivadas de viajes, manteniendo las validaciones anteriores. `scripts/check-levels.mjs` añade navegador opcional con las mismas variables `LST_PLAYWRIGHT_MODULE`, `LST_CHROMIUM_PATH`, `LST_PREVIEW_URL` y `LST_QA_OUTPUT` de los comprobadores existentes. No añade dependencias.

[Texto final, fuentes, capturas, pruebas y revisión independiente](docs/qa/2026-10-12-niveles/README.md).


## Revisión 21 · guía de niveles como página definitiva

La guía se rediseña desde móvil: acceso a los cuatro niveles en la primera pantalla, fichas comparables con «En el agua», «Tu surf» y «Tu siguiente paso», fotografía de surf y una consulta explicada con un ejemplo. Se elimina toda navegación a las páginas antiguas; las fuentes quedan solo en la documentación interna. La técnica y la autonomía se explican por separado, sin asignar niveles ni añadir requisitos de viaje.

Se conservan los enlaces de entrada desde home y fichas, el calendario como exploración y WhatsApp como consulta. El comprobador impide introducir enlaces a contenido externo en esta guía. La evidencia anterior pertenece a la primera versión; [texto, capturas y validación de la versión actual](docs/qa/2026-10-12-niveles-redesign/README.md).


## Revisión 22 · navegación y viajes por nivel

«Niveles» aparece en las cabeceras de home, guía y seis fichas; en teléfono hay un acceso directo visible. Las anclas de nivel destacan la ficha y el índice. La selección describe qué está explorando el visitante, sin evaluar su surf ni asignarle un nivel. Se conserva el destacado nativo sin JavaScript y se respeta movimiento reducido.

Cada nivel enlaza al bloque «Viajes de surf por nivel» o a una consulta contextual por WhatsApp. `npm run build` genera el bloque entre `<!-- level-trips:start -->` y `<!-- level-trips:end -->` desde `data/trips.json`. No editar manualmente ese bloque: fechas, estados, niveles y autonomía siguen las mismas fuentes que las fichas. El resto de la guía se edita directamente en su HTML.

El filtro muestra destinos que declaran el nivel elegido, separando salidas con fecha de destinos por anunciar. El requisito adicional de autonomía queda visible. La selección se guarda únicamente en la URL y funciona al volver atrás o recargar; los enlaces de destino están en el HTML original. Para explorar todas las salidas sigue disponible el calendario de la home.

[Capturas, decisiones de SEO/conversión, pruebas y revisión de la versión actual](docs/qa/2026-10-12-niveles-conversion/README.md). Se conservan datos provisionales y noindex; sin publicación ni push.


## Revisión 23 · tarjetas y jerarquía de consulta

Las tarjetas de nivel separan identidad, descripción, situaciones y siguiente paso. WhatsApp deja de ser un enlace discreto: las cuatro tarjetas ofrecen un botón de contraste alto, icono y etiqueta explícita, junto a la exploración de viajes. El nivel elegido mantiene su destacado también al recibir foco.

Los viajes con fecha quedan visibles; los destinos pendientes pasan a «Otros destinos por anunciar», un desplegable nativo accesible con teclado y sin JavaScript. Su contador sigue el filtro elegido. La ayuda se unifica en el bloque final «¿Encaja tu nivel? Lo vemos contigo», que conserva el contexto del nivel para WhatsApp. [Capturas y validación de la versión actual](docs/qa/2026-10-12-niveles-ajustes/README.md).


## Revisión 24 · destacado breve y acciones compactas

Al activar un nivel del índice, su cabecera se destaca durante 1,1 segundos después de llegar con el scroll y recupera su aspecto habitual. El filtro de viajes conserva su contexto, sin mantener ninguna tarjeta coloreada. Los botones «Ver viajes» y «WhatsApp» comparten fila desde 320 px con áreas de pulsación de al menos 44 px; al ampliar el texto pueden apilarse para conservar legibilidad.

El desplegable «Otros destinos por anunciar» aísla sus estilos de las preguntas frecuentes: título y contador permanecen horizontales y solo gira el icono. [Capturas y comprobaciones de esta revisión](docs/qa/2026-10-13-niveles-pulido/README.md).


## Revisión 25 · tarjetas de viajes de la home

Las seis tarjetas de `/#viajes` muestran fotografía sin etiquetas, destino, fecha o «Próximamente», duración y nivel cuando corresponde. El Salvador conserva la autonomía exigida. Cada tarjeta es un único enlace nativo al detalle con acción de botón naranja y foco de teclado. Se retiran del resumen los precios, descripciones y notas de disponibilidad; permanecen en las fichas.

La home sigue editándose directamente en `dist/index.html`. `dist/home-cards.css` se carga solo allí y limita sus reglas a las tarjetas de `#viajes`; no cambia la portada, la guía con filtros ni las fichas generadas. Las filas móviles de destinos pendientes se apilan al ampliar el texto. `scripts/check-home-cards.mjs` añade validación opcional de navegador con el runtime externo ya utilizado por los otros comprobadores.

[Comparación a 390 y 1440 px, comprobaciones a 320 y 768 px, evidencia y límites](docs/qa/2026-10-13-tarjetas-home/README.md). Se conserva el trabajo previo, incluidos niveles y páginas nuevas. Sin commit, push, publicación ni despliegue.


## Revisión 26 · Conócenos

`/conocenos/` desarrolla la presentación de LST, el viaje de prueba que Lucas propuso a su comunidad en Marruecos, la forma de viajar, el acompañamiento y el respeto al lugar. Se edita directamente en `dist/conocenos/index.html`. Conserva Aura, Work Sans, Space Mono, logos y fotografía documental; usa `styles.css`, `mobile.css` y `app.js`, con estilos propios en `about.css`.

La home conserva un resumen y enlaza desde su presentación, cabecera y pie. La guía de niveles incluye Conócenos en su menú. Las seis fichas enlazan desde acompañamiento y pie; la ficha de Marruecos conserva su testimonio. La antigua referencia general a Sobre LST pasa a la ruta nueva. Los enlaces históricos de destinos se conservan.

No se identifican caras ni se publican cargos o credenciales sin respaldo. La firma de Lucas pasa al relato completo. Recogidas de plásticos, Universal Plastic y 3 % siguen pendientes de confirmación en el inventario. No cambian los datos de viajes, las consultas de WhatsApp ni `noindex,nofollow`.

[Texto final, fuentes, archivos, capturas, comprobaciones y pendientes](docs/qa/2026-10-13-conocenos/README.md). Sin publicación, despliegue ni push.


## Catálogo de viajes · 13/10/2026

`/viajes/` reúne los seis destinos con filtros inmediatos por nivel (Todos, I · Rookies, II · Aprendices, III · Riders, IV · Supercracks) y estado (Todos, Con fecha, Próximamente). Combina ambos filtros, muestra el número de destinos, permite limpiar y ofrece consulta por WhatsApp si no hay resultados. «Con fecha» no indica disponibilidad de plazas.

El HTML de la página se edita en `dist/viajes/index.html`, excepto el bloque `<!-- catalog:start -->` / `<!-- catalog:end -->`, generado por `scripts/render-catalog.mjs` desde `data/trips.json`. Usa `levelsFor` y `tripFacts` del modelo existente: no hay otra lista manual de destinos ni cálculo de disponibilidad. `dist/catalog-filter.js` contiene la lógica pura compartida con los tests; `dist/catalog.js` aplica el filtro sobre los valores resueltos del HTML. `dist/catalog.css` limita sus estilos a esta página.

`?nivel=1`, `2`, `3` o `4` preselecciona el nivel; un valor inválido equivale a Todos. Los cambios guardan nivel y estado (`estado=confirmed` / `upcoming`) en la URL para recarga e historial. Sin JavaScript, los seis destinos y sus enlaces siguen en el HTML; los controles de filtrado se ocultan.

La home conserva su calendario y añade «Ver todos los viajes». Niveles conserva su contenido, anclas, orientación y bloque de destinos; sus cuatro botones «Ver viajes» abren el catálogo con el nivel numérico correspondiente. Conócenos enlaza al catálogo. Las rutas de detalle y la lógica de selección de fechas se mantienen. Los cambios concurrentes de FAQs/navegación se conservan y se distinguen en el informe.

`npm run build`, `npm test` y `npm run check` incluyen generación, pruebas de filtrado y detección de catálogo desactualizado. `scripts/check-catalog.mjs` es una suite opcional de navegador con el runtime externo existente, sin dependencias añadidas. [Archivos, capturas, versión, casos y límites](docs/qa/2026-10-13-catalogo/README.md).


## Preguntas frecuentes · 13/10/2026

`/preguntas-frecuentes/` agrupa ocho dudas existentes en cuatro temas. La home conserva tres y enlaza a la página completa. Las condiciones que dependen del destino remiten a `/viajes/` y sus fichas; la orientación enlaza a `/niveles/` y la forma de viajar a `/conocenos/`. Las seis fichas conservan sus preguntas específicas y los datos comerciales provisionales.

La página se edita en `dist/preguntas-frecuentes/index.html`, con estilos acotados en `dist/faq.css`. Los desplegables nativos permiten abrir varias respuestas; solo carga el `app.js` compartido. La cabecera ofrece Viajes, Niveles, Conócenos y FAQs, y el logo lleva a Inicio. La experiencia y Cómo reservar siguen accesibles en home y pie. Al desactivar JavaScript se muestra navegación nativa adicional y la cabecera permanece arriba mediante `sticky`, conservando su altura en el flujo.

`scripts/check-faqs.mjs` comprueba la página y la integración en navegador usando el mismo runtime externo opcional del proyecto. `npm run check` incluye las once rutas, las entradas a FAQs, enlaces y noindex. [Preguntas finales, fuentes, archivos, capturas, resultados y pendientes](docs/qa/2026-10-13-faqs/README.md). Sin publicación, despliegue ni push.


## Sanity Studio · LTS

Studio publicado en https://lets-surf-together.sanity.studio/, con código independiente en `studio/`, conectado al proyecto **LTS** (`q5bj2rn2`), dataset **production**, organización `oCsOalTXP`. Requiere Node.js >=22.12.

```sh
npm --prefix studio ci
npm run studio:dev
```

Abrir http://localhost:3333 e iniciar sesión con una cuenta que tenga acceso al proyecto de Sanity. El esquema inicial «Viajes de surf» permite editar destino, portada, niveles, salidas, precios, inclusiones, exclusiones, preguntas frecuentes y dossier. Las salidas no tienen precios ni niveles comerciales predeterminados.

```sh
npm run studio:check
npm run studio:build
npm run studio:deploy
```

`studio:deploy` publica el Studio en Sanity Hosting y lo registra en el proyecto. La CLI utiliza la sesión local de `sanity login`; para CI, configurar `SANITY_AUTH_TOKEN` como secreto, nunca en el código ni en variables públicas. El identificador de la aplicación desplegada queda en `studio/sanity.cli.ts`.

La web se genera desde contenido publicado de Sanity. El adaptador convierte imágenes, salidas y objetos editoriales al modelo de los componentes existentes. Las ocho salidas permanecen en preparación local; no se han importado. El catálogo publicado vacío no utiliza las demostraciones como respaldo. Consulta [operación e importación](docs/sanity/2026-10-23/implementation/README.md) y [validación de esta implementación](docs/qa/2026-10-23-sanity/README.md).

Administración: https://www.sanity.io/manage/project/q5bj2rn2

## Catálogo Sanity · 23/10/2026

`npm run build` consulta una sola vez `q5bj2rn2/production` con perspectiva publicada y valida antes de sustituir `dist/`. Un error aborta conservando la salida anterior; un catálogo vacío se muestra explícitamente, conservando las URLs anteriores con un aviso de contenido no publicado. `npm run check` valida el snapshot público generado, rutas, enlaces y coherencia de las cuatro vistas.

```sh
npm test
npm run build
npm run check
npm run sanity:import
```

La última orden solo simula y valida las ocho salidas locales. La comprobación remota de colisiones requiere credencial privada con lectura de borradores; ningún borrador se crea sin `--check-remote --apply`. No se ha ejecutado esa combinación. La lectura de producción usa exclusivamente `SANITY_READ_TOKEN` si hace falta; la importación usa `SANITY_IMPORT_TOKEN`, independiente y solo disponible en el proceso de importación. Nunca usar prefijos públicos ni colocar credenciales en `dist/`, Studio o Git.

Para repetir la presentación anterior de forma aislada: `npm run build:demo -- --out=/tmp/lst-demo` y `node scripts/check.mjs --dir=/tmp/lst-demo --demo`. Esta opción no puede escribir la demo en `dist/`.
