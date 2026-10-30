# Cuerpo de ficha visual y con carácter · 25/10/2026

El usuario conserva la portada y rechaza la distribución anterior por exceso de texto, poca claridad visual y falta de carácter. Se ha rehecho el cuerpo de las seis fichas. Implementación y validación locales; sin commit, push ni publicación de web/CMS.

## Recorrido aplicado

1. Una idea breve de cada destino, sin repetir el texto largo del dossier. Duración, nivel y capacidad se leen como datos grandes.
2. Dos escenas con fotos reales del propio viaje y servicios literales: el agua y el plan al salir. Una franja naranja resume estancia y comidas.
3. Nivel y requisitos antes de decidir, con escala visual y diferencias por fecha visibles.
4. Inclusiones agrupadas por cama/mesa, surf/movimiento y otros planes; exclusiones en un bloque separado siempre visible.
5. Programa completo, alojamiento y equipo reunidos en un archivo nativo desplegable. El álbum y las preguntas siguen accesibles. No se elimina contenido comercial.
6. Cierre más directo, pasos en filas móviles y condiciones de pago disponibles sin repetirlas al principio. Se conservan precios, early bird, selector, PDFs y consultas por fecha.

El carácter viene de la jerarquía, fotografía, tipografía, contraste y frases breves: «La oficina puede esperar», «Al agua. Y al lío», «Cierra pestañas. Abre viaje». Se conservan marca, paleta, fuentes y datos; no se inventan servicios, equipos ni plazas restantes. Los casos sin imágenes usan gráficos decorativos, sin trasladar fotos de otros destinos.

## Evidencia observable

- La portada aprobada se conserva en la plantilla y coincide píxel a píxel con la captura previa de escritorio: comparación de los primeros714px, cero canales distintos. trip.css y trip.js mantienen sus hashes.
- El resumen visible de escritorio en El Palmar pasa de263 a43 palabras, una reducción del84%. El texto completo permanece disponible en el archivo; [medición y82 pruebas de presentación](browser/presentation-results.json).
- [91/91 pruebas PASS](tests-shared.txt). Ocho pruebas nuevas cubren servicios literales/procedencia, ausencia de datos, agrupación/escape, capacidades por fecha, restricciones, acceso a los detalles, programas distintos y conservación de portada.
- [667 comprobaciones de navegador PASS](browser/results.json), sin errores JS: seis destinos con/sin promociones,320–1440px, más escenarios con texto200% y sinJS. Las82 adicionales prueban los nuevos archivos nativos, condiciones, álbum, escenas/foco y carga de lectura.
- [38 páginas públicas](check-shared.txt) y [38 de preview](preview-check-shared.txt) comprobadas: recursos, enlaces, generación y estados comerciales. El número incluye las nuevas rutas de inscripción del trabajo concurrente.
- [Escritorio con fotos reales](browser/real-booking-1440.png), [móvil completo](browser/full-el-palmar-390.png), [Fuerteventura320](browser/full-fuerteventura-320.png). La matriz de layout usa una foto local aislada para no depender de red; las capturas real/full usan las imágenes CDN del destino, cargadas mediante scroll previo.
- [Revisión independiente](revision-independiente.md), [versión revisada](independent-review.json). Detectó capacidad variable por fecha y pasos demasiado estrechos a320: ambos corregidos y recomprobados. Sin bloqueos conocidos en la presentación revisada.

## Versión, concurrencia y límites

Base Git58f338661fc4705364fea08727c836e79b3f2048, árbol previamente modificado. [Base exacta](before/), [patch del diseño](task.patch) y [manifiesto final](version.json). Cambios propios: render-trips.mjs, trip-detail.css y dos archivos nuevos, trip-experience.mjs y trip-experience.test.mjs; catorce rutas de fichas regeneradas.

Durante la validación otro trabajo incorporó Brevo y enlaces de inscripción al mismo renderer, al constructor y al comprobador. Se conservaron. El patch del diseño excluye esas adiciones; el manifiesto identifica el archivo compartido final. Los tres fixtures ajustados para dar fechas distintas pertenecen a esa compatibilidad concurrente. Tras la reconstrucción, las pruebas y ambos comprobadores completos pasaron. La revisión verifica convivencia visual y enlaces, sin aprobar la integración funcional de Brevo ni enviar formularios.

La construcción usa los mismos documentos publicados retenidos, con equivalencia profunda frente al snapshot actual, y la preview aislada de promociones ya existente: [registro](build-retained.txt). No se afirma un refresco remoto nuevo de Sanity. Los borradores de promociones no se publican. La preview permanece en localhost4176.

Chrome local e IAB; sin Safari/iOS físico ni medición de conversión en producción. La legibilidad y el funcionamiento están comprobados dentro de estos escenarios; la preferencia estética se contrasta con la vista previa.
