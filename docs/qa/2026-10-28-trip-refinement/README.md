# Ajustes del detalle de viaje · 28/10/2026

Implementación local terminada y revisada, sin commit, push ni publicación. El árbol ya contenía cambios de tareas anteriores; se conserva ese trabajo. Base Git: 58f338661fc4705364fea08727c836e79b3f2048.

## Alcance identificable

[Manifest de la candidata](candidate-sha256.json): 22 archivos, siete fuentes/pruebas y 15 HTML generados. [Diff exclusivo de fuentes](task-source-diff.patch), [estado previo](git-before.txt), [copias previas](before/). La revisión independiente identifica la misma versión en su manifest.

- El párrafo de destino utiliza todo el ancho disponible de lectura.
- La pregunta pasa a «¿Es este tu viaje?» y cabe en una línea entre 320 y 1440 px. Se conservan los perfiles y la guía, retirando la introducción/objetivo redundantes y la consulta de nivel.
- El requisito común de autonomía se conserva con cualquier número de perfiles. Solo se omite la frase introductoria exacta y redundante de Marruecos I–II; cualquier requisito nuevo vuelve a mostrarse. No se alteran datos del CMS.
- Retirados los desplegables «Ver el programa completo» y «Sobre este viaje». Los viajes sin resumen de surf conservan su único programa visible.
- Retirado el aviso concreto de imágenes de ejemplo. Se conservan las fotografías y sus textos alternativos; otros avisos editoriales siguen funcionando.
- Inscripción con texto y acciones separados, apilados en móvil y en dos columnas desde 600 px; nota de confirmación y condiciones en un bloque propio.
- Ficha lateral con nombre/estado, precio, fechas/nivel, inscripción principal y un grupo secundario de dossier/WhatsApp. Se conserva la navegación por secciones y el dock móvil.
- Restaurada la paleta documentada de LST: naranja #EA5934, crema #FFFAE7 y tinta #1B1B1B; WhatsApp conserva su verde funcional. Hover y foco con contraste.

Referencias de composición consultadas: [Travelhood](https://travelhood.es/destino/maldivas/) y [Aleta Amarilla](https://www.aletamarilla.com/viajes-de-buceo/bali-penida-volcanes-mantas).

## Evidencia

- [Base](tests-before.txt): 132/132 pruebas.
- [Final](tests-final.txt): 137/137 pruebas, incluidos escenarios de retirada de duplicados, programa antiguo, avisos editoriales y requisitos con varios perfiles.
- [Check](check.txt): 40 páginas correctas; coherencia con el renderer, enlaces, anclas, recursos, WhatsApp contextual, catálogo, estados y sintaxis.
- [Generación](generation.txt): 15 rutas desde el snapshot publicado existente. No se ha ejecutado una actualización remota del catálogo; se conserva su contenido byte a byte.
- [Compatibilidad de datos](data-compatibility.json): nueve archivos protegidos sin cambios, incluido snapshot publicado, promociones privadas locales, modelos, adaptador, agrupación, integración Brevo, JS de viaje y estilos compartidos.
- [Navegador](browser/trip-responsive-qa.json): siete viajes × 320/390/768/1024/1440 px, sin overflow global; párrafo de ancho completo, pregunta en una línea, acciones de al menos 44 px, dock/sidebar en su breakpoint y colores de marca calculados correctos.
- [Recorridos](browser/trip-interactions-qa.json): inscripción de fecha única, apertura de dos fechas desde dock, PDF propio por fecha, Escape y retorno de foco, selección de la segunda fecha e inscripción con esa fecha marcada.
- [Revisión independiente](independent-review.md): dos hallazgos corregidos y comprobados sobre la candidata final: restricción de autonomía con varios perfiles y contraste del hover. Sin bloqueos pendientes en el alcance revisado.

Capturas: [detalle escritorio](browser/trip-detalle-final-desktop.png), [niveles móvil](browser/trip-niveles-final-mobile.png), [inscripción escritorio](browser/trip-inscripcion-final-desktop.png), [inscripción móvil](browser/trip-inscripcion-final-mobile.png).

## Vista y límites

[Previsualización final](http://127.0.0.1:4179/viajes/marruecos/#destino). La copia temporal de QA en el directorio de visualizaciones contiene los archivos finales y las promociones de la vista local; es independiente de producción. Se preparó tras fallos intermitentes de acceso y conexión entre Windows y WSL. Las 35 comprobaciones finales se repitieron sobre esa copia estable; las lecturas prematuras o fallidas anteriores no se contabilizan como validación.

No se han enviado formularios, mensajes ni pagos. No se ha desplegado la web ni modificado Sanity, el esquema o los datos comerciales. Esta revisión comprueba composición y recorridos locales; no acredita publicación ni mide conversión.
