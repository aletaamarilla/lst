# Revisión independiente de viajes unificados

Fecha: 24 de octubre de 2026. Revisor: subagente independiente; sin modificaciones en archivos de implementación.

## Versión y alcance

Repositorio letsurftogethersystem, HEAD 58f338661fc4705364fea08727c836e79b3f2048, con cambios sin commit. Base funcional anterior a la tarea: before/, junto a este informe. El checkout ya contenía mucho trabajo previo; no se atribuye el resto de ese diff a esta tarea.

Se revisaron agrupación, adaptador Sanity, niveles y salidas, home/catálogo/guía/detalle, rutas, consulta publicada, esquema Studio y enlaces de programa. Contratos examinados: herencia, disponibilidad, precios, capacidad, PDF, mensajes, estados, URLs y separación de servicios por fecha. Nuevos: scripts/trip-groups.mjs y scripts/trip-groups.test.mjs. Las huellas siguientes identifican las fuentes y snapshot exactos revisados.

## Resultado

No quedan defectos bloqueantes identificados en esta candidata. La conclusión cubre el código y las comprobaciones locales descritas, no certifica publicación remota ni promete ausencia absoluta de defectos.

## Evidencia ejecutada por el revisor

- npm test: 65/65 pruebas aprobadas sobre la candidata final.
- npm run check: PASS, 24 páginas; rutas, enlaces, anclas, recursos, HTML generado y WhatsApp contextual.
- Comparación independiente con aserciones entre before/dist/catalog-snapshot.json y dist/catalog-snapshot.json: ocho salidas publicadas pasan a seis destinos; cada salida conserva fechas inicial/final, precio, PDF, capacidad y niveles efectivos. Las ocho URL antiguas contienen exactamente el HTML de la ruta común.
- Marruecos: niveles generales [1,2], segunda salida [3]. El material de iniciación no aparece entre los servicios generales ni en el programa de la segunda salida. Ningún nombre del catálogo contiene nivel.
- Contraste de las mismas entradas entre base y candidata: un destino pendiente sin fechas conserva enquiry; una mezcla de documentos confirmado/pendiente se agrupa sin colisión.

La suite cubre herencia del documento nativo con varias fechas, sustitución de niveles, estados mixtos, programa/material, retirada de una salida y conservación de la ruta común. Se contrastaron las pruebas con sus consumidores; su número por sí solo no demuestra cumplimiento.

## Hallazgos resueltos

1. PDF general omitido cuando solo otra fecha tenía PDF propio: resuelto mediante herencia efectiva en departuresFor; regresión nativa aprobada.
2. Fecha disponible oculta por estado general full: resuelto agregando estados efectivos; la regresión comprueba reapertura del selector.
3. Destino sin fechas convertido en full por every([]): agregado vacío devuelve enquiry; contraste con base y regresión aprobados.
4. Colisión de ruta común entre documentos de estados diferentes: agrupación sin separar por estado y estado general derivado; contraste final ejecutado.
5. Mensaje especial de fecha completa desalineado con el validador: centralizado en departureMessage y consumidores alineados.
6. Requisito de autonomía vaciado no heredaba el general: normalización del campo vacío y herencia corregidas; regresión aprobada.

## Límites

El revisor no desplegó ni modificó documentos en Sanity, ni ejecutó QA visual de navegador o despliegue de Studio. La fuente conserva los documentos importados; la unificación revisada se realiza en el adaptador público y el esquema permite futuras fechas dentro de un solo viaje. La QA visual y cualquier despliegue corresponden al agente principal y deben registrarse por separado.

## Huellas SHA-256 de la candidata

```text
e623de857f89bfb121898a74445b23fc10de9dbb46502fcc9d24cbd7740e2d45  scripts/trip-groups.mjs
1ad672f9de04efac44b99a3d35a2884846b3d5d59e5ed1c0b66a0b6ac5efc7ae  scripts/trip-groups.test.mjs
c5b31089a25bcf12391819d68c1bc39619ccf238d6d703fff718ffcd31ffd93d  scripts/sanity-trips.mjs
a77b2bc9d4d04b6796aae70d19a8e24b03e79a2accebaf731682d294ef5158bb  scripts/trip-model.mjs
25fbe6d5acc26c54e1bf16569563c4bd553a9ff5eb0f23ce1e082635aaa233d8  scripts/render-trips.mjs
68b748f57edf29c4d0bc968b2b8959bd5bfc607ce0d9a6114047de0282b4398c  scripts/render-catalog.mjs
9a3570f1c2038b1ec62649c88a1fbaa7533e3fbb14f7e7e07faa6399ce29cd1b  scripts/render-home-trips.mjs
35f7edde16c2195984d7e9f0373573e61e3bb6bf1f84d4ae8df925bb2ff4fc3c  scripts/render-level-trips.mjs
2ebd18a0777ad96c459be1f5d58e933ac51b3aafceda2161af0360180ddeafeb  scripts/build.mjs
52215acee1f2007e8f8ee304504be5f705f164e03ebd1f9b9ae35536f12747c5  scripts/check.mjs
cc5c4593b7d50a40aeeee0a54000f70f216e1383bcd8e3abbfc051f38706fccd  scripts/sanity.mjs
c19d3ba3e9fcfe06e44d829f11d4bd145fef44063a9b17a5727309c556d96bcf  studio/schemaTypes/trip.ts
478a2efabef466859b7c0952e75ec034f4331009e8660ba0fac8d3b05d1e1b09  dist/trip.js
0bae349fd7cd79c761347f6144af3ce6f8edb20997b0160381a106baf232aef1  dist/trip.css
7daaf1c17beb5924060d40787c441ea18e40252923b0625c847e5be3096df7f6  dist/home.css
e68265fb86ac95666b33336f099b916d4bf5f41a4517f354800160c5d471f25a  dist/catalog-snapshot.json
```
