# Revisión independiente incremental · sidebar compacto · 28/10/2026

Revisión de la última compactación visual respecto a la candidata completa previamente auditada, sin modificar implementación. Base Git `58f338661fc4705364fea08727c836e79b3f2048`. La versión final actual de **21 archivos** queda identificada en `independent-candidate-sha256.json`; la anterior permanece en `independent-candidate-before-compact-sha256.json`.

## Alcance exacto confirmado

Se reconstruyeron en memoria los tres archivos anteriores revirtiendo únicamente las ediciones visuales declaradas. Los SHA256 reconstruidos coinciden exactamente con los registrados en la revisión completa previa. El resultado reproducible figura en `independent-incremental-proof.json` y el diff exacto en `independent-incremental-diff.patch`:

- Renderer: el estado pasa junto al nombre dentro de `booking-card-top`; se acorta la ayuda de inscripción y las etiquetas del dossier/WhatsApp.
- CSS: una regla flex adaptable para esa cabecera y margen del estado a cero.
- Prueba: una expectativa del texto de ayuda.

No hay cambios adicionales en helpers, cálculo de señal, estados, programas o contratos de inscripción. «¿Dudas?» conserva en su nombre accesible el destino y el canal WhatsApp.

## Verificación propia final

- **11/11 pruebas focalizadas** correctas en WSL/Node22: `independent-incremental-tests.txt`.
- **40 páginas correctas**, incluida coherencia de HTML generado y enlaces/anclas/recursos: `independent-incremental-check.txt`.
- **15 rutas generadas** comprobadas contra ambas versiones: los hashes anteriores coinciden con el renderer anterior reconstruido y los actuales con el renderer/manifest final. Todo el HTML fuera del sidebar permanece idéntico; los destinos y atributos de acción, precio, fechas, señal y estado del sidebar se conservan. Evidencia: `independent-incremental-validation.json` y script `independent-incremental.mjs`.
- **9 archivos protegidos** continúan idénticos a la base de esta iteración.
- Fuente final: renderer `94e1c6023c60e822c25d71d3f27557e76ca0c89d98fd11a4a5d8ae9d781f0b79`; CSS `1cc298e526cfa255aea03089468497a99991ba0a036996bfac4493d72641f099`.

## Conclusión y límites

Sin hallazgos accionables pendientes en este diff incremental. La auditoría completa anterior y sus **143/143 pruebas** corresponden a la candidata previa; esta pasada aporta la prueba exacta del delta y las comprobaciones finales indicadas. No se ha repetido toda la auditoría de pagos ni realizado QA independiente de navegador. La medición de altura y la valoración visual de la composición corresponden al implementador.
