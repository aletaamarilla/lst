# Plan de surf: ritmo visual e iconos

Solicitud: aplicar la propuesta de un recorrido compacto del día y servicios con iconos, manteniendo la información práctica y el naranja contenido.

## Cambios y criterios

- Recorrido conectado con cuerpo, ola y revisión; conserva únicamente las actividades detectadas por el helper existente `surfRhythm`, sin añadir sesiones ni horarios.
- Servicios con SVG decorativos de trazo coherente y detalles naranjas. El icono sigue el título, no el orden. Los títulos siguen visibles y los SVG no reciben foco ni nombre accesible.
- Datos destacados mediante `strong`, conservando el texto completo y las restricciones. El contenido sigue escapado.
- Fondo crema, una sola agrupación para el recorrido y servicios abiertos; sin fotografías nuevas.
- Alcance limitado a `scripts/render-trips.mjs`, `dist/trip-conversion.css` y tres pruebas existentes adaptadas para verificar el texto visible con énfasis HTML. No se modifica el catálogo ni el flujo de reserva. Spots y actividades conservan su numeración.
- Regeneradas las 30 páginas de detalle e inscripción mediante el renderizador existente. La plantilla de inscripción no se modifica.

## Validación de esta versión

- `npm test`: 188 aprobadas, 0 fallos.
- `npm run check`: 40 páginas, sin errores.
- `git diff --check -- scripts/render-trips.mjs`: correcto.
- Navegador integrado: Marruecos a 1440×1000, 390×844 y 320×740. Recorrido conectado y legible, cuatro iconos de servicio, texto completo, sin desbordamiento horizontal del documento ni de los títulos de servicio.
- Capturas observadas en la herramienta, sin archivo exportado.
- Revisión explícita del diff contra `before/`: cambios acotados a presentación, sin nuevo comportamiento comercial. Sin nueva revisión independiente para esta iteración visual menor.
- Preview local: http://localhost:40091/viajes/marruecos/#plan, con el servidor `../2026-10-30-trip-practical-plan/preview.mjs` reiniciado para cargar la plantilla actual.

Base Git `58f338661fc4705364fea08727c836e79b3f2048`; se conserva el trabajo previo sin commit. Las copias en `before/` distinguen esta iteración. Sin commit ni despliegue.

## SHA-256 de los archivos revisados

```text
d28477b657b69a7ccfdf72275eb29c1b41d6ba82028368fb8447aef65e0be649  scripts/render-trips.mjs
9df64f89331693791cee0cdc1f3b5c6ef67257657d1dc359a7beef8058677ca4  dist/trip-conversion.css
71cd2bb4ade6e7e257c0728a48ada24f7fbede274ae567860dce6731d875d555  scripts/trip-experience-mobile.test.mjs
13157b0f3deb70f2556fff3e07fca1eb8fa17a2101d7b6e81de580bdb81c0df7  scripts/trip-refinement.test.mjs
4186136ae38cebe16b8134789e3d1e5cf0df260ee1d16a9120cc923129023709  scripts/trip-decision.test.mjs
```
