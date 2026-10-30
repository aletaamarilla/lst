# Revisión independiente · Identidad y confianza de LST

Fecha: 24 de octubre de 2026. Revisor: subagente independiente del implementador. No se ha modificado producto durante esta revisión; únicamente se han generado capturas, evidencia browser y este informe.

Resultado: no quedan bloqueos conocidos dentro del alcance comprobado y de la candidata identificada abajo. Esta revisión sustituye cualquier conclusión sobre la propuesta anterior de la home; no extiende su aprobación a otros cambios preexistentes del árbol.

## Base, requisitos y alcance

Repositorio: letsurftogethersystem. HEAD de referencia: `58f338661fc4705364fea08727c836e79b3f2048`. Candidata sin commit sobre un árbol que ya contenía otros cambios. La referencia de esta tarea es `docs/qa/2026-10-24-home-identidad/before/`; no se ha considerado que todo el diff respecto de HEAD pertenezca a esta tarea.

Se inspeccionaron visualmente las páginas 2 y 3 del cuestionario proporcionado por el usuario, a partir de `artifacts/home-identidad/cuestionario.pdf` y sus renders. Q9 exige conservar la identidad existente; Q11 identifica Travelhood como referencia, manteniendo personalidad propia; Q12 pide conservar los colores y evitar un estilo excesivamente turístico o lujoso. La instrucción posterior del usuario pide fotografía de fondo completo en el hero y excluye expresamente la analítica.

Se revisaron HTML y CSS de la home, renderer de fichas, CSS de acompañamiento, pruebas añadidas o ajustadas y las ocho fichas regeneradas. Se contrastaron el catálogo publicado, el modelo y adaptador Sanity, Conócenos y la guía de cliente. Se comprobó igualdad byte a byte de `app.js`, `home.js`, `trip.js`, el renderer de tarjetas de home y sus pruebas respecto de la instantánea before.

## Cumplimiento y compatibilidad

- La home usa los logotipos y símbolo existentes, únicamente los colores hexadecimales #EA5934 / #FFFAE7 / #1B1B1B en su CSS y las familias Aura, Work Sans y Space Mono del proyecto. No carga Bricolage ni conserva el sello y símbolos decorativos inventados de la propuesta anterior. La fotografía cubre toda el área del hero en 320, 390 y 1440 px.
- Los extractos atribuidos a Laura y Ainhoa se contrastaron con la fuente pública primaria [LST](https://www.letsurftogether.com/). Son extractos literales breves, identificados como experiencias anteriores; no se ha inventado una valoración ni una experiencia actual.
- La historia de Lucas coincide con el cuestionario y Conócenos. La fotografía provisional de Marruecos se presenta como grupo, con alt y caption de grupo, sin señalar ni identificar caras. Se inspeccionó el archivo final de 1400 × 933 px; carga correctamente. Fuente comunicada por el implementador: [fotografía original publicada por LST](https://www.letsurftogether.com/wp-content/uploads/2025/05/Marruecos_2025_53.jpg). El usuario aceptó su uso provisional y pospuso su sustitución.
- El cuestionario permanece fuera de `dist`. No se han trasladado al contenido nuevo datos legales o documentales privados del cuestionario.
- La home solo carga `app.js` y `home.js`, sin modificaciones respecto de before. No se han añadido scripts, eventos ni servicios de analítica.
- La lista de acompañamiento reutiliza inclusiones literales del propio viaje confirmado, deduplica sin mutar el modelo y escapa HTML. Mantiene la autoridad del texto editorial de equipo y no presenta servicios históricos como confirmados en programas pendientes. La alternativa `surf guiding` quedó incluida y verificada en Senegal. Lucas solo aparece en la lista cuando lo indica expresamente el programa de esa salida.
- Se mantienen rutas, precios, fechas, estados comerciales y canal WhatsApp. La nueva consulta de acompañamiento conserva destino y contexto y no envía mensajes automáticamente. La revisión no detectó cambios de contrato en esos elementos dentro de este alcance.

## Comprobaciones ejecutadas por el revisor

1. `npm test`: 53/53 pruebas aprobadas después de corregir una aserción antigua que contaba cinco enlaces WhatsApp. La prueba ajustada comprueba cada ubicación y su destino/canal/contexto en vez de limitarse a aumentar una cifra. Esta ejecución completa precede únicamente a la última ampliación acotada del helper con `surf guiding` y al cambio de foto provisional.
2. Sobre esos últimos cambios: `node --test scripts/trip-team.test.mjs`, 4/4 aprobadas, y `npm run check`, PASS en 19 páginas. Este check final confirma que las ocho fichas corresponden al renderer final, además de rutas, enlaces, anchors, assets y contacto.
3. Chromium con Playwright sobre el preview local: 320, 390 y 1440 px; texto normal y ampliación al 200 %. Se comprobó ancho de página/cabecera, tarjetas, separación de CTA y metadatos, colores de menú y cobertura de la fotografía. La nueva lista y CTA de acompañamiento también se revisaron en esos anchos y con texto al 200 %, sin desbordamiento en la sección.
4. Modo sin JavaScript en 320 y 390 px: logo oscuro visible, cabecera y navegación alternativa en flujo sin solapamiento, control de menú inactivo oculto y navegación efectiva a `/viajes/`.
5. Capturas de la candidata final con todas las imágenes cargadas, colección adicional devuelta al estado cerrado y scroll en 0. Cero errores JavaScript; scrollWidth y ancho de cabecera iguales al viewport; fotografía de fondo cubriendo el hero y nueva foto de grupo cargada. Datos en [browser-independiente-final.json](browser-independiente-final.json). Tras el último ajuste exclusivo de contraste, se verificó el color computado de ambas etiquetas de testimonios: rgb(27, 27, 27), tinta original, en los tres anchos; se actualizaron las seis capturas finales.

El build de ocho viajes y la ejecución completa de 53 pruebas tras la última ampliación fueron realizados también por el implementador; no se presentan como ejecución independiente propia. El revisor no ha ejecutado un despliegue.

## Hallazgos resueltos

| Hallazgo P2 observado | Corrección y verificación final |
| --- | --- |
| Tarjetas a 320 px alcanzaban x336,75 por la combinación de min-height y aspect-ratio. | Ancho explícito 100 %, min-width 0 y eliminación de la altura mínima que ensanchaba la tarjeta. Ancho final 284 px y borde derecho x302 dentro de viewport 320. |
| A 320 px y texto 200 %, el enlace secundario del hero terminaba en y1718,69 y el meta empezaba en y1710,69; se superponían. | Metadatos en flujo normal. Separación final de 40 px entre acciones y meta en todos los anchos comprobados, también al 200 %. |
| La clase de contenedor reducía el ancho de la cabecera: 346 px con viewport 390 y 284 px con viewport 320. | La cabecera ocupa el ancho completo en los breakpoints. Verificados 320/390/1440 px, normal y al 200 %. |
| Las barras del menú móvil conservaban color negro del botón sobre la fotografía, mientras la cabecera era clara. | El botón hereda color. Barras y texto de cabecera coinciden en rgb(255, 250, 231) al inicio del hero; las barras siguen el estado oscuro de la cabecera. |
| Sin JavaScript, la navegación alternativa de z-index superior empezaba en y0 y tapaba la cabecera. | Cabecera y fallback en flujo normal, logo oscuro y botón inactivo oculto. Borde inferior de cabecera y comienzo del fallback en y78 para 320/390 px; enlace Viajes probado. |

La observación opcional sobre omisión de `surf guiding` en Senegal también quedó atendida. No quedan hallazgos accionables pendientes de esta revisión.

## Evidencia visual final

- [Home 320](home-final-320.png), [home 390](home-final-390.png), [home 1440](home-final-1440.png).
- [Hero 320](hero-final-320.png), [hero 390](hero-final-390.png), [hero 1440](hero-final-1440.png).

Viewports de las capturas: 320 × 844, 390 × 844 y 1440 × 900 px. Se inspeccionaron visualmente el hero final móvil y la home completa final de escritorio, además de las capturas utilizadas durante la resolución de hallazgos.

La evidencia adicional [trip-compatibility.json](trip-compatibility.json), generada por el implementador e inspeccionada durante el cierre, registra que las ocho fichas anteriores y candidatas, renderizadas desde el mismo snapshot, coinciden fuera de la sección de acompañamiento. El [manifiesto de candidata](candidate.sha256.json), [diff de la tarea](task.patch) y [procedencia de la fotografía](media.json) completan el registro del alcance; no se atribuye su ejecución al revisor.

## Candidata final: SHA-256

| Archivo | SHA-256 |
| --- | --- |
| dist/index.html | 277dcf0e8414e615b9183158c46e3ee1b031668c51ad46b0d908e574bd8a3eb5 |
| dist/home.css | 54208711c958939b51771436000a9ca197acde31ca2bf73af2660608b7e3267b |
| scripts/render-trips.mjs | fd20c0afc0cfac718d23465bab6617f9ca6caa163d6eef01b506d4ad33cc8ced |
| dist/trip.css | 644f7720857a690c30fd3e6e91dbf179f1b335c0a560316e0148d50498cc168f |
| scripts/trip-team.test.mjs | ba8709f8811c6d9ac90d4aac48db2aae6e3f356551ebc814a7dc38bc19d84dd0 |
| scripts/sanity.test.mjs | 6a70077851547928c29445eafd868a491fe3ca042f360b06700f76bafc1c4a04 |
| scripts/check-home-browser.mjs | f484febb36bc0e07e3c08beca484e2e68707959ee7761a04d77d14afff0ecd44 |
| dist/assets/home/marruecos-comunidad.webp | cdc62b58be43b65c8257f93160a4c6abfcea2cc42bbfd97cfc4acbd9e4d636cd |

Fichas generadas y comprobadas por `npm run check`:

| Archivo | SHA-256 |
| --- | --- |
| dist/viajes/el-palmar-2026-12-04/index.html | 11f77bafd80ef43b36542b86a28677de7ea2b5d884e8716de9070969020b6256 |
| dist/viajes/fuerteventura-2027-02-12/index.html | d137e003bac4d53b285c51228253cb0dc6b87e8ecd764410c8b528e14d608029 |
| dist/viajes/hossegor-2026-11-20/index.html | 1b17bbcf681fc3ed1bcb139d6252126e0d7a8302c99cd03f2c0445f7bb96506f |
| dist/viajes/maldivas-2027-03-21/index.html | 940243cfe2ef0665fd43d8ece7e4b2a803a2bc90a2ddec90a6c1c18bca237ea9 |
| dist/viajes/maldivas-2027-03-28/index.html | 6fadeb6a5445bd301907bf00c3c82d64223eb0d51779dec9b7513d1a709b87ee |
| dist/viajes/marruecos-2027-01-17/index.html | 31943e6f83a3f2abe484ae063b6b8c020f618f525649a273ad1676647aadcab2 |
| dist/viajes/marruecos-2027-01-24/index.html | 07eb47047a554368267be170d1f7aadd1629421580e2ef1c2e823d6bd04dfb8c |
| dist/viajes/senegal-2027-02-28/index.html | 6bb40821ba2e02b15d2ee171b2a986d8e0ae4f3b9cb8be54db4291759ae533e8 |

## Límites

Revisión local en Chromium y sobre las fuentes indicadas. No demuestra conversión comercial real, comportamiento en Safari/iOS físico, publicación en producción ni ausencia absoluta de defectos. La foto de grupo sigue siendo provisional por decisión del usuario; no constituye un retrato identificado de Lucas. La conclusión cubre únicamente los archivos y hashes anteriores, no el conjunto de cambios previos del repositorio.
