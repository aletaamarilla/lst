# Ficha de viaje: conversión y mobile first · 30/10/2026

## Alcance y criterios

Reordenar el prototipo alrededor de oferta, encaje de nivel/grupo, surf, acompañamiento, alojamiento, actividades, precio y solicitud. Mantener fotos provisionales y datos actuales, contratos de Brevo, categorías, estados, promociones y condiciones por salida. Sin publicación ni escrituras en Sanity.

- Primera pantalla móvil con destino, propuesta, fecha, duración, nivel, precio y acceso a solicitud.
- Contenido esencial vertical; carruseles solo para fotografías.
- Crema, texto oscuro, naranja para acción y un solo verde mar secundario; WhatsApp secundario.
- Información de pago por salida junto a inclusiones y proceso de solicitud explícito.
- Formulario compacto conservando todos los campos y validaciones del contrato existente.
- Validar salidas únicas, múltiples, agotadas/pendientes, URLs históricas, teclado/foco y pantallas pequeñas.

## Base

Worktree con cambios previos extensos en main. `npm test` ejecutado antes de editar: exit 0. Los archivos en `before/` registran la versión de trabajo de los componentes afectados, no HEAD.

## Validación final

Implementación local terminada, sin commit, push ni despliegue. Base Git: `58f338661fc4705364fea08727c836e79b3f2048`. Se conservaron los cambios previos del worktree; `before/` permite comparar los componentes con la versión exacta anterior a esta tarea.

### Cambios de esta tarea

- `scripts/render-trips.mjs`: resumen de oferta, navegación por secciones, ayuda de nivel y grupo, testimonio histórico de Laura ya usado en la home, surf antes que actividades, listas verticales, precio/pago/cancelación por fecha y proceso de solicitud.
- `dist/trip-conversion.css` (nuevo) y ajustes acotados de `dist/trip-detail.css`: crema, tinta, naranja de acción y verde mar; tipografía legible y fondos simplificados; resumen compacto y WhatsApp secundario.
- `dist/trip.js`: oculta el dock mientras la acción del resumen está visible. Conserva foco, teclado y scroll de los diálogos.
- `scripts/render-registration.mjs` y `dist/registration.css`: contexto móvil compacto y solicitud sin pago explícita. Contrato de campos, obligatoriedad, opciones y categorías Brevo intacto. Se conservan cinco pasos: no se ha cambiado el contrato de recogida de datos.
- `scripts/render-trip-pages.mjs` (nuevo): reconstrucción de presentación desde el snapshot `sanity-published` existente, sin usar datos privados de preview ni modificar el catálogo. Actualizadas 30 páginas generadas, canónicas e históricas, de viaje y formulario.
- Adaptadas únicamente las expectativas de presentación afectadas en cinco archivos de pruebas. Añadidos siete casos de regresión en `scripts/trip-conversion.test.mjs`.

### Comprobaciones ejecutadas

- Base antes de editar: 146 pruebas aprobadas.
- Candidata final: 153 pruebas aprobadas, cero fallos, `node --test` con el [reporter compacto](report-tests.mjs).
- `npm run check`: PASS, 40 páginas, enlaces/anclas/recursos locales, JavaScript, snapshot, estados, URLs, consultas por fecha y noindex.
- `git diff --check` sobre los archivos afectados existentes: sin errores.
- Revisión de navegador final: 320×740, 390×844, 768×1024 y 1440×900 en Marruecos, Maldivas y Hossegor (12 combinaciones); sin desbordamiento horizontal y acción inicial dentro de la pantalla. Las listas de spots/actividades no requieren scroll lateral.
- Pantalla adicional 320×568 con título largo Marruecos avanzado: sin desbordamiento, dock disponible.
- Galería: teclado Right avanza a 2/6, Escape cierra y retorna el foco al botón de fotos.
- Menú móvil: apertura y Escape verificados.
- Selector Maldivas: dos PDF y dos enlaces de inscripción independientes. Escape devuelve foco; segunda salida llega al formulario con 28/03–04/04/2027 y categoría Brevo `8`.
- Formulario vacío: permanece en paso 0, foco en NOMBRE, `validity.valueMissing=true`; no se enviaron datos a Brevo ni mensajes a WhatsApp.
- Ancla de precio final: encabezado a 181 px, por debajo de cabecera de 78 px; dock visible y dossier de salida única visible en móvil; términos de pago de salida única en lectura abierta.
- Contrastes medidos en pares principales: acción naranja/tinta 4,90:1; texto principal/crema 16,47:1; texto secundario/crema 6,89:1. No constituye una auditoría completa de accesibilidad.

[Datos de navegador](trip-browser-qa.json), [móvil](trip-mobile.jpg), [escritorio](trip-desktop.jpg), [precio](trip-price-mobile.jpg), [selector de fechas](trip-dates-mobile.jpg), [formulario](trip-registration-mobile.jpg).

### Revisión independiente

Revisor separado, sin modificar implementación. Contrastó el diff con `before/`, consumidores y contratos. Reejecutó de forma independiente la suite final: 153 aprobadas. Se corrigieron y revalidaron:

1. Dossier de salida única accesible en contenido móvil.
2. Pago y avisos conservados aunque falten listas de inclusiones.
3. Botón de ampliación de fotos oculto en el fallback general sin JavaScript.
4. Estado global completo aplicado también al bloque económico de cada fecha, sin anunciar plazas ni inscripción.

Sin bloqueos pendientes en el alcance revisado. La revisión visual/interacciones fue realizada por el implementador; la revisión independiente cubrió fuente, consumidores, contratos y pruebas.

### Versión candidata revisada (SHA-256)

| Archivo | Hash |
| --- | --- |
| `scripts/render-trips.mjs` | `10346BBB5686119A486FE2B2AD0FCCC9D0879B379FF48DABC37FCFBBCC65BD1B` |
| `scripts/render-registration.mjs` | `67BB164B045E24CD7D5E6AC11347AD6DCFDC73E971813E4150071945EAE7F2DE` |
| `dist/trip-detail.css` | `B1E6478FEE4EC15A125F7BC9949CEF06817301FA1B2D977A4DF1611C1D097566` |
| `dist/trip-conversion.css` | `720C19272303F1013AFE868972832678DFCEF77765ED591FA21BADE3FD2D801C` |
| `dist/registration.css` | `917B6C2D8390BA499B4725382F0477CA5EB762CF5960117019AABC1B050B5A3C` |
| `dist/trip.js` | `828434004CC0F77C1DFA049F06A2B53BE2DB4BD5FFF0DB8CD7D6DF79C7A0B7CC` |

### Límites y operación

`npm run build` no conectó con Sanity y abortó sin sustituir el catálogo. Se ejecutó con éxito `node scripts/render-trip-pages.mjs` sobre el snapshot público existente, y después `npm run check` comprobó que las páginas corresponden a las plantillas actuales. Antes de un despliegue con contenido actualizado, repetir el build remoto habitual.

La vista de desarrollo mantiene el snapshot privado de promociones ya existente y lo identifica como `sanity-local-preview`; no se ha publicado ese contenido. Fotos provisionales conservadas por petición del usuario. Las condiciones de cancelación usan respuestas editoriales existentes o una consulta contextual, sin inventar políticas. El bloque de día se apoya en el plan existente, sin fijar horarios nuevos. La medición comercial en producción y el contenido definitivo corresponden a la siguiente fase.
