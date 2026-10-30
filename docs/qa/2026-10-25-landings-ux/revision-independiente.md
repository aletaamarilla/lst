# Revisión independiente · landings UX · 25/10/2026

Revisión de solo lectura del producto. Base exacta: before/. Versiones revisadas: los cinco archivos de producto y hashes registrados en independent-results.json para el barrido de 24 vistas, e independent-anchors-final.json para el último ajuste de anclas, sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048 con árbol previamente modificado. No se modificó ningún archivo de implementación durante esta revisión.

## Conclusión

Sin bloqueos observados en la candidata corregida dentro del alcance comprobado. Se revisaron código, contenido y capturas de móvil y escritorio, además de ejecutar 24 vistas independientes de Chromium: Conócenos y FAQs a 320/390/768/1440 px, normal, texto al 200% y sin JavaScript.

La propuesta aplica una composición reconocible de landing: la fotografía abre y sitúa la experiencia; el relato de Conócenos tiene pasos claros y las fotografías apoyan aprendizaje, grupo y descubrimiento. Las fuentes de marca se reservan a títulos relevantes, con textos de cuerpo y subtítulos legibles. En FAQs, la combinación de temas compactos, cuatro encabezados y filas desplegables permite explorar las ocho dudas sin recorrer grandes tarjetas de categoría. El índice lateral permanece disponible en escritorio y su versión móvil cabe en dos columnas.

La altura de Conócenos sigue siendo considerable en móvil por el relato y sus fotografías. No se observó un fallo funcional o de lectura derivado de esa longitud; la preferencia estética final corresponde al usuario.

## Hallazgos resueltos

1. [P2] Contraste de controles de cabecera sobre fotografía clara. La candidata inicial ofrecía aproximadamente 2,0–2,17:1 alrededor de «Ver viajes» en Conócenos móvil y 2,65–2,79:1 en FAQs. El velo localizado superior añadido en landing.css corrige la causa. Nueva captura independiente a 390 px: fondo RGB73,74,70 / RGB75,76,71 alrededor de controles, texto crema #FFFAE7, ratios aproximados 8,54:1 / 8,28:1. La captura independiente-header-390.png conserva la evidencia visual. El cálculo muestrea fondos próximos al texto; no es una auditoría de contraste de todos los píxeles de todas las fotografías.
2. [P2] Cabecera sinJS blanca/transparente sobre crema por especificidad del selector inicial. Las reglas iniciales excluyen ahora :has(.static-navigation). Verificación independiente: fondo rgb255,250,231, texto rgb27,27,27, logo blanco oculto y negro visible. La cabecera sticky permanece en top=0 tras scroll.

El implementador corrigió además el desborde del icono al abrir FAQs y la lectura de experiencias en tablet al ampliar texto. Las 24 vistas posteriores a esas correcciones no muestran desbordes de documento ni internos en main.

## Evidencia

- independent-results.json: 24 vistas; cero errores JavaScript y cero desbordes detectados. Las ocho respuestas FAQ se abren con Enter en todos los modos, también sinJS. Menú móvil y cierre con Escape comprobados conJS. Cabecera fixed en normal/texto200 y sticky sinJS, top=0 tras desplazamiento.
- Las ocho respuestas FAQ conservan exactamente el HTML details de la base: texto, enlaces y semántica nativa. No se introduce exclusión mutua de respuestas.
- La síntesis editorial de Conócenos conserva origen con Lucas, inicio a finales de 2024, apertura a quien viene por su cuenta, niveles/programas propios de cada salida, consulta del acompañamiento pendiente, respeto al destino y distinción entre consulta y confirmación de plaza. No se han observado nuevos servicios, garantías ni compromisos medioambientales concretos sin respaldo en la base.
- Los heroes usan cover por intención. Las imágenes documentales del cuerpo mantienen height:auto y su encuadre completo; las fotografías se presentan como recuerdos de viajes anteriores.

Límites: Chromium local, sin Safari/iOS físico, sin auditoría WCAG completa y sin validar publicación ni conversión comercial. El resultado visual es una valoración experta dentro de estas vistas, no una prueba de preferencia del usuario.

## Última comprobación de anclas

Tras el barrido anterior, el implementador corrigió el origen de la variable de altura de cabecera. La variable de home definida en body ocultaba el valor dinámico medido en root: a 320 px con texto al 200% la cabecera mide 107 px, pero el margen podía seguir calculándose con 78 px. landing.css resuelve ahora --landing-header-height en html y lo hereda al contenido. El padding de hero, el velo, el margen de anclas y el índice FAQ usan el valor resuelto; se mantiene independiente de min-height de la cabecera.

Comprobación independiente ejecutada sobre ese ajuste: ambas páginas a 320 px y texto al 200%. Los cuatro temas FAQ llegan a titleTop=127,125 px con headerBottom=107 px; las anclas origen, acompañamiento y respeto también quedan despejadas. --landing-header-height se resuelve a 107 px y document.scrollWidth es 320 px. independent-anchors-final.json registra las siete anclas y los hashes de esa versión final. Se revisó además la consolidación de CSS de bienvenida: elimina reglas sin consumidores y conserva la composición existente.

La normalización posterior de saltos de línea no cambia el contenido CSS/HTML revisado; los hashes finales de entrega deben consultarse en candidate.sha256.json. La validación completa posterior del implementador se registra por separado en los informes de ambas suites; no se presenta como ejecución independiente de esta revisión.
