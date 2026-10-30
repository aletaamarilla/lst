# Extensión de la dirección visual de LST · 30/10/2026

Base Git: 58f338661fc4705364fea08727c836e79b3f2048, con trabajo previo sin commit. Copia inicial completa de dist y scripts en artifacts/brand-rollout-before (local, ignorada). No se publica.

## Criterios de aceptación
- FAQs: entrada propia sin fotografía repetida, cuatro temas reconocibles con iconos del mismo trazo que Plan de surf, ocho preguntas y respuestas intactas, details nativos independientes, ayuda y contacto originales.
- Paleta crema/negro y naranja contenido; Aura en titulares, Work Sans en lectura, Space Mono en etiquetas. Composición adaptada a cada función.
- Conservar rutas, enlaces, formularios, validaciones, precios, fechas, disponibilidad, selector de salidas, galería y WhatsApp circular móvil. No menú secundario flotante.
- Revisar escritorio, móvil y 320 px: overflow, teclado/foco, áreas táctiles, cabecera y barra de reserva.
- Ejecutar test/check/build sin sobrescribir contenido comercial previo; comparar contratos y revisar diff contra copia inicial. Revisión independiente de candidata final.

## Estado
Revisión previa en navegador integrado: home, catálogo, niveles, Conócenos/equipo, FAQs, inscripción y fichas El Palmar, Marruecos, Maldivas; escritorio 1440 y móvil 390. Capturas before-* conservadas. La sesión antigua 4175 tenía módulos de plantillas anteriores; se usa http://localhost:4176 con código actual.

## Decisiones
Conservar portada, calendario, fotografías documentales, niveles, historia y testimonios existentes. Reducir grandes superficies naranjas en catálogo, niveles y contactos. Mantener detalle aprobado, sus iconos y sus procesos. FAQs mantienen el contenido incluso donde describe la consulta por WhatsApp: esta tarea es visual.

## Resultado y corrección de dirección
La primera pasada contenía demasiado los gestos gráficos. Tras la indicación del usuario se recuperaron el titular inclinado, la postal con sombra y el sello LST del catálogo; el bloque de comunidad oscuro y las FAQs compactas originales de la home; el acento naranja de Aprendices; y un cierre propio, tipográfico, para Conócenos. La personalidad se apoya en estas composiciones y en las fuentes originales. No se añaden fotografías.

Cambios de producto: 13 archivos identificados por SHA-256 en candidate.json. Incluyen ocho CSS existentes, cuatro HTML (FAQs, catálogo, niveles, Conócenos) y la actualización del comprobador de FAQs. No hay cambios de JavaScript funcional, plantillas de viajes/inscripción, datos ni dependencias. task.diff separa esta tarea del trabajo previo.

- FAQs: portada tipográfica en crema, cuatro categorías con SVG de trazo 1.7 coherente con Plan de surf, respuestas espaciadas, signos +/− y foco de alto contraste. Los ocho details y sus respuestas/enlaces son idénticos a la copia inicial (contracts.json).
- Home: portada, tarjetas, niveles, reseñas y reserva conservados; bloque de comunidad con contraste y foto documental original.
- Catálogo: crema principal, gesto de cartel y postal conservados; filtros, fechas, enlaces y cifras intactos. Las promociones recuperan tipografía expresiva con menos superficie naranja.
- Niveles: cuatro capítulos diferenciados, índice negro con acento naranja y ayuda en dos partes; retirada únicamente la foto decorativa del cierre de orientación.
- Conócenos/equipo: historia y fotos conservadas; iconos útiles en los dos momentos de acompañamiento y cierre propio en crema.
- Inscripción: mismo formulario y cinco pasos; selecciones negras y foco visible. Cabecera y footer mantienen contenido, con áreas mínimas y enlaces del pie algo más legibles.
- Detalle aprobado conservado: sin cambios en plantilla ni estilos específicos; galería, Plan de surf, precios, disponibilidad, fechas y WhatsApp circular permanecen.

## Verificación final
- npm test: 185/185, repetido por revisor independiente.
- npm run check: PASS, 40 páginas, enlaces, recursos, anclas y coherencia de páginas generadas; repetido independientemente.
- node --check scripts/check-faqs.mjs: PASS. Su ejecución completa con Chromium externo no se realiza por la restricción de navegador del usuario. La revisión visual e interacción se hacen en el navegador integrado.
- Navegador integrado: 40 rutas en 320, 390 y 1440 px más siete rutas representativas a 768 px: 127 vistas medidas, sin desbordamientos horizontales detectados. browser.json.
- Contraste: 59 muestras de titulares, textos y controles de las superficies nuevas superan su umbral 4.5:1/3:1 según tamaño; contrast.json. La medición no pretende certificar texto sobre fotografía ni sustituir una auditoría completa de accesibilidad.
- FAQs a 320 px: salto al contenido, ocho aperturas independientes mediante Enter/Espacio, cierre de una conserva siete, foco visible de 3 px y anclas visibles bajo cabecera.
- Menú: teclado, Escape y retorno del foco; último enlace accesible también en 320×500.
- Barra de reserva: WhatsApp 44×44 con radio 50%, CTA 104×48 a 320 px; altura reservada en el documento. En 320×500 pasa a position:static con padding inferior 0. No reaparece menú secundario.
- Selector de dos fechas: abre, cierra por Escape, devuelve foco y enlaza a inscripción con la salida correcta.
- Inscripción recorrida hasta paso cinco con datos ficticios locales; validación de obligatorios y navegación atrás conservadas. No se pulsa Enviar solicitud, no se realizan pagos ni se envían mensajes.
- Revisión independiente de código/cascada/compatibilidad sobre candidate.json, sin hallazgos accionables ni bloqueos. La evidencia de navegador pertenece al agente principal.

## Limitación y vista local
El build contra Sanity se intentó con salida aislada en artifacts/brand-rollout-build y falló por conexión, antes de sustituir salida. El mismo código inicial, en artifacts/brand-rollout-before, reproduce exactamente el fallo (build.log y baseline-build.log). El check del snapshot público actual pasa; no se ha refrescado contenido comercial remoto. No se declara verificado un build con datos nuevos de Sanity.

Vista local disponible: http://localhost:4176/preguntas-frecuentes/ . Usa la previsualización local preexistente de promociones y las plantillas actuales. El servidor previo 4175 se conserva, pero sus módulos estaban cargados de una versión anterior. No se ha publicado, desplegado ni hecho commit.
