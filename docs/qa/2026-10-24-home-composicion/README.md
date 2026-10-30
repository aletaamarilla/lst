# Home LST — composición con fotografía, 24/10/2026

Candidata local sin commit ni publicación sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048, árbol previamente modificado conservado. before/ contiene la base exacta; task.patch acota esta iteración y candidate.sha256.json identifica sus tres archivos.

## Decisión

El usuario rechaza tanto el tono salmón como el blanco y pide una propuesta mejor. Se compararon dos composiciones CSS sin tocar producto: PHOTO (foto de surf con tarjetas solapadas) y FRAME (marco tinta alrededor de intro y tarjetas crema). Las capturas photo-* y frame-* son prototipos, no la candidata. Un auditor de diseño aparte y el implementador prefirieron PHOTO: FRAME conservaba la apariencia de widgets encerrados.

La candidata usa la fotografía existente de la sesión de surf como cabecera de niveles, con texto crema sobre velo tinta. Las cuatro tarjetas crema se solapan24/28px en su borde. Conserva dos columnas móviles y cuatro en escritorio; tipos, tamaños, nombres y enlaces de cards siguen iguales. El hover conserva fondo crema opaco para evitar que se transparente la fotografía bajo las etiquetas de la primera fila. El pie de foto se coloca sobre el velo, conservando su contraste. La cabecera tiene altura automática:390px de viewport produce401px de cabecera, frente a unos500 de la primera prueba. No se fija esa altura al ampliar texto.

FAQ deja la gran tarjeta de fondo blanco. El título va en un panel tinta acotado; las preguntas conservan fondo crema y líneas. En móvil el encabezado admite salto de su enlace por flex-wrap, evitando desborde al200%. No hay un marco tinta alrededor de todas las preguntas.

No hay nuevos colores, assets, librerías o scripts de producto. Naranja #EA5934, crema #FFFAE7 y tinta #1B1B1B; blanco de las cards de viajes anterior se conserva. Hero, HTML, contenido, orden, enlaces, datos, WhatsApp y JS son idénticos a before/.

## Validación

- npm run check:19 páginas PASS, repetido sobre CSS final (check.txt).
-166 checks browser PASS:320/390/768/1024/1440, texto200%, touch/hover/teclado, foco según fondo, fechas largas, rutas y sinJS (browser/results.json). El foco es crema sobre encabezados foto/tinta y tinta sobre el resto. La suite añade comprobación de desborde interno de los párrafos de cards al200%; se admite ruptura de palabra para contenerlas en cada columna.
- Nueva comprobación funcional: fotografía llena su cabecera, cards solapadas sin cambiar superficie, FAQ separa cabecera/lista sin gran caja.
- Inspección visual propia: full desktop, niveles390 y FAQ320 finales. Métricas de cabecera/layout en metrics-final.json.
- Capturas finales completas: browser/home-1440.png y browser/home-390.png. final-levels/faq-* son recortes de componente con navegación fija oculta solo en la captura; el producto y las vistas completas conservan navegación.
- Revisión independiente: revision-independiente.md.

## Límites

Chromium local; no Safari/iOS físico ni auditoría WCAG completa. El criterio de composición no demuestra más ventas. La cabecera fotográfica requiere oscurecer la foto para leer el texto; el título puede crecer con ampliación y viewport estrecho. Se conserva el límite tipográfico documentado de fragmentación de nombres al200%, sin recorte. No se publica ni añade analítica.
