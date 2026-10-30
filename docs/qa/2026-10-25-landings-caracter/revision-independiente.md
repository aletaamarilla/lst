# Revisión independiente · carácter de las landings · 25/10/2026

Revisión de solo lectura del producto sobre la base exacta before/, HEAD 58f338661fc4705364fea08727c836e79b3f2048, con cambios previos conservados. Archivos inspeccionados: HTML de Conócenos/FAQs, about.css, faq.css, landing.css y contratos de navegación/app.js. independent-final-results.json identifica la candidata del barrido completo con la protección común de ambos h1. independent-caption-links-final.json identifica por hashes la versión posterior con reserva de pie de foto en em y subrayado explícito de enlaces, y registra las comprobaciones específicas de esos últimos ajustes. La normalización posterior de saltos de línea no altera el CSS/HTML revisado.

## Conclusión

Sin bloqueos observados tras las correcciones dentro del alcance comprobado. La voz tiene más carácter que la base y mantiene utilidad, hechos y límites comerciales. El contraste de ambos titulares, el solapamiento preexistente de pies de foto y la identificación visual de enlaces abiertos quedaron comprobados sobre sus correcciones.

## Voz y contenido

«El together va en serio» vincula la voz con el nombre de marca y explica el valor del grupo. La historia de Marruecos, el surfskate de Cádiz y el texto antes de hacer la mochila aportan contenido concreto. El lenguaje cercano, los títulos de Aura y las escenas con distinta alineación dan un ritmo más reconocible. La eliminación del párrafo repetitivo de bienvenida conserva la idea y reduce reiteración. Esta valoración de diseño no demuestra preferencia del usuario.

La cronología de Lucas, el año de preparación y el arranque a finales de 2024 se respaldan en docs/content-inventory.json y la base. La foto de Marruecos de 2025 se identifica como posterior al origen. La página conserva niveles, programas por salida, acompañamiento pendiente y consulta distinta de confirmación de plaza. No atribuye caras o funciones actuales a Lucas, promete amistad/progreso ni introduce servicios o compromisos ambientales concretos.

Las ocho preguntas FAQ y los destinos de enlaces de sus respuestas se conservan. La voz de las respuestas cambia manteniendo nivel, material, traslados antes de billetes, necesidades alimentarias, condiciones por salida y confirmación con el equipo. También se revisó la aclaración «costumbres del lugar».

## Hallazgo corregido

[P2] El naranja del nuevo h1 de Conócenos perdía contraste sobre zonas claras de la fotografía. A 390 px se detectaron 382 de 8.735 píxeles interiores naranja por debajo de 3:1; ejemplo (65,262): RGB234,89,52 / fondo RGB155,136,113, ratio 1,03:1. A 1440 el mínimo era 2,23:1. independent-about-low-contrast.json registra ese diagnóstico anterior a la corrección.

La banda tinta común de landing.css protege ahora los acentos de ambos h1 y se clona en saltos de línea. Medición final: mínimo 4,82:1 y habitual 4,90:1 tanto en Conócenos como en FAQ, a 390 y 1440 px. Se comparan capturas con texto y solo su tinta transparente, manteniendo fondos y geometría, y se filtran píxeles interiores del naranja con diferencia respecto al fondo. No se oculta la banda durante la medición. No es una auditoría WCAG completa.

## Evidencia final independiente

- independent-final-results.json: 24 vistas de Chromium, ambas páginas  × 320/390/768/1440 px  × normal/texto200/sinJS. Sin errores JavaScript ni desbordes de documento o internos en main.
- Las ocho respuestas abren con Enter y permanecen abiertas; se mide también la geometría abierta. Menú móvil y Escape comprobados conJS. Cabecera fixed conJS, sticky sinJS y visible tras scroll.
- Preguntas FAQ y destinos de enlaces conservados. El HTML de respuestas cambia por la reescritura autorizada, no se presenta como texto idéntico.
- independent-zoom-final.json: dos vistas adicionales a 320  y texto200, tras la banda común. Sin desbordes. Se inspeccionaron visualmente los heroes, con las palabras partidas cuando el tamaño de fuente lo exige, sin recorte de texto.
- Inspección visual de aperturas móviles de ambas páginas y composición completa de Conócenos a 1440. Las suites del implementador son evidencia separada.

## Últimas correcciones comprobadas

El solapamiento de pies de foto con texto al 200 % a 320 px ya existía en la base: 13 px en Conócenos y 21 px en FAQ. Se contrastó con before/ bajo condiciones equivalentes. La reserva inferior relativa al texto corrige la causa: en la candidata actual hay 51 px de separación en Conócenos y 35 px en FAQ, sin solapamiento. independent-caption-comparison.json registra los cuatro casos base/candidata; independent-caption-links-final.json registra la candidata final y sus hashes.

También se comprobó un enlace de respuesta abierto a 320 px, en normal, texto200 y sinJS: visible, destino /conocenos/#asi-viajamos conservado, textDecorationLine=underline en los tres casos. La regla body.faq-page .faq-answers a gana al reset de home-modern. El enlace conserva su semántica nativa y no depende solo del color para ser reconocible.

La repetición completa de 24 vistas precede a estas dos últimas correcciones acotadas; los cuatro casos de pie de foto y los tres casos de enlace son ejecución independiente posterior sobre los hashes actuales. Las suites completas posteriores del implementador son evidencia separada.

La longitud de Conócenos en móvil sigue siendo considerable, sin recorte o lectura bloqueada por esa longitud. Otras reducciones de relato serían preferencias de ritmo, no defectos demostrados.

Límites: Chromium local, sin Safari/iOS físico ni auditoría completa de accesibilidad. Sin modificar implementación, publicar, enviar consultas ni atribuir validación de conversión comercial.

