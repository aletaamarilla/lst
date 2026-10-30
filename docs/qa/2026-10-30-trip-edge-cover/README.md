# Portada a todo el ancho y hasta arriba · 30 octubre 2026

Petición: eliminar los márgenes de la foto y llevarla al borde superior. Se conserva la preferencia anterior por una altura contenida.

Cambio acotado a `dist/trip-conversion.css`. Sin cambios de plantilla, datos, JavaScript o formularios. Base Git `58f338661fc4705364fea08727c836e79b3f2048` con trabajo previo sin commit; `before/` y `before.sha256` identifican la base real de esta iteración. `style.diff` y `candidate.sha256` delimitan la versión final.

- Foto sin márgenes, ancho máximo ni esquinas redondeadas; comienza en x=0, y=0.
- Cabecera transparente con logo y texto claros sobre degradado al inicio; vuelve a crema y texto negro al desplazarse o abrir el menú. Las páginas sin foto mantienen cabecera crema y separación suficiente.
- Escritorio: altura limitada entre 380 y 560 px, recorte centrado al 55 % para mantener visible al grupo de Marruecos. Para llenar el ancho conservando altura contenida, se recorta parte del cielo y de los escalones; no se afirma que la foto completa permanezca visible en escritorio.
- Móvil: ancho completo y proporción original de la primera foto, con altura máxima de 360 px.

## Validación de esta versión

- `npm run check`: PASS, 40 páginas (`check.log`).
- Navegador real, Marruecos a 1440×1000: marco x=0/y=0, 1425×540 px, igual al ancho disponible del documento; sin desbordamiento. Grupo visible y ficha inicial inmediatamente después.
- Navegador real, 390×844: marco x=0/y=0, 375×250 px, igual al ancho disponible; sin desbordamiento, encuadre completo de la primera foto. Menú abierto: fondo crema y logo/texto negros legibles. Menú cerrado vuelve al tratamiento sobre foto.
- Tras navegar a inclusiones en escritorio: cabecera `is-scrolled`, fondo rgb(255,250,231), texto rgb(27,27,27); menú cerrado.
- Revisión explícita del diff de estilos por el implementador. Al ser un ajuste de presentación acotado no se encargó otra revisión independiente ni se añadieron pruebas que replicasen CSS. Las 175 pruebas de la iteración anterior son evidencia previa; no se presentan como ejecutadas de nuevo aquí.

Capturas observadas en la herramienta durante la comprobación; no se exportaron archivos de captura. Vista previa local en `http://localhost:40091/viajes/marruecos/`. Sin publicar.
