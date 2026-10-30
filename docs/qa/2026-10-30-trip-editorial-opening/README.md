# Portada completa y ritmo editorial del detalle

Base: trabajo sin commit sobre `58f338661fc4705364fea08727c836e79b3f2048`, después de la revisión trip-home-alignment. Se conserva el trabajo previo. Referencias: capturas aportadas por el usuario (ficha breve de Travelhood y bloque inicial de Marruecos).

## Criterios de aceptación

- Fotografía inicial completa, sin recortar personas ni superponer el nombre/nivel sobre la imagen, con mayor presencia en escritorio.
- Nombre, duración y datos útiles breves inmediatamente después de la fotografía; solo información existente del viaje.
- Separación visible entre introducción, perfiles de nivel, comunidad y programa; conservar voz, paleta y tipografías de LST.
- Conservar precios, cupos, estados, términos, rangos de nivel, URLs, inscripción, WhatsApp, galerías, foco y navegación.
- Revisar Marruecos en escritorio/móvil y contrastar otras proporciones de foto y varias fechas. No publicar borradores comerciales.

## Base comprobada

170 pruebas aprobadas, 0 fallos (`baseline-tests.log`). Copias previas de la implementación y pruebas afectadas en `before/`.

## Estado

Implementación y validación local terminadas, sin commit ni publicación. Sin cambios en la home, el catálogo ni Sanity. Vista local reiniciada en la misma URL `http://localhost:40091` para cargar la plantilla nueva.

## Cambios de esta iteración

- `scripts/render-trips.mjs`: fotografía sin nombre/nivel superpuestos; proporción derivada de dimensiones del asset; identidad con un único h1 inmediatamente debajo, duración, fecha(s), nivel, grupo y el primer dato de destino si existe. Se reutilizan contacto y condiciones; no se inventan datos de clima. El caso sin imágenes evita un hueco fotográfico vacío.
- Comunidad y reseña se agrupan en un panel con foto auténtica del propio viaje; esa imagen deja de repetirse en el bloque del acompañante. La reseña de Laura conserva destino y contexto histórico y no pasa a otros viajes.
- `dist/trip-conversion.css`: encuadre completo con contain, cabecera crema separada de la foto, ficha con datos en línea e iconos, más aire entre capítulos, perfiles en tarjetas y panel de comunidad oscuro con firma de LST. Se unifican los títulos principales que tenían estilos diferentes.
- Ajustes de pruebas a la ubicación nueva del título y al texto de datos pendientes; nueva `scripts/trip-editorial-opening.test.mjs`. `dist/trip.js` no cambia en esta iteración.
- Se regeneran 15 fichas canónicas/históricas y las 15 inscripciones con sus plantillas vigentes desde el snapshot público, sin alterar rutas ni contrato de formulario. Las promociones de la vista local siguen siendo borradores privados; no se trasladan al HTML publicado.

## Evidencia de aceptación

- Suite final: **174 aprobadas, 0 fallos** (`tests.log`), frente a 170 aprobadas en la base.
- `npm run check`: **PASS**, 40 páginas y comprobaciones de rutas, anclas, recursos, datos publicados y JavaScript (`check.log`). Generación local reproducible con `scripts/render-trip-pages.mjs`.
- Marruecos a 1440×1000, scroll0: cabecera hasta y88, portada y88–1000, imagen contain. No queda tapada por la cabecera. La foto completa ocupa la primera pantalla; la ficha de datos empieza inmediatamente después. Al limitar la altura al viewport pueden aparecer bandas laterales oscuras en vez de recortar la imagen.
- Marruecos a 390×844: cabecera hasta y78, portada y78–328 (375×250), título y datos debajo; documento de375px sin desbordamiento. Ficha de297.5px incluida la duración, datos y condiciones de oferta.
- Marruecos a768×1024: portada y78–580; documento de753px; panel de comunidad en dos columnas sin desbordamiento. En escritorio, las tarjetas de nivel y el panel de comunidad se inspeccionaron visualmente con su nueva separación.
- Marruecos avanzado a320×740: único h1 de dos líneas dentro de209px; documento de305px; fotografía contain y datos de su salida propia (24–31 enero, nivelIII y hasta10personas).
- Fuerteventura a1024×900: proporción1322/1044, portada de796.8px desde y88; imagen contain y documento de1009px. Se conserva el encuadre de una foto de proporción distinta.
- Galería móvil de Marruecos: desplazamiento horizontal 1/6→2/6; cerrar devuelve el foco a «Ver fotos06» y mantiene scroll0.
- Ancla `#condiciones`: y97.5 con menú hasta y64 y sección «Precio» activa. El menú sigue apareciendo después de la ficha breve.
- Maldivas: «Ver2fechas» abre el selector; cerrar devuelve el foco al mismo botón; se conservan precios/promociones por fecha y las condiciones de aplicación.
- Contacto de la ficha conserva destino wa.me y contexto del viaje; no se envían mensajes, datos personales ni formularios. Consola de la sesión inspeccionada sin errores JavaScript capturados.

## Revisión independiente y versión

El revisor contrastó los cambios con `before/`, verificó las cinco huellas de `candidate.sha256` y ejecutó **56 pruebas relevantes: 56 aprobadas**. No detectó bloqueos en h1/aria-labelledby, geometría, ramas sin imágenes, estados pendientes/completos ni tarifas y contratos. Render SHA-256 `67bf22b8…`, CSS `01d41704…`; huellas completas en el manifiesto.

Límite de independencia: su sesión no tenía navegador disponible, por lo que la validación visual descrita arriba corresponde al implementador y no se presenta como independiente. No hubo modificaciones del revisor.

## Límites que se conservan

Las condiciones comerciales pendientes, el vencimiento de ciertos pagos y la falta de una foto identificada de Lucas o fotografías verificadas de algunos alojamientos no se resuelven inventando contenido. No se prueba el envío externo del formulario, el contenido de los PDF ni un teléfono físico.
