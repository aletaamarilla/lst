# Aplicación de la auditoría UX/UI del detalle de viaje · 30/10/2026

Implementación local terminada. Sin commit, push, publicación ni escritura en Sanity. Base Git `58f338661fc4705364fea08727c836e79b3f2048`, con cambios previos extensos conservados. Las copias en `before/` identifican la versión de trabajo anterior a esta tarea; [candidate-hashes.json](candidate-hashes.json) identifica los diez archivos de fuente/pruebas y las treinta páginas generadas de la candidata final.

## Decisiones y cambios

- El usuario confirmó conservar todos los datos obligatorios en la solicitud inicial. Se mantienen cinco pasos y el contrato completo de Brevo. Se aclaran los títulos y ayudas, la fecha seleccionada se resume con su precio y se puede cambiar; el CTA final dice «Enviar solicitud».
- La apertura explica el valor del viaje, muestra las fechas reales y resume inclusiones literales del mismo programa. Los gastos excluidos aparecen junto al primer precio y CTA. El enlace de gastos adicionales lleva al detalle completo.
- El selector permite comparar fecha, duración, capacidad máxima, precio, señal y acción en tarjetas compactas. Programa, PDF, pago y consulta propios de cada fecha siguen accesibles en los detalles. Las salidas completas o pendientes conservan consulta e información neutral.
- La navegación usa «Nivel y grupo», «Plan de surf», «Alojamiento» y «Precio e incluye». Rookies/Aprendices se alinean con la guía y el formulario, sin cambiar valores numéricos ni requisitos editoriales propios.
- Las inclusiones y exclusiones preceden al bloque completo de condiciones económicas. El ritmo del día ilustra exclusivamente actividades ya documentadas, sin fijar horarios o añadir sesiones.
- Se amplía la lectura principal a 16 px y la información comercial de apoyo. La señal lateral pierde peso visual y el testimonio existente incorpora contexto. Fotos y datos comerciales actuales conservados.

## Criterios y evidencia

| Criterio | Evidencia final |
| --- | --- |
| Inclusiones y gastos visibles antes del contenido largo | Apertura de Marruecos/Maldivas, nuevas pruebas y capturas de escritorio/móvil |
| Comparar ambas fechas sin recorrer una ficha completa | Maldivas 390×844: ambas fechas y botones visibles en el mismo selector |
| Acción inicial accesible y sin desbordamientos | 12 combinaciones: Marruecos, Maldivas y Hossegor a 320×740, 390×844, 768×1024 y 1440×900; CTA de 48 px dentro de pantalla en todas |
| Pantalla corta y título largo | Marruecos avanzado 320×568: sin desbordamiento; barra de solicitud visible |
| Fecha/PDF/pago/consulta aislados por salida | Pruebas de estados y condiciones; inspección de los dos PDF y términos de Maldivas |
| Teclado y selección | Escape cierra el selector y devuelve foco a «Elegir fecha»; cambiar la fecha en el formulario actualiza categoría, fecha y precio, pliega opciones y lleva el foco al resumen |
| Solicitud completa conservada | Revisión independiente: manifiestos idénticos de controles en las 15 rutas canónicas e históricas |
| Validaciones y navegación | Campos vacíos bloquean paso 0 con foco en NOMBRE; 31-02-1995 bloquea paso 1; recorrido de los cinco pasos con datos sintéticos locales, sin enviar |

- Base antes de editar: 153 pruebas aprobadas con acceso a localhost y temporales. La misma base fallaba en sandbox restringido por EACCES/EPERM; se contrastó antes de cambiar código.
- Candidata final: **160 pruebas aprobadas, cero fallos**, [registro completo](tests.log).
- `node scripts/render-trip-pages.mjs`: treinta páginas regeneradas desde el snapshot público existente; catálogo intacto.
- `node scripts/check.mjs`: **PASS, cuarenta páginas**, enlaces, anclas, recursos, JavaScript, catálogo, estados y coherencia de plantillas; [registro](check.log).
- [Revisión independiente de código y compatibilidad](independent-review.md), sin bloqueos. La mejora opcional del enlace de gastos adicionales quedó resuelta y revisada.
- [Datos de navegador](browser/browser-audit.json), [escritorio](browser/viaje-desktop.png), [móvil](browser/viaje-mobile.png), [fechas](browser/fechas-mobile.png), [formulario](browser/solicitud-mobile.png) y [programa](browser/programa-desktop.png).

## Límites

La comprobación de navegador se hizo sobre la previsualización local, que conserva los datos privados de promociones ya presentes. Las páginas regeneradas usan exclusivamente `sanity-published`. No se ha ejecutado una actualización remota del catálogo ni un despliegue.

El comprobador automatizado completo de navegador del formulario no pudo arrancar en WSL porque no está instalado Playwright. Las interacciones anteriores se comprobaron directamente en navegador; no se atribuyen a ese script. No se ha enviado información a Brevo ni mensajes a WhatsApp. La recepción real del formulario y el backend externo no se han probado en esta tarea. Tampoco se declara una auditoría completa de accesibilidad ni validación de texto al 200 %.

Las fotos definitivas y la concreción comercial de plazos de pago/cancelación requieren material o decisiones del equipo. Se mantiene la información existente y se facilita su consulta, sin inventar servicios, políticas, disponibilidad o testimonios.
