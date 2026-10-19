# Revisión independiente de FAQs

Revisor separado del implementador, con encargo de solo lectura sobre producto y contraste de fuentes, consumidores y comportamiento. Base: `351576d508314ff4bdf2cb8421f600dcc0c8d3de` más el checkout inicial preservado en `/tmp/lst-faq-baseline`.

Resultado: sin bloqueos pendientes dentro del alcance comprobado. [Informe original y hashes](revision-independiente.json).

- Contenido: las ocho respuestas se trazan a la home inicial y `data/trips.json`. No se detectan políticas, garantías ni condiciones comerciales nuevas. WhatsApp inicia una consulta.
- Conservación: datos de viajes y desplegables específicos de las seis fichas idénticos a la base. El catálogo se revisa como integración, no como autoría de FAQs.
- Navegador final: 300 comprobaciones correctas, once rutas y cinco anchos, con/sin JavaScript; 72 adicionales con texto al 200 %. Sin errores JavaScript. Enter/Espacio permiten abrir las ocho respuestas y mantenerlas abiertas.
- Hallazgo P2 resuelto: los enlaces alternativos de la home estaban tapados por la cabecera sin JavaScript. Se revalidó su acceso en los cinco anchos tras conservar la altura de la cabecera en flujo.
- Inspección visual: capturas [390 px](capturas/revision-390.png) y [1440 px](capturas/revision-1440.png).

El revisor ejecutó `npm test` (25/25) y `npm run check` antes de los últimos ajustes CSS. Sus pruebas de navegador y capturas sí corresponden a los hashes finales registrados. Los logs `build.log`, `test.log` y `check.log` de esta entrega son la ejecución posterior del implementador sobre la candidata final.

La entrega comprueba que todos los hashes de archivos registrados por el revisor siguen coincidiendo con los de la candidata final. No se probaron lectores de pantalla, dispositivos reales, Safari ni Firefox.
