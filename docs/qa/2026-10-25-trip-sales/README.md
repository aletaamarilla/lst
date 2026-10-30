# Detalle de viaje orientado a venta · 25/10/2026

Implementación local sin commit, push, despliegue ni escritura en Sanity. Base Git compartida: `58f338661fc4705364fea08727c836e79b3f2048`; ya existía un diff amplio y archivos nuevos al empezar. La versión concreta de esta tarea está identificada en [candidate-sha256.json](candidate-sha256.json). Copias previas del renderer y del CSS en `before/`.

## Resultado y criterios

- Foto de portada ocupa desde el borde superior, también detrás del header. Logo blanco y menú legible al inicio; fondo crema y logo oscuro al desplazarse.
- Navegación compartida con Viajes, Niveles, Conócenos, FAQs y Hablamos; reutiliza app.js, teclado, Escape y menú móvil. La acción de inscripción sigue disponible.
- Recorrido comercial: destino/fecha/nivel/precio; propuesta editorial y diferenciales; fotografía real; requisitos; programa; alojamiento y acompañamiento; incluido/no incluido; preparación; FAQs y solicitud de plaza. Precio y consulta accesibles mediante sidebar o dock.
- Contenido adaptado a los siete viajes; no se inventan horarios diarios, hoteles, garantías, reseñas, plazas restantes ni servicios que no consten en el programa. El alojamiento sin foto usa un bloque compacto. La galería de una sola foto ocupa el ancho disponible.
- Conservados rango fijo, autonomía, programas distintos de Marruecos, precios y ofertas por fecha, estados pendientes/completos, capacidad, condiciones de pago, Brevo, WhatsApp, URLs históricas y PDFs específicos de cada salida. Solicitar plaza no confirma reserva.
- Las anotaciones internas de páginas del PDF se eliminan de la presentación conservando las restricciones. Se reemplaza la antigua recomendación de precio actual de vuelos de Maldivas; snorkel opcional solo donde lo explicita la oferta, sin prometer fauna.

## Fuentes y dirección visual

Se contrastaron ocho dossiers (101 páginas) mediante el inventario `docs/sanity/2026-10-23/salidas.json` y hojas de contacto `docs/sanity/2026-10-23/visual/`. Los servicios se obtienen del modelo vigente, no de una oferta histórica por defecto. Diferencias: Palmar tres grupos/pensión completa; Hossegor coaching y autonomía; Marruecos material de iniciación frente a tabla propia/alquiler en avanzado; Fuerteventura dos cenas libres; Senegal comidas aparte y noche en Lompoul; Maldivas barco y snorkel opcional.

Referencias de experiencia comercial revisadas: [Aleta Amarilla](https://www.aletamarilla.com/viajes-de-buceo/bali-penida-volcanes-mantas) y [Travelhood](https://travelhood.es/destino/maldivas/). Se toma la claridad de decisión, la fotografía, los diferenciales y el recorrido hacia reserva, conservando identidad LST (Aura, Work Sans, crema, tinta y naranja).

## Validación

- [tests.txt](tests.txt): 123/123 pruebas pasan en WSL, incluidos nuevos casos de diferencias por destino y regresiones de contratos.
- [check.txt](check.txt): 40 páginas, enlaces/anclas/recursos, catálogo publicado, contacto, estados, JavaScript y coherencia generada correctos.
- [regenerate.txt](regenerate.txt): 15 rutas de detalle regeneradas desde `dist/catalog-snapshot.json`, fuente `sanity-published`. No se alteró el snapshot ni se incorporaron borradores al resultado publicable.
- [browser-qa.json](browser-qa.json): comprobación directa con navegador. Siete destinos a 320 px sin desbordamiento; Maldivas a 320/768/1024/1440 con imagen completa detrás de header. Menú, galería, fechas/PDFs/URLs de inscripción, Escape y retorno de foco comprobados. Programa queda visible bajo el header. Consola sin errores en el recorrido.
- [independent-review.md](independent-review.md): revisión independiente de implementación/compatibilidad; distingue sus pruebas propias de la revisión visual del implementador.

## Límite operativo

`npm run build` intentó leer Sanity, pero no pudo conectar (ver [build.txt](build.txt)); conservó el catálogo. Por eso se regeneraron únicamente las páginas afectadas desde el snapshot publicado existente y se comprobó su coherencia con el renderer final. El build completo con lectura remota sigue pendiente antes de desplegar. La vista local usa las promociones privadas que ya existían, con servidor de desarrollo reiniciado en puerto4175. No se enviaron inscripciones ni mensajes comerciales. El efecto sobre ventas requiere medición en producción.
