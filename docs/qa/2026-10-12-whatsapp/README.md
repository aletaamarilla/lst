# LST · WhatsApp y legibilidad · 12/10/2026

Implementación y validación local terminadas. Repositorio `aletaamarilla/lst`, base `6053e6173d6114ee741bc0f4310d79418f22199e`, inicialmente limpio. Candidata: diff sin commit, identificado por archivo en [version.json](version.json). No se ha hecho push, publicación ni despliegue.

## Hallazgos contrastados antes de editar

- WhatsApp de cabecera oculto por debajo de 1000 px. El menú móvil tenía cuatro anclas y ningún contacto; a 768 px se mostraba navegación de escritorio sin WhatsApp.
- Tras abrir el menú con teclado, Tab saltaba a «Elige tu próximo viaje», sin recorrer los enlaces: el botón estaba después del `nav` en el DOM.
- Condiciones del precio y datos de la barra a 10 px; avisos, pies de foto y datos de la ficha lateral a 11 px. Estados del selector a 9 px.
- «Me interesa» navegaba a una ficha en la home y abría WhatsApp en las fichas pendientes.
- Con texto al 200 % en 390×480, la barra inferior de El Salvador ocupaba 225 px y las fechas de Asturias tenían solo 18 px de espacio para la lista. También había desbordamiento de texto en controles de niveles y programa.

Las capturas originales se tomaron antes de modificar fuentes; las medidas están en [before/audit.json](before/audit.json). Las decisiones históricas de revisiones 5–11 no se aplicaron sobre los datos vigentes de la revisión 12.

## Cambios y archivos

- `dist/index.html`, `dist/app.js`, `dist/mobile.css`: consulta en el menú, mismo teléfono y contexto, desplegable hasta 999 px; orden de Tab, Escape y cierre al salir; «Ver destino» y tamaños informativos diferenciados.
- `dist/styles.css`: foco de tinta con halo crema, distinguible sobre el naranja y los fondos existentes.
- `scripts/render-trips.mjs`: «Consultar destino» y «Consultar por WhatsApp». Reconstruidas las seis fichas; cinco HTML cambian y Asturias produce el mismo HTML.
- `dist/trip.css`, `dist/trip.js`: fechas/estados a 12–13 px, notas y ayudas a 13–14 px, reserva dinámica del espacio de cabecera/barra, reflujo del texto y panel de fechas desplazable cuando la lista tendría menos de 160 px disponibles.
- `scripts/check-ux.mjs`: verificación opcional en navegador, sin dependencias añadidas. README y propuesta documentan la revisión vigente.

La barra permanece fija si ocupa como máximo un cuarto de la altura visible; si supera ese tamaño, queda al final de la página para no estrechar la lectura. No se añade botón flotante. Se conservan las consultas dentro del contenido y la selección por fecha.

`data/trips.json`, el modelo de viajes, los precios/fechas/servicios, mensajes preexistentes, fotografías, logos, Aura, Work Sans, Space Mono y colores de marca no cambian. No se investigó la exactitud comercial de los datos.

## Evidencia de aceptación

| Criterio | Comprobación y resultado |
| --- | --- |
| WhatsApp accesible y contextual | Menú recorrible con Tab, enlace visible y de al menos 48 px; 43 aperturas interceptadas localmente, número `34648189257`, contexto general/destino/fecha verificado. Cero envíos. |
| Acciones anticipadas | Cuatro enlaces «Ver destino» siguen abriendo rutas internas; consultas de detalles identificadas; «Elegir fecha» de Asturias conservado. |
| Lectura y composición | Home, El Salvador, Asturias y Azores a 320×740, 390×844, 768×1024, 1024×900 y 1440×900; además 390×480 y 320×568. Sin desbordamiento horizontal en la matriz final. Capturas examinadas visualmente. |
| Texto ampliado | Misma matriz de cuatro páginas a 390×480 y 320×740 con tamaños tipográficos calculados multiplicados por dos; menú desplazable, fechas alcanzables, pie no cubierto y foco visible. |
| Teclado y foco | Tab/Shift+Tab, Escape, salida del menú, foco inicial y retorno de diálogos, recorrido por los controles del detalle y separación de cabecera/barra. |
| Fechas | Ambas salidas de Asturias accesibles; sus mensajes independientes se interceptan. Cierre restaura foco y posición de lectura. |
| Movimiento reducido | `prefers-reduced-motion: reduce`: scroll automático sin animación, transiciones desactivadas, galería mediante flechas de teclado sin animación. |
| Exploración | CTA de portada sigue desplazando a `#viajes`; rutas y enlaces locales pasan el comprobador del repositorio. |
| Pipeline | `npm run build`, `npm test` (5/5), `npm run check`, sintaxis del comprobador y `git diff --check`: correctos en la versión final. Las comprobaciones existentes no se han debilitado. |

[Resultado completo de navegador](verification.json): 1225 aserciones, ningún fallo, ningún error JavaScript. El resultado vincula cada aserción con página y viewport; las repeticiones del recorrido de foco no representan 1225 requisitos distintos.

Revisión independiente sobre el diff funcional final: sin hallazgos accionables pendientes. Detectó y se corrigieron dos problemas intermedios: retirada de la barra fija en teléfonos cortos aun cuando cabía y lista de fechas comprimida a 320×740 con texto grande. Volvió a comprobar esos escenarios, WhatsApp, teclado, movimiento y pipeline. [Matriz independiente](reviewer-final-matrix.log). Huellas de `trip.css` y `trip.js` revisadas coinciden con `version.json`.

## Capturas antes/después

| Vista | Antes | Después |
| --- | --- | --- |
| Menú móvil, 390×844 | [Antes](before/menu-390x844.png) | [Después](after/menu-390x844.png) |
| El Salvador, 390×844 | [Antes](before/el-salvador-390x844.png) | [Después](after/el-salvador-390x844.png) |
| Fechas de Asturias, 390×844 | [Antes](before/dates-390x844.png) | [Después](after/dates-390x844.png) |
| Tarjetas de la home | [Antes](before/cards-390x844.png) | [Después](after/cards-390x844.png) |

[Consulta alcanzable con texto al 200 %, Asturias 320×740](after/dates-text200-320.png). La matriz completa y otras capturas de esta sesión se conservan en `/tmp/lst-ux-20261012/`; los pares anteriores están guardados con el proyecto.

## Repetir las comprobaciones

Desde el checkout, ejecutar el pipeline y mantener `npm run dev` en otra terminal. Para el navegador se requiere una instalación disponible de Playwright/Chromium; no se añade al paquete de la web:

```sh
npm run build
npm test
npm run check
LST_PLAYWRIGHT_MODULE=/ruta/absoluta/al/paquete/playwright \
LST_CHROMIUM_PATH=/ruta/absoluta/a/chromium \
node scripts/check-ux.mjs
```

También admite `LST_PREVIEW_URL` (por defecto `http://127.0.0.1:4175`) y `LST_QA_OUTPUT` (directorio temporal por defecto). Si Playwright está resoluble como paquete, puede omitirse `LST_PLAYWRIGHT_MODULE`. El comprobador responde localmente a las navegaciones `wa.me` y bloquea el resto de HTTPS externo; termina con código 1 ante fallos.

En esta sesión se reutilizaron Chromium 1228 y Playwright 1.50.1 ya instalados, más bibliotecas locales de Chromium/gnome vía `LD_LIBRARY_PATH`, sin instalar dependencias ni cambiar el sistema.

## Límites

Revisión en Chromium automatizado con capturas inspeccionadas; no se probaron Safari, Firefox, VoiceOver/TalkBack, dispositivos físicos ni los valores físicos del safe area. El texto al 200 % se simuló duplicando tamaños calculados, no mediante la preferencia de texto del sistema operativo. Las aperturas de WhatsApp se interceptaron: no se verificó el salto a la aplicación nativa, el receptor ni una entrega real. No se verificaron datos comerciales ni impacto en conversión.
