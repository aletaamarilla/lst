# Let's Surf Together — propuesta de home

Proyecto independiente de Travelhood. Primera propuesta visual responsive, basada en el cuestionario entregado, los SVG originales y el material publicado por LST. Incluye la home, un escenario de diseño con dos salidas y cuatro destinos pendientes, y enlaces de consulta por WhatsApp.

## Ejecutar

Requiere Node.js 20 o posterior, sin instalar dependencias:

```sh
npm run dev
```

Abrir `http://localhost:4175`. El servidor sirve exclusivamente `dist/` y añade Content-Type. `npm run check` valida sintaxis, referencias locales, anclas y ausencia de formularios, enlaces de WhatsApp y aviso de salida de ejemplo. Los archivos de `dist/` son el código fuente de este prototipo estático y se versionan; no hay paso de compilación.

## Estructura

- `dist/index.html`: contenido semántico, viajes y enlaces de WhatsApp.
- `dist/styles.css`: sistema visual y adaptación responsive.
- `dist/app.js`: menú móvil, pestañas de nivel y panel informativo de El Salvador.
- `dist/assets/`: logos sin modificar, imágenes optimizadas y fuentes locales.
- `docs/content-inventory.json`: datos comerciales y pendientes para la futura migración a CMS.
- `docs/asset-provenance.json`: fuentes del material visual.
- `docs/propuesta.md`: decisiones y tres puntos prioritarios para revisar.

## Alcance y comportamiento

Todo el contacto comercial se realiza por WhatsApp, mediante enlaces `wa.me` con un mensaje preparado para cada destino y para orientación. No hay formularios, campos de email, enlaces mailto, envío automático, almacenamiento, cookies, pagos ni CRM. El visitante decide si edita y envía el mensaje en WhatsApp. Se utiliza +34 648 18 92 57, el número de contacto publicado por LST; está pendiente confirmar con el usuario que es el receptor de WhatsApp definitivo.

El diseño solicitado muestra dos fichas grandes de salidas con fecha y cuatro destinos próximamente. Solo El Salvador tiene datos reales confirmados en las fuentes: 25/10–01/11/2026, 7 noches, nivel II–III y autonomía, 1.499 € en habitación compartida; disponibilidad por consultar. Asturias (06–08/11/2026) es una salida de ejemplo, identificada tanto en la ficha como en su mensaje de WhatsApp. Sus fechas son ficticias y no constituyen una oferta confirmada. No se inventan precio, nivel ni plazas. Sustituir el ejemplo por el segundo viaje real cuando el cliente lo facilite.

Azores, Euskadi, Marruecos y Cádiz representan cuatro destinos sin salida futura confirmada, sin fechas, precios ni reservas. Son destinos de viajes pasados de LST, utilizados para completar el escenario visual. El contenido es una instantánea y no se actualiza automáticamente.

No se copian al sitio los datos legales privados del cuestionario. `noindex,nofollow` evita tratar la propuesta como el sitio comercial definitivo. No se han implementado páginas interiores, políticas legales ni automatizaciones.

## Evolución a CMS

La lista `.departure-list` muestra las dos salidas en paralelo en escritorio y apiladas en móvil. `.destination-list` muestra cuatro destinos: cuatro columnas en escritorio, dos en tablet y fichas horizontales en móvil. El inventario distingue expresamente los datos reales del escenario de diseño. En la siguiente fase conviene generar fichas y mensajes de WhatsApp desde una única fuente del CMS, con estados confirmado/pendiente y ejemplos excluidos del sitio comercial.
