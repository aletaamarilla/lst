# Revisión independiente de contenido, documentación y compatibilidad — LST

Fecha: 12/10/2026. Repositorio: `https://github.com/aletaamarilla/lst`. Checkout: `/home/amfernandez/personalProjects/letsurftogethersystem`.

**Resultado:** no se han encontrado regresiones de contenido ni defectos bloqueantes accionables dentro de este alcance. No se han modificado archivos de implementación. Esta conclusión no sustituye la comprobación en navegador ni el pipeline de la revisión final.

## Versión y alcance revisados

Base Git: `6053e6173d6114ee741bc0f4310d79418f22199e`, con las revisiones previas 13–17 sin commit. Fuentes revisadas: README, propuesta histórica/vigente, inventarios, `data/trips.json`, home, plantilla y seis páginas generadas. Se comparó el diff de datos frente a HEAD. La candidata queda identificada por los SHA-256 de [content-review-hashes.json](content-review-hashes.json); los siete archivos principales conservan las huellas de la primera revisión de contenido.

Los informes de revisiones anteriores se leyeron para entender requisitos, decisiones y procedencia; sus resultados PASS no se reutilizan como validación de esta candidata. El agente principal ejecuta el pipeline y las comprobaciones actuales de navegador por separado.

## Matriz de comprobación

| Comprobación | Resultado | Evidencia obtenida en esta revisión | Pendiente |
| --- | --- | --- | --- |
| Revisiones 13–17 incorporadas | Conforme en fuentes y HTML | Menú y etiquetas de consulta; frase de experiencia, origen/equipo; reseñas; principios ambientales; campos visuales consumidos por la plantilla. README 80–114 y propuesta 78–122 coinciden con la implementación. | Comportamiento y presentación efectiva: comprobación en navegador de la revisión principal. |
| Experiencia e identidad | Respaldadas documentalmente | Lectura directa del cuestionario local: preguntas 1–4, 8–9 y 14. La propuesta de surf, grupo y descubrimiento, presencia de quienes organizan, origen de Lucas y arranque en 2024 coinciden. | Identificación pública del equipo actual y retratos autorizados. |
| Testimonios | Extractos literales y contexto correcto | Lectura directa del HTML de fuente retenido. Laura: extracto literal y contexto Marruecos; Ainhoa: extracto literal y destino no especificado. Ainhoa solo está en home; Marruecos conserva únicamente Laura. | La publicación documentada no acredita actualidad; las voces se presentan como recuerdos. |
| Equipo por destino | Sin identidades ni credenciales nuevas | El Salvador resume funciones existentes, contrastadas con dossier retenido; Asturias resume acompañamiento de la demo. Plantilla `team=real?trip.team:null`, y consulta cuando falta equipo. | Equipo concreto de próximas salidas; papel actual de Lucas. |
| Responsabilidad ambiental | Separación correcta entre valores y compromisos | Siete HTML examinados: sin Universal Plastic, 3 % ni recogidas presentadas como prácticas. Inventario: tres compromisos con `publicUI:false` y confirmaciones necesarias. | Confirmación de vigencia, alcance y ejecución de recogidas, Universal Plastic y 3 %. |
| Datos comerciales y demo | Conservados frente a HEAD | Diff estructural: solo cambian `team`, `testimonial`, `heroLayout`, `heroPositionMobile` y `heroMinHeightMobile`, según destino. Fechas, precios, niveles, inclusiones, mensajes y estados conservados. | Sustituir demo y cerrar datos definitivos antes del lanzamiento. |
| Home y seis destinos | Conforme en inspección textual | Un h1 y título específico por página; sin formularios ni texto de relleno; siete páginas con noindex,nofollow. Términos “por confirmar/anunciar” describen decisiones pendientes explícitas, no placeholders accidentales. | Carga de recursos, enlaces e interacción: navegador/pipeline principal. |
| Documentación y conservación de historia | Conforme | README vigente, propuesta separada por revisión, inventario de estados y fuentes. Procedencia identifica Blanca como investigación histórica, separada de las voces actuales. | Añadir informe de la fase final y lista de lanzamiento. |

## Evidencia concreta y decisiones conservadas

- `README.md:50`: Asturias es una demo autorizada y se presenta sin etiquetas de muestra. No es una regresión ni una nueva validación comercial.
- `dist/index.html:9`: frase inicial de aprendizaje, grupo y descubrimiento incorporada.
- `dist/index.html:69`: Laura/Marruecos y Ainhoa/sin destino; omisiones indicadas y fuente común.
- `dist/index.html:81`: origen, equipo y firma; foto de Laga, 2024, sin asignar identidades por apariencia.
- `dist/index.html:82`: principios de respeto, sin protocolo operativo ni resultados ambientales prometidos.
- `data/trips.json:126` y `:253`: equipos de El Salvador y Asturias.
- `data/trips.json:418`: voz histórica de Laura en Marruecos.
- `scripts/render-trips.mjs:39` y `:63`: equipo condicionado al estado y texto de consulta ante ausencia de información.
- `docs/content-inventory.json:347`: compromisos ambientales pendientes, evidencia requerida y exclusión de UI.
- `docs/asset-provenance.json:231`: el testimonio antiguo de Blanca es investigación histórica, no la selección actual.

No hay hallazgos accionables que requieran corrección de contenido. No se han propuesto cambios de estilo ni otro rediseño.

## Fuentes contrastadas directamente

- Cuestionario local del cliente, leído únicamente en sus apartados de marca pertinentes. SHA-256 `741bfdfd395f87cff1b2b2a55ff0aa4db8c845cd7757225ee108762dea21ad5a`. El archivo, su ruta personal y sus datos privados no se incorporan al informe.
- HTML de home original conservado en `/tmp/lst-community-20261012/source-home.html`, SHA-256 `ad53b44d654a193f04809eae13fbda6da100504fc3ffa5cce0881b0200524230`. Se comprobaron las palabras y atribuciones, no solo el resultado histórico de `sources.json`.
- Dossier público conservado en `/tmp/lst-presentation-20261012/salvador-dossier.pdf`, SHA-256 `1ee72d793a44368fb727f057b95fb3aaa5c22b2f8321224446c45123ff005879`. Páginas 2/5: seguimiento técnico; 6/8: guías y coordinación. Se contrastó procedencia del texto de equipo, sin investigar ni modificar exactitud comercial de fechas, precios o servicios.

## Pendientes para un futuro lanzamiento — solo anotados

1. **Datos definitivos:** sustituir los campos de demo de Asturias, confirmar salidas, disponibilidad, precios, programa, inclusiones, condiciones y receptor de WhatsApp; concretar los cuatro destinos pendientes.
2. **Contenido:** nombres y funciones públicas del equipo, participación por salida, papel actual de Lucas, retratos identificados y permisos de reutilización de fotografías/fuentes; resolver los tres compromisos ambientales únicamente con respaldo adecuado. No rellenar estos huecos con identidades o promesas deducidas.
3. **Migración de URLs:** inventariar las URL antiguas, decidir equivalencias y redirecciones, comprobar enlaces externos, niveles, programas y dossier; actualizar dominio/origen definitivo de metadatos.
4. **Indexación:** acordar momento de lanzamiento; revisar noindex/robots, canonical, sitemap, metadatos y verificación en buscadores cuando corresponda. No retirar ahora la protección de propuesta.
5. **Medición:** definir eventos del recorrido y consultas, objetivos y consentimiento aplicable. El efecto comercial no está medido y no se atribuye mejora de conversión.

## Límites

Esta subrevisión es documental, de código y de HTML, sin ejecución propia de pruebas de navegador ni de npm. Los resultados actuales del pipeline y de interacción deben adjuntarse desde la revisión principal. No verifica Safari/Firefox, dispositivos físicos, lectores de pantalla, salto a WhatsApp nativo ni disponibilidad de servicios externos. No investiga nueva exactitud comercial ni acredita vigencia o ejecución ambiental. No se han enviado mensajes, publicado, desplegado ni realizado push.

Conclusión limitada a los archivos identificados: contenido y documentación coherentes dentro de la fase privada; los pendientes de lanzamiento siguen siendo externos y no deben confundirse con funcionalidades implementadas o confirmaciones obtenidas.
