# Hallazgos de revisión independiente — navegación y conversión por nivel

Base Git 351576d508314ff4bdf2cb8421f600dcc0c8d3de. Candidata sin commit; hashes iniciales en initial-sha256.txt. Estos hallazgos se confirmaron con Chromium; salida en browser.json.

## P2 — Evitar dos selecciones visuales al cambiar el filtro

Ubicación: dist/levels.css:116–118; actualización asociada dist/levels.js:36–41.

Recorrido: cargar /niveles/#rookies, pulsar «Ver viajes para Rookies», elegir el filtro Riders y regresar visualmente a las tarjetas. El URL pasa a ?nivel=riders#viajes-por-nivel y .is-selected señala Riders, pero Chromium conserva Rookies como :target tras history.pushState. El selector CSS usa la unión de ambos, por lo que Rookies y Riders quedan resaltados como «Nivel que estás explorando». Al pulsar Todos sigue resaltado Rookies aunque ya no hay selección.

Evidencia: snapshots riders filter y all filter en browser.json, con selected/targets/visuallySelected, URL y contexto WhatsApp. Limitar el fallback :target al modo sin la mejora JS, o mantener explícitamente una única fuente de estado visual. No retirar el soporte de anclas sin JavaScript.

## P2 — No modificar la pestaña de origen con Ctrl/Cmd+click del índice

Ubicación: dist/levels.js:47–49.

Recorrido: cargar /niveles/#rookies y abrir Riders con Ctrl+click en otra pestaña. El manejador del índice ejecuta showLevel y flash en la pestaña original, que permanece en ?nivel=rookies#rookies pero cambia su filtro y WhatsApp a Riders. Las tarjetas Rookies y Riders quedan simultáneamente resaltadas.

Evidencia: snapshot after modified click en browser.json. Añadir al índice el mismo guard de botón/modificadores que ya existe en los CTAs data-guide-choice. La navegación nativa debe continuar sin alterar el contexto de la pestaña original.

## Comprobaciones adicionales

Sin errores JavaScript. Pasan generación --check, sintaxis, git diff --check, npm test 5/5 y npm run check. La prueba independiente reúne 26 comprobaciones: 23 pasan y tres mediciones fallan por los dos defectos anteriores. Pasan exclusión/inclusión de El Salvador según niveles declarados, selección restaurada con Back y recarga, movimiento reducido y cabeceras con Niveles visible sin desbordamiento a 320, 390, 768, 1024 y 1440 px en home, guía y Asturias.

Datos de viajes idénticos a la base: SHA-256 2c23bf58b7eb4a0576d30cd8eff38634fd2e66168831d25e13d512febb8aaed1. No se investigó información comercial ni se modificó implementación. Todo acceso externo del navegador se interceptó localmente.

Incertidumbre de alcance: la implementación no sigue la sección al desplazarse manualmente; se pidió al implementador aclarar si el usuario se refería al salto del índice o a scroll manual antes de calificarlo como incumplimiento.
