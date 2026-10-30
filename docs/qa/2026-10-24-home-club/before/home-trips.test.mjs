import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHomeTrips} from './render-home-trips.mjs';

const shell = '<!-- home-trips:start --><!-- home-trips:end -->';
const departure = (id, start, price) => ({id, start, date: `${start} — fin`, price, duration: '4 noches', state: 'confirmed'});
const trip = (id, changes = {}) => ({id, slug: id, name: `Viaje ${id}`, state: 'confirmed', availability: 'available', levels: [1, 2], departures: [departure('one', '2027-01-01', 399)], ...changes});

test('home reveals every departure and its own price, while keeping one direct trip link', () => {
  const html = renderHomeTrips(shell, [trip('multi', {departures: [departure('one', '2027-01-01', 399.5), departure('two', '2027-02-01', 450)]})]);
  assert.match(html, /<details class="home-trip-dates"/);
  assert.match(html, /<summary aria-label="Ver fechas de Viaje multi"/);
  assert.match(html, /2027-01-01 — fin/);
  assert.match(html, /2027-02-01 — fin/);
  assert.match(html, /399,5 €/);
  assert.match(html, /450 €/);
  assert.match(html, /Desde 399,5 €/);
  assert.equal((html.match(/href="\/viajes\/multi\/"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<details[^>]*\sopen[\s>]/);
  assert.match(html, /role="region" tabindex="0"/);
});

test('missing and mixed prices never inherit an obsolete trip price', () => {
  let html = renderHomeTrips(shell, [trip('missing', {price: 100, departures: [departure('one', '2027-01-01', null)]})]);
  assert.match(html, /Precio por confirmar/);
  assert.doesNotMatch(html, /100 €/);
  assert.doesNotMatch(html, /<small>por persona/);
  html = renderHomeTrips(shell, [trip('mixed', {departures: [departure('one', '2027-01-01', 499), departure('two', '2027-02-01', null)]})]);
  assert.match(html, /Desde 499 €/);
  assert.match(html, /Precio por confirmar/);
});

test('all published trips remain reachable, with three chronological highlights', () => {
  const html = renderHomeTrips(shell, ['04', '02', '01', '03', '05'].map(id => trip(id, {departures: [departure(id, `2027-01-${id}`, 399)]})));
  const featured = html.split('<details class="home-more-trips">')[0];
  assert.equal((featured.match(/class="home-trip"/g) ?? []).length, 3);
  assert(featured.indexOf('/viajes/01/') < featured.indexOf('/viajes/02/'));
  for (const id of ['01', '02', '03', '04', '05']) assert.match(html, new RegExp(`href="/viajes/${id}/"`));
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
