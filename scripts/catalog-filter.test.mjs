import test from 'node:test';
import assert from 'node:assert/strict';
import {levelsFor} from './trip-model.mjs';
import {catalogFilters, filterCatalog, departureMonths} from '../dist/catalog-filter.js';
import {renderCatalog} from './render-catalog.mjs';
import {readFile} from 'node:fs/promises';

const resolved = trip => ({...trip, levels: levelsFor(trip)});
const trips = [
  resolved({slug: 'restricted', levels: [2, 3], departures: [{start: '2026-12-28', end: '2027-01-04'}]}),
  resolved({slug: 'all-levels', levels: [1, 2, 3, 4], departures: [{start: '2027-02-01', end: '2027-02-08'}]}),
  resolved({slug: 'pending', levels: [1, 2, 3, 4], departures: []}),
];
const slugs = list => list.map(trip => trip.slug);

for (const level of ['', '1', '2', '3', '4']) {
  test(`level ${level || 'all'} and month preserve compatible destinations`, () => {
    const restricted = level === '' || level === '2' || level === '3';
    assert.deepEqual(slugs(filterCatalog(trips, level)), restricted ? ['restricted', 'all-levels', 'pending'] : ['all-levels', 'pending']);
    for (const date of ['2026-12', '2027-01']) assert.deepEqual(slugs(filterCatalog(trips, level, date)), restricted ? ['restricted'] : []);
    assert.deepEqual(slugs(filterCatalog(trips, level, '2027-02')), ['all-levels']);
    assert.deepEqual(filterCatalog(trips, level, '2027-03'), []);
  });
}

test('recognises exact numeric levels and calendar months; ignores obsolete states', () => {
  for (const level of ['1', '2', '3', '4']) assert.equal(catalogFilters(level).level, Number(level));
  for (const level of [undefined, null, '', '0', '5', '-1', '2.5', '02', '2abc', '2.0', ' 2', 'rookies', '<script>']) assert.equal(catalogFilters(level).level, null);
  for (const date of [undefined, null, '', 'confirmed', 'upcoming', '2027-00', '2027-13', '2027-1', '27-01', '2027-01-01', '<script>']) {
    assert.equal(catalogFilters('', date).date, null);
    assert.deepEqual(filterCatalog(trips, '', date), trips);
  }
});

test('months include both ends, year boundaries and valid leap days', () => {
  assert.deepEqual(departureMonths({start: '2026-12-28', end: '2027-02-01'}), ['2026-12', '2027-01', '2027-02']);
  assert.deepEqual(departureMonths({start: '2028-02-29'}), ['2028-02']);
  assert.deepEqual(departureMonths({start: '2027-02-29'}), []);
  assert.deepEqual(departureMonths({start: 'invalid'}), []);
  assert.deepEqual(departureMonths({}), []);
  assert.deepEqual(departureMonths({start: '2027-03-01', end: '2027-02-01'}), ['2027-03']);
});

test('every date shares its trip range, while Morocco products filter independently', () => {
 const basic=resolved({slug:'marruecos',levels:[1,2],departures:[{start:'2027-01-17',end:'2027-01-24'}]});
 const advanced=resolved({slug:'marruecos-avanzado',levels:[3],departures:[{start:'2027-01-24',end:'2027-01-31'}]});
 assert.deepEqual(filterCatalog([basic,advanced],'1','2027-01'),[basic]);
 assert.deepEqual(filterCatalog([basic,advanced],'3','2027-01'),[advanced]);
 assert.deepEqual(filterCatalog([basic,advanced],'4','2027-01'),[]);
 assert.deepEqual(filterCatalog([basic,advanced],'3','2027-02'),[]);
});

test('missing, null and empty levels retain model defaults', () => {
  for (const levels of [undefined, null, []]) {
    const fixture = resolved({levels, departures: [{start: '2027-02-01'}]});
    for (const level of ['1', '2', '3', '4']) assert.deepEqual(filterCatalog([fixture], level, '2027-02'), [fixture]);
  }
  assert.throws(() => resolved({levels: [0]}), /Invalid level/);
});

test('filtering, empty results and clearing never mutate trips', () => {
  const before = JSON.stringify(trips);
  assert.deepEqual(filterCatalog([], '1', '2027-01'), []);
  assert.deepEqual(filterCatalog(trips, '4', '2026-12'), []);
  assert.deepEqual(filterCatalog(trips), trips);
  assert.equal(JSON.stringify(trips), before);
});

test('catalogue renders every trip once with shared cards and no date control', async () => {
  const {trips: published} = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8'));
  const template = '<!-- catalog:start --><!-- catalog:end -->';
  const html = renderCatalog(template, published);
  assert.equal((html.match(/data-catalog-trip/g) || []).length, published.length);
  assert.equal((html.match(/<h2 /g) || []).length, published.length);
  assert.equal((html.match(/class="home-trip-link catalog-card-link"/g) || []).length, published.length);
  assert.doesNotMatch(html, /<option|catalog-date/);
  assert.doesNotMatch(html, /data-state|catalog-card-state|Con fecha|Próximamente/);
  assert.equal(renderCatalog(html, published), html);
  assert.match(renderCatalog(template, []), /No hay viajes publicados/);
});
