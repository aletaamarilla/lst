import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyticsConfig, analyticsPage, applyAnalytics} from './analytics.mjs';

const trips = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8')).trips;
const html = '<html><head><title>x</title></head><body></body></html>';

test('without a measurement ID nothing is injected, so previews are not measured', () => {
  assert.equal(analyticsConfig({}), null);
  assert.equal(applyAnalytics(html, {page_type: 'home'}, null), html);
});

test('rejects anything that is not a GA4 measurement ID', () => {
  for (const value of ['UA-1-1', '123456789', 'G-abc', 'GTM-ABC12']) assert.throws(() => analyticsConfig({GA4_MEASUREMENT_ID: value}));
  assert.equal(analyticsConfig({GA4_MEASUREMENT_ID: ' G-ABC123XYZ '}).id, 'G-ABC123XYZ');
});

test('the public domain travels with the ID, so only visits to it count as external traffic', () => {
  const config = analyticsConfig({GA4_MEASUREMENT_ID: 'G-ABC123XYZ', SITE_URL: 'https://www.letssurftogether.com'});
  assert.deepEqual(config, {id: 'G-ABC123XYZ', host: 'www.letssurftogether.com'});
  assert.match(applyAnalytics(html, {page_type: 'home'}, config), /window\.lstAnalytics=\{"id":"G-ABC123XYZ","host":"www\.letssurftogether\.com","page":\{"page_type":"home"\}\}/);
});

test('trip and registration pages report the trip that owns them, never the dated departure', () => {
  assert.deepEqual(analyticsPage('/viajes/maldivas/', trips), {page_type: 'trip', destination_slug: 'maldivas'});
  assert.deepEqual(analyticsPage('/viajes/maldivas-2027-03-28/', trips), {page_type: 'trip', destination_slug: 'maldivas'});
  assert.deepEqual(analyticsPage('/inscripciones/marruecos-2027-01-24/', trips), {page_type: 'registration', destination_slug: 'marruecos-avanzado'});
  assert.deepEqual(analyticsPage('/viajes/azores/', trips), {page_type: 'trip_unavailable'});
  assert.deepEqual(analyticsPage('/viajes/', trips), {page_type: 'catalog'});
  assert.deepEqual(analyticsPage('/cookies/', trips), {page_type: 'legal'});
});

test('injection is idempotent and can be removed by building without an ID', () => {
  const config = analyticsConfig({GA4_MEASUREMENT_ID: 'G-ABC123XYZ'});
  const once = applyAnalytics(html, {page_type: 'trip', destination_slug: 'senegal'}, config);
  assert.equal(applyAnalytics(once, {page_type: 'trip', destination_slug: 'senegal'}, config), once);
  assert.match(once, /"page":\{"page_type":"trip","destination_slug":"senegal"\}\}<\/script>/);
  assert.match(once, /<script defer src="\/analytics\.js"><\/script><!--\/lst-analytics--><\/head>/);
  assert.equal(applyAnalytics(once, {}, null), html);
});
