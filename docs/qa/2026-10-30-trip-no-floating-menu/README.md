# Retirada del menú flotante

Eliminado el menú «Grupo · Surf · Casa · Precio · Dudas» de la plantilla, su controlador en `dist/trip.js` y sus estilos en `dist/trip-conversion.css`. El desplazamiento a anclas reserva solo la altura real de la cabecera y 24 px. Se mantienen los IDs de sección, la cabecera principal, el diseño con iconos y la barra móvil de reserva/WhatsApp.

Actualizadas dos pruebas existentes; eliminadas las tres pruebas del controlador retirado (`scripts/trip-navigation.test.mjs`). Copias previas de los seis archivos en `before/`. Regeneradas 30 páginas con el renderizador existente. Trabajo previo conservado, sin commit ni despliegue; base Git `58f338661fc4705364fea08727c836e79b3f2048`.

Validación actual: `npm test` 185 aprobadas, 0 fallos; `npm run check` 40 páginas correctas; diff sin errores de espacios. Revisado explícitamente el diff de la retirada, sin nueva revisión independiente por su alcance menor de presentación.

Navegador integrado, Marruecos: 1440×1000 y 390×844. Menú ausente en DOM y capturas, cuatro iconos de servicios presentes, cabecera y WhatsApp conservados, documento sin desbordamiento horizontal. Offset de anclas: 112 px escritorio y 24 px móvil. Capturas observadas en herramienta, sin exportación de archivos. Preview: http://localhost:40091/viajes/marruecos/#plan.

SHA-256 de implementación revisada:

```text
0c562f35d3b8cde08b923be021db0a941b58d68ff4c124fca658133e8afde871  scripts/render-trips.mjs
3f0a5c197742203d999f17cbdde4e00e5547c01274b250bce6ee59f545ac12ef  dist/trip.js
192b4d75e63f1b7055215e26eb50a150552c5c489dc0b43de0881ae5cdc3d201  dist/trip-conversion.css
```
