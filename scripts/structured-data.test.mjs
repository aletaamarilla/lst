import test from 'node:test';
import assert from 'node:assert/strict';
import {faqsFrom, structuredData, applyStructuredData, socialTags} from './structured-data.mjs';

const site = {origin: 'https://www.example.com', indexable: true};
const page = '<html><head><title>FAQs — LST</title><meta name="description" content="Dudas &amp; respuestas"></head><body><details><summary>¿Puedo venir solo?<span aria-hidden="true">+</span></summary><p>Claro.</p></details><details><summary>Programa</summary><p>Día 1</p></details></body></html>';
const trip = {slug: 'hossegor', name: 'Hossegor', place: 'Landas', state: 'confirmed', levels: [3, 2], availability: 'available', hero: 'https://cdn.sanity.io/x.jpg',
  destinationDescription: 'Olas\n  de  playa.', faqs: [['¿Vuelos?', 'No incluidos.']],
  departures: [{id: 'a', date: '20 nov — 22 nov', start: '2026-11-20', end: '2026-11-22', price: 399, availability: 'last_places', state: 'confirmed'}]};

test('only question summaries become FAQ entries', () => {
  assert.deepEqual(faqsFrom(page), [['¿Puedo venir solo?', 'Claro.']]);
});

test('trip pages describe the trip, its offers, breadcrumbs and Sanity FAQs', () => {
  const graph = structuredData('/viajes/hossegor/', page, [trip], site)['@graph'];
  const node = graph.find(n => n['@type'] === 'TouristTrip');
  assert.equal(node.description, 'Olas de playa.');
  assert.equal(node.offers[0].price, 399);
  assert.equal(node.offers[0].availability, 'https://schema.org/LimitedAvailability');
  assert.match(node.touristType, /2 a 3/);
  assert.equal(graph.find(n => n['@type'] === 'BreadcrumbList').itemListElement.length, 3);
  assert.deepEqual(graph.find(n => n['@type'] === 'FAQPage').mainEntity.map(q => q.name), ['¿Vuelos?']);
});

test('a trip without open dates has no offers', () => {
  const node = structuredData('/viajes/hossegor/', page, [{...trip, state: 'upcoming', departures: []}], site)['@graph'].find(n => n['@type'] === 'TouristTrip');
  assert.equal(node.offers, undefined);
});

test('social tags fill only what is missing and the block is rebuilt idempotently', () => {
  assert.match(socialTags(page, '/preguntas-frecuentes/', site), /og:image" content="https:\/\/www.example.com\/assets\/og-default.jpg"/);
  assert.doesNotMatch(socialTags('<meta property="og:image" content="x">', '/', site), /og-default/);
  assert.match(socialTags(page, '/', site), /og:image" content="https:\/\/www.example.com\/assets\/og-home.jpg"/);
  const once = applyStructuredData(page, '/preguntas-frecuentes/', [], site, {public: true});
  assert.equal(applyStructuredData(once, '/preguntas-frecuentes/', [], site, {public: true}), once);
  assert.equal(applyStructuredData(once, '/preguntas-frecuentes/', [], site, {public: false}), page);
  assert.doesNotMatch(once.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1], /<\//);
});
