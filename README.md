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
- dist/trip.js: galería ampliable, teclado y retorno del foco.
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

Todas las tarjetas de la home enlazan a la página correspondiente. «Ver viaje» y «Me interesa» navegan dentro de la web; WhatsApp queda en las páginas de detalle y en los puntos de ayuda de la home. Se han retirado los paneles de detalle de las revisiones anteriores.

## Datos y estados comerciales

Solo El Salvador tiene una salida futura con datos verificados: 25/10–01/11/2026, siete noches, niveles II–III con autonomía y tarifa general de 1.499 € por persona en habitación compartida. Programa y dossier revisados el 09/10/2026. Disponibilidad por consultar; no se anuncian plazas restantes ni early bird sin confirmar su vigencia.

Asturias (06–08/11/2026) sigue siendo un ejemplo de diseño. La fecha es ficticia, está marcada en la tarjeta y página, y no se ofrece como viaje real. Su contacto pregunta por futuras salidas reales. Sustituir el ejemplo cuando se facilite el segundo viaje confirmado.

Azores, Euskadi, Marruecos y Cádiz tienen páginas completas de destino con próximas fechas, nivel y programa pendientes. Los recuerdos de viajes anteriores y sus fotos se presentan como tales. Sus servicios, alojamientos y precios anteriores no se trasladan a la nueva oferta. Para activar una salida real, actualizar el estado y todos los datos confirmados en data/trips.json y reconstruir las páginas. El sitio no se actualiza automáticamente.

## Consulta y reserva

El único canal comercial es WhatsApp, con enlaces wa.me y mensajes contextualizados. No hay formularios, campos de email, mailto, envío automático, pagos online, CRM, almacenamiento ni registro de intereses. «Me interesa» inicia una conversación; no suscribe a avisos automáticos. El visitante decide si edita y envía el mensaje.

Se conserva +34 648 18 92 57, el teléfono publicado por LST, pendiente de confirmación del cliente como receptor definitivo. La plaza se confirma con el equipo según las condiciones del viaje; abrir WhatsApp no constituye una reserva. No se prometen tiempos de respuesta, un depósito universal ni condiciones de cancelación no verificadas.

## Móvil y validación

La home ofrece tarjetas más compactas, acciones de al menos 44 px y niveles distribuidos en dos columnas en teléfono. Los detalles muestran destino, fecha y nivel en la portada de la salida confirmada; el precio y la consulta se mantienen accesibles en la barra inferior. El contenido sigue en una columna, con programa y dudas desplegables, galería deslizable y fotos ampliables. La zona inferior respeta safe-area-inset-bottom. A partir de 1000 px se usa una ficha lateral de consulta.

npm run check valida las siete páginas, enlaces locales entre páginas y anclas, imágenes y fuentes, contactos contextuales, estados de ejemplo/pendiente, noindex y sintaxis de JavaScript. La revisión 10 también se ha comprobado en navegador a 320, 390, 768, 1024 y 1440 px, con navegación home–viaje–calendario, menú, niveles, galería, retorno del foco y dudas.

El efecto sobre ventas requiere medición en producción. La propuesta permanece privada y con noindex,nofollow. No se añaden todavía CMS, automatizaciones ni políticas legales, y no se trasladan datos legales privados del cuestionario.
