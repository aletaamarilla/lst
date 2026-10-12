# Fotos y ventanas de LST · 12/10/2026

Revisión local de El Salvador, Asturias y Azores (destino pendiente). Base Git `6053e6173d6114ee741bc0f4310d79418f22199e`; cambios sin commit. Los cambios anteriores del checkout se conservan. No se publica, despliega ni hace push. No se envían mensajes.

## Resultado y alcance

La imagen ampliada aprovecha el espacio disponible después de reservar cabecera, pie de foto y controles. Mantiene la proporción mediante `object-fit: contain`. Se elimina el límite `60vw`; no se sustituye ninguna fotografía ni se inventa resolución. En teléfono, las horizontales que ya ocupaban todo el ancho conservan ese tamaño. El beneficio principal aparece en los retratos y en escritorio.

| Foto vertical de Asturias | Miniatura normal (recortada) | Ampliada antes | Ampliada después (completa) |
| --- | --- | --- | --- |
| 320 × 740 | 244 × 172 | 128 × 192 | 320 × 480 |
| 390 × 844 | 304 × 214 | 156 × 234 | 390 × 585 |
| 768 × 1024 | 422 × 297 | 307 × 461 | 465 × 697 |
| 1440 × 900 | 390 × 340 | 372 × 558 | 465 × 697 |

Medidas redondeadas de la imagen realmente dibujada, no solo de su caja CSS. A 390 px, El Salvador mantiene su horizontal completa en 390 × 234; su miniatura mide 304 × 214. A 1440 px, pasa de 930 × 558 a 1100 × 660. En una pantalla baja se prioriza conservar visibles los controles; no se promete una imagen mayor que la miniatura cuando la altura disponible lo impide.

Se corrigió un fallo observado al llegar con un botón al extremo: al desactivarse el botón enfocado, Chromium dejaba el foco en `body` y las flechas de teclado no respondían. El foco pasa ahora a la región de fotos, conservando la navegación y los botones desactivados en los extremos.

El selector de fechas mantiene su panel inferior en móvil, centrado en escritorio, una lista interior desplazable y una consulta independiente por salida. En pantallas bajas, el cierre ya no desaparece al desplazarse por la lista. Con texto muy grande, solo el cierre queda fijo y se desplaza el contenido; se reserva su espacio al enfocar enlaces.

La revisión independiente detectó y ayudó a resolver dos regresiones del primer ajuste: imagen sin altura al ampliar el texto y cabecera de fechas que cubría la consulta. También se corrigió una oscilación de tamaño al sacar el cierre del flujo, conservando su espacio mediante un separador del mismo ancho. La galería reserva una imagen útil de al menos 160 px en ese caso excepcional; controles y contenido se alcanzan con desplazamiento, y Cerrar sigue visible.

## Comportamientos conservados y comprobados

- Galería horizontal nativa, acceso desde «Ver fotos» y desde una miniatura concreta; controles Anterior, Siguiente y Cerrar; contador, Home/End, flechas y extremos.
- Escape, Tab y Shift+Tab, cierre con botón, retorno al disparador y a la posición de lectura. También cambio de anchura con una foto seleccionada.
- Barra inferior oculta y fondo inmovilizado al abrir cualquiera de las ventanas. Comprobación geométrica y de hit-test de los controles.
- Asturias: consultas de **6–8 noviembre** y **20–22 noviembre de 2026**, cada una con su mensaje y contexto de fecha. Se abren pestañas reales interceptadas localmente antes de llegar a WhatsApp.
- El Salvador conserva su consulta directa; Azores conserva sus fechas pendientes y no ofrece un selector inventado. Los enlaces y datos comerciales no cambian.
- Lista de 16 salidas generada con el renderer real dentro de un directorio temporal: Tab por todas las consultas, acceso a primera/última, cierre y consultas de las filas 1, 8 y 16. No se añade ningún registro a los datos de presentación.
- Movimiento normal y reducido; el scroll de fotos usa la preferencia existente. No se añade animación.

## Validación y evidencia

`npm run build`, `npm test` (5 casos) y `npm run check`: correctos. [Transcripción](pipeline.txt). El generador se revisó y se reconstruyeron las seis fichas; producen exactamente el HTML anterior a este encargo.

La matriz de navegador comprueba 320 × 740, 390 × 844, 768 × 1024 y 1440 × 900; además 320 × 320, 390 × 360, 768 × 360 y 1440 × 480. Prueba El Salvador, Asturias y Azores con movimiento normal/reducido. Incluye gestos táctiles enviados a Chromium mediante CDP, que producen eventos `isTrusted` y scroll nativo: no se sustituye el gesto por `scrollLeft` ni por eventos DOM sintéticos. El gesto también se ejecuta sobre la galería de la página.

Se añaden casos con texto al 200 %: 320 × 320, 320 × 740, 390 × 360/400/420/440/480, según ventana. Se muestrean tamaños y clases después de abrir para detectar bucles de `ResizeObserver` aunque no produzcan excepciones.

La nueva prueba completa pasa **1747 comprobaciones**, sin incidencias: 65 aperturas de consulta interceptadas, 36 gestos entre fotos ampliadas y 18 sobre la galería normal. La evidencia final se guarda en `browser-320.json`, `browser-390.json`, `browser-768.json` y `browser-1440.json`; cada lote registra los hashes exactos de CSS, JS y comprobador. [Resumen de ejecución](validation-summary.json).

El comprobador anterior `scripts/check-ux.mjs` pasa **1225 comprobaciones**, sin incidencias, incluyendo home, consultas y lectura al 200 %. [Resultado](previous-ux-checks.json). La revisión independiente ejecuta **85 comprobaciones adicionales**, sin errores, sobre los hashes CSS `64588cd6…` y JS `ef85741b…`. [Evidencia independiente](independent-review.json). No quedan defectos accionables pendientes dentro del alcance revisado.

[Conservación](preservation.json): 147 archivos previos idénticos; solo cambian `dist/trip.css` y `dist/trip.js`. Datos, fotografías, fuentes, logos, home, plantilla y seis HTML se conservan byte por byte. [Estado inicial](initial-status.txt), [huellas anteriores](baseline-hashes.json), [huellas candidatas](candidate-hashes.json) y [diff exclusivo del producto y su prueba](task-only.diff).

## Capturas comparables

Las carpetas [antes](antes/) y [después](despues/) contienen las tres fichas en los cuatro anchos pedidos y 390 × 360, con miniaturas normales y ampliadas. Los `audit.json` contienen dimensiones originales, caja y tamaño de la imagen dibujada. La lista larga de esas capturas usa copias temporales en el DOM; la prueba de regresión usa además salidas temporales generadas por la plantilla real.

| Vista | Antes | Después |
| --- | --- | --- |
| Retrato Asturias, 320 px | [Captura](antes/asturias-320x740-photo2.png) | [Captura](despues/asturias-320x740-photo2.png) |
| Retrato Asturias, 390 px | [Captura](antes/asturias-390x844-photo2.png) | [Captura](despues/asturias-390x844-photo2.png) |
| Retrato Asturias, 768 px | [Captura](antes/asturias-768x1024-photo2.png) | [Captura](despues/asturias-768x1024-photo2.png) |
| Retrato Asturias, 1440 px | [Captura](antes/asturias-1440x900-photo2.png) | [Captura](despues/asturias-1440x900-photo2.png) |
| Horizontal El Salvador, 390 px | [Captura](antes/el-salvador-390x844-photo1.png) | [Captura](despues/el-salvador-390x844-photo1.png) |
| Horizontal El Salvador, 1440 px | [Captura](antes/el-salvador-1440x900-photo1.png) | [Captura](despues/el-salvador-1440x900-photo1.png) |
| Destino pendiente Azores, 390 px | [Captura](antes/azores-390x844-photo1.png) | [Captura](despues/azores-390x844-photo1.png) |
| Fechas de Asturias, 390 px | [Captura](antes/asturias-390x844-dates.png) | [Captura](despues/asturias-390x844-dates.png) |
| Lista larga, 390 × 360 | [Captura](antes/asturias-390x360-long-dates.png) | [Captura](despues/asturias-390x360-long-dates.png) |

También se guardan capturas de [foto con texto al 200 % en 320 × 320](pruebas/large-photo-320x320.png) y [lista larga con texto al 200 % en 390 × 360](pruebas/long-dates-390x360-text200-last-date.png).

## Repetir y límites

Sin dependencias nuevas. Se reutilizan Playwright y Chromium locales. Con la vista previa arrancada mediante `npm run dev`:

```sh
LST_PLAYWRIGHT_MODULE=/ruta/al/modulo/playwright \
LST_CHROMIUM_PATH=/ruta/a/chromium \
LST_QA_OUTPUT=/tmp/lst-dialog-results \
node scripts/check-dialogs.mjs
```

`LST_QA_WIDTH=320` (o 390/768/1440) permite repetir un lote. Las bibliotecas de Chromium de esta máquina requirieron `LD_LIBRARY_PATH`; no se instalaron paquetes. La ejecución final se dividió en lotes después de una interrupción del proceso completo con código 143, sin informe final; esa ejecución interrumpida no se contabiliza como validación.

Límites: Chromium local y emulación táctil, sin Safari, Firefox, móvil físico ni lector de pantalla. El texto al 200 % se simula duplicando tamaños calculados; no equivale a todos los modos de zoom del sistema. No se valida WhatsApp nativo ni se envía el mensaje.

Un gesto largo hacia atrás desde la primera foto activa el historial de Chromium emulado y abandona la página. Se reproduce igual en la base anterior y en el candidato ([comparación](gesture-probe.json)); no se intercepta la navegación del navegador con JavaScript. Los extremos de la galería se comprueban con botones y teclado; los gestos de avance y vuelta entre fotos funcionan. No se generaliza este comportamiento de historial a móviles físicos.

Archivos del encargo: `dist/trip.css`, `dist/trip.js`, nuevo `scripts/check-dialogs.mjs` y esta carpeta de evidencia. No se modifica `scripts/render-trips.mjs`, porque los ajustes no requieren cambiar el marcado. La entrega es una mejora validada localmente, no una certificación de publicación ni de los datos provisionales.
