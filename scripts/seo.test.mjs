import test from 'node:test';
import assert from 'node:assert/strict';
import {renderTrip} from './render-trips.mjs';
import {structuredData} from './structured-data.mjs';
import {llmsTxt} from './llms.mjs';

const site = {origin: 'https://www.example.com', indexable: true};
const departure = {id: 'a', date: '17 ene 2027 — 24 ene 2027', start: '2027-01-17', end: '2027-01-24', price: 899, availability: 'available', state: 'confirmed'};
const trip = {id: 't1', slug: 'marruecos', name: 'Marruecos', place: 'Agadir · Marruecos', state: 'confirmed', availability: 'available', levels: [1, 2],
  departures: [departure], gallery: [], includes: [], excludes: [], faqs: [], levelChecks: [], story: [], team: [], aliases: []};
const upcoming = {...trip, id: 't2', slug: 'hossegor', name: 'Hossegor', place: 'Landas · Francia', state: 'upcoming', availability: 'enquiry', levels: [2, 3], departures: []};

const titleOf = html => /<title>([^<]*)<\/title>/.exec(html)[1];
const descriptionOf = html => /<meta name="description" content="([^"]*)"/.exec(html)[1];

test('a trip title leads with what people search for and fits a search result', () => {
  const html = renderTrip(trip, [trip]);
  assert.equal(titleOf(html), 'Viaje de surf a Marruecos — Let’s Surf Together');
  assert.ok(titleOf(renderTrip({...trip, name: 'Marruecos avanzado'}, [trip])).length <= 60);
});

test('a trip description names the trip, its dates, levels and price within 160 characters', () => {
  const text = descriptionOf(renderTrip(trip, [trip]));
  assert.match(text, /^Viaje de surf a Marruecos en grupo\. 17 ene 2027 — 24 ene 2027\. Iniciación y Base\. 899 € por persona\./);
  assert.ok(text.length <= 160, `${text.length} caracteres`);
});

test('a trip without dates does not advertise a price', () => {
  assert.doesNotMatch(descriptionOf(renderTrip(upcoming, [upcoming])), /€/);
});

test('the organization states who founded it and when', () => {
  const node = structuredData('/', '<html><head><title>x</title></head></html>', [], site)['@graph'].find(n => n['@type'] === 'Organization');
  assert.equal(node.foundingDate, '2024');
  assert.deepEqual(node.founder, {'@type': 'Person', name: 'Lucas'});
});

test('llms.txt summarises LST and lists every trip with dates, levels and price', () => {
  const text = llmsTxt([trip, upcoming], site);
  assert.match(text, /^# Let’s Surf Together\n\n> /);
  assert.match(text, /- \[Viaje de surf a Marruecos\]\(https:\/\/www\.example\.com\/viajes\/marruecos\/\): 17 ene 2027 — 24 ene 2027 · Iniciación y Base · Agadir · Marruecos · 899 € por persona\n/);
  assert.match(text, /- \[Viaje de surf a Hossegor\]\(https:\/\/www\.example\.com\/viajes\/hossegor\/\): Fechas por anunciar · Base e Intermedio · Landas · Francia\n/);
  assert.match(text, /\(https:\/\/www\.example\.com\/niveles\/\)/);
  assert.match(text, /\(https:\/\/www\.example\.com\/preguntas-frecuentes\/\)/);
});
