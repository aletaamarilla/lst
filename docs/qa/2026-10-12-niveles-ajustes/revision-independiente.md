# Revisión independiente final — ajustes de niveles

Base Git: 351576d508314ff4bdf2cb8421f600dcc0c8d3de. Candidata sin commit, identificada por final-sha256.txt. Referencia de continuidad: docs/qa/2026-10-12-niveles-ajustes/baseline.json y manifiesto de la revisión independiente anterior.

Resultado: sin hallazgos accionables ni bloqueos en el alcance revisado.

Se revisaron la nueva estructura HTML de tarjetas, jerarquía y selección visual, CSS, levels.js, generador del bloque de viajes y adaptación del comprobador de navegador. La información de nivel y los mensajes específicos de las cuatro tarjetas se conservan. WhatsApp permanece como enlace explícito y la ayuda final conserva el contexto del nivel elegido. La guía sigue orientando sin certificar ni confirmar una plaza.

Los viajes con fecha se mantienen fuera del desplegable. Los cuatro destinos pendientes conservan sus fichas en HTML y aparecen bajo un details nativo inicialmente cerrado. Los filtros operan sobre los niveles declarados y el estado de viaje; el contador y el resumen distinguen los viajes con fecha de los destinos pendientes. No se trasladan fechas ni servicios provisionales entre estados.

## Evidencia ejecutada por el revisor

- Chromium: 35/35 comprobaciones, cero errores JavaScript. Script y resultado en browser.cjs/browser.json.
- Desplegable cerrado al entrar; Enter abre y Espacio cierra; comportamiento nativo también sin JavaScript.
- Con Rookies, Asturias es el único viaje con fecha visible. Al abrir el desplegable hay cinco destinos disponibles; Riders conserva El Salvador.
- Selección única, limpieza con Todos, Ctrl+click sin alterar la pestaña original, contexto del enlace WhatsApp, Back y recarga. Las correcciones previas siguen vigentes.
- Movimiento reducido sin animación de destacado.
- Cabeceras sin desbordamiento a 320, 390, 768, 1024 y 1440 px en home, guía y Asturias.
- Supercracks seleccionado a 320 px con texto al 200 %: encabezado, número, título y botón dentro de la tarjeta, sin recorte horizontal. Captura propia en 320-text200-selected.png. El título se redistribuye en varias líneas.
- npm test: 5/5; npm run check: ocho páginas y ambos generadores correctos; git diff --check: correcto.

La matriz final del implementador fue inspeccionada: 1419 comprobaciones sin incidencias ni errores JS y 68 consultas interceptadas. Se distingue de las 35 comprobaciones independientes anteriores.

Los datos y recursos declarados en baseline.json mantienen su SHA-256. El manifiesto anterior confirma que home, fichas, scripts y estilos compartidos siguen idénticos; en el producto cambian exclusivamente HTML/CSS/JS de niveles y su generador. data/trips.json: 2c23bf58b7eb4a0576d30cd8eff38634fd2e66168831d25e13d512febb8aaed1.

Limitaciones: revisión de navegador en Chromium y dentro de los escenarios descritos; no es garantía absoluta ni prueba de otros motores. No se modificó implementación, investigaron viajes, publicaron cambios, hizo push ni contactó con WhatsApp. El navegador independiente quedó cerrado.
