# Detalle de viaje: color y reserva
Fecha: 28/10/2026. Base Git: 58f338661fc4705364fea08727c836e79b3f2048.
Cambios locales sin commit sobre un checkout con trabajo previo. Esta iteración se limita al renderer, CSS de detalle, dos archivos de pruebas y 15 HTML generados. El manifest candidate-sha256.json identifica los 19 archivos; task-source-diff.patch compara las fuentes con la captura before/, y git-before.txt/git-final.txt distinguen el estado general del checkout.

## Resultado comprobable
- Eliminados los grandes fondos salmón/rojizos. Lucas y otras secciones usan piedra, salvia y azul muy suaves; se mantiene naranja de marca en los controles principales.
- Tarjeta lateral con jerarquía de precio y fecha, disponibilidad/oferta en verde y señal en azul. Conserva importes, cupos, fechas aplicables, inscripción, dossier y consulta.
- Texto repetido condensado. Solo se abrevian las notas genéricas conocidas y el resumen exacto generado por update-trip-promotions; las restricciones personalizadas, incluso añadidas a ese resumen, se conservan y escapan.
- No cambia el catálogo, las promociones, el flujo de inscripción o pago ni la imagen provisional de IA.

## Evidencia
- tests.txt: 146/146 pruebas correctas en la versión final.
- check.txt: 40 páginas y comprobaciones de enlaces, recursos, datos y sintaxis correctas.
- generation.txt: 15 rutas de detalle generadas con el catálogo publicado.
- browser/trip-focus-responsive.json: 35 vistas, siete viajes por cinco anchos (320, 390, 768, 1024, 1440). Sin desbordamiento, pregunta de nivel en una línea, controles de inscripción ajustados, depósitos exactos, sin explorador y tarjeta/barra móvil según breakpoint.
- browser/trip-focus-interactions.json: inscripción de Marruecos abre su formulario; Maldivas abre las dos salidas y mantiene sus enlaces y PDF; Escape cierra el diálogo y devuelve el foco al CTA. Sin enviar formularios ni mensajes.
- browser/trip-focus-desktop.png y trip-focus-mobile.png: aspecto final de la previsualización.
- data-compatibility.json: los 19 archivos coinciden con el manifest y 10 archivos protegidos conservan sus hashes.
- independent-review.md y archivos independent-*: revisión independiente y contraste del cambio; leer su versión y límites explícitos.

## Versión y límites
Renderer SHA-256: ad6479b25830df8113c83f03f5b9b0a0f300ff1ce7aa2e8aa0e1b23218963545.
CSS SHA-256: 33626242ce60148ae148d98e87b23602e79504b726a4cb2c8f1da8f4305a96bf.
La previsualización local en 127.0.0.1:4179 usa la instantánea promocional privada existente; el HTML del repo se genera desde el catálogo publicado. Ambos datos permanecen intactos. No se han validado entregas externas de WhatsApp/PDF ni envío final del formulario. No se ha publicado ni desplegado.
