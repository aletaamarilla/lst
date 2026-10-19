# Conócenos · Let’s Surf Together · 13/10/2026

Implementada `/conocenos/` y validada localmente. Se conservan el stack estático, la identidad, la fotografía y los datos provisionales de viajes. Sin commit, push, publicación o despliegue.

Repositorio `aletaamarilla/lst`, rama `main`, HEAD `351576d508314ff4bdf2cb8421f600dcc0c8d3de`. Al empezar ya había mejoras sin commit de niveles, tarjetas de la home y fichas. Esta entrega se contrasta contra ese checkout, no contra una versión anterior que omita esas mejoras: [estado inicial](estado-inicial.txt), [hashes iniciales](base.json), [diff exclusivo de esta tarea](cambios-de-esta-tarea.diff) y [versión candidata](version.json). La revisión independiente identifica sus propios hashes de producto.

## Texto final y recorrido

[Texto completo de la página](texto-final.md), extraído del HTML final para que coincida con lo implementado. [Archivo de la página](../../../dist/conocenos/index.html).

1. **Gente, sal y ganas de repetir.** Presenta qué propone LST y cómo se comparte la experiencia, con una fotografía de comunidad en Laga.
2. **Todo empezó en Marruecos.** Relato del viaje de prueba que Lucas propuso a su comunidad, el año de preparación y el arranque a finales de 2024. Mantiene su firma: «Nos vemos en el pico».
3. **El baño es solo una parte.** Aprendizaje, convivencia y descubrimiento. La escena de surfskate en Cádiz y el atardecer de Marruecos tienen contexto histórico; no se convierten en inclusiones de una próxima salida.
4. **Organizamos. Y nos vamos contigo.** Acompañamiento respaldado por el cuestionario. Los equipos y programas concretos remiten a las fichas.
5. **El lugar también importa.** Respeto al océano, surfistas locales y costumbres, como actitud de marca.
6. **¿Compartimos el próximo baño?** Enlaces a viajes y a una consulta contextual de WhatsApp. La consulta no confirma plaza.

La home conserva su foto, un resumen de origen/presente y el bloque de respeto. Añade «Conócenos» como botón de ampliación; el relato completo y la firma pasan a la nueva página. El resto de la home —incluidas experiencia, reseñas y tarjetas revisadas— se conserva.

## Fuentes de las afirmaciones

| Afirmación o escena | Fuente leída | Alcance aplicado |
| --- | --- | --- |
| Viajes de surf, aprendizaje, aventura, comunidad y cultura local | Cuestionario local, p. 1, preguntas 1–3 | Propuesta de LST; sin prometer progreso, encaje o amistad garantizados. |
| Viajar por cuenta propia y compartir grupo | Cuestionario, p. 1, preguntas 2–3 | No exige acudir acompañado ni limita el viaje a un género o franja de edad. |
| Quienes organizan también acompañan | Cuestionario, p. 1, pregunta 4 | No atribuye a Lucas asistencia a todas las salidas ni anuncia asistencia ilimitada. |
| Voz cercana, directa, divertida y profesional; firma de Lucas | Cuestionario, p. 2, preguntas 6–9 | La frase de Lucas se conserva; el nuevo titular es redacción editorial, no testimonio. |
| Primer viaje de prueba a Marruecos, comunidad de Lucas, preparación y arranque | Cuestionario, p. 3, pregunta 14 | Cronología documental; sin inventar cargo actual, credenciales o cifras de trayectoria. |
| Orientación según el nivel del viaje | Cuestionario, p. 5, nota FAQ; recorrido revisado de la home | Se enlaza a `/niveles/` y al calendario existente. |
| Comidas, conversaciones y conocimiento del destino | [Sobre LST antiguo](https://www.letsurftogether.com/sobre-lst/), apartados de grupo y cultura local | Situaciones compartidas; servicios y actividades dependen del programa. No se trasladan talleres, guías o excursiones universales. |
| Respeto al océano, a los surfistas locales y sus costumbres | [Sobre LST antiguo](https://www.letsurftogether.com/sobre-lst/), apartados de respeto; inventario `responsibilityRevision16` | Principios de marca. No acredita ejecución de acciones ambientales. |
| Grupo de Laga, surfskate de Cádiz y recuerdo de Marruecos | Fotografías existentes y [registro de procedencia](../../asset-provenance.json), `aboutRevision26` | Escenas identificadas por lugar/año y archivo, sin identificar personas ni presentar fotos posteriores como imágenes del origen. |
| Foto de participantes en esterillas, Cádiz 2024 | JPG oficial `Cadiz_2024_178-scaled.jpg`, registro previo y comparación independiente | Coincide con `after-surf.webp`; no es un retrato del equipo. La comparación y los hashes figuran en [el registro del revisor](revision-independiente.json). |

El PDF se leyó de `/mnt/c/Users/Antonio Fernandez/Downloads/Cuestionario_Marca_Web_LST.pdf`; su huella está en `base.json`. No se copia al repositorio ni se publican datos legales personales. La web antigua se consultó el 13/10/2026: que un texto histórico siga accesible no confirma la vigencia de servicios o colaboraciones.

El [inventario de contenido](../../content-inventory.json), `aboutRevision26`, conserva estas decisiones y referencias. No se investigaron ni actualizaron condiciones comerciales de viajes.

## Integración y archivos

| Archivo | Cambio de esta entrega |
| --- | --- |
| `dist/conocenos/index.html` | Nueva página estática; un H1, secciones semánticas, metadatos, alt y pies documentales, navegación y CTA. |
| `dist/about.css` | Nueva composición desde móvil, con reglas acotadas a Conócenos. Imágenes completas, sin texto superpuesto. |
| `dist/index.html` | Resumen breve y accesos desde presentación, cabecera y pie. |
| `dist/niveles/index.html` | El enlace LST de la cabecera lleva ahora a Conócenos. |
| `scripts/render-trips.mjs` | Enlace en el acompañamiento de las seis fichas, incluido Marruecos, y en el pie. La referencia general a Sobre LST usa la ruta nueva. |
| `dist/viajes/{asturias,azores,cadiz,el-salvador,euskadi,marruecos}/index.html` | Salidas reconstruidas desde el generador. Textos de equipo y estados comerciales conservados. |
| `scripts/check.mjs` | Incluye la nueva ruta y protege su integración, contenido pendiente y navegación. |
| `scripts/check-about.mjs` | Comprobaciones opcionales en navegador siguiendo el runtime externo ya utilizado en el proyecto. |
| `README.md`, `docs/propuesta.md`, inventario y procedencia | Documentación de la ruta, decisiones y fuentes. |
| `docs/qa/2026-10-13-conocenos/` | Estado inicial, copia final, logs, medidas, capturas, revisión y versión. |

No cambian `data/trips.json`, `package.json`, scripts de interacción o las hojas compartidas. Los 32 archivos de recursos conservan sus bytes; lo verifica `version.json`. No hay nuevas dependencias, formularios, pagos ni mensajes enviados. Los enlaces a viajes apuntan a `/#viajes`, ya existente. No se crea una ruta genérica `/viajes/` ni se altera hosting, indexación o migración de URLs.

## Capturas

| Vista | Móvil | Escritorio |
| --- | --- | --- |
| Página completa | [390 px](capturas/conocenos-390.png) | [1440 px](capturas/conocenos-1440.png) |
| Apertura con cabecera | [390 px](capturas/apertura-390.png) | [1440 px](capturas/apertura-1440.png) |
| Presentación breve de la home | [390 px](capturas/home-resumen-390.png) | [1440 px](capturas/home-resumen-1440.png) |
| Texto al 200 % | [390 px](capturas/texto200-390.png) | [1440 px](capturas/texto200-1440.png) |
| Pantalla de 500 px de alto | [390 px](capturas/pantalla-baja-390.png) | [1440 px](capturas/pantalla-baja-1440.png) |

También se guardan páginas completas de 320, 768 y 1024 px, y las dos capturas del revisor independiente. Las capturas `inicial-*` son la primera pasada, anterior al ajuste editorial del pie de Marruecos; la entrega final es `conocenos-*`.

## Comprobaciones ejecutadas

| Criterio de aceptación | Evidencia y resultado |
| --- | --- |
| Construcción reproducible | [npm run build](build.log): reconstruye las seis fichas y los destinos de la guía; salida correcta. |
| Contratos estáticos y enlaces | [npm run check](check.log): nueve páginas correctas, rutas/anclas/recursos presentes, WhatsApp contextual, programas generados vigentes y noindex conservado. |
| Datos y consultas de viajes | [npm test](test.log): cinco pruebas del modelo de viajes, todas correctas. Datos y recursos comparados por hash con la base. |
| Lectura, cabecera y encuadres | [Medidas del navegador](browser.json): 15 combinaciones a 320/390/768/1024/1440 px, en lectura normal, texto al 200 % y sin JavaScript. Sin desbordamiento horizontal, errores de JS ni imágenes sin cargar. Todas las fotos mantienen su proporción completa. |
| Navegación y accesibilidad aplicable | [Prueba reproducible](../../../scripts/check-about.mjs): menú, cierre con Escape y retorno del foco, enlace de salto con teclado, anclas que despejan la cabecera, movimiento normal y reducido. Dos vistas adicionales de 500 px de altura. |
| Entradas y salidas de Conócenos | Home → Conócenos, Conócenos → calendario, menú → niveles y las seis fichas → acompañamiento comprobados en los cinco anchos. |
| WhatsApp inicia consultas | Aperturas interceptadas localmente en los cinco anchos; teléfono y mensaje contextual correctos. Ningún mensaje enviado. |
| Revisión visual | Inspección de página, apertura y resumen de home en móvil/escritorio; revisor independiente inspeccionó además 390 y 1440 px. |
| Contraste independiente | [Informe del revisor](revision-independiente.md): sin bloqueos detectados. Verificó código, fuentes, fotografía, datos y navegador; no editó la implementación. |

El navegador registra **220 comprobaciones correctas**, además de las verificaciones propias del revisor. El número complementa la evidencia de comportamiento; no sustituye la lectura de las fuentes o la inspección visual.

Reproducir el navegador con un servidor local activo:

```sh
LD_LIBRARY_PATH=/tmp/lst-browser-libs/root/usr/lib/x86_64-linux-gnu \
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LST_QA_OUTPUT=docs/qa/2026-10-13-conocenos \
node scripts/check-about.mjs
```

Se resolvieron dos problemas del comprobador durante su preparación: el patrón del 3 % coincidía con caracteres codificados de las URLs de WhatsApp, y el selector del botón dejaba de encontrarlo al cambiar de «Abrir menú» a «Cerrar menú». Se corrigieron las pruebas y se repitió la suite completa. No eran defectos de producto.

## Pendientes y límites

- Nombres, funciones actuales y salidas que acompaña cada integrante del equipo; rol actual de Lucas aparte de su papel documentado en el origen.
- Retratos identificados y permiso de uso. Las fotos de comunidad no sustituyen esa identificación.
- Acompañantes y programas de los cuatro destinos por anunciar. Se mantienen los escenarios provisionales autorizados, sin reinterpretarlos.
- **Recogidas de plásticos, Universal Plastic y 3 %:** sigue pendiente acreditar vigencia, alcance y ejecución. El inventario conserva los requisitos concretos de confirmación; ninguna de estas afirmaciones se publica en la interfaz.
- Confirmación del teléfono existente como receptor comercial definitivo.

La validación es local en Chromium, con varios anchos y ampliación de texto; no equivale a probar dispositivos físicos, Safari/Firefox o un lector de pantalla. Sin JavaScript se conserva el contenido y sus enlaces nativos; el menú desplegable compartido requiere JavaScript. Los enlaces de WhatsApp se interceptan: se valida su configuración, no una conversación real.

No se mide efecto sobre conversión ni se certifica un lanzamiento. Se conserva `noindex,nofollow` y el trabajo queda sin publicar, conforme al encargo.
