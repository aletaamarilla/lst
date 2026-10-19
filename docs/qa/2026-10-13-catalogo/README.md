# Catálogo LST · 13/10/2026

Implementado localmente en `/viajes/`, sin dependencias nuevas, commit, push, publicación ni despliegue. Seis destinos desde `data/trips.json`; filtros inmediatos de nivel y estado. Los datos provisionales no se han investigado ni alterado.

## Versión y alcance

Repositorio `aletaamarilla/lst`, checkout `/home/amfernandez/personalProjects/letsurftogethersystem`, rama `main`, HEAD de partida `351576d508314ff4bdf2cb8421f600dcc0c8d3de`. La base incluía cambios sin commit de Niveles, tarjetas de home y Conócenos; HEAD por sí solo no representa la base funcional.

- [Huellas de la base al empezar](base-hashes.json), copia de los archivos afectados en `antes/`.
- [Diff respecto al inicio](catalogo.diff), incluidos archivos nuevos y ajustes en consumidores/comprobadores.
- [Huellas de la candidata revisada](candidate-hashes.json), para identificar los archivos sin commit.

Durante esta tarea hubo otra implementación de FAQs/navegación en el mismo checkout. Se preservaron sus nuevas rutas, enlaces de cabecera/pie, navegación sin JS y sus cambios en estilos compartidos, generador de fichas y `check.mjs`. Las diferencias de esos bloques no se atribuyen al catálogo. El selector de fechas y los datos/fotografías/fuentes no se modifican por esta tarea. La validación se ejecuta sobre el conjunto local integrado.

## Archivos de esta tarea

Nuevos:

- `dist/viajes/index.html`: página estática, controles, ayuda, estado vacío y bloque de tarjetas generado.
- `dist/catalog.css`: estilos aislados del catálogo.
- `dist/catalog-filter.js`: normalización de filtros e intersección de niveles/estado.
- `dist/catalog.js`: controles, visibilidad, contador accesible, limpieza y URL/historial.
- `scripts/render-catalog.mjs`: tarjetas desde JSON usando `levelsFor` y `tripFacts` existentes.
- `scripts/catalog-filter.test.mjs`: pruebas de comportamiento.
- `scripts/check-catalog.mjs`: aceptación de navegador opcional, sin dependencias en package.json.

Integración:

- `dist/index.html` y `dist/home-cards.css`: entrada «Ver todos los viajes» junto al calendario conservado.
- `dist/niveles/index.html` y `dist/levels.js`: cuatro enlaces numéricos al catálogo y eliminación de su antigua interceptación; se conserva el filtro local de la guía y sus anclas.
- `dist/conocenos/index.html`: enlaces al catálogo.
- `package.json`, `scripts/check.mjs`: generación, tests y comprobación de salida desactualizada.
- `scripts/check-levels.mjs`, `scripts/check-about.mjs`: expectativas de navegación adaptadas al catálogo.
- README, propuesta e inventario: decisiones, mantenimiento y trazabilidad.

## Criterios y evidencia

| Caso | Resultado comprobado |
| --- | --- |
| Estado inicial | Los seis destinos y enlaces se muestran, sin filtros activos. |
| I · Rookies y IV · Supercracks | Asturias, Azores, Euskadi, Marruecos y Cádiz. El Salvador queda fuera. |
| II · Aprendices y III · Riders | Los seis destinos. El Salvador conserva «con autonomía». |
| Con fecha | El Salvador y Asturias; con I/IV solo Asturias. No significa plazas disponibles. |
| Próximamente | Azores, Euskadi, Marruecos y Cádiz, en todos los niveles configurados. |
| Combinación | Las 15 combinaciones de cinco opciones de nivel y tres estados contrastadas con el JSON. |
| Defaults y varios niveles | Niveles ausentes, null o vacíos resueltos por el modelo; restricciones no consecutivas y duplicadas sin ampliar ni duplicar resultados. |
| URL | 1–4 aplican el nivel. Vacío, 0, 5, texto, `02`, `2.0`, `2foo` o espacio previo muestran Todos. Recarga, atrás y adelante conservan ambas selecciones. |
| Limpieza | Restablece ambos controles, todos los resultados y la URL. Desde estado vacío devuelve el foco a un control visible. |
| Cero resultados | Fixture HTTP local con niveles incompatibles: contador 0, explicación, limpiar y WhatsApp. No se modifica el JSON. |
| WhatsApp | Teléfono existente y texto de consulta; apertura interceptada localmente. Consultar no confirma una plaza. |
| Teclado | Selectores nativos con Espacio/flechas/Enter, Tab, limpieza, detalle, menú y Escape con foco visible. |
| Anuncio de resultados | Cambios de texto observados en `role=status`, `aria-live=polite`, `aria-atomic=true`; foco conservado. |
| Sin JavaScript | Seis tarjetas visibles incluso con `?nivel=1`; los seis enlaces abren sus detalles en móvil y escritorio. |
| Móvil/escritorio | 320, 390, 768 y 1440 px; sin desbordamiento horizontal, texto al 200 %, fotos y fuentes cargadas, cabecera fija. |
| Detalles | Las seis rutas abren y Asturias conserva sus dos consultas por fecha en el selector. |
| Integración | Home → catálogo, Conócenos → catálogo, cuatro niveles → filtro numérico. Calendario y tarjetas anteriores conservados. |

## Pruebas ejecutadas

- `npm run build`: correcto; genera fichas, destinos de la guía y catálogo. [Log](build.log).
- `npm test`: 25 pruebas correctas, incluidas 20 de catálogo y las 5 anteriores del modelo. [Log](test.log).
- `npm run check`: correcto sobre 11 páginas integradas (incluye FAQs concurrentes), enlaces/anclas/recursos, datos, noindex y JS. [Log](check.log).
- `scripts/check-catalog.mjs`: 373 comprobaciones correctas, sin errores JS. [Resultado completo](browser.json), [log](browser.log).
- `scripts/check-home-cards.mjs`: 455 comprobaciones correctas de calendario, fotos, datos, teclado, detalle, texto ampliado y sin JS. [Resultado](integracion-home/browser-home.json), [log](home.log).
- `scripts/check-about.mjs`: 225 comprobaciones correctas. La expectativa sin JS se adapta a la cabecera sticky incorporada por la tarea concurrente y verifica posición visible al hacer scroll. [Resultado](integracion-conocenos/browser.json), [log](conocenos.log).
- `scripts/check-levels.mjs`: 1.656 de 1.657 comprobaciones correctas, sin errores JS; una incidencia de tolerancia de posición durante scroll suave (detalle a continuación). Los filtros de la guía, enlaces numéricos al catálogo, historial, consultas y navegación pasan. [Resultado íntegro](integracion-niveles/browser.json), [log](niveles.log).
- Revisión independiente funcional y de compatibilidad: sin defectos accionables del catálogo, sobre manifiesto SHA-256 `f0cfda5719bc2404561f26af73bfba6f4899b9a3ea4e23a28d3b39b478116789`. [Informe](revision-independiente.md), [smoke ejecutado por el revisor](revision-smoke.json).

El primer intento de navegador no arrancó por faltar `LD_LIBRARY_PATH`; se reutilizaron las bibliotecas ya disponibles. En el primer recorrido se corrigieron dos errores del comprobador: `innerText` aplicaba las mayúsculas CSS a «Próximamente», y el test pulsaba Enter sobre un select cerrado (lo abría), en vez de abrirlo primero con Espacio. No fueron defectos del producto; la suite completa posterior pasa.

### Contraste de la incidencia de Niveles

La suite amplia registró `320 smooth arrival cue at destination supercracks`: título a 92,40625 px, cabecera de 71 px. El test exige como máximo cabecera +20 px; excedió esa tolerancia en 1,40625 px, sin ocultación del ancla. No se cambia la animación ni se relaja su test para obtener un pase.

Se sirvió la instantánea inicial con el mismo servidor Node en 4177 (solo cambia puerto), mismos recursos y runtime que la candidata en 4175. Cinco repeticiones por versión, con secuencia Supercracks → Supercracks → Rookies a 320×844 y movimiento normal, produjeron 30 mediciones. La base reprodujo **exactamente** el resultado Supercracks 92,40625 / cabecera 71; la candidata tuvo una lectura de Rookies 93,1875 / cabecera 71. Las 30 mantuvieron el ancla bajo la cabecera. Esto acredita que el comportamiento intermitente ya está en la base; no se atribuye al catálogo ni se afirma haber resuelto su causa.

[Mediciones base/candidata](arrival-comparison.json), [script usado](arrival-comparison.mjs). El revisor independiente no lo considera bloqueo funcional del catálogo; la suite histórica permanece 1.656/1.657 y no se presenta íntegramente aprobada.

La ejecución final del catálogo se repitió después de recuperar el servidor local, cerrado por la tarea concurrente; pasa otra vez 373/373. Las 35 huellas de datos, modelo, lógica de fechas y recursos (fotografías, fuentes y logos) coinciden con la base.

Reproducción con servidor local activo (`npm run dev`, puerto 4175):

```sh
LD_LIBRARY_PATH=/tmp/lst-browser-libs/root/usr/lib/x86_64-linux-gnu \
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LST_QA_OUTPUT=docs/qa/2026-10-13-catalogo \
node scripts/check-catalog.mjs
```

## Capturas

- [Catálogo móvil · 390 px](capturas/catalogo-390.png).
- [Catálogo escritorio · 1440 px](capturas/catalogo-1440.png).
- [II + Con fecha · móvil](capturas/catalogo-390-filtrado.png).
- [II + Con fecha · escritorio](capturas/catalogo-1440-filtrado.png).
- [Texto 200 % · móvil](capturas/catalogo-390-texto200.png).
- [Estado vacío con fixture aislada](capturas/catalogo-vacio-fixture.png).

## Límites

Navegador real Chromium local con tamaños de pantalla simulados; no se han usado dispositivos físicos ni Safari/Firefox. El anuncio se valida por semántica accesible y cambios de DOM, sin audición manual en lector de pantalla. Las combinaciones actuales nunca producen cero resultados; esa rama se acredita con fixture aislada y pruebas unitarias.

La web sigue con `noindex,nofollow` y datos provisionales, incluida Asturias como demo autorizada. La disponibilidad sigue pendiente de consulta y los destinos próximos no reciben servicios, precios o fechas nuevos. No se envía ningún mensaje a LST ni se acredita una reserva o conversión comercial. No se publica ni despliega.
