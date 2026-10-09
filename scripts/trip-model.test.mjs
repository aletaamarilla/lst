import test from 'node:test';
import assert from 'node:assert/strict';
import {levelsFor, levelLabel, departuresFor, departureMessage, tripFacts, tripPrice} from './trip-model.mjs';

test('levels default to all four; explicit restrictions remain configured', () => {
  assert.deepEqual(levelsFor({}), [1, 2, 3, 4]);
  assert.equal(levelLabel({}), 'Todos los niveles');
  assert.equal(levelLabel({levels: []}), 'Todos los niveles');
  assert.equal(levelLabel({levels: [3, 2, 2]}), 'Niveles II–III');
  assert.equal(levelLabel({levels: [1, 3]}), 'Niveles I, III');
  assert.throws(() => levelsFor({levels: [5]}), /Invalid level/);
});

test('single departure retains its date, duration, price and enquiry context', () => {
  const trip = {name: 'El Salvador', state: 'confirmed', levels: [2, 3], departures: [
    {id: 'oct-25', date: '25 oct — 1 nov 2026', duration: '7 noches', price: 1499},
  ]};
  const departure = departuresFor(trip)[0];
  assert.equal(tripFacts(trip)[0][1], departure.date);
  assert.equal(tripFacts(trip)[1][1], '7 noches');
  assert.equal(tripPrice(trip), '1.499 €');
  assert.match(departureMessage(trip, departure), /El Salvador del 25 oct — 1 nov 2026/);
});

test('multiple departures retain distinct dates, prices and WhatsApp messages', () => {
  const trip = {name: 'Destino de prueba', state: 'confirmed', departures: [
    {id: 'first', date: '1 — 8 nov 2026', duration: '7 noches', price: 1499},
    {id: 'second', date: '15 — 22 nov 2026', duration: '7 noches', price: 1599},
  ]};
  const departures = departuresFor(trip);
  assert.equal(tripFacts(trip)[0][1], '2 fechas disponibles');
  assert.equal(tripFacts(trip)[2][1], 'Todos los niveles');
  assert.equal(tripPrice(trip), 'Desde 1.499 €');
  assert.notEqual(departureMessage(trip, departures[0]), departureMessage(trip, departures[1]));
  assert.match(departureMessage(trip, departures[1]), /15 — 22 nov 2026/);
  assert.throws(() => departuresFor({...trip, departures: [trip.departures[0], trip.departures[0]]}), /duplicate/);
});

test('pending destinations keep all levels and do not manufacture dates or prices', () => {
  const trip = {state: 'upcoming', departures: []};
  assert.deepEqual(departuresFor(trip), []);
  assert.equal(tripFacts(trip)[0][1], 'Por anunciar');
  assert.equal(tripFacts(trip)[2][1], 'Todos los niveles');
  assert.equal(tripPrice(trip), 'Fechas por anunciar');
});

test('sample enquiries disclose the specific fictional date', () => {
  const trip = {name: 'Asturias', state: 'example', departures: [{id: 'sample', date: '20 — 22 nov 2026'}]};
  assert.match(departureMessage(trip, departuresFor(trip)[0]), /fecha de ejemplo 20 — 22 nov 2026/);
  assert.match(departureMessage(trip, departuresFor(trip)[0]), /salida real/);
});
