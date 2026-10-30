# Revisión independiente · personalidad y navegación · 30/10/2026

## Alcance y base

Revisión separada, sin modificar archivos de implementación, contra las copias exactas de `before/`. Base Git `58f338661fc4705364fea08727c836e79b3f2048` con trabajo previo sin commit preservado.

Requisitos contrastados: retirada completa del resumen superior; menú de secciones oculto en apertura y flotante durante la lectura; conservación de estructura, datos, solicitudes, PDF, pagos y consultas; sustitución de fondos pastel por blanco, tinta, verde profundo y naranja. Revisados `scripts/render-trips.mjs`, `dist/trip.js`, `dist/trip-conversion.css`, estilos consumidores y pruebas afectadas.

## Hallazgos resueltos

1. **P2 · La sección activa quedaba atrasada tras pulsar un ancla.** El controlador original usaba `headerHeight + navigationHeight + 30`; el aterrizaje nativo incluía además el padding raíz y el margen de desplazamiento del destino. Reproducción independiente ejecutando el controlador real con geometría coherente con el CSS: cabecera 80 px, menú 56 px, padding adicional 24 px y margen 20 px dejaban `#plan` a 180 px frente a un umbral de 166 px; el activo seguía siendo `#nivel`. El implementador confirmó adicionalmente el escenario en su navegador. Corregido derivando el umbral del `scroll-padding-top` computado, el máximo `scroll-margin-top` de los destinos y una tolerancia de 2 px.

   Revalidación independiente sobre el controlador corregido: **10 casos aprobados** (cinco destinos por dos geometrías de cabecera/menú, incluida una ampliada). En todos se marca la sección de aterrizaje esperada.

2. **P2 · Indicador de foco poco distinguible sobre los nuevos fondos oscuros.** El anillo global `#aa391b` conservado de `trip-detail.css` tenía contraste de **2,72:1** sobre tinta `#1b1b1b` y **1,50:1** sobre verde `#164e45`. Los enlaces de los bloques de nivel y equipo carecían de un ajuste contextual. Corregido mediante `focus-visible` de color `--brand-paper` en ambos bloques. La regla tiene mayor especificidad que el estilo global. Los pares crema/tinta y crema/verde resultantes ofrecen aproximadamente **16,47:1** y **9,09:1**. Se comprobó la presencia de la regla final mediante aserción.

No quedan bloqueos confirmados abiertos dentro del alcance revisado.

## Evidencia ejecutada por el revisor

- `node --test --test-reporter=dot scripts/*.test.mjs`: **160 pruebas, exit 0**, repetidas después de ambos arreglos. Acceso a localhost y temporales autorizado para evitar las limitaciones EACCES/EPERM de la ejecución restringida.
- Añadidas después `scripts/trip-navigation.test.mjs`: el revisor leyó y ejecutó **solo ese archivo nuevo**, con `node --test --test-reporter=spec scripts/trip-navigation.test.mjs`: **2 pruebas aprobadas, exit 0**. Ejecutan el controlador real en `vm` y comprueban ocultación en apertura/tras el contenido, aparición después de la portada y las cinco anclas con geometría normal y ampliada. La suite completa independiente de 160 fue anterior a estas dos pruebas; el total de 162 comunicado por el implementador no se presenta como una nueva ejecución completa independiente.
- Ejecución aislada del controlador real de navegación con geometría explícita: reproducción del fallo anterior y **10 casos aprobados** con la corrección. Esta evidencia es una comprobación de código con dobles de DOM, no una prueba de navegador.
- Contraste del diff contra `before/`: eliminado el bloque de resumen y su controlador del dock; las anclas del menú siguen apuntando a secciones existentes. Los mecanismos existentes de apertura/cierre de diálogos, reserva por fecha, disponibilidad, pagos, PDF y fallback nativo no han sufrido cambios de contrato.
- Los hashes del generador y JavaScript de inscripción coinciden con la versión previamente revisada: no se han modificado los campos obligatorios, el endpoint ni las categorías Brevo en esta corrección.
- Cálculo de pares principales nuevos: naranja/tinta **4,90:1**, secundario claro/tinta **11,56:1** y crema/verde **9,09:1**. No constituye una auditoría completa de accesibilidad.
- Último delta de CSS revisado mediante lectura y aserciones: `#actividades` usa ahora `--muted:#1b1b1b` sobre naranja (aproximadamente **4,90:1**; el implementador detectó el par anterior de 4,09:1 en navegador); el foco crema se extiende también a `.price-decision`, con fondo tinta. Ambos ajustes quedan incorporados al hash final de CSS. La suite de 160 pruebas indicada arriba precede exclusivamente a estos dos cambios de color; no se repitió por este delta trivial.

## Versión final revisada (SHA-256)

| Archivo | Hash |
| --- | --- |
| `scripts/render-trips.mjs` | `e742d75197a4433c70eba329cee85fdd8c625f0300410ce27639c270d78ede44` |
| `dist/trip.js` | `f0f61ea396438e227aba3ee745ac2873b565a4e5d4d45a1a047093a25b455b21` |
| `dist/trip-conversion.css` | `1e9bb50ce4c0da34b7190cce11671a1f414d890f490ce9d44bd14d370fa9173c` |
| `scripts/trip-navigation.test.mjs` | `a961d5a270a6299a6ec8352f6ee369778f1285f5a4ef31cb564cd847e17d31e3` |
| `scripts/render-registration.mjs` (sin cambios) | `87873ef43f1b0b236df6502930a82c17f81c13cc400950076661552e7bcefd90` |
| `dist/registration.js` (sin cambios) | `a7567b6179c26938ff7ef53a6f013db3e7bde26470c3276a743bba983bbe24fa` |

## Límites

El navegador IAB no está disponible para este subagente; no se atribuye revisión visual ni de interacciones reales independiente. Las comprobaciones finales de anclas, foco visible, móvil, texto ampliado, menús y diálogos en navegador corresponden al implementador y a su evidencia. El caso de geometría ampliada no equivale a una prueba visual de zoom. No se enviaron solicitudes reales a Brevo ni mensajes a WhatsApp, no se alteró el CMS y no se revisó ni autorizó una publicación.
