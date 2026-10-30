# Validación local del catálogo Sanity · 23/10/2026

Repositorio LST, HEAD `73dc52dca750482853b1fc5973953ea1675b1fc2`; candidata sin commit. No se ha ejecutado ninguna mutación remota de contenido, importación real, publicación ni despliegue. La lectura anónima real de `q5bj2rn2/production` ha devuelto 0 viajes publicados y el `dist/` local refleja ese estado. El informe diferencia pruebas de producción vacío, fixtures positivos y limitaciones remotas.

## Cambios y versión

Estado previo conservado: `.gitignore`, README y package ya modificados; Studio y `docs/qa/2026-10-19-sanity-studio/` sin seguimiento; inventario `docs/sanity/2026-10-23/` preparado previamente. Esta tarea cambia `studio/schemaTypes/trip.ts`, package/README, generadores/modelo/check de scripts y los bloques generados de `dist/`; añade puerta de lectura, adaptador, orquestador, generador home, importador específico y pruebas. No cambia los datos del fixture ni el inventario de los PDF. Se conserva el CSS de producto; el único cambio del JS de navegador mantiene el mensaje de catálogo vacío tras inicializar filtros.

[Diff de esta tarea](implementation.patch) parte del estado inicial sin commit, separando las modificaciones anteriores. Incluye código, HTML, modelo público y documentación operativa; las capturas/logs están disponibles por separado en esta carpeta. [Manifest SHA256](candidate.sha256) identifica los archivos finales, incluidos nuevos, sin confundirlos con un commit. Los tres hallazgos independientes y su resolución figuran en [revisión](revision-independiente.md).

## Evidencia real

| Comprobación | Resultado / alcance |
| --- | --- |
| Base antes de implementar | `npm test`: 25/25; `npm run check`: 11 páginas, 6 destinos. Se contrastó el estado previo antes de editar. |
| [Pruebas finales](tests.txt) | 41/41 PASS: filtros anteriores; publicación, credenciales, validación, campos opcionales, precios/señales/disponibilidad manual, enlaces de solicitud, texto editorial escapado, snapshot público, catálogo vacío, preservación de salida y reimportación. Las escrituras de pruebas son dobles locales, nunca Sanity real. |
| [Build final](build.txt) | PASS con lectura real: `sanity-published`, count 0. Una sola lectura de contenido para todas las vistas. |
| [Comprobador final](check.txt) | PASS: 11 páginas, URLs/anchors/assets, noindex, sintaxis JS y coherencia entre snapshot y HTML generado. |
| Compatibilidad de fichas | Los 6 HTML de `renderTrip(fixture)` coinciden byte a byte con sus HTML en HEAD. La demo se generó fuera de dist y pasó el comprobador con `--demo`. No se presenta como dato comercial actual. |
| Studio tipos | `npm run studio:check`: PASS; repetido independientemente por el revisor. |
| [Studio build](studio-build.txt) | PASS. Advertencia de autoactualización: local Sanity y vision 6.19.0, runtime servido 6.20.0. No se probó el runtime alojado autenticado. |
| [Extracción del esquema](studio-schema.txt) | PASS, `studio/schema.json` generado localmente e ignorado por Git. |
| [Chromium](browser.txt) | 52 aserciones PASS a 390/1440 px: vacío real representado localmente, rutas antiguas, filtros/URL/historial, selector de fechas, mensajes, galería/teclado/foco, fotos opcionales, solicitud y noindex. Fixtures locales para los casos positivos; se interceptan imágenes y se bloquean envíos externos. Cero errores pageerror. |
| Simulación de importación | [8 borradores](../../sanity/2026-10-23/implementation/drafts-preview.json), [informe dry-run](../../sanity/2026-10-23/implementation/dry-run.json): 0 escrituras, preflight autenticado **pending**. No es evidencia de ausencia de colisiones remotas. |
| Revisión independiente | 3 bloqueos corregidos: IDs ocupados sin slug, escape de priceNote y condiciones sin includes. Ningún bloqueo adicional identificado en la candidata revisada. |
| Higiene del diff/salida | `git diff --check`: PASS. Escaneo de 25 archivos públicos de texto: no aparecen variables privadas de la puerta de lectura, literales Authorization/Bearer ni notas/editorial/source metadata. Es una comprobación dirigida, no una garantía absoluta de ausencia de secretos. |

Capturas: [catálogo vacío móvil](empty-390.png), [catálogo vacío escritorio](empty-1440.png), [ficha de fixture móvil](detail-390.png), [ficha de fixture escritorio](detail-1440.png), [URL sin publicación móvil](unpublished-390.png), [URL sin publicación escritorio](unpublished-1440.png). Las fichas positivas de las capturas son pruebas locales, no salidas publicadas ni fotos nuevas autorizadas para el catálogo.

## Reproducir

```sh
npm test
npm run build
npm run check
npm run studio:check
npm run studio:build
npm --prefix studio run schema:extract
npm run sanity:import
```

El navegador usa el runtime Playwright externo ya disponible en el entorno, igual que los comprobadores existentes: definir `LST_PLAYWRIGHT_MODULE`, `LST_CHROMIUM_PATH` y opcionalmente `LST_QA_OUTPUT`, y ejecutar `node scripts/check-sanity-browser.mjs`. No se añade dependencia raíz ni se instala software.

## Límites y siguientes pasos

Implementación y validación local terminadas dentro de este alcance. No se afirma preparada la carga remota sin el preflight autenticado ni probado el flujo editorial alojado. No se han utilizado credenciales reales de importación/lectura, inspeccionado borradores remotos, enviado formularios, confirmado vigencia comercial/disponibilidad o derechos fotográficos, ni validado un documento positivo real en Sanity. La carga de drafts, el despliegue del Studio y el despliegue web siguen sin ejecutar.

[Operación, credenciales separadas y pendientes concretos para cargar borradores](../../sanity/2026-10-23/implementation/README.md). El siguiente paso de datos es provisionar la credencial privada del importador y ejecutar únicamente el preflight de lectura; después revisar el plan y autorizar explícitamente la carga. Precio/disponibilidad, señales contradictorias, fotos/PDF y canal se resuelven antes de publicar cada documento.
