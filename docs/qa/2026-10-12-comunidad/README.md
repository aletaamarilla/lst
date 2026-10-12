# LST · comunidad y prueba social · 12/10/2026

Implementación y validación local terminadas. Repositorio `aletaamarilla/lst`; base Git `6053e6173d6114ee741bc0f4310d79418f22199e`, con las revisiones anteriores ya sin commit. La candidata y los archivos nuevos están identificados en [version.json](version.json). No se ha hecho commit, push, publicación ni despliegue.

## Qué respondía la web y qué faltaba

La home ya permitía entender que se podía acudir sin compañía, consultar el nivel y reservar por WhatsApp. Su testimonio de Laura mostraba afinidad entre personas de distintos niveles, pero no hacía explícita la experiencia de llegar por cuenta propia. El aprendizaje tenía una foto documental de surfskate y una explicación de marca; faltaba una voz sobre cómo se aprende con el grupo. Cultura y aventura aparecían de forma general, sin un recuerdo concreto junto al relato.

El proceso de reserva y las fichas ya explicaban la organización. Añadir una reseña para repetir esa función alargaría el recorrido. Se mantienen la sección, la fotografía y la presentación previa del equipo; las dos voces comparten un enlace a la fuente, sin nueva acción comercial.

## Selección y fuentes

Se revisaron las seis voces de la [home pública de LST](https://www.letsurftogether.com/). Los dos extractos son finales de frase contiguos, con la omisión inicial marcada. Se verificaron literalmente y dentro de la atribución correspondiente en el HTML publicado: [evidencia de fuentes](sources.json). No se corrigen palabras de las reseñas ni se añaden valoraciones o cifras.

| Voz | Duda que responde y decisión |
| --- | --- |
| **Laura — seleccionada** | ¿Hay personas que llegan por su cuenta? Recuerdo de Marruecos; apoya convivencia y descubrimiento del lugar. Aparece en home y solo en la ficha de Marruecos, sin inferir fecha de la reseña. |
| **Ainhoa — seleccionada** | ¿Cómo se comparte el aprendizaje? Aporta el ejemplo de revisar errores mediante vídeo. Su reseña no indica destino: se declara junto a la atribución y permanece exclusivamente en home. |
| Blanca | Comidas y vínculo con el grupo: solapa la función cubierta por Laura. |
| Hermi | Organización y sesiones por niveles en Marruecos: no se añade porque el recorrido ya explica organización y aprendizaje. |
| Borja | Primer encuentro y convivencia: menos directo sobre viajar sin compañía que Laura. |
| Alberto | Hospitalidad y organización: sin una duda adicional que justifique otra reseña; tampoco declara destino. |

El [apartado Nosotros](https://www.letsurftogether.com/sobre-lst/) respalda el contexto de convivencia, comida local y aprendizaje. Sus promesas generales no se convierten en servicios futuros. El cuestionario local, páginas 1–3 y 5, orienta el tono y recoge el viaje por cuenta propia y la audiencia mayoritariamente femenina. Se habla a quien llega, sin estereotipos, composición de grupo garantizada, promesas de amistad o seguridad. El PDF y sus datos personales no se incorporan al repositorio; su huella está en la evidencia de fuentes.

## Texto final

El texto completo de la experiencia, incluidos los extractos literales, nombres y atribuciones, está en [dist/index.html](../../../dist/index.html), sección `#experiencia`, y en las capturas siguientes. El extracto de la ficha y su contexto están en [data/trips.json](../../../data/trips.json), `marruecos.testimonial`. Estos archivos son la fuente editable del texto entregado.

**Así viajamos con LST**

**¿Vienes por tu cuenta?** Puedes venir sin conocer al grupo. Las sesiones, las comidas y los ratos entre baños dan pie a empezar a conocerse.

**Surf con tiempo para aprender.** Varios días para practicar y trabajar tu técnica, dentro y fuera del agua. En cada programa encontrarás las sesiones y actividades previstas y los niveles a los que va dirigido.

**El viaje sigue fuera del agua.** En Marruecos, Laura recuerda la gastronomía, descubrir paisajes y conocer otra cultura con el grupo. Son recuerdos de aquel viaje; consulta los planes previstos en cada salida.

**Pie de fotografía:** Surfskate en Cádiz, 2024 · un viaje anterior de LST.

**Recuerdos del grupo:** el primer extracto está rotulado «Sobre llegar sin conocer al grupo» y atribuido a Laura, «Marruecos · viaje anterior». El segundo está rotulado «Sobre las correcciones en vídeo» y atribuido a Ainhoa, «Viajera de LST · su reseña no indica el destino». El enlace común dice «Leer los testimonios completos en LST».

**Contexto de Laura en la ficha:** Laura recuerda conocer al grupo, probar la gastronomía y descubrir paisajes en un viaje anterior a Marruecos. Atribución: Laura · Viajera de LST · Marruecos, viaje anterior. Se conserva el enlace a su testimonio. El texto del próximo equipo permanece separado e intacto.

## Fotografías y su contexto

| Material existente | Procedencia y tratamiento |
| --- | --- |
| `learning.webp` | [Original Cadiz_2024_152](https://www.letsurftogether.com/wp-content/uploads/2025/05/Cadiz_2024_152-scaled.jpg), procedente de Nosotros. Demostración de surfskate con el grupo, Cádiz 2024. Se conserva foto y encuadre; el pie explicita que pertenece a un viaje anterior. |
| `marruecos.webp` | [Original Marruecos_2025_53](https://www.letsurftogether.com/wp-content/uploads/2025/05/Marruecos_2025_53-scaled.jpg), procedente de Nosotros. Grupo de noche en un viaje anterior; mantiene su uso en tarjeta y ficha. No se presenta como foto de Laura ni como la salida exacta de su reseña. |
| `group.webp` | [Original Laga-2024_01](https://www.letsurftogether.com/wp-content/uploads/2025/05/Laga-2024_01.jpg), procedente de la home pública. Grupo en Laga, 2024. Conservado en la presentación, sin identificación del equipo actual. |

No se han generado ni incorporado fotografías, ni se han identificado caras. La imagen de Cádiz no se atribuye a Laura o Ainhoa. [Procedencia completa](../../asset-provenance.json), conservando sus registros anteriores.

## Verificación y límites

- `npm run build`: reconstruidas seis fichas. Solo Marruecos cambia; las otras cinco conservan exactamente sus bytes.
- `npm run check`: PASS en siete páginas, generación sincronizada, rutas/anclas/assets, WhatsApp, selector de fechas, estados y noindex.
- `npm test`: 5/5, sobre niveles, salidas, precios y consultas. `git diff --check`: sin errores.
- Chromium a **390×844 y 1440×900** en home y seis destinos: sin desbordamiento horizontal, imágenes de contenido fallidas o errores JavaScript; fuentes cargadas. [Matriz](capturas-audit.json). Inspección visual de experiencia y Marruecos a ambos anchos.
- Comprobación focalizada: enlace de fuentes con teclado, ancla, contextos, texto al 200 %, WhatsApp y selector de Asturias. 20 comprobaciones sin fallos. [Resultado](browser-checks.json). Las navegaciones externas se interceptaron; no se enviaron mensajes.
- [Preservación](preservation.json): 69 comprobaciones sin fallos. Todos los datos salvo los tres campos testimoniales de Marruecos son idénticos; home idéntica fuera de experiencia; assets, tipografías, JavaScript, modelo, tests y enlaces comerciales conservados. Los CSS previos permanecen como prefijo, con reglas nuevas acotadas.
- [Revisión independiente](revision-independiente.md): sin bloqueos en los seis archivos de implementación finales; hashes comprobados en la entrega. No hubo correcciones funcionales posteriores a esa revisión.

La composición añade 224 px de lectura a 390 px y 169 px a 1440 px dentro de la sección existente. Se mantiene un solo enlace común para las reseñas, sin carrusel, secciones adicionales ni más CTAs comerciales.

Validación en Chromium local; no Safari, Firefox, dispositivos físicos ni lectores de pantalla. El texto al 200 % se simuló duplicando los tamaños calculados. No se ha validado la apertura de la aplicación nativa de WhatsApp ni su receptor. No se comprueban ni cambian los datos provisionales de viajes. No hay medición de conversión, fecha de publicación de las reseñas ni destino confirmado para Ainhoa. Continúan los pendientes de permisos de reutilización para lanzamiento que ya recogía el inventario. La conclusión se limita a implementación y validación local; no acredita preparación comercial para publicar.

## Capturas

| Vista | 390 px | 1440 px |
| --- | --- | --- |
| Experiencia final | [Móvil](capturas/home-390-experience.png) | [Escritorio](capturas/home-1440-experience.png) |
| Experiencia anterior | [Móvil](antes/home-390-experience.png) | [Escritorio](antes/home-1440-experience.png) |
| Contexto de Marruecos final | [Móvil](capturas/marruecos-390-team.png) | [Escritorio](capturas/marruecos-1440-team.png) |
| Contexto de Marruecos anterior | [Móvil](antes/marruecos-390-team.png) | [Escritorio](antes/marruecos-1440-team.png) |
| Home completa | [Móvil](capturas/home-390-full.png) | [Escritorio](capturas/home-1440-full.png) |

Las capturas de sección conservan su ancho de origen; las de Marruecos muestran la columna de contenido, por lo que son más estrechas que el viewport.

## Archivos y versión

[Diff exclusivo de la tarea](task-only.diff), comparado con la copia exacta del checkout anterior, no únicamente con HEAD. [Huellas iniciales](baseline-hashes.json) y [manifiesto final](version.json).

- `dist/index.html`: texto, orden, pie de foto y dos voces dentro de experiencia.
- `dist/mobile.css`: presentación estática y responsive de las voces, sin cambiar reglas anteriores.
- `data/trips.json`: únicamente `testimonial.quote`, `testimonial.trip` y el nuevo `testimonial.context` en Marruecos.
- `scripts/render-trips.mjs`: contexto opcional escapado y atributo `cite`; compatible con testimonios que no tengan contexto.
- `dist/trip.css`: estilo del contexto de la reseña.
- `dist/viajes/marruecos/index.html`: salida generada actualizada; las seis se reconstruyeron.
- `README.md`, `docs/propuesta.md`, `docs/content-inventory.json`, `docs/asset-provenance.json`: revisión y trazabilidad, preservando los registros anteriores.
- Este directorio QA: archivos nuevos de evidencia, capturas y entrega.
