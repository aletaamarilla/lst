# Fechas verticales de la home · 24/10/2026

Petición: mostrar las fechas de forma sutil, de arriba abajo, sin ocultar el nombre del viaje.

## Versión y alcance

Repositorio letsurftogethersystem, base Git `58f338661fc4705364fea08727c836e79b3f2048`. Trabajo local sin commit. El árbol ya tenía otros cambios antes de esta tarea; los archivos de `before/` delimitan este turno. Los SHA-256 finales están en `candidate.sha256.json`.

Cambios de implementación de este turno: `dist/home.css`. Prueba ampliada: `scripts/check-home-browser.mjs`. El HTML, JavaScript, generador y pruebas del generador coinciden byte a byte con sus backups de entrada. Evidencia y script exploratorio nuevos en esta carpeta y `artifacts/home-dates/quick-layout.mjs`.

## Criterios y evidencia

- Fechas en lista vertical compacta, arriba de la fotografía, con superficie crema de marca, letra de13px y separadores finos. Captura real: `browser/home-dates-desktop.png`.
- El título ocupa una fila propia; conserva su espacio con nombres largos y texto ampliado. `browser/results.json`, campos `layoutResults`, contiene medidas a320,390,768,1024 y1440px, al100% y200%.
- Las listas largas se desplazan dentro del espacio superior. Fixture de18 fechas completas: se mide el span de la última fecha dentro del panel después del scroll a320/768px al100/200%. La reserva mínima se amplió tras la revisión independiente para que una fecha de3líneas se lea completa.
- Hover, clic en Ver fechas, tap, Enter, Espacio, Escape, foco del panel y apertura nativa sin JavaScript comprobados. El área pulsable del summary corresponde ahora a la zona superior de la fotografía; el nombre mantiene su área propia. Hover conserva toda la fotografía.
- Vista previa localhost4175 actualizada y comprobada en el navegador del usuario.

## Validación ejecutada

- `npm run check`: PASS,19 páginas y sus enlaces/activos.
- `node --test scripts/home-trips.test.mjs`: PASS,7 pruebas del generador sin cambios.
- `node scripts/check-home-browser.mjs` con Chromium local y rutas de runtime configuradas: PASS,234 comprobaciones sobre la versión final. `browser/results.json` y capturas contienen la evidencia.
- Revisión independiente en `revision-independiente.md`; variante con nombres largos, sin fotografía y estados.

Límites: validación visual y de interacción local en Chromium; no equivale a una prueba en todos los navegadores ni a una publicación. `home-dates-mobile.png` usa datos sintéticos y puede mostrar el resaltado transitorio del tap: la captura entregada al usuario es la de escritorio con datos reales.
