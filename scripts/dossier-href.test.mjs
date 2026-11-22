import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {adaptTrip} from './sanity-trips.mjs';
import {renderTrip} from './render-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {DOSSIER_HOST} from './dossier-url.mjs';

const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
const doc = () => { const d = structuredClone(prepareDrafts(inventory)[0]); d._id = d._id.slice(7); return d; };
const pdf = name => 'https://' + DOSSIER_HOST + '/' + name;

// Spanish ISPs block the Cloudflare IPs behind DOSSIER_HOST during football matches; the site's own host is not blocked.
test('a single-date trip links its PDF through the site, never straight to the downloads host', () => {
  const d = doc();
  d.dossier = pdf('viaje.pdf');
  const html = renderTrip(adaptTrip(d));
  assert.match(html, /href="\/descargas\/viaje\.pdf"/);
  assert.ok(!html.includes(DOSSIER_HOST), 'the downloads host must not appear in the page');
});

test('every date of a multi-date trip links its own PDF through the site', () => {
  const d = doc();
  d.dossier = pdf('general.pdf');
  d.departures[0].dossier = pdf('primera.pdf');
  d.departures.push({...structuredClone(d.departures[0]), _key: 'second', start: '2099-01-10', end: '2099-01-12', dossier: pdf('segunda.pdf')});
  const html = renderTrip(adaptTrip(d));
  assert.match(html, /href="\/descargas\/primera\.pdf"/);
  assert.match(html, /href="\/descargas\/segunda\.pdf"/);
  assert.ok(!html.includes(DOSSIER_HOST), 'the downloads host must not appear in the page');
});
