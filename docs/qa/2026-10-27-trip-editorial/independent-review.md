# Revisión independiente · detalle editorial de viaje · 27/10/2026

Revisión de implementación y compatibilidad, sin modificar archivos de implementación. Base Git compartida: `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo sin commit. La comparación de esta tarea usa `before/`; la versión final revisada está identificada en `independent-candidate-sha256.json`.

## Resultado

Sin hallazgos bloqueantes pendientes dentro del alcance comprobado. Dos defectos P2 identificados durante la revisión se corrigieron y se volvieron a comprobar sobre la versión final:

- **Fecha invisible en móvil después de limpiar la portada.** La primera versión dejaba la fecha única solamente en la ficha lateral, oculta en móvil. El renderer final muestra `trip-summary-dates` debajo de la introducción. Verificación propia: el HTML final generado, cargado directamente en Edge a 390 px con recursos locales, muestra 17–24 enero para Marruecos, 24–31 enero para avanzado, las dos fechas de Maldivas y 20–22 noviembre para Hossegor. El bloque está visible y no causa desbordamiento.
- **Pérdida de foco al llegar al extremo de un carrusel.** En la primera versión, deshabilitar Siguiente enviaba `document.activeElement` a BODY. El controlador final conserva el elemento enfocado antes de cambiar `disabled` y mueve el foco al track. Verificación propia en Edge: al llegar a 06/06 el foco queda en `cover-carousel-track`; ArrowLeft vuelve a 05/06. La ampliación de una foto y Escape retornan al botón que la abrió.

## Evidencia propia

- `independent-tests-final.txt`: 130/130 pruebas pasan.
- `independent-check-final.txt`: 40 páginas, coherencia con renderer/snapshot, enlaces, anclas, recursos, WhatsApp contextual y sintaxis pasan. Una ejecución intermedia durante la regeneración había detectado únicamente fichas desactualizadas; se repitió después de regenerar.
- `independent-studio-check.txt`: TypeScript de Studio pasa.
- Navegador Edge real a 320, 390, 768, 1024 y 1440 px: ancho del documento igual al viewport; portada, actividades, spots y alojamiento tienen desplazamiento horizontal. Dock fijo visible en móvil/tablet y oculto en escritorio. El botón del carrusel cambia de 01/06 a 02/06. No se observaron errores de JavaScript en ese recorrido.
- La comparación propia del snapshot previo con el final conserva todos los campos existentes de los siete viajes; solo `stay` cambia en los dos Marruecos por adición de galería y nota. Precios, promociones, salidas, autonomía, programas, inclusiones, exclusiones, dossiers, mensajes, pagos, capacidad, slugs y aliases previos se mantienen. Los campos editoriales nuevos de ambos viajes son aditivos.
- Revisión del adaptador, lectura de Sanity, agrupación de viajes y schema: campos nuevos opcionales; imágenes restringidas al proyecto; publicación sigue usando perspectiva `published`; la agrupación compara también el contenido editorial nuevo y evita perder programas distintos. Las acciones de inscripción y los PDFs por salida mantienen sus funciones existentes.

## Límites

No se enviaron mensajes, solicitudes Brevo ni pagos. No se desplegó la web ni Studio durante esta revisión. No se ejecutó el build remoto de Sanity desde el revisor; se revisó el pipeline y se comprobó de forma independiente la coherencia de su salida. La redirección WSL/Windows fue intermitente: para la comprobación final de fechas se usó el HTML generado actual mediante `setContent`, con recursos locales servidos por 4175, en vez de atribuir ese resultado a una instancia con imports antiguos. La QA visual completa y la transacción del CMS pertenecen al implementador, no se presentan aquí como ejecutadas por el revisor.

## Ajuste final de cabecera

Revisado el último cambio de CSS: la cabecera desplazada o con menú abierto recibe `background:var(--paper)`, evitando que el contenido de la página se superponga al logo y navegación. La regla se limita a la cabecera del detalle y sus dos estados existentes. El contraste del manifest confirmó que únicamente cambió `dist/trip-detail.css` desde la versión revisada; renderer, JavaScript, schema, pruebas y datos mantienen sus hashes. Manifest actualizado a esta versión final. No se repitieron pruebas funcionales por este ajuste de fondo.

## Consumidor de promociones

Revisado el diff final de `scripts/update-trip-promotions.mjs` frente a su copia previa específica. Únicamente amplía la query de lectura con las proyecciones de `activities.image`, `spots.image` y `stay.gallery`, equivalentes a la lectura pública, para que la exportación candidata resuelva las referencias de las nuevas imágenes. Se comprobó por comparación exacta que no cambió código fuera del bloque `const query`: planificación, importes, promociones, escrituras, credenciales y flujo de ejecución se conservan. No se ejecutó el actualizador ni se efectuaron mutaciones. Manifest final ampliado con este consumidor. Las pruebas/check repetidos por el implementador para este último ajuste son evidencia del implementador; las ejecuciones independientes anteriores constan arriba. Sin nuevos hallazgos bloqueantes.
