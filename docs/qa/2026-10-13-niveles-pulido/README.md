# Niveles · ajustes de interacción · 13/10/2026

Candidata local sin commit sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de`, repositorio LST. Se conserva todo el trabajo anterior. Servidor en http://localhost:4175/niveles/. Sin publicación, despliegue ni push.

## Cambios y criterios comprobados

- **Destacado breve:** solo al activar un nivel del índice. Comienza al llegar con el scroll, dura 1,1 segundos y se retira incluso si la tarjeta conserva el foco. Puede activarse de nuevo. El filtro, historial y mensaje de WhatsApp conservan su contexto sin colorear permanentemente ninguna tarjeta. Con movimiento reducido se muestra una señal estática breve; sin JavaScript las anclas siguen funcionando, sin destacado permanente.
- **Dos botones en una fila:** «Ver viajes» y «WhatsApp», desde 320 px a tamaño normal. Altura mínima de 44 px, mensajes específicos y nombres accesibles con el nivel. Al ampliar el texto al 200 % se permite el reflujo para no recortar las etiquetas.
- **Desplegable corregido:** la regla global de FAQ `details[open] summary>span` giraba el título y el contador; otra regla imponía 26 px al título. La guía ahora limita ambos estilos. Solo gira el signo `+`; texto y contador permanecen horizontales, y la explicación aparece inmediatamente debajo del resumen. Enter/Espacio abren y cierran también sin JavaScript.

## Capturas

- Tarjeta con acciones compactas: [320 px](capturas/card-320.png), [390 px](capturas/card-390.png), [escritorio](capturas/card-1440.png).
- Destacado durante la llegada: [móvil](capturas/destacado-390.png), [escritorio](capturas/destacado-1440.png).
- Desplegable abierto: [antes](antes-desplegable.png), [320 px corregido](capturas/pendientes-320.png), [390 px corregido](capturas/pendientes-390.png), [escritorio corregido](capturas/pendientes-1440.png).
- Página completa: [móvil](capturas/niveles-390-completa.png), [escritorio](capturas/niveles-1440-completa.png).

## Validación

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Correcto: seis fichas y bloque de viajes de la guía. [Log](build.log) |
| `npm test` | 5/5. [Log](test.log) |
| `npm run check` | Ocho páginas y fuentes generadas sincronizadas. [Log](check.log) |
| Navegador | 1.609 comprobaciones, cero incidencias y errores JS, 68 accesos WhatsApp interceptados localmente. [JSON](browser.json) |
| Revisión independiente | 63/63, sin hallazgos accionables; cero errores JS y cuatro accesos WhatsApp interceptados. [Informe](revision-independiente.md), [prueba](revision-browser.json), [hashes](revision-hashes.json) |
| `git diff --check` | Correcto |
| Preservación | Todos los archivos protegidos coinciden con la versión previa. [Hashes](preservation.json) |

La matriz cubre 320, 390, 768, 1024 y 1440 px; alturas reducidas; texto al 200 %; teclado, anclas, foco, filtros, historial/recarga, clic con modificador, navegación home y seis fichas, mensajes WhatsApp y lectura sin JS. Comprueba por geometría la misma fila de botones y el texto del desplegable, y espera a la expiración del destacado. Añade scroll suave y activación repetida con teclado en móvil y escritorio. No se envían mensajes reales.

## Alcance y fuentes

Producto modificado en esta iteración: `dist/niveles/index.html`, `dist/levels.css`, `dist/levels.js`. También `scripts/check-levels.mjs`, README, propuesta e inventario; evidencia nueva en este directorio. [Diff de esta iteración](diff-esta-revision.patch), [baseline](baseline.json), [versión final](version.json).

[Texto final](texto-final.txt). Las definiciones y explicaciones de niveles permanecen intactas; solo se acortan las etiquetas de las acciones de las tarjetas y se retira el rótulo de selección persistente. Se mantienen las fuentes documentadas en `levelsRevision20` del [inventario](../../content-inventory.json): definiciones de `dist/app.js`, las cuatro páginas originales de LST y `data/trips.json`. No se vuelven a investigar ni se modifican datos de viajes. Las fuentes antiguas siguen fuera de la interfaz.

Datos, marca, fotografía, fuentes, colores, archivos compartidos y seis fichas mantienen sus bytes. Consultar no confirma plaza. Se conserva noindex. Chromium local; no se han probado Safari, Firefox, lector de pantalla, teléfono físico o app nativa de WhatsApp. La matriz amplia anterior de home/fichas no se repite: sus archivos de producto no cambian y sus recorridos de integración se comprueban aquí.

La revisión independiente comprueba la misma versión final de producto identificada en los hashes. Su sonda registra inicio del destacado al llegar y duración aproximada de 1.100 ms, sin cambio de estado lógico al desaparecer. Se corrigió un falso positivo de la sonda que contaba eliminaciones de una clase ya ausente; la repetición pasó 63/63. Se revisaron visualmente la tarjeta móvil y el desplegable abierto.
