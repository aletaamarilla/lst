# Revisión independiente · cuerpo del detalle de viaje

Revisión de distribución y compatibilidad del diseño, sin editar implementación. Base Git58f3386; base exacta en docs/qa/2026-10-25-trip-rebel/before. El usuario exige mantener la portada y cambiar el cuerpo, con menos prosa, lectura visual y tono más descarado.

El diseño revisado mejora la jerarquía: una entrada breve y tres datos, escenas con fotografía y servicios literales, nivel visible, inclusiones/exclusiones agrupadas, y programa/alojamiento/equipo accesibles con details nativo. Los precios/promociones, mensajes, niveles específicos, servicios, restricciones, PDFs y condiciones conservan su fuente. La portada se conserva literalmente; trip.css/trip.js conservan sus bytes.

## Hallazgos resueltos

1. La estadística de capacidad tomaba el valor general aunque las fechas lo sobrescribieran. Ahora resuelve todas las capacidades con departuresFor: solo anuncia una cifra cuando todas coinciden y están documentadas; usa Según la salida con diferencias o alguna ausencia. Casos6/12, ambas6 y desconocido comprobados.
2. Los tres pasos de reserva se forzaban en columnas estrechas a320 y partían palabras como disponibilidad/Formalizamos. Ahora son tres filas número+texto en móvil y columnas desde600. Captura final review-rebel-reserve-320.png inspeccionada sobre la candidata conjunta: sin particiones.

La primera prueba nueva exigía Fiesta temática como destacado, aunque la selección mostraba Surfskate y Barbacoa. No era un requisito funcional; se ajustó para comprobar que los destacados proceden del propio viaje. Los servicios completos siguen visibles en inclusiones.

## Verificación propia sobre la candidata final compartida


- 91/91 pruebas PASS.

- Comprobador del sitio público:38 páginas PASS.

- Comprobador de la preview:38 páginas PASS.

- Geometría propia repetida a320/390/768/1024/1440: ancho de documento igual al viewport y cero contenidos fuera del lienzo.

- Inspección de escritorio, escenas y cierre320 con fuentes locales y fotografías reales, cargadas antes de capturar. La convivencia visual de los botones de inscripción añadidos por otro trabajo se ha inspeccionado sin enviar datos.

El renderer final revisado tiene hash2977c6c8b76f4d3697dfde88a4cfd0a617606da4255be01a376a986556181f66; CSS finale609b147ccb1bf0e7ea2269506f83eaac8a78cc5eb861b5b920b4a6fb5f6b6e2. review-rebel-final.json contiene todos los hashes y evidencia geométrica.

## Concurrencia y alcance

Durante la revisión, otro trabajo añadió import de brevo.mjs, registrationLink e inscripciones a render-trips.mjs/check.mjs. La primera ejecución conjunta encontró tres colisiones en fixtures y páginas de inscripción todavía sin generar. Esa tarea adaptó los fixtures a fechas distintas y reconstruyó las páginas. La repetición independiente final da91/91 y38/38 páginas aprobadas en ambas salidas. El aviso transitorio queda resuelto; no es un bloqueo actual.

Esta revisión aprueba únicamente el alcance de presentación y su convivencia comprobada con esas adiciones. No constituye aprobación funcional del formulario, entregabilidad de Brevo, privacidad del registro ni envíos reales. No se ha enviado ningún mensaje ni formulario. La matriz integral del implementador conserva su evidencia separada y no se presenta como ejecución propia.

Sin bloqueos identificados en el alcance revisado. La revisión usa Chrome local, no Safari/iOS físico ni medición de conversión. Etiquetas auxiliares de9–10px podrían ampliarse como mejora opcional de legibilidad; no son un bloqueo de esta revisión.
