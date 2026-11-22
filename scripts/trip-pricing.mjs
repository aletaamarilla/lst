// Early bird: one reduced price per departure, valid until the end of a calendar day in Spain.
const money = value => Number.isFinite(value) && value > 0 && Math.abs(Math.round(value * 100) - value * 100) < 1e-8;
const isoDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const monthDay = (until, month) => new Intl.DateTimeFormat('es-ES', {timeZone: 'UTC', day: 'numeric', month}).format(new Date(`${until}T12:00:00Z`)).replace('.', '');
// "6 de diciembre" for sentences, "6 dic" for tight spots (cards, the mobile dock).
export const earlyBirdUntilLong = until => monthDay(until, 'long');
export const earlyBirdUntilShort = until => monthDay(until, 'short');

export function validateEarlyBird(value, regularPrice, start = null) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw Error('El early bird debe tener precio y fecha límite');
  if (!money(regularPrice)) throw Error('Indica el precio general antes del early bird');
  if (!money(value.price) || value.price >= regularPrice) throw Error('El precio early bird debe ser positivo, con hasta dos decimales e inferior al precio general');
  if (!isoDate(value.until)) throw Error('Indica hasta qué día vale el early bird');
  if (start && value.until >= start) throw Error('El early bird debe terminar antes de que empiece la salida');
  return {price: value.price, until: value.until};
}

// `today` is a YYYY-MM-DD day in Spain; the offer is valid through the whole `until` day.
export function departurePricing(departure, {today, state, availability, capacity} = {}) {
  const regularPrice = departure.regularPrice ?? departure.price ?? null;
  const earlyBird = validateEarlyBird(departure.earlyBird, regularPrice, departure.start);
  if (!earlyBird) return {price: regularPrice, regularPrice, earlyBird: null};
  if (!isoDate(today)) throw Error('Falta la fecha de referencia del early bird');
  const status = departure.availability ?? availability;
  const full = status ? status === 'full' : (departure.capacity ?? capacity)?.available === 0;
  const live = !full && (departure.state ?? state) === 'confirmed' && today <= earlyBird.until;
  if (!live) return {price: regularPrice, regularPrice, earlyBird: null};
  return {price: earlyBird.price, regularPrice, earlyBird: {...earlyBird, saving: Math.round((regularPrice - earlyBird.price) * 100) / 100}};
}
