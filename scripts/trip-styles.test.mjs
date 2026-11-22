import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {renderTrip} from './render-trips.mjs';
import {TRIP_STYLES, TRIP_BUNDLE, tripBundle} from './trip-styles.mjs';

const trip = {id: 't1', slug: 'marruecos', name: 'Marruecos', place: 'Agadir · Marruecos', state: 'confirmed', availability: 'available', levels: [1, 2],
  departures: [{id: 'a', date: '17 ene 2027 — 24 ene 2027', start: '2027-01-17', end: '2027-01-24', price: 899, availability: 'available', state: 'confirmed'}],
  gallery: [], includes: [], excludes: [], faqs: [], levelChecks: [], story: [], team: [], aliases: []};

test('a trip page loads one stylesheet instead of six', () => {
  const links = [...renderTrip(trip, [trip]).matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  assert.deepEqual(links, [`/${TRIP_BUNDLE}`]);
});

test('the bundle keeps every source stylesheet in cascade order', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'lst-trip-styles-'));
  for (const [i, file] of TRIP_STYLES.entries()) await writeFile(path.join(dir, file), `.rule-${i}{order:${i}}\n`);
  const css = await tripBundle(dir);
  const positions = TRIP_STYLES.map((_, i) => css.indexOf(`.rule-${i}{order:${i}}`));
  assert.ok(positions.every(p => p >= 0), 'every source is included');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'sources stay in order');
  assert.equal(await tripBundle(dir), css, 'the output is stable');
});
