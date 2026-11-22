// llms.txt (llmstxt.org): a plain summary for AI assistants of what LST is,
// the trips on sale today and the pages that hold the details.
import {organization} from './structured-data.mjs';
import {departuresFor, levelLabel, tripPriceDetails, formatPrice, isFull} from './trip-model.mjs';

function tripLine(trip, site) {
  const departures = trip.state === 'confirmed' ? departuresFor(trip) : [];
  const {departure, from} = tripPriceDetails(trip);
  const price = departures.length && !isFull(trip) && departure?.price != null ? `${from ? 'desde ' : ''}${formatPrice(departure.price)} por persona` : null;
  const facts = [departures.length ? departures.map(d => d.date).join('; ') : 'Fechas por anunciar', levelLabel(trip), trip.place, price].filter(Boolean);
  return `- [Viaje de surf a ${trip.name}](${site.origin}/viajes/${trip.slug}/): ${facts.join(' · ')}`;
}

export function llmsTxt(trips, site) {
  const page = (name, route, note) => `- [${name}](${site.origin}${route}): ${note}`;
  return `# ${organization.name}

> ${organization.description} Cada viaje indica los niveles de surf a los que va dirigido, en una escala propia de 1 (Iniciación) a 4 (Avanzado). Se puede venir sin conocer a nadie.

Precios por persona. Lo que incluye cada salida está en su ficha. El seguro de viaje es obligatorio. Enviar la solicitud no implica ningún pago: la plaza se confirma con el equipo al pagar la señal.

## Viajes

${trips.map(trip => tripLine(trip, site)).join('\n')}
${page('Todos los viajes', '/viajes/', 'catálogo con fechas, niveles y precios')}

## Información

${page('Guía de niveles de surf', '/niveles/', 'qué sabe hacer un surfista en cada nivel, qué le falta para subir, con qué tabla y olas surfea, y un test')}
${page('Preguntas frecuentes', '/preguntas-frecuentes/', 'ir por tu cuenta, nivel, material, seguro, reserva y cancelación')}
${page('Conócenos', '/conocenos/', 'cómo empezó LST y cómo son los días de viaje')}
${page('Términos de participación', '/condiciones/', 'reserva, pagos y cancelación')}

## Contacto

- WhatsApp y teléfono: ${organization.telephone}
- Correo: ${organization.email}
- Instagram: ${organization.sameAs[0]}
`;
}
