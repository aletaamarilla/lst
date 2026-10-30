# Detalle de viaje alineado con la home

Estado: implementación y validación local terminadas. Base Git: `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo sin commit conservado. No se ha hecho commit, push, publicación ni escritura en Sanity.

## Alcance y aceptación

- Mantener la home, los datos comerciales publicados, las rutas canónicas e históricas y los contratos de inscripción y WhatsApp.
- Mostrar fecha, duración, nivel y condiciones promocionales también en móvil, sin atribuir una tarifa a otra salida.
- Reutilizar Aura, Work Sans, crema, negro y naranja de la home; mejorar el ritmo con fotografía documentada del propio viaje.
- Retirar el retrato provisional de IA y conservar las funciones de acompañamiento acreditadas, sin inventar personas, ratios, plazos ni garantías.
- Reducir la navegación fija en móvil y mantener galerías, selector, foco y anclas utilizables.
- Validar datos heterogéneos, destinos pendientes o completos, escritorio y móvil; solicitar revisión independiente de la versión candidata.

## Evidencia de partida

- `node --test scripts/*.test.mjs` en WSL: 164 pruebas aprobadas, 0 fallos.
- Copias previas de los archivos de implementación en `before/`.

## Pendientes editoriales

No existe una foto real identificada de Lucas ni fotografías verificadas del alojamiento de El Palmar en el modelo actual. Las condiciones de cancelación y determinados vencimientos siguen pendientes de confirmación por el cliente. Esta tarea no los inventa ni publica cambios en Sanity.

## Cambios y alcance

- `scripts/render-trips.mjs`: resumen de fecha/duración/nivel/grupo; promoción asociada a su salida; acceso directo a condiciones; introducción abierta; foto de surf del archivo propio en el programa; foto documentada del grupo en lugar del retrato IA; avisos de cancelación ausente visibles y conservación de las condiciones existentes. Se elimina únicamente el aviso genérico duplicado, conservando avisos personalizados.
- `dist/trip-conversion.css`: Aura y paleta de la home, precio sobre negro, acompañamiento naranja, lectura y texto auxiliar más claros. Cabecera móvil en flujo de desplazamiento (posición absoluta en portada) y menú compacto con todas las secciones. La condición promocional también se ve en la barra inferior. Navegación de escritorio alineada con la columna de lectura.
- `dist/trip.js`: reconoce cabeceras fijas y no fijas para posicionar navegación y anclas; el menú aparece después del resumen. Conserva el controlador de galerías y diálogos.
- Nueva prueba `scripts/trip-home-alignment.test.mjs`; ajustes pertinentes en `trip-depth.test.mjs` y `trip-navigation.test.mjs`.
- 15 fichas canónicas/históricas regeneradas con `scripts/render-trip-pages.mjs` desde `sanity-published`. El comando también reescribe las 15 inscripciones con su plantilla vigente, sin cambios en el contrato del formulario. No se edita la home, el catálogo ni los datos del CMS.

## Validación y criterios

- Suite completa final: **170 aprobadas, 0 fallos** (`tests.log`). La base tenía 164 aprobadas.
- Generación de presentación: 30 páginas desde el snapshot público. `npm run check`: **PASS**, 40 páginas, rutas, anclas, imágenes, contratos, datos publicados y JavaScript (`check.log`). Se usa esta generación reproducible local en lugar de descargar/publicar datos comerciales con `npm run build`.
- Resumen móvil: El Palmar muestra 4–8 diciembre 2026, cuatro noches, todos los niveles y hasta 30 personas, antes de la introducción. La promoción local «Primeras 8 plazas» es visible en resumen y barra; las pruebas cubren también tarifas de otras fechas, capacidades distintas y estados completo/pendiente.
- Navegador real, manual: El Palmar a 1440×1000, 1024×900, 768×1024, 390×844, 320×740 y guardia de altura a 320×480. Sin desbordamiento horizontal en los tamaños inspeccionados.
- A 390×844: cabecera absoluta fuera de la zona de lectura al desplazar; menú entre y10–64 con las cinco secciones visibles; barra inferior de 114 px. A 320×740: barra de 129 px. A 320×480 pasa a posición estática y el relleno inferior del cuerpo a 0.
- Ancla `#plan`: título visible a y161 con menú hasta y64; `#condiciones` a y188 con menú hasta y156 en escritorio compacto. Tras corregir el roce de escritorio, menú entre x48–410 y tarjeta desde x661 a 1024 px.
- La foto del programa abre 6/6, y cerrar devuelve foco al mismo botón sin alterar la lectura.
- Maldivas: «Ver 2 fechas» abre el selector; elección de la segunda salida llega a `?salida=maldivas-2027-03-28`, fecha 28 marzo–4 abril y 1.399 € en la **previsualización local de promociones**. No se introduce información personal ni se envía el formulario. No se prueban pagos.
- Consola de la ficha en la sesión inspeccionada: sin errores JavaScript capturados.

Los importes promocionales de las comprobaciones visuales proceden del snapshot privado de desarrollo. El HTML de entrega se regenera exclusivamente desde el snapshot público; esta tarea no publica esos borradores.

## Revisión independiente

El revisor comparó los tres archivos de implementación con `before/`, consumidores de precios/depósitos y estados; ejecutó 54 pruebas relevantes (54 aprobadas), comprobó móvil y selector/retorno del foco, y no detectó bloqueos. Después revisó expresamente el ajuste final de posición de la navegación de escritorio, con CSS SHA-256 `c1e265aab793e6ba9e0a3581dfa5b43280f23bd184432b1f57b971a735e04261`.

La versión final se identifica en `candidate.sha256`. Mejora opcional futura: mostrar en el dock una fecha compacta cuando las tarifas de varias salidas difieran. No se añade otra línea fija en esta revisión: el resumen y el selector ya identifican la salida de la tarifa, se conserva «Desde» y la petición mantiene su fecha.

## Límites

Verificación en tamaños de navegador, no en un teléfono físico. No se valida el contenido de los PDF ni el envío externo del formulario. La preparación comercial de lanzamiento sigue dependiendo de los plazos, condiciones y fotografías pendientes indicados arriba.
