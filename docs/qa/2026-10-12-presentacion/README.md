# LST · Presentación, experiencia y equipo · 12/10/2026

Implementación y validación local terminadas. Repositorio `aletaamarilla/lst`, rama `main`, base `6053e6173d6114ee741bc0f4310d79418f22199e`. La revisión 13 ya estaba sin commit al comenzar: [estado inicial](estado-inicial.txt). Se conserva ese trabajo. Esta entrega queda sin commit, sin push, publicación ni despliegue.

## Qué mejora y por qué

La apertura mantiene la personalidad del titular y añade el contenido de la experiencia. El bloque de experiencia explica aprendizaje, convivencia y descubrimiento; la presentación conserva la historia de Lucas y distingue con un subtítulo quién es LST hoy y cómo acompaña. Las fichas se centran en el equipo de cada salida y dejan de repetir el origen. No se cambia el orden de la home ni se añaden servicios a los viajes de prueba.

Son mejoras de claridad y reparto del contenido observables en la versión, no resultados de conversión medidos. Logos, fotografías, Aura, Work Sans, Space Mono y paleta siguen intactos.

## Texto final

### Apertura

**VIAJES DE SURF EN GRUPO**

**SURFEAR JUNTOS SABE MEJOR.**

Aprender surf, conocer gente y descubrir nuevos lugares. Viajamos contigo.

Acción conservada: **Elige tu próximo viaje**.

### Así viajamos con LST

**Surf con tiempo para aprender**

Varios días para practicar y trabajar tu técnica. En cada programa encontrarás las sesiones y actividades previstas y los niveles a los que va dirigido.

**Una aventura que se comparte**

Puedes venir por tu cuenta o con amigos. Las sesiones, las comidas y los ratos entre baños dan pie a conocer al grupo.

**También conocemos el lugar**

El viaje sigue al salir del agua: recorrer la costa, probar la comida local y conocer la vida del lugar. Consulta los planes previstos en cada salida.

Se conservan la foto de surfskate en Cádiz y el testimonio existente de Laura; no se crean testimonios ni actividades incluidas.

### Presentación

**Todo empezó en Marruecos.**

Lucas propuso un viaje de surf a su comunidad. Aquel primer grupo y lo que vivieron allí dieron pie a LST.

Después de un año preparando el proyecto, Let's Surf Together arrancó a finales de 2024.

**Hoy, un equipo que viaja contigo.**

Quienes organizamos las salidas también estamos allí: compartimos las sesiones y el día a día del grupo. Antes de apuntarte, te ayudamos a entender el programa y los niveles de cada viaje.

**Nos vemos en el pico.**  
Lucas · Let’s Surf Together

Se conserva la foto de grupo y su pie **Laga, 2024.**, sin identificar a personas por su apariencia.

### Equipo en las fichas

**El Salvador — LST y los guías locales.**

El equipo de LST coordina las sesiones y el seguimiento técnico. Los guías locales aportan su conocimiento del spot.

**Asturias — El equipo de LST, contigo.**

El equipo de LST acompaña al grupo durante el fin de semana. Compartimos los días de surf y los ratos entre sesiones.

**Azores — Quién te acompañará.**

El próximo programa de Azores está pendiente. Consulta con LST quién acompañará al grupo y cómo se organizarán las sesiones antes de decidirte.

**Euskadi — Quién te acompañará.**

El próximo programa de Euskadi está pendiente. Consulta con LST quién acompañará al grupo y cómo se organizarán las sesiones antes de decidirte.

**Marruecos — Quién te acompañará.**

El próximo programa de Marruecos está pendiente. Consulta con LST quién acompañará al grupo y cómo se organizarán las sesiones antes de decidirte.

**Cádiz — Quién te acompañará.**

El próximo programa de Cádiz está pendiente. Consulta con LST quién acompañará al grupo y cómo se organizarán las sesiones antes de decidirte.

El enlace «La historia de LST» devuelve a la presentación de la home. Marruecos conserva en su lugar el testimonio y el enlace existente a su fuente. Si una futura salida con fecha no tiene `team`, el generador muestra «Quién te acompañará» y pide consultar el equipo, sin inventarlo. El equipo documentado de una salida no se muestra si cambia a estado pendiente.

## Fuentes y límites de las afirmaciones

| Contenido | Fuente leída | Alcance |
| --- | --- | --- |
| Aprendizaje, comunidad, aventura, cultura local | Cuestionario de marca aportado por el cliente, p. 1, preguntas 1–3 | Descripción de la propuesta de LST, sin progreso garantizado. |
| Quienes organizan acompañan | Cuestionario, p. 1, pregunta 4 | Presencia y experiencia compartida; no asistencia ilimitada ni nuevas prestaciones. |
| Voz y firma de Lucas | Cuestionario, p. 2, preguntas 6–9 | Se conserva «Nos vemos en el pico» y la identidad visual. |
| Marruecos, Lucas, preparación y arranque en 2024 | Cuestionario, p. 3, pregunta 14 | Origen del proyecto, sin inferir el cargo actual de Lucas o que asista a todas las salidas. |
| Orientación por nivel | Cuestionario, p. 5, nota FAQ y recorrido de reserva preexistente | El encaje depende del nivel admitido en cada salida. |
| Convivencia, comida y descubrimiento local | [Nosotros de la web antigua](https://www.letsurftogether.com/sobre-lst/), apartados de grupo y cultura local | Apoyo a la experiencia; los planes concretos remiten a cada programa. No se trasladan servicios históricos, iniciativas ambientales o excursiones a la oferta actual. |
| Coordinación, seguimiento técnico y guías en El Salvador | [Programa público](https://www.letsurftogether.com/producto/el-salvador-25-oct-1-nov/) y [dossier](https://www.letsurftogether.com/wp-content/uploads/2026/07/LST-EL-SALVADOR-SURFTRIP-25-OCT-5-NOV-1.pdf), pp. 2/5 (seguimiento), 6/8 (guías y coordinación), contrastados con `storyIntro`, `story[0]` e `includes` de los datos anteriores | Se resumen funciones ya descritas; no nombres, credenciales ni nuevas prestaciones. |
| Acompañamiento en Asturias | `data/trips.json`, inclusión preexistente «Acompañamiento del equipo de LST» y `demoData` | Conserva el escenario provisional autorizado; no es verificación de una salida comercial. |
| Fotos | `docs/asset-provenance.json` | Se conserva la procedencia. La foto de Laga es de grupo, no un retrato identificado de Lucas o del equipo actual. |

El cuestionario local se leyó de `/mnt/c/Users/Antonio Fernandez/Downloads/Cuestionario_Marca_Web_LST.pdf`. No se incorpora el PDF ni sus datos legales personales al repositorio. Se conserva su huella en `version.json` para identificar la fuente leída. El dossier público se pudo leer mediante descarga local después de que el navegador documental no lo recuperara. No se importan sus condiciones de reserva, descuentos ni garantías de mejora.

## Evidencia de aceptación

| Criterio | Evidencia y resultado |
| --- | --- |
| Lectura a 390 y 1440 px | Home y seis fichas en Chromium, 390×844 y 1440×900: 14 combinaciones sin desbordamiento horizontal, errores JavaScript ni imágenes de contenido sin cargar. [Medidas y textos](capturas/audit.json), capturas inspeccionadas. Las imágenes de los diálogos cerrados se excluyen del recuento de carga porque son diferidas. |
| Composición y navegación | Apertura con titular, frase y CTA separados y dentro de la primera pantalla; anclas de experiencia/presentación dejan el título visible; firma de Lucas conservada. [Verificación](verification.json). |
| Consulta por WhatsApp | 16 aperturas interceptadas localmente, número/contexto presentes. Incluye home, seis destinos y ambas fechas de Asturias a los dos anchos. Sin enviar mensajes. El popup conserva el retorno del foco. |
| Valores y escenarios de los viajes | Comparación estructural: retirando los dos nuevos campos `team`, `data/trips.json` es idéntico a la base. [Preservación](preservation.json). |
| Consumidores y comportamiento anterior | HTML generado idéntico fuera de `.trip-team`; todos los href de WhatsApp idénticos. Calendario, reserva, niveles, FAQ y cierre de home intactos. |
| Marca y cambios previos | Huellas de todos los assets idénticas; `styles.css`, `trip.css`, JavaScript, modelo y pruebas anteriores intactos. `mobile.css`, README y propuesta conservan su contenido previo como prefijo. |
| Pipeline | `npm run build`: seis fichas reconstruidas. `npm run check`: PASS en siete páginas, vínculos/anclas/assets, consultas, demo, pendientes, sincronización y noindex. `npm test`: 5/5 de niveles, fechas, precios y consultas. `git diff --check`: correcto. |
| Revisión independiente | [Informe y hashes](revision-independiente.md): sin bloqueos ni defectos accionables en la implementación final. El revisor ejecutó `npm run check` y contrastó las fuentes, la base exacta y las capturas. |

Las 44 comprobaciones de navegador y las 30 de preservación están vinculadas a los criterios anteriores; su número no sustituye el análisis de los requisitos. No se añadieron dependencias ni pruebas de copia textual al proyecto. Los scripts puntuales de captura y contraste se conservan en `/tmp/lst-presentation-20261012/`.

## Capturas finales

| Vista | 390 px | 1440 px |
| --- | --- | --- |
| Apertura | [Móvil](capturas/home-390-hero.png) | [Escritorio](capturas/home-1440-hero.png) |
| Experiencia | [Móvil](capturas/home-390-experience.png) | [Escritorio](capturas/home-1440-experience.png) |
| Presentación | [Móvil](capturas/home-390-people.png) | [Escritorio](capturas/home-1440-people.png) |
| Home completa | [Móvil](capturas/home-390-full.png) | [Escritorio](capturas/home-1440-full.png) |
| Equipo El Salvador | [Móvil](capturas/el-salvador-390-viewport.png) | [Escritorio](capturas/el-salvador-1440-viewport.png) |
| Equipo Asturias | [Móvil](capturas/asturias-390-team.png) | [Escritorio](capturas/asturias-1440-team.png) |
| Equipo Azores | [Móvil](capturas/azores-390-viewport.png) | [Escritorio](capturas/azores-1440-viewport.png) |
| Equipo Euskadi | [Móvil](capturas/euskadi-390-team.png) | [Escritorio](capturas/euskadi-1440-team.png) |
| Equipo Marruecos | [Móvil](capturas/marruecos-390-team.png) | [Escritorio](capturas/marruecos-1440-team.png) |
| Equipo Cádiz | [Móvil](capturas/cadiz-390-team.png) | [Escritorio](capturas/cadiz-1440-team.png) |

Las capturas `*-team`, `*-people` y `*-experience` son extractos del documento para leer el bloque completo, con sus anchos originales. Las `*-viewport` y `*-hero` muestran la ventana de navegador. Las capturas no deducen identidades personales de las fotos.

## Archivos y versión

[Diff exclusivo de esta tarea](task-only.diff), separado de los cambios previos. [Manifiesto y huellas de la candidata](version.json), [huellas iniciales](huellas-iniciales.json).

- `dist/index.html`: frase de apertura, dos párrafos de experiencia, puente entre historia y presente.
- `dist/mobile.css`: reglas acotadas de espaciado y tipografía para la frase y el subtítulo nuevos.
- `data/trips.json`: `team` en El Salvador y Asturias, sin cambios en ningún campo anterior.
- `scripts/render-trips.mjs`: equipo específico o consulta de equipo pendiente; desaparece la historia duplicada.
- Los seis `dist/viajes/*/index.html`, reconstruidos desde sus fuentes.
- `README.md`, `docs/propuesta.md`, `docs/content-inventory.json`: revisión 14 y trazabilidad, conservando el historial.
- Este directorio QA: texto final, capturas, revisión y evidencia.

## Datos pendientes y límites

Faltan nombres y funciones públicas del equipo actual; quién participa en cada salida; el papel actual de Lucas más allá de organizar el primer viaje; retratos identificados de Lucas/equipo y permisos de reutilización. Para los cuatro destinos sin nuevas fechas, también falta el equipo y el acompañamiento de su próximo programa. No se sustituyen estos datos con perfiles vacíos ni identidades deducidas.

Validación en Chromium local, sin dispositivos físicos ni comprobación nueva en Safari/Firefox o lectores de pantalla. Las fuentes cargan localmente. No se comprobó el salto a la aplicación nativa de WhatsApp ni se enviaron mensajes. No hay medición comercial ni validación de nuevas fechas: se conservan los escenarios provisionales. La implementación está terminada y validada dentro de ese alcance; no constituye una preparación ni autorización de lanzamiento comercial.
