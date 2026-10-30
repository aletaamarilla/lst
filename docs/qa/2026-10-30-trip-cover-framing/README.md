# Portada: altura, encuadre y resolución · 30 octubre 2026

Petición: aumentar un poco la altura de la foto, evitar que las personas queden fuera y revisar la poca nitidez; el cliente autoriza replantear el componente. Se mantiene una galería de ancho completo y una altura contenida.

Base Git `58f338661fc4705364fea08727c836e79b3f2048`, con amplio trabajo anterior sin commit. La base real de esta tarea está en `before/`; `template.diff`, `style.diff`, `carousel.diff` y `candidate.sha256` identifican el alcance y la versión revisada.

## Resultado

- Portada de 600 px a 1440×1000, frente a los 540 px anteriores. A 390×844 mide 288,6 px, frente a unos 250 px anteriores. Barra de controles aparte: 60 px en escritorio y 52 px en móvil.
- Un marco por pantalla, de ancho completo, con la imagen principal centrada y `contain`. Las fotos conservan su encuadre y proporción, incluidas las verticales. Una copia tenue y desenfocada rellena el fondo sin afectar la nitidez de la foto principal. Es decorativa, tiene alt vacío/aria-hidden, carga diferida y prioridad baja, y reutiliza exactamente las mismas variantes de imagen. No hay avances de vecinas ni espaciadores en la versión final.
- Controles fuera de la imagen, flechas de 44×44 px y contador. El botón de ampliar cada foto conserva su índice en la galería. Selección conservada al cambiar el tamaño. Precarga acotada a foto elegida y vecinas; las demás siguen con carga diferida. Los carruseles de alojamiento conservan su alineación y comportamiento anteriores.
- Antes, todas las portadas pedían 1600 px. Ahora se ofrecen variantes adaptativas hasta 3840 px o el ancho original, si es menor, con calidad mínima 85 y formato automático. Se conserva una calidad explícita superior. Se evitan parámetros de anchura duplicados y se mantienen los parámetros editoriales del origen. Fotos locales/externas sin CDN conservan su URL. Solo la primera foto tiene prioridad alta.
- Dimensiones intrínsecas y proporciones obtenidas del nombre del asset. Franja superior más oscura bajo el menú para mejorar la lectura sobre fotos claras; se mantiene transparente sobre foto y crema al desplazarse/abrir menú.

Cambios: `scripts/render-trips.mjs`, `dist/trip-conversion.css`, `dist/trip.js`, nuevos `scripts/trip-cover-images.test.mjs` y `scripts/trip-carousel.test.mjs`; 30 páginas regeneradas desde el catálogo público. Sin cambios en CMS, archivos fotográficos, precios o datos comerciales; sin cambios intencionales en formularios.

## Validación

- Base: 178/178 pruebas (`baseline-tests.log`).
- Candidato final: 188/188 (`tests.log`), incluidos casos de imágenes adaptativas, preservación de parámetros, carga, secuencias con retratos, foco, resize y compatibilidad del alojamiento.
- `render.log`: 30 páginas desde `sanity-published`; sin lectura/escritura del CMS.
- `check.log`: PASS de 40 páginas, rutas, anclas, recursos, catálogo, datos opcionales, fechas, JavaScript y noindex. Repetido tras el último ajuste de contraste.
- Revisión independiente en `independent-review.md`. Encontró un P2 en una versión intermedia de marcos variables: dos retratos finales de Senegal se saltaban y el retroceso quedaba bloqueado. La versión final elimina esa causa con marcos uniformes de ancho completo y alineación izquierda original. En QA real apareció además un salto de selección al redimensionar durante una transición: se reprodujo antes de corregirlo (`resize-before-fix.log`, una prueba falla) y se protege el índice antes de interpretar offsets nuevos. Se contrastaron ambas resoluciones en pruebas y navegador. La revisión visual es del implementador: el revisor no dispuso de navegador.

## Comprobaciones reales en navegador

| Vista/recorrido | Evidencia |
| --- | --- |
| El Palmar, escritorio | Marco de ancho igual al viewport; principal con `contain`, fondo de opacidad 0,22. Ambas imágenes usan la misma variante actual; sin desbordamiento. A 1440×1000 la portada mide 600 px y el contenido fotográfico 3:2 cabe en 900×600. Las variantes se seleccionan según pantalla (sesión DPR1). |
| Senegal 1440×1000 | Recorrido final observado 02→03→04→05→06→05→04→03→02→01, sin saltos ni bloqueo. Cada marco ocupa el ancho completo; las fotos verticales mantienen el encuadre mediante `contain`. |
| Senegal 390×844 y 320×740 | Se elige 02 y se redimensiona durante la transición: conserva 02 en ambas anchuras; sin desbordamiento. Flechas de 44×44 px y botón de galería de 44 px de alto. Ampliar la foto 02 abre modal 2/6 y al cerrar mantiene 02/06. |
| Fuerteventura 320×740 | Imagen única cargada con variante de 640 px y calidad 85, encuadre completo. Contador 01/01, sin flechas redundantes. Ampliación abre modal 1/1 y cierra correctamente; sin desbordamiento. |
| Marruecos: alojamiento | Desplazamiento de 0 a 551 px con «Alojamiento: siguiente», conservando el comportamiento de su carrusel. |

Las imágenes frías pueden tardar en cargar según el CDN/conexión; se comprobó la carga efectiva de los encuadres observados. Capturas vistas en la herramienta, sin exportación a archivo. Las variantes para pantallas de mayor densidad se verificaron por código/pruebas; la sesión visual usó DPR1.

Límite material: la fuente de algunas fotos del dossier ya es pequeña (por ejemplo Fuerteventura, 1322×1044; una foto de Senegal, 900×500). El componente respeta sus límites; no puede recuperar detalle inexistente. No se identifica qué cara es el cliente: se conserva el encuadre publicado de las fotos. Sin pruebas con usuarios ni despliegue. Vista previa local: `http://localhost:40091/viajes/el-palmar/`.
