import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateEarlyBird, departurePricing, earlyBirdUntilLong, earlyBirdUntilShort} from './trip-pricing.mjs';
import {departuresFor, tripPrice, tripPriceDetails} from './trip-model.mjs';
import {renderHomeTicket, renderHomeTrips} from './render-home-trips.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {tripRowsByLevel} from './render-level-trips.mjs';
import {renderTrip} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';
import {adaptTrip} from './sanity-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';

// Published CMS documents built from the PDF inventory, with the general price on each date.
const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
const docs = prepareDrafts(inventory).map((d, index) => ({...d, _id: d._id.slice(7), departures: d.departures.map(p => ({...p, price: Math.max(...inventory.departures[index].pricing.tariffs.map(t => t.amount))}))}));
const source = slug => structuredClone(docs.find(d => d.slug.current === slug));
const withEarlyBird = (slug, earlyBird, changes = {}) => {
  const doc = source(slug);
  doc.departures = doc.departures.map(d => ({...d, earlyBird, ...changes}));
  return doc;
};
const marruecos = (today, changes) => adaptTrip(withEarlyBird('marruecos-2027-01-17', {price: 860, until: '2026-12-06'}, changes), {today});

test('the early bird holds through the whole deadline day and ends the day after', () => {
  for (const [today, price] of [['2026-11-22', 860], ['2026-12-06', 860], ['2026-12-07', 899]]) {
    const [departure] = marruecos(today).departures;
    assert.equal(departure.price, price, today);
    assert.equal(departure.regularPrice, 899);
    assert.equal(Boolean(departure.earlyBird), price === 860);
  }
  assert.deepEqual(marruecos('2026-11-22').departures[0].earlyBird, {price: 860, until: '2026-12-06', saving: 39});
});

test('a full date never advertises its early bird', () => {
  const [departure] = marruecos('2026-11-22', {availability: 'full'}).departures;
  assert.equal(departure.price, 899);
  assert.equal(departure.earlyBird, null);
});

test('the editor can only save a cheaper price that ends before the trip starts', () => {
  assert.deepEqual(validateEarlyBird({_type: 'earlyBird', price: 860, until: '2026-12-06'}, 899, '2027-01-17'), {price: 860, until: '2026-12-06'});
  assert.equal(validateEarlyBird(null, 899), null);
  for (const [value, regular, start] of [
    [{price: 899, until: '2026-12-06'}, 899], [{price: -1, until: '2026-12-06'}, 899], [{price: 860.123, until: '2026-12-06'}, 899],
    [{price: 860}, 899], [{price: 860, until: '6/12/2026'}, 899], [{price: 860, until: '2027-01-17'}, 899, '2027-01-17'],
    [{price: 860, until: '2026-12-06'}, null], [[], 899],
  ]) assert.throws(() => validateEarlyBird(value, regular, start), JSON.stringify(value));
});

test('pricing needs a reference day once an early bird exists', () => {
  assert.throws(() => departurePricing({price: 899, earlyBird: {price: 860, until: '2026-12-06'}, state: 'confirmed'}), /fecha de referencia/);
  assert.deepEqual(departurePricing({price: 899}), {price: 899, regularPrice: 899, earlyBird: null});
});

test('deadlines read as Spanish dates', () => {
  assert.equal(earlyBirdUntilLong('2026-12-06'), '6 de diciembre');
  assert.equal(earlyBirdUntilShort('2026-12-06'), '6 dic');
  assert.equal(earlyBirdUntilShort('2027-01-17'), '17 ene');
});

test('the model keeps the resolved price and never re-applies the offer', () => {
  const trip = marruecos('2026-11-22');
  const departures = departuresFor(trip);
  assert.equal(departures[0].price, 860);
  assert.deepEqual(departuresFor({...trip, departures}), departures);
  assert.equal(tripPrice(trip), '860 €');
});

test('a full date cannot lend its price to another date of the same trip', () => {
  const doc = withEarlyBird('maldivas-2027-03-21', {price: 1399, until: '2026-12-20'});
  doc.departures = [{...doc.departures[0], availability: 'full'}, {...doc.departures[0], _key: 'later', start: '2027-04-04', end: '2027-04-11', earlyBird: {price: 1449, until: '2026-12-20'}}];
  const {departure} = tripPriceDetails(adaptTrip(doc, {today: '2026-11-22'}));
  assert.equal(departure.id, 'later');
  assert.equal(departure.price, 1449);
});

const live = marruecos('2026-11-22');
const ended = marruecos('2026-12-07');
const wave = /<del class="eb-was" data-eb-until="2026-12-06" data-eb="was"><span class="visually-hidden">Precio general: <\/span>899 €<\/del>/;

test('every card strikes the general price and names the deadline', () => {
  const catalog = renderCatalog('<!-- catalog:start --><!-- catalog:end -->', [live]);
  assert.match(catalog, wave);
  assert.match(catalog, /<strong data-eb-until="2026-12-06" data-eb="price" data-eb-regular="899 €">860 €<\/strong>/);
  assert.match(catalog, /39 € menos hasta el 6 dic/);
  assert.match(catalog, /data-eb="only">Early bird<\/span>/);
  const ticket = renderHomeTicket(live);
  assert.match(ticket, wave);
  assert.match(ticket, /39 € menos hasta el 6 dic/);
  const row = tripRowsByLevel([live])[1];
  assert.match(row, /<del class="eb-was"/);
  assert.match(row, /<span data-eb-until="2026-12-06" data-eb="price" data-eb-regular="899 €">860 €<\/span>/);
  assert.match(row, /39 € menos hasta el 6 dic/);
});

test('the trip page puts the deadline next to the price, the dock and the date picker', () => {
  const html = renderTrip(live, [live]);
  assert.match(html, wave);
  assert.match(html, /Early bird hasta el 6 de diciembre\.<\/strong> Ahorras 39 €\./);
  assert.match(html, /<span data-eb-until="2026-12-06" data-eb="days"><\/span>Después, 899 €\./);
  assert.match(html, /<span class="dock-offer" data-eb-until="2026-12-06" data-eb="only">Early bird hasta el 6 dic<\/span>/);
  assert.doesNotMatch(html, /Primeras|plazas del tramo|de descuento/);
});

test('after the deadline no page mentions the early bird', () => {
  for (const html of [renderTrip(ended, [ended]), renderHomeTicket(ended), renderCatalog('<!-- catalog:start --><!-- catalog:end -->', [ended]), renderHomeTrips('<!-- home-trips:start --><!-- home-trips:end -->', [ended])]) {
    assert.doesNotMatch(html, /data-eb-|Early bird|eb-was|<del/);
    assert.match(html, /899 €/);
  }
});

test('the registration ticket and date options carry the offer and its replacement', () => {
  const doc = withEarlyBird('marruecos-2027-01-17', {price: 860, until: '2026-12-06'});
  const html = renderRegistration(adaptTrip(doc, {today: '2026-11-22'}));
  if (!html) return; // Only trips linked to the Brevo form have a registration page.
  assert.match(html, wave);
  assert.match(html, /data-price-label="860 € por persona, early bird hasta el 6 dic" data-eb-until="2026-12-06" data-eb="label" data-eb-regular="899 € por persona"/);
});
