# Acciones con apariencia de botón

Ajuste solicitado sobre el rediseño de tarjetas. «Ver viaje» y «Ver destino» reutilizan la clase `.button`: fondo naranja LST, borde oscuro y altura mínima de 44 px. Se conserva el enlace único que envuelve la tarjeta, sin botones anidados; el foco de la tarjeta sigue visible. Se ajusta el espaciado para mantener alineación entre acciones.

Producto modificado: `dist/index.html` y `dist/home-cards.css`. README y propuesta actualizados. Sin cambios en datos, portada, catálogo ni fichas; sin publicación ni push.

Validación ejecutada: `npm run check`, `git diff --check` y las 455 comprobaciones de `scripts/check-home-cards.mjs`, todas correctas. Cuatro anchos (320, 390, 768, 1440), texto al 200 %, navegación sin JS, fotos pulsables, teclado, foco y alineación. Inspección visual de 320 y 1440. No se repiten suites ajenas al ajuste. Esta corrección visual se revisó directamente; la revisión independiente anterior corresponde al diseño con acción subrayada.

Capturas actuales: [320](capturas/despues-320.png), [390](capturas/despues-390.png), [768](capturas/despues-768.png), [1440](capturas/despues-1440.png). [Resultados](browser-home.json), [check](check.log), [hashes](version.json), [diff del ajuste](diff.patch).
