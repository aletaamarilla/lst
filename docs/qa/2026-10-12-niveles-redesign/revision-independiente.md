# Revisión independiente del rediseño de niveles

Base Git: 351576d508314ff4bdf2cb8421f600dcc0c8d3de. Candidata sin commit, identificada en sha256.txt. Comparación adicional con docs/qa/2026-10-12-niveles-redesign/antes/.

Resultado: no se identifican hallazgos accionables ni bloqueos en el producto revisado.

Se revisaron HTML/CSS completos de la nueva guía, diferencias frente a la anterior, scripts/check.mjs y scripts/check-levels.mjs. Home/app/generador/seis fichas y data/trips.json conservan exactamente los hashes de la revisión anterior. El único canal externo de la guía es WhatsApp; las cuatro páginas originales ya no se enlazan desde el contenido. La navegación conserva los cuatro IDs y el calendario de la home.

El texto presenta situaciones reconocibles, separa técnica de autonomía y deriva las dudas al equipo. No se introduce un test, clasificación automática, titulación ni requisito técnico nuevo. La reescritura es coherente con las cuatro páginas originales de niveles contrastadas en la revisión anterior: primeras espumas y paredes pequeñas, bombeo/giros básicos, autonomía/cambios de peso, y perfeccionamiento de maniobras. La nota de orientación, la valoración del equipo y el hecho de que consultar no confirma plaza se mantienen.

Validación ejecutada por este revisor:
- git diff --check: correcto.
- npm test: 5/5.
- npm run check: 8 páginas correctas.
- Chromium independiente: 22 comprobaciones correctas, 0 errores JavaScript. Anchos 320, 700 y 1440 px; anclas con desplazamiento suave y foco; ausencia de desbordamiento; menú y Escape con texto al 200 % a 320 px; caption de portada al 200 % sin recorte; consulta WhatsApp interceptada; regreso al calendario. Script y salida en browser.cjs/browser.json. Capturas propias de las tres portadas.

La primera ejecución del script propio tomó dos medidas antes de finalizar el scroll suave debido a una espera fija de 700 ms. El script se corrigió para esperar a la posición visible de destino; la ejecución final pasó. Esto fue una limitación de la prueba inicial y no un cambio de producto.

También se inspeccionó la evidencia del implementador: matriz final de 548 comprobaciones, cero incidencias, cero errores JS y 20 consultas interceptadas. Las capturas actuales ya corresponden a la corrección de numerales; las antiguas se habían leído durante su regeneración y no se usan como evidencia final.

Limitación: comprobación de navegador en Chromium; no implica cobertura de otros motores ni garantía absoluta de ausencia de defectos. Sin cambios de implementación por parte del revisor, publicación, push ni contactos reales.
