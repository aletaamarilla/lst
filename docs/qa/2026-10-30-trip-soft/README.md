# Ajuste suave de marca · 30/10/2026

Revisión exclusivamente visual en `dist/trip-conversion.css`, sobre la candidata anterior sin commit. Base Git `58f338661fc4705364fea08727c836e79b3f2048`; copia previa del CSS en `before/`. No se ha publicado.

Se retiran los paneles negros, el verde profundo como fondo y la gran superficie naranja. Se vuelve a una base crema muy clara, superficies marfil, arena y verde natural discretos. El naranja original se concentra en acciones y pequeños acentos. También se suavizan los contornos y estados hover; se conserva un foco de teclado oscuro legible sobre las nuevas superficies claras.

Se mantienen el resumen superior retirado, el menú flotante, estructura, contenido y contratos. Las plantillas y JavaScript no se modifican en esta tarea.

Validación ejecutada: `node scripts/check.mjs` PASS, cuarenta páginas. Revisión visual directa en 1440×900 y 390×844: apertura sin resumen ni menú visible; barra flotante bajo la cabecera al deslizar; sin desbordamiento móvil. Contrastes medidos: menú activo 7,61:1; texto económico 6,56:1; equipo 6,46:1; texto final de solicitud 6,31:1 y su enlace WhatsApp 8,32:1. No se declara una auditoría completa de accesibilidad.

No se añaden pruebas para este cambio reversible de CSS ni se repite la suite funcional sin cambios de lógica. Revisión explícita del diff y comprobación visual por el implementador; no se presenta como revisión independiente.

Versión y evidencia: `candidate.json`, `browser/soft-browser.json` y capturas en `browser/`. Sin escrituras en el CMS, envíos a Brevo ni mensajes a WhatsApp.

Revisión posterior solicitada: recuperado el crema original de LST `#FFFAE7` en fondo, menú y barra móvil; superficie de tarjetas `#FCF5E2`. Comprobador del sitio PASS y valores computados del navegador confirmados. Captura final: `browser/crema-marca-desktop.png`.
