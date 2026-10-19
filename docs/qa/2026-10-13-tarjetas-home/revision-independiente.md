# Revisión independiente de las tarjetas de home

Revisión de código en modo solo lectura y validación propia en Chromium. No se han modificado archivos de producto.

## Resultado

No se identifican defectos bloqueantes en la candidata revisada. El diff de la home respecto a la instantánea inicial se limita al enlace de `home-cards.css` y el bloque `#viajes`. El nuevo CSS usa selectores acotados a este bloque. No se atribuye esta conclusión a todo el trabajo anterior pendiente de commit.

- Las seis tarjetas conservan las mismas imágenes, nombres y enlaces a destino. Los viajes con fecha mantienen duración y nivel, incluida la autonomía de El Salvador. Asturias conserva el periodo de noviembre; sus dos fechas permanecen en la ficha. Los cuatro destinos pendientes mantienen su estado y los niveles configurados en el JSON.
- Cada tarjeta contiene un solo enlace nativo que envuelve foto, texto y acción, sin botones ni enlaces anidados. Los nombres accesibles incluyen acción y destino.
- La fotografía queda libre de etiquetas. Se eliminan descripción larga, disponibilidad, precio y bloque de reserva de la home; las fichas que contienen esta información son idénticas a la base.
- Se compararon visualmente las capturas anteriores de 390 y 1440 con la candidata, y se revisó la candidata a 320, 390, 768 y 1440. La composición se lee sin recortes de texto, con fotos documentales, título, fecha/estado, meta y acción. A 320 con texto al 200 %, el ajuste final apila imagen y texto en los pendientes y evita partir los nombres por falta de columna.
- Orden Tab: una parada por tarjeta, foco de 3 px visible y libre de la cabecera en los cuatro anchos. Enter abre los seis destinos correctos en cada ancho (24 recorridos). No hubo errores JavaScript ni desbordamiento horizontal en estas vistas.
- El catálogo de `/niveles/` conserva sus filtros: I/IV muestran Asturias y los cuatro pendientes; II/III muestran los seis destinos. El contador de pendientes sigue en cuatro. Los HTML de fichas, catálogo y scripts compartidos conservan su hash inicial.

## Evidencia propia

`revision-browser.json`: 45 comprobaciones aprobadas, geometría, foco, 24 navegaciones y resultados de los cinco filtros. Capturas propias: `revision-{320,390,768,1440}-section.png`, `revision-{320,390,768,1440}-focus.png` y `revision-320-text200.png`. La cabecera fija y el skip-link se ocultan únicamente al capturar secciones largas; las capturas de foco usan la interfaz real.

Se revisó además el nuevo comprobador `scripts/check-home-cards.mjs` y la actualización del selector de pendientes en `scripts/check-ux.mjs`. La ejecución global de build, test y check corresponde al implementador; este informe no presenta esos procesos como ejecutados por el revisor.

## Versión

Base Git: `351576d508314ff4bdf2cb8421f600dcc0c8d3de`. La base funcional incluye los cambios previos sin commit identificados en `baseline.json`; la comparación se hizo con `antes/dist/index.html`, no solo con HEAD.

Hashes SHA-256 de la candidata revisada:

- `dist/index.html`: `7d8fcde292e4bfba25249dfb817d44f026161bd1509d02583ef969d4aa87ccbe`
- `dist/home-cards.css`: `4e8e8ae9e73e60580ad830384c581196d1733aad003dd87259c57b97ca2d5009`
- `scripts/check-ux.mjs`: `892af6cb4c9cde5e9b4ec25852640e8321f0592de1304a99d829d884c8c6205d`
- `scripts/check-home-cards.mjs`: `49cefcdda54e05705a68b8a68f6b042f5bf9fc4a19f9316b26944f0da68f3af5`

Conservación de consumidores frente a `baseline.json`:

- `data/trips.json`: idéntico
- `dist/niveles/index.html`: idéntico
- `dist/levels.css`: idéntico
- `dist/levels.js`: idéntico
- `dist/app.js`: idéntico
- `dist/mobile.css`: idéntico
- `dist/styles.css`: idéntico
- `dist/trip.css`: idéntico
- `dist/trip.js`: idéntico
- `scripts/render-trips.mjs`: idéntico
- `scripts/render-level-trips.mjs`: idéntico
- `dist/viajes/el-salvador/index.html`: idéntico
- `dist/viajes/asturias/index.html`: idéntico
- `dist/viajes/azores/index.html`: idéntico
- `dist/viajes/euskadi/index.html`: idéntico
- `dist/viajes/marruecos/index.html`: idéntico
- `dist/viajes/cadiz/index.html`: idéntico

Alcance de navegador: Chromium local a los tamaños indicados; no es una verificación en dispositivos físicos ni una auditoría completa de accesibilidad.
