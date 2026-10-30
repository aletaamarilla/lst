# Plan de surf sin fotografía repetida

Solicitud: retirar la fotografía de «Cada ola cuenta» y priorizar información práctica, sin añadir más fotos decorativas.

## Alcance de esta iteración

- `scripts/render-trips.mjs`: retirada la figura del programa y su botón «Ver la sesión». Encabezado «Plan de surf.». Se conservan servicios, restricciones, ritmo orientativo, acordeones y galería superior.
- `dist/trip-conversion.css`: eliminadas únicamente las reglas de la figura retirada.
- Dos pruebas existentes adaptadas al nuevo requisito. Sin cambios en catálogo, reservas ni datos de los viajes.
- Páginas estáticas regeneradas con `node scripts/render-trip-pages.mjs` (30 salidas).
- `preview.mjs`: servidor de revisión local en el puerto 40091, mediante WSL/Node.

Los cuatro archivos anteriores a esta petición están en `before/`; el repositorio ya contenía cambios sin commit. Base Git: `58f338661fc4705364fea08727c836e79b3f2048`. Esta iteración no crea commits ni despliega.

## Evidencia actual

- `npm test`: 188 aprobadas, 0 fallos.
- `npm run check`: 40 páginas verificadas, sin errores.
- Navegador integrado: Marruecos a 1440×1000 y 390×844; título actualizado, figura y botón ausentes, cuatro servicios presentes, ancho del documento sin desbordamiento horizontal.
- El Palmar a 390×844: programa sin figura, cuatro acordeones conservados, sin desbordamiento horizontal.
- Capturas observadas en la herramienta de navegador; no exportadas como archivos.
- Revisión explícita del diff contra `before/`: eliminación acotada y contenido práctico conservado. Sin nueva revisión independiente por tratarse de una retirada menor de presentación; las revisiones de iteraciones previas no se atribuyen a esta versión.

## Versión revisada (SHA-256)

```text
f774a7ec22c8f139b5bc7f4964b2888303cc9f89d9d5871bc2c835178d6502b7  scripts/render-trips.mjs
1e79bd5862c8ba8279e3dae39f140e30c4c799242cf4f3cc3688633f2f737316  dist/trip-conversion.css
85f52e90a5c22363155aee770f51de1b98713acb9507e576ea3b0ec5173a845b  scripts/trip-experience-mobile.test.mjs
add6e68e8ce0c938e0a3346d73ffd64e3568ba3db979f4799da1f92fccd94443  scripts/trip-home-alignment.test.mjs
```
