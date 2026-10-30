# Niveles: retirada de evaluación y tarjetas compartidas · 25/10/2026

Candidata local sin commit de aletaamarilla/lst sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048, con trabajo previo y concurrente conservado. candidate.sha256.json identifica los archivos finales; base.sha256.json registra el comienzo de esta revisión. No se publica ni despliega.

## Cambio solicitado

Se retira la evaluación completa: sección, acceso, módulo JavaScript, reglas CSS, dos scripts de pruebas/verificación y entrada del comprobador. El acceso de portada conduce directamente a las cuatro fichas estáticas. Se eliminan además las carpetas de evidencia y builds generadas por las dos iteraciones de esta evaluación; no se modifican archivos históricos de otros trabajos.

Los viajes de niveles se generan con renderHomeTrip, el mismo componente utilizado por home y catálogo. Niveles pide la variante compacta de home, un encabezado h4 y un prefijo de IDs propio. Solo añade los metadatos que necesita su filtro y los grupos de salidas confirmadas/destinos pendientes. No conserva plantilla ni CSS propios de la tarjeta. La cuadrícula, fotografía, fechas, precio, promociones y controles vienen del componente y de home.css. El renderer compartido no cambia respecto al comienzo de la revisión.

El controlador de fechas de home se reutiliza mediante importación desde levels.js. Una exportación mínima cierra las tarjetas ocultadas y limpia su estado fijado, permitiendo abrirlas de nuevo con una sola activación. El comportamiento existente de home y catálogo se conserva. Se adaptan los dos consumidores de comprobación que esperaban que toda la tarjeta fuese un enlace; ahora consultan el enlace nativo dentro del artículo.

## Criterios comprobados

| Criterio | Evidencia |
| --- | --- |
| Retirada del código activo y referencias | Archivos ausentes y búsqueda sin coincidencias en dist, scripts, package y README. |
| Misma tarjeta de home | Comparación de estilos computados, datos, precios/promociones, imagen y fechas; renderer compartido idéntico al baseline. |
| Filtros y navegación conservados | Cuatro niveles, consulta, URLs, historial y colecciones pendientes comprobados. |
| Fechas utilizables tras filtrar | Abrir/fijar, ocultar tarjeta, volver a mostrar y abrir con la primera activación. |
| Móvil y accesibilidad | 320/390/768/1024/1440, texto al 200 %, teclado, Escape y foco, controles táctiles y sin JavaScript. |
| Compatibilidad de generación | Catálogo vacío, datos opcionales, destinos retirados, rutas y build de catálogo publicado. |

## Validación

- Base: 77 pruebas PASS y comprobador de 24 páginas PASS, guardados en tests-base.txt/check-base.txt.
- Final: 70/70 pruebas PASS (tests.txt). Se retiran las 9 de la evaluación y se añaden 2 de integración de las tarjetas al conjunto existente de home.
- Comprobador estático: 24 páginas PASS (check.txt).
- Build aislado con Sanity publicado y check PASS (build.txt), sin sustituir dist mediante build.
- Navegador del componente compartido: browser/results.json. Comparación de estilos, filtros/historial, promociones, 18 fechas, pin, teclado, tacto y ausencia de JS. Las capturas shared-cards-390/1440 ocultan cabecera fija y skip-link únicamente durante el recorte del componente para evitar artefactos de captura.
- Integración: 220 aserciones de navegador PASS a 320/390/1440, con catálogo vacío, URLs, filtros/historial, fechas, galería/foco, recursos opcionales y consultas interceptadas. Capturas en integration/.
- Revisión independiente final: revision-independiente.md. Sin bloqueos identificados dentro de este alcance.

La primera ejecución del nuevo comprobador elegía la primera tarjeta de la home en vez del ID de la tarjeta de prueba; se corrigió para que la ordenación por fechas no altere el escenario. La evidencia final corresponde al selector por identidad. No se atribuye precisión funcional al número de aserciones: los escenarios anteriores delimitan lo comprobado.

No se cambian datos comerciales ni contratos de las fichas o del CMS. No se envían mensajes o solicitudes externas. Las pruebas visuales son Chromium local; no incluyen dispositivos físicos o Safari. La preparación para desplegar otros cambios del árbol queda fuera de esta revisión.
