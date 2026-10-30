# Home: CTA final, enlaces y próxima fecha — 24 oct 2026

Base Git: 58f3386. Cambio local sin commit sobre un árbol que ya tenía modificaciones de otras tareas.

Alcance propio: dist/index.html, dist/home.css, scripts/render-home-trips.mjs, scripts/home-trips.test.mjs y scripts/check-home-browser.mjs. Se mantuvieron intactos los destinos, precios, URLs y la lista completa de salidas.

Resultado: «¿Qué nivel tienes?»; cierre con «Ver viajes» naranja y «Pregúntanos» por WhatsApp a la derecha; pie con enlaces de texto; tarjetas con «Próx. fecha» a la izquierda y rango abreviado a la derecha. El panel de fechas conserva los rangos completos. Los rangos de septiembre de cuatro letras están contemplados.

Comprobaciones: npm run check, 24 páginas; npm test, 66/66 (incluye 8/8 de home-trips); scripts/check-home-browser.mjs, 249 comprobaciones en 320, 390, 768, 1024 y 1440 px, texto al 200%, teclado, hover, tap y sin JS. Capturas en visual/. La revisión independiente de la versión final no encontró bloqueos.

SHA-256 final:
- dist/index.html: 0e22dc9fd3d848ed0d27bf52f841f446f3d67fafcd34d22c5dfecb560ef6d7d7
- dist/home.css: 5d0671eb4f3b44231b3fc219524a4835011977b433c423075ccfb40c5be76a6f
- scripts/render-home-trips.mjs: b05f4c0ff3ec6b4fae4285970c862a897c77108cae8e3df1b06d0872ea9db557
- scripts/home-trips.test.mjs: 3104f85e75449542cb80dd874eb4132969c32246109f6f4bb38e28bfbac448c2
- scripts/check-home-browser.mjs: 4f7ece398135a23cef699da1c4395a84cd0b12a2933079c807c26602ca0cc7a4
