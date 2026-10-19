import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {levelsFor} from './trip-model.mjs';
import {catalogFilters, filterCatalog} from '../dist/catalog-filter.js';

const rawTrips = JSON.parse(await readFile(new URL('../data/trips.json', import.meta.url), 'utf8'));
const resolved = trip => ({...trip, levels: levelsFor(trip)});
const trips = rawTrips.map(resolved);
const slugs = list => list.map(trip => trip.slug);
const all = ['el-salvador', 'asturias', 'azores', 'euskadi', 'marruecos', 'cadiz'];
const pending = ['azores', 'euskadi', 'marruecos', 'cadiz'];

for (const level of ['', '1', '2', '3', '4']) {
  const restricted = level === '1' || level === '4';
  for (const state of ['', 'confirmed', 'upcoming']) {
    test(`level ${level || 'all'} AND state ${state || 'all'} preserve compatible destinations`, () => {
      const expected = state === 'upcoming' ? pending : state === 'confirmed'
        ? restricted ? ['asturias'] : ['el-salvador', 'asturias']
        : restricted ? all.slice(1) : all;
      assert.deepEqual(slugs(filterCatalog(trips, level, state)), expected);
    });
  }
}

test('each valid numeric URL level is recognised exactly; invalid values mean all', () => {
  for (const level of ['1', '2', '3', '4']) assert.equal(catalogFilters(level).level, Number(level));
  for (const level of [undefined, null, '', '0', '5', '-1', '2.5', '02', '2abc', '2.0', ' 2', 'rookies', '1,2', '<script>']) {
    assert.equal(catalogFilters(level).level, null);
    assert.deepEqual(slugs(filterCatalog(trips, level)), all);
  }
  assert.equal(catalogFilters('', 'available').state, null);
  assert.deepEqual(slugs(filterCatalog(trips, 'invalid', 'confirmed')), ['el-salvador', 'asturias']);
});

test('missing, null and empty levels use the existing model defaults for every filter', () => {
  for (const levels of [undefined, null, []]) {
    const fixture = resolved({slug: 'default', state: 'upcoming', levels});
    for (const level of ['1', '2', '3', '4']) assert.deepEqual(filterCatalog([fixture], level, 'upcoming'), [fixture]);
  }
  assert.throws(() => resolved({levels: [0]}), /Invalid level/);
});

test('non-consecutive multiple levels match once each; defaults do not widen explicit restrictions', () => {
  const fixture = resolved({slug: 'multi', state: 'confirmed', levels: [4, 2, 2]});
  assert.equal(filterCatalog([fixture], '2').length, 1);
  assert.equal(filterCatalog([fixture], '4').length, 1);
  assert.equal(filterCatalog([fixture], '1').length, 0);
  assert.equal(filterCatalog([fixture], '3').length, 0);
});

test('state follows the existing commercial state, independent of availability and demo metadata', () => {
  const fixtures = [
    resolved({slug: 'dated', state: 'confirmed', availability: 0, demoData: {clientPresentation: true}}),
    resolved({slug: 'pending', state: 'upcoming', availability: 99}),
  ];
  assert.deepEqual(slugs(filterCatalog(fixtures, '', 'confirmed')), ['dated']);
  assert.deepEqual(slugs(filterCatalog(fixtures, '', 'upcoming')), ['pending']);
});

test('zero matches, no trips, clearing and repeated changes are reversible without mutating data', () => {
  const fixtures = [resolved({slug: 'a', state: 'confirmed', levels: [1]}), resolved({slug: 'b', state: 'upcoming', levels: [4]})];
  const before = JSON.stringify(fixtures);
  assert.deepEqual(filterCatalog(fixtures, '4', 'confirmed'), []);
  assert.deepEqual(filterCatalog([], '1'), []);
  assert.deepEqual(filterCatalog(fixtures, '', ''), fixtures);
  assert.deepEqual(slugs(filterCatalog(fixtures, '4', 'upcoming')), ['b']);
  assert.equal(JSON.stringify(fixtures), before);
});
