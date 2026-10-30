# Conócenos y FAQs: estilos de la home · 25/10/2026

Candidata local sin commit ni publicación sobre HEAD `58f338661fc4705364fea08727c836e79b3f2048`. Se conserva el árbol previamente modificado. `before/` contiene la base exacta de esta tarea; `task.patch` delimita sus cambios y `candidate.sha256.json` identifica los cinco archivos finales y la hoja de estilos compartida de referencia.

## Resultado y criterios

Las dos páginas cargan `home.css` en lugar de `mobile.css` y usan `home-modern`: misma paleta crema/naranja/tinta, Aura, Work Sans y Space Mono, anchos de lectura, controles redondeados, cabecera y pie de la home. Conócenos conserva sus fotos completas y compone historia y acompañamiento en paneles. FAQs usa el mismo componente visual de preguntas de la home, manteniendo details/summary nativos y respuestas independientes. Los cierres usan fondo tinta, botones naranja y foco/hover legibles.

Se conservan exactamente los textos y destinos de enlaces e imágenes del contenido principal; también las anclas y consultas contextuales por WhatsApp. La cabecera es fija con JavaScript y sticky sin JavaScript, con navegación alternativa visible. No hay scripts de producto nuevos, dependencias, cambios de datos ni llamadas comerciales enviadas.

Archivos de producto: `dist/about.css`, `dist/faq.css`, `dist/conocenos/index.html`, `dist/preguntas-frecuentes/index.html`. El único ajuste del comprobador `scripts/check-about.mjs` cambia la separación esperada del ancla de 12 a 20 px. No se modifica la home en esta tarea.

## Evidencia final

- `check.txt`: PASS, 24 páginas, enlaces/anclas/recursos, consultas WhatsApp, generación vigente, sintaxis y noindex.
- `tests.txt`: 77/77 pruebas PASS. La ejecución inicial dentro del sandbox falló al renombrar una carpeta temporal; repetición con acceso normal al temporal, sin cambios de código, PASS.
- `about-check.txt` y `about-browser.json`: 15 vistas y 225 comprobaciones PASS, 320/390/768/1024/1440, normal/texto200/sinJS, fotos completas, navegación, cabecera, teclado, anclas y WhatsApp interceptado.
- `faq-check.txt` y `faq-browser.json`: 15 vistas y 720 comprobaciones PASS; los mismos anchos/modos, ocho respuestas simultáneas, teclado, menú, anclas, consultas interceptadas y recorridos por 11 rutas.
- `capturas/`: escritorio y móvil finales de ambas páginas, más respuestas abiertas.
- `revision-independiente.md` e `independent-results.json`: revisión independiente de código, conservación de contenido y navegador. El único hallazgo, desbordamiento del índice FAQ al 200%, quedó corregido y comprobado en la versión final. Tras la revisión solo se normaliza el salto de línea final de los archivos; los hashes definitivos constan en candidate.sha256.json.

El check general pasó al inicio. Durante otro trabajo concurrente en la home falló temporalmente por una salida generada desactualizada; el mismo fallo no dependía de estas páginas. La ejecución final pasa cuando ese trabajo termina de regenerarla. No se reconstruye dist contra Sanity para un cambio de presentación en páginas estáticas; el comprobador final verifica que las salidas generadas están vigentes.

## Límites

Validación local en Chromium. No valida Safari/iOS físico ni constituye una auditoría WCAG completa. Sin commit, push ni despliegue.
