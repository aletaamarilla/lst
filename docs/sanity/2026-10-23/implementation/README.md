# Implementación mínima del catálogo · 23/10/2026

Implementación local sobre `73dc52dca750482853b1fc5973953ea1675b1fc2`, sin commit, escrituras remotas ni despliegues. Se ha conservado el trabajo previo de Studio, documentación, `.gitignore`, README y scripts de package. El inventario anterior `../salidas.json` se conserva íntegro como evidencia; esta carpeta contiene la preparación específica para importar, no una publicación comercial.

## Comportamiento y consumidores

Se reutilizan `trip`, los componentes HTML/CSS/JS, el modelo de niveles/fechas y sus filtros. Un documento por salida en las ocho nuevas; sigue admitiéndose más de una fecha en documentos antiguos. Los seis HTML de detalle anteriores se generan byte a byte iguales desde su fixture original. No se modifican colores, CSS, filtros `nivel`/`estado`, rutas de entrada, dominio OG ni `noindex,nofollow`.

La lectura durante el build está centralizada en `scripts/sanity.mjs`, con destino fijo `q5bj2rn2/production` y API fijada a `2025-02-19`. No había un cliente de lectura web previo: se añade una puerta Node sin dependencias raíz; Studio conserva sus dependencias existentes. Se consulta una vez con perspectiva `published`, excluyendo también drafts y versiones. El adaptador valida y limita el modelo público; fichas, catálogo, guía de niveles y home comparten ese snapshot. Los scripts del navegador no consultan Sanity ni reciben tokens.

La lectura anónima real efectuada el 23/10/2026 devolvió **0 documentos trip publicados**. El `dist/` local entregado refleja ese estado: home, catálogo y niveles explican que no hay viajes publicados; las seis URLs anteriores muestran que el viaje no está publicado, sin precios ni fechas de demostración. Se conserva el fixture `data/trips.json` para regresión/presentaciones aisladas, fuera de la lectura de producción. Se conservan también las rutas generadas previamente si una salida deja de publicarse, sustituyendo su contenido comercial por ese aviso.

Lecturas inválidas o fallidas abortan antes de tocar la salida. El build usa staging, bloqueo de escritor y renombrado con recuperación si falla la sustitución. No hay SSR, webhooks, pagos ni motor de disponibilidad. Publicar en Studio requiere después reconstruir y desplegar la web; no se ha configurado automatización. Tras una interrupción del proceso, comprobar que no hay otro build activo antes de eliminar un `.build-lock` o recuperar un `.backup-*` local.

| Datos editables en trip | Consumidor |
| --- | --- |
| name, slug, place, state, levels, levelRequirement; departures start/end/duration/price/message | Identidad, URL, título/OG, fichas, home, catálogo, niveles, selector y mensajes por fecha |
| tagline, intro; storyTitle/Label/Intro y story title/text | Resumen y programa de ficha |
| levelTitle/Text/Checks | Bloque de nivel de ficha |
| priceNote | Condiciones editoriales de tarifa, junto al precio vigente manual |
| payment.depositAmount, payment.terms | Señal fija y condiciones en la ficha; no se recalculan porcentajes ni saldos |
| capacity.total, capacity.available | Capacidad total y disponibilidad separadas en ficha; ausente = por consultar, cero = 0 plazas |
| includes, excludes, inclusionsNote | Servicios y condiciones, independientes entre sí; sin inventar habitación o cobertura |
| hero con alt, gallery con alt/caption; stay con imagen/texto, team | Portada, galerías, tarjetas y bloques opcionales existentes |
| faqs, dossier | Preguntas y enlace HTTPS al PDF en móvil/escritorio |
| booking.applicationUrl | URL aprobada de solicitud en los CTA; vacío conserva WhatsApp contextual |
| editorialNotes; source/checkedAt existentes | Revisión y trazabilidad en Studio; excluidos del modelo público del sitio |

No se añaden tablas de tarifas, porcentajes calculables, cupos promocionales ni entidades nuevas. El precio vigente se escribe por fecha; no se selecciona una oferta a partir de la capacidad. La señal es un importe manual independiente y las condiciones pueden conservar texto aprobado. Los textos de promoción se editan en `priceNote`. La consulta o solicitud no confirma una reserva. Se mantiene WhatsApp por defecto y como ayuda para el nivel; la importación no cambia el canal a los formularios de los PDF. Solo un enlace aprobado editado en Studio cambia las acciones de solicitud.

## Secretos y lectura

La comprobación actual permite lectura anónima. Si cambia la privacidad del dataset, provisionar una credencial de solo lectura adecuada como `SANITY_READ_TOKEN` en el proceso de build. No se obtiene automáticamente del token de importación ni de la sesión de Studio. `SANITY_IMPORT_TOKEN` debe poder leer también borradores/versiones y crear los ocho borradores; no debe estar disponible en el entorno que publica la web. La importación rechaza usar el mismo valor para ambas credenciales.

Los valores se inyectan desde el gestor de secretos o entorno privado, nunca mediante prefijos `VITE_`, `PUBLIC_`, `NEXT_PUBLIC_` o `SANITY_STUDIO_`. `.env*` ya está ignorado; no se ha creado ni leído un archivo de credenciales. Los errores no imprimen cuerpos de respuesta, cabeceras ni tokens. El snapshot solo contiene campos renderizables publicados, sin notas editoriales ni evidencias. Las notas editoriales no son un almacén de secretos de Sanity.

## Simulación y carga posterior

[Vista previa de los ocho borradores](drafts-preview.json) y [resultado real de la simulación local](dry-run.json). IDs `drafts.lst-<id-del-inventario>` y slugs conservados. Fechas/niveles/contenido/señales/capacidad vienen de la extracción validada. Precio vigente, plazas disponibles, fotos, PDF público y cambio de canal se dejan sin rellenar; las tarifas y formularios extraídos quedan como pendientes de Studio. No hay evidencia suficiente para activarlos automáticamente.

```sh
npm run sanity:import
npm run sanity:import -- --report=/tmp/lst-import-plan.json
```

Por defecto no se contacta con Sanity ni se escribe. La validación local de los ocho documentos se ejecuta completa. El informe marca `remoteCollisionCheck: pending`: no se presenta como un preflight remoto aprobado.

Después de provisionar el secreto privado, la siguiente orden **solo lee** y simula:

```sh
npm run sanity:import -- --check-remote --report=/tmp/lst-import-plan-remote.json
```

El preflight usa perspectiva raw y lee metadatos de todos los documentos: detecta colisiones de slug e ID incluso en otros tipos, borradores o versiones. Un ID lógico ya existente del mismo tipo se omite siempre, también si cambió manualmente de slug/precio; nunca se actualiza, reemplaza ni elimina. Otro tipo con ese ID o un slug ocupado por otra identidad aborta el conjunto antes de enviar mutaciones.

La carga futura exige autorización y ambos argumentos `--check-remote --apply`. La implementación prepara una sola transacción de operaciones `create` sobre los borradores nuevos, sin publicar, parchear ni reemplazar. Un ID que aparezca concurrentemente hace fallar la transacción completa. Ante timeout o resultado desconocido, repetir primero la simulación autenticada: los documentos existentes se omiten. Nunca borrar los IDs para forzar una repetición. La unicidad de slug entre IDs distintos no es una restricción atómica de Sanity: acordar una ventana sin otros importadores ni ediciones de slugs durante la carga, y repetir la comprobación después. No se ha probado una mutación remota ni su recuperación real.

## Pendientes concretos

1. Provisionar `SANITY_IMPORT_TOKEN` privado adecuado y ejecutar el preflight de solo lectura. Resolver cualquier colisión antes de autorizar la carga. No se ha inspeccionado el conjunto de borradores remoto.
2. Revisar la vista previa y autorizar expresamente la carga de los ocho **borradores**. La edición posterior deberá usar el Studio ampliado; el Studio alojado aún conserva su versión anterior hasta un despliegue futuro autorizado.
3. Antes de publicar cada salida: confirmar precio vigente/disponibilidad, condiciones promocionales y señales. Aclarar 270 € / 30 % en Marruecos y 325 € / 25 % en Senegal; no recalcularlos por inferencia. Comprobar cancelación/coberturas particulares y copy extraído, incluidos plazos de respuesta.
4. Aportar fotos aprobadas y URL HTTPS pública de cada PDF. Confirmar destinatarios/vigencia de formularios si se quiere cambiar el canal; mientras tanto conservar WhatsApp.
5. Validar edición/publicación autenticada en el Studio actualizado y decidir quién reconstruye/despliega la web. Compilación local exitosa con Sanity/vision 6.19.0; la CLI advierte que el runtime con autoactualización sirve 6.20.0. No se afirma probada esa sesión alojada.

Referencias de implementación contrastadas: [Query API](https://www.sanity.io/docs/http-reference/query), [Mutation API](https://www.sanity.io/docs/http-reference/mutation) y [transacciones](https://www.sanity.io/docs/content-lake/transactions). La perspectiva publicada, autenticación y semántica de `create` se verificaron con estas fuentes primarias. La evidencia de comportamiento local se enlaza en [validación](../../../qa/2026-10-23-sanity/README.md).
