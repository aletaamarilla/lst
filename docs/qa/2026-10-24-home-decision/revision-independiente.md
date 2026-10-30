# Revisión independiente — home decisión

24/10/2026. Sin bloqueos pendientes en el alcance comprobado. Revisión de esta candidata, sin modificar producto ni trasladar la aprobación anterior.

Base Git: 58f338661fc4705364fea08727c836e79b3f2048. Cambios locales sin commit sobre un árbol previamente modificado; baseline exacta en before/ y alcance en task.patch.

| Archivo | SHA-256 final |
| --- | --- |
| dist/index.html | bb7203556cf4fa0f67a0b9b1185c60e018eacbd395b9514b3570d34363bc4f9b |
| dist/home.css | 63317e28e832b71e08177119ce6dff11df3c645b805ebe67653ffa4d3fc1afee |
| scripts/check-home-browser.mjs | bd733ca29e97980990c3bfe4370599a54a19bb0770d08fa4b6f95a0df47e0443 |

## Recorrido y compatibilidad

El DOM cumple hero → destinos → niveles → personas → opiniones → FAQ → reserva → cierre. Las dos salidas al catálogo apuntan a /viajes/; la ayuda de nivel apunta a #niveles. No hay bucle del cierre hacia el mismo bloque de destinos. El id experiencia sigue existiendo una sola vez en opiniones, preservando el destino utilizado por doce páginas consumidoras.

Comparación propia: hero y niveles mantienen exactamente su HTML y sus líneas CSS, incluido el degradado. El bloque generado entre home-trips:start/end es idéntico, con un único par de marcadores. app.js, home.js y renderer son idénticos a before/. Se conservan literalmente citas, atribuciones y las tres respuestas FAQ. El texto abreviado de personas mantiene origen y posibilidad de consultar quién acompaña; no añade asignaciones garantizadas. El símbolo es el asset naranja original, decorativo y excluido de accesibilidad. El último ajuste de padding exterior de destinos no modifica niveles.

El orden adelanta la orientación de nivel y deja las opiniones como apoyo posterior a conocer al equipo: es un criterio UX, no una mejora de ventas demostrada. No se han medido conversión ni comportamiento de usuarios.

## Validación propia y resolución

Se ejecutaron diff -u, comparaciones de archivos y un script Playwright/Chromium1228 contra localhost:4197, a320/390/1440px, normal y con tamaños de texto duplicados al200 %. Evidencia: comparacion-independiente.json y browser-independiente.json. CTA de catálogo y ayuda se reordenan sin recorte, con alturas normales de54–69,19px y44px; foco visible3px. Opiniones y FAQ usan crema sin gradientes; marco FAQ naranja/tinta, acordeones operativos. No aparece scroll horizontal de página.

Hallazgo menor resuelto: a320/200 %, «acompañamiento» ocupaba255px en una columna de236px, invadiendo19px del padding, sin salir del panel. Se sustituyó por una frase directa sobre quién irá y cómo se organizan las sesiones. Revalidación puntual final: ambos párrafos tienen scrollWidth=clientWidth=236px, ninguna palabra desborda y no hay overflow de página (people-reflow-final.json). El intento de contraste sintético con la baseline agotó el tiempo de navegación: no se clasifica el problema anterior como heredado ni regresión probada. Los otros bloques permanecen sin cambios tras esta corrección.

Evidencia del implementador:146 checks browser finales,19 páginas y smoke del renderer sobre HTML final/snapshot PASS. Capturas completas finales en browser/home-390.png y browser/home-1440.png; no se tomaron capturas independientes redundantes ni se repitieron raster del hero o suites de datos.

Límites: Chromium local, tres anchos y escalado de texto simulado. No auditoría WCAG completa, Safari/iOS físico, publicación, analítica ni prueba de conversión. No se promete ausencia absoluta de defectos.
