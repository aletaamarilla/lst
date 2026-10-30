# Home LST — tono más tranquilo, 24/10/2026

Candidato local sin commit ni publicación, sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. La baseline exacta de esta iteración está en before/. Se conserva el trabajo previo del repositorio.

## Alcance

Tres archivos: dist/home.css, dist/index.html y scripts/check-home-browser.mjs. El único cambio de HTML es usar el logotipo negro original del footer para que siga siendo visible en el fondo claro. Contenido, estructura, imágenes y rutas permanecen iguales. SHA-256 y diff acotado en candidate.sha256.json y task.patch.

## Criterios de aceptación

- Titular «¿Te vienes a surfear?» en blanco sobre la misma fotografía. Degradado fotográfico continuo para legibilidad, con sombra de texto discreta, sin halo difuminado detrás del bloque.
- Se retiran las grandes masas de tinta y naranja de opiniones, personas, FAQ, cierre y pie. Se conservan #EA5934, #FFFAE7 y #1B1B1B, fuentes y logotipos originales; los tonos claros se obtienen con tintes de naranja al 3,5/4,5 % sobre crema.
- Las secciones mantienen distinción mediante tono, bordes finos, radios y espacio. FAQ conserva su panel y preguntas antes de reservas.
- CTA «Ver viaje» de contorno naranja, con la misma altura visual y área táctil. El CTA de reserva mantiene el naranja sólido como acento de acción, evitando grandes superficies saturadas.
- Niveles queda intacto, tanto HTML como reglas CSS. Revisión independiente contrasta además estilos y geometría para detectar cambios indirectos.
- app.js, home.js, renderer y las ocho fichas generadas no cambian; el manifiesto verifica sus hashes.

## Validación

- npm run check: 19 páginas PASS. Enlaces, anclas, assets, rutas y sintaxis, check.txt.
- scripts/check-home-browser.mjs: 126 comprobaciones PASS en 320/390/768/1024/1440 px, texto 200%, fecha hover/táctil/teclado, panel largo, navegación y sin JavaScript. browser-check.txt y browser/results.json.
- La comparación de superficies incluye la imagen de fondo usada para los tintes; comparar solo el color crema subyacente no representaría el resultado visible.
- Revisión independiente sobre el candidato final en revision-independiente.md, con capturas completas móvil/escritorio y del hero.
- Contraste del h1: el muestreo normal previo al último refuerzo arroja mínimos 3,14:1 a 320 px, 3,17:1 a 390 px y 3,21:1 a 1440 px (hero-contrast-review.json). Móvil no cambia; el último ajuste de escritorio únicamente oscurece el degradado bajo el texto, por lo que esos valores son una cota conservadora, no una nueva medición normal del SHA final. Al 200 % y 1440 px, el candidato final se vuelve a medir: mínimo 3,187:1 y cero píxeles blancos opacos bajo 3:1, hero-contrast-200-final.json. Se retiene la sombra de texto en el fondo de comparación; el método y sus límites se documentan en la revisión. Las mediciones insuficientes anteriores se conservan como antecedentes y no representan el candidato final.

No se repiten build ni pruebas unitarias del modelo: el cambio se limita a CSS y al src de un SVG original existente; no se modifican el pipeline, el renderer, los datos ni la lógica. Las pruebas unitarias anteriores son evidencia previa, no una ejecución de esta tarea.

## Límites

Validación local en Chromium; no publicación, analítica ni medición de conversión. No se prueba Safari/iOS físico. Se comprueba legibilidad en las vistas indicadas; no es una auditoría completa de accesibilidad.
