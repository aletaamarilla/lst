# Detalle de viaje · 27/10/2026

Implementación local terminada, con contenido añadido a Sanity. No se ha hecho commit, push ni despliegue de web o Studio. El árbol ya tenía un diff amplio antes de esta tarea; se ha conservado.

Base Git: `58f338661fc4705364fea08727c836e79b3f2048`. [Versión concreta](candidate-sha256.json), [diff de fuentes de esta tarea](task-source-diff.patch), [estado previo](git-before.txt). La versión independiente está identificada también en [su manifest](independent-candidate-sha256.json).

## Resultado comprobado

- Portada con nombre y nivel únicamente; carrusel de fotografías con gesto horizontal móvil, flechas de escritorio y ampliación accesible. Breadcrumb debajo de la portada y de la franja de ubicación/datos.
- Por qué el destino, fecha visible también en móvil y sección breve de para quién es el viaje, conservando los requisitos de autonomía.
- Actividades y spots en tarjetas visuales con desplazamiento horizontal. Plan de surf resumido con programa completo disponible, alojamiento con carrusel, incluido/no incluido, FAQs, inscripción y ayuda por WhatsApp. Viajes relacionados al final.
- Ficha lateral con precio, fechas, nivel, inscripción, PDF, WhatsApp y navegación por secciones. Barra inferior de inscripción fija en móvil, respetando el espacio de lectura y el área segura.
- Enlaces de WhatsApp verdes con icono. Inscripción, estados completos/pendientes, tarifas y promociones por fecha, PDF específico, mensajes contextuales y URLs históricas mantienen sus funciones.
- Dos correcciones de revisión: la fecha de salida única vuelve a estar visible en móvil; el foco se conserva cuando una flecha del carrusel se deshabilita al llegar al extremo. La cabecera al desplazarse es opaca y los enlaces dejan el título de sección visible.

## Sanity y contenido

Se añadieron campos opcionales a esquema, lectura, adaptador, agrupación y exportación de propuestas de promociones. Campos: `destinationDescription`, `destinationFacts`, `audience`, `activities`, `spots`, `spotsNote`, `surfPlan`, `stay.gallery` y `stay.galleryNote`. Los documentos antiguos siguen funcionando sin estos campos. La agrupación compara también el contenido editorial nuevo.

Los dos viajes de Marruecos y sus borradores existentes recibieron únicamente campos nuevos mediante `setIfMissing`, en una transacción protegida por revisión: `gB5MOe35iyZ11Q5PH4KXh1`. [Payload](content-plan.json), [transacción](sanity-transaction.json), [comparación de campos anteriores](sanity-compatibility.json), [assets](sanity-assets.json). Se preservaron las promociones privadas de la previsualización local; no se publicaron como parte de este cambio.

Fuentes: dossier I–II, páginas 3–8, y programa de Marruecos avanzado III. Los planes permanecen separados. El viaje de iniciación muestra Imsouane y el área de Agadir; el avanzado conserva sus cinco spots anunciados. Las condiciones y el contexto de las fotografías quedan visibles. No se traslada el coaching intensivo del avanzado al viaje I–II.

Las cuatro fotografías de actividades se recuperaron del dossier ya alojado en el mismo proyecto. Las tres fotografías de alojamiento son ejemplos ficticios generados con la herramienta integrada `image_gen`, revisados visualmente e identificados como orientativos. [Prompts completos y archivos finales](imagegen-prompts.json). Assets del proyecto: `dist/assets/trips/marruecos/surf-house-example-{terrace,bedroom,lounge}.webp`.

Referencia de composición y decisión: [detalle de Aleta Amarilla](https://www.aletamarilla.com/viajes-de-buceo/bali-penida-volcanes-mantas), conservando el diseño LST existente (Aura, Work Sans, crema, tinta y naranja).

## Validación

- [Base](tests-before.txt): 123/123 pruebas.
- [Final](tests-final.txt): 130/130 pruebas. Nuevos casos de portada limpia, secuencia editorial, datos opcionales, validación de imágenes, WhatsApp, agrupación y fecha móvil. Se adaptaron las expectativas de la estructura anterior.
- [Check](check.txt): 40 páginas, coherencia generada, enlaces, anclas, recursos, contacto, fechas y sintaxis.
- [Tipos de Studio](studio-check.txt): correctos.
- [Build de la web](build.txt): pipeline `buildSite` completo con los documentos publicados recién leídos de la API. La lectura remota se realizó desde Windows por los fallos de red de WSL; la construcción no usa borradores.
- [Build local de Studio](studio-build-local.txt): correcto, [salida 0](studio-build-exit.txt), con `--no-auto-updates` para usar las dependencias instaladas. La configuración del proyecto no se modificó. El comando habitual con actualizaciones remotas agotó su conexión a Sanity CDN: [registro](studio-build.txt).
- [Navegador Chrome](browser/browser-qa.json): siete viajes × 320/390/768/1024/1440 px, sin desbordamiento global. Gesto táctil real, teclado de rails, inscripción, selector de dos fechas/PDFs, Escape y retorno de foco, modal de fotos y alternativa sin JavaScript. Sin errores de página. [Cabecera y ancla móvil finales](browser/header-qa.json).
- [Revisión independiente](independent-review.md): implementación y compatibilidad, comprobaciones propias, hallazgos corregidos y manifest final.

Capturas: [escritorio](browser/marruecos-1440-final.png), [alojamiento](browser/marruecos-1440-stay.png), [móvil](browser/marruecos-390-final.png), [nivel con ancla móvil](browser/marruecos-390-audience-final.png).

## Publicación y recuperación

La vista local está en [Marruecos](http://localhost:4175/viajes/marruecos/). Para llevar el diseño y los controles editoriales nuevos al entorno alojado queda desplegar la web y Studio; el contenido nuevo ya existe en Sanity.

No hay migraciones obligatorias: los nuevos campos son opcionales, el código anterior los ignora y conserva sus datos. Las copias `before/`, el payload y las revisiones del CMS documentan la recuperación; no se han eliminado documentos ni assets previos. WSL y el puente de red se reiniciaron de forma intermitente durante el trabajo; se reanudaron y se repitieron las comprobaciones afectadas. No se enviaron mensajes, formularios Brevo ni pagos.
