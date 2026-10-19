# FAQs · Let’s Surf Together · 13/10/2026

Implementada `/preguntas-frecuentes/` con ocho preguntas existentes, cuatro temas, desplegables nativos y consulta final por WhatsApp. Sin JavaScript adicional, dependencias nuevas, publicación, despliegue, push ni commit. Se conserva `noindex,nofollow`.

## Entrega y fuentes

- [Las ocho preguntas y respuestas finales, fuentes por respuesta y selección de la home](texto-final.md).
- [Registro estructurado del contenido](texto-y-fuentes.json).
- [Página HTML](../../../dist/preguntas-frecuentes/index.html) y [estilos](../../../dist/faq.css).
- Fuentes locales leídas: README y documentación vigente, inventario, [home inicial](antes/dist/index.html), [datos iniciales de viajes](antes/data/trips.json) y [generador de fichas](antes/scripts/render-trips.mjs). El encargo exige preservar datos provisionales; no se investigaron condiciones comerciales externas.

La duda de llegada adapta las preguntas sobre vuelos de El Salvador y llegada a Asturias. Solo traslada la necesidad de consultar cada viaje; no convierte sus traslados o desplazamientos en regla universal. Las preguntas sobre habitaciones, inicio de surf en salidas concretas y próximas fechas permanecen en las fichas.

## Archivos e integración

| Archivo | Cambio de FAQs |
| --- | --- |
| `dist/preguntas-frecuentes/index.html` | Nueva página, ocho respuestas, cuatro anclas, metadatos, enlaces útiles, cierre de consulta. |
| `dist/faq.css` | Composición desde móvil, tipografías/tokens existentes, foco y espacio para el icono de apertura. |
| `dist/index.html` | Resumen de tres preguntas y enlace a todas, cabecera/pie y alternativa de navegación sin JavaScript. |
| `dist/niveles/index.html`, `dist/conocenos/index.html` | Cuatro destinos en la cabecera y enlaces secundarios en el pie; navegación alternativa nativa. |
| `dist/viajes/index.html` | Integración de esa misma navegación con el catálogo desarrollado simultáneamente. |
| `dist/mobile.css`, `dist/styles.css` | Foco actual del menú, navegación secundaria y fallback sin JavaScript que mantiene la cabecera en flujo y pegada arriba. |
| `scripts/render-trips.mjs` y seis HTML generados | Viajes lleva al catálogo; pie con FAQs y La experiencia. Sin alterar contenido específico, programa, datos o acciones comerciales. |
| `scripts/check.mjs` | Rutas, navegación de páginas nuevas, resumen de home y ausencia de JavaScript adicional en FAQs. Conserva las comprobaciones del catálogo concurrente. |
| `scripts/check-faqs.mjs` | Comprobaciones opcionales de navegador y capturas, usando el runtime externo existente. |
| `scripts/check-ux.mjs` | Actualiza el recorrido antiguo del menú Viajes para seguir la nueva ruta de catálogo. |
| README, propuesta e inventario | Estado actual, decisiones y fuentes. |

## Versión y coexistencia del trabajo

Repositorio `aletaamarilla/lst`, rama `main`, HEAD `351576d508314ff4bdf2cb8421f600dcc0c8d3de`. Había cambios previos sin commit de Niveles, Conócenos, home y fichas: [estado inicial](estado-inicial.txt). [Versión y hashes finales](version.json) identifica la candidata local; [comparación desde la base](cambios-conjuntos-desde-base.diff) incluye también los cambios concurrentes del catálogo y se etiqueta como tal, no como diff exclusivo de FAQs.

El catálogo `/viajes/` apareció durante la implementación desde otro trabajo activo. Se retiró el índice sencillo temporal de esta tarea y se recuperó el HTML del catálogo de su propio script de creación, preservando sus filtros y generador. El `package.json` final conserva únicamente los generadores originales y `render-catalog.mjs`; no queda un generador de índice paralelo. Los filtros y enlaces desde Niveles al catálogo pertenecen al otro trabajo.

## Validación

| Criterio | Evidencia |
| --- | --- |
| Build, pruebas y chequeos del repositorio | [build.log](build.log), [test.log](test.log) (25/25), [check.log](check.log) (11 páginas): correctos en la candidata final. |
| FAQs con Enter/Espacio, varias abiertas y cierre independiente | [browser.json](browser.json): ejecución en Chromium con JavaScript, sin JavaScript y texto al 200 %. |
| Lectura y cabecera | 320, 390, 768, 1024 y 1440 px; 15 vistas de FAQs y pantallas adicionales de 500 px de alto. Sin desbordamiento, con títulos visibles al saltar por anclas. |
| Navegación y rutas | Home + `/viajes/`, `/niveles/`, `/conocenos/`, `/preguntas-frecuentes/` + seis fichas, en los cinco anchos. Logo a Inicio, enlaces del menú y entrada desde FAQs de home/pies. |
| WhatsApp | Aperturas interceptadas localmente; teléfono y mensaje contextual correctos. Ningún mensaje enviado; la consulta no confirma plaza. |
| Regresión complementaria de navegación y consulta | [regresion-ux.log](regresion-ux.log): 1171 comprobaciones correctas, 43 aperturas de WhatsApp interceptadas, sin incidencias ni errores JS. |
| Datos y recursos preservados | `version.json`: datos de viajes idénticos a la base, FAQs específicas idénticas y recursos de marca sin cambios. |
| Revisión independiente | [Informe](revision-independiente.md) y hashes de su candidata. Revisión de fuentes, compatibilidad, teclado, navegación y visual. |

La suite específica pasa **720 comprobaciones**; el número acompaña la evidencia de los comportamientos anteriores. No se presenta como prueba de ausencia absoluta de defectos.

Se corrigieron dos defectos reproducidos: el signo `+` girado desbordaba ligeramente al abrir las respuestas; la navegación nativa sin JavaScript de la home quedaba bajo la cabecera fija. Se añadió espacio al icono y se conserva la altura de la cabecera en flujo con `sticky` cuando aparece el fallback nativo. Las pruebas se repitieron sobre el resultado corregido.

## Capturas

| Vista | Móvil | Escritorio |
| --- | --- | --- |
| Apertura | [390 px](capturas/apertura-390.png) | [1440 px](capturas/apertura-1440.png) |
| Página completa | [390 px](capturas/faq-390.png) | [1440 px](capturas/faq-1440.png) |
| Varias respuestas abiertas | [390 px](capturas/respuestas-390.png) | [1440 px](capturas/respuestas-1440.png) |
| Sin JavaScript | [390 px](capturas/no-js-390.png) | [1440 px](capturas/no-js-1440.png) |
| Texto ampliado | [390 px](capturas/text200-390.png) | [1440 px](capturas/text200-1440.png) |

También: [menú móvil](capturas/menu-390.png), página completa a 320/768/1024 px y pantallas bajas. La revisión visual se hizo sobre las capturas móvil/escritorio, además de medir los elementos en navegador.

## Reproducir

Con `npm run dev` activo:

```sh
LD_LIBRARY_PATH=/tmp/lst-browser-libs/root/usr/lib/x86_64-linux-gnu \
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LST_QA_OUTPUT=docs/qa/2026-10-13-faqs \
node scripts/check-faqs.mjs
```

## Contenido pendiente y límites

- No hay políticas generales documentadas de cancelación, seguro, depósitos, condiciones de pago, edad o tiempos de respuesta. No se inventan ni se añaden preguntas para cubrirlas artificialmente.
- Material, traslados, alojamiento e inclusiones pendientes de cada salida deben completarse en sus fichas cuando LST los confirme. Los datos provisionales de esta fase se conservan.
- Sigue pendiente la confirmación del teléfono como receptor definitivo. Se utiliza el contacto ya existente, sin investigarlo ni sustituirlo.
- Validación local en Chromium, no en dispositivos físicos, Safari/Firefox ni lector de pantalla. Las capturas con texto al 200 % simulan ampliación tipográfica; no equivalen a todas las preferencias de navegador.
- La revisión no certifica un lanzamiento ni mide conversión. La protección `noindex,nofollow` sigue activa.
