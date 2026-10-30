# Home LST — recorrido de decisión, 24/10/2026

Candidata local sin commit ni publicación sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. before/ contiene la copia exacta previa a esta iteración; se preserva el trabajo anterior del árbol. Archivos modificados: dist/index.html, dist/home.css y scripts/check-home-browser.mjs. candidate.sha256.json identifica los SHA finales; task.patch acota el diff de esta tarea.

## Requisitos y criterio aplicado

El usuario pide más personalidad de marca y revisar la organización para favorecer la decisión de compra. Se conservan identidad original (#EA5934, #FFFAE7, #1B1B1B; Aura, Work Sans y Space Mono), titular blanco, diseño de niveles y fotografía. La exclusión de analítica se mantiene.

La meta de esta home es facilitar llegar a una ficha adecuada y consultar por WhatsApp. La plaza se confirma con el equipo; no hay checkout ni pago automático. Esa operación se conserva, según docs/guia-cliente.md.

Nuevo orden: portada → destinos → niveles → personas → opiniones → dudas → reserva → cierre. Adelantar niveles y compactar la prueba social es una decisión UX contrastada por un auditor aparte; no es evidencia de aumento de reservas.

## Criterios observables

- Destinos conserva fechas, precios, niveles, paneles y ocho rutas. Añade acceso visible a /viajes/ después de las tarjetas y ayuda hacia #niveles.
- Niveles y hero mantienen exactamente su HTML y reglas CSS. Las opiniones dejan de interrumpir la selección antes del encaje por nivel.
- Personas explica primero que los organizadores viajan con el grupo y que se puede preguntar quién irá y cómo se organizan las sesiones. El origen de Lucas queda abreviado, con enlace a la historia completa. No se asigna identidad a una cara de la foto provisional.
- Opiniones mantiene las dos citas literales, autores y fuente; reduce espacio y añade el símbolo naranja original como elemento decorativo accesible. #experiencia sigue existiendo para consumidores de otras páginas.
- Se retiran los lavados de naranja al 3,5/4,5 % de opiniones y FAQ. Paleta plana original, trazos y símbolo de marca; panel de personas naranja y único cierre tinta conservados. FAQ mantiene su panel propio y un trazo naranja antes de la reserva.
- El cierre va a /viajes/ para mostrar el catálogo completo; evita devolver al usuario a las mismas tres tarjetas. WhatsApp sigue siendo consulta, sin enviar mensajes automáticamente.
- El renderer, app.js, home.js, datos y las ocho fichas son idénticos; su compatibilidad se registra en el manifiesto y la revisión.

## Validación

- npm run check: 19 páginas PASS, check.txt.
- Verificación con renderHomeTrips y el snapshot publicado: regenera sin alterar la nueva home ni sus enlaces externos al bloque de tarjetas, render-smoke.txt.
- scripts/check-home-browser.mjs: 146 comprobaciones PASS en 320/390/768/1024/1440 px, texto 200%, hover/touch/teclado, Escape, fechas largas, precios pendientes, rutas y sin JavaScript. Valida además el orden, las nuevas salidas al catálogo, helper de nivel, símbolo original y superficies sin lavados.
- Revisión independiente: revision-independiente.md. Controles acotados a enlaces/consumidores, copia factual, bloques nuevos y reflow a 320/390/1440 px al 200%. No se repite raster del hero porque su implementación es idéntica.
- Capturas finales en browser/home-1440.png y browser/home-390.png.

No se repiten pruebas unitarias de datos ni un build conectado a Sanity: no cambian modelo, renderer ni pipeline. Sí se comprueba la integración del renderer sobre la home final y el snapshot real.

## Límites y continuidad

Validación local en Chromium, sin publicación, analítica ni garantía de conversión. No se prueba Safari/iOS físico. El retrato identificable y roles completos del equipo siguen pendientes; la foto de grupo es provisional por decisión anterior del usuario. Las opiniones son extractos cortos, una prueba social limitada. No se inventan reseñas, cifras, urgencia, condiciones ni prestaciones para rellenar esas carencias.
