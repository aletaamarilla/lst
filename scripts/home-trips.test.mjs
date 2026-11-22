import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHomeTrips, renderHomeTrip, renderHomeTicket, nextDeparture} from './render-home-trips.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {readFileSync} from 'node:fs';

const levelPage = readFileSync('dist/niveles/index.html', 'utf8');

const shell = '<!-- home-trips:start --><!-- home-trips:end -->';
const page = '<!-- home-words:start --><!-- home-words:end --><!-- home-next:start --><!-- home-next:end -->' + shell + '<!-- home-bar:start --><!-- home-bar:end -->';
const departure = (id, start, price) => ({id, start, date: `${start} — fin`, price, duration: '4 noches', state: 'confirmed'});
const trip = (id, changes = {}) => ({id, slug: id, name: `Viaje ${id}`, state: 'confirmed', availability: 'available', levels: [1, 2], departures: [departure('one', '2027-01-01', 399)], ...changes});
// Brevo only maps real client departures; this one has a registration form.
const hossegor = (changes = {}) => trip('hossegor', {name: 'Hossegor', levels: [2, 3], departures: [{...departure('h1', '2026-11-20', 399), end: '2026-11-22', date: '20 nov 2026 — 22 nov 2026', duration: '2 noches'}], ...changes});

const tickets = html => html.match(/<article class="hp-ticket"[\s\S]*?<\/article>/g) ?? [];
const priceOf = html => html.match(/<p class="hp-price[^"]*">([\s\S]*?)<\/p>/)[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const tagOf = html => html.match(/<span class="hp-tag hp-tag-date">([^<]*)<\/span>/)[1];

test('every published trip gets one ticket, in chronological order, with a direct link', () => {
  const ids = ['04', '02', '01', '03', '05', '08', '07', '06'];
  const html = renderHomeTrips(shell, ids.map(id => trip(id, {departures: [departure(id, `2027-01-${id}`, 399)]})));
  const list = tickets(html);
  assert.equal(list.length, 8);
  assert.deepEqual(list.map(t => t.match(/href="\/viajes\/(\d+)\/"/)[1]), [...ids].sort());
  for (const id of ids) assert.match(html, new RegExp(`href="/viajes/${id}/"`));
  assert.doesNotMatch(html, /home-more-trips|<details/);
});

test('tickets expose levels for filtering and a filter for each level group', () => {
  const html = renderHomeTrips(shell, [trip('a', {levels: [3, 1]}), trip('b', {levels: []})]);
  assert.match(html, /data-levels="1 3"/);
  assert.match(html, /data-levels="1 2 3 4"/);
  for (const filter of ['all', '1', '2', '3']) assert.match(html, new RegExp(`data-filter="${filter}"`));
  assert.match(html, /data-filter="all" aria-pressed="true">[\s\S]*?<span class="hp-chip-label">Todas<\/span>/);
  // Each filter shows how many trips it keeps: all 2, level I 2, level II 1, levels III-IV 2.
  for (const [filter, count] of [['all', 2], ['1', 2], ['2', 1], ['3', 2]]) assert.match(html, new RegExp(`data-filter="${filter}"[^]*?<span class="hp-chip-count" aria-label="${count} viajes?">${count}</span>`));
  // The ticket names the levels in words, as on /niveles/, without the abstract level dots.
  assert.match(html, /<span class="hp-lvtext">Iniciación e Intermedio<\/span>/);
  assert.doesNotMatch(html, /hp-lvbar|<i\b/);
  // One wave scale that grows with the level: foam to the waist, knee to chest, chest and up.
  for (const [filter, label, wave] of [['all', 'Todas', 'Cualquier nivel'], ['1', 'Iniciación', 'Espuma, hasta la cintura'], ['2', 'Base', 'De la rodilla al pecho'], ['3', 'Intermedio y avanzado', 'Del pecho para arriba']])
    assert.match(html, new RegExp(`data-filter="${filter}"[^>]*>[^]*?<span class="hp-chip-label">${label}</span><span class="hp-chip-detail">${wave}</span>`));
});

test('missing and mixed prices never inherit an obsolete trip price', () => {
  let html = renderHomeTrips(shell, [trip('missing', {price: 100, departures: [departure('one', '2027-01-01', null)]})]);
  assert.equal(priceOf(html), 'Precio por confirmar');
  assert.doesNotMatch(html, /100 €|por persona/);
  html = renderHomeTrips(shell, [trip('mixed', {departures: [departure('one', '2027-01-01', 499), departure('two', '2027-02-01', null)]})]);
  assert.equal(priceOf(html), 'desde 499 € por persona');
  html = renderHomeTrips(shell, [trip('multi', {departures: [departure('one', '2027-01-01', 399.5), departure('two', '2027-02-01', 450)]})]);
  assert.equal(priceOf(html), 'desde 399,5 € por persona');
  assert.equal(tagOf(html), '2 fechas · desde 2027-01-01 — fin');
});

test('dates are compact on the ticket and taken from the earliest departure', () => {
  const sameMonth = trip('nov', {departures: [{...departure('one', '2026-11-20', 399), date: '20 nov 2026 — 22 nov 2026'}]});
  const acrossMonths = trip('mar', {departures: [{...departure('one', '2027-02-28', 399), date: '28 feb 2027 — 7 mar 2027'}]});
  const later = trip('later', {departures: [{...departure('b', '2027-05-01', 399), date: '1 may 2027 — 3 may 2027'}, {...departure('a', '2027-04-01', 399), date: '1 abr 2027 — 3 abr 2027'}]});
  assert.equal(tagOf(renderHomeTicket(sameMonth)), '20–22 nov');
  assert.equal(tagOf(renderHomeTicket(acrossMonths)), '28 feb – 7 mar');
  assert.equal(tagOf(renderHomeTicket(later)), '2 fechas · desde 1–3 abr');
});

test('full, pending, missing photographs, unusual names and empty catalogue stay honest and safe', () => {
  const html = renderHomeTrips(shell, [trip('full', {name: 'Mar & <olas>', availability: 'full'}), trip('pending', {state: 'upcoming', departures: []})]);
  assert.match(html, /hp-tag-soft">Completo/);
  assert.match(html, /Mar &amp; &lt;olas&gt;/);
  assert.match(html, /hp-ticket-placeholder/);
  assert.match(html, /<div class="hp-pending"><h3>Próximamente<\/h3><ul><li><a href="\/viajes\/pending\/">Viaje pending<\/a>/);
  assert.doesNotMatch(html, /undefined|NaN|<img[^>]+src=""|forms\.gle|Solicitar plaza/);
  assert.match(renderHomeTrips(shell, []), /No hay viajes publicados/);
  assert.throws(() => renderHomeTrips('', []), /Missing home trip/);
});

test('each ticket has one action, Ver viaje, to the trip page; registration lives in the next-departure card and bar', () => {
  for (const value of [hossegor(), hossegor({availability: 'full'}), trip('unmapped')]) {
    const html = renderHomeTicket(value);
    assert.equal((html.match(/class="hp-btn/g) ?? []).length, 1);
    assert.match(html, new RegExp(`<a class="hp-btn" href="/viajes/${value.slug}/"[^>]*>Ver viaje</a>`));
    assert.doesNotMatch(html, /Solicitar plaza|inscripciones|Programa/);
  }
  assert.match(renderHomeTicket(trip('pending', {state: 'upcoming', departures: []})), />Ver destino</);
  assert.match(renderHomeTicket(hossegor({availability: 'last_places'})), /hp-tag-hot">Últimas plazas/);
});

test('the next departure, hero words and mobile bar come from requestable departures only; no stats band', () => {
  assert.equal(nextDeparture([trip('unmapped')]), null);
  const html = renderHomeTrips(page, [trip('cheap', {departures: [departure('c', '2027-01-01', 199)]}), hossegor()]);
  assert.match(html, /<a class="hp-next" href="\/viajes\/hossegor\/">[\s\S]*<strong>Hossegor<\/strong>[\s\S]*20–22 nov 2026 · <span class="hp-next-price">399 €<\/span>/);
  assert.match(html, /<nav class="hp-bar"[\s\S]*href="\/inscripciones\/hossegor\/\?salida=h1">Solicitar/);
  // The generic big-number band is gone: nothing counts departures or quotes a minimum price.
  assert.doesNotMatch(html, /hp-stat|home-stats|salidas? abiertas?|desde, por persona/);
  // Long names would not fit the hero line, so only short ones rotate.
  assert.match(html, /data-words="\[&quot;Hossegor\?&quot;\]"/);
  const none = renderHomeTrips(page, [trip('unmapped')]);
  assert.match(none, /<!-- home-next:start --><!-- home-next:end -->/);
  assert.match(none, /<nav class="hp-bar" aria-label="Contacto">[\s\S]*data-whatsapp="orientacion"/);
  assert.equal(renderHomeTrips(html, [trip('cheap', {departures: [departure('c', '2027-01-01', 199)]}), hossegor()]), html);
});

test('tickets say where you surf when the trip has spots, otherwise keep the tagline', () => {
  const spots = (...names) => names.map(title => ({title, text: 'x'}));
  const line = value => renderHomeTicket(value).match(/<p class="hp-tagline">([^<]*)<\/p>/)?.[1];
  assert.equal(line(trip('m', {tagline: 'Sabe a sal', spots: spots('Imsouane', 'Costa de Agadir')})), 'Surf en Imsouane y Costa de Agadir');
  assert.equal(line(trip('m', {spots: spots('Costa de Agadir', 'Imsouane')})), 'Surf en Costa de Agadir e Imsouane');
  assert.equal(line(trip('m', {spots: spots('Imsouane')})), 'Surf en Imsouane');
  assert.equal(line(trip('m', {spots: spots('A', 'B', 'C')})), 'Surf en A, B y C');
  assert.equal(line(trip('m', {spots: spots('Imsouane', 'Anchor Point', 'Desert Point', 'Banana', 'Camel')})), 'Surf en Imsouane, Anchor Point, Desert Point y 2 spots más');
  assert.equal(line(trip('m', {tagline: 'Sabe a sal', spots: []})), 'Sabe a sal');
  assert.equal(line(trip('m', {spots: [{title: '  '}]})), undefined);
  assert.equal(line(trip('m', {state: 'upcoming', departures: [], spots: spots('Imsouane')})), undefined);
  assert.match(renderHomeTicket(trip('m', {spots: spots('Sal & <mar>')})), /Surf en Sal &amp; &lt;mar&gt;/);
});

test('date text, taglines and photo descriptions are escaped', () => {
  const html = renderHomeTicket(trip('escaped', {tagline: 'Sal & <mar>', cardImage: '/a.webp', cardImageAlt: 'Foto "propia"', departures: [{...departure('one', '2027-03-01', 399), date: '1 < 8 & "marzo"'}]}));
  assert.equal(tagOf(html), '1 &lt; 8 &amp; &quot;marzo&quot;');
  assert.match(html, /<p class="hp-tagline">Sal &amp; &lt;mar&gt;<\/p>/);
  assert.match(html, /alt="Foto &quot;propia&quot;"/);
});

test('home uses the explicit CMS card photograph and otherwise falls back to the cover', () => {
  const value = trip('hossegor', {hero: '/cover.webp', heroAlt: 'Portada', cardImage: '/selected.webp', cardImageAlt: 'Foto elegida'});
  assert.match(renderHomeTrips(shell, [value]), /src="\/selected.webp" alt="Foto elegida"/);
  assert.match(renderHomeTrip(value, {compact: true}), /src="\/cover.webp"/);
  assert.match(renderHomeTrips(shell, [{...value, cardImage: undefined}]), /src="\/cover.webp" alt="Portada"/);
});

test('each level chapter lists its trips as rows with filter metadata', () => {
  const values = [
    trip('multi', {name: 'Mar & <olas>', departures: [departure('one', '2027-01-01', 399.5), departure('two', '2027-02-01', 450)]}),
    trip('full', {availability: 'full'}),
    trip('pending', {state: 'upcoming', departures: []}),
  ];
  for (const value of values) {
    const guide = renderLevelTrips(levelPage, [value]);
    const chapter = guide.match(/data-level-trips="1"[\s\S]*?<\/ul>/)?.[0] ?? '';
    assert.match(chapter, /<li class="lv-trip" data-trip-levels="1 2" data-trip-name="[^"]+"><a href="\/viajes\//);
    assert.doesNotMatch(guide.match(/data-level-trips="3"[\s\S]*?<\/div>/)[0], /lv-trip-list/);
    if (value.state === 'upcoming') assert.match(chapter, /Fechas por anunciar/);
    if (value.id === 'full') assert.match(chapter, /Completo/);
    if (value.id === 'multi') assert.match(chapter, /y 1 fecha más/);
  }
});

test('empty level collections keep the help and say there are no trips', () => {
  const html = renderLevelTrips(levelPage, []);
  assert.match(html, /No hay viajes publicados en este momento/);
  assert.match(html, /Ahora mismo no hay salidas para este nivel/);
  assert.doesNotMatch(html, /class="lv-trip"/);
  assert.match(html, /id="orientacion"/);
  assert.throws(() => renderLevelTrips('', []), /Missing guide trip generation markers/);
});
