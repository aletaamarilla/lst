# Inscripción por pasos · 25/10/2026

Rediseño local terminado. Sin commit, push ni publicación. Base `58f338661fc4705364fea08727c836e79b3f2048` con trabajo previo conservado: [estado inicial](initial-status.txt), [copias y hashes iniciales](base.json), [diff de esta tarea](task.patch), [alcance y hashes finales](version.json). Se modifican la plantilla común, JS/CSS y dos archivos de pruebas; se regeneran únicamente las quince páginas de inscripción de siete viajes y sus alias. El snapshot comercial queda idéntico. Se conserva la separación previa de Marruecos general y avanzado y las dos fechas de Maldivas.

## Diseño y recorrido

Una sección visible con cinco pasos: viaje/contacto, datos personales, surf/material, acompañantes/camiseta y últimos detalles. La composición reutiliza Aura, Work Sans, Space Mono, papel crema, tinta y naranja; fotografía real y titular del destino a la izquierda en escritorio, contexto compacto en móvil. Se retiran los paneles anidados del diseño anterior y se usan campos planos, opciones claras y una sola acción principal.

El progreso muestra el paso actual y permite volver a pasos visitados. Continuar y Enter validan solo el paso visible; Atrás conserva las respuestas. El envío final vuelve a validar todo y muestra el primer paso pendiente. Los errores de Brevo sobre un campo anterior hacen visible su paso y quedan asociados al campo. Durante el envío se bloquean navegación y duplicados. Tras el éxito se muestra confirmación y se oculta el formulario.

Los pasos ocultos conservan todos sus controles habilitados y sus valores para FormData. No se añade almacenamiento local, persistencia en URL ni nuevos envíos. Se mantienen action, nombres/categorías, obligatoriedad, parámetros de fecha, alias, estados no disponibles y consultas WhatsApp. Sin JavaScript se muestran los cinco apartados y se conserva el POST y validación nativos.

## Validación

- Base: 100 pruebas y 40 páginas correctas antes de editar.
- [101 pruebas PASS](tests.txt): contratos, estados, fechas/alias, generación y retirada, preview, y estructura progresiva del formulario.
- [40 páginas PASS](check.txt): generación vigente, rutas, enlaces, anclas, recursos y sintaxis. No se modifica TypeScript ni el esquema de Studio.
- [368 aserciones de navegador](browser/results.json): siete viajes a 320/390/768/1440 px; cinco pasos en cada ancho; 200% de texto; teclado/Enter/foco; retroceso con datos; bloqueo de avances inválidos; errores de campos anteriores; payload de pasos ocultos; éxito, errores de red/HTTP/JSON, redirecciones y doble envío; fechas, alias y POST sin JS.
- [Revisión independiente](revision-independiente.md): 101 pruebas, 40 páginas, 368 aserciones del comprobador y 29 escenarios propios correctos. Sin bloqueos conocidos dentro del alcance.

Capturas finales: [móvil paso 1](browser/el-palmar-390-step1.png), [móvil surf](browser/el-palmar-390-step3.png), [escritorio paso 1](browser/el-palmar-1440-step1.png), [escritorio último paso](browser/el-palmar-1440-step5.png). [Página de viaje usada como referencia](trip.png) y [formulario anterior](before.png). Las capturas automáticas sustituyen únicamente la foto CDN por un asset local; las capturas iniciales step1-* y la referencia usan las imágenes reales.

La revisión visual detectó un anuncio para lector de pantalla que se veía duplicado: se corrigió con recorte accesible y se añadió una aserción en cada paso. Las capturas completas se toman desde scroll cero para evitar que Chrome componga el enlace fijo de salto fuera de pantalla dentro de la imagen; su posición real fuera de vista se comprueba en cada paso. No se oculta el enlace al recibir foco.

## Límites

Chrome local, sin dispositivo Safari/iOS físico. Todas las peticiones externas del comprobador se interceptan; no se crean contactos reales ni se valida la configuración de la cuenta de Brevo. Esta tarea conserva la integración previa y no cambia sus límites: disponibilidad editorial, ausencia de inventario/pago y páginas de éxito HTML personalizadas fuera de alcance. El contenido no se refresca del CMS durante este rediseño. El constructor se ejerce en las pruebas de integración y las páginas se regeneran desde el snapshot público inicial sin cambios comerciales.
