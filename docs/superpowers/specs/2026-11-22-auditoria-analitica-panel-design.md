# Auditoría de analítica, anuncios y panel mensual

Fecha: 22/11/2026 · Tamaño: proyecto, en cuatro partes que se hacen en orden.

Amplía `2026-11-19-analitica-ga4-design.md`. **Las secciones anteriores a «Cambio de rumbo» usan los nombres de eventos de la primera versión (vocabulario de Travelhood); manda «Cambio de rumbo».** Donde los dos documentos se contradigan, manda este; al terminar la parte 1 se corrige la tabla de eventos del anterior.

## Por qué

Hay que informar cada mes al cliente (Let's Surf Together) de cómo funcionan su web y sus anuncios, y tener control de cómo evoluciona todo. El diseño del 19/11 se pensó solo para que el panel común `travelhood-admin` leyera tráfico: excluye la publicidad, no mide el formulario por dentro y lleva parámetros que en LST no aportan nada.

## Estado comprobado (22/11/2026)

- **No se mide nada todavía.** El proyecto de Vercel `lst` no tiene `GA4_MEASUREMENT_ID`, `SITE_URL` ni `SITE_INDEXABLE`; su único dominio es `lst-sepia.vercel.app`.
- `letsurftogether.com` sirve aún el WordPress antiguo, sin Analytics, Tag Manager ni píxel de Meta.
- No hay histórico: cambiar nombres y parámetros ahora no rompe nada. Después del lanzamiento sí.
- La propiedad de GA4 existe y está configurada como recoge el documento anterior.
- LST se anuncia solo en Instagram/Meta.

## Objetivos

- Eventos justos: cada uno alimenta un gráfico del panel o una decisión.
- Saber qué campaña y qué anuncio trae visitas, contactos y solicitudes.
- Un panel de Looker Studio en lenguaje llano, por mes natural cerrado, que el cliente entienda sin explicación.
- Una página interna que avise si la medición se rompe o pierde cobertura.

No objetivos: píxel de Meta, remarketing y API de conversiones; Tag Manager; métricas orgánicas de Instagram (seguidores, alcance); conciliar plazas confirmadas o ingresos; el adaptador comercial de `travelhood-admin`; mapas de calor.

Anti-objetivos: medir sin consentimiento; enviar datos personales o del formulario; llamar «reserva» a una solicitud o «ingresos» al precio de un viaje; presentar las acciones de una ficha como un embudo obligatorio; sumar cifras que se solapan; mostrar un cero donde en realidad no hay medición.

## Enfoques considerados

1. **Etiquetas de campaña en GA4, sin píxel — elegido.** Cada anuncio lleva una etiqueta que Meta rellena sola; GA4 atribuye visitas y conversiones; el gasto llega al panel por una exportación mensual a una Hoja de Google. No cambia el aviso de cookies. Meta no puede optimizar hacia solicitudes ni hacer remarketing.
2. Lo mismo más el píxel de Meta con consentimiento publicitario. Mejora el rendimiento de las campañas, no el informe; exige aviso de dos categorías, política nueva y acceso al píxel del cliente. Queda para cuando el volumen lo justifique: se añade como una categoría más del aviso.
3. Tag Manager, medición desde servidor o conector de pago: configuración fuera del repositorio que los tests no cubren, o coste mensual, para un informe que es mensual.

Elegido por Antonio el 22/11 tras preguntar cuál era mejor: su objetivo es informar y controlar, y con el tráfico de una agencia pequeña el píxel apenas tendría datos para optimizar.

## Parte 1 · Eventos (código)

Se mantiene el vocabulario de Travelhood y `measurement_version="1"`: nada se ha publicado aún, así que no hay cambio de significado que versionar. Todos los envíos siguen llevando `measurement_version`, `traffic_type` y `page_type`.

### Lista final

| Acción | Evento | Parámetros propios | Cambio |
| --- | --- | --- | --- |
| Vista de ficha | `destination_view` | `destination_slug` | — |
| Abrir fechas y precios | `destination_dates_price_interaction` | `destination_slug`, `cta_location` | — |
| Abrir el PDF | `destination_pdf_download` | `destination_slug`, `cta_location` | — |
| WhatsApp en ficha o inscripción | `destination_whatsapp_click` | `destination_slug`, `cta_location` | — |
| Ir a la inscripción | `destination_booking_click` | `destination_slug`, `cta_location` | pierde `booking_provider` |
| WhatsApp fuera de un viaje | `whatsapp_click` | `cta_location` | pierde `whatsapp_topic`; incluye el botón de las FAQ |
| Llegar a un paso del formulario | `registration_form_step` | `destination_slug`, `form_step` | **nuevo** |
| Solicitud aceptada por Brevo | `registration_form_accepted` | `destination_slug`, `trip_id` | gana `trip_id` |
| Solicitud enviada que falla | `registration_form_error` | `destination_slug`, `error_category` | — |
| Terminar el test de nivel | `level_test_complete` | `surf_level` | **nuevo** |
| Ir a Instagram o al grupo de WhatsApp | `social_click` | `link_type` | **nuevo** |

### Qué se quita y por qué

- `booking_provider`: en LST siempre vale `own_form`.
- `faq_contact_click`: un evento para un solo botón. Pasa a ser `whatsapp_click` con `cta_location=faq_contact`.
- `whatsapp_topic`: fuera de las fichas solo toma valores que ya dicen `page_type` y `cta_location` (`orientacion`, `nivel`, `conocenos`, `preguntas-frecuentes`).

### Qué se añade y cuándo se dispara

- **`registration_form_step`**: la primera vez, en cada carga de la página, que la visita llega a los pasos 2, 3, 4 o 5 del formulario. `form_step` es el número del paso alcanzado, como texto. El paso 1 es la propia vista de la página de inscripción. No se envía qué campo falla ni nada escrito. `registration.js` avisa con un evento de documento, igual que ya hace con el envío aceptado o fallido.
- **`trip_id` en `registration_form_accepted`**: la salida marcada al enviar, escrita como el viaje más su fecha de inicio (por ejemplo `maldivas-2027-03-21`). No se usa la clave interna de la salida (`data-departure-id`): en una salida creada en el Studio es un código al azar que en el panel no diría nada. La fecha viaja en `data-departure-start`. Mismo significado que en Travelhood: `trip_id` es la salida, `destination_slug` el viaje.
- **`level_test_complete`**: cuando el test da un resultado por haber respondido, tanto el de la home (tres preguntas) como el de `/niveles/`. `surf_level` es el nivel principal, de `"1"` a `"4"`. No se dispara al elegir el nivel a mano en la guía ni al recuperar un resultado guardado. Repetir el test cuenta otra vez.
- **`social_click`**: clic en un enlace a `instagram.com` (`link_type=instagram`) o a `chat.whatsapp.com` (`link_type=whatsapp_group`). Es comunidad, no contacto comercial; va aparte.

### Lo que no se toca

- Las ubicaciones de botón (`cta_location`) y el test que impide publicar un botón sin clasificar. Son la «lista exacta de ubicaciones» que pide el estándar común; el panel las agrupa en comerciales y otras.
- `traffic_type` con sus tres valores: coinciden con los filtros nativos de GA4 (tráfico interno por parámetro, desarrollador por `debug_mode`).
- El consentimiento: nada de Google se carga hasta aceptar; publicidad siempre denegada.

### Atribución hasta que se acepta el aviso

Hoy, si alguien llega desde un anuncio, navega y acepta el aviso en la segunda página, GA4 arranca ahí: la etiqueta de campaña ya no está en la dirección y la visita cuenta como directa. Para un informe de anuncios eso es perder justo a las visitas más interesadas.

Mientras no haya elección guardada, `analytics.js` anota en `sessionStorage` (solo esa pestaña, solo esa visita) los parámetros `utm_*` con los que se llegó y la página de procedencia si es de otro dominio. Al aceptar en una página posterior, la configuración de GA4 recibe la dirección actual con esos `utm_*` añadidos (`page_location`) y la procedencia original (`page_referrer`). Al aceptar o rechazar, la anotación se borra; si la elección se hizo en otra pestaña, se usa una vez como mucho y se borra en la siguiente página. No sale nada del navegador sin consentimiento.

### Marcar las visitas del equipo

Abrir cualquier página con `?equipo=1` pone la cookie `lst_analytics_internal=1` durante un año; `?equipo=0` la quita. Sustituye al comando de consola del README. El cliente solo tiene que abrir un enlace una vez en cada dispositivo. El parámetro desaparece de la dirección en cuanto se abre: si alguien copiara el enlace marcado a un cliente o a una historia, todas esas visitas saldrían del informe durante un año.

### Textos y pruebas

- Política de cookies: una frase sobre la anotación de la procedencia durante la visita.
- README y documento del 19/11: tabla de eventos al día.
- `analytics-browser.test.mjs`: fuera las comprobaciones de lo eliminado; dentro, pasos del formulario, `trip_id`, test de nivel, enlaces de comunidad, procedencia conservada entre páginas y enlace de equipo. El recorrido de todas las páginas publicadas se mantiene.

## Parte 2 · GA4 y Search Console (configuración)

Se hace en el navegador con la sesión de Google de Antonio, confirmando cada cambio.

- **Dimensiones de evento:** añadir `form_step`, `surf_level`, `link_type`. Cambiar la descripción de `trip_id` a «salida». Archivar `booking_provider`, `whatsapp_topic` y `departure_id`.
- **Eventos clave:** `registration_form_accepted` (una vez por evento) y `destination_whatsapp_click` (una vez por sesión).
- **Retención de datos:** 14 meses en vez de los 2 por defecto.
- **Sin cambios:** medición mejorada solo con vistas de página, Google Signals desactivado, zona `Europe/Madrid`, filtro de tráfico interno en prueba hasta ver datos reales.
- **Search Console:** propiedad de dominio para `letsurftogether.com` al lanzar. Si el cliente ya la tiene, basta con que añada a Antonio como usuario.

## Parte 3 · Anuncios

- **Etiqueta fija en cada anuncio** (campo «Parámetros de URL» de Meta):
  `utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}`
  Meta sustituye lo que va entre llaves. El panel reconoce un anuncio por `utm_medium=paid_social` y une con el gasto por `utm_id`.
  La etiqueta solo existe en anuncios creados en Ads Manager con la web como destino. Una publicación promocionada desde la aplicación de Instagram, o un anuncio que lleva al perfil o a WhatsApp, no pasa por la web: GA4 no puede verlo.
- **Enlaces sin pagar** (biografía, historias): `?utm_source=instagram&utm_medium=social&utm_campaign=bio` o `historias`, para separarlos de los anuncios.
- **Hoja de Google «LST · datos del informe»**, en la cuenta de Antonio:
  - pestaña `meta`: Día, ID de campaña, Campaña, Destino (`web`, `perfil` o `whatsapp`), Importe gastado, Impresiones, Clics en el enlace. Sale de una exportación guardada de Ads Manager, por campaña y por día; Destino se rellena a mano una vez por campaña.
  - pestaña `solicitudes`: Mes, Solicitudes recibidas. Es el número de inscripciones que el cliente ha recibido de verdad ese mes, contado por él como las vea (Brevo es suyo; el formulario crea o actualiza un contacto, así que «contactos nuevos» puede quedarse corto). Si un mes no hay cifra, la casilla se deja vacía.

## Parte 4 · Panel de Looker Studio

Fuentes: la propiedad de GA4, Search Console y la Hoja. Periodo por defecto: mes anterior completo, comparado con el mes previo. Todas las páginas para el cliente filtran `traffic_type=external`. Etiquetas en castellano llano, sin nombres técnicos de eventos.

1. **Resumen.** Visitas medidas, visitas con contacto por WhatsApp, idas al formulario, solicitudes medidas y solicitudes reales (Brevo). Evolución diaria de visitas. Tabla por canal: orgánico, Instagram sin pagar, anuncios, directo, otros.
2. **Anuncios.** Gasto, impresiones y clics (Meta) junto a visitas medidas, contactos y solicitudes (GA4). Tabla por campaña con coste por contacto y por solicitud, solo para campañas con destino `web`; tabla por anuncio. Las campañas que llevan al perfil o a WhatsApp van en una tabla aparte con las cifras de Meta y sin columnas de la web. Nota fija: Meta cuenta clics y GA4 cuenta visitas que aceptaron la medición; nunca coinciden.
3. **Viajes.** Por viaje: vistas de ficha, fechas y precios, PDF, WhatsApp, idas a inscripción y solicitudes, como cifras sueltas. Solicitudes por salida. El formulario paso a paso (este sí es una secuencia). Resultados del test por nivel.
4. **Buscadores.** Clics, impresiones, CTR y posición media; consultas y páginas principales; búsquedas con el nombre de la marca frente al resto.
5. **Salud de la medición** (interna, no va en el envío al cliente). Reparto por `traffic_type`; cobertura (visitas de Google orgánico en GA4 entre clics de Search Console, que es la referencia; y, cuando haya cifra, solicitudes medidas entre solicitudes recibidas); errores del formulario por categoría; clics sin clasificar; peso del tráfico directo.

Donde falte un dato de la Hoja, el panel muestra «No disponible», nunca cero.

```
RESUMEN · octubre 2026 · hora peninsular · solo visitas que aceptaron la medición

 Visitas medidas    Con contacto WhatsApp    Idas al formulario    Solicitudes
     1.240  ▲12%          86  ▲8%                 41  ▼3%          9 medidas · 14 reales

 Visitas por día  ▁▂▃▅▃▂▃▆▇▅▃▂▃▄▅

 Canal                 Visitas   Con contacto   Solicitudes
 Anuncios Instagram      520         38             4
 Buscadores              310         27             3
 Instagram sin pagar     190         12             1
 Directo y otros         220          9             1
```
(cifras inventadas, solo para ver la forma)

Contacto «comercial» en el panel: `destination_whatsapp_click` en las ubicaciones propuestas en el documento del 19/11, provisional hasta que LST confirme la lista.

Looker Studio no tiene forma de crear informes por programa: se monta a mano en el navegador. Se puede construir con tráfico de pruebas en cuanto GA4 reciba eventos; las cifras se validan con datos reales tras el lanzamiento.

## Rutina mensual

1. Primeros días del mes: exportar el mes cerrado de Ads Manager y pegarlo en la pestaña `meta`; anotar las solicitudes recibidas que diga el cliente.
2. Abrir «Salud de la medición»: si la cobertura frente a Search Console cae o hay errores de formulario, se investiga antes de enviar nada. Que falte la cifra del cliente no retrasa el envío.
3. Looker Studio envía el PDF de las páginas 1 a 4 a Antonio; él añade tres o cuatro líneas de lectura y lo reenvía al cliente.

## Decisiones tomadas por mí, para revisar

1. Mantener el vocabulario de Travelhood y la versión `"1"`.
2. `trip_id` significa salida, como en Travelhood, aunque en la propiedad de LST se registró como viaje.
3. No enviar importes: el estándar común pide no convertir el precio de un viaje en ingresos, y solicitudes por viaje y salida ya lo dicen.
4. No medir el filtro por nivel, la galería, el desplazamiento ni la apertura de preguntas: no alimentan ningún gráfico ni decisión. El test de nivel ya dice qué niveles tiene el público.
5. Anotar la procedencia en `sessionStorage` antes del consentimiento. No sale del navegador y se borra al elegir, pero es una decisión de postura legal.
6. Enlace `?equipo=1` para marcar al equipo.
7. Eventos clave: solicitud aceptada y WhatsApp de ficha; el WhatsApp de orientación no.
8. Datos de Meta por exportación mensual, sin conector.
9. Sin segunda herramienta de analítica: la cobertura se estima con Search Console, que no depende del aviso, y con la cifra del cliente cuando exista.
10. Las campañas que no llevan a la web se informan aparte, solo con cifras de Meta, en vez de mezclarlas en el coste por solicitud.
11. La cifra real de solicitudes la da el cliente; no se intenta leer Brevo ni se cambia nada en su cuenta.

## Queda para quien lo construya

Estructura interna del código y forma de los tests; tipo de cada gráfico, colores y composición del panel dentro del orden de páginas descrito; sintaxis de campos calculados y combinaciones de datos; dónde vive la guía de la rutina mensual. Las variables entre llaves de la etiqueta y los campos `page_location` y `page_referrer` están comprobados en la documentación de Meta y de Google el 22/11; aun así, antes de dar por buena la procedencia conservada hay que ver en GA4 que una visita aceptada en la segunda página sale con su campaña, y antes de dar por buena la etiqueta, que un anuncio real llega con los nombres ya sustituidos. En esa misma comprobación de GA4: una llegada sin etiquetas desde un buscador aceptada en la segunda página (depende solo de `page_referrer`) y una campaña con espacios en el nombre.

## Cambio de rumbo · medición propia de LST (22/11/2026)

Antonio aclara que el panel de LST es de Data Studio y no el admin compartido de Travelhood: no hace falta calcar su vocabulario. **Sustituye a la decisión 1 de este documento y a la tabla de eventos de la parte 1.** Nada se había publicado ni había datos, así que renombrar sale gratis.

Criterios: nombres de GA4 donde existen, lo que Data Studio lee sin trucos, y ningún evento que se pueda sacar de otro.

| Qué pasa | Evento | Parámetros propios |
| --- | --- | --- |
| Ver una ficha, la home o cualquier página | `page_view` (nativo) | `page_type` y `destination_slug` ya viajan en todos los envíos. Una vista de ficha es `page_view` con `page_type=trip`; la inscripción lleva el mismo `destination_slug` con `page_type=registration` |
| Contacto por WhatsApp (en cualquier página) | `whatsapp_click` | `cta_location` |
| Ir al formulario de inscripción | `registration_click` | `cta_location` |
| Abrir fechas y precios | `dates_open` | `cta_location` |
| Abrir el PDF del programa | `pdf_click` | `cta_location` |
| Llegar a un paso del formulario | `registration_step` | `form_step` |
| Solicitud aceptada por Brevo | `generate_lead` (recomendado por GA4) | `trip_id` (salida) |
| Solicitud enviada que falla | `registration_error` | `error_category` |
| Terminar el test de nivel | `level_test_complete` | `surf_level` |
| Instagram o grupo de WhatsApp | `social_click` | `link_type` |

- **Se quitan:** `measurement_version` (solo servía al admin compartido), `destination_view` (el `page_view` de una ficha ya lleva su `destination_slug`), y la distinción entre `destination_whatsapp_click` y `whatsapp_click`: un solo evento, y la ficha se sabe por `destination_slug`.
- **`destination_slug` viaja en todos los envíos** de las páginas de un viaje, incluidas las vistas de página; ya no hace falta repetirlo en cada evento.
- **Ubicaciones de botón (`cta_location`):** de 25 valores a once grupos con sentido para el cliente: `header`, `reserve`, `departure`, `mobile_bar`, `trip_info`, `registration`, `levels`, `help`, `faq`, `closing`, `footer`. Todos los WhatsApp cuentan como contacto; no hay lista «comercial» frente a «otros».
- **`traffic_type`** se queda: es lo que usan los filtros de tráfico interno y de desarrollador de GA4.
- **Eventos clave en GA4:** `generate_lead` (ya existe por defecto) y `whatsapp_click` (una vez por sesión). Se retiran los dos creados antes con los nombres de Travelhood.
- **Dimensiones de GA4:** se mantienen las ya registradas (`destination_slug`, `cta_location`, `page_type`, `traffic_type`, `error_category`, `trip_id`, `form_step`, `surf_level`, `link_type`) y se archiva `measurement_version`.
- **Panel:** se rehacen sus filtros y rótulos con estos nombres, sin los filtros heredados de Travelhood; páginas: cómo va la web, viajes, búsquedas en Google, anuncios y salud de la medición.

## Respuestas de Antonio (22/11/2026)

- **Los anuncios los crea Antonio en Ads Manager y llevan a WhatsApp o a mensajes, no a la web.** Hoy ningún anuncio pasa por la web y GA4 no puede decir nada de ellos. Cambia las partes 3 y 4:
  - La pestaña `meta` añade la columna «Conversaciones iniciadas» y todas las campañas actuales llevan Destino `whatsapp`.
  - La página «Anuncios» del panel se apoya en las cifras de Meta: gasto, impresiones, clics, conversaciones iniciadas y coste por conversación, por campaña. Las columnas de la web (visitas medidas, contactos, solicitudes) solo aparecerán si algún día hay una campaña con destino `web`.
  - La etiqueta de campaña queda preparada para ese caso; hoy no se pega en ningún anuncio. Sí sirve desde ya para los enlaces sin pagar (biografía, historias).
  - Lo que la web puede decir de Instagram se limita a esos enlaces sin pagar.
- **Brevo queda fuera (decisión del 22/11, «no hace falta Brevo»).** El informe no cuenta inscripciones de Brevo ni lleva cifra real: «Solicitudes enviadas» es lo que GA4 midió (`generate_lead`), solo de visitas que aceptaron la medición, y así se dice en el informe mensual. Antes se había planteado que la contara Antonio. Queda por fijar en qué vista de Brevo se cuenta, con la cautela de que un contacto que repite se actualiza en vez de crearse; se decide mirando la cuenta al empezar la parte 3.

## Estado de GA4 y Search Console tras la parte 2 (22/11/2026)

Aplicado en la propiedad de LST con la sesión de Antonio y comprobado recargando cada pantalla. Los identificadores siguen fuera de Git.

- **Conservación de datos de eventos:** 14 meses (antes 2).
- **Eventos clave creados:** `registration_form_accepted` (una vez por evento) y `destination_whatsapp_click` (una vez por sesión), los dos sin valor predeterminado. GA4 proponía 1 dólar por evento; se quitó para no inventar importes. Siguen los cuatro que Google crea por defecto (`purchase`, `generate_lead`, `qualify_lead`, `close_convert_lead`), que la web no envía.
- **Dimensiones de evento (10):** `measurement_version`, `traffic_type`, `page_type`, `destination_slug`, `cta_location`, `error_category`, `trip_id` (ahora «LST salida»), y las nuevas `form_step` («LST paso formulario»), `surf_level` («LST nivel test») y `link_type` («LST tipo enlace»).
- **Archivadas:** `booking_provider`, `whatsapp_topic` y `departure_id`. No se pueden restaurar, solo volver a registrar.
- **Search Console:** la propiedad de dominio `letsurftogether.com` ya estaba verificada en la cuenta de Antonio y tiene historial de la web anterior (172 clics y 3.230 impresiones en tres meses, posición media 9,1). Sirve de referencia para vigilar el cambio de web.
- **Sin tocar:** medición mejorada, filtros de datos, Google Signals, zona horaria.

## Estado tras el cambio de rumbo (22/11/2026)

- **Código:** `dist/analytics.js` ya emite el vocabulario propio (255 pruebas en verde; comprobado en navegador real: el `page_view` de una ficha llega con `destination_slug` y `page_type`, sin `measurement_version`).
- **GA4:** eventos clave `generate_lead` (el de Google, ya existía) y `whatsapp_click` (una vez por sesión); desmarcados los dos con nombres de Travelhood; archivada `measurement_version`. Quedan nueve dimensiones: `page_type`, `destination_slug`, `traffic_type`, `cta_location`, `error_category`, `trip_id`, `form_step`, `surf_level`, `link_type`.
- **Panel:** filtros y campos de Travelhood sustituidos por los de LST (ver «Estado del panel y la hoja»).

## Estado del panel y la hoja (22/11/2026)

- **Hoja «LST · datos del informe»** creada en la cuenta de Google que usa el navegador de trabajo (la misma que tiene GA4 y Search Console): pestañas `meta` y `solicitudes`. `meta` lleva **una fila de ejemplo** (campaña «EJEMPLO borrar», 01/11/2026, 10 € de gasto, 1.000 impresiones, 20 clics, 2 conversaciones) que hay que borrar al pegar la primera exportación real; está solo para que Data Studio viera las columnas.
- **Informe de Data Studio «Let's Surf Together · Cómo va la web»**, creado como copia del de Travelhood y adaptado. Fuentes: «LST · Analytics», «LST · Search Console» y «LST · datos del informe - meta». El original de Travelhood no se ha tocado.
- **Páginas:**
  1. *Cómo va la web*: personas, visitas, solicitudes enviadas (`generate_lead`), clics a WhatsApp (`whatsapp_click`), idas a inscripción (`registration_click`), visitas por día, móvil u ordenador, de dónde vienen y una tabla viaje por acción. Sus filtros se rehicieron con los nombres de LST («Solo clics a WhatsApp», «Solo idas a inscripcion», «Solo solicitudes enviadas», «Solo vistas, WhatsApp e inscripcion», «Solo paginas de un viaje»).
     - *Tabla viaje por acción* («Qué viajes interesan más»): la columna «Acción» es un campo calculado con cuatro valores: «Vistas del viaje» (`page_view` con `page_type=trip`), «Visitas a la inscripción» (`page_view` con `page_type=registration`), «Idas a inscripción» (`registration_click`) y «Contactos por WhatsApp» (`whatsapp_click`). Una vista de ficha no es cualquier `page_view` con `destination_slug`: así no se mezclan fichas e inscripciones.
     - *Solicitudes enviadas* solo cuenta `generate_lead` con `traffic_type=external`, así que las pruebas del equipo no suman aunque no se haya abierto `?equipo=1`. El resto de tarjetas sí cuentan el tráfico del equipo hasta que se activen los filtros de tráfico interno y de desarrollador de GA4 (se activan, y son irreversibles, cuando haya datos reales; se decide después del lanzamiento).
  2. *Anuncios*: gasto, conversaciones iniciadas y tabla por campaña y destino con importe, impresiones, clics y conversaciones. Lee la hoja `meta`.
  3. *Búsquedas en Google*: clics, apariciones, CTR, posición media y consultas; con datos reales de la web anterior.
  4. *Salud de la medición* (interna, no va en el envío al cliente): visitas por tipo de tráfico (público, equipo, pruebas), errores al enviar la inscripción por motivo, botones pulsados por lugar (vigilar el valor `unclassified`) y visitas por canal, para compararlas con los clics de Search Console. Sin datos hasta el lanzamiento.
  Se eliminó la página «Campañas» heredada (duplicaba la primera con campos de Travelhood).
- **Fuente de GA4 refrescada:** se quitaron los campos de Travelhood (TH Destino, TH Fecha de salida…) y quedan los nueve de LST, más las métricas de eventos clave `keyEvents.generate_lead` y `keyEvents.whatsapp_click`.
- **Pendiente en el informe:** comprobar con datos reales que la tabla viaje por acción, el origen del tráfico y los filtros rinden. Las credenciales de las fuentes son «de lector»: quien abra el informe necesita acceso propio a GA4 y Search Console.

## Depende de Antonio o del cliente

- Lanzar: `GA4_MEASUREMENT_ID`, `SITE_URL` y `SITE_INDEXABLE` en Production de Vercel, y el dominio.
- Sesión de Google con acceso a GA4, Looker Studio y Search Console.

La parte 1 no depende de nada de esta lista.
