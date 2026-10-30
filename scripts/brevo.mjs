import {readFileSync} from 'node:fs';
import {departuresFor, isFull} from './trip-model.mjs';

export const brevoConfig = JSON.parse(readFileSync(new URL('./brevo-config.json', import.meta.url), 'utf8'));

// Values from the client's Brevo export. Match exact dates, never array order.
export const brevoDepartures = [
  ['hossegor', '2026-11-20', '2026-11-22', '1'],
  ['el-palmar', '2026-12-04', '2026-12-08', '2'],
  ['marruecos', '2027-01-17', '2027-01-24', '3'],
  ['marruecos-avanzado', '2027-01-24', '2027-01-31', '4'],
  ['fuerteventura', '2027-02-12', '2027-02-16', '5'],
  ['senegal', '2027-02-28', '2027-03-07', '6'],
  ['maldivas', '2027-03-21', '2027-03-28', '7'],
  ['maldivas', '2027-03-28', '2027-04-04', '8'],
];

export function brevoValue(trip, departure) {
  if (departure.brevoValue != null) {
    if (!/^[1-9]\d*$/.test(String(departure.brevoValue))) throw Error('Valor VIAJE_SURF inválido');
    return String(departure.brevoValue);
  }
  const destination = trip.slug.replace(/-\d{4}-\d{2}-\d{2}$/, '');
  return brevoDepartures.find(([slug, start, end]) => slug === destination && start === departure.start && end === departure.end)?.[3] ?? '';
}

export function registrationDepartures(trip) {
  if (trip.state !== 'confirmed' || isFull(trip)) return [];
  const result = departuresFor(trip).filter(d => d.state === 'confirmed' && !isFull(d) && brevoValue(trip, d));
  const values = result.map(d => brevoValue(trip, d));
  if (new Set(values).size !== values.length) throw Error(`VIAJE_SURF duplicado: ${trip.slug}`);
  return result;
}

export function registrationUrl(trip, departure) {
  const available = registrationDepartures(trip);
  if (!available.length || (departure && !available.some(d => d.id === departure.id))) return '';
  return `/inscripciones/${trip.slug}/${departure ? `?salida=${encodeURIComponent(departure.id)}` : ''}`;
}

export function validateRegistrationMappings(trips) {
  const assigned = new Map();
  for (const trip of trips) for (const departure of registrationDepartures(trip)) {
    const value = brevoValue(trip, departure);
    if (assigned.has(value)) throw Error(`VIAJE_SURF ${value} compartido por ${assigned.get(value)} y ${trip.slug}`);
    assigned.set(value, trip.slug);
  }
}
