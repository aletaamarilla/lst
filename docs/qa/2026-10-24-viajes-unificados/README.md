# Viajes unificados · 24/10/2026

Implementación local sobre `58f338661fc4705364fea08727c836e79b3f2048`, sin commit. El checkout contenía cambios anteriores, conservados. [Estado inicial](initial-status.txt), [versión exacta](version.json), [diff de esta tarea](task.patch) y [revisión independiente](revision-independiente.md).

## Resultado y criterios de aceptación

- El build público agrupa las ocho salidas existentes en seis destinos: El Palmar, Fuerteventura, Hossegor, Maldivas, Marruecos y Senegal. Los nombres no incluyen el nivel ni la temporada de una fecha.
- Maldivas tiene una ficha con dos fechas y sus PDF correspondientes. Programa y nivel II–III comunes.
- Marruecos tiene una ficha: nivel general I–II; la fecha 24–31/01/2027 sobrescribe a III. La fecha 17–24/01/2027 hereda el general. El nivel efectivo aparece junto a cada fecha, y los filtros toman los niveles efectivos, sin sumar el nivel general a una fecha sobrescrita.
- El selector muestra requisitos, capacidad, precio, señal, PDF y disponibilidad de cada salida. El programa de Marruecos conserva sus diferencias de sesiones/material y FAQ por fecha; el material de iniciación no se ofrece globalmente ni para la segunda fecha.
- Las seis rutas de destino son estables; las ocho rutas antiguas por fecha siguen mostrando la ficha común. Retirar una fecha conserva la ruta del destino y elimina su contenido comercial de la URL retirada.
- Studio admite niveles opcionales por fecha: sin configurar o vacíos heredan el viaje; configurados sustituyen su nivel. También admite requisitos, PDF, disponibilidad y capacidad opcionales por fecha. Los documentos anteriores siguen admitidos por el adaptador.

## Diseño y consumidores

`scripts/trip-groups.mjs` consolida en el adaptador público los slugs de la importación existente `destino-AAAA-MM-DD` con el mismo nombre normalizado. Las rutas originales se conservan en `aliases`. Los slugs personalizados conservan su identidad cuando no pertenecen a un grupo. Una colisión o duplicado de claves detiene el build antes de sustituir la salida.

Los programas mantienen únicamente servicios idénticos como información común; las diferencias se conservan y se presentan por fecha. La capacidad no se suma. Se conserva la disponibilidad efectiva de cada fecha, incluidos los estados completos, y los PDF heredan el general cuando no hay uno específico.

Consumidores actualizados: home, catálogo, guía de niveles, detalle, mensajes WhatsApp, build y comprobación estática. El snapshot público contiene seis viajes con sus salidas/alias, en lugar de ocho fichas; no contiene notas internas, revisiones ni credenciales.

La consulta Sanity resuelve también `dossierFile → dossier` dentro de cada salida. No se han escrito ni borrado documentos remotos: la fuente Sanity conserva los ocho documentos originales y la web los agrupa. El esquema permite futuras fechas dentro de un único documento. Migrar físicamente los documentos originales no forma parte de esta publicación local; requiere conservar también sus alias y particularidades de programa.

## Evidencia final

| Comprobación | Resultado |
| --- | --- |
| Base Linux | [55/55 pruebas](base-test.txt) antes de modificar. |
| Pruebas finales | [65/65](tests.txt), herencia, overrides, programa, PDF, estados, retirada y rutas. |
| Build real | [6 destinos](build.txt), una lectura de Sanity publicado. |
| Check | [24 páginas](check.txt), generación, alias, enlaces, recursos, WhatsApp y noindex. |
| Studio | [Tipos](studio-check.txt) y [build](studio-build.txt) aprobados. |
| Navegador | [139 comprobaciones](browser.txt) a 320/390/1440 px: catálogo, filtros efectivos, dos fechas, PDF, programas, foco, texto ampliado, rutas antiguas y sin JavaScript. [Detalle](browser.json). |
| Home | [234 comprobaciones](home-browser.txt): cinco anchuras, texto al 200 %, hover, tap, teclado, fechas largas y sin JS. |
| Revisión independiente | [Informe](revision-independiente.md): contraste con las ocho salidas originales y seis hallazgos corregidos y comprobados. |

Capturas: [catálogo móvil](catalog-390.png), [Marruecos móvil](marruecos-dates-390.png), [Marruecos escritorio](marruecos-dates-1440.png), [Maldivas móvil](maldivas-dates-390.png).

## Límites y operación

No se ha hecho commit, push, despliegue de web/Studio ni mutación de Sanity. Las consultas WhatsApp se interceptan en QA; no se envían mensajes ni reservas. El build de Studio avisa de la diferencia existente entre paquetes locales 6.19 y runtime con actualización automática 6.20; la compilación finaliza correctamente.

Se conserva el trabajo previo de home y limpieza, los estados comerciales, las URLs originales y los contenidos documentados. Si falla una lectura o validación, el build sigue conservando la salida anterior. La revisión acredita el alcance local comprobado, no un despliegue ni ausencia absoluta de defectos.
