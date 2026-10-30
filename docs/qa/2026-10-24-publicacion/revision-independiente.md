# Revisión independiente de publicación · 24/10/2026

Conclusión: sin bloqueos conocidos dentro del alcance comprobado. Las ocho salidas aprobadas están publicadas y la web sirve el contenido revisado. No se modificaron archivos de implementación durante esta revisión; este documento es su único archivo nuevo.

Versión revisada:

- Repositorio `aletaamarilla/lst`, base inicial `73dc52dca750482853b1fc5973953ea1675b1fc2`; se contrastó además la instantánea de inicio `/tmp/lst-publication-baseline` para distinguir la integración previa sin commit de esta tarea.
- Implementación revisada: `7adcb4e5ea0f96e1d7adf3b5326a706079b99f1a`.
- Versión final: `22e4b0d529a288da2f6b610b72ec1469614bed30`. Su delta añade el contenido generado de las ocho salidas y aclara en la guía que un cambio de precio exige revisar también el formulario externo. No cambia scripts ni Studio respecto a la implementación revisada.
- Vercel production: `dpl_7kciA7WucUNzvC2Ud6WW6ygfwCVz`, estado `READY`, commit final anterior; dominio `https://lst-sepia.vercel.app`.
- Sanity: `q5bj2rn2 / production`; las ocho revisiones publicadas son `2D42OFpIbrkQoZrdHVJ2Zy`. `published-readback.json`: SHA256 `9ab6e02c9f3a07a219415e5f20b8e12059ef35df7cd255a941947520e3178a7d`.

El revisor ejecutó y contrastó directamente:

- Las 44 pruebas de `sanity.test.mjs`, `trip-model.test.mjs` y `catalog-filter.test.mjs`: todas pasan.
- Fechas, precios generales, señales fijas, niveles y canales de los ocho documentos frente al inventario y a la lectura real previa a publicación. La aprobación comercial humana registrada sustituye los pendientes históricos, que permanecen solo como trazabilidad interna.
- Comparación exacta del modelo público obtenido de los documentos publicados con el snapshot descargado de la web: coincide. El único cambio editorial posterior a la revisión previa es la frase neutra de Hossegor «Consulta las condiciones con el equipo». Los cambios `stay.image: null` corresponden a la proyección, sin cambio del contenido.
- Descarga independiente de los 33 archivos de texto finales: todos responden 200 y sus SHA256 coinciden tanto con `final-deployed-bytes.json` como con `dist`. No se detectaron indicadores de tokens, notas editoriales o revisiones internas en esos archivos.
- Lectura de las tres copias PDF corregidas: hashes coinciden con `pdf-updates.json`; conservan señales de 270 € / 325 €, retiran equivalencias porcentuales inexactas y no contienen enlaces a Google Forms. Sus enlaces de solicitud usan WhatsApp, con un enlace contextual por salida. Los originales se conservan.
- Lectura de los ocho Google Forms originales sin enviar datos: respondieron 200 y sus títulos corresponden a los destinos. Se detectaron equivalencias porcentuales antiguas en Marruecos y Senegal; esos tres formularios se retiraron del recorrido publicado, incluidos sus enlaces dentro de los PDF. Cinco salidas conservan formularios; las otras tres usan WhatsApp.

Se contrastó la siguiente evidencia de ejecución del implementador con el código y el resultado público:

- Studio local autenticado, con el mismo esquema desplegado y contra el dataset real: editar el borrador no generó mensajes de webhook durante la observación, no cambió la web y la consulta anónima devolvió cero borradores; Publish produjo acciones HTTP 200, entrega del webhook 201 y despliegue automático correcto. Véase `studio-editorial-cycle.json`, `hook-messages.json` y `latest-deployments.json`.
- Despublicar Hossegor reconstruyó la web y retiró el contenido comercial: snapshot con cero salidas y ficha 404. Después se publicaron las ocho versiones mediante guardas de revisión. Véase `unpublish-web.json`, `final-reviewed-drafts.json` y `published-readback.json`. El filtro usa before/after para cubrir el evento de eliminación del documento publicado y excluye drafts y versions; no añade infraestructura al deploy hook directo de Vercel.
- `live-browser.json`: 22 vistas a 390 y 1440 px, con portada, catálogo, niveles y ocho fichas; filtros, fechas, precios, disponibilidad, enlaces de solicitud/PDF, imágenes decodificadas y galería/foco; cero errores JavaScript y cero envíos externos. El primer intento falló por el valor inexistente `all` al reiniciar un filtro; se corrigió únicamente el arnés a `value=""` y la repetición pasó.
- `live-verification.json`: snapshot igual a Sanity; ocho imágenes y ocho PDF HTTP 200 con hashes verificados; cinco formularios HTTP 200; seis rutas privadas HTTP 404; cero coincidencias de los secretos conocidos en los textos públicos y el build de Studio. SHA256 de esta evidencia: `dd8089eeeb8aeb90a720908ef311134a9d43f6144d2bd3c2981b5a0785b8387f`.
- Build final: ocho salidas de Sanity; comprobación final: 19 páginas y enlaces/recursos locales correctos. Véase `build-final.txt` y `check-final.txt`.

Hallazgos resueltos antes del cierre:

- Un viaje completo con varias salidas perdía sus fechas y precios individuales al retirar el selector. Ahora conserva un resumen visible y no ofrece solicitud; la prueba cubre dos fechas y precios distintos.
- Los documentos antiguos sin disponibilidad confirmada pasaban a afirmar «Plazas disponibles». Se mantiene el estado de consulta para valores desconocidos y el fallback de cero plazas a completo; el estado manual explícito prevalece.
- Un aviso editorial almacenado podía seguir invitando a solicitar al marcar completo. El renderer sustituye ese aviso y la regresión está cubierta.
- Los formularios de Marruecos y Senegal contradecían las señales fijas. La web y las copias PDF publicadas usan WhatsApp para esas salidas hasta que se corrijan los formularios fuente.

Límites de la conclusión:

- Se probó la edición/publicación autenticada en Studio local contra production real. El Studio alojado está desplegado y exige login; no se completó una sesión autenticada de su interfaz alojada por falta de sesión disponible del dashboard.
- No se enviaron solicitudes reales ni se comprobaron su recepción, pagos o confirmación comercial de reservas. Los formularios externos de Marruecos/Senegal siguen pendientes de corrección, pero no forman parte del recorrido publicado.
- Los estados «Últimas plazas» y «Completo», la reapertura y las fechas múltiples están comprobados con pruebas/fixtures; las ocho salidas finales publicadas muestran «Plazas disponibles», según la confirmación humana.
- Los archivos del CDN son accesibles por URL. La exclusión de borradores de la web y de la consulta anónima no convierte sus assets en privados. La revisión de secretos queda limitada a los archivos y patrones/valores efectivamente comprobados.
- La revisión no promete ausencia absoluta de defectos ni cubre cambios posteriores a las versiones identificadas.
