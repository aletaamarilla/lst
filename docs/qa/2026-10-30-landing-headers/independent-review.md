# Revisión independiente · portadas y filtro de nivel

Sin hallazgos accionables ni bloqueos en el alcance revisado.

Base Git: 58f338661fc4705364fea08727c836e79b3f2048, con trabajo previo sin commit. Comparación de esta iteración: artifacts/landing-headers-before y task.diff. Revisados los 9 archivos de candidate.json, incluido el nuevo test de interfaz. La última regla de contraste móvil de levels.css también queda incluida; SHA-256 revisado: f09eebdf94db768058b8131df41933d993cc0c226c781c7cd3fce09cc51bfff5. El resto coincide con el manifiesto leído.

## Evidencia propia
- npm test: 190/190, sin fallos.
- npm run check: 40 páginas y generación estable, sin fallos.
- Bloque generado del catálogo idéntico byte a byte a la base de esta iteración: true.
- Revisión de catalog.js y consumidores: aplica solo nivel; ignora fecha antigua conservando nivel válido; los cambios eliminan fecha/estado y mantienen otros parámetros y hash. Popstate resincroniza selección y resultados. Limpiar desde vacío devuelve el foco al select visible.
- catalog-filter.js conserva la API de nivel/mes y sus pruebas de compatibilidad; no se altera la representación ni el dato de las salidas.
- No-JS mantiene controles ocultos y todos los viajes renderizados con enlaces nativos. Portadas usan el patrón landing compartido; navegación transparente al inicio y estados crema al desplazarse o abrir menú.
- En niveles, scroll-margin-top:0 evita sumar el margen landing a scroll-padding-top de la guía; se conserva el desplazamiento esperado por flash().

Revisadas las capturas finales niveles-390-opening.png y viajes-768-opening.png y las métricas de 320/390/768/1024/1440. La ejecución interactiva en navegador integrado la realiza el agente principal; esta revisión no abrió navegadores ni modificó implementación.
