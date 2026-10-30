# Home LST · dirección club de surf · 24/10/2026

Rediseño integrado en la home del proyecto. Versión local, sin commit, push ni publicación. HEAD de partida: `58f338661fc4705364fea08727c836e79b3f2048`, con abundantes cambios anteriores conservados. La web operativa documentada usa Vercel; no se modifica el antiguo Site ni su configuración de hosting.

## Alcance identificable

Producto: `dist/index.html`, `dist/home.css`, `scripts/render-home-trips.mjs` y `scripts/home-trips.test.mjs`. Copias anteriores a esta tarea en `before/`; comparación exacta en [task.patch](task.patch); SHA-256 de base y candidata en [candidate.sha256.json](candidate.sha256.json). `dist/home.js` conserva los bytes anteriores. No se edita contenido en Sanity ni se añaden dependencias.

## Criterios de aceptación y evidencia

| Requisito | Implementación y evidencia |
| --- | --- |
| Dirección propia, minimalista, con detalles | Crema, verde profundo y naranja de marca; tipografía local; portada editorial con fotografía de altura contenida, arco y sello; formas redondeadas puntuales. No se reutiliza código ni material gráfico de Ecowave. Capturas finales enlazadas abajo. |
| Oferta fácil de comparar | Tres viajes cronológicos destacados; fecha, precio, nivel y requisito literal visibles. Resto de viajes conservados mediante desplegable nativo y catálogo. Ocho viajes proceden del mismo modelo publicado de Sanity. |
| Funnel completo | Viajes → experiencia de grupo → orientación por niveles → origen y acompañamiento → reserva en tres pasos → tres dudas → acción final. Entradas al catálogo, guía, Conócenos y preguntas completas. |
| Contratos preservados | Rutas y filtros existentes, estados completos/pendientes, precios por salida y requisitos literales; fechas accesibles con hover, clic, toque y teclado. WhatsApp inicia consulta, sin envío automático ni confirmación de plaza. |
| Mobile first y acceso | 320/390/768/1024/1440 px, texto al 200 %, navegación móvil/Escape, foco, lista larga de fechas, enlaces y uso sin JavaScript en suite de navegador. |
| Contenido respaldado | Origen de Lucas y acompañamiento contrastados con Conócenos; canal comercial con guía cliente. Fotos identificadas como recuerdos. Sin contadores de plazas, cifras de viajeros, reseñas ni servicios universales inventados. |

## Validación ejecutada

- [Build](build.txt): lectura real de Sanity publicado, ocho viajes.
- [Pruebas](tests.txt): 49/49. Incluyen selección de fecha más temprana y preservación literal de requisitos, incluso negaciones, sin clasificar texto libre.
- [Comprobación estática final](check.txt): 19 páginas, recursos/enlaces/anclas locales, coherencia de las vistas generadas, consultas y sintaxis.
- [Navegador](browser.txt): 46 comprobaciones. Detalle en [browser/results.json](browser/results.json). La suite no decodificaba la nueva foto de grupo antes de sus capturas; las capturas finales siguientes sí se obtuvieron con todas las fotos cargadas.
- [Revisión independiente](revision-independiente.md): código, consumidores, datos, contenido y revisión visual complementaria de la candidata final. Detectó que el sello tapaba parte del pie de foto móvil. Se eliminó la segunda frase del pie y se verificó resuelto en 320/390/1440.

Durante la implementación se corrigieron un overflow del header causado por `100vw` y el mínimo de una columna al ampliar texto al 200 % en 320 px. La suite afectada se repitió completa y pasó. El resumen de FAQ se mantuvo en tres preguntas según el comprobador existente.

## Capturas finales

- [Home completa móvil 390](home-final-390.png) · [portada móvil](hero-final-390.png)
- [Home completa escritorio 1440](home-final-1440.png) · [portada escritorio](hero-final-1440.png)
- [Home completa 320](home-final-320.png) · [portada 320](hero-final-320.png)

## Límites

Validación en Chromium, sin dispositivos físicos ni certificación Safari/Firefox. No se enviaron mensajes ni se reservaron plazas. No hay medición de conversión y no se puede atribuir un incremento de ventas al rediseño. Faltan retratos identificados y funciones actuales del equipo: se utiliza el origen documentado y una foto de grupo sin asignar cargos ni identidades. La candidata está implementada y validada localmente; no se ha publicado.
