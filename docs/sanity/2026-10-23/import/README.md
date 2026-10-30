# Carga de ocho borradores LST · 23/10/2026

**Importación terminada y verificada en `q5bj2rn2/production`.** Se crearon ocho documentos `drafts.lst-*` y ocho assets PDF. Cero documentos previos modificados, cero viajes publicados, cero despliegues. No se ejecutaron seeds ni sustituciones de dataset. Los datos comerciales desconocidos y las fotos permanecen pendientes.

La lectura autenticada previa comprobó proyecto `LTS`, organización `oCsOalTXP` y dataset `production`; encontró 13 documentos de sistema, ningún viaje/borrador y ningún asset que reutilizar. No fue necesario respaldar documentos de contenido para modificación, porque no había ninguno afectado y la operación solo permite `create`. Se conservaron los metadatos y las revisiones de los 13 documentos previos, sin cambios posteriores.

## Resultado por borrador

Pendientes comunes: confirmar tarifa/disponibilidad y condiciones comerciales, aprobar fotos y el canal/destinatario de solicitud. El PDF original ya está cargado; conserva su contenido documental y requiere revisión editorial antes de presentar sus ofertas como vigentes.

| Borrador | ID | Resultado | Pendiente adicional |
| --- | --- | --- | --- |
| Hossegor | `drafts.lst-hossegor-2026-11-20` | Creado + PDF verificado | Pendientes comunes |
| El Palmar | `drafts.lst-el-palmar-2026-12-04` | Creado + PDF verificado | Determinar tramo de precio vigente |
| Marruecos, nivel 1–2 | `drafts.lst-marruecos-2027-01-17` | Creado + PDF verificado | Aclarar 270 € / 30 % y saldo |
| Marruecos, nivel 3 | `drafts.lst-marruecos-2027-01-24` | Creado + PDF verificado | Aclarar 270 € / 30 % y saldo |
| Fuerteventura | `drafts.lst-fuerteventura-2027-02-12` | Creado + PDF verificado | Pendientes comunes |
| Senegal | `drafts.lst-senegal-2027-02-28` | Creado + PDF verificado | Aclarar 325 € / 25 % |
| Maldivas Semana Santa | `drafts.lst-maldivas-2027-03-21` | Creado + PDF verificado | Cupo promocional, material y seguro |
| Maldivas Pascua | `drafts.lst-maldivas-2027-03-28` | Creado + PDF verificado | Cupo promocional, material y seguro |

## Evidencia de ejecución

- [Manifiesto final](run-2026-10-23T18-17-32-544Z/manifest.json): IDs de documentos y assets, revisiones, intenciones de escritura y transacción de viajes `L3ZrvhdiWtwAlFI8eM8C0J`.
- [Preflight autenticado sin escrituras](run-2026-10-23T18-16-24-130Z/preflight.json) y [preflight repetido al aplicar](run-2026-10-23T18-17-32-544Z/preflight.json).
- [Candidatos finales](run-2026-10-23T18-17-32-544Z/expected-documents.json), [lectura posterior completa](run-2026-10-23T18-17-32-544Z/readback.json) y [comprobaciones por documento](run-2026-10-23T18-17-32-544Z/verification.json).
- [Metadatos antes](run-2026-10-23T18-17-32-544Z/before-metadata.json) y [después](run-2026-10-23T18-17-32-544Z/after-metadata.json): delta exactamente ocho borradores y ocho PDF; 13 revisiones previas intactas; ningún viaje publicado ni slug duplicado.
- Sanity CLI validó los ocho documentos contra el esquema local del Studio en tres momentos: [candidatos](run-2026-10-23T18-17-32-544Z/candidates-schema-stdout.json), [candidatos con PDF](run-2026-10-23T18-17-32-544Z/final-candidates-schema-stdout.json) y [documentos leídos después](run-2026-10-23T18-17-32-544Z/readback-schema-stdout.json). Informes `[]`, sin errores/advertencias y stderr vacío.
- Se descargaron por GET los ocho PDF desde sus URLs CDN del proyecto/dataset y sus SHA256 coincidieron con los originales revisados. No se añadieron fotos, portadas ni galerías sin aprobación; se comprobó su ausencia.
- [Ocho formularios](form-links.json): HTTP 200, títulos correspondientes y destinos Google Forms; sin envío de datos. Se conserva cada URL en las notas para revisión, sin activar `booking.applicationUrl`. La respuesta HTTP no verifica titularidad, destinatarios, campos ni aprobación del canal.
- Fechas del programa, niveles, señales y capacidad coinciden con el inventario. Precio vigente y plazas disponibles siguen ausentes; tarifas, tramos y porcentajes documentales se conservan íntegros en notas, sin convertirlos en condiciones vigentes ni recalcular señales.
- [Pruebas finales](tests.txt): 41/41 PASS; sintaxis del ejecutor y `git diff --check`: PASS.
- [Revisión independiente](revision-independiente.md): sin bloqueos identificados sobre la versión y evidencia especificadas.

## Credencial y alcance editorial

La credencial se obtuvo mediante la CLI autenticada de Vercel del proyecto `lst` (`prj_i6WTjAdr8wXdaYklifDfTkrM5NO3`), equipo `lts-laura-moreno-ferre`, variable `SANITY_IMPORT_TOKEN`. Tras habilitar el usuario el mismo registro para Production/Preview/Development, se utilizó su copia de Development en memoria privada del proceso; el destino de Sanity permaneció fijo en **production**. No se recuperó ningún token desde el chat. El archivo privado temporal de descarga se eliminó antes de ejecutar el importador. No se guardaron valores de credenciales en este registro ni en el repositorio.

La exportación vacía de Production no bastaba para concluir que el valor faltaba: [Vercel documenta que sus secretos de Production/Preview no se devuelven por env pull](https://vercel.com/docs/environment-variables/sensitive-environment-variables). No se alteró automáticamente la configuración de Vercel ni se desplegó la web.

La validación corresponde al esquema **local** del Studio. No se desplegó una nueva versión del Studio ni se comprobó su edición autenticada alojada. Los documentos cargados son borradores; esta ejecución no acredita vigencia comercial, derechos fotográficos, destinatarios de formularios ni preparación para publicar.

## Revisión y reversión del lote

El manifiesto final y `readback.json` identifican los ocho borradores y sus revisiones, y los ocho assets PDF con su ID/URL/hash. No hay IDs modificados que restaurar. `attempt.json` conserva el intento inicial, ahora marcado como superado por esta carga final.

Una reversión posterior deberá revisar exclusivamente esos IDs: comprobar que no hayan recibido ediciones/publicaciones después de esta carga antes de retirar un borrador, y que ningún contenido use las referencias o URLs de cada PDF antes de eliminar un asset. Si las revisiones han cambiado o el PDF se comparte, conservarlo y resolver la diferencia. No borrar por prefijo, ni todos los documentos/archivos del dataset, ni ejecutar restauraciones generales. No se ha ejecutado ninguna reversión.

## Versión

[Versión y hashes](version.json). HEAD del repositorio: `73dc52dca750482853b1fc5973953ea1675b1fc2`; cambios sin commit. Esta operación añade/actualiza exclusivamente `docs/sanity/2026-10-23/import/`; conserva el amplio trabajo previo sin commit de la aplicación y el Studio.

Ejecutor operativo: `load-reviewed-batch.mjs`, SHA256 `38d015f1c6644e2518ba65499713f6607cc6f3b2907c34777b9028b3934c96f4`. Reutiliza el importador preparado, sin cambiar código de la aplicación, el inventario de origen ni `dist/`. Por defecto solo hace preflight; no se debe repetir `--apply` para forzar la escritura de documentos existentes.
