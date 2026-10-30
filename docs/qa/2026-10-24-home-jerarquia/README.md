# Home LST — jerarquía y detalles, 24/10/2026

Candidato local sin commit ni publicación. Repositorio letsurftogethersystem, HEAD de referencia 58f338661fc4705364fea08727c836e79b3f2048. Esta tarea se compara con las copias exactas de before/, preservando el trabajo previo del árbol.

## Alcance y decisiones

Solo cambian dist/index.html, dist/home.css y scripts/check-home-browser.mjs. El diff acotado está en task.patch y los SHA-256 finales en candidate.sha256.json.

- El botón «Ver viaje» conserva el naranja pero reduce altura visual, tipografía y flecha. La caja visual pasa de unos 55,4 px a 38,2 px en texto normal. El enlace que lo contiene mantiene al menos 44 px como área de pulsación; el contenido puede crecer al ampliar texto.
- Se retira el gran bloque «Viajar con LST»: duplicaba niveles, convivencia y Conócenos. Después de destinos aparecen opiniones y niveles. La idea de poder venir sin conocer a nadie queda en una sola frase junto a las opiniones.
- Se conserva #experiencia en el contenedor interior de opiniones, con el scroll-margin original, para no romper enlaces existentes desde otras páginas.
- Las FAQ conservan preguntas, respuestas y enlaces. Pasan antes de la explicación de reserva y se presentan en un panel tinta redondeado, con texto crema y controles naranja, sobre el fondo crema del resto de la página.
- La portada, los niveles completos, personas, reserva y cierre conservan su HTML exacto. Todas las líneas CSS de niveles coinciden con before. Se mantienen logos, fotografías, fuentes y paleta; sin nuevos assets ni dependencias.

## Criterios de aceptación y comprobación

| Criterio | Evidencia |
| --- | --- |
| CTA más fina sin perder acceso | Script browser verifica altura visual 32–40 px en normal y enlace de al menos 44 px a 320/390/768/1024/1440 px; navegación a ficha y foco accesible conservados. |
| Retirar la sección redundante y preservar consumidores | No existe section.lst-experience; #experiencia es único y permanece enlazable. check valida enlaces y anclas en 19 páginas. |
| Niveles sin cambios | Comparación exacta del bloque HTML y todas las líneas CSS .lst-level con before/. |
| FAQ distinta de reservas | Browser verifica fondo tinta, radio y fondo diferente al de booking; nueva posición antes de reservar. Inspección visual y apertura nativa/teclado en revisión independiente. |
| Sin cambios comerciales | app.js, home.js, renderer de tarjetas y las ocho fichas generadas coinciden byte a byte con la versión anterior. Manifiesto registra SHA de las fichas. |

## Validación ejecutada

- npm test: 53/53 PASS, unit-tests.txt.
- npm run build: sanity-published, 8 salidas, build.txt.
- npm run check: 19 páginas PASS, check.txt.
- scripts/check-home-browser.mjs: 116 comprobaciones PASS, browser-check.txt y browser/results.json. Responsive en cinco anchos, texto 200%, hover/touch/teclado, fechas largas y precios pendientes, Escape, enlace a ficha y sin JavaScript.
- Revisión independiente de este candidato: revision-independiente.md. Capturas finales y mediciones en esta carpeta.

La comprobación de la foto de Cantabria se retira porque ese bloque se elimina deliberadamente. No se debilitan las comprobaciones de fechas, datos o navegación; se añaden las de peso visual del CTA, área táctil, panel de FAQs y orden de secciones.

## Límites

Validación local; sin publicación ni analítica. No se atribuye un aumento de reservas al cambio. La fotografía del bloque de Lucas sigue siendo provisional por decisión del usuario. No se ha probado en Safari/iOS físico.
