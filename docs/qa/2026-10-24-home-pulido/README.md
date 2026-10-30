# Home LST — textos y pulido visual, 24/10/2026

Candidato local sin commit ni publicación. HEAD: 58f338661fc4705364fea08727c836e79b3f2048. El repositorio ya contenía otros cambios; esta iteración se compara con las copias exactas de before/, no con todo el diff de main.

## Alcance

Cinco archivos: dist/index.html, dist/home.css, scripts/render-home-trips.mjs, scripts/home-trips.test.mjs y scripts/check-home-browser.mjs. Identificación por SHA-256 en candidate.sha256.json; diff acotado en task.patch. No se añaden recursos gráficos ni dependencias.

## Criterios y evidencia

- Portada a sangre, luminosa y con un solo CTA: «Viajes de surf en grupo» y «¿Te vienes a surfear?». Colores y tipografías originales (naranja #EA5934, crema #FFFAE7, tinta #1B1B1B; Aura, Work Sans, Space Mono). Comprobaciones de navegador de fuente, colores, logo, foto fullbleed y h1; capturas finales.
- «Próximos destinos». Tarjetas con borde/sombra sutil y «Ver viaje» naranja de al menos 44px. Sin requisitos largos bajo la foto; las condiciones exactas permanecen al abrir fechas y en la ficha. Prueba de render y navegación táctil/teclado verifican el resumen y el detalle.
- Textos más directos en experiencia, niveles y reserva. «Lo que opina la gente que ha viajado» sobre tinta, seguido de niveles sobre crema, con foto lateral y cuatro tarjetas conservadas.
- Cierre conserva «El siguiente recuerdo está por hacer» y usa «Nos vemos en el pico.». Las frases rechazadas se retiran.
- Contratos conservados: ocho rutas de viaje, precios, fechas, niveles, filtros, disponibilidad, contacto por WhatsApp y menú. app.js, home.js y las ocho fichas generadas son idénticos a la iteración anterior, ver manifiesto.

## Validación ejecutada

- npm test:53/53 PASS, unit-tests.txt.
- npm run build: fuente sanity-published, 8 salidas, build.txt.
- npm run check: 19 páginas, enlaces, anclas, recursos y sintaxis, check.txt.
- scripts/check-home-browser.mjs: 106 comprobaciones PASS a 320/390/768/1024/1440 px, texto 200%, hover, tap, teclado, Escape, panel con 18 fechas, precio por confirmar, enlace a ficha y sin JavaScript. browser-check.txt y browser/results.json.
- Revisión independiente sobre este candidato: revision-independiente.md. Capturas finales tras decodificar las imágenes; los viajes del desplegable permanecen cerrados en la vista inicial. Los datos de carga false del JSON de navegador pertenecen a imágenes diferidas dentro del desplegable cerrado y se registran como observación, no como validación de esos recursos.

## Límites

Validación local; no despliegue, commit ni analítica. La fotografía de grupo del bloque de Lucas sigue siendo provisional por indicación del usuario y no identifica una cara concreta. La opinión estética y el resultado comercial necesitan revisión del cliente; las comprobaciones prueban los comportamientos descritos, no un incremento en reservas.
