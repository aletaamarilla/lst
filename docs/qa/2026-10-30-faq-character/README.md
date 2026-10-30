# FAQs con más carácter LST · 30/10/2026

Revisión local sin commit en letsurftogethersystem, base Git 58f338661fc4705364fea08727c836e79b3f2048 con trabajo previo conservado. Esta iteración compara exclusivamente dist/faq.css y dist/preguntas-frecuentes/index.html frente a artifacts/faq-character-before. Candidata final identificada por SHA-256 en candidate.json; diff propio en task.diff.

## Cambio
Entrada de cartel con titular inclinado y etiqueta naranja pequeña. El índice temático existente pasa al hero como panel de viaje con los mismos cuatro enlaces y los iconos existentes. Grupo/nivel comparten fila en escritorio; preparación introduce un título de cartel y reserva forma un capítulo oscuro. El cierre de ayuda se abre en crema y mantiene el WhatsApp original. No se añaden fotografías, búsquedas, filtros, dependencias ni JavaScript. No cambian otras páginas.

## Preservado
Los ocho elementos details con preguntas, respuestas y enlaces son idénticos a la base. Se conserva el conjunto de enlaces; su orden cambia al mover el índice. contracts.json lo contrasta. Los acordeones nativos permiten abrir varias respuestas y mantienen el teclado. Rutas, formularios, precios, fechas y reservas no se modifican.

## Validación
- npm run check: PASS 40 páginas; repetido por revisor independiente. check.log.
- Navegador integrado: 320, 390, 768, 1024 y 1440 px, preguntas cerradas y abiertas; sin desbordamientos ni cortes observados. browser.json y capturas. La separación inicial del h1 se mide respecto al documento porque reload conserva el desplazamiento anterior.
- Enter/Espacio abre las ocho respuestas; cerrar una conserva siete en cada ancho. Foco de tinta sobre crema y crema sobre la reserva oscura.
- El ancla de reserva a 320 px deja su título a 135.8 px bajo una cabecera de 78 px.
- 41 muestras de texto de las superficies nuevas superan sus umbrales de contraste 4.5:1 o 3:1 según tamaño; contrast.json. No es una certificación integral de accesibilidad.
- Revisión independiente sobre hashes de candidate.json, código, cascada y capturas, sin bloqueos. No modificó implementación ni abrió navegador externo.
- No se repite el build remoto: esta revisión es HTML/CSS estático y no cambia generación ni datos; el impedimento de conexión con Sanity documentado en brand-rollout permanece fuera de este ajuste.

Vista local: http://localhost:4176/preguntas-frecuentes/ . No publicado, desplegado ni enviado ningún formulario.
