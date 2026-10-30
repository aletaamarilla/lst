# Detalle de viaje: portada limpia, menú flotante y personalidad · 30/10/2026

Implementación y validación local terminadas; sin commit, push, despliegue o escritura en el CMS. Base Git `58f338661fc4705364fea08727c836e79b3f2048`, con trabajo previo conservado. `before/` contiene la versión exacta anterior de los ocho archivos existentes afectados. [candidate-hashes.json](candidate-hashes.json) identifica nueve archivos de fuente/pruebas, incluido el nuevo test de navegación, y treinta páginas generadas.

## Cambios solicitados

- Retirado completo el resumen superior de la captura: propuesta, datos, precio e inclusiones duplicados. Se mantienen el detalle comercial, la tarjeta lateral, la barra móvil, los PDF y las acciones de solicitud/consulta.
- Menú de secciones oculto inicialmente, con altura cero y sin fila reservada. Al superar la portada flota bajo la altura real de la cabecera. Identifica la sección activa, adapta su desplazamiento horizontal en móvil, respeta las anclas y se oculta al volver arriba o salir del contenido.
- Fondo principal blanco y bloques definidos con negro, verde profundo y naranja original de LST. Más contraste entre secciones y menos superficies pastel. Estructura, orden del contenido, fotografías, requisitos, tarifas y formularios conservados.

## Validación

- Base: **160 pruebas aprobadas** antes de editar.
- Final: **162 pruebas aprobadas, cero fallos**, [registro](tests.log). Dos regresiones nuevas ejecutan el controlador real con geometría determinista: aparición/ocultación y las cinco anclas con dimensiones normales y ampliadas.
- `node scripts/render-trip-pages.mjs`: treinta páginas desde `sanity-published`, sin cambios de catálogo o contenido del CMS.
- `node scripts/check.mjs`: **PASS, cuarenta páginas**, [registro](check.log).
- [Revisión independiente](independent-review.md): contratos de reserva/Brevo y datos conservados; hallazgos de indicador activo y foco contextual corregidos. El informe distingue su suite completa y las pruebas de navegación añadidas al final.

## Navegador real

- Doce combinaciones: Marruecos, Maldivas y Hossegor a 320×740, 390×844, 768×1024 y 1440×900. Sin desbordamiento; resumen ausente y menú oculto con altura cero en todas las aperturas.
- Los cinco enlaces de escritorio aterrizan bajo la navegación y marcan la sección correcta. En la vista comprobada: título a 190 px, barra hasta 156 px. En móvil: Dudas a 180 px, barra hasta 146 px, enlace activo visible dentro del menú horizontal.
- Menú flotante oculto durante el menú general móvil y el diálogo de fechas. Escape restaura la barra, el foco y la posición de lectura. Ambas salidas de Maldivas conservan sus acciones de inscripción.
- Regreso al inicio y llegada al pie: barra oculta. En 320×568, título largo sin desbordamiento y navegación/barra de solicitud disponibles.
- Tabulación real sobre los enlaces de nivel y equipo: foco crema de 3 px visible sobre negro y verde profundo.
- Pares de texto medidos: secundario del nivel/negro 11,56:1; naranja/negro 4,90:1; texto del equipo/verde 7,74:1; información económica secundaria/negro 12,73:1. El texto del bloque naranja pasó de 4,09:1 a 4,90:1 al corregir su tinta. No constituye una auditoría completa de accesibilidad.

[Datos del navegador](browser/character-browser.json), [apertura](browser/caracter-apertura-desktop.png), [menú de escritorio](browser/caracter-menu-desktop.png), [bloque naranja](browser/caracter-actividades-desktop.png), [menú móvil](browser/caracter-menu-mobile.png).

La revisión visual y las interacciones se realizaron por el implementador; el revisor independiente contrastó fuente, contratos y regresiones de geometría. No se ha probado aquí el envío real a Brevo ni se han enviado mensajes. No se declara una comprobación completa del navegador con texto al 200 %; se verificaron dimensiones pequeñas y lógica con cabecera/barra ampliadas. La previsualización local mantiene las promociones privadas ya existentes; las páginas generadas utilizan el snapshot público.
