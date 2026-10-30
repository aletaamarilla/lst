# Rango fijo y programa único por viaje · 25/10/2026

Implementación local terminada sobre Git `58f338661fc4705364fea08727c836e79b3f2048`, con cambios previos sin commit conservados. Sin commit, push, publicación del CMS ni despliegue. [Alcance y hashes finales](version.json), [diff propio de fuentes](task.patch), [revisión independiente](independent-review.json).

## Resultado observable

- **Marruecos**, I–II: 17–24 enero de 2027, `/viajes/marruecos/`. Mantiene clases, material de iniciación/neoprenos, programa y dossier propios.
- **Marruecos avanzado**, III: 24–31 enero de 2027, `/viajes/marruecos-avanzado/`. Mantiene coaching intensivo con Lucas, autonomía obligatoria, tabla propia o alquiler y dossier propios.
- **Maldivas**, II–III: 21–28 marzo y 28 marzo–4 abril de 2027; un viaje y un mismo itinerario. El catálogo tiene siete viajes y ocho fechas.
- Home, catálogo, guía de niveles, detalle e inscripción usan la misma separación. Las URLs fechadas de ambos Marruecos resuelven su propio viaje; categorías Brevo 3/4 y Maldivas 7/8 conservadas.

El rango se ve en portada; el bloque de nivel muestra los requisitos y enlaza al otro Marruecos. El programa común queda visible antes de las inclusiones. El selector se reserva para viajes con varias fechas y muestra precio, promoción, disponibilidad, capacidad y PDF propios. Las condiciones de pago tienen un desplegable nativo y se conservan también sin JavaScript.

Se retiraron funciones de nivel por salida, agregación de niveles, programas alternativos por fecha, controles/eventos/estilos de esos programas, el indicador de cuatro niveles del detalle, etiquetas repetidas en filas de fecha y el campo `levelTitle` sin consumidor. Studio solo permite el rango/requisito/programa del viaje. El adaptador rechaza overrides antiguos no vacíos para impedir publicar un viaje incoherente. La agrupación exige igualdad de rango, requisitos y programa; cambiar solo un título retirado no divide Maldivas.

## Validación final

- [100/100 pruebas de comportamiento e integración](tests.txt). Incluyen programas e inclusiones aislados, rango fijo, pagos/PDFs por fecha, disponibilidad, promociones, filtros, retirada de contenido y rutas históricas.
- [40 páginas y todos sus enlaces, anclas, recursos, inscripciones y generación](check.txt).
- Tipos de Studio (`npm run studio:check`) PASS. [Compilación local de Studio](studio-build.txt) PASS con `--no-auto-updates`, usando las dependencias instaladas. La compilación normal no pudo alcanzar el CDN de actualizaciones.
- [214 comprobaciones del detalle en Chrome](browser-results.json), 320/390/768/1440 px, siete viajes, selector, foco/Escape, galería, filtros, categorías de inscripción, texto al 200 % y sin JavaScript. [Script reproducible](browser-check.mjs): ejecutar desde la raíz con `LST_PLAYWRIGHT_MODULE` y `LST_CHROMIUM_PATH`; guardar las capturas en `artifacts/single-programme-browser`.
- Catálogo: **567 comprobaciones** con `scripts/check-catalog-browser.mjs`, 320/390/481/768/1024/1440 px, combinaciones de filtros, historial, teclado, fechas, estados vacíos, sin JavaScript y texto ampliado. Una expectativa antigua de radio 28 px falló idénticamente con los renderers iniciales y los mismos documentos; el CSS compacto previo ya usa 25 px. Se actualizó únicamente esa expectativa.
- Revisión independiente de implementación, consumidores y compatibilidad sin bloqueos pendientes. Detectó y recomprobó dos correcciones: campo `levelTitle` invisible que impedía agrupar fechas, y lema genérico de Marruecos avanzado. Verificó además pagos distintos y escape de texto por fecha con/sin JavaScript; ejecutó la suite final y el comprobador.

La generación final utiliza los ocho documentos publicados obtenidos de la API de Sanity durante esta sesión, retenidos privadamente en `artifacts/single-programme-source.json`; la red de Ubuntu no alcanzó la API y por eso se pasaron esos mismos documentos a `buildSite`. No se usaron fixtures ni borradores como catálogo público. Los 99 tests de la base pasaban en Ubuntu; los errores de permisos observados al ejecutarlos desde el sandbox de Windows no se atribuyen al producto.

## Capturas

- [Portada móvil de avanzado](browser/marruecos-avanzado-390-cover.png).
- [Portada de escritorio de avanzado](browser/marruecos-avanzado-1440-cover.png).
- [Rango y requisitos de Marruecos](browser/marruecos-390-level.png).
- [Selector común de Maldivas](browser/maldivas-dates-390.png).

## Publicación y recuperación

El código web y el esquema Studio están preparados localmente y necesitan desplegarse para aplicarse en producción. Los ocho documentos actuales siguen siendo compatibles: no se cambian campos comerciales ni se requiere migración destructiva del CMS. El nuevo esquema evita crear niveles por fecha; un documento antiguo que los incorporase deberá separarse antes del siguiente build. Publicar Studio antes de seguir editando reduce ese riesgo. La recuperación consiste en restaurar el bundle web/esquema anterior; no hay escrituras de datos que revertir.

No se enviaron formularios ni mensajes comerciales. Sin Safari/iOS físico ni medición de conversión. Las copias históricas de QA pertenecen a trabajos previos y se conservan; no son código activo.
