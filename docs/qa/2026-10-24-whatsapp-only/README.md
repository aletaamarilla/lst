# Canal único WhatsApp · 24/10/2026

Resultado: consultas exclusivamente por WhatsApp en web y PDF activos; campo de formulario retirado del Studio y de los documentos actuales de Sanity.

Base `22e4b0d529a288da2f6b610b72ec1469614bed30`. Implementación `50ffb5438a42a3c3a4959427d432d2b4145a4601`; versión final `58f338661fc4705364fea08727c836e79b3f2048` añade únicamente las referencias a tres PDF con sus dos botones de consulta restablecidos. Vercel `lts-laura-moreno-ferre/lst`, despliegue `dpl_BigR4dz63Zm3NjB7Br7pax3maTSU`, production, READY. [Estado](deployments.json).

La lectura inicial real de `q5bj2rn2 / production` encontró ocho viajes publicados y cero borradores, igual que el catálogo web; se comunicó al usuario la diferencia respecto a su impresión de producción vacía. Se preservaron esos ocho IDs y sus estados. Esta tarea no ejecutó acciones Publish/Unpublish ni creó nuevas salidas. [Antes](before.json), [plan con guardas de revisión](remote-plan.json), [resultado](mutation-result.json), [lectura final](final-after.json).

Cambios:

- El renderer genera solo enlaces contextuales a WhatsApp, incluso si recibe configuración antigua de formulario; mantiene selección por fecha, condiciones de completo y ayuda de nivel.
- El adaptador público elimina la configuración antigua de formulario, el importador estándar ya no importa su URL en las notas y Studio deja de ofrecer el campo. Se eliminó `booking` de los ocho documentos, se actualizaron las notas con procedencia y canal actual y se corrigió la indicación de habitación compartida de El Palmar. El historial completo anterior se conserva en la evidencia local, sin alterar los documentos fuente históricos.
- Cinco PDF activos cambiaron los enlaces y etiquetas de Google Forms a WhatsApp. En los tres PDF que ya usaban WhatsApp se restablecieron ambos botones de consulta originales. Cada anotación se verificó por página, rectángulo y URL después de guardar. [Cinco cambios](pdf-changes.json), [tres reparaciones](pdf-repairs.json). Los archivos originales se conservan como histórico, sin uso en las referencias activas.
- Se mantuvieron fechas, precios, señales, disponibilidad, niveles, programa, inclusiones, exclusiones y fotografías. El snapshot y los HTML se reconstruyeron desde Sanity y la guía del cliente describe únicamente WhatsApp.

Validación:

- [Pruebas](tests.txt): 44/44 PASS; incluyen configuración antigua descartada, mensajes por salida y estado completo. [Tipos Studio](studio-check.txt), [build](studio-build.txt) y [despliegue](studio-deploy.txt): PASS.
- [Navegador local](browser.txt): 52 aserciones en 390/1440 px, incluidos borradores/vacío, filtros, selector de fechas, galería/foco y retirada del formulario antiguo.
- [Build final](build-final.txt): ocho viajes; [check](check-final.txt): 19 páginas, enlaces y recursos coherentes.
- [Web desplegada](live-browser.json): 16 vistas de fichas en 390/1440 px; los 80 enlaces de consulta van a WhatsApp con contexto del viaje, sin enlaces/etiquetas de formulario, errores JavaScript ni mensajes enviados.
- [Lectura pública](live-verification.json): snapshot idéntico al modelo actual de Sanity, sin configuración de formulario ni Google Forms en los ocho documentos y fichas. [PDF desplegados](live-pdf-validation.json): los ocho hashes coinciden con las copias revisadas, conservan sus dos CTA contextuales y no contienen enlaces Google Forms ni etiquetas de formulario.
- [Bytes servidos](deployed-bytes.json): los 33 archivos HTML/JS/CSS/JSON coinciden exactamente con los objetos Git de la versión final 58f3386. Se usó la versión inmutable porque durante el cierre apareció trabajo concurrente ajeno en el checkout. [Revisión independiente](revision-independiente.md).

Límites: no se enviaron mensajes a WhatsApp. El Studio alojado se desplegó correctamente; no se probó una sesión de dashboard del usuario. No se borraron los formularios en la cuenta de Google ni los PDF históricos; se retiraron sus enlaces y configuración de todo el recorrido actual. La evidencia de esta tarea queda local sin commit en esta carpeta; el resto de documentación previa sin seguimiento se conserva.

El checkout contiene cambios posteriores ajenos a esta tarea (fixtures, recursos, estilos y generadores), conservados sin modificar y registrados en `final-workspace-status.txt`. Las conclusiones corresponden a los commits identificados y al despliegue comprobado, no a ese trabajo concurrente aún sin commit. No se volvió a ejecutar un build sobre esos cambios.
