# Detalle con profundidad y reserva · 28/10/2026

Implementación local terminada, sin commit, push ni despliegue. Base Git 58f338661fc4705364fea08727c836e79b3f2048. Se conserva el trabajo previo.

[Versión final de 21 archivos](candidate-sha256.json): cinco fuentes/pruebas, un PNG nuevo y 15 fichas generadas. [Diff propio](task-source-diff.patch), [copias previas](before/), [Git inicial](git-before.txt).

## Resultado

- Fondos arena, ocre y terracota suaves; degradados discretos, acentos naranja y secciones diferenciadas. Retiradas las superficies blancas de tarjetas, ficha y dock.
- Lucas tiene un bloque destacado con retrato grande, título de mayor jerarquía, sus servicios originales y enlace al equipo.
- Sidebar de aproximadamente 525 px en Marruecos: nombre/estado discretos, precio por persona, fechas/nivel, señal, inscripción y dossier/WhatsApp breves. Sin «Explora el viaje».
- Señales del contenido existente: El Palmar y Fuerteventura 250 €, Hossegor 200 €, Maldivas 500 €, Marruecos 270 €, Senegal 325 €. La señal no se deduce del precio ni de promociones.
- Cada fecha conserva su pago. Solo se anuncia una señal común cuando todas las salidas abiertas confirmadas la comparten. Importes distintos/desconocidos remiten al selector. La ausencia del objeto de pago por fecha conserva el pago global antiguo; un objeto explícito vacío o nulo no hereda importes.
- Las salidas pendientes/completas muestran información neutral. Inscribirse sigue siendo una solicitud que confirma el equipo; no hay pago online nuevo.

## Imagen

[PNG del proyecto](../../../dist/assets/team/lucas-concept-ai.png), generado mediante la herramienta integrada image_gen. [Prompt completo y procedencia](imagegen.json).

Retrato ficticio provisional para probar el bloque; no es una fotografía verificada de Lucas. Alt y pie lo indican. No se asigna a un equipo diferente ni a acompañamiento pendiente.

## Evidencia

- [npm test Linux Node 22](tests-final.txt): 143/143; [Windows Node 24](tests-final-windows.txt): 143/143 sobre la candidata final.
- [Check Linux](check.txt), [check Windows](check-windows.txt): 40 páginas, coherencia generada, enlaces, anclas, recursos, contacto y sintaxis.
- [Generación](generation.txt): 15 rutas desde el snapshot publicado existente, sin lectura nueva ni escritura de datos remotos.
- [Nueve archivos protegidos](data-compatibility.json) idénticos: catálogo, promociones locales, modelos, adaptadores, integración, JS de viaje y estilos compartidos.
- [35 vistas](browser/trip-depth-responsive.json): siete viajes a 320/390/768/1024/1440 px. Sin overflow; pregunta en una línea, botones/cabecera dentro del ancho, sin superficies blanco puro y con señales correctas.
- [Pantallas bajas](browser/trip-depth-short-screens.json): dock fijo a 568 px de alto y en el flujo a 320 px de alto, conservando espacio de lectura.
- [Recorridos](browser/trip-depth-flows.json): señales por fecha, términos, PDF propio, Escape/foco e inscripción de la segunda fecha con selección correcta.
- [Revisión independiente](independent-review.md) y [última revisión incremental](independent-review-incremental.md). Corregidos estados pendientes, pago global por fecha, autoridad del equipo y contraste. [Prueba del alcance exacto de la compactación final](independent-incremental-proof.json).

Capturas: [Lucas + reserva](browser/trip-depth-lucas-desktop.png), [móvil](browser/trip-depth-lucas-mobile.png), [secciones + sidebar](browser/trip-depth-sections-desktop.png).

[Previsualización local](http://127.0.0.1:4179/viajes/marruecos/#plan). La copia estable usa los archivos finales y las promociones locales existentes. Se preparó para evitar los fallos intermitentes Windows–WSL; las correcciones se sincronizaron al repositorio tras verificar los hashes previos y se repitieron las comprobaciones.

Referencias de composición: [Travelhood](https://travelhood.es/destino/maldivas/) y [Aleta Amarilla](https://www.aletamarilla.com/viajes-de-buceo/bali-penida-volcanes-mantas). No se trasladan sus condiciones.

Sin cambios en Sanity, esquema ni datos comerciales. No se enviaron formularios, mensajes ni pagos. Esta validación local no acredita despliegue ni mide conversión.
