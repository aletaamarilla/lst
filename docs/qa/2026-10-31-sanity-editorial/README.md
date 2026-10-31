# Contenido de viajes en Sanity · 31/10/2026

## Versión y alcance

Repositorio letsurftogethersystem. Base: `b10c1ad02fbf1c47ac49130899ae8ff9223ec5f7`. Candidata sin commit; archivos nuevos y diff identificados en [candidate.json](candidate.json), SHA-256 `7949ece03c889906df1fa5e3d06480159a5cdf0fde34b2df403fb6c79ae2fb93`. El manifiesto incluye implementación, pruebas, esquema, inventario editorial, guía y HTML generado; excluye esta carpeta de evidencias.

Se reutilizan los campos editoriales existentes y se añaden foto de tarjeta, testimonio opcional y pago por salida. La home lee la frase y foto configuradas; las fichas muestran títulos del programa y FAQs propios. El acompañamiento deja de inferir una persona fija. Se retiran mapas de texto por destino, selección de fotos por coincidencias del alt y funciones visuales sin consumidores en la web.

Los documentos históricos de Maldivas comparten un principal editorial explícito: la segunda fecha conserva sus condiciones y referencia al principal para textos, fotos, nivel y programa. Se ocultan en Studio los campos heredados o antiguos sin efecto.

## Aceptación y evidencia

- Cambiar frase y foto sin depender del slug: pruebas en `trip-cms-content.test.mjs` y `home-trips.test.mjs`.
- Programa, testimonio y acompañamiento editables, con escaping y retirada sin recuperar contenido por destino: pruebas editoriales y de equipo.
- Condiciones por salida con herencia, sin señal común engañosa: pruebas CMS, detalle y conversión.
- Siete viajes, ocho salidas, separación de niveles de Marruecos, rutas antiguas y categorías Brevo conservados: pruebas de contratos y agrupación.
- Cambios del principal Maldivas conservan dos fechas y aliases; referencias ausentes o circulares se rechazan.
- Migración idempotente con revisiones y preservación de ediciones previas; publicación editorial atómica sin activar promociones de borradores existentes: pruebas de migración/publicación.

Resultados finales:
- [199 pruebas aprobadas](tests.txt), sin fallos.
- [Comprobación de 40 páginas](check.txt): generación, enlaces, anclas, recursos, scripts, disponibilidad e inscripciones.
- [Tipos del Studio](studio-types.txt): aprobado.
- [Compilación del Studio](studio-build.txt): aprobada con `--no-auto-updates`, usando la versión instalada. La compilación estándar agotó la conexión de WSL a sanity-cdn.com antes de compilar; no se modificó la configuración permanente de actualizaciones.
- [Diff sin errores](diff-check.txt).
- [HTTP local y resumen](validation.json): home, catálogo, niveles, Maldivas e inscripción responden 200; siete viajes y ocho salidas con campos editoriales.
- El build de la web se ejecutó contra Sanity publicado real mediante el runtime Node de Windows, conservando la salida estática y restaurando el permiso original de un recurso binario que la copia de Windows había cambiado.

La suite inicial antes de implementar tenía 190 pruebas aprobadas. Se retiraron comprobaciones de funciones sin consumidores y se añadieron casos de comportamiento y compatibilidad; el número de pruebas no sustituye los criterios anteriores.

## Revisión independiente

Primera candidata: se detectaron publicación parcial de Maldivas que perdía la URL canónica, riesgo de publicar un snapshot cuyo origen hubiera cambiado y controles sin efecto en la segunda fecha. Se corrigieron con publicación conjunta, guardas `ifRevisionID` y autoridad editorial explícita. Se ajustó también la recuperación tras editar contenido compartido.

Última revisión independiente sobre el manifiesto indicado: 199 pruebas y diff-check aprobados. El revisor simuló el plan autenticado real y confirmó que conserva siete borradores previos, retira únicamente el nuevo de Hossegor y publica solo campos editoriales. No identificó bloqueos para preparar los borradores. El revisor no ejecutó escrituras remotas.

## Sanity y estado local

[Lectura posterior real](remote-drafts.json):
- Un borrador nuevo (Hossegor) y siete actualizados.
- Los publicados conservan exactamente su revisión y contenido.
- Los campos anteriores de los borradores, sus promociones y condiciones de tarifa se conservan.
- Ocho borradores preparados, siete viajes y ocho salidas.
- La copia local se actualizó desde esos borradores y su modelo público coincide con el ya comprobado.
- Plan de publicación atómica preparado; **no ejecutado**.

La sesión existente de WSL se usó de forma privada; no se imprimieron ni persistieron credenciales. Los planes y snapshots completos están en `artifacts/sanity-editorial-remote/`, ignorado por Git.

Web local: http://localhost:4175/. Studio local: http://localhost:3333/. El control automatizado del navegador integrado no pudo iniciar su entorno de ejecución (CreateProcessSecurityEnvironment); no se abrió otro navegador. La verificación local fue por HTTP, modelos y pruebas de comportamiento; no se realizó una inspección visual automatizada nueva.

## Estado al cerrar la preparación

Al cerrar la preparación no se había desplegado el esquema alojado ni la web, ni publicado contenido. El procedimiento previsto era seguir [el orden y recuperación de la migración](../../sanity/2026-10-31-editorial/README.md): desplegar Studio, revisar/aplicar la transacción editorial completa y desplegar la web compatible. Los early bird previos siguen pendientes de su decisión editorial independiente. La recepción real y automatizaciones de Brevo siguen fuera de esta tarea.

## Publicación posterior autorizada

El usuario autorizó publicar Sanity y la web en `main`.

- Studio y un esquema desplegados mediante la CLI oficial. Se mantuvieron las actualizaciones automáticas. Deployment activo `ydcq39t0kbkbc4amuezekzqo`; el asset remoto coincide con la compilación nueva. La URL del Studio puede redirigir al acceso autenticado de Sanity; se verificó además la aplicación mediante la API.
- Ocho cambios editoriales publicados en una sola transacción, con lectura posterior verificada.
- Siete borradores previos y sus early bird conservados; no se publicaron promociones ni se alteraron fechas, importes, señales, disponibilidad o capacidad.
- Web reconstruida desde Sanity publicado: siete viajes y ocho salidas. Pruebas posteriores al build: 199 aprobadas y comprobación de 40 páginas aprobada.
- [Verificación de publicación](publication.json), incluida la huella del snapshot `8fda6e91b3fb3d2ac44805c3d53d8da5c5cf7617c0b2c2089fbf5b7cd3eeba86`.

La revisión independiente final confirmó contratos y categorías Brevo idénticos a la base, los dos aliases y fechas de Maldivas, y enlaces/anclas sin cambios en los 15 HTML modificados. Las fuentes siguen coincidiendo con la candidata `7949ece…`; la salida generada posterior se identifica por el snapshot anterior y el manifiesto agregado de HTML `44986b45d1c79f0a36ecbdecd09d8a34cc66cfcdc62e0304dcb7c96073d493ca`.

Esta evidencia registra la fase previa al push: la entrega de la web se realiza mediante el commit de `main` y se comprueba en Vercel contra su SHA. El estado final del despliegue queda en la respuesta del chat y en los registros locales de publicación ignorados por Git.
