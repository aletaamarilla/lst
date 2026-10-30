# Revisión independiente de /viajes/

Revisor: subagente review_viajes. Base Git: 58f338661fc4705364fea08727c836e79b3f2048, main. El repositorio ya tenía cambios sin commit; la comparación de esta tarea usa las copias de before/, no el diff acumulado contra HEAD. Candidata final sin commit: archivos y SHA-256 de candidate.sha256. Hash final de dist/viajes/index.html: 74a8080a32bdcd70ebee3b3ee9ae728c6052b0c3593c320b766d53d9c335db7b; de dist/catalog.css: c00ec1f3554d883f4afe1ac45a612a7e552325b037cccc2945d99da64f2f3a6b.

Alcance revisado: scripts/render-catalog.mjs, la extracción original de renderHomeTrip en scripts/render-home-trips.mjs, los dos selectores de título h2 añadidos a dist/home.css, dist/catalog.css, dist/catalog-filter.js, dist/catalog.js, dist/viajes/index.html y sus consumidores app.js, home.js, trip-model.mjs, sanity-trips.mjs, build.mjs, enlaces de niveles y comprobaciones de catálogo. No se modificó implementación.

## Conclusión

Sin defectos bloqueantes pendientes en el alcance del catálogo contrastado. Una única cuadrícula presenta todos los destinos y solo permite filtrar por nivel y fecha. Mantiene las rutas, los detalles y las interacciones de tarjetas, y reutiliza el componente visual de la home. La selección de mes comprueba el intervalo completo de cada salida; al combinar nivel y mes, ambos coinciden sobre esa misma salida. Los destinos sin fechas permanecen visibles cuando no se selecciona mes. Los parámetros nivel antiguos siguen funcionando; estado se ignora al leer y se elimina al cambiar filtros. Los demás parámetros de consulta se conservan.

Contrasté el escape de JSON en data-departures, los niveles efectivos de salidas agrupadas, el orden cronológico, aria-labelledby/aria-describedby, los filtros hidden hasta disponer de JavaScript, el listado y detalles nativos sin JavaScript y los consumidores de navegación, menú y generación. Los datos del CMS y las rutas de detalle se conservan.

## Hallazgo resuelto

Las capturas iniciales a 320 y 390 px mostraban valores de los filtros recortados al compartir una fila estrecha. La regla final <=480 px apila los campos y reserva su anchura completa. Inspeccioné las capturas finales browser/viajes-320.png y browser/viajes-390.png: ambos valores se leen completos. La suite de navegador añade comprobación de apilamiento y anchura. No quedan acciones pendientes por este hallazgo.

También inspeccioné capturas de escritorio a 1440 px y tablet a 768 px: composición, tipografía, colores, tarjeta fotográfica, precio y acción mantienen la dirección visual compartida sin nuevos solapes observados.

## Evidencia ejecutada por el revisor

- Suite completa inicial en WSL: 66 pruebas aprobadas, cero fallos; check de 24 páginas aprobado.
- Suite completa final repetida independientemente tras los cambios concurrentes: 77 pruebas aprobadas, cero fallos; node scripts/check.mjs aprobado sobre las 24 páginas actuales.
- En la candidata inicial de esta tarea, comparación ejecutada del generador de home anterior y candidato con el snapshot publicado: HTML idéntico. La comparación de home.css en ese punto mostraba exclusivamente h2 añadido a dos selectores. Esta conclusión no se extiende a los cambios concurrentes posteriores de home.
- En el estado final, comparación ejecutada de dist/viajes/index.html con renderCatalog(actual, snapshot): igualdad exacta.
- Inspección visual independiente de las capturas finales 320 y 390 px y de las capturas 768 y 1440 px.

## Evidencia del implementador revisada

- browser.txt: 468 comprobaciones de navegador aprobadas, cinco anchos 320–1440, combinaciones nivel/mes, coincidencia sobre una misma salida, cruces de mes, historial, URLs antiguas e inválidas, fechas, teclado, menú, ausencia de JavaScript y texto ampliado.
- integration.txt: 220 comprobaciones aprobadas de integración de catálogo, home, guía y fichas. Revisé los ajustes de check-sanity-browser.mjs para las tarjetas compartidas y las rutas canónicas; el fallo antiguo de expectativas de rutas está reproducido en baseline-integration.txt.
- build-windows.txt: compilación real con Sanity publicado, seis destinos, en una salida aislada; build-windows-check.txt: 24 páginas aprobadas en esa salida.

La primera ejecución desde Windows dio EPERM al renombrar directorios temporales; la suite completa se ejecutó después con éxito en WSL. El navegador necesitó ejecución con acceso local permitido para abrir localhost. La primera compilación Linux no conectó con Sanity y la compilación real posterior en Windows sí terminó. Estas ejecuciones fallidas se distinguen de la evidencia final aprobada.

## Concurrencia y límites

Durante esta revisión otro trabajo modificó scripts/render-home-trips.mjs, dist/home.css y módulos de precios/modelo/pruebas, añadiendo una variante compacta y promociones de la home. Se preservaron sus cambios. candidate.sha256 identifica el estado conjunto final; la conclusión independiente de esta tarea se limita al catálogo y a su compatibilidad con ese estado, y no aprueba por extensión la funcionalidad ajena de promociones o el rediseño compacto. Los cambios de CSS de esa variante usan data-compact-home y las tarjetas del catálogo siguen sin activarla.

El comprobador del repositorio marcó transitoriamente una home sin regenerar durante ese trabajo paralelo; la repetición final del revisor ya pasa las 24 páginas. No se atribuye a esta tarea ni el cambio paralelo ni su sincronización posterior.

La revisión corresponde a los archivos identificados y a la evidencia indicada; no valida un despliegue ni promete ausencia absoluta de defectos.

## Addendum final: fechas al ocultar y recuperar una tarjeta

Se reabrió la revisión después del cierre anterior para un caso de interacción adicional. Una tarjeta con fechas fijadas se oculta al seleccionar nivel IV y vuelve al quitar el filtro. La primera implementación de catalog.js cerraba details.open directamente al ocultar la tarjeta; esto podía dejar pinned=true en home.js con open=false, haciendo que la siguiente pulsación no abriera el panel. Era un defecto de sincronización real al cambiar filtros sin un clic exterior que limpiara el estado, por ejemplo mediante teclado.

Corrección mínima revisada: catalog.js solo actualiza card.hidden y conserva el estado nativo de details. De este modo home.js sigue siendo el único propietario del estado open/pinned y no se necesita modificarlo ni importar el helper closeTripDates añadido por otro trabajo. Conservar abierto el panel al ocultar y recuperar la tarjeta no contradice los requisitos del catálogo.

La prueba de regresión fija las fechas, aparta el puntero, oculta y recupera la tarjeta mediante el filtro y comprueba la siguiente pulsación. Apartar el puntero antes del filtro evita que pointerenter de otra tarjeta al reordenarse la cuadrícula cambie el estado del control; sin ese paso el test confundía la apertura por hover y la fijación por clic y podía ser intermitente. Revisé ambas modificaciones sin editar implementación.

Versión de la corrección revisada: SHA-256 de dist/catalog.js = 06a7f8f910b0bf6ea6eacd74c72ce9f89dbef85e898fbba8a536184c26fcf017. SHA-256 de scripts/check-catalog-browser.mjs tras hacer determinista la prueba = f1b67a32759bb4ed59d5d69cc9eba018a91c8743e67431a011442582eef9daae. El resto del alcance se identifica en candidate.sha256; este addendum sustituye la conclusión anterior en lo referente a esos dos archivos.

Evidencia final: browser.txt registra 473 comprobaciones aprobadas, incluida la regresión en los cinco anchos. Repetí independientemente la suite completa y el comprobador del repositorio tras la corrección: 70 pruebas aprobadas, cero fallos, y check de 24 páginas aprobado. La variación respecto a las 77 pruebas de la ejecución previa corresponde a cambios concurrentes de la otra tarea; no se usa el recuento como prueba de equivalencia y no se extiende esta revisión a sus pruebas o funciones de precios.

Conclusión final del catálogo: sin defectos bloqueantes pendientes dentro del alcance revisado, incluido el control de fechas después de filtrar. Se mantienen las limitaciones de concurrencia y despliegue indicadas arriba. No se atribuye aprobación de esta revisión a ediciones posteriores de los archivos compartidos.
