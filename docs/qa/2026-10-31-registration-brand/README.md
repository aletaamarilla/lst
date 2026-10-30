# Inscripción con identidad LST · 31 octubre 2026

Repositorio letsurftogethersystem; base Git 58f338661fc4705364fea08727c836e79b3f2048 con trabajo previo conservado. Los 17 archivos de esta iteración están identificados por SHA-256 en candidate.json. task.diff los compara con artifacts/registration-brand-before: registration.css, render-registration.mjs y quince HTML de inscripción (siete destinos y sus URLs históricas).

## Resultado
- Postal de viaje con la foto existente, tipografía Aura, estructura negra y acento naranja contenido. Entrada compacta en móvil.
- Progreso con paso actual contrastado, estados completados disponibles y pasos futuros deshabilitados según el comportamiento existente.
- Un icono útil por paso, trazo 1.7 y detalle naranja, coherente con Plan de surf. Titulares y cierre de ayuda con más carácter.
- Selector de fecha legible, tarifa destacada, campos con bordes de contraste al menos 3:1 y foco visible. Se corrige el giro heredado de los spans del acordeón para que no se solapen al abrir fechas.
- El salto al contenido tiene destino de foco explícito mediante tabindex=-1 en main.

## Conservación y evidencia
- registration.js es idéntico a la copia inicial. Todos los tags de formulario, campos, opciones, botones, fieldsets, labels, details/summary y enlaces son idénticos en las quince rutas (contracts.json). Nombres, valores, obligatorios/opcionales, mapping Brevo, fechas, precios, mensajes, URL/action y envío conservados.
- Solo se regeneran inscripciones desde el snapshot sanity-published existente. No se cambia catálogo ni contenido de viajes ni borradores locales.
- npm test: 190/190. npm run check: 40 páginas. npm run studio:check: PASS. Logs en esta carpeta.
- Navegador integrado: quince rutas por cinco anchos (320, 390, 768, 1024, 1440), 75 vistas sin desbordamientos (viewport-metrics.json).
- Flujo de los cinco pasos a 320×568, 390×900 y 1440×900: validación de obligatorios, email y fecha imposible; radios, Atrás y retorno a paso visitado; valores conservados (browser-steps.json). No se pulsa Enviar solicitud.
- Maldivas sin fecha, elección de cada salida, apertura por Enter, foco devuelto a summary, enlace válido/inválido y recuperación: PASS a 320/390/1440. Textos del selector con transform:none abierto/cerrado (date-picker.json).
- Salto al contenido enfoca main y Tab continúa por controles; foco de campo 2 px, radios 3 px y summary 3 px. Progreso táctil al menos 62 px en teléfono. El formulario no usa elementos fijos nuevos.
- Veinte muestras de contraste de texto pasan 4.5:1 o 3:1 según tamaño; bordes de campo reforzados desde 2.50:1 a más de 3:1 (contrast.json).
- Revisión independiente sin bloqueos, incluido el selector corregido y el candidato final (independent-review.md).

## Límites y vista local
No se realiza envío real a Brevo ni pago. Se preserva el contrato de POST y el fallback sin JavaScript por comparación y pruebas; no se declara validado un envío real externo. El build remoto con datos nuevos de Sanity sigue sin verificarse por el fallo de conexión ya documentado en ../2026-10-30-brand-rollout/README.md; el build con fixtures, snapshot actual y comprobaciones locales pasan.

Vista: http://localhost:4176/inscripciones/hossegor/ y http://localhost:4176/inscripciones/maldivas/ . No se ha ejecutado despliegue manual. La petición anterior de subir los pendientes a main se retoma tras esta validación.
