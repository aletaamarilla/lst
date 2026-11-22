import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderRegistration} from './render-registration.mjs';
import {renderTrip} from './render-trips.mjs';
import {unavailablePage} from './build.mjs';
import {legalRoutes} from './legal.mjs';

const trips = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8')).trips;
const trip = trips.find(t => t.slug === 'marruecos');

test('every generated footer links to the legal pages', () => {
  for (const html of [renderTrip(trip, trips), renderRegistration(trip), unavailablePage()])
    for (const route of legalRoutes) assert.ok(html.includes(`href="${route}"`), route);
});

test('registration asks for the consents in the client terms; only the optional ones reach Brevo', () => {
  const html = renderRegistration(trip);
  const boxes = [...html.matchAll(/<input type="checkbox"[^>]*>/g)].map(m => m[0]);
  assert.equal(boxes.length, 4);
  assert.match(boxes[0], /data-consent="privacy" required/);
  assert.match(boxes[1], /data-consent="health">/); // Required by registration.js only when health details are given.
  for (const box of boxes.slice(0, 2)) assert.doesNotMatch(box, /\bname=/);
  assert.match(boxes[2], /data-consent="image" name="CONSENTIMIENTO_IMAGEN" value="1">/);
  assert.match(boxes[3], /data-consent="marketing" name="OPT_IN" value="1">/);
  for (const box of boxes.slice(2)) assert.doesNotMatch(box, /required|checked/);
  assert.ok(html.indexOf('data-consent="marketing"') < html.indexOf('type="submit"'));
  assert.match(html, /href="\/privacidad\/" target="_blank"/);
});

test('static legal pages exist with one heading each', async () => {
  for (const route of legalRoutes) {
    const html = await readFile(`dist${route}index.html`, 'utf8');
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  }
});
