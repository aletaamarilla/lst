# Home: botones y fechas · 24/10/2026

Cambios sin commit sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. El repositorio ya contenía cambios de otras tareas; la base exacta de esta intervención está en before/. task.diff delimita exclusivamente esta tarea y candidate.sha256.json identifica los tres archivos finales.

## Resultado solicitado
- Cards de viajes: fechas sin separadores; se conserva el desplegable y su navegación.
- Próximos destinos: eliminado Ver todos junto al título.
- Niveles: acción principal oscura, flecha naranja y secundaria subrayada; respuesta visual al hover/foco y elevación de la card. Conservados los cuatro filtros /viajes/?nivel=1..4 y las cuatro anclas /niveles/.
- Historia: botón oscuro al final del texto, después de la firma, sobre el panel naranja.
- Eliminados Ver opiniones en LST, Hablar por WhatsApp de Reservas y Ver viajes dentro de la foto de portada.

## Validación local
- npm run check: PASS, 24 páginas y enlaces/recursos/sintaxis/salidas generadas.
- npm test: PASS, 66/66 pruebas.
- scripts/check-home-browser.mjs: PASS, 259 comprobaciones. 320, 390, 768, 1024 y 1440 px, texto al 200 %, hover/táctil/teclado, fechas largas y sin JavaScript. Evidencia y capturas en browser/.
- scripts/check-home-level-actions.mjs: PASS, 48/48 comprobaciones. Navegación de ambas acciones de los cuatro niveles, foco, superficies táctiles y texto ampliado. Hashes de archivos comprobados en levels/candidate.sha256.json.
- Inspección visual de levels/levels-390.png y browser/home-1440.png: sin recortes ni desbordamientos observados.
- git diff --check: PASS.

Chromium se ejecuta con LD_LIBRARY_PATH=/tmp/lst-browser-libs/root/usr/lib/x86_64-linux-gnu, LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package y LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome.

Validación local; no se ha realizado despliegue.

## Revisión independiente final
Subagente revisor: sin hallazgos accionables. Contrastó las copias previas, los consumidores del catálogo y las anclas reales de niveles. Comprobó en Chromium el hover real (elevación de card, cambio de color y movimiento de flechas), reduced motion (transitionDuration=0s y animationName=none) y el botón historia a 320 px (236×64 px, dentro del viewport, sin overflow).
Versión revisada: index.html SHA256 6e45d8c06516fce649488edea697eed1bfbf1de0231fe2d240403dd59d174fa1; home.css SHA256 9e73306fdfdcaf06417d764b69eff7bc57ab700e89e81942ace0df87819726b3.
