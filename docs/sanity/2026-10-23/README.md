# Preparación Sanity · Let’s Surf Together · 23/10/2026

Preparación documental terminada. No se ha implementado la conexión, cambiado el esquema, importado contenido, escrito en Sanity ni alterado la web. No es una autorización de publicación. Los datos acreditan lo que muestran los PDF, no la disponibilidad ni la vigencia comercial actual.

## Versión y estado conservado

Repositorio verificado: `/home/amfernandez/personalProjects/letsurftogethersystem`, remoto `git@github.com:aletaamarilla/lst.git`, HEAD `73dc52dca750482853b1fc5973953ea1675b1fc2`. `package.json`, README, contenido y Studio identifican LST. No se ha accedido a ningún repositorio de otro cliente.

Estado previo: modificados `.gitignore`, `README.md`, `package.json`; nuevos `studio/` y `docs/qa/2026-10-19-sanity-studio/`. Se conservan íntegros. Esta entrega añade exclusivamente `docs/sanity/2026-10-23/` sin commit. Se aplicaron las instrucciones AGENTS.md proporcionadas en el chat; no se encontraron AGENTS.md adicionales en el repositorio ni en sus ancestros.

Stack: web estática HTML/CSS/JS, generadores Node ESM sin dependencias raíz; `data/trips.json` como fuente, `dist/` versionado. Studio independiente con Sanity 6.19.0, React y TypeScript; requiere Node >=22.12 según su configuración. `studio/sanity.config.ts` ya contiene `q5bj2rn2/production`. La organización `oCsOalTXP` coincide con la evidencia local previa de `docs/qa/2026-10-19-sanity-studio/`; en esta tarea no se volvió a consultar el estado remoto ni sus documentos, permisos o CORS. No se leyeron archivos de credenciales.

## Entregables y lectura

- [salidas.json](salidas.json): ocho salidas normalizadas, con cifras visibles, condiciones, enlaces y pendientes. Es un inventario de preparación, **no un fichero de importación**. No sustituye `data/trips.json`.
- [evidence-extraction.json](evidence-extraction.json): texto bruto y anotaciones de enlace de las 101 páginas. Incluye texto oculto antiguo; no usar como contenido final.
- [visual/](visual/): ocho hojas de contacto con todas las páginas y tres páginas completas para discrepancias. No se han duplicado los PDF ni extraído sus fotos para publicar.

En el JSON cada `source.pages` remite a páginas físicas, contadas desde 1, del `source.file` de esa salida. El archivo y su SHA256 identifican la fuente; la fecha de revisión no es fecha de actualización comercial. `null` significa desconocido, nunca cero. Los resúmenes normalizados se apoyan en esas referencias; los detalles completos se conservan por página en la extracción. Las etiquetas de nombre con nivel o temporada son identificadores editoriales derivados de las portadas.

## Ocho salidas: cifras visibles

Importes en EUR por persona según el dossier. Todos los cupos son **capacidad total publicada**, con plazas disponibles desconocidas. Ninguna promoción se marca vigente. No se selecciona automáticamente un precio aplicable.

| Salida | Fechas del programa | Nivel | Noches | Capacidad | Tarifas publicadas | Señal publicada | Página comercial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hossegor | 20–22/11/2026 | 2–3, autonomía | 2 | 6 | 399 € | 200 €; resto 199 € antes del viaje | PDF 4, p. 10 |
| El Palmar | 04–08/12/2026 | Todos | 4 | 30 | 599 € plazas 1–8; 649 € plazas 9–20; 699 € plazas 21–30 | 250 €; resto más adelante | PDF 5, p. 10 |
| Marruecos 1 | 17–24/01/2027 | 1–2 | 7 | 15 | 860 € primeras 5; 899 € desde la 6.ª | 270 € / 30 %; resto 70 % antes del viaje | PDF 6, p. 11 |
| Marruecos 2 | 24–31/01/2027 | 3, autonomía y tabla corta | 7 | 10 | 860 € primeras 5; 899 € desde la 6.ª | 270 € / 30 %; resto 70 % antes del viaje | PDF 7, p. 11 |
| Fuerteventura | 12–16/02/2027 | 1–2 | 4 | 12 | 649 € primeras 4; 699 € resto | 250 €; resto antes del viaje | PDF 8, p. 9 |
| Senegal | 28/02–07/03/2027 | 2, olas propias y primeras paredes | 7 | 12 | 1.269 € primeras 5; 1.299 € resto | 325 € / 25 %; resto antes del viaje | PDF 9, p. 12 |
| Maldivas Semana Santa | 21–28/03/2027 | 2–3, autonomía | 7 | 10 | 1.399 € early bird sin cupo concreto; 1.499 € general | 500 €; resto un mes antes | PDF 10, p. 11 |
| Maldivas Pascua | 28/03–04/04/2027 | 2–3, autonomía | 7 | 10 | 1.399 € early bird sin cupo concreto; 1.499 € general | 500 €; resto un mes antes | PDF 11, p. 11 |

Las fechas son del programa en destino, no necesariamente de salida o regreso del vuelo: Senegal regresa a Madrid el 08/03; Maldivas propone salir el sábado anterior. No se modifica la fecha del viaje para hacerla coincidir con los vuelos.

### Discrepancias resueltas por inspección visual

- Marruecos 1 y 2, p. 11: la extracción conserva «hasta el 18 de octubre» / «a partir del 19 de octubre». El render visible indica **5 primeras plazas / a partir de la 6.ª**. No se establece una caducidad en octubre ni se interpreta la promoción como activa.
- Marruecos 2, pp. 3 y 11: capacidad visible **10**, frente a «15» antiguo en la extracción de p. 11. [Página 11 visible](visual/7-p11-condiciones.png).
- Senegal, p. 12: se ven early bird 1.269 €, general 1.299 € y señal 325 € / 25 %. El texto oculto conserva «RESTO 974 €» / «75 %». No se usa ese saldo como condición vigente. [Página 12 visible](visual/9-p12-condiciones.png).
- Senegal, p. 11: titular de vuelo «desde 415 €» y captura con 405 €. Se registran ambos como referencias del PDF, sin elegir una cotización actual.
- Marruecos: 270 € no equivale exactamente al 30 % de todas las tarifas. Senegal: sucede lo mismo con 325 € / 25 %. Se conservan ambos datos publicados y se pide aclaración; no se deduce un saldo fijo ni se corrige el precio por intuición.

### Condiciones y límites que deben conservarse

Hossegor exige seguro de viaje; material y transporte aparte. El PDF ofrece reembolso o bono si cancelan por malas condiciones (pp. 10–11); no es una política universal de cancelación del viajero. El Palmar incluye material y seguro de la escuela local; esto no acredita un seguro general de viaje. Marruecos 1 incluye material de iniciación/neoprenos, excluye evolutivas/shortboards; Marruecos 2 pide tabla propia o alquiler. No se mezclan programas de ambas semanas.

Fuerteventura incluye desayunos/comidas y 2 cenas; las otras 2 cenas van aparte. Senegal incluye desayuno/cena y una noche en el desierto; excluye comidas del mediodía y bebidas de esa cena. Maldivas incluye pensión completa, transfers y barco de surf; no aclara material ni cobertura de seguro, solo descuento en seguro. No se amplían las exclusiones por analogía.

Los spots, actividades sujetas al mar y ejemplos de día no se convierten en itinerarios diarios garantizados. El snorkel en Maldivas es opcional/plan B, sin garantía de avistamientos. Los acompañamientos 24h y respuestas en 24–48h se registran como afirmaciones publicadas, pendientes de aprobación para la web. No se generan políticas legales, fotos, testimonios o credenciales profesionales nuevos.

Vuelos: Marruecos «menos de 50 €», Senegal «desde 415 €»/captura 405 €, Maldivas «1.000–1.300 €». Son estimaciones documentadas sin fecha de cotización fiable, fuera del precio del paquete y sin revalidar. `flightEstimate.currentPrice` queda vacío. Los horarios y números de vuelo también son referencias del PDF, no horarios consultados a la aerolínea.

## Enlaces reales de solicitud

Extraídos de las anotaciones del PDF y asociados a los botones visibles; no abiertos, enviados ni verificados en vivo. No son enlaces de pago. WhatsApp común: `https://wa.me/34648189257`. El JSON conserva además página y URL de los contactos, Instagram, web y seguro IATI cuando está enlazado.

| Salida | Destino real de los botones | Páginas |
| --- | --- | --- |
| Hossegor | https://forms.gle/sserHWdhwvDMVxYQ6 | 12 (dos anotaciones) |
| El Palmar | https://forms.gle/Gmej3QWiKTHbuTo98 | 11 y 12 |
| Marruecos 1 | https://forms.gle/XVUNbUQcfya4AVq99 | 13 (dos anotaciones) |
| Marruecos 2 | https://forms.gle/3mNhFAThLgK6QDRn6 | 13 (dos anotaciones) |
| Fuerteventura | https://forms.gle/pY8QksJYRBTKV3hY8 | 11 (dos anotaciones) |
| Senegal | https://forms.gle/oNnjdJMaRGnTvuSJ9 | 14 (dos anotaciones) |
| Maldivas Semana Santa | https://forms.gle/nDxuYXFPq4XZx6B2A | 11 y 13 |
| Maldivas Pascua | https://forms.gle/ps3zG2BRLwK8UkB3A | 11 y 13 |

Las rutas locales de los PDF no son enlaces públicos de dossier. `dossierPublicUrl`, `hero` y `gallery` quedan vacíos hasta disponer de recursos aprobados y sus URLs reales.

## Consumidores reales y mapeo propuesto

| Dato del inventario | Campo propuesto en Studio | Consumidor actual / adaptación futura |
| --- | --- | --- |
| `id`, nombre y región | `_id` estable, `name`, `slug`, `place` existentes | `render-trips.mjs`: URL, título, cabecera; catálogo y niveles: enlaces/identidad. `_id` y slug no deben derivarse de nuevo en cada edición. |
| `dates`, `duration` | `departures[]` existente con `_key`, `start`, `end`, `duration` | Adaptador a `id`, `date` en español, `start/end`, `duration`, `state`. `departuresFor`, `tripFacts`, consultas y selector de fechas requieren esos valores. |
| `levels.value`, requisito | `levels`, `levelRequirement` existentes y `levelText`, `levelChecks` si se usan en ficha | `levelsFor`, `levelLabel`, detalle, `render-catalog.mjs`, `render-level-trips.mjs`, filtros JS por nivel y enlaces `?nivel=`. No dejar niveles vacíos: el modelo actual los convierte en Todos. |
| Precio aplicable validado | `departures[].price` existente; `priceNote` | `tripPrice`, barra móvil, ficha lateral, selector. No copiar el early bird sin vigencia a `price`, ni usar `trip.price` como fallback involuntario. |
| Tramos publicados | Objeto `pricing` con moneda/unidad y lista interna `tariffs` (importe, etiqueta, primeras/últimas plazas opcionales, condición, vigencia) | No tiene consumidor estructurado actual. Hasta adaptación, precio por confirmar y condiciones textuales aprobadas; jamás sumar cupos como disponibilidad ni anunciar «desde» con oferta no validada. |
| Señal y saldo | Objeto interno `payment` (importe/porcentaje opcionales y vencimientos textuales) | No existe consumidor de pagos. Ficha/FAQ/reserva solo texto; abrir formulario o WhatsApp no cobra ni confirma plaza. No motor de cobro ni cálculos automáticos en esta fase. |
| Capacidad y disponibilidad | Objeto `capacity`: `total`, `available` opcional, estado de disponibilidad | Sin filtro actual de plazas; `notice` muestra aviso aprobado. El filtro `confirmed` significa Con fecha. No significa Con plazas. Sin inventario, contador restante ni motor de reservas. |
| Resumen y programa | `tagline`, `intro` existentes; `storyTitle/Label/Intro` y `story[]` de objetos `{title,text}` | `render-trips.mjs` consume títulos y pares `[title,copy]`; convertir objetos a pares. Agrupar por temas documentados, sin generar itinerarios. |
| Inclusiones/exclusiones | `includes`, `excludes` existentes; `inclusionsNote` explícita | `render-trips.mjs` consume arrays de strings. Debe evitarse su fallback actual «habitación compartida» cuando no lo pruebe la fuente. |
| Alojamiento/equipo | Objetos internos `stay`, `team`, según los campos ya usados en JSON | Ficha de alojamiento y acompañamiento. `stay` actual exige imagen/alt/note: omitir bloque o adaptar hasta tener foto aprobada; no inventarla. `team` solo funciones documentadas. |
| Preguntas/respuestas del PDF | `faqs[]` existente, objetos `{question,answer}` | Adaptar a pares `[pregunta,respuesta]` antes del render; revisar afirmaciones comerciales volátiles. Fuente completa en extracción por página. |
| Formularios y pasos | Objeto `booking` con `formUrl`/canal/proceso aprobado | Hoy todos los CTA se generan con `wa.me`; `bookingAction`, `departureMessage`, cabecera y FAQs no consumen URL de formulario. Cambio de canal requiere decisión explícita y ajuste coherente. |
| URL pública del dossier | `dossier` existente, HTTPS | Enlace de descarga de ficha lateral y resumen móvil. No copiar rutas Windows/WSL. |
| Fotos aprobadas | `hero` existente, `gallery[]` de objetos imagen/alt/caption, configuración visual existente si hace falta | Hoy los renderizadores construyen `/assets/${hero}` y galería usa tuplas. Una referencia Sanity no sirve directamente: adaptar URL y dimensiones, o descargar imágenes aprobadas a assets en el build. No añadir un CDN cliente a ciegas. |
| Evidencia | `sourceFile`, `sourcePages`, `checkedAt`, notas/discrepancias internos; mantener `source` URL existente si la hay | Trazabilidad editorial. El `source` actual es URL, incompatible con la ruta local: no sobrecargarlo. `checkedAt` no certifica vigencia de tarifas. No publicar extracción bruta. |
| Estado de publicación | Borrador/aprobación comercial independiente de `state` | Inventario local queda fuera de publicación. Una salida con fecha y precio pendiente no debe convertirse en destino «por anunciar» solo por estar pendiente de aprobación. |

Además, `dist/index.html` mantiene manualmente seis tarjetas/calendario: **no se actualiza desde CMS ni desde el build actual**. Para una conexión coherente, el mínimo futuro es generar solo ese bloque desde el mismo modelo normalizado, conservando su diseño y orden editorial. `dist/catalog.js` y `catalog-filter.js` filtran por `data-levels` y `data-state`; `dist/levels.js` filtra atributos equivalentes. No consultan Sanity en el navegador.

No hay formularios propios, API, CRM, pagos o almacenamiento de solicitudes. `scripts/check.mjs` rechaza `<form>`, email y `mailto:` en las páginas; conservar contactos de PDF como evidencia no autoriza insertarlos en el HTML. Un enlace externo a formulario evita crear backend, pero requiere aprobar el cambio de recorrido y comprobar los destinatarios/permiso del formulario.

## Esquema mínimo recomendado (propuesta, sin código)

Reutilizar el documento **`trip` existente**, con **un documento editorial por salida** para estas ocho, y objetos/listas internos. Reutilizar `name`, `slug`, `place`, portada, niveles, `departures`, precio, aviso, inclusiones, exclusiones, FAQs y dossier. Para estas salidas `departures` contendría un único objeto; conservar soporte de varias fechas en los consumidores y documentos antiguos, sin imponer ahora una restricción global incompatible. La identidad es de la salida, aunque se mantenga el nombre técnico `trip`.

Añadir solo los grupos de datos que faltan: `pricing`, `payment`, `capacity`, `booking`, trazabilidad y los campos narrativos/visuales realmente consumidos indicados en la tabla. Son objetos y arrays del documento, sin documentos separados de hotel, país, precio, nivel, actividad, política o equipo. No hacen falta referencias entre destinos para resolver ocho dossiers. La extracción bruta y hojas de contacto permanecen como evidencia local, fuera del CMS.

Restricciones propuestas para la fase posterior: fechas válidas con fin >= inicio; nivel explícito 1–4 sin duplicados; importes positivos en EUR; cupos enteros positivos; disponibilidad ausente o entre 0 y capacidad solo cuando esté confirmada; IDs/_key y slugs únicos; no habilitar oferta sin confirmación comercial; no deducir plazas disponibles de un tramo. El editor debe poder conservar una contradicción como pendiente sin publicar datos parciales.

**Rutas y convivencia:** no reemplazar silenciosamente los documentos de destino actuales por estas salidas. Propuesta de rutas nuevas, aún no implementadas: `/viajes/hossegor-2026-11-20/`, `/viajes/el-palmar-2026-12-04/`, `/viajes/marruecos-2027-01-17/`, `/viajes/marruecos-2027-01-24/`, `/viajes/fuerteventura-2027-02-12/`, `/viajes/senegal-2027-02-28/`, `/viajes/maldivas-2027-03-21/`, `/viajes/maldivas-2027-03-28/`. Mantener `/viajes/marruecos/`, `/viajes/cadiz/` y las demás rutas actuales; una revisión posterior puede convertirlas en destino con enlaces a salidas, con decisión explícita. No mezclar niveles ni programas de Marruecos para ahorrar una ficha. Maldivas comparte contenido, pero cada semana tiene formulario, fechas y capacidad propios.

**Integración futura mínima:** lectura de Sanity durante generación → adaptador explícito al contrato existente → un mismo snapshot para fichas, catálogo, niveles y tarjetas de home. Publicar un documento en Studio no actualizará por sí solo el sitio estático: habrá que acordar una reconstrucción manual inicialmente. No añadir SSR, API de reservas, webhooks ni nuevos servicios para este alcance. Conservar el JSON validado anterior y HTML generado para revertir; ante error de lectura o validación, abortar el build sin vaciar el catálogo ni sobrescribir la última versión válida. El catálogo actual y sus datos demo no se borran/importan por defecto.

## Pendientes comerciales (respuesta necesaria antes de conectar/publicar)

1. **Canal de solicitud:** ¿se mantienen los CTA de WhatsApp o se usan los ocho formularios? Confirmar acceso, destinatarios y vigencia de esos formularios, teléfono, proceso posterior y promesas de respuesta. No se han inspeccionado sus campos.
2. **Oferta vigente:** confirmar que las ocho salidas siguen a la venta, tarifas aplicables, tramos disponibles y cupos early bird de Maldivas. Capacidad total no acredita plazas libres. Elegir qué convive con El Salvador y la demo de Asturias, sin reemplazarlos automáticamente.
3. **Pagos y condiciones:** resolver importes/porcentajes en Marruecos y Senegal; vencimientos exactos, condiciones de cancelación por salida y alcance del seguro/material, especialmente Maldivas. No extrapolar la excepción de Hossegor.
4. **Material de publicación:** fotos originales/aprobadas con procedencia, URL pública de cada dossier, alojamiento/equipo confirmado donde falte. No basta con que una imagen esté incrustada en un PDF para atribuirle derechos o vigencia.
5. **Presentación y operación:** aprobar fichas por salida y rutas nuevas conservando enlaces existentes; determinar quién aprueba contenido y cuándo reconstruye/publica la web tras editar Sanity.

No hace falta resolver vuelos actuales para preparar el esquema: puede omitirse su precio y conservar la asesoría documentada. Si se quieren publicar recomendaciones concretas, deberán revalidarse horarios y tarifas al publicarlas.

## Validación y revisión

Se comprobaron ocho archivos, sus 101 páginas renderizadas, condiciones comerciales visibles y enlaces de anotación, sin visitar ni enviar los formularios. Las imágenes de las hojas de contacto documentan el cotejo; las páginas completas resuelven los conflictos señalados. El JSON separa los datos desconocidos y el texto oculto descartado. La comprobación estructural y los resultados de los consumidores existentes constan en `validation.txt`.

Revisión explícita local del alcance y documentos; no se solicitó revisión independiente de implementación porque esta entrega solo añade inventario y propuesta, sin cambio funcional. No se presenta como revisión independiente. La evidencia previa del despliegue de Studio no se atribuye a esta entrega. No se han probado integración, publicación, autenticación de editor, formularios ni disponibilidad remota. La siguiente fase necesita adaptar y validar consumidores antes de considerarse preparada para despliegue.
