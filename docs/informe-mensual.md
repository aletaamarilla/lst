# Informe mensual de LST

Rutina para informar cada mes de cómo va la web y los anuncios. Tarda unos 30 minutos. El diseño de fondo está en `docs/superpowers/specs/2026-11-22-auditoria-analitica-panel-design.md`. Los enlaces y los identificadores de Google no se guardan en Git.

## Dónde está cada cosa

- **Informe de Data Studio** «Let's Surf Together · Cómo va la web»: lee GA4 (visitas y acciones de la web), Search Console (búsquedas en Google) y la hoja de cálculo.
- **Hoja de Google** «LST · datos del informe»: pestaña `meta` (gasto de los anuncios). La pestaña `solicitudes` existe pero no se usa: el informe no cuenta inscripciones de Brevo.
- **Periodo del informe:** siempre el mes natural cerrado, hora de Madrid, comparado con el mes anterior.

## Primeros días del mes

1. **Anuncios.** En el Administrador de anuncios de Meta, exporta el mes cerrado por campaña y por día con estas columnas, y pégalo en la pestaña `meta`: Día, ID de campaña, Campaña, Importe gastado, Impresiones, Clics en el enlace, Conversaciones iniciadas. En la columna Destino escribe `whatsapp`, `perfil` o `web` según adónde lleve cada campaña (se rellena una vez por campaña).
2. **Primer pegado.** La hoja lleva una fila de ejemplo («EJEMPLO borrar») que solo sirvió para que Data Studio viera las columnas: borrarla al pegar los datos reales. Los tipos de columna ya están fijados (Día como fecha; importes, impresiones, clics y conversaciones como número); si se añade una columna, en el informe: Recurso → Administrar fuentes de datos → «LST · datos del informe - meta» → Actualizar campos.

## Antes de enviar

1. Abre el informe con el periodo del mes cerrado (páginas «Cómo va la web», «Anuncios» y «Búsquedas en Google»).
2. Comprueba que las visitas de Google en GA4 guardan proporción con los clics de Search Console del mismo mes (Search Console no depende del aviso de cookies, GA4 sí). Una caída brusca de esa proporción indica que algo ha dejado de medirse: se investiga antes de enviar nada.
3. En la página interna «Salud de la medición», revisa el reparto de visitas por tipo de tráfico, los errores del formulario por motivo, que no haya botones sin clasificar (`unclassified`) y la comparación de «Organic Search» con los clics de Search Console. Esa página no va en el envío al cliente.
4. Las «Solicitudes enviadas» del informe son las que GA4 midió, es decir, de visitas que aceptaron la medición: puede haber más en Brevo. Dilo así al cliente; no se concilia con Brevo.

## Enviar al cliente

1. Descarga el PDF de las páginas para el cliente (Archivo → Descargar → PDF), o programa el envío desde Compartir → Programar el envío.
2. Añade tres o cuatro líneas de lectura: qué ha cambiado respecto al mes anterior, qué campaña ha funcionado mejor y qué se hace el mes siguiente.
3. Aclara siempre en el informe que las visitas de la web son solo de quien aceptó la medición, y que Meta cuenta clics mientras GA4 cuenta visitas medidas: nunca coinciden.

## Lectura correcta de las cifras

- Las acciones de una ficha (ver fechas, ir a inscripción, WhatsApp) no son un embudo: pueden ocurrir en cualquier orden.
- «Solicitudes enviadas» es lo que Brevo aceptó y GA4 midió, solo del público (el tráfico del equipo no cuenta), y no es una plaza confirmada. «Idas a inscripción» es el paso al formulario, no una reserva.
- En la tabla de viajes, «Vistas del viaje» son las visitas a la ficha y «Visitas a la inscripción» las de la página del formulario; no se suman.
- Los anuncios actuales llevan a WhatsApp o a mensajes, no a la web: GA4 no los ve. Para esas campañas solo valen las cifras de Meta (gasto, impresiones, clics y conversaciones iniciadas). Si algún día hay una campaña con destino `web`, las etiquetas de campaña de `docs/superpowers/specs/2026-11-22-auditoria-analitica-panel-design.md` (parte 3) permiten verla en GA4.
- Visitas del equipo: abrir una vez `?equipo=1` en cada dispositivo las marca como internas (`?equipo=0` lo deshace). Las «Solicitudes enviadas» ya las excluyen; el resto de cifras las cuentan hasta que se activen los filtros de tráfico interno de GA4, lo que se decide con datos reales porque no se puede deshacer.
