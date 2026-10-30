# Revisión independiente · profundidad visual y señal de reserva · 28/10/2026

> Este informe corresponde a la auditoría completa anterior a la última compactación del sidebar. La versión final actual está cubierta por [la revisión incremental](independent-review-incremental.md), con diff exacto y hashes finales verificados.

Base Git `58f338661fc4705364fea08727c836e79b3f2048` con árbol previo amplio sin commit conservado. Esta revisión corresponde a `trip-depth/before/` y `task-source-diff.patch`, no a la iteración anterior de `trip-refinement`. Los **21 archivos** revisados figuran en `independent-candidate-before-compact-sha256.json` y coinciden con el manifest final del repositorio: renderer, CSS, comprobador, pruebas, PNG y 15 rutas HTML.

## Resultado final

Sin hallazgos bloqueantes pendientes dentro del alcance comprobado. La ficha lateral elimina el explorador y presenta precio total, fechas, nivel y señal de reserva sin añadir un pago online. Las superficies de tarjetas usan tonos cálidos; los CTA conservan los colores de marca. El bloque de Lucas incorpora el recurso provisional sin reemplazar equipos editoriales ajenos.

## Hallazgos detectados y resueltos

1. **Lenguaje de reserva en programas o fechas pendientes.** La candidata inicial mostraba «Reserva con» en selector y alternativa sin JavaScript aunque no hubiese inscripción. La reproducción propia final confirma que tanto el viaje pendiente como la fecha pendiente de un viaje mixto muestran información de señal prevista, y solo las fechas confirmadas abiertas usan la invitación a reservar.
2. **Señal global no propagada a fechas antiguas.** Con señal general de 320 € y `departure.payment === undefined`, la primera versión anunciaba 320 € en la ficha pero omitía importe y condiciones en las fechas. El helper compartido final aplica ese respaldo también al selector y al HTML sin JavaScript. La reproducción propia verifica el importe y el texto de condiciones en ambos. `null` y objetos de pago vacíos siguen sin heredar un importe arbitrario.
3. **Autoridad del equipo editorial.** Una mención negativa de Lucas en el texto de un equipo titulado «Marta va contigo» activaba el retrato. La versión final lo limita al bloque por defecto o al título explícito «Lucas va contigo[.]». El caso propio de Marta con «Lucas no viajará con este grupo» ya no inserta la imagen. Los destinos pendientes tampoco la muestran.
4. **Contraste del texto secundario sobre tarjetas cálidas.** El texto inicial `#686256` sobre `#edcfb3` daba 4,086:1. El tono final `#62533f` alcanza **5.012:1** en esa superficie y supera 5,38:1 en el extremo oscuro del bloque de niveles. Cálculo propio y comparación en `independent-contrast*.json`.

Los escenarios iniciales y finales están guardados en `independent-cases-initial.json` y `independent-cases.json`. El script propio reproducible es `independent-cases.mjs`.

## Evidencia propia sobre la candidata final

- **143/143 pruebas correctas**: `independent-tests.txt`, ejecutadas directamente con Node.js 24.22.1 en la copia local estable `trip-review-depth`.
- **40 páginas correctas**: `independent-check.txt`; salida generada, enlaces, anclas, recursos, consultas contextuales, fechas, inclusiones y sintaxis. Los hashes de la copia y del repositorio corresponden al mismo manifest final.
- `independent-compatibility.mjs` / `.json`, ejecutados también en el repositorio WSL: **14 comparaciones** de la base frente a la final, siete viajes publicados y siete de previsualización local. Todos los enlaces restantes conservan su destino tras excluir el explorador retirado; se conservan incluidos, excluidos y condiciones generales de pago.
- **9 archivos protegidos idénticos**: catálogo publicado, promociones privadas locales, modelo, adaptador Sanity, agrupación, Brevo, JS de viaje y estilos compartidos. La señal publicada de Marruecos sigue siendo **270 €**; la de Maldivas **500 €**, común a sus dos salidas.
- Inspección del PNG provisional y de su integración: alt y leyenda declaran IA/provisional; el recurso no se presenta como una fotografía real verificada de Lucas.
- Versión principal: renderer `f171783d8cb4144efb14edb07acbaa89e76488733319a97734e1f3b417eaf818`; CSS `3c8561727fa1b358f29f6b3517e3aff5dd3fe77aa51263c69eb65e8a89ff31df`.

## Límites

No realicé QA independiente de navegador; la geometría responsive y la evaluación visual de la composición completa pertenecen a las comprobaciones del implementador. La revisión propia cubre código, consumidores, estados de reserva, fuente de los importes, autoridad editorial, artefacto de imagen y contraste de las superficies indicadas. No envié mensajes, formularios ni pagos; no modifiqué implementación ni datos CMS y no ejecuté despliegue. La conclusión solo se aplica a los hashes finales identificados.
