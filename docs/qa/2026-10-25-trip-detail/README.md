# Detalle de viaje con personalidad LST · 25/10/2026

Implementación y validación locales terminadas. Sin commit, push, despliegue ni escrituras en Sanity. Base Git: 58f338661fc4705364fea08727c836e79b3f2048, checkout previamente modificado conservado. [Manifiesto y hashes](version.json), [diff de esta tarea](task.patch) y [base exacta](before/) identifican el alcance. Se modifican la plantilla común, un CSS nuevo y diez pruebas nuevas; se regeneran catorce rutas canónicas e históricas de seis destinos. trip.css y trip.js conservan sus hashes iniciales.

## Experiencia aplicada

La ficha toma Aura, Work Sans, Space Mono, crema/tinta/naranja, botones redondos y fotografía real de la home y las landings actuales. Portada con destino, frase propia, fecha/duración/nivel y enlace al cierre de consulta; franja de marca; resumen con tres servicios literales; programa con títulos descriptivos; nivel, alojamiento, inclusiones, acompañamiento y dudas; cierre naranja con los pasos de consulta. La tarjeta lateral en tinta y la barra móvil conservan el siguiente paso accesible. Las fotografías del cuerpo mantienen su encuadre; sus pies conservan el contexto histórico.

Los titulares descriptivos solo sustituyen «Programa N» en los destinos actuales. Los títulos editoriales personalizados y el contenido literal de programas, inclusiones, restricciones, señales y condiciones se conservan. Un alojamiento con título vacío recibe «Aquí recargamos.»; las FAQs vacías enlazan al contenido general. No se añaden servicios ni garantías comerciales.

## Early bird

Se reutilizan tripPriceDetails, departuresFor y promotionCondition, sin modificar sus reglas ni el esquema de Sanity. Resumen, tarjeta lateral, barra móvil y selector muestran el precio vigente, general tachado y condición; los bloques de oferta explican el ahorro. Con varias fechas, el bloque principal identifica la fecha de esa tarifa. Cada opción conserva su propio precio, nivel, PDF y mensaje de WhatsApp. Sin precio numérico no se antepone «Desde». Completos, pendientes y tarifas inactivas no anuncian descuento; no hay contador de plazas inventado. Sin JavaScript, las múltiples fechas tienen enlaces nativos de consulta.

El snapshot público sigue con seis destinos y cero promociones: las tarifas de la tarea anterior continúan en borradores. La vista con descuentos está aislada en artifacts/trip-detail-2026-10-25/preview. Usa únicamente promociones y notas de precio de los borradores retenidos, combinadas con los documentos publicados conservados. No publica documentos ni reemplaza dist con datos de borradores.

## Evidencia de aceptación

| Criterio | Evidencia |
| --- | --- |
| Datos vigentes por fecha, errores y compatibilidad | [80 pruebas PASS](tests.txt), incluidas diez nuevas sobre oferta por ubicación, fecha sin precio, estado completo/pendiente, fecha promocionada posterior, cupo textual, decimales, escape, sinJS y texto editorial |
| Recursos, generación y rutas | [24 páginas PASS](check.txt) y [24 de preview PASS](preview-check.txt): enlaces, anclas, assets, mensajes WhatsApp, contenido generado y noindex |
| Responsive y controles | [667 comprobaciones PASS](browser/results.json), sin errores de producto JS: 60 vistas de seis destinos con/sin promociones a320/390/768/1024/1440, más24 vistas de tres destinos con texto al200% y con/sinJS; fechas, foco, Escape, galería y controles44px |
| Imágenes reales | [Escritorio](browser/real-el-palmar-1440.png), [móvil](browser/real-el-palmar-390.png) y [Fuerteventura320](browser/real-fuerteventura-320.png), con imágenes CDN reales y fuentes locales; también inspección IAB |
| Revisión independiente | [Informe](revision-independiente.md), [hashes y evidencia](independent-review.json); código, compatibilidad, pruebas y geometría de nombres largos |

La matriz automática sustituye exclusivamente fotografías remotas por community.webp mediante rutas aisladas del navegador para separar el layout de la conexión externa. Las capturas real-* usan los assets CDN originales. No se abrió ni envió ningún mensaje al equipo. La primera aserción de imágenes confundía el logo lazy del pie, aún no solicitado fuera del viewport, con un recurso roto. Se corrigió el comprobador para validar imágenes eager y se repitió la matriz completa; no requirió cambiar el producto. El comprobador estático valida los recursos lazy por separado.

La revisión independiente detectó y se corrigieron la eliminación de condiciones en mayúsculas al limpiar PDF, el recorte del H1 Fuerteventura320, el prefijo sin precio y la duración única cuando las fechas son distintas. La versión final tiene pruebas de regresión y hashes identificables. No quedan bloqueos conocidos dentro del alcance revisado.

## Construcción y límites

La lectura remota de Sanity falló por conexión en este entorno; [registro](build.txt). No se presentó como una actualización remota correcta. Se comprobó equivalencia profunda entre el adaptador aplicado a los ocho documentos publicados retenidos y el snapshot actual, y se ejecutó el constructor normal con esa fuente inyectada: [registro](build-retained.txt) y [script reproducible](rebuild.mjs). Así se reconstruyó el sitio con exactamente los datos públicos existentes; las pruebas de integración también ejecutan el constructor completo. Refrescar contenido nuevo del CMS requiere conexión a Sanity.

La validación de navegador usa Chrome local; no incluye Safari/iOS físico ni medición de conversión en producción. La oferta se verifica como contenido de la preview, sin afirmar que esos borradores estén publicados ni que exista inventario en tiempo real. La publicación web y de promociones no se ha ejecutado.
