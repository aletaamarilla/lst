# LST · Responsabilidad · 12/10/2026

Implementación y validación local terminadas. Repositorio `aletaamarilla/lst`, rama `main`, base `6053e6173d6114ee741bc0f4310d79418f22199e`. El checkout ya contenía las revisiones de WhatsApp, presentación y comunidad sin commit; se conservan. Esta entrega también queda sin commit, sin push, publicación ni despliegue.

## Texto implementado

**El lugar también importa.**

Para LST, el surf va de la mano del respeto al océano, al lugar y a quienes surfean allí. La humildad ante la comunidad local y sus costumbres forma parte de nuestra manera de compartir las olas.

Se incorpora una sola vez al cierre de `#nosotros`, después de la historia, el equipo y la fotografía de Laga. El título es un `h3` dentro de la presentación existente. El bloque comparte sus columnas en escritorio y se lee seguido en móvil; añade aproximadamente 220 px a 390 px de ancho y 131 px a 1440 px. No introduce un apartado principal, protocolos, actividades incluidas, resultados ambientales ni CTA. La imagen no se presenta como prueba de una recogida ni identifica a surfistas locales.

## Fuentes y alcance de la evidencia

- [Home original de LST](https://www.letsurftogether.com/): presentación y bloque de océanos. Documenta la publicación de las iniciativas de recogida, colaboración y aportación.
- [Sobre LST original](https://www.letsurftogether.com/sobre-lst/): respeto a surfistas locales, costumbres y humildad; repite las afirmaciones ambientales. Esa repetición no es una corroboración independiente.
- `Cuestionario_Marca_Web_LST.pdf`, facilitado por el cliente: cinco páginas revisadas. P. 1 (preguntas 1 y 4), cultura local y honestidad; p. 2 (6–9), tono e identidad; p. 3 (14), pasión por el océano. No confirma recogidas, colaboración ni 3 %. No se copian datos personales o legales.
- README, propuesta, inventarios, datos y documentación previa del checkout: no aportan respaldo de vigencia o ejecución de estas acciones. No se investigan ni revisan comercialmente los viajes.

Las dos páginas se consultaron directamente el 12/10/2026, con respuesta HTTP 200. El inventario registra URLs, apartados, fecha y SHA-256 de los HTML y del PDF. **Se acredita la publicación de las afirmaciones; no su ejecución ni continuidad actual.** Los principios de respeto sí se recuperan como identidad de marca, sin presentar una operación ambiental como confirmada.

## Texto preparado para revisión · fuera de la interfaz

Los tres borradores siguientes viven en `responsibilityRevision16.pendingCommitments` del [inventario](../../content-inventory.json). **No están aprobados para incorporarse a la web.** Son textos concretos condicionados a la evidencia indicada; cada uno debe ajustarse si lo confirmado tiene otro alcance.

| Borrador | Confirmación necesaria |
| --- | --- |
| Durante nuestros viajes recogemos plásticos de las playas. | LST debe confirmar, con fecha, que continúa la actividad, en qué viajes se realiza y su inclusión en las salidas a las que se atribuya. Hace falta registro reciente con fecha, lugar y actividad. Si solo se acredita en ciertos viajes, no publicar esta redacción general. |
| Colaboramos con Universal Plastic en proyectos de recogida de plásticos. | Confirmación fechada de ambas partes o acuerdo vigente que identifique entidad, proyecto, periodo y contenido de la colaboración. La mención antigua o un logo no bastan. |
| Destinamos el 3 % de cada reserva a proyectos de recogida de plásticos en colaboración con Universal Plastic. | LST debe acreditar vigencia, reservas incluidas, fecha de aplicación, base de cálculo (bruto/neto, impuestos y conceptos), cancelaciones/reembolsos, destinatario, proyectos, periodicidad y mecanismo. Se necesitan justificantes recientes de transferencias o liquidaciones, además de respaldo de la colaboración vigente. |

Dependencias editoriales: responsables de LST y confirmación o acuerdo de Universal Plastic. No se ha contactado con ellos. Estas dependencias bloquean publicar los borradores como acciones actuales; no impiden el bloque de principios ya implementado. No se sustituyen por otras promesas: tampoco se trasladan charlas, educación ambiental, reducción de huella, convenios locales o garantías de dejar intactos los lugares. Sin certificados, logos, cantidades retiradas ni afirmaciones de «viaje sostenible».

## Validación y conservación

- `npm run build`: seis fichas reconstruidas. Las seis producen bytes idénticos a la base previa.
- `npm run check`: PASS, siete páginas; enlaces, anclas, archivos locales, consultas, escenarios de datos, fechas, JavaScript y noindex. [Transcripción](pipeline.txt).
- Navegador Chromium: home a 390 × 844 y 1440 × 900, HTTP 200, fuentes cargadas, sin errores JavaScript, imágenes ausentes ni desbordamiento horizontal. Inspección visual directa de la presentación a ambos anchos. [Auditoría](capturas/audit.json).
- Comprobación focalizada de navegación hasta LST, ubicación única, texto sin recortes, geometría, fuentes y exclusión de afirmaciones pendientes; también 320 px y texto al 200 %. 36 comprobaciones sin fallos. [Evidencia](browser-checks.json).
- [Conservación](preservation.json): 129 comprobaciones sin fallos. 122 archivos previos sin cambios, incluidos datos de viajes, seis fichas, scripts y 32 assets. La home es idéntica al retirar el nuevo bloque, el CSS anterior permanece como prefijo íntegro y todos los campos anteriores del inventario se conservan.
- [Revisión independiente](revision-independiente.md): sin bloqueos; contrastó fuentes, PDF, consumidores, diff y capturas. Ejecutó `npm run check` sobre los cinco hashes candidatos. No hubo cambios posteriores en esos cinco archivos.

Sin nuevas dependencias de aplicación. Para capturas se reutilizaron Playwright 1.50.1, Chromium 1228 y bibliotecas locales de Chromium/gnome mediante `LD_LIBRARY_PATH`, sin instalar paquetes ni modificar el sistema. El primer arranque sin esas bibliotecas falló antes de abrir la página; la validación citada corresponde al arranque resuelto. Una comprobación inicial del HTML bruto coincidió con caracteres codificados de WhatsApp; se corrigió para analizar los nodos de texto, sin modificar el producto.

Límites: validación local en Chromium; no Safari, Firefox, móviles físicos ni lector de pantalla. El texto al 200 % se simula duplicando tamaños calculados. No se ensaya contacto externo ni apertura de WhatsApp nativo. No es una auditoría ambiental ni una validación comercial de viajes o de preparación para lanzamiento. Siguen vigentes los pendientes anteriores del inventario.

## Capturas

| Vista | 390 px | 1440 px |
| --- | --- | --- |
| Presentación con el bloque | [Móvil](capturas/home-390-people.png) | [Escritorio](capturas/home-1440-people.png) |
| Bloque dentro del viewport | [Móvil](capturas/home-390-responsibility-viewport.png) | [Escritorio](capturas/home-1440-responsibility-viewport.png) |
| Presentación anterior | [Móvil](antes/home-390-people.png) | [Escritorio](antes/home-1440-people.png) |
| Home completa | [Móvil](capturas/home-390-full.png) | [Escritorio](capturas/home-1440-full.png) |

## Archivos y versión

- `dist/index.html`: un bloque nuevo en presentación; el resto de la home se conserva.
- `dist/mobile.css`: reglas nuevas acotadas a `.minimal-cover .lst-respect`.
- `docs/content-inventory.json`: principios, evidencia de publicación, tres borradores y dependencias explícitas.
- `README.md` y `docs/propuesta.md`: revisión 16 y decisiones editoriales.
- `docs/qa/2026-10-12-responsabilidad/`: archivos nuevos de esta entrega, capturas y evidencia; no se sirven desde `dist/`.

[Diff exclusivo de este encargo](task-only.diff), [estado inicial](initial-status.txt), [huellas previas](baseline-hashes.json), [cinco hashes revisados](candidate-hashes.json) y [versión final](version.json). Identificador de candidato: `95770966101e15c95661702f6215e93f64c623389593e7f695f825c25ecdf07f`. No se atribuye el trabajo previo sin commit a este encargo.
