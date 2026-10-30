# Home LST · identidad original y confianza · 24/10/2026

Versión local implementada, sin commit, push ni publicación. Base Git: 58f338661fc4705364fea08727c836e79b3f2048, con trabajo anterior conservado. [Candidata identificada por SHA-256](candidate.sha256.json), [diff de esta tarea](task.patch) y copias previas en before/.

## Alcance y decisiones

- Restaurados los colores originales #EA5934, #FFFAE7 y #1B1B1B, Aura/Work Sans/Space Mono y símbolos originales. Se retiran de la home Bricolage, verde/pasteles, arco y sello de ondas inventado. Los archivos originales de marca y fuentes coinciden con HEAD.
- La foto documental de Francia llena toda la portada, detrás del contenido y de la cabecera inicial. La cabecera cambia de transparencia a crema al desplazarse. En móvil conserva Viajes y menú accesibles.
- Se mantiene el funnel de viajes, experiencia, niveles, personas, reserva y dudas. Se añaden dos extractos literales publicados de Laura y Ainhoa con contexto, atribución y fuente. Sin nuevas cifras, estrellas, fechas de reseñas ni destinos inferidos.
- El bloque de Lucas concreta el origen y el acompañamiento respaldados por el cuestionario. La foto de Marruecos es provisional por indicación expresa del usuario: foto de grupo, sin atribuir una cara. [Procedencia y tratamiento](media.json).
- Las fichas muestran inclusiones literales de coaching, clases, surf guiding, guías o acompañamiento de su propia salida confirmada. El texto editorial team de Sanity conserva prioridad. Los destinos pendientes no heredan equipo ni servicios. Nueva consulta contextual por WhatsApp sobre acompañamiento.
- El usuario excluyó expresamente toda analítica. No se añade medición, eventos, colectores, hojas de registro, cookies ni dependencias.

## Fuente y límites de contenido

Cuestionario_Marca_Web_LST (1).pdf facilitado por el usuario: página 1, pregunta 4 (organización y presencia durante el viaje); página 2, preguntas 8–9 (voz e identidad); página 3, preguntas 11–14 (Travelhood como referencia, identidad, origen). Extracción de texto y revisión visual de páginas 2–3; copias de trabajo solo en artifacts/, ignorado por Git. No se traslada la información fiscal o las cláusulas legales del PDF a la home.

Referencia visual consultada: https://travelhood.es/. No se reutilizan sus fotos, código, testimonios ni promesas comerciales. La identidad procede de los assets locales de LST.

Testimonios contrastados con https://www.letsurftogether.com/ y el inventario previo del proyecto. Laura se atribuye a Marruecos, viaje anterior; Ainhoa no tiene destino ni fecha documentados. Los extractos conservan la omisión inicial y suman 15 palabras.

Los programas publicados sí identifican coaching de Lucas en salidas concretas; esa evidencia no se generaliza a todo el catálogo. Se conserva íntegro el modelo publicado de Sanity y no se escribe en el CMS.

## Archivos

Edición manual: dist/index.html, dist/home.css, dist/trip.css, scripts/render-trips.mjs, scripts/sanity.test.mjs, scripts/check-home-browser.mjs. Nuevos: scripts/trip-team.test.mjs y dist/assets/home/marruecos-comunidad.webp. El build regenera las ocho fichas publicadas. app.js, home.js, trip.js, el renderer de tarjetas de home y sus pruebas conservan sus bytes anteriores.

La imagen provisional se puede sustituir cambiando src, dimensiones y alt de .lst-people-photo en dist/index.html. El acompañamiento por salida ya es editable en Studio → Acompañamiento (team.title/team.text); no se añadió otro origen de datos ni un equipo común para todos los viajes.

## Validación ejecutada

- [Pruebas](tests.txt): 53/53. Nuevos casos de procedencia del acompañamiento, preferencia editorial, estados pendientes, escape de HTML y contexto de la consulta. La prueba de WhatsApp comprueba cada ubicación y su destino en lugar de depender de una cifra total de enlaces.
- [Build](build.txt): ocho viajes desde Sanity publicado. [Check final](check.txt): 19 páginas, recursos y enlaces, vistas generadas, consultas, sintaxis y noindex.
- [Compatibilidad](trip-compatibility.json): renderer anterior y candidato sobre el mismo snapshot; las ocho páginas son idénticas byte a byte fuera de .trip-team.
- [Navegador](browser.txt): 86 comprobaciones en 320/390/768/1024/1440 px; tipografías, crema original, fotografía cubriendo toda la portada, logos y cabecera al desplazar, fechas con hover/toque/teclado/Escape, lista larga, texto al 200 %, rutas y modo sin JavaScript. [Detalle](browser/results.json).
- [Revisión independiente final](revision-independiente.md): contraste con PDF, contenido, contratos, imagen provisional y correcciones responsive. La foto nueva y el último ajuste de contraste de etiquetas se comprueban de forma focalizada sobre la candidata final; no se atribuye a una ejecución anterior cobertura de esas últimas modificaciones. [Resultados de navegador independiente](browser-independiente-final.json).

Se resolvieron cinco defectos de CSS: tarjetas que desbordaban por min-height/aspect-ratio, meta del hero que se solapaba con texto ampliado, ancho incompleto del header móvil, color de hamburguesa en foto y fallback sin JavaScript superpuesto. El revisor repitió los casos a 320/390/1440, normal y texto al 200 %. Las etiquetas pequeñas de testimonios usan tinta sobre crema para contraste legible, conservando la paleta.

En una validación intermedia, una reconstrucción leyó el generador antes de terminar la escritura de surf guiding; el check detectó Senegal desactualizado. Se reconstruyó después de cerrar todas las escrituras y se repitieron pruebas y check con resultado correcto.

## Capturas finales

[Home completa 1440](home-final-1440.png) · [portada 1440](hero-final-1440.png) · [home móvil 390](home-final-390.png) · [portada móvil 390](hero-final-390.png) · [home 320](home-final-320.png).

## Límites

Validación en Chromium, sin dispositivos físicos ni certificación Safari/Firefox. No se enviaron mensajes ni se confirmaron reservas. La foto de grupo se mantiene provisional por decisión del usuario; no se inventa un retrato individual. Esta entrega no incluye analítica ni despliegue.
