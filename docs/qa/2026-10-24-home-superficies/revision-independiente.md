# Revisión independiente — superficies de la home LST

Revisión de solo lectura del producto. No he editado HTML, CSS ni pruebas del repositorio. Comparación con la base exacta de `before/`, no con el HEAD limpio: el repositorio ya contenía trabajo local. HEAD informado: `58f338661fc4705364fea08727c836e79b3f2048`. La aprobación se limita a los tres archivos y hashes de `candidate.sha256.json`, confirmados por cálculo propio:

- HTML: `6a115ac634973efb8a13d9a0f0a0c7bce2b131a923b586bbd18aef8d4ed32a2f`
- CSS: `da128cdf2f90589f94daad1bf5c32283332ef29511d6c8d5bab82a932abcf700`
- Prueba de navegador: `535a4d253a22dab726fc14678a14a044306d371adf3790a6ba8f532794f041bb`

## Conclusión

Sin bloqueos pendientes dentro del alcance comprobado. La separación solicitada se percibe en las capturas de escritorio y móvil: destinos conserva crema; niveles recibe una superficie cálida; las tarjetas mantienen crema; opiniones conserva crema; FAQ repite el cálido; reserva vuelve a crema. Las cards de viajes son blancas con borde y sombra ligera. El naranja y la tinta principales conservan sus valores y funciones.

El cálido #FBDDC7 corresponde al redondeo de 18% naranja y 82% crema. Es una derivación coherente de la identidad, no una prueba de que el cliente prefiera ese matiz. La separación entre blanco y crema es deliberadamente sutil (1,05:1): en las cards el borde y la sombra hacen gran parte del trabajo. No se requiere una razón 3:1 entre estos fondos decorativos; encabezados, geometría y contenido también distinguen los bloques.

## Hallazgos contrastados y resueltos

1. **Foco en fondo nuevo** (CSS líneas 358–359). El naranja heredado bajaba de 3,36:1 sobre crema a 2,72:1 sobre cálido. La candidata final aplica tinta a los controles de niveles y FAQ. En prueba propia con modalidad de teclado, todos los controles visibles —incluidos enlaces de respuestas FAQ abiertas— tienen foco activo, `:focus-visible` y contorno tinta de 3px. Contraste del foco nuevo: 13,34:1. Texto secundario sobre cálido: 6,17:1.
2. **Fragmentos huérfanos en niveles.** La base exacta ya mostraba «Aprendice/s» y «Supercrac/ks» a 390px. Medí el mismo ancho (132px) y fuente (Aura 32px) antes/después; a 320px, ancho 109px y fuente 29px. Los dos `<wbr>` finales ofrecen cortes «Apren/dices» y «Super/cracks» sin cambiar tamaños ni columnas. A 1440px se muestran completos. Evidencia: `browser-independiente.json`, `title-measures.json`, `final-independiente.json`.

## Preservación y evidencia

El HTML final es idéntico a la base al retirar únicamente los dos `<wbr>`. Por ello se conservan contenido textual, enlaces, orden, datos, foto completa del hero, titular blanco, marcadores del renderer y anclas. El diff CSS no modifica reglas del hero, tipografías, interiores de niveles ni botón fino «Ver viaje». No incorpora scripts, analítica ni dependencias.

Ejecuté revisión de navegador propia en Chromium a 320, 390 y 1440px, normal y con tamaños de texto duplicados: sin desbordamiento horizontal; foco validado en los seis escenarios. Revisé visualmente capturas completas 1440/390 y detalle de niveles. Inspeccioné la suite ampliada; su evidencia final registra 161 comprobaciones sin errores. El check local de 19 páginas aportado por implementación no lo repetí.

## Límites

Con texto al 200%, las dos columnas estrechas siguen fragmentando algunos nombres por caracteres, sin recorte ni pérdida de contenido; es un límite de presentación que no debe confundirse con una validación tipográfica perfecta. No probé dispositivos físicos ni Safari/iOS. No se ha publicado ni medido ventas: el criterio UX sobre diferenciación visual no demuestra un aumento de reservas.
