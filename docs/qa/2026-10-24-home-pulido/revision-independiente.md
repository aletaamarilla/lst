# Revisión independiente · Pulido de la home

24 de octubre de 2026. Revisión nueva sobre la candidata de esta iteración; no se reutiliza la aprobación de propuestas anteriores. Resultado: no se detectan bloqueos ni hallazgos accionables pendientes dentro del alcance comprobado.

## Base y alcance

Repositorio letsurftogethersystem, HEAD de referencia `58f338661fc4705364fea08727c836e79b3f2048`. Candidata sin commit sobre un árbol con trabajo previo. Comparación de esta tarea contra `docs/qa/2026-10-24-home-pulido/before/`, sin atribuirle el diff completo respecto de HEAD.

Se revisaron HTML, CSS de home, renderer de tarjetas, pruebas de home y criterios del script browser. `dist/app.js` y `dist/home.js` coinciden byte a byte con before. Como control de alcance, las ocho fichas de viaje se compararon por SHA-256 con sus hashes anteriores y no presentan cambios. El [manifiesto de candidata](candidate.sha256.json) registra también esas fichas sin modificar.

## Requisitos contrastados

| Requisito | Evidencia revisada |
| --- | --- |
| Hero sencillo: Viajes de surf en grupo / ¿Te vienes a surfear? | Textos exactos en HTML y browser; un único CTA en el hero. Primer bloque posterior titulado Próximos destinos. Se ha retirado la franja de manifiesto. |
| Fotografía luminosa, sin oscurecimiento intenso | Misma fotografía original cubriendo el hero. CSS y estilo computado muestran un degradado crema de opacidad inicial 0,14 a 0, sin el anterior sombreado oscuro. Logo y texto iniciales en tinta; inspección visual del hero móvil y de escritorio. |
| Tarjetas definidas y acción destacada | Bordes redondeados y dos sombras de baja opacidad. CTA Ver viaje naranja con altura observada de 55,39 px, precio y fecha visibles. |
| Retirar requisitos debajo de la foto sin borrar información | Diff del renderer limitado a eliminar el small del preview. Cero previews con small en browser; requisitos literales y escapados conservados dentro de fechas. Las fichas no cambian. |
| Textos humanos y concretos | Experiencia con tres artículos directos sin números; reserva titulada ¿Cómo se reserva?; cierre Nos vemos en el pico., conservando El siguiente recuerdo está por hacer y retirando el slogan Menos/Más. |
| Opiniones con título exacto y fondo distinto | Lo que opina la gente que ha viajado aparece literalmente. Fondo computado negro rgb(27,27,27), frente al crema rgb(255,250,231) de niveles. Citas y atribuciones se conservan. |
| Mantener las cuatro tarjetas de nivel, mejorando composición | El bloque HTML de las cuatro tarjetas es idéntico a before, incluidos textos y filtros. Composición nueva con la fotografía original surf-session.webp, bordes y profundidad sutiles; imagen inspeccionada y cargada en las capturas. |
| Identidad, contratos y alcance | Se conservan logotipos, Aura/Work Sans/Space Mono y paleta original. No se añaden scripts de analítica ni se ha realizado publicación. Enlaces internos, estados, precios, fechas y consultas WhatsApp mantienen su contrato. |

Los nuevos wrappers de opiniones y niveles están bien anidados. Se mantienen un único h1, landmarks, IDs de navegación, nombres accesibles y rutas de los consumidores existentes. La información comercial procede del mismo modelo publicado; no se fabrican precios ni disponibilidad.

## Validación propia

- `npm test`: 53/53 aprobadas. Incluye cobertura de varias fechas/precios, precios ausentes, orden de viajes, estados completos/pendientes, escape de contenido y conservación literal de las condiciones dentro del panel. Renderer y pruebas mantienen sus hashes durante el cierre.
- `npm run check`: PASS en 19 páginas, con vistas generadas, rutas, enlaces, anchors, assets y WhatsApp comprobados.
- Chromium mediante Playwright, preview local en puerto 4193: 320 × 844, 390 × 844 y 1440 × 900 px. Sin errores JavaScript ni desbordamiento horizontal en texto normal o al 200 %; cabecera del mismo ancho que el viewport.
- Fechas: requisito literal presente y panel desplazable. A 320 px, panel de 136 px con contenido de 283 px; tras desplazarlo, la última nota queda dentro de sus límites. A 390 px, 185 / 236 px; a 1440 px, todo cabe sin scroll. No se observa pérdida de contenido por recorte.
- Teclado a 390 px: Enter abre fechas, Tab alcanza el panel, End inicia su desplazamiento, Escape cierra y devuelve el foco al control.
- Sin JavaScript a 320 y 390 px: logo oscuro visible, fallback inmediatamente después de la cabecera en y78, apertura nativa de fechas y navegación efectiva a /viajes/.
- Todas las imágenes se decodificaron antes de las seis capturas; la colección adicional se devolvió a estado cerrado y el scroll a 0. No queda ninguna imagen pendiente de carga.

La suite browser de 106 comprobaciones y el build de ocho viajes fueron ejecutados por el implementador; no se atribuyen al revisor. Las ejecuciones propias se detallan arriba y sus mediciones browser están en [browser-independiente-final.json](browser-independiente-final.json).

El ajuste final de HTML normaliza CRLF a LF y elimina líneas vacías al final. Se contrastó el contenido final normalizado con el HTML esperado tras aplicar el único cambio del renderer y la comparación es exacta. No cambia el contenido observado en las capturas ni el comportamiento probado. El implementador repitió el check tras esa normalización.

## Evidencia visual

- [Home 320](home-final-320.png), [home 390](home-final-390.png), [home 1440](home-final-1440.png).
- [Hero 320](hero-final-320.png), [hero 390](hero-final-390.png), [hero 1440](hero-final-1440.png).

Se inspeccionaron visualmente el hero móvil final y la home completa de escritorio. Las mediciones de los otros anchos, ampliación de texto, fechas y modo sin JavaScript figuran en el JSON de revisión.

## Candidata final: SHA-256

| Archivo | SHA-256 |
| --- | --- |
| dist/index.html | 44e5902ccf89720d0763643aa59dabc55de01cc63ae4251f01ad3187c31bcf28 |
| dist/home.css | d4e5805d9c4899bc8155eb48fdd5a030e02642ddf582a7c99d9094b567557ef2 |
| scripts/render-home-trips.mjs | bdcceb61398b25adb62532c53730366c5e06f43aa273857295f9fcba5941fad8 |
| scripts/home-trips.test.mjs | 9b7a885c59161e334ea553700c27277cd0ad5edb6264443bc56ccba1d7cc0e39 |
| scripts/check-home-browser.mjs | 365ee66ffac357bc55c026a885e5ae8b374e8119c2749bf5d4d1c9d8d83dee2b |

## Límites

Conclusión limitada a la candidata y a las fuentes y comprobaciones anteriores. No se ha validado conversión comercial real, producción ni Safari/iOS físico. La fotografía de grupo del bloque de Lucas sigue siendo provisional por decisión previa del usuario; no se identifica a una persona dentro de ella. No se afirma ausencia absoluta de defectos ni se revisa todo el trabajo preexistente del repositorio.
