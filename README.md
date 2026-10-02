# Let's Surf Together — propuesta de home

Proyecto independiente de Travelhood. Primera propuesta visual responsive, basada en el cuestionario entregado, los SVG originales y el material publicado por LST. Incluye únicamente la home y sus interacciones de demostración.

## Ejecutar

Requiere Node.js 20 o posterior, sin instalar dependencias:

```sh
npm run dev
```

Abrir `http://localhost:4175`. El servidor sirve exclusivamente `dist/` y añade Content-Type. `npm run check` valida sintaxis, referencias locales, anclas y marca de demostración. Los archivos de `dist/` son el código fuente de este prototipo estático y se versionan; no hay paso de compilación.

## Estructura

- `dist/index.html`: contenido semántico, componentes y formulario.
- `dist/styles.css`: sistema visual y adaptación responsive.
- `dist/app.js`: menú móvil, pestañas de nivel, panel de solicitud y simulación.
- `dist/assets/`: logos sin modificar, imágenes optimizadas y fuentes locales.
- `docs/content-inventory.json`: datos comerciales y pendientes para la futura migración a CMS.
- `docs/asset-provenance.json`: fuentes del material visual.
- `docs/propuesta.md`: decisiones y tres puntos prioritarios para revisar.

## Alcance y comportamiento

Los formularios están marcados como demostración: validan nombre, email y nivel en el navegador, muestran un resultado explícitamente simulado y borran los campos al cerrar. No hay red, almacenamiento, cookies, pagos ni conexión al CRM. Enlaces a la web original y contactos sí apuntan a destinos reales.

Solo El Salvador se presenta como próxima salida: 25/10–01/11/2026, 7 noches, nivel II–III y autonomía en el agua, 1.499 € en habitación compartida. No se muestran promociones ni plazas restantes. Asturias/Euskadi ya han pasado y Azores estaba en curso al consultar; sus futuras fechas figuran pendientes. Las fechas son una instantánea del 30/09/2026, no se actualizan solas.

No se copian al sitio los datos legales privados del cuestionario. `noindex,nofollow` evita tratar la propuesta como el sitio comercial definitivo. No se han implementado páginas interiores, políticas legales ni automatizaciones.

## Evolución a CMS

La lista `.trip-grid` admite cualquier número de fichas (4 columnas en escritorio, 2 en tablet, 1 en móvil). Los bloques de viaje, destino, nivel y FAQ están separados y pueden mapearse a documentos de Sanity. El inventario propone fechas ISO, precio numérico, niveles, requisitos, imagen y procedencia; disponibilidad desconocida es `null`, nunca una cifra supuesta. Las imágenes tienen proporciones y object-fit definidos para aceptar material de otros tamaños. En la siguiente fase conviene renderizar las fichas y opciones del formulario desde una única fuente del CMS.
