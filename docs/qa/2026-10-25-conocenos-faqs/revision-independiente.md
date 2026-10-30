# Revisión independiente · Conócenos y FAQs · 25/10/2026

Revisión de los cuatro archivos de producto sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048`, con árbol previamente modificado. Base de esta tarea: `before/`. La candidata comprobada se identifica mediante SHA-256 en `independent-results.json`; no se atribuye aprobación al resto del árbol ni a versiones posteriores.

## Resultado

Sin bloqueos observados en la candidata final dentro del alcance comprobado. Se contrastaron las hojas específicas con `dist/home.css`, las dos páginas y `app.js`, y se inspeccionaron capturas de escritorio y móvil. Ambas páginas conservan exactamente el texto principal y los destinos de enlaces e imágenes de `main` frente a la base; las modificaciones principales son de clases, contenedores y presentación. El menú y el pie reutilizan los patrones de la home.

## Hallazgo resuelto

[P2] El índice FAQ desbordaba con texto al 200 %: 350 px de documento sobre viewport de 320 px y 771 px sobre 768 px, además de desbordes internos a 390 px. `.faq-index a{overflow-wrap:anywhere}` corrige la causa. Repetición independiente de los casos: sin desbordes de documento ni de elementos de `main` en 320/390/768 px.

## Evidencia ejecutada

Primera comprobación independiente: 30 vistas en Chromium (2 páginas × 5 anchos: 320/390/768/1024/1440 × normal/texto200/sinJS), que detectó el hallazgo anterior y no encontró otros errores de página o de apertura de respuestas.

Después de las correcciones, se ejecutaron 18 vistas finales (ambas páginas × 320/390/768 × normal/texto200/sinJS). `independent-results.json` registra medidas y hashes. Resultado: sin desbordes, sin errores JavaScript, las ocho FAQs abren por teclado en todos los modos. La cabecera sinJS es sticky, permanece en top=0 después de scroll y main tiene padding-top=0; conJS conserva fixed. Revisados además los cambios de anclas con scroll-padding=0, el selector de margen de la foto de recuerdo y el hover crema de CTA sobre tinta.

No se modificaron archivos de implementación durante esta revisión. No es una auditoría WCAG completa ni valida Safari/iOS o despliegue.
