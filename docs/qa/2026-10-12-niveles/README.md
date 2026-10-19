# Entrega local · niveles de surf de LST

Implementada `/niveles/` sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de` de `aletaamarilla/lst`, rama `main`, con cambios sin commit. El checkout estaba limpio. No se ha hecho push, publicación ni despliegue, ni enviado mensajes. Se reutiliza el servidor local existente, sin modificar su configuración.

- [Abrir la guía local](http://localhost:4175/niveles/)
- [Texto final visible, extraído del main de la página](texto-final.txt)
- [Versión y SHA-256 de los archivos candidatos](version.json)
- [Diff de implementación y documentación fuente](implementation.diff)

## Página y criterios de aceptación

| Criterio | Implementación | Evidencia |
| --- | --- | --- |
| Orientar sin certificar | Introducción, cuatro bloques y aviso de valoración del equipo; sin test ni puntuaciones | Texto final, comprobador estático y contenido visible sin JS |
| Definiciones reconocibles | Conserva las cuatro definiciones de app.js, añade situaciones y objetivos contrastados | Fuentes detalladas abajo; revisión independiente |
| Técnica y autonomía | Sección propia; ejemplo II–III de El Salvador obtenido únicamente del JSON existente | Enlace a `/viajes/el-salvador/#nivel`; hash de datos preservado |
| Dudas entre dos niveles | Invita a describir olas, movimientos y ayuda necesaria; WhatsApp editable | Consulta contextual abierta por teclado e interceptada localmente |
| Navegación directa | Índice de cuatro anclas nativas, sin selección obligatoria | Anclas con foco y espacio bajo cabecera fija; enlace directo; prueba sin JS |
| Integración | Calendario y FAQ de home, cuatro pestañas y seis fichas enlazan a la guía; exploración vuelve a `/#viajes` | Recorridos en móvil/escritorio y validación de ocho rutas |
| Identidad y datos | Cabecera compartida, Aura, Work Sans, Space Mono, logos y fotografía existentes; colores originales | [Preservación de 33 archivos](preservation.json), inspección visual |
| Consulta comercial | WhatsApp como único canal; consulta no confirma plaza | Mensajes y teléfono comprobados, sin envío real |

## Fuentes y decisiones editoriales

Leídas antes de editar: README.md, docs/propuesta.md, docs/content-inventory.json, data/trips.json y las definiciones de dist/app.js. No existe AGENTS.md propio de LST en este checkout ni en sus directorios antecesores inspeccionados. Se respetan los acuerdos globales facilitados y el encargo específico de LST; las convenciones de stack de Travelhood no se trasladan a este proyecto independiente. Se aplicó Sites en modalidad local, conservando el sitio estático y sus herramientas.

| Fuente | Contenido usado |
| --- | --- |
| `dist/app.js` en la base Git | Nombres, orden y las cuatro descripciones; se conservan literalmente. Solo cambian sus URLs de detalle. |
| [Rookies · LST](https://www.letsurftogether.com/rookies/) | Remada, puesta en pie, espumas, pequeñas paredes, posición en la tabla y confianza. |
| [Aprendices · LST](https://www.letsurftogether.com/nivel-ii-aprendices/) | Pared, bombeo, giros básicos, postura, condiciones moderadas y trabajo de espaldas a la pared. HTTP directo permitió leerla tras el 429 inicial de la herramienta web. |
| [Riders · LST](https://www.letsurftogether.com/nivel-iii-rides/) | Lectura del mar, entrada/salida autónomas, postura sólida, giros y cambio de pesos. Se conserva Riders aunque la URL original use rides. |
| [Supercracks · LST](https://www.letsurftogether.com/nivel-iv-supercracks/) | Surf sólido, velocidad y fluidez, olas con fuerza, elección de secciones y perfeccionamiento de maniobras. Tubos y aéreos son objetivos, no requisitos de acceso. |
| `data/trips.json` | Ejemplo de El Salvador II–III con autonomía; no se investigan ni alteran viajes, fechas, precios, programas o plazas. |
| `docs/asset-provenance.json` | `group.webp`, imagen documental de Laga 2024, sin modificar bytes ni identificar personas. |

Las ampliaciones se contrastaron el 12/10/2026. La distinción técnica/autonomía y la orientación para describir condiciones y ayuda son síntesis editorial de las fuentes, no una escala técnica nueva. No se trasladan alturas de ola, tablas concretas, años de práctica, titulaciones ni afirmaciones absolutas de seguridad a requisitos de viaje. La guía no certifica el nivel ni reemplaza al equipo.

## Archivos de producto y comprobaciones

Nuevos:

- `dist/niveles/index.html`: página estática completa y texto final.
- `dist/levels.css`: composición móvil/escritorio; utiliza los tokens y cabecera existentes.
- `scripts/check-levels.mjs`: matriz de navegador de la guía e integración con las ocho rutas.

Modificados:

- `dist/index.html`: enlaces del calendario, resumen y FAQ de niveles. Conserva resumen y pestañas.
- `dist/app.js`: las cuatro URLs llevan al ancla correspondiente de la nueva guía; conserva definiciones y lógica compartida.
- `scripts/render-trips.mjs`: enlace de guía en la fuente de las fichas.
- `dist/viajes/{el-salvador,asturias,azores,euskadi,marruecos,cadiz}/index.html`: regenerados; se comprobó que el único cambio de cada uno es ese enlace.
- `scripts/check.mjs`: exige home, guía y rutas derivadas del JSON; mantiene todas las comprobaciones previas e incorpora contenido/navegación estática de la guía.
- `README.md`, `docs/propuesta.md`, `docs/content-inventory.json`: ruta, edición, fuentes, decisiones y validación actualizadas. Los informes históricos de siete páginas se conservan como evidencia histórica.
- `docs/qa/2026-10-12-niveles/`: entrega, texto, capturas, revisión, hashes y registros de esta tarea.

## Resultados ejecutados

| Comprobación | Resultado y alcance |
| --- | --- |
| `npm run build` | Correcto; seis fichas reconstruidas. [Log](build.log) |
| `npm test` | 5/5; niveles, fechas únicas/múltiples, mensajes, estados pendientes y demo. [Log](test.log) |
| `npm run check` | Correcto; ocho páginas, rutas, anclas, recursos, WhatsApp, estados y sintaxis. [Log](check.log) |
| `git diff --check` | Correcto, sin errores de whitespace. |
| `node scripts/check-levels.mjs` | 550 comprobaciones, 0 incidencias, 0 errores JS, 20 consultas interceptadas. [Informe](browser.json) |
| `node scripts/check-ux.mjs` | 1.225 comprobaciones, 0 incidencias, 0 errores JS, 43 consultas interceptadas. [Informe](regresion/verification.json) |
| Preservación | JSON de viajes y 32 recursos idénticos; seis fichas con cambios solo de enlace. [Hashes](preservation.json) |
| Revisión independiente | Sin hallazgos accionables de producto ni bloqueos. [Informe](revision-independiente.md), [hashes](revision-hashes.txt) |

La matriz de la guía incluye 320, 390, 768, 1024 y 1440 px, dos pantallas bajas (320×320 y 390×360) y texto al 200 % en los cinco anchos. Las pruebas de menú, teclado y consulta reaplican el escalado tras la navegación. El enlace directo y el retorno al calendario se prueban con tamaño normal y así se etiquetan. Se verifica también la lectura, anclas y acceso a consulta sin JavaScript, y el teclado de las pestañas conservadas en home.

El primer intento del comprobador UX agotó el tiempo esperando `.hero-primary`: [registro](regresion-primer-intento.log). Un diagnóstico aislado encontró el CTA y recibió HTTP 200. La repetición completa sin modificar producto pasó. No se atribuye una causa definitiva al timeout. El revisor completó un recorrido independiente a 320 px; encontró otro timeout de carga a 390 px y cerró su navegador. Su informe refleja ese límite. Después de su revisión se completó la matriz final de 550 comprobaciones, sin cambiar los archivos de producto revisados.

## Capturas revisadas

| Vista | Móvil | Escritorio |
| --- | --- | --- |
| Portada | [390 px](capturas/niveles-390-portada.png) | [1440 px](capturas/niveles-1440-portada.png) |
| Página completa | [390 px](capturas/niveles-390-completa.png) | [1440 px](capturas/niveles-1440-completa.png) |
| Rookies y jerarquía del nivel | [390 px](capturas/niveles-390-rookies.png) | [1440 px](capturas/niveles-1440-rookies.png) |
| Técnica y autonomía | [390 px](capturas/niveles-390-autonomia.png) | [1440 px](capturas/niveles-1440-autonomia.png) |
| Orientación y consulta | [390 px](capturas/niveles-390-orientacion.png) | [1440 px](capturas/niveles-1440-orientacion.png) |

[Menú móvil](capturas/menu-390.png) · [captura propia del revisor a 320 px](capturas/revision-320.png).

Inspección visual directa: portadas, páginas completas de móvil/escritorio y capturas de Rookies, autonomía y orientación. Las otras combinaciones se cubren por comprobaciones de geometría/interacción; no constituyen una revisión visual manual exhaustiva de todos los tamaños.

## Reproducción y límites

Con el servidor `npm run dev` en el puerto 4175, usar una instalación existente de Playwright. En esta máquina:

```sh
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LD_LIBRARY_PATH=/tmp/top4982-browser/libs/usr/lib/x86_64-linux-gnu \
LST_QA_OUTPUT=/tmp/lst-levels-verification \
node scripts/check-levels.mjs
```

Para regresión, sustituir el último script por `scripts/check-ux.mjs`. No hay nuevas dependencias del proyecto.

Validación local en Chromium, sin Safari, Firefox, dispositivo físico, lector de pantalla ni apertura en la app nativa de WhatsApp. Los enlaces externos de consulta se responden localmente durante las pruebas. Se mantiene `noindex,nofollow` y el carácter provisional de los datos; no se ha validado ni ejecutado un lanzamiento comercial.
