# Tarjetas de la home · 13/10/2026

**Ajuste posterior solicitado:** «Ver viaje» y «Ver destino» pasan a botones naranjas. [Versión actual y capturas](botones/README.md). Las capturas, medidas y revisión independiente de este informe corresponden a la versión anterior con acción subrayada.

Implementación local de LST sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de`, incluyendo como base funcional todos los cambios previos sin commit. El repositorio verificado es `git@github.com:aletaamarilla/lst.git`. No se ha hecho commit, push, publicación ni despliegue.

## Resultado y decisiones

Las seis tarjetas priorizan foto, destino, fecha/periodo o «Próximamente», una línea de duración/nivel y acceso al detalle. Toda la tarjeta es un único enlace nativo; el texto de acción pertenece al mismo enlace y el nombre accesible incluye destino y acción. El foco usa un contorno de 3 px y no depende del hover.

Se mantienen Aura, Work Sans, Space Mono, los tokens de color, logos y las seis fotografías documentales existentes. El Salvador conserva 25 oct–1 nov 2026, siete noches, nivel II–III y autonomía. Asturias conserva noviembre 2026, dos noches y todos los niveles; ambas salidas siguen en su ficha. Los cuatro destinos pendientes mantienen «Próximamente» y todos los niveles, sin inventar duración ni fechas.

Se retiran de las tarjetas las descripciones largas, localizaciones secundarias, rótulos de fechas confirmadas, superposiciones sobre fotos, precios/condiciones, bloques de reserva, separadores interiores y notas de disponibilidad. Las fichas que contienen la información ampliada permanecen idénticas. Se omite el precio para dejar una única acción de exploración y reducir competencia visual. No se sustituye el contenido eliminado por publicidad.

La home se edita directamente, según README; no es una salida del generador. Se conserva ese patrón y no se introduce otra estructura de datos comerciales. `data/trips.json`, sus modelos y generadores no cambian. Las tarjetas del catálogo por niveles usan su generador y CSS originales.

Travelhood se consultó mediante su build local existente en navegador, sin editarlo: [referencia observada](capturas/travelhood-tarjetas-1440.png). Se toma su agrupación breve de fotografía, destino y datos, sin trasladar colores, tipografías, promesas o disponibilidad.

## Antes y después

[Comparativa visual navegable](comparacion.html), [comparativa móvil](capturas/comparacion-mobile.png) y [comparativa escritorio](capturas/comparacion-desktop.png).

| Ancho | Antes | Después | Alto con fecha: El Salvador / Asturias |
| --- | --- | --- | --- |
| 320 px | [Captura](capturas/antes-320.png) | [Captura](capturas/despues-320.png) | 621 / 644 → 327 / 327 px |
| 390 px | [Captura](capturas/antes-390.png) | [Captura](capturas/despues-390.png) | 536 / 578 → 366 / 366 px |
| 768 px | [Captura](capturas/antes-768.png) | [Captura](capturas/despues-768.png) | 709 / 709 → 366 / 366 px |
| 1440 px | [Captura](capturas/antes-1440.png) | [Captura](capturas/despues-1440.png) | 634 / 634 → 479 / 479 px |

Las cifras corresponden al alto de las tarjetas, sin el espacio entre ellas; las fotos siguen siendo protagonistas. En móvil las tarjetas pendientes usan filas compactas y conservan la foto completa. Al crecer el texto se apilan sin cortar nombres. A partir de 700 px hay dos columnas; desde 1100 px los pendientes forman cuatro. En cuadrícula se mantiene el encuadre 3:2 previo y el foco de Azores, alineando títulos, fechas y acciones por fila.

Las capturas de sección ocultan solo durante la captura la cabecera fija y el enlace de salto, que Playwright podría colocar encima del contenido al fotografiar una sección larga. Esto no modifica el producto. [Foco móvil con cabecera real](capturas/foco-390.png), [foco escritorio](capturas/foco-1440.png), [texto al 200 % en 320 px](capturas/texto200-320.png).

## Criterios y evidencia

| Criterio | Evidencia ejecutada |
| --- | --- |
| Datos y estados correctos | Contraste con JSON y baseline; datos, modelos y fichas idénticos por hash. |
| Sin ruido superpuesto y lectura breve | Inspección visual de antes/después en 390/1440 y candidata en 320/768; fotografías sin etiquetas. |
| Legibilidad y reflujo | 14 px en fecha/estado, 15 px en meta/acción; geometría sin desbordamiento en cuatro anchos, normal y texto al 200 %. |
| Un enlace por tarjeta, foco y área pulsable | Orden Tab por seis tarjetas, contorno visible sin quedar bajo cabecera, Enter y clic sobre las fotos; toda el área de la tarjeta es enlace. |
| Destinos correctos | 24 clics sobre fotos en la prueba de tarjetas y 24 recorridos Enter independientes. |
| Sin dependencia de JS/hover | Navegación sin JavaScript en cuatro anchos; acción siempre visible. |
| Catálogo, filtros y fichas | Suite UX, recorridos independientes de filtros y preservación de archivos; véase el límite del comprobador amplio de niveles abajo. |
| Portada y trabajo previo conservados | Comparación exacta de HTML fuera de tarjetas y hashes de todos los archivos existentes al iniciar. |

- `npm run build`: seis fichas y bloque del catálogo generados; [log](build.log). Los archivos generados mantienen sus bytes iniciales.
- `npm test`: 5/5; [log](test.log).
- `npm run check`: ocho páginas, rutas, anclas, assets, estados, consultas y sincronización con generadores; [log](check.log).
- `scripts/check-home-cards.mjs`: 455 comprobaciones, cero incidencias y errores JS; [JSON](browser-home.json). Matriz 320/390/768/1440 × normal/texto200/sin JS.
- `scripts/check-ux.mjs`: 1.171 comprobaciones, cero incidencias y errores JS; 43 consultas WhatsApp interceptadas sin contactar al equipo; [JSON](integracion-fichas/verification.json). Incluye menú, anclas, galería, fechas, teclado, foco y pantalla baja.
- Revisión independiente de la candidata final: 45 comprobaciones aprobadas, cuatro anchos, reflujo al 200 %, enlaces, fotos, filtros y preservación; [informe con hashes](revision-independiente.md), [JSON propio](revision-browser.json).
- `node --check scripts/check-home-cards.mjs` y `git diff --check`: correctos.

El primer pase de la nueva prueba detectó una diferencia de redacción «Nivel»/«Niveles» al comparar el mismo rango II–III y una imagen diferida pendiente de carga al volver de una ficha. Se corrigieron las esperas/comparaciones del comprobador. La revisión visual sí produjo un cambio de producto: reflujo de pendientes al ampliar el texto, repetido y revisado en la versión final.

## Límite del comprobador amplio de niveles

`node scripts/check-levels.mjs` se ejecutó dos veces sobre la candidata y se detuvo por timeout en `scripts/check-levels.mjs:146`, esperando el destacado transitorio de Rookies a 1440 px con scroll suave, después de 1.532 comprobaciones aprobadas, sin incidencias de los filtros ni errores JS registrados. No se presenta la suite completa como aprobada. [Primer intento](browser-levels-primer-intento.log), [segundo intento](browser-levels.log), [resultado parcial](integracion-niveles/browser.json).

Se contrastó con una copia de la base funcional inicial: home anterior y los mismos archivos de guía, estilos, scripts y fichas, comprobados por hash. Un primer pase con servidor estático Python terminó 1.609/1.609 ([log](base-levels.log), [JSON](base-niveles/browser.json)); no bastaba para comparar condiciones de carga. Se repitió con una copia exacta del servidor Node del proyecto, cambiando únicamente el puerto. Con el mismo runtime, navegador, matriz y comprobador, la **base reproduce el mismo timeout en la misma línea y secuencia: 1440 px, Supercracks → Supercracks → Rookies**, después de las mismas comprobaciones funcionales aprobadas. [Log base equivalente](base-levels-node.log), [JSON base equivalente](base-niveles-node/browser.json), [contraste de respuestas y secuencia](levels-baseline-comparison.json). La incidencia ya existe en la base y no se corrige dentro de este rediseño. No se atribuye al servidor como causa: la animación es intermitente y la causa precisa queda fuera de esta tarea.

Una comprobación focalizada a 1440 px repitió tres veces la secuencia Supercracks → Supercracks → Rookies en cada versión. Un observador de clases detectó el destacado en los 18 casos. En dos repeticiones de Supercracks de la candidata, el foco se mantuvo pero la posición final quedó fuera de la vista; no se reprodujo en las tres de la base. Los archivos implicados no cambian en esta tarea y no se interviene en esa interacción de la guía. Se conserva como incertidumbre de esa animación/scroll, fuera del rediseño de tarjetas. [Diagnóstico comparado](motion-comparison.json), [script](motion-comparison.cjs).

Los filtros y enlaces del catálogo se verificaron por separado en la revisión independiente y en las comprobaciones anteriores al timeout. La navegación, el foco y los tamaños de las tarjetas de home pasan sobre la candidata final. Esta entrega valida el rediseño local dentro de ese alcance; no declara una validación global completa de todas las animaciones de la guía.

## Archivos y versión

Producto: `dist/index.html` y nuevo `dist/home-cards.css`. Solo cambia el bloque de tarjetas y la carga de esa hoja en la home; sus selectores quedan bajo `#viajes`.

Validación: nuevo `scripts/check-home-cards.mjs`; `scripts/check-ux.mjs` cambia únicamente el selector de la acción de pendientes. Documentación: se añaden entradas a `README.md` y `docs/propuesta.md`, más esta carpeta de evidencia.

[Estado inicial](baseline.json), [preservación](preservation.json), [diff exclusivo de esta tarea](diff-esta-tarea.patch) y [hashes finales](version.json). La aprobación independiente corresponde a los hashes de producto indicados en su informe, sin atribuirla al resto del diff previo del repositorio.

La validación es local en Chromium. No se han probado Safari, Firefox, lector de pantalla ni dispositivos físicos. No se ha medido conversión ni se considera una validación de los datos provisionales para lanzamiento.
