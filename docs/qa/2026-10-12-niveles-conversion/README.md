# Niveles, navegación y recorrido de consulta

Versión actual sin commit sobre `351576d508314ff4bdf2cb8421f600dcc0c8d3de` de `aletaamarilla/lst`. Se conservan las dos iteraciones anteriores. [Estado al inicio](baseline.json) · [versión final](version.json).

## Recorrido implementado

1. «Niveles» aparece en las ocho cabeceras. En home y guía hay un acceso móvil fuera del menú; las fichas tienen navegación directa Viajes/Niveles. Se conserva el comportamiento de lectura de las cabeceras en pantallas muy bajas de las fichas.
2. Elegir un nivel desplaza a su tarjeta, mantiene el foco y destaca tarjeta e índice. Una transición breve respeta la preferencia de movimiento reducido. «Nivel que estás explorando» describe la selección manual; no certifica al visitante.
3. Cada nivel ofrece «Ver viajes para…» y una consulta contextual por WhatsApp. El primero lleva a un bloque común de viajes filtrado por los niveles declarados en el JSON. Las salidas con fecha y los destinos por anunciar tienen grupos distintos.
4. Cada destino enlaza a su ficha con un texto descriptivo. El Salvador solo aparece para II y III y conserva «con autonomía». Rookies y Supercracks no lo muestran. Los otros cinco destinos conservan su configuración actual para todos los niveles.
5. La consulta conserva el nivel explorado; el equipo revisa experiencia, autonomía y disponibilidad antes de reservar. Se puede cambiar de nivel, mostrar Todos, volver atrás o recargar conservando el contexto.

No se modifica ninguna fecha, tarifa, salida, programa, estado comercial ni dato provisional. Los enlaces a contenido antiguo siguen eliminados. Sin JavaScript se leen los cuatro niveles y los seis destinos, con niveles/condiciones explícitos y anclas destacadas; los filtros requieren JavaScript.

## Diseño móvil y SEO/GEO

Se conserva una sola lista de viajes para evitar repetir destinos bajo cada nivel. El acceso a acciones llega inmediatamente después de leer una ficha, y el bloque de autonomía sigue disponible. Los destinos usan tarjetas compactas con fotografía, fechas, niveles y acceso a detalle. No se añade una barra fija que quite espacio a la lectura.

Los enlaces a destino y el texto existen en el HTML generado; no dependen del filtro para ser descubiertos. Los nombres de destino y las condiciones son visibles y coinciden con la fuente de las fichas. [Google recomienda enlaces HTML y textos descriptivos](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). [Sus funciones de IA usan los fundamentos de SEO](https://developers.google.com/search/docs/appearance/ai-features), con requisitos de indexación; no hace falta un marcado especial para IA.

La decisión busca un recorrido útil y una arquitectura coherente. No acredita una mejora de ventas, rankings o inclusión en motores de IA. El prototipo mantiene `noindex,nofollow`: indexación, URL definitiva/canonical de filtros, redirecciones de páginas antiguas y medición de consultas pertenecen a la fase de lanzamiento.

## Fuentes y generación

- Niveles: definiciones y fuentes editoriales ya documentadas en `docs/content-inventory.json`; sin ampliar criterios técnicos.
- Destinos: `data/trips.json`, `levelsFor` y `tripFacts` de `scripts/trip-model.mjs`. No se investigaron condiciones comerciales nuevas.
- `scripts/render-level-trips.mjs` genera únicamente el bloque marcado en la guía. `npm run build` ejecuta este generador y el de las fichas.
- `scripts/check.mjs` verifica ambas salidas, sintaxis, ocho rutas y presencia de Niveles en las cabeceras, conservando las comprobaciones anteriores.
- Contexto del filtro: URL `?nivel=…`, ancla e historial. Sin almacenamiento, formulario ni evaluación automática.

## Archivos

Modificados en esta iteración: `dist/index.html`, `dist/niveles/index.html`, `dist/mobile.css`, `dist/trip.css`, `dist/levels.css`, `scripts/render-trips.mjs`, `package.json`, `scripts/check.mjs`, `scripts/check-levels.mjs`, `scripts/check-ux.mjs`, README, propuesta e inventario. Se regeneran las seis fichas, con cambios solo en cabecera.

Nuevos: `dist/levels.js`, `scripts/render-level-trips.mjs` y esta carpeta de evidencia. [Preservación de datos y recursos](preservation.json).

## Validación ejecutada

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Seis fichas y seis destinos de guía generados. [Log](build.log) |
| `npm test` | 5/5. [Log](test.log) |
| `npm run check` | Ocho páginas y ambos generadores correctos. [Log](check.log) |
| `git diff --check` | Correcto |
| Matriz de guía | 1.094 comprobaciones, sin incidencias/errores JS, 20 consultas interceptadas. [JSON](browser.json) |
| Regresión home/fichas | 1.171 comprobaciones, sin incidencias/errores JS, 43 consultas interceptadas. [JSON](regresion/verification.json) |
| Revisión independiente | 28/28, sin hallazgos pendientes. [Informe](revision-independiente.md), [evidencia](revision-browser.json), [hashes](revision-hashes.txt) |

La matriz incluye 320, 390, 768, 1024 y 1440 px, pantallas bajas, texto al 200 %, teclado, anclas, selección única, filtros de los cuatro niveles comparados contra el JSON, mensajes, historial, recarga y Ctrl+clic real. Las consultas se interceptan localmente y no se envían. El menú se comprueba con su número actual de enlaces, evitando presuponer el menú anterior.

Se resolvieron dos P2 de la revisión independiente: `:target` residual al cambiar filtros con pushState y modificación de la pestaña original al abrir un nivel con Ctrl/Cmd. El fallback nativo de `:target` se limita al modo sin JavaScript; los manejadores respetan modificadores. [Hallazgos iniciales](hallazgos-resueltos.md).

Dos ajustes del comprobador fueron necesarios: recorrer/esperar las nuevas fotos de carga diferida antes de capturarlas, y usar Ctrl+clic real después de sincronizar el estado inicial. Las ejecuciones finales pasan y los archivos de producto coinciden con la revisión independiente. El script de la matriz tiene esas esperas posteriores registradas en la versión final.

## Capturas actuales

- [Móvil: nivel elegido](capturas/aprendices-390.png) · [viajes para Aprendices](capturas/viajes-aprendices-390.png).
- [Escritorio: nivel elegido](capturas/aprendices-1440.png) · [viajes para Aprendices](capturas/viajes-aprendices-1440.png).
- [Cabecera home móvil](capturas/header-home-390.png) · [cabecera de ficha móvil](capturas/header-trip-390.png).
- [Página completa móvil](capturas/niveles-390-completa.png) · [página completa escritorio](capturas/niveles-1440-completa.png).

Se inspeccionaron visualmente las páginas completas, portada móvil, el nivel destacado, los viajes filtrados y las cabeceras móviles. Chromium local; sin Safari, Firefox, lector de pantalla, teléfono físico ni app nativa de WhatsApp. No se ha hecho commit, push, publicación ni despliegue.

Para reproducir, iniciar `npm run dev` y ejecutar `scripts/check-levels.mjs` o `scripts/check-ux.mjs` con las mismas variables de Playwright/Chromium documentadas en las entregas anteriores. No hay nuevas dependencias.
