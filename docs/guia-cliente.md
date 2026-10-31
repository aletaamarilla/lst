# Editar y publicar los viajes de LST

Studio: https://lets-surf-together.sanity.studio/ (requiere tu cuenta con acceso). Web: https://lst-sepia.vercel.app/viajes/.

1. **Cambiar un precio:** abre el viaje → «Fechas y nivel» → «Salidas» → precio por persona. Revisa condiciones de tarifa, señal y PDF para que coincidan. Pulsa **Publicar**.
2. **Marcar completo:** cambia «Disponibilidad» a **Completo** y publica. Se conserva la ficha con sus fechas/precios y se retira la solicitud de plaza. También puedes elegir **Plazas disponibles**, **Últimas plazas** o **Consultar disponibilidad**. No se usa un contador de plazas libres.
3. **Sustituir el PDF:** en «Programa» → **PDF del viaje**, sube el archivo aprobado y publica. Este archivo tiene prioridad sobre la URL anterior del dossier. Comprueba el enlace «Descargar dossier» en la web.
4. **Nueva salida:** añade la fecha al viaje existente únicamente si comparte su rango de nivel y exactamente su programa. Si cambia el nivel o el itinerario, crea o duplica un viaje con nombre y URL propios (por ejemplo, «Marruecos avanzado»). Revisa fechas, precio, disponibilidad, programa/inclusiones/exclusiones, fotos con descripción y PDF. Las consultas siguen en WhatsApp. La integración local de inscripciones Brevo se explica debajo y requiere desplegar el código. Confirma las condiciones comerciales y publica solo cuando esté completo; mientras tanto déjalo en borrador.

5. **Early bird y otros tramos:** en «Fechas y nivel» → «Salidas», conserva el **Precio general por persona** y añade las **Tarifas reducidas / early bird**. Cada tarifa tiene su precio y un cupo (plaza inicial y final); si el PDF no concreta número, deja ambos vacíos y escribe la condición aprobada, por ejemplo «Plazas limitadas». Marca **Esta es la tarifa vigente** solo en una. Cuando se cubra el cupo, desmárcala; activa el siguiente tramo si existe o deja todas desmarcadas para usar el precio general. Publica para reconstruir la web. Es una selección manual: no cuenta reservas ni muestra plazas restantes. Marcar el viaje o la salida completo retira el descuento. Revisa también condiciones y dossier.

Publicar inicia automáticamente una reconstrucción en Vercel. La web cambia cuando el despliegue termina; no es instantáneo. Los borradores y sus ediciones no reconstruyen ni aparecen en la web. Despublicar o eliminar un viaje publicado también reconstruye y lo retira. Un cambio de URL elimina el acceso a la anterior salvo las rutas históricas conservadas; evita cambiar URLs existentes.

Si no ves un cambio, consulta el último despliegue de `lst` en Vercel y su estado **Ready**. Si falla, se conserva la última versión publicada: corrige el contenido indicado y vuelve a publicar. El enlace de reconstrucción es privado y está guardado entre Sanity y Vercel; no debe copiarse a la web. Las consultas abren WhatsApp: la plaza la confirma el equipo; no hay pagos ni inventario automático. Los PDF e imágenes del CDN son accesibles por URL y no deben contener secretos o datos personales privados.

No hay campo de Google Forms en Studio. Los botones de cada salida y de sus PDF llevan a WhatsApp, sin enviar mensajes automáticamente.


## Contenido de cada viaje

En «Destino» puedes cambiar la descripción «¿Por qué este destino?», la **Frase de la tarjeta**, la portada y la **Foto de la tarjeta de inicio**. Sin foto de tarjeta se usa la portada; sin frase no se muestra texto adicional. La galería conserva el orden que elijas. No hace falta cambiar el nombre del destino ni las descripciones de otras fotos para elegir qué imagen aparece.

En «Programa» se editan los títulos y textos del plan, actividades, spots, alojamiento, inclusiones, exclusiones y acompañamiento. Los títulos del programa se muestran literalmente. El nombre y el texto del acompañamiento salen de ese viaje; sin información no se atribuye un coordinador concreto.

Si un documento muestra **Contenido compartido del viaje**, contiene una fecha adicional de un viaje ya agrupado. Abre el documento enlazado para editar sus textos, fotos o programa. Los controles compartidos se ocultan en la fecha adicional para evitar cambios sin efecto; sus fechas, tarifas, disponibilidad, capacidad, PDF y condiciones propias siguen siendo editables. Para añadir nuevas fechas, usa preferentemente la lista «Salidas» del viaje principal.

Las FAQs propias tienen prioridad sobre las sugerencias generales para la misma pregunta. Las condiciones de cancelación pueden mantenerse aquí o en las condiciones del viaje, según el contenido aprobado. La «Opinión de un viajero» es opcional: al retirarla desaparece de la ficha y no se recupera una cita por el nombre del destino.

En cada salida puedes indicar **Señal y condiciones de esta salida**. Cada campo vacío hereda el valor general del viaje. Si las señales difieren entre fechas, el resumen no anuncia una señal común: cada fecha conserva la suya. Capacidad es el máximo del grupo; disponibilidad es un estado manual, no un contador de reservas.

Los campos antiguos de presentación y antetítulo que la plantilla ya no utiliza quedan ocultos en Studio para no ofrecer controles sin efecto; sus datos se conservan para compatibilidad. La home general, el diseño, navegación y formularios se mantienen en código.

La ampliación del esquema debe desplegarse para editar estos campos desde el Studio alojado. La migración editorial y el orden de publicación están documentados en [Migración editorial](sanity/2026-10-31-editorial/README.md). La vista local carga su copia al iniciar: los cambios en Studio necesitan publicarse/reconstruirse o volver a preparar la copia local y reiniciar el servidor.

## Inscripciones Brevo (implementación local, pendiente de despliegue)

Cada destino tiene `/inscripciones/{slug}/`, por ejemplo `/inscripciones/el-palmar/`. Los botones «Inscribirme» de la ficha y del selector llevan al formulario común. Una salida única queda seleccionada; si hay varias, se pide elegir fecha. Los enlaces de una fecha concreta incluyen `?salida={id-de-la-salida}`; los enlaces históricos fechados también seleccionan su fecha. Si esa fecha está completa se exige una nueva elección y se avisa, sin sustituirla automáticamente.

El formulario conserva el destino de envío y los nombres/valores del HTML proporcionado por Brevo. Los campos se envían directamente a Brevo, sin claves API en la web ni guardado en el navegador. WhatsApp sigue disponible para dudas. Enviar la inscripción no cobra ni confirma la reserva.

Las ocho salidas del formulario recibido se vinculan por destino, fecha inicial y final. Para nuevas fechas, crea primero la opción de **VIAJE_SURF** en Brevo y copia su valor numérico al campo **Valor VIAJE_SURF en Brevo** de esa salida en Studio (disponible al desplegar el esquema). No uses el nombre del destino como valor ni reutilices el ID para otra fecha. La construcción rechaza IDs duplicados entre salidas disponibles. Actualiza la configuración común del formulario si cambian sus campos o su URL de envío.

Una fecha completa, un viaje por anunciar o una salida sin correspondencia en Brevo no permite inscripción y conserva la consulta al equipo. Al despublicar el viaje y reconstruir se retira el formulario también de sus rutas antiguas. La disponibilidad es editorial: un formulario ya abierto puede quedar desactualizado hasta recargar; Brevo no es un inventario de reservas.

La recepción en la cuenta del cliente y las automatizaciones/listas/confirmaciones configuradas en Brevo requieren una prueba coordinada con el cliente. Las comprobaciones locales interceptan todos los envíos y no crean contactos.
