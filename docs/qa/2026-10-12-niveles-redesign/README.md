# Guía de niveles · rediseño mobile first

Esta es la versión actual de `/niveles/`. Sustituye a la primera propuesta de la carpeta `2026-10-12-niveles`, cuya evidencia se mantiene como histórica. Cambios sin commit sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de`, repositorio `aletaamarilla/lst`. Sin push, publicación ni despliegue.

## Qué cambia

- Se eliminan los cuatro enlaces a las páginas antiguas y cualquier enlace externo de contenido. La explicación completa vive en la guía nueva; las fuentes se conservan solo en la documentación interna. WhatsApp sigue siendo el único destino externo.
- El acceso a los cuatro niveles aparece antes de la foto, dentro de la primera pantalla móvil. Conserva las anclas y permite ir directamente a cualquiera.
- Los niveles se presentan en fichas con tres claves consistentes: **En el agua**, **Tu surf** y **Tu siguiente paso**. Una columna en teléfono y dos en escritorio.
- Se reescriben las explicaciones y se aclara qué significa bombeo. Las situaciones describen la experiencia en el agua; no añaden requisitos ni una clasificación automática.
- Técnica y autonomía tienen una explicación diferenciada. La ayuda incluye un ejemplo concreto de cómo contar la propia experiencia al equipo.
- Se reutilizan `surf-session.webp` y `after-surf.webp` como fotografías documentales, sin asignar niveles, nombres ni roles a sus protagonistas. Se conservan logos, fuentes y colores.

[Texto final visible](texto-final.txt) · [Captura móvil completa](capturas/niveles-390-completa.png) · [Captura de escritorio completa](capturas/niveles-1440-completa.png).

## Capturas de lectura

- [Primera pantalla móvil](capturas/niveles-390-portada.png).
- [Ficha Rookies en móvil](capturas/rookies-390.png).
- [Orientación y WhatsApp en móvil](capturas/orientacion-390.png).
- [Primera pantalla de escritorio](capturas/niveles-1440-portada.png).

Las capturas finales esperan a la carga de las fotografías. Se inspeccionaron visualmente las dos páginas completas, las portadas y las secciones móviles enlazadas.

## Archivos y preservación

Esta iteración modifica `dist/niveles/index.html`, `dist/levels.css`, `scripts/check.mjs`, `scripts/check-levels.mjs`, `README.md`, `docs/propuesta.md` y `docs/content-inventory.json`; añade esta carpeta de evidencia.

La integración anterior se conserva: home, `dist/app.js`, generador y seis fichas mantienen exactamente sus hashes de la primera entrega. `data/trips.json` y los 32 recursos de marca conservan sus bytes. No se han investigado ni cambiado datos provisionales de viajes. [Comprobación de preservación](preservation.json).

[Versión y huellas actuales](version.json) · [HTML/CSS anteriores para comparar](antes/).

## Fuentes

Se mantienen las fuentes originales contrastadas durante la primera implementación, documentadas en `docs/content-inventory.json`, campos `levelsRevision20.sources` y `levelsRevision21`. No se vuelven a investigar viajes ni se toman condiciones nuevas de sus páginas públicas. Las páginas originales de niveles son documentación editorial interna, no destinos de navegación del visitante.

Rookies conserva las bases de remada y puesta en pie; Aprendices, pared, bombeo y primeros giros; Riders, autonomía y maniobras; Supercracks, fluidez y perfeccionamiento. Los objetivos avanzados siguen siendo objetivos, no condiciones obligatorias para apuntarse. La guía orienta y la valoración corresponde al equipo.

## Validación de esta versión

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Correcto. [Log](build.log) |
| `npm test` | 5/5. [Log](test.log) |
| `npm run check` | Ocho páginas; enlaces, anclas, recursos, JS y contratos existentes correctos. Nuevo bloqueo de enlaces externos de contenido en la guía. [Log](check.log) |
| `git diff --check` | Correcto |
| Matriz de guía e integración | 548 verificaciones, sin incidencias ni errores JS; 20 consultas WhatsApp interceptadas. [Informe](browser.json) |
| Revisión independiente | Sin hallazgos accionables. 22/22 verificaciones propias, sin errores JS. [Informe](revision-independiente.md), [navegador](revision-browser.json), [hashes](revision-hashes.txt) |

La matriz cubre 320, 390, 768, 1024 y 1440 px, dos pantallas bajas y texto al 200 %. Verifica anclas, foco, teclado, cabecera fija, ausencia de desbordamiento, numerales sin cortes, lectura sin JavaScript, mensajes, retorno al calendario, las cuatro pestañas de home y acceso desde las seis fichas. El revisor además comprobó desplazamiento suave y un ancho intermedio de 700 px. Ningún mensaje se envió.

La captura inicial intentó decodificar una foto antes de iniciar su carga diferida. Se corrigió la espera del comprobador para esperar la imagen cargada; las capturas de entrega fueron regeneradas. Los errores de pruebas intermedias no se presentan como fallos de producto resueltos.

Chromium local; sin comprobación en Safari, Firefox, lector de pantalla ni teléfono físico. El `check-ux.mjs` completo de la primera iteración no se ha repetido en esta: sus archivos de producto siguen idénticos y los recorridos de integración afectados sí se han vuelto a ejecutar. No se atribuye la revisión anterior al nuevo diseño.

## Reproducir navegador

Con `npm run dev` y la instalación existente:

```sh
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LD_LIBRARY_PATH=/tmp/top4982-browser/libs/usr/lib/x86_64-linux-gnu \
LST_QA_OUTPUT=/tmp/lst-levels-redesign \
node scripts/check-levels.mjs
```

No se añaden dependencias al proyecto.
