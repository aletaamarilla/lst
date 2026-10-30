# Portadas de Niveles y catálogo · 30 octubre 2026

Petición: homogeneizar la foto a todo el ancho y la cabecera sobre ella en Niveles y Ver viajes; retirar el filtro de fecha y mantener nivel. Se preserva la personalidad recuperada en las iteraciones anteriores y el resto del trabajo existente.

## Versión y alcance
Repositorio letsurftogethersystem, HEAD 58f338661fc4705364fea08727c836e79b3f2048, cambios locales sin commit. candidate.json identifica por SHA-256 los nueve archivos revisados: dos HTML, dos CSS, JavaScript del catálogo, generador y tres archivos de comprobación (catalog-ui.test.mjs es nuevo). La base exacta está en artifacts/landing-headers-before; task.diff acota esta iteración. No se han modificado datos ni dependencias.

## Decisiones y conservación
- Se reutiliza landing.css y las dos fotos existentes. Foto a todo el ancho, logo/menú crema sobre ella y cabecera crema con logo oscuro al desplazarse o abrir menú. Se conserva el sello de Niveles y el titular inclinado del catálogo.
- Niveles conserva su índice, contenido, filtros, anclas, orientación y enlaces. Se evita sumar scroll-margin al scroll-padding existente para mantener el desplazamiento y la señal de llegada.
- Catálogo con un único select de nivel, Ver todos, estado y vacío. Los enlaces antiguos con fecha aplican solo su nivel válido; cambiar o limpiar retira fecha/estado y conserva otros parámetros y hash. Popstate sigue sincronizando la vista.
- La API pública catalog-filter.js conserva las funciones de fecha para sus consumidores. El generador deja de crear opciones de mes, pero el bloque de tarjetas publicado es idéntico byte a byte a la base. El contenido de Niveles desde guide-content también es idéntico (24.903 caracteres). preservation.json.
- Fechas nativas de cada tarjeta, rutas, precios, promociones, disponibilidad, formularios y reservas conservados. FAQs y detalle aprobado permanecen como estaban al empezar esta iteración. No se añade ninguna fotografía.

## Evidencia final
- npm test: 190/190. tests.txt.
- npm run check: 40 páginas, rutas, anclas, assets y coherencia de generación. check.txt.
- Sintaxis del comprobador opcional de catálogo: PASS. Se actualiza, pero no se ejecuta porque usa un navegador externo. Toda interacción visual se verifica en el navegador integrado.
- Dos páginas a 320, 390, 768, 1024 y 1440 px: sin desbordamientos; imagen desde x=0 hasta clientWidth y titular bajo la cabecera. viewport-metrics.json y capturas de apertura.
- A 320, 390 y 1440 px: cinco valores de nivel con resultados correctos; fechas de tarjeta abren y cierran con Escape; select con foco visible de 3 px y 54 px de alto; menú móvil abre, cierra con Escape y devuelve foco; cabecera desplazada crema/negro. browser-behavior.json.
- Anclas accionadas con Enter: destino a 90/100 px según cabecera, señal is-arriving activa; se mide después de terminar el desplazamiento suave.
- En 320×568 no hay desbordamientos y el menú termina dentro de la pantalla. Menú y acceso directo 44 px, índice 84 px, select 54 px y Ver todos 48 px. narrow-touch.json.
- Imágenes de contenido cargadas en las cuatro vistas completas de 390/1440 px, sin fallos (12 en Niveles y 8 en catálogo). image-checks.json y capturas full.
- Contraste visual revisado; se refuerza el gradiente lateral móvil en Niveles y se conserva naranja sobre negro y controles crema/negro. Esta revisión no constituye una certificación integral de accesibilidad.
- Historial, enlaces antiguos/invalidos, vacío, foco al limpiar y catálogo sin viajes cubiertos por pruebas sobre el JavaScript real con DOM simulado. El historial no se presenta como verificado mediante atajos del navegador integrado. No-JS se revisa por código y salida estática; los controles siguen ocultos y todos los viajes/enlaces y details se renderizan.
- Revisión independiente sin hallazgos accionables ni bloqueos sobre la versión final, incluido el gradiente móvil. independent-review.md.

## Límites y vista previa
El build remoto de Sanity quedó bloqueado por conexión en la iteración inicial, con el mismo fallo reproducido en su base (../2026-10-30-brand-rollout/README.md y logs). No se refrescan datos remotos ni se declara validado un build con datos nuevos. El snapshot actual, la generación local y las pruebas pasan.

Vista local: http://localhost:4176/viajes/ y http://localhost:4176/niveles/ . Servidor local disponible; no se ha publicado ni desplegado. El servidor anterior del usuario se conserva.
