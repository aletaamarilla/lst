import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePromotions, departurePricing, promotionCondition} from './trip-pricing.mjs';
import {departuresFor, tripPrice, tripPriceDetails} from './trip-model.mjs';
import {renderHomeTrips, renderHomeTrip} from './render-home-trips.mjs';
import {adaptTrip} from './sanity-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {planPromotionUpdate, applyPromotionPlan} from './update-trip-promotions.mjs';

const offer = (changes = {}) => ({label: 'Early bird', price: 860, firstPlace: 1, lastPlace: 5, active: true, ...changes});
const departure = (changes = {}) => ({id: 'one', date: '17 ene 2027 — 24 ene 2027', start: '2027-01-17', end: '2027-01-24', duration: '7 noches', state: 'confirmed', price: 899, availability: 'available', promotions: [offer()], ...changes});
const trip = (changes = {}) => ({id: 'marruecos', slug: 'marruecos', name: 'Marruecos', state: 'confirmed', levels: [1, 2], availability: 'available', departures: [departure()], ...changes});
const shell = '<!-- home-trips:start --><!-- home-trips:end -->';

test('published general, active offer and repeated normalization stay independent', () => {
  const source = trip();
  const first = departuresFor(source);
  assert.equal(first[0].price, 860);
  assert.equal(first[0].regularPrice, 899);
  assert.equal(source.departures[0].price, 899);
  assert.deepEqual(departuresFor({...source, departures: first}), first);
  assert.equal(tripPrice(source), '860 €');
});

test('manual stage change and closing a cup use the correct current tariff', () => {
  const tariffs = [offer({price: 599, lastPlace: 8, active: false}), offer({label: 'Segundo tramo', price: 649, firstPlace: 9, lastPlace: 20})];
  const current = departurePricing(departure({price: 699, promotions: tariffs}));
  assert.equal(current.price, 649);
  assert.equal(promotionCondition(current.promotion), 'Plazas 9–20');
  assert.equal(departurePricing({...current, state: 'confirmed', promotions: tariffs.map(p => ({...p, active: false}))}).price, 699);
});

test('unknown cup stays textual and never becomes an invented remaining count', () => {
  const html = renderHomeTrips(shell, [trip({departures: [departure({price: 1499, promotions: [offer({price: 1399, firstPlace: null, lastPlace: null, condition: 'Plazas limitadas'})]})]})]);
  assert.match(html, /100 € de descuento/);
  assert.match(html, /Plazas limitadas/);
  assert.doesNotMatch(html, /Primeras|Quedan|contador/);
});

test('invalid amounts, ambiguous active stages, overlapping cups and impossible capacity are rejected', () => {
  for (const promotions of [[offer({price: 899})], [offer({price: -1})], [offer({price: 860.123})], [offer({active: 'true'})], [offer(), offer({label: 'Otra', price: 870, firstPlace: 6, lastPlace: 8})], [offer({active: false}), offer({price: 870, firstPlace: 5, lastPlace: 8})], [offer({firstPlace: null})], [offer({firstPlace: null, lastPlace: null})], [offer({lastPlace: 16})]]) assert.throws(() => validatePromotions(promotions, 899, 15));
  assert.throws(() => validatePromotions([offer()], null));
});

test('full and future departures never advertise their early bird', () => {
  for (const changes of [{availability: 'full'}, {state: 'upcoming'}]) {
    const value = trip({departures: [departure(changes)]});
    assert.equal(departuresFor(value)[0].price, 899);
    assert.doesNotMatch(renderHomeTrips(shell, [value]), /home-trip-saving|<del>/);
  }
});

test('a full priced departure cannot supply a fare for an available unpriced date', () => {
  const value = trip({departures: [departure({availability: 'full'}), departure({id: 'two', start: '2027-02-01', date: '1 feb 2027', price: null, promotions: undefined})]});
  assert.equal(tripPrice(value), 'Precio por confirmar');
  assert.equal(tripPriceDetails(value).departure, null);
  assert.doesNotMatch(renderHomeTrips(shell, [value]), /home-trip-saving|<del>|899 €/);
});

test('the card pairs savings, regular fare and date from the same selected departure', () => {
  const value = trip({departures: [departure({price: 999, promotions: undefined}), departure({id: 'two', start: '2027-02-01', date: '1 feb 2027', price: 699, promotions: [offer({price: 649, lastPlace: 4})]})]});
  const html = renderHomeTrips(shell, [value]);
  assert.match(html, /50 € de descuento/);
  assert.match(html, /<del>699 €<\/del>Desde 649 €/);
  assert.match(html, /Fecha de la tarifa<\/span><span class="home-trip-preview-date">1 feb 2027/);
  assert.match(html, /Primeras 4 plazas/);
  assert.doesNotMatch(html, /<del>999 €/);
  assert.doesNotMatch(renderHomeTrip(value, {heading: 'h2', idPrefix: 'catalog'}), /data-compact-home|home-trip-saving|<del>/);
});

test('legacy price-only journeys keep their price values and no extra pricing properties', () => {
  const old = departure({promotions: undefined, price: 399.5});
  const normalized = departuresFor(trip({departures: [old]}))[0];
  assert.equal(normalized.price, 399.5);
  assert.equal(Object.hasOwn(normalized, 'regularPrice'), false);
  assert.equal(tripPrice(trip({departures: [old]})), '399,5 €');
});

test('promotional conditions are escaped in the card', () => {
  const html = renderHomeTrips(shell, [trip({departures: [departure({promotions: [offer({firstPlace: null, lastPlace: null, condition: '<img src=x onerror=alert(1)>'})]})]})]);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
});

const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
const docs = prepareDrafts(inventory).map((d, index) => ({...d, _id: d._id.slice(7), _rev: `revision-${index}`, departures: d.departures.map(p => ({...p, price: Math.max(...inventory.departures[index].pricing.tariffs.map(t => t.amount))}))}));

test('PDF plan covers exactly seven discounted departures and preserves general fares, signals and other fields', () => {
  const plan = planPromotionUpdate(docs, inventory);
  assert.equal(plan.length, 7);
  const candidate = applyPromotionPlan(docs, plan);
  assert.equal(planPromotionUpdate(candidate, inventory).length, 0);
  const palmar = candidate.find(d => d.slug.current.startsWith('el-palmar'));
  assert.equal(palmar.departures[0].price, 699);
  assert.deepEqual(palmar.departures[0].promotions.map(p => [p.price, p.firstPlace, p.lastPlace, p.active]), [[599, 1, 8, true], [649, 9, 20, false]]);
  for (let i = 0; i < docs.length; i++) {
    assert.deepEqual(candidate[i].payment, docs[i].payment);
    assert.deepEqual(candidate[i].capacity, docs[i].capacity);
    assert.deepEqual(candidate[i].includes, docs[i].includes);
  }
  const adapted = adaptTrip(palmar);
  assert.equal(adapted.departures[0].price, 599);
  assert.equal(adapted.departures[0].regularPrice, 699);
  assert.match(palmar.priceNote, /649 €/);
  assert.doesNotMatch(palmar.priceNote, /sin promociones/);
});

test('CMS rerun preserves the editor selection; stale revisions, drafts and changed general fares block writes', () => {
  const plan = planPromotionUpdate(docs, inventory);
  const candidate = applyPromotionPlan(docs, plan);
  const palmar = candidate.find(d => d.slug.current.startsWith('el-palmar'));
  palmar.departures[0].promotions[0].active = false;
  palmar.departures[0].promotions[1].active = true;
  assert.deepEqual(planPromotionUpdate(candidate, inventory), []);
  assert.throws(() => applyPromotionPlan(docs.map(d => ({...d, _rev: 'later'})), plan), /Revisión distinta/);
  assert.throws(() => planPromotionUpdate([...docs, {...docs[1], _id: `drafts.${docs[1]._id}`}], inventory), /edición pendiente/);
  const changed = structuredClone(docs);
  changed[1].departures[0].price += 1;
  assert.throws(() => planPromotionUpdate(changed, inventory), /tarifa general cambió/);
});
