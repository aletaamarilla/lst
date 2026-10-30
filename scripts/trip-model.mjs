import {departurePricing} from './trip-pricing.mjs';
const ALL_LEVELS = Object.freeze([1, 2, 3, 4]);
const ROMAN = ['I', 'II', 'III', 'IV'];

function configuredLevels(trip) {
  const configured = trip.levels ?? ALL_LEVELS;
  if (!Array.isArray(configured)) throw new Error(`Invalid levels: ${trip.id}`);
  if (!configured.length) return [...ALL_LEVELS];
  if (configured.some(level => !Number.isInteger(level) || level < 1 || level > 4)) {
    throw new Error(`Invalid level: ${trip.id}`);
  }
  return [...new Set(configured)].sort((a, b) => a - b);
}

export const levelsFor = configuredLevels;

const labelFor = levels => {
  if (levels.length === 4) return 'Todos los niveles';
  const consecutive = levels.every((level, i) => !i || level === levels[i - 1] + 1);
  const label = consecutive && levels.length > 1
    ? `${ROMAN[levels[0] - 1]}–${ROMAN[levels.at(-1) - 1]}`
    : levels.map(level => ROMAN[level - 1]).join(', ');
  return `${levels.length === 1 ? 'Nivel' : 'Niveles'} ${label}`;
};
export const levelLabel = trip => labelFor(levelsFor(trip));

export function departuresFor(trip) {
  const source = trip.departures ?? [];
  if (!Array.isArray(source)) throw new Error(`Invalid departures: ${trip.id}`);
  const ids = new Set();
  return source.map(departure => {
    if (!departure.id || !departure.date || ids.has(departure.id)) {
      throw new Error(`Missing or duplicate departure: ${trip.id}`);
    }
    ids.add(departure.id);
    const result = {
      ...departure,
      duration: departure.duration ?? 'Por confirmar',
      price: departure.price ?? null,
      state: departure.state ?? trip.state,
      dossier: departure.dossier || trip.dossier || '',
      availability: departure.availability ?? trip.availability,
      capacity: departure.capacity ?? trip.capacity,
    };
    if (result.price !== null && (!Number.isFinite(result.price) || result.price <= 0)) {
      throw new Error(`Invalid departure price: ${trip.id}/${departure.id}`);
    }
    if (!['confirmed', 'upcoming'].includes(result.state)) {
      throw new Error(`Invalid departure state: ${trip.id}/${departure.id}`);
    }
    return {...result, ...departurePricing(result)};
  });
}

export function departureMessage(trip, departure) {
  if ((departure.availability ?? trip.availability) === 'full') return `¡Hola, LST! Veo que la salida a ${trip.name} del ${departure.date} está completa. Quiero consultar otras opciones.`;
  return departure.message ?? `¡Hola, LST! Me interesa el viaje a ${trip.name} del ${departure.date}. ¿Podemos consultar la disponibilidad y cómo reservar esta salida?`;
}

export function tripMessage(trip) {
  const departures = departuresFor(trip);
  return departures.length === 1 ? departureMessage(trip, departures[0]) : trip.message;
}

export function tripFacts(trip) {
  const departures = departuresFor(trip);
  const durations = [...new Set(departures.map(departure => departure.duration))];
  return [
    ['Fechas', departures.length > 1
      ? 'Varias salidas'
      : departures[0]?.date ?? 'Por anunciar'],
    ['Duración', durations.length === 1
      ? durations[0] : departures.length ? 'Según la salida' : 'Por confirmar'],
    ['Nivel de surf', `${levelLabel(trip)}${trip.levelRequirement ? ` · ${trip.levelRequirement}` : ''}`],
  ];
}

export const formatPrice = value => `${new Intl.NumberFormat('es-ES', {maximumFractionDigits: 2, useGrouping: 'always'}).format(value)} €`;

export function tripPriceDetails(trip) {
  const departures = departuresFor(trip);
  let priced = departures.filter(d => d.price !== null);
  // Legacy journeys keep their price semantics. Promotional journeys never use a
  // sold-out departure to advertise a cheaper fare on another available date.
  if (departures.some(d => d.promotions?.length) && departures.some(d => !isFull(d))) priced = priced.filter(d => !isFull(d));
  priced.sort((a, b) => a.price - b.price || (a.start || '').localeCompare(b.start || ''));
  return {departure: priced[0] ?? null, from: new Set(priced.map(d => d.price)).size > 1 || priced.length < departures.length};
}

export function tripPrice(trip) {
  const {departure, from} = tripPriceDetails(trip);
  if (!departure) return departuresFor(trip).length ? 'Precio por confirmar' : 'Fechas por anunciar';
  return `${from ? 'Desde ' : ''}${formatPrice(departure.price)}`;
}

// Zero is an explicit commercial value; missing availability remains by enquiry.
export const isFull = trip => trip.availability ? trip.availability === 'full' : trip.capacity?.available === 0;
export const availabilityLabel = trip => isFull(trip) ? 'Completo' : trip.availability === 'last_places' ? 'Últimas plazas' : trip.availability === 'available' || (!trip.availability && trip.capacity?.available > 0) ? 'Plazas disponibles' : 'Consultar disponibilidad';
