# Recuperación de promociones en localhost · 25/10/2026

Localhost vuelve a mostrar los descuentos en inicio, niveles, catálogo y detalle, conservando los últimos rediseños. Implementación y validación local terminadas; no se publica la web ni se modifican documentos de Sanity.

## Causa y corrección

La salida `dist` se había reconstruido correctamente desde documentos publicados para respetar la publicación aplazada, pero esa era también la salida que servía localhost. Como las siete tarifas estaban en borradores, su presentación desaparecía de las cuatro vistas. Los archivos de estilos y los rediseños permanecían en el árbol. Además, el catálogo utilizaba la variante anterior del componente compartido, que omitía la franja de ahorro y el precio general tachado.

`npm run dev` activa ahora una copia privada local, si existe `artifacts/local-trip-preview.json`. Esa copia contiene los ocho documentos publicados retenidos, con únicamente promociones y notas de precio de los siete borradores ya revisados. Se adapta mediante la whitelist del catálogo. El servidor regenera las cuatro vistas desde las plantillas actuales en cada petición; así conserva cambios posteriores en títulos, estilos o fotografías. No escribe en `dist` ni en Sanity, no requiere una credencial en el navegador y enlaza la previsualización a 127.0.0.1.

El catálogo pide la variante compacta del mismo renderer que inicio y niveles; sus h2 reciben la misma regla que los h3/h4. Se conservan filtros, identificadores propios, enlaces y controles de fechas. Las fotos mantienen la altura actual de 260 px, que procede del ajuste anterior solicitado por el usuario. El detalle conserva su diseño y sus cuatro ubicaciones de precio; vuelve a recibir las promociones en la vista local.

## Separación de publicación

`npm run preview` sigue sirviendo exactamente `dist`. `npm run build` sigue usando únicamente Sanity publicado. La copia privada está ignorada por Git y fuera de la raíz HTTP; su snapshot adaptado se identifica como `sanity-local-preview`. Si no existe la copia, desarrollo sirve `dist`; si existe pero es inválida, el arranque falla de forma visible. La copia es una captura del 25/10/2026 y no sincroniza futuros cambios de Sanity automáticamente.

Se regeneró `dist` con la fuente publicada retenida, comprobando equivalencia profunda con el snapshot existente. Solo cambió `dist/viajes/index.html`, por la nueva variante de la card. `dist` continúa con seis destinos y cero promociones. [Registro del build](build.json). No se han publicado los siete borradores ni la web; no hay commit ni push.

## Evidencia

- [83/83 pruebas](tests.txt), incluidas tres nuevas: ofertas coherentes en cinco rutas (incluida una histórica), publicación byte a byte intacta en modo estándar, archivos privados inaccesibles por HTTP y configuración local ausente/inválida. La prueba del precio general se ajustó para admitir su texto accesible; no hubo que modificar el detalle.
- [24 páginas comprobadas](check.txt), con enlaces, anclas, recursos y consumidores generados.
- [12 vistas de navegador](browser/browser.json): inicio, niveles, catálogo y El Palmar a 320/390/1440; sin desbordamiento, cinco cards de oferta en cada colección, misma tipografía/altura de foto y controles de 44 px. El detalle conserva ahorro, cupo y general tachado.
- [Interacciones](browser/interactions.json): filtrar diciembre deja solo El Palmar con su oferta; abrir fechas y cerrar con Escape; navegar de card a detalle conserva la tarifa; filtrar Rookies muestra solo viajes que admiten nivel I.
- [Captura de inicio](browser/home-1440.png), [catálogo](browser/catalog-1440.png), [niveles móvil](browser/levels-390.png) y [detalle](browser/detail-1440.png), con fotos reales.
- [Revisión independiente cerrada](review.json) por `/root/review_early_bird`: sin bloqueos identificados. Contrastó hashes, fuentes, consumidores, copia local y las cuatro capturas; ejecutó 24 pruebas propias. Comprobó además el proceso real de localhost desde Ubuntu, mientras [runtime.json](runtime.json) registra el acceso desde Windows: cuatro rutas con 200 y cabecera de previsualización, archivo privado con 404, y salida de publicación sin ofertas.

Base Git `58f338661fc4705364fea08727c836e79b3f2048`, cambios sin commit. [Manifiesto](version.json) con seis archivos fuente (uno nuevo: `scripts/local-preview.test.mjs`) y un HTML generado. [Diff de esta tarea](task.patch) contra los [snapshots iniciales](before/). Se conserva el trabajo previo del checkout. La comprobación de whitespace de los seis cambios pasa.

La validación de navegador se limita al navegador integrado/Chromium y a los tamaños indicados; no equivale a una comprobación en Safari o dispositivos físicos. El estado remoto no cambia en esta corrección.
