import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHomeTrips} from './render-home-trips.mjs';

const shell = '<!-- home-trips:start --><!-- home-trips:end -->';
const departure = (id, start, price) => ({id, start, date: `${start} — fin`, price, duration: '4 noches', state: 'confirmed'});
const trip = (id, changes = {}) => ({id, slug: id, name: `Viaje ${id}`, state: 'confirmed', availability: 'available', levels: [1, 2], departures: [departure('one', '2027-01-01', 399)], ...changes});

const panelFor = html => html.match(/<div class="home-trip-dates-panel"[^>]*>([\s\S]*?)<\/div>/)[1];
const priceFor = html => html.match(/<span class="home-trip-price">([\s\S]*?)<\/span>/)[1];

test('home date panel contains only departures, while price and one direct trip link stay outside', () => {
  const html = renderHomeTrips(shell, [trip('multi', {departures: [departure('one', '2027-01-01', 399.5), departure('two', '2027-02-01', 450)]})]);
  assert.match(html, /<details class="home-trip-dates"/);
  assert.match(html, /<summary aria-label="Ver fechas de Viaje multi"/);
  assert.match(html, /2027-01-01 — fin/);
  assert.match(html, /2027-02-01 — fin/);
  const panel = panelFor(html);
  assert.equal(panel, '<ul class="home-trip-departures"><li><span>2027-01-01 — fin</span></li><li><span>2027-02-01 — fin</span></li></ul>');
  assert.doesNotMatch(panel, /€|Precio|Viaje multi|Consulta|disponib|home-trip-dates-title|home-trip-date-note/);
  assert.equal(priceFor(html), 'Desde 399,5 €<small>por persona</small>');
  assert.equal((html.match(/href="\/viajes\/multi\/"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<details[^>]*\sopen[\s>]/);
  assert.match(html, /role="region" tabindex="0" aria-label="Fechas de Viaje multi"/);
});

test('missing and mixed prices never inherit an obsolete trip price', () => {
  let html = renderHomeTrips(shell, [trip('missing', {price: 100, departures: [departure('one', '2027-01-01', null)]})]);
  assert.equal(priceFor(html), 'Precio por confirmar');
  assert.doesNotMatch(html, /100 €/);
  assert.doesNotMatch(html, /<small>por persona/);
  html = renderHomeTrips(shell, [trip('mixed', {departures: [departure('one', '2027-01-01', 499), departure('two', '2027-02-01', null)]})]);
  assert.equal(priceFor(html), 'Desde 499 €<small>por persona</small>');
  assert.doesNotMatch(panelFor(html), /Precio|€/);
});

test('all published trips remain reachable, with three chronological highlights', () => {
  const html = renderHomeTrips(shell, ['04', '02', '01', '03', '05', '08', '07', '06'].map(id => trip(id, {departures: [departure(id, `2027-01-${id}`, 399)]})));
  const featured = html.split('<details class="home-more-trips">')[0];
  assert.equal((featured.match(/class="home-trip"/g) ?? []).length, 3);
  assert.equal((html.match(/class="home-trip"/g) ?? []).length, 8);
  assert(featured.indexOf('/viajes/01/') < featured.indexOf('/viajes/02/'));
  for (const id of ['01', '02', '03', '04', '05', '06', '07', '08']) assert.match(html, new RegExp(`href="/viajes/${id}/"`));
});

test('full, pending, missing photographs, unusual names and empty catalogue stay honest and safe', () => {
  const html = renderHomeTrips(shell, [trip('full', {name: 'Mar & <olas>', availability: 'full'}), trip('pending', {state: 'upcoming', departures: []})]);
  assert.match(html, /Completo/);
  assert.match(html, /Fechas por anunciar/);
  assert.match(html, /Mar &amp; &lt;olas&gt;/);
  assert.match(html, /home-trip-placeholder/);
  assert.doesNotMatch(html, /undefined|NaN|<img[^>]+src=""|forms\.gle/);
  assert.match(renderHomeTrips(shell, []), /No hay viajes publicados/);
  assert.throws(() => renderHomeTrips('', []), /Missing home trip/);
});

test('preview labels the earliest departure and preserves its direct-link description', () => {
  const html = renderHomeTrips(shell, [trip('independent', {levelRequirement: 'Independencia en el agua: remontar solo.', departures: [departure('later', '2027-02-01', 450), departure('first', '2027-01-01', 399)]})]);
  const preview = html.match(/<p class="home-trip-preview" id="trip-independent-facts">([\s\S]*?)<\/p>/)[1];
  assert.equal(preview, '<span class="home-trip-preview-label">Próxima fecha</span> 2027-01-01 — fin');
  assert.doesNotMatch(preview, /2 fechas|Independencia|<small>/);
  assert.match(html, /aria-describedby="trip-independent-facts"/);
  assert.match(html, /aria-labelledby="trip-independent-action trip-independent-title"/);
  assert.match(html, /id="trip-independent-action"/);
  assert.doesNotMatch(panelFor(html), /Independencia|Precio|€|disponib|Consulta/);
  assert.doesNotMatch(html, /home-trip-requirement/);
});

test('pending cards keep the next-date label without inventing a departure', () => {
  const html = renderHomeTrips(shell, [trip('pending', {state: 'upcoming', departures: []})]);
  assert.equal(panelFor(html), '<p>Fechas por anunciar</p>');
  assert.match(html, /id="trip-pending-facts"><span class="home-trip-preview-label">Próxima fecha<\/span> Fechas por anunciar<\/p>/);
  assert.match(html, /aria-describedby="trip-pending-facts"/);
  assert.match(html, /<h4 id="trip-pending-title">/);
  assert.match(html, /Ver destino/);
  assert.doesNotMatch(panelFor(html), /2027|€|Consulta/);
});

test('date text is escaped in the panel and preview', () => {
  const date = '1 < 8 & "marzo"';
  const html = renderHomeTrips(shell, [trip('escaped', {departures: [{...departure('one', '2027-03-01', 399), date}]})]);
  assert.equal(panelFor(html), '<ul class="home-trip-departures"><li><span>1 &lt; 8 &amp; &quot;marzo&quot;</span></li></ul>');
  assert.match(html, /Próxima fecha<\/span> 1 &lt; 8 &amp; &quot;marzo&quot;/);
});
