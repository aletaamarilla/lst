# Home LST — acabado de cards de viajes,24/10/2026

Base Git58f338661fc4705364fea08727c836e79b3f2048, con trabajo previo sin commit. La nueva composición fotográfica está aprobada por el usuario; esta iteración modifica solo el acabado blanco de las cards de próximos destinos. Base exacta en before/, candidata en candidate.sha256.json, alcance en task.patch.

## Cambio

Cinco reglas de dist/home.css: superficie crema original; separación de14px tras fechas; pie tinta redondeado18px para precio/acción; precio y subtexto crema; hover del botón pasa a crema para seguir visible sobre tinta. Foto, botón fino, borde y sombra se conservan. El token lst-card solo lo consume home-trip. No se modifica HTML, datos, rutas, JS, portada, niveles o FAQ. scripts/check-home-browser.mjs adapta una única aserción de superficie.

## Validación

- npm run check:19 páginas PASS en candidata final (check.txt).
-166 comprobaciones browser PASS en320/390/768/1024/1440, texto200%, teclado/touch/hover, fechas largas, enlaces y sinJS (browser/results.json).
- Inspección visual propia de cards-1440.png y card-390.png. Estas capturas de componente ocultan la navegación fija solo para el recorte. Las capturas completas browser/home-1440.png y browser/home-390.png conservan navegación normal.
- Revisión independiente de diff, consumo, contraste/hover/foco y capturas en revision-independiente.md.

Validación local en Chromium, sin Safari/iOS físico ni publicación. No se afirma cambio en ventas; no se añade analítica ni nuevas dependencias. No se repiten pruebas de modelos/renderizado porque HTML/datos/generación son idénticos.
