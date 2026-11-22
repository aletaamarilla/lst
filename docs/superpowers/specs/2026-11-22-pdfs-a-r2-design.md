# PDFs de los viajes: de Sanity a Cloudflare R2

Fecha: 2026-11-22 · Tamaño: cambio pequeño-medio (diseño corto) · Estado: pendiente de aprobación

## Intención

Dejar de guardar y servir los dossiers PDF desde Sanity para no gastar su cuota
(almacenamiento y ancho de banda). Los PDFs pasan a un bucket de Cloudflare R2
(descarga sin coste de salida) y cada viaje apunta a su URL.

## Cómo está hoy

- Sanity (`q5bj2rn2/production`) guarda 27 PDFs, unos 102 MB. La web publicada enlaza 8
  (31 MB); los otros 19 (71 MB) son versiones antiguas que ningún documento usa.
- Los 15 documentos `trip` (8 publicados y 7 borradores) tienen `dossierFile` (referencia al
  archivo) y `dossier` (la URL `cdn.sanity.io/files/...` del mismo archivo). Ninguna salida
  tiene PDF propio: todas heredan el del viaje.
- El build lee `coalesce(dossierFile.asset->url, dossier)` en `scripts/sanity.mjs:29` y `:31`,
  y en `scripts/update-trip-promotions.mjs:72` y `:74`. `httpsUrl` (`scripts/sanity-trips.mjs`)
  acepta cualquier URL https. `scripts/sanity.test.mjs:27` comprueba el `coalesce`.
- El cliente sustituye el PDF en Studio → «Programa» → «PDF del viaje»
  (`studio/schemaTypes/trip.ts:124`); se explica en `docs/guia-cliente.md`.

## Objetivos

- Ningún PDF de viaje queda en Sanity ni se sirve desde `cdn.sanity.io`.
- Cada viaje enlaza su PDF en R2 desde el campo de URL del dossier.
- La web publicada sigue funcionando durante todo el cambio: ningún enlace de descarga roto.
- El cliente sabe subir un PDF nuevo y pegar su URL (guía actualizada).

## Fuera de alcance

- Las imágenes (63 archivos, 127 MB, servidas desde el CDN de Sanity). Probablemente son la
  mayor parte del ancho de banda; se valorará como segunda fase.
- La subida de PDFs desde Studio hacia R2 (opción C). Se puede añadir más adelante.
- Las cabeceras de caché de Vercel (`vercel.json` no tiene bloque `headers`; HTML, CSS, JS,
  fuentes e imágenes locales salen con `max-age=0, must-revalidate`). Se propone aparte.

## Qué no debe pasar

- Enlaces rotos en la web publicada.
- Borrar assets de Sanity antes de comprobar que los PDFs de R2 responden y la web ya los usa.
- Subir al bucket público documentos con datos personales (la guía ya avisa de esto).

## Enfoques considerados

- **A. Copiar en cada build.** Studio se queda igual y el build copia el PDF a R2. Los PDFs siguen
  ocupando espacio en Sanity. Descartado.
- **B. Solo R2, con URL pegada (elegido).** El PDF se sube al bucket y su URL se pega en el campo
  de URL que ya existe. Libera Sanity del todo y casi no hay que construir. El cliente usa dos
  herramientas: el panel de Cloudflare y Studio.
- **C. Subida desde Studio hacia R2.** Un servicio pequeño recibe el archivo. Flujo idéntico para el
  cliente, pero hay que construirlo, protegerlo y mantenerlo. Descartado por ahora.

## Diseño

1. **Bucket R2** para los dossiers, con acceso público por un dominio propio gestionado en
   Cloudflare (por ejemplo `docs.<dominio>`), que además da caché de Cloudflare delante.
   El dominio `r2.dev` solo sirve de provisional: tiene límite de peticiones y no cachea.
2. **Subir los 8 PDFs en uso** con nombres legibles (por ejemplo `marruecos-2027-01-17.pdf`),
   tipo de contenido `application/pdf`. Se sirve el mismo archivo que hoy; se comprueba por
   tamaño y hash.
3. **Sanity:** en los 15 documentos, `dossier` pasa a la URL de R2 y se quita `dossierFile`.
   Se publica por viaje; cada publicación dispara la reconstrucción de Vercel por el webhook.
4. **Código y Studio:**
   - El build lee `dossier` directamente (sin `coalesce`); se actualizan `scripts/sanity.mjs`,
     `scripts/update-trip-promotions.mjs` y su test.
   - Se retiran los campos `dossierFile` de `trip.ts` (viaje y salida) una vez vaciados los datos.
     El campo `dossier` pasa a llamarse «URL del dossier (PDF)» y su descripción explica dónde se
     sube el archivo.
   - `httpsUrl` para `dossier` solo acepta el dominio de R2 elegido, para que no vuelva a colarse
     un enlace de Sanity.
   - `docs/guia-cliente.md` y el README cuentan el flujo nuevo.
5. **Comprobación:** cada URL de R2 responde 200 con `application/pdf`; la web construida no
   contiene `cdn.sanity.io/files`; `npm test` y `npm run check` pasan.
6. **Limpieza en Sanity, con tu confirmación aparte:** primero los 19 PDFs sin uso y, cuando la web
   lleve un tiempo sirviendo solo desde R2, los 8 migrados. Borrar rompe cualquier enlace directo
   a `cdn.sanity.io` que se haya compartido por fuera (WhatsApp, correo, Instagram).

## Pendiente de decidir

- **Nombre público del bucket:** hace falta saber qué dominio está en Cloudflare. Esa URL queda
  escrita en los documentos de Sanity y en el HTML, así que cambiarla después supone editar de nuevo
  los 15 documentos.
- **Acceso a Cloudflare:** hay que autorizar el conector con `/mcp`, o iniciar sesión con Wrangler
  (`wrangler login`), que solo abre el navegador del usuario.

## Lo que queda a criterio de quien lo construya

- Nombre del bucket y convención de nombres de archivo.
- Si un PDF sustituido lleva un nombre nuevo (`...-v2.pdf`) o se acorta su caché: con el mismo
  nombre y caché larga, los navegadores seguirían mostrando el PDF viejo.
