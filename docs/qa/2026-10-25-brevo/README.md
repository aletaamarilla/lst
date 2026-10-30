# Inscripciones Brevo · 25/10/2026

Implementación y validación locales terminadas. Sin commit, push, despliegue ni escrituras en Sanity o Brevo. Base `58f338661fc4705364fea08727c836e79b3f2048`, checkout previo conservado: [estado inicial](initial-git-status.txt). [Alcance y hashes](version.json), [diff de implementación, pruebas y documentación](task.patch) y [copias anteriores](before/) distinguen esta tarea. Se regeneran catorce fichas existentes y se añaden catorce rutas de inscripción (seis destinos y ocho alias). El snapshot público conserva exactamente sus datos anteriores.

## Comportamiento

`/inscripciones/{slug}/` usa una plantilla común con identidad LST y los campos del HTML recibido. Se conservan action, nombres, valores, obligatoriedad, países, honeypot y locale. Se envía FormData directamente a Brevo con `isAjax=1`, el modo utilizado por el script oficial. No requiere claves API ni un servidor de datos personales. Sin JavaScript funciona el POST nativo de Brevo.

Una fecha única queda seleccionada. En un destino con varias fechas se exige elegir una; los enlaces de una salida concreta usan `?salida={departure.id}` y la preseleccionan. Los alias fechados también seleccionan su fecha. Un parámetro desconocido o un alias cuya fecha esté cerrada muestra un aviso y exige elección, sin sustituir la fecha automáticamente. «Inscribirme» se añade al cierre de reserva, ficha lateral y selector, con alternativa nativa; las consultas de WhatsApp se conservan.

Las ocho categorías se vinculan por destino y fechas inicial/final exactas: Hossegor=1, Palmar=2, Marruecos enero17=3 y enero24=4, Fuerteventura=5, Senegal=6, Maldivas marzo21=7 y marzo28=8. Un campo opcional `brevoValue` en cada salida de Studio permite configurar nuevas fechas sin ampliar la tabla; exige un entero positivo y no admite IDs activos duplicados entre salidas o destinos. Una fecha nueva debe existir en Brevo antes de configurar su ID.

Viajes completos, pendientes o sin correspondencia muestran consulta al equipo y carecen de formulario/CTA. El constructor retira formularios antiguos al despublicar, conservando avisos en las rutas históricas. Una URL desconocida devuelve 404. El servidor local renderiza las inscripciones desde las plantillas vigentes y respeta los estados de la preview.

El envío bloquea dobles clics; errores de validación, servidor, red, tiempo de espera o respuesta no válida conservan los datos y permiten reintentar manualmente. No hay reintento automático, almacenamiento local ni datos personales en la URL. Los mensajes remotos se insertan como texto. El éxito bloquea nuevos envíos y no se presenta como reserva o pago confirmado. Redirecciones malformadas o no HTTPS no convierten un envío aceptado en fallo.

## Evidencia

| Criterio | Evidencia |
| --- | --- |
| Contrato Brevo, estados, fechas y compatibilidad | [99 pruebas PASS](tests.txt), incluidas ocho nuevas; build/despublicación y no mutación de preview |
| Construcción con contenido publicado actual | [build remoto correcto](build.txt), ocho documentos publicados y seis destinos; snapshot sin cambios |
| Rutas, enlaces, anclas, recursos y generación | [38 páginas PASS](check.txt) |
| Esquema de Studio | [TypeScript PASS](studio-check.txt) |
| Uso real del navegador y errores | [184 aserciones PASS](browser/results.json), Chrome a 320/390/768/1440, 200% de texto, payload exacto, enlaces, alias, éxito, errores de campo/red/HTTP/JSON, doble envío, redirecciones y POST sin JavaScript |
| Composición visual | [Móvil](browser/marruecos-390.png), [escritorio](browser/marruecos-1440.png), también 320 y 768 |
| Revisión independiente | [Informe y hallazgo resuelto](revision-independiente.md), 180 aserciones propias y comprobaciones de código/contrato |

La matriz intercepta todas las peticiones externas, sustituye únicamente las fotos remotas por un asset local y nunca crea un contacto o envía WhatsApp. El primer intento del comprobador encontró dos problemas del propio harness: seleccionaba un CTA de cabecera oculto en móvil y multiplicaba tamaños heredados al ampliar texto. Se corrigieron usando el CTA visible y calculando todos los tamaños antes de aplicarlos. El contexto sin JavaScript necesitó movimiento reducido para estabilizar el scroll automatizado. No se alteró producto para corregir esas pruebas.

## Límites y publicación

La cuenta de Brevo sigue siendo responsable de sus listas, confirmaciones y automatizaciones. No se ha verificado recepción real: hace falta una prueba acordada con el cliente. Se soportan mensajes y redirecciones HTTPS, pero no el HTML de éxito personalizado (`successPage`). No se valida compatibilidad con cualquier configuración futura del formulario; si cambian campos/opciones/action, debe actualizarse el contrato común.

La disponibilidad es editorial y se actualiza al reconstruir: una página ya abierta puede quedar desactualizada hasta recargar. No hay inventario, pagos ni historial de reservas implementado. El esquema de Studio y la web aún requieren despliegue. Los textos jurídicos/consentimientos son los del formulario recibido, sin inventar permisos de marketing adicionales.

La base ya tenía 91 pruebas correctas y seis fichas generadas desactualizadas frente a su plantilla (Marruecos/Maldivas y sus cuatro alias). La reconstrucción resuelve esa discrepancia; los datos comerciales no cambian. `git diff --check` global señala espacios en archivos ajenos a esta tarea (`catalog.js`, `catalog-filter.js` y su test); no se modifican. La revisión y los hashes corresponden al diff de esta tarea, no a todos los cambios anteriores del checkout.
