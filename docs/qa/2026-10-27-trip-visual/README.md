# Detalle más compacto y visual · 27/10/2026

Segunda iteración local solicitada por el usuario. No hay commit, push ni despliegue. Base Git compartida: `58f338661fc4705364fea08727c836e79b3f2048`, con el trabajo previo conservado. [Manifest final](candidate-sha256.json), [diff propio de fuentes](task-source-diff.patch), [copias previas](before/), [estado Git inicial](git-before.txt).

## Cambios y criterios

- Eliminados del HTML el bloque de cifras «El tiempo fuera / Tu nivel / El grupo» y la barra de navegación de secciones del contenido. La navegación opcional queda en el desplegable de la ficha lateral.
- Portada con nombre y rango de nivel únicamente; miniaturas visibles debajo, selección actual, click, flechas, Home/End, desplazamiento horizontal y sincronización con el gesto táctil. Las miniaturas son enlaces nativos a cada foto y funcionan también sin JavaScript. Las galerías de una sola fotografía no añaden controles redundantes.
- Portada reducida a 490 px en escritorio y 360 px en teléfono. Tarjetas de actividades/spots de 238 px en escritorio y 216 px en teléfono, con fotos de 148/132 px. Fotos de alojamiento de 300×200 px en escritorio y 244×164 px en móvil. Dimensiones comprobadas en navegador.
- Nueva composición clara con verde profundo, tarjetas blancas y WhatsApp verde. Retirados el salmón y los acentos naranja del detalle. Encabezados más legibles, una fotografía real compacta en el plan de surf y controles de reserva visibles en sidebar o dock móvil.
- Conservado el orden: ubicación/datos breves, breadcrumb, por qué el destino, para quién, actividades, spots, plan de surf, alojamiento, incluido/no incluido, FAQs, CTA y relacionados. Se conserva la fecha visible en móvil y la fotografía de portada solo contiene nombre y nivel como texto editorial.
- Se mantienen inscripción, mensajes de WhatsApp, PDF por fecha, promociones, precios, requisitos de autonomía, estados pendientes/completos y rutas históricas.

Referencias visuales consultadas: [Aleta Amarilla](https://www.aletamarilla.com/viajes-de-buceo/bali-penida-volcanes-mantas) y [Travelhood](https://travelhood.es/destino/maldivas/). Se tomó como referencia la navegación fotográfica, el tamaño de las tarjetas, la lectura de contenido y el acceso persistente a reserva, respetando los contenidos de LST. No se trasladaron sus condiciones comerciales.

## Validación

- [Pruebas](tests.txt): 132/132 pasan; dos casos nuevos comprueban la cobertura de miniaturas, la eliminación de bloques y las galerías de una/ninguna foto.
- [Check](check.txt): 40 páginas correctas, incluyendo coherencia de HTML generado, enlaces/anclas/recursos, contacto, catálogo y sintaxis.
- [Regeneración](build.txt): 15 rutas de viaje desde el snapshot publicado existente. [Comparación](data-compatibility.json): el catálogo sigue idéntico, sin escrituras en Sanity.
- [Chrome](browser/trip-visual-browser.json): 35 combinaciones (siete viajes × 320/390/768/1024/1440 px), sin overflow global; medidas compactas y header móvil en una fila. Click y selección de miniaturas sin salto vertical, teclado y visibilidad horizontal, swipe real, gestos de actividades/spots/alojamiento, inscripción, fechas/PDFs, Escape, foco, anclas y alternativa sin JavaScript. Cero errores de página.
- [Revisión independiente](independent-review.md): comprobaciones propias, sin hallazgos pendientes; [versión revisada](independent-candidate-sha256.json).

Capturas: [portada escritorio](browser/visual-final-desktop-opening.png), [actividades](browser/visual-final-desktop-activities.png), [plan de surf](browser/visual-final-desktop-surf-plan.png), [alojamiento](browser/visual-final-desktop-stay.png), [portada móvil](browser/visual-final-mobile-opening.png), [página móvil](browser/visual-final-mobile.png).

## Alcance y publicación

Cambian `scripts/render-trips.mjs`, `dist/trip.js`, `dist/trip-detail.css`, las pruebas de comportamiento y las 15 fichas generadas. No cambian datos ni esquema de Sanity. Las fotos de alojamiento orientativas de la iteración anterior se conservan identificadas.

La vista está en [Marruecos local](http://localhost:4175/viajes/marruecos/). La web sigue pendiente de despliegue. No se enviaron mensajes ni formularios. La conexión Windows–WSL fue intermitente y las pruebas se completaron tras recuperar el servicio, con resultados guardados por etapas. No se ha medido una mejora de conversión.
