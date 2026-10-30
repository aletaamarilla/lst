# Revisión independiente · Canal único WhatsApp · 24/10/2026

Conclusión: sin bloqueos materiales para el encargo dentro del alcance comprobado. Los documentos actuales de Sanity, Studio, las fichas y sus PDF activos usan WhatsApp para consultar las salidas. Se conservaron los ocho documentos que ya estaban publicados; no se publicaron salidas nuevas ni se cambiaron sus condiciones comerciales.

Versiones revisadas:

- Base: `22e4b0d529a288da2f6b610b72ec1469614bed30`, además de la instantánea de inicio `/tmp/lst-whatsapp-baseline`.
- Implementación: `50ffb54`, «Use WhatsApp exclusively for all trip enquiries».
- Final: `58f338661fc4705364fea08727c836e79b3f2048`, «Preserve all WhatsApp enquiry buttons in trip PDFs». Su delta cambia únicamente tres referencias PDF en el snapshot y sus tres fichas; no modifica scripts ni Studio.
- Vercel production: `dpl_BigR4dz63Zm3NjB7Br7pax3maTSU`, estado `READY`, commit final anterior, dominio `https://lst-sepia.vercel.app`.
- Sanity: `q5bj2rn2 / production`. `final-after.json` tiene SHA256 `12d0bd742d7d8ae9576a939dfe9cfb2877b424aea56de11ee8e0b7953b453dd3`. Cinco documentos tienen revisión `L3ZrvhdiWtwAlFI8eP7TeH`; Marruecos, ambas salidas, y Senegal tienen `L3ZrvhdiWtwAlFI8eP7jYV`.

El revisor comprobó directamente:

- 44 pruebas del candidato de implementación: todas pasan. Cubren la eliminación del canal antiguo incluso si se inyecta un `booking` heredado, WhatsApp contextual por fecha y la conservación de estados de disponibilidad y viajes completos.
- La retirada de `booking` del esquema de Studio y del modelo público. El renderer ya no crea solicitudes a formularios y el importador estándar deja de cargar su URL en las notas nuevas.
- Los ocho patches iniciales con `ifRevisionID`: IDs publicados existentes, eliminación de `booking`, cambio de referencias PDF/notas y corrección de «compartir habitación en formulario» a «por WhatsApp» en El Palmar. Las tres reparaciones posteriores de PDF también utilizan guardas de revisión y solo cambian sus referencias.
- Comparación del estado inicial con `final-after.json`: ocho mismos IDs publicados, ningún borrador, ningún `booking` ni URL/campo Google Forms en los documentos actuales. Permanecen idénticos estado, disponibilidad, fechas, precios, señales, niveles, inclusiones, exclusiones, programa, FAQ y fotografías.
- Ocho PDF locales finales: hashes coinciden con `pdf-changes.json` y `pdf-repairs.json`; no contienen enlaces Google Forms ni etiquetas «formulario». Cada PDF conserva las dos áreas originales de CTA con enlace contextual a WhatsApp. Se contrastaron página, rectángulo y URI. La reparación de los tres PDF anteriores conserva exactamente su texto extraído, sin cambios comerciales.
- Web final: snapshot igual a la lectura final de Sanity adaptada con el código extraído del objeto Git del commit final; ocho fichas HTTP 200, cuarenta enlaces de consulta WhatsApp contextuales y referencias PDF actuales, sin enlaces de formulario.
- Descarga independiente de los 33 archivos públicos de texto: todos HTTP 200 y sus SHA256 coinciden con `git show 58f338661fc4705364fea08727c836e79b3f2048:dist/...`. No se detectaron Google Forms, `data-application` ni indicadores internos comprobados en esos archivos.

Se contrastó además la evidencia del implementador:

- `live-browser.json` / `live-browser.txt`: 16 vistas de fichas a 390 y 1440 px, 80 enlaces de consulta WhatsApp, cero formularios, errores JavaScript o mensajes enviados. El último commit mantiene la misma implementación y solo cambia tres referencias PDF, comprobadas por separado.
- `live-verification.json`, `live-pdfs.json` y `live-pdf-validation.json`: lectura pública coherente con Sanity y descarga de los ocho PDF activos, con hashes y ausencia de enlaces Google Forms comprobados.
- Studio desplegado con el campo de formulario retirado, compilación y comprobaciones guardadas en `studio-check.txt`, `studio-build.txt`, `studio-deploy.txt`, `build-final.txt` y `check-final.txt`.

Hallazgo bloqueante resuelto: las redacciones de texto de los PDF eliminaban anotaciones de enlace que se habían actualizado antes. Se cambió el orden para reinsertar los enlaces después de redactar y se comprobó cada área de CTA al reabrir el PDF guardado. La comprobación se amplió a los tres PDF procedentes de la tarea anterior.

Mejora opcional: en esos tres PDF reparados queda una anotación contextual anterior superpuesta a la nueva en el CTA inferior. Ambas usan el mismo número y salida; solo cambia ligeramente el mensaje de consulta. Las dos áreas requeridas funcionan con WhatsApp, por lo que no se considera bloqueo del canal único.

Durante el cierre apareció trabajo concurrente ajeno en el checkout. Se preservó íntegramente; el revisor no modificó implementación ni ejecutó más pruebas/builds sobre ese estado mutable. La comprobación final de procedencia utilizó exclusivamente los objetos Git de los commits identificados y la evidencia remota. Las 44 pruebas corresponden al candidato revisado antes de esos cambios ajenos, no validan dicho trabajo concurrente. Este informe es el único archivo nuevo creado por el revisor en esta tarea.

No se enviaron mensajes ni solicitudes reales. Los originales de los PDF y el historial anterior se conservaron; la revisión de limpieza se refiere a documentos y assets actualmente enlazados, no a la eliminación física de originales históricos. La conclusión queda limitada a las versiones y comprobaciones indicadas y no cubre cambios posteriores.
