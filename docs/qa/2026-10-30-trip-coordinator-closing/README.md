# Portada contenida, coordinador y cierre · 30 octubre 2026

Iteración local solicitada por el cliente. Base Git: `58f338661fc4705364fea08727c836e79b3f2048`, con amplio trabajo previo sin commit. La base exacta de esta iteración se conserva en `before/`; no equivale al HEAD. `template.diff` y `style.diff` delimitan los cambios de implementación, y `candidate.sha256` identifica la versión final sin commit.

## Requisitos y resultado

- Portada más pequeña y completa: encuadre con `contain`, proporción del archivo y altura máxima de 520 px o 52svh. Marco sobre crema, controles de galería conservados. En móvil mantiene su proporción natural.
- Retirado el bloque principal «Pago y confirmación de la plaza / Cambios y cancelación» indicado en la captura. Sus datos no se borran del modelo. Precio y señal siguen en tarjeta/dock; las condiciones de las salidas múltiples continúan en su modal y alternativa sin JavaScript. Los avisos propios, PDF e inclusiones/exclusiones se conservan; las respuestas editoriales de cancelación siguen en FAQ. Enlaces internos retargeteados a inclusiones; ancla histórica `#condiciones` conservada sin panel visible.
- Lucas identificado como «COORDINADOR DEL VIAJE / Lucas, tu coordinador.», persona de referencia del grupo. Los servicios de enseñanza siguen citados como servicios del programa. No se asigna ese rol a otros equipos editoriales ni a destinos pendientes. El cliente confirmó dejarlo sin foto por ahora: no se añadió retrato ni imagen provisional.
- Inclusiones con superficie cálida, exclusiones delimitadas, FAQ con mayor jerarquía y cierre naranja con CTA negro y tres pasos crema. El principio mantiene la dirección editorial aprobada.
- Títulos largos ajustados en móvil para que Fuerteventura no se divida dentro de la palabra a 320 px.

## Alcance de archivos

Implementación: `scripts/render-trips.mjs`, `dist/trip-conversion.css`. Actualización de nueve archivos de pruebas para la retirada explícita del panel y el nuevo rol; se añadió un caso para el título genérico anterior de Lucas y la conservación del texto editorial. Se regeneraron 15 detalles y 15 formularios desde el snapshot público existente; no hubo cambios intencionales de formularios. No se modificaron CMS, catálogo, JavaScript de interacción, promociones ni precios.

## Evidencia

- Base: 174/174 pruebas en `baseline-tests.log`.
- Candidato: 175/175 pruebas en `tests.log`.
- `render.log`: 30 páginas regeneradas desde `sanity-published`, sin consulta/escritura al CMS.
- `check.log`: PASS de 40 páginas, rutas, anclas, recursos, catálogo publicado, datos opcionales, fechas, JavaScript y noindex.
- Revisión independiente: registrada en `independent-review.md`; hay que contrastar sus huellas con `candidate.sha256`.

Comprobaciones reales en navegador realizadas por el implementador en `http://localhost:40091`, con capturas mostradas durante el trabajo:

| Vista | Evidencia observada |
| --- | --- |
| Marruecos 1440×1000 | Portada 780×520 px, `contain`; foto completa y datos iniciales visibles en la primera pantalla; sin desbordamiento horizontal. Inclusiones diferenciadas, tarjeta de reserva conservada y cierre naranja con CTA negro. |
| Marruecos 390×844 | Portada de 229 px de alto, `contain`; ficha breve debajo. Lucas sin imagen y rol visible. Pasos apilados, aviso de solicitud y enlace final legibles al desplazarse; no desbordamiento. |
| Fuerteventura 320×740 | Título a 36 px en una línea, sin partición de palabra ni desbordamiento; portada de 216 px de alto con `contain`. |
| Maldivas 390×844 | Dos salidas con señal de 500 €. Al desplegar «Programa y condiciones / Condiciones de pago», se conserva el texto literal del resto un mes antes del viaje. Solicitar la segunda fecha abre `/inscripciones/maldivas/?salida=maldivas-2027-03-28` con `VIAJE_SURF=8` seleccionado. No se envió formulario. |

La revisión visual es del implementador; el revisor independiente no dispuso de navegador. No se han realizado pruebas con usuarios ni publicación/despliegue. La vista previa usa las promociones locales ya existentes; la generación estática usa únicamente el catálogo público. Las capturas se observaron en la herramienta, sin archivo exportado de captura.
