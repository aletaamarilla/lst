# Revisión independiente de la composición de la home

Fecha: 24 de octubre de 2026. Revisión de solo lectura sobre producto; únicamente se añaden este informe y evidencias de revisión.

## Versión y alcance

Base inmediata: archivos exactos de `before/`, sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048` con cambios previos sin commit. No se atribuye la revisión al conjunto del checkout.

Candidata revisada (SHA-256):

- `dist/index.html`: `6a115ac634973efb8a13d9a0f0a0c7bce2b131a923b586bbd18aef8d4ed32a2f`.
- `dist/home.css`: `aa6097c47e374da9729e37dcaa10f65f7078c2093aa5750df65b9554c3a61373`.
- `scripts/check-home-browser.mjs`: `a0443e28719682089f01d1a385a66d798dbfe96ba66d8e1497638c9c4c84576c`.

Se contrastaron los estilos con la base y su consumo en el HTML. El HTML permanece idéntico: portada, textos, orden, enlaces, anclas, datos de viajes y estructura de las cuatro tarjetas de nivel se conservan. Los cambios son la composición fotográfica de niveles, su solapamiento con las tarjetas, la cabecera acotada de FAQ y la protección del reflujo de párrafos de tarjetas. No se añaden colores de marca ni imágenes; se reutiliza `surf-session.webp`. Los selectores quedan acotados a `body.home-modern`.

## Comprobaciones independientes

Se ejecutó una comprobación focalizada en Chromium a 320, 390, 768, 1000, 1024 y 1440 px, con texto al 100% y 200%. No se detectó desbordamiento de página ni de los elementos de niveles y FAQ en la candidata final. Se inspeccionaron capturas de niveles y FAQ en móvil y escritorio, también con texto ampliado. En móvil 390 px la introducción fotográfica mide 401 px; la cabecera FAQ, 164 px. El flujo mantiene las preguntas accesibles tras una cabecera compacta y las cuatro tarjetas de nivel visibles en el documento.

El contraste sobre la fotografía se calculó con la imagen real, su recorte object-fit y el velo CSS, muestreando el área de cada rectángulo de texto. Mínimos observados: título 5,29:1 (1000 px), cuerpo 7,19:1 (390 px ampliado). Incluye el caso intermedio de 1000–1024 px en el que el título cruza el tramo descendente del degradado. Es una comprobación focalizada, no una auditoría WCAG integral.

Se verificó con Tab que los enlaces de la introducción de niveles y la cabecera FAQ reciben foco visible crema de 3 px. El pie de foto queda en z-index 2 por encima del velo de su propia figura (z-index 1), con opacidad 1 y texto crema. Su fondo tinta al 80% garantiza al menos 8,66:1 frente al extremo de imagen completamente blanco. La captura final confirma que el pie ya no queda oscurecido por el velo.

## Hallazgos y resolución

No quedan defectos bloqueantes detectados dentro del alcance.

Se detectó que, a 200% en 320/390 px, algunas palabras de las descripciones invadían el margen de sus tarjetas. La comparación equivalente con el CSS de `before/` demostró que ya ocurría en la base (por ejemplo, ancho de párrafo 131 px frente a scrollWidth 151 px en 390 px). El implementador añadió `overflow-wrap:anywhere`; se comprobó su resolución en la candidata final y una aserción específica en los cinco anchos de la suite. No se modificaron los textos.

Se contrastó la evidencia final de la suite: 166 comprobaciones sin errores, incluidos 200%, teclado, toque, fechas, navegación y no-JS. `check.txt` confirma 19 páginas correctas. No se repitió la suite completa desde esta revisión; sí se ejecutaron las comprobaciones focalizadas independientes descritas arriba.

## Límites

Validación local en Chromium; no se han probado dispositivos físicos ni Safari/iOS ni se ha publicado. El cambio distingue las secciones mediante fotografía, profundidad y composición; no hay evidencia de un incremento de reservas. La calidad de los retratos y testimonios continúa siendo una limitación de contenido previa, fuera de este ajuste.

Evidencias: `independent-browser.json`, `independent-baseline-text200.json`, `independent-focus-caption.json`, capturas `independent-*.png`, `browser/results.json` y `check.txt`.
