# Revisión independiente final — guía, navegación y conversión por nivel

Base Git: 351576d508314ff4bdf2cb8421f600dcc0c8d3de. Candidata sin commit. La comparación de continuidad usa docs/qa/2026-10-12-niveles-conversion/baseline.json; los hashes finales exactos están en final-sha256.txt.

## Resultado

Los dos hallazgos P2 de la revisión inicial están corregidos y verificados sobre la candidata final. No quedan hallazgos accionables en el alcance comprobado.

- Selección visual duplicada: .guide-enhanced limita el fallback :target al modo sin JavaScript. Tras Rookies → Ver viajes → Riders solo Riders queda destacado; Todos limpia el destacado. Verificación mediante estilos computados, además de clases y URL.
- Ctrl/Cmd+click del índice: el manejador respeta botón y modificadores. Un Ctrl+click real de Playwright abre otra pestaña sin cambiar la URL, selección, filtro ni mensaje contextual de la original. La pestaña se cerró después de inspeccionarla.

Evidencia anterior de los defectos: findings.md y browser-before.json. Evidencia final: browser.cjs y browser.json; 28 comprobaciones correctas, cero errores JavaScript.

## Alcance de validación independiente

- Filtrado por niveles declarados: Rookies excluye El Salvador; Riders lo incluye. No se deduce ni certifica un nivel a partir del comportamiento del visitante.
- Deep links, query de nivel, cambio de filtros, restauración con Back y recarga, foco del CTA de viajes y limpieza de selección.
- Preferencia de movimiento reducido sin animación de destacado.
- Niveles visible en cabeceras de home, guía y Asturias sin desbordamiento a 320, 390, 768, 1024 y 1440 px. Las seis fichas comparten la misma plantilla revisada.
- Sin JavaScript se conserva el destacado nativo del ancla y los seis destinos son legibles.
- npm test: 5/5. npm run check: ocho páginas, ambos generadores al día, sintaxis de JavaScript y validaciones anteriores conservadas. git diff --check: correcto.
- Datos de viaje idénticos a la base: SHA-256 2c23bf58b7eb4a0576d30cd8eff38634fd2e66168831d25e13d512febb8aaed1. El generador nuevo reutiliza levelsFor/tripFacts y conserva la autonomía de El Salvador y los estados pendientes.

Se aclaró el requisito de destacado con el implementador: responde a la elección/salto del visitante, no a scrollspy automático. No se considera pendiente la actualización del nivel al leer mediante desplazamiento manual.

La matriz extensa del implementador se está repitiendo por dos problemas de su comprobador: carga incompleta de fotografías lazy al saltar secciones y simulación de Ctrl+click mediante dispatchEvent. Su resultado final no se presupone en esta revisión. La repetición independiente usa un click real y ha terminado correctamente.

Limitaciones: comprobación de navegador en Chromium. Los anchos de cabecera aquí se comprobaron con tamaño de texto normal; las comprobaciones ampliadas del implementador deben informarse por separado. Sin cambios de implementación por parte del revisor, investigación comercial, publicación, push ni contactos reales. Todo acceso externo del navegador se interceptó localmente y la instancia quedó cerrada.
