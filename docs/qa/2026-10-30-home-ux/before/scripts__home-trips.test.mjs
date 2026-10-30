import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHomeTrips} from './render-home-trips.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';

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
  assert.equal(panel, '<a class="home-trip-dates-link" href="/viajes/multi/" aria-label="Ver viaje de Viaje multi"><ul class="home-trip-departures departure-rows"><li class="departure-row"><span class="departure-row-date">2027-01-01 — fin</span></li><li class="departure-row"><span class="departure-row-date">2027-02-01 — fin</span></li></ul></a>');
  assert.doesNotMatch(panel, /€|Precio|Consulta|disponib|home-trip-dates-title|home-trip-date-note/);
  assert.equal(priceFor(html), 'Desde 399,5 €<small>por persona</small>');
  assert.equal((html.match(/href="\/viajes\/multi\/"/g) ?? []).length, 2);
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
  assert.equal(preview, '<span class="home-trip-preview-label">Próx. fecha</span><span class="home-trip-preview-date">2027-01-01 — fin</span><span class="home-trip-duration">4 noches</span>');
  assert.doesNotMatch(preview, /2 fechas|Independencia|<small>/);
  assert.match(html, /aria-describedby="trip-independent-facts"/);
  assert.match(html, /aria-labelledby="trip-independent-action trip-independent-title"/);
  assert.match(html, /id="trip-independent-action"/);
  assert.doesNotMatch(panelFor(html), /Independencia|Precio|€|disponib|Consulta/);
  assert.doesNotMatch(html, /home-trip-requirement/);
});

test('pending cards keep the next-date label without inventing a departure', () => {
  const html = renderHomeTrips(shell, [trip('pending', {state: 'upcoming', departures: []})]);
  assert.equal(panelFor(html), '<a class="home-trip-dates-link" href="/viajes/pending/" aria-label="Ver viaje de Viaje pending"><p>Fechas por anunciar</p></a>');
  assert.match(html, /id="trip-pending-facts"><span class="home-trip-preview-label">Próx. fecha<\/span><span class="home-trip-preview-date">Por anunciar<\/span><\/p>/);
  assert.match(html, /aria-describedby="trip-pending-facts"/);
  assert.match(html, /<h4 id="trip-pending-title">/);
  assert.match(html, /Ver destino/);
  assert.doesNotMatch(panelFor(html), /2027|€|Consulta/);
});

test('date text is escaped in the panel and preview', () => {
  const date = '1 < 8 & "marzo"';
  const html = renderHomeTrips(shell, [trip('escaped', {departures: [{...departure('one', '2027-03-01', 399), date}]})]);
  assert.equal(panelFor(html), '<a class="home-trip-dates-link" href="/viajes/escaped/" aria-label="Ver viaje de Viaje escaped"><ul class="home-trip-departures departure-rows"><li class="departure-row"><span class="departure-row-date">1 &lt; 8 &amp; &quot;marzo&quot;</span></li></ul></a>');
  assert.match(html, /Próx. fecha<\/span><span class="home-trip-preview-date">1 &lt; 8 &amp; &quot;marzo&quot;<\/span>/);
});


test('published next dates compact on the card without changing full departure dates', () => {
  const sameMonth = trip('nov', {departures: [{...departure('one', '2026-11-20', 399), end: '2026-11-22', date: '20 nov 2026 — 22 nov 2026'}]});
  const acrossMonths = trip('mar', {departures: [{...departure('one', '2027-02-28', 399), end: '2027-03-07', date: '28 feb 2027 — 7 mar 2027'}]});
  const september = trip('sept', {departures: [{...departure('one', '2027-09-02', 399), end: '2027-09-08', date: '2 sept 2027 — 8 sept 2027'}]});
  const html = renderHomeTrips(shell, [sameMonth, acrossMonths, september]);
  assert.match(html, /<span class="home-trip-preview-date">20–22 nov 2026<\/span>/);
  assert.match(html, /<span class="home-trip-preview-date">28 feb – 7 mar 2027<\/span>/);
  assert.match(html, /<span class="home-trip-preview-date">2–8 sept 2027<\/span>/);
  assert.match(panelFor(html), /20 nov 2026 — 22 nov 2026/);
});


test('level trips share home cards, pricing and date controls while retaining filter metadata', () => {
  const values = [
    trip('multi', {name: 'Mar & <olas>', departures: [departure('one', '2027-01-01', 399.5), departure('two', '2027-02-01', 450)]}),
    trip('full', {availability: 'full'}),
    trip('pending', {state: 'upcoming', departures: []}),
  ];
  for (const value of values) {
    const home = renderHomeTrips(shell, [value]);
    const guide = renderLevelTrips('<!-- level-trips:start --><!-- level-trips:end -->', [value]);
    assert.equal(panelFor(guide), panelFor(home));
    assert.equal(priceFor(guide), priceFor(home));
    assert.match(guide, /<article data-trip-levels="1 2" data-trip-name=/);
    assert.match(guide, /class="home-trip guide-trip-card(?: home-trip-pending)?" data-compact-home/);
    assert.match(guide, new RegExp('id="guide-trip-' + value.id + '-title"'));
    assert.match(guide, /class="home-trip-grid"/);
    assert.doesNotMatch(guide, /guide-trip-date|guide-trip-action|guide-trip-levels|<a class="guide-trip-card"/);
    if (value.state === 'upcoming') assert.match(guide, /<details class="guide-trip-group guide-trip-pending"/);
  }
});

test('empty level collections preserve the help and native empty-state contract', () => {
  const html = renderLevelTrips('<!-- level-trips:start --><!-- level-trips:end -->', []);
  assert.match(html, /No hay viajes publicados para este nivel/);
  assert.doesNotMatch(html, /<article/);
  assert.throws(() => renderLevelTrips('', []), /Missing guide trip generation markers/);
});
