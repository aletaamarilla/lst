# Revisión independiente — home calma

24/10/2026. Revisión de esta iteración, sin modificar producto. Conclusión: no quedan bloqueos conocidos dentro del alcance comprobado. Se corrigió el contraste insuficiente del titular y se verificó la corrección en la candidata final.

## Versión y alcance

Base Git: 58f338661fc4705364fea08727c836e79b3f2048. Candidata local sin commit; comparación acotada con la copia exacta de esta tarea en before/, conservando el árbol previamente modificado. No se traslada la aprobación de iteraciones anteriores.

| Archivo | SHA-256 final |
| --- | --- |
| dist/index.html | 3ca4f9af6741032b04a5c6072abe6809c65cbe7aeb08bf9b6c189353f0ef6bd0 |
| dist/home.css | 3325ad689da62807eab62bbea7c149947e661b157c8b47fc3e8e23d931db8e00 |
| scripts/check-home-browser.mjs | c292028d5f4b048c55db8533ed0cfc8f2723ae8961b1e59ca79da35d85d24365 |

Se revisó el cambio de superficies, texto, CTA y legibilidad del hero. El único cambio HTML es el src del logotipo original negro del pie. Se mantienen colores originales de marca, fuentes y fotografías; los fondos suaves usan tintes de naranja sobre crema. No hay cambios de contenido comercial, modelos, datos, analítica, dependencias ni publicación. El manifiesto y task.patch identifican el diff; app.js, home.js, renderer y fichas generadas permanecen sin cambios según la comparación del implementador.

## Evidencia independiente

Se ejecutaron scripts Playwright de lectura mediante Node ESM desde WSL, con Chromium 1228 y el módulo Playwright local, contra http://localhost:4195. Resultados: browser-independiente-final.json, hero-contrast-review.json y hero-contrast-200-final.json.

- A 320/390/1440 px, los 44 nodos de niveles mantienen los mismos estilos computados y geometría relativa frente a before/home.css: cero diferencias. La última corrección posterior afecta exclusivamente al degradado del hero, por lo que no invalida esta comparación.
- No se detectó desbordamiento horizontal normal ni con texto duplicado al 200 %. El CTA de tarjetas conserva 38,19 px de altura visual y un enlace de 78,89–81,09 px; crece a 56,39 px con texto al 200 %, sin recorte. El foco visible es contorno naranja de 3 px.
- FAQ, atribuciones y pie utilizan tinta o tinta al 73 % sobre superficies claras. El panel FAQ conserva su tinte, borde y radio frente a reservas; no se pierde texto al aclarar fondos. El pie utiliza el SVG negro original.
- Contraste del h1: se compararon capturas con glifos blancos y con su color transparente, manteniendo la sombra explícita. Se calculó luminancia del fondo para píxeles de glifo blancos opacos o casi opacos (RGB >=250). La versión 43/36/22 % del degradado daba mínimos normales de 3,14/3,17/3,21:1 en 320/390/1440, sin muestras bajo 3. La candidata final 48/40/22 % solo oscurece esa versión en escritorio: esos mínimos normales son una cota conservadora, no nuevas mediciones finales. Móvil no cambió: al 200 %, mínimos de 3,31 y 3,23:1 a 320/390.

## Hallazgo resuelto

P2: el título blanco sobre zonas claras de la fotografía no alcanzaba el criterio de 3:1 en determinados puntos; al 200 %/1440 se localizaron diez píxeles con mínimo 2,839:1 en x177/y1274. El primer refuerzo en el stop56 no afectaba a esa posición. Se reforzaron únicamente el extremo izquierdo y stop26 del degradado, sin halo local ni cambios de foto o composición. Repetición independiente sobre el SHA CSS final: 190.886 píxeles muestreados, mínimo 3,187:1 y cero bajo 3; geometría idéntica y sin overflow. Detalle en hero-contrast-200-final.json. Los JSON anteriores se conservan como antecedentes y no deben confundirse con esta resolución.

## Evidencia del implementador y límites

Se consultaron candidate.sha256.json, browser-check.txt y README: npm run check informa 19 páginas PASS y la suite de navegador informa 126 comprobaciones PASS, incluyendo navegación, fechas, teclado, 200 % y modo sin JavaScript. Son ejecuciones del implementador, separadas de la revisión independiente descrita arriba. Capturas completas finales: browser/home-390.png y browser/home-1440.png, con imágenes decodificadas; las capturas hero-review-* corresponden al degradado previo y no representan el último ajuste. No se repitieron pruebas de datos o compilación porque no cambian datos, renderer ni lógica.

Validación local en Chromium, con los anchos y escalado indicados. El muestreo raster del h1 aporta evidencia de esos renders y no sustituye una auditoría WCAG completa ni prueba todos los píxeles de antialias, navegadores o dispositivos. No se prueba Safari/iOS físico, conversión comercial ni un despliegue público. No se ha modificado implementación durante la revisión.
