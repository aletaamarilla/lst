# Home · dirección 03 · 24/10/2026

Iteración local solicitada después de rechazar la propuesta 02 por sobrecarga y falta de minimalismo. HEAD 58f338661fc4705364fea08727c836e79b3f2048; árbol con cambios previos conservados. No se modifica producción, ni datos o contratos de Sanity, ni las fichas y el catálogo.

## Requisitos observables y resultado

- Portada conservada byte a byte respecto a la home actual; variables visuales originales en el hero.
- Eliminados «Surfear juntos sabe mejor», la franja naranja y el bloque introductorio. Primer elemento dentro de main: #viajes.
- Tres cards: fotografía, destino y una línea de fecha/nivel; fecha próxima siempre visible. Sin descripción, precio, botones adicionales o panel de fechas. Hossegor conserva «autonomía» por su requisito publicado. Un enlace nativo por card y aria-describedby para la fecha y el nivel.
- Dirección del resto simplificada: cinco bloques de contenido; destinos, nivel con fotografía documental, acompañamiento/origen, tres preguntas y contacto. Fondo crema, naranja puntual y tipografía de menor tamaño. Se retiran paneles cromáticos, gran escala Aura, cifras decorativas y secuencias de reserva repetidas.
- Los cuatro niveles mantienen nombres y enlaces de filtrado existentes. Se conserva la guía para orientar; no se asigna un nivel al visitante.
- Las fotos documentales se identifican como viajes anteriores. Cantabria conserva proporción 3:2. El contenido de acompañamiento y origen procede de /conocenos/.

## Fuente, versión y alcance

Archivos activos: artifacts/home-propuesta-02/template.html, index.html, proposal.css y render.mjs. serve.mjs sin cambios, misma vista http://127.0.0.1:4186/. Se reutilizan servidor y pestaña. La propuesta 02 queda archivada en artifacts/home-propuesta-02/revisions/02/ con sus cinco archivos y hashes. La carpeta artifacts está ignorada por Git y esta muestra no forma parte del despliegue de dist.

La generación lee únicamente dist/catalog-snapshot.json de Sanity publicado; fecha de la muestra 24/10/2026. Muestra la primera salida confirmada no finalizada por viaje, ordena las tres primeras y conserva el estado completo y el escape HTML. Fechas visibles de esta candidata: Hossegor 20–22 nov 2026, El Palmar 4–8 dic 2026, Marruecos 17–24 ene 2027. No se inventan datos comerciales. El número de personas, programas, precios y condiciones se consultan en las fichas.

## Validación de esta iteración

- Generación local correcta e idempotente desde el snapshot.
- Sintaxis Node de renderer y servidor correcta.
- Nueve comprobaciones ejecutadas sobre fecha próxima, salidas desordenadas/pasadas, selección de tres, una única ruta por card, estado completo/vacío, escape HTML, placeholder, estructura mínima y portada intacta. Pasan. El primer lanzamiento del fragmento de comprobación tenía una expresión regular mal escapada; se corrigió el fragmento y se ejecutó completo. No fue un defecto del producto.
- Doce comprobaciones de navegador en evidence/03/browser-results.json: 320, 390, 768 y 1440 px sin desbordamiento y con tres cards; destinos como primera sección; menú móvil y Escape; Rookies abre catálogo con filtro nivel=1; Hossegor abre su ficha; FAQ nativa con clic/Enter; sin errores de consola; imágenes cargadas tras recorrer el contenido. No se abren contactos externos ni se envían mensajes.
- Revisión independiente con ejecución propia de renderCards y contraste de HTML, datos, enlaces, filtros, IDs, estados y siete hashes baseline de producción. Sin hallazgos bloqueantes sobre la versión de candidate.sha256.json. La revisión visual se ejecutó por el implementador, no por el revisor.
- Los siete archivos de producto registrados en baseline.sha256.json conservan sus bytes. No se repite toda la batería de producción porque no cambia su código; el resultado 48/48 de la iteración anterior es evidencia previa y no se presenta como ejecución de esta tarea.

## Límites

Propuesta de diseño local, no integrada ni publicada. sampleDate congela la muestra; para integrar se debe conectar este componente al build y definir la actualización comercial real. QA en el navegador disponible, sin certificar Safari/Firefox ni dispositivos físicos. La conversión no está medida. Los hashes exactos permiten distinguir esta versión de la revisión anterior.
