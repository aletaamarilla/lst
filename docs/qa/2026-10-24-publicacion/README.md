# Publicación de LST · 24/10/2026

Ocho salidas publicadas en **q5bj2rn2 / production**, proyecto Sanity LTS / organización oCsOalTXP. Web: https://lst-sepia.vercel.app/viajes/. Studio: https://lets-surf-together.sanity.studio/.

## Versión y alcance

Repositorio `aletaamarilla/lst`. Base inicial `73dc52dca750482853b1fc5973953ea1675b1fc2`, con integración Sanity previa sin commit, conservada en [estado inicial](initial-status.txt). Implementación integrada y revisada en `7adcb4e5ea0f96e1d7adf3b5326a706079b99f1a`; versión final `22e4b0d529a288da2f6b610b72ec1469614bed30` añade únicamente el HTML/snapshot de las ocho salidas y una precisión de la guía. Los informes anteriores sin seguimiento siguen conservados localmente; no se publicaron snapshots internos de esta operación en GitHub.

Vercel: `lts-laura-moreno-ferre/lst`, proyecto `prj_i6WTjAdr8wXdaYklifDfTkrM5NO3`, producción `main`, build Node propio `npm run build && npm run check`, salida `dist/`. Se corrigió la selección Astro que no correspondía al código. Despliegue final `dpl_7kciA7WucUNzvC2Ud6WW6ygfwCVz`: **READY**, source `22e4b0d`. [Estado](latest-deployments.json), [bytes públicos contrastados con build local](final-deployed-bytes.json).

## Decisión comercial y contenido

La consulta autenticada inicial encontró ocho borradores con revisión exactamente igual a la importación del 23/10; ninguno tenía aún precio vigente. Inicialmente se conservaron en borrador. Después el usuario aprobó en este chat todos los materiales y precisó que todos tienen plazas, con estado manual y sin contador de plazas libres. Se propusieron tarifas generales sin promoción y señales fijas, sin equivalencias porcentuales. Se prepararon y revisaron esos valores antes de publicar.

| Salida | Fechas | Tarifa general | Señal fija | Solicitud final |
| --- | --- | ---: | ---: | --- |
| Hossegor | 20–22/11/2026 | 399 € | 200 € | Formulario |
| El Palmar | 04–08/12/2026 | 699 € | 250 € | Formulario |
| Marruecos I–II | 17–24/01/2027 | 899 € | 270 € | WhatsApp |
| Marruecos III | 24–31/01/2027 | 899 € | 270 € | WhatsApp |
| Fuerteventura | 12–16/02/2027 | 699 € | 250 € | Formulario |
| Senegal | 28/02–07/03/2027 | 1.299 € | 325 € | WhatsApp |
| Maldivas Semana Santa | 21–28/03/2027 | 1.499 € | 500 € | Formulario |
| Maldivas Pascua | 28/03–04/04/2027 | 1.499 € | 500 € | Formulario |

Todas muestran **Plazas disponibles**. La disponibilidad admite además Últimas plazas, Completo y Consultar disponibilidad. Se conserva la lectura de documentos antiguos sin afirmar disponibilidad cuando falta confirmación. Completo conserva fechas/precios y retira formulario/selector de solicitud, con consulta contextual por WhatsApp.

Se extrajo una fotografía de cada PDF aprobado, con [procedencia y asset](media.json), sin generar fotografías nuevas. Las tres [copias PDF corregidas](pdf-updates.json) de Marruecos/Senegal conservan señales de 270/325 €, eliminan equivalencias porcentuales inexactas y enlazan a WhatsApp. Los originales se conservaron. Esos formularios externos todavía contienen los porcentajes contradictorios: están **desactivados** en las fichas y PDF revisados hasta corregirlos.

[Transacción de publicación](publication-transaction.json): `2D42OFpIbrkQoZrdHVJ2Zy`, ocho acciones atómicas con `ifVersionRevisionId`. [Borradores finales revisados](final-reviewed-drafts.json), [lectura publicada](published-readback.json), [documentos publicados completos](published-raw.json). Cero borradores trip restantes al finalizar; no se publicaron salidas adicionales.

## Actualización automática y pruebas reales

Un webhook directo Sanity→Deploy Hook Vercel, sin servicio adicional. [Configuración sanitizada](deployment-config.json): trip, production, create/update/delete, before/after para eliminaciones, includeDrafts=false e includeAllVersions=false. La URL secreta queda en los servicios. [Filtro con GROQ real](webhook-filter.txt): crear/actualizar/eliminar publicado=true; drafts/versions=false. Vercel reconstruye consultando el estado publicado actual; las llamadas repetidas no escriben contenido y Vercel puede cancelar builds anteriores del mismo hook.

1. **Editar en Studio:** UI local autenticada, con el mismo código/esquema desplegado, contra el dataset real. Se editó el aviso neutro de Hossegor. Tras guardar, cero mensajes de webhook; snapshot público vacío y consulta raw anónima sin borradores. [Evidencia](studio-editorial-cycle.json).
2. **Publicar:** botón Publish del Studio, Actions API 200; hook create HTTP 201; despliegue `dpl_HGPKgyBfxnGJpSAC7dNkzBPGEWR3` READY y ficha web con aviso y 399 € actualizados.
3. **Despublicar:** acción real de Hossegor, conservando íntegro el contenido como borrador. Web volvió a cero viajes y la URL dejó de mostrar datos comerciales (404). [Resultado](unpublish-web.json). El webhook real emitió operación **delete**; cubre el mismo evento relevante que retirar un documento publicado.
4. **Publicación final:** ocho documentos revisados publicados con guardas de revisión; [entregas de webhook](hook-messages.json) satisfactorias y reconstrucción automática. El snapshot web coincide con adaptTrips de la lectura actual de Sanity.

## Validación final

- [44 pruebas](tests.txt): PASS. Incluyen compatibilidad antigua, secretos, validación, preservación de salida ante fallo, estados manuales, completo con varias fechas/precios, formularios y campos opcionales.
- [Build final](build-final.txt): ocho documentos reales; [check](check-final.txt): 19 páginas y enlaces/recursos coherentes. Tipos/build Studio PASS; [schema real sin proyección](candidate-schema.json): `[]`; [despliegue Studio](studio-deploy.txt): PASS.
- [Navegador desplegado](live-browser.json): 390/1440 px, home/catálogo/niveles y ocho fichas, filtros, fechas/precios, estados, formularios/WhatsApp interceptados, imágenes decodificadas, PDF, galería/teclado/foco; cero errores JavaScript. [Fotos del catálogo decodificadas](catalog-images.json).
- [Verificación HTTP](live-verification.json): snapshot idéntico a Sanity; ocho imágenes y ocho PDF HTTP 200, hashes PDF iguales a originales/correcciones esperados; cinco formularios GET 200. Rutas de fuente, .env, Git, .vercel y evidencias internas inaccesibles (404).
- Escaneo dirigido de archivos públicos y bundle Studio: cero coincidencias de credenciales privadas conocidas o URL del deploy hook, y sin tokens/notas editoriales/revisiones en el modelo público. El token de importación existente se limitó a Development; no está en Production/Preview. No se necesitan secretos para la lectura anónima publicada de este dataset público.
- [Revisión independiente](revision-independiente.md), sobre implementación, compatibilidad, datos, PDF y evidencia final. No se atribuye a la aprobación inicial cobertura de cambios posteriores: ambas fases se identifican por commit y lecturas.

## Límites y operación del cliente

El Studio alojado está desplegado y requiere inicio de sesión en Sanity. No se dispuso de una sesión de dashboard del usuario para probar su interfaz alojada; la prueba editorial autenticada se realizó en Studio local contra production real. La verificación en navegador es Chromium, sin dispositivos físicos. Los formularios se leyeron y se comprobaron enlaces; **no se enviaron solicitudes ni mensajes**, por lo que no se acredita la entrega a destinatarios. Los tres formularios pendientes quedan inactivos, con WhatsApp funcionando como canal alternativo.

Se mantiene el noindex heredado. Los assets del CDN son accesibles por su URL; no deben contener información secreta. La ausencia detectada de secretos se limita a los valores/patrones y archivos comprobados.

[Guía breve del cliente](../../guia-cliente.md): precio, disponibilidad, PDF y nueva salida. Antes de activar un formulario externo, comprobar sus condiciones y destinatario. Los futuros documentos con pendientes deben permanecer en borrador. Si falla un build, Vercel mantiene el despliegue anterior; corregir el dato y volver a publicar. Antes de una reversión de contenido, contrastar la revisión actual con las lecturas guardadas para conservar cualquier edición posterior.
