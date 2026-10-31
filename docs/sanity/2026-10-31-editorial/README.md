# Migración editorial de los viajes · 31/10/2026

El esquema y los renderizadores separan el contenido de cada viaje de la estructura de la web. Se reutilizan `tagline`, `destinationDescription`, `story`, `team` y `faqs`; se añaden `cardImage`, `testimonial` y `departures[].payment`. No se añaden contadores de reservas ni se activan promociones.

`seed.json` es un inventario único del contenido que ya mostraba la versión b10c1ad02fbf1c47ac49130899ae8ff9223ec5f7: frases, descripciones de respaldo, títulos del programa, selección de fotos y acompañamiento. El runtime no lee este archivo ni contiene mapas editoriales por destino. La migración solo completa campos vacíos; conserva descripciones y FAQs modificadas por un editor. Los títulos genéricos «Programa N» se sustituyen por sus títulos visibles anteriores. Se normalizan únicamente las FAQs que todavía coinciden exactamente con el inventario importado, para conservar las respuestas que mostraba la plantilla anterior antes de dar prioridad al CMS.

## Preparación y revisión

Desde la raíz:

```sh
npm run sanity:editorial
```

Usa `SANITY_IMPORT_TOKEN` privado o la sesión local de la CLI; no imprimir ni guardar credenciales en el repositorio. Guarda el plan, candidato y copia para previsualización en `artifacts/sanity-editorial-2026-10-31/` (ignorado por Git). Para una validación sin red:

```sh
npm run sanity:editorial -- --source=/ruta/al/inventario.json
```

El inventario offline contiene un array de documentos, una respuesta `{result:[]}` o una copia `{documents:[]}`. No sirve para aplicar cambios remotos.

Revisar los ocho documentos del plan, el contenido candidato y la convivencia de las siete rutas canónicas y sus alias. La migración no altera salidas, precios, promociones, señales, disponibilidad, niveles, PDF ni valores Brevo. Confirma que no apareció una edición posterior en Sanity.

## Crear borradores y publicar

```sh
npm run sanity:editorial -- --apply-drafts
```

Solo permite aplicar el mismo plan contra una lectura autenticada actual. Una transacción crea los borradores ausentes y añade exclusivamente los campos editoriales a los ya existentes, mediante patches con `ifRevisionID`. El plan conserva el snapshot de los borradores previos para verificar que sus promociones y otras ediciones pendientes no se alteran. Si cambia una revisión, falla todo el conjunto; no se reemplaza ningún borrador. Una versión de release bloquea la preparación. Si enlazar contenido compartido ocultaría cambios pendientes distintos de los del principal, se exige reconciliarlos antes. Al repetir, los borradores propios o documentos ya migrados se conservan sin restablecer campos que el editor haya cambiado o vaciado.

La revisión publicada de origen queda registrada en `editorialMigration.sourceRevision`. Crear borradores no modifica ni bloquea el publicado. Si cambia después, el paso de publicación lo rechaza por revisión, sin sobrescribirlo.

**No publicar los documentos de esta migración uno a uno desde Studio.** Las dos fechas históricas de Maldivas deben cambiar juntas para mantener sus URLs canónicas. Preparar una publicación atómica:

```sh
npm run sanity:editorial:publish
```

Revisar `publication-plan.json`, que incluye las revisiones del publicado y de cada borrador. Después de autorizar la publicación:

```sh
npm run sanity:editorial:publish -- --apply
```

Una sola transacción aplica todos los cambios editoriales. Retira únicamente los borradores nuevos creados por esta migración; **conserva los borradores que ya existían y sus promociones u otras ediciones pendientes**, que no se publican. Cada documento publicado usa `ifRevisionID`; cada borrador tiene una guarda de revisión en la misma transacción antes de conservarse o retirarse, según su origen. Cambios simultáneos, documentos ausentes, releases y planes incompletos abortan el conjunto. No se reemplaza el documento completo: solo se escriben los campos del plan revisado. Se verifica el contenido resultante. Un error o respuesta perdida exige releer Sanity, revisar los resultados y reconciliar antes de reintentar.

Orden de despliegue:
1. Desplegar el esquema del Studio para mostrar los nuevos controles.
2. Publicar atómicamente los ocho borradores con el plan revisado.
3. Reconstruir y desplegar la web nueva. Hasta completar este paso, no editar contenido compartido de las dos fechas de Maldivas: la web anterior todavía no conoce `editorialSource`.

El contenido de Maldivas se edita en el documento principal del 21/03; la fecha del 28/03 muestra una referencia de solo lectura a él y oculta los campos heredados. La web resuelve el programa y marketing comunes antes de agrupar, manteniendo los importes, fechas, disponibilidad, capacidad, dossier y condiciones propios de cada salida. Las referencias ausentes, anidadas o circulares se rechazan antes de sustituir la última web válida.

No desplegar la web nueva antes del contenido: los documentos antiguos siguen funcionando, pero mostrarían respaldos genéricos y perderían temporalmente las frases, títulos o citas que antes estaban en código. Los nuevos cambios de condiciones por salida deben publicarse junto con la web que los consume; la versión anterior no adapta ese campo desde Sanity.

## Recuperación

Antes de publicar, pueden descartarse exclusivamente los borradores nuevos creados por esta migración si no contienen nuevas ediciones. No descartar los borradores que ya existían: comparar su snapshot en el plan y retirar solo las adiciones editoriales, comprobando la revisión y conservando promociones y cambios posteriores. Después de publicar, usar el historial de Sanity y reconciliar el contenido editorial; no borrar salidas ni assets. Antes de editar el contenido compartido, la versión anterior acepta el inventario migrado inicial. Después de cambiar el principal, **no volver directamente al adaptador anterior**, que ignora `editorialSource`: el secundario conserva su snapshot original y podría separar Maldivas. Mantener esta capa de resolución al revertir otros cambios o sincronizar atómicamente los snapshots compartidos con el principal y verificar agrupación, rutas y aliases antes de reconstruir con el runtime antiguo. Si se han usado condiciones por salida, conservar también el adaptador que las consume o reconciliarlas explícitamente antes de volver atrás; no anunciar una señal común incorrecta. No eliminar la marca de migración para forzar una repetición.
