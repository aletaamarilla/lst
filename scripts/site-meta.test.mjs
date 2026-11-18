import test from 'node:test';
import assert from 'node:assert/strict';
import {siteConfig, pageMeta, applySiteMeta, robotsTxt, sitemapXml, routeOf} from './site-meta.mjs';
import {sizedPhoto, photoSrcset} from './photo.mjs';

const trips = [{slug: 'marruecos', aliases: ['marruecos-2027-01-17']}];
const test_ = siteConfig({});
const live = siteConfig({SITE_URL: 'https://www.example.com', SITE_INDEXABLE: '1'});
const page = '<head><meta name="robots" content="noindex,nofollow"><meta property="og:url" content="https://old.test/x/"></head>';

test('defaults to the test deployment without indexing', () => {
  assert.deepEqual({...test_}, {origin: 'https://lst-sepia.vercel.app', indexable: false});
  assert.equal(robotsTxt(test_), 'User-agent: *\nDisallow: /\n');
  assert.doesNotMatch(sitemapXml(['/'], trips, test_), /<loc>/);
});

test('indexing requires the final domain', () => {
  assert.throws(() => siteConfig({SITE_INDEXABLE: '1'}));
  assert.throws(() => siteConfig({SITE_INDEXABLE: '1', SITE_URL: 'https://lst-sepia.vercel.app'}));
  assert.throws(() => siteConfig({SITE_URL: 'http://www.example.com'}));
  assert.throws(() => siteConfig({SITE_URL: 'https://www.example.com/ruta'}));
  assert.equal(siteConfig({SITE_URL: 'https://www.example.com/'}).origin, 'https://www.example.com');
});

test('forms, unpublished trips and the test deployment stay out of search engines', () => {
  assert.deepEqual(pageMeta('/inscripciones/marruecos/', trips, live), {canonical: null, index: false});
  assert.deepEqual(pageMeta('/viajes/asturias/', trips, live), {canonical: null, index: false});
  assert.equal(pageMeta('/viajes/marruecos/', trips, test_).index, false);
});

test('published pages are indexable and dated URLs point at the main trip', () => {
  assert.deepEqual(pageMeta('/', trips, live), {canonical: '/', index: true});
  assert.deepEqual(pageMeta('/viajes/', trips, live), {canonical: '/viajes/', index: true});
  assert.deepEqual(pageMeta('/viajes/marruecos-2027-01-17/', trips, live), {canonical: '/viajes/marruecos/', index: true});
});

test('applies robots, canonical and og:url once', () => {
  const meta = pageMeta('/viajes/marruecos/', trips, live);
  const once = applySiteMeta(page, meta, live);
  assert.match(once, /<meta name="robots" content="index,follow"><link rel="canonical" href="https:\/\/www\.example\.com\/viajes\/marruecos\/">/);
  assert.match(once, /og:url" content="https:\/\/www\.example\.com\/viajes\/marruecos\/"/);
  assert.equal(applySiteMeta(once, meta, live), once);
  // Going back to a non-indexable page removes the canonical again.
  const hidden = applySiteMeta(once, {canonical: null, index: false}, live);
  assert.match(hidden, /noindex,nofollow/);
  assert.doesNotMatch(hidden, /rel="canonical"/);
  assert.throws(() => applySiteMeta('<head></head>', meta, live));
});

test('sitemap lists only self-canonical indexable pages', () => {
  const xml = sitemapXml(['/viajes/marruecos/', '/', '/viajes/marruecos-2027-01-17/', '/inscripciones/marruecos/', '/viajes/asturias/'], trips, live);
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]), ['https://www.example.com/', 'https://www.example.com/viajes/marruecos/']);
  assert.match(robotsTxt(live), /Sitemap: https:\/\/www\.example\.com\/sitemap\.xml/);
});

test('routes come from the file location', () => {
  assert.equal(routeOf('index.html'), '/');
  assert.equal(routeOf('viajes/marruecos/index.html'), '/viajes/marruecos/');
});

test('only Sanity images are resized', () => {
  const sanity = 'https://cdn.sanity.io/images/p/d/abc-6000x4000.jpg';
  assert.equal(sizedPhoto(sanity, 1000), `${sanity}?w=1000&fit=max&auto=format`);
  assert.equal(photoSrcset(sanity, [500, 1000]), `${sanity}?w=500&fit=max&auto=format 500w, ${sanity}?w=1000&fit=max&auto=format 1000w`);
  assert.equal(sizedPhoto('/assets/group.webp', 1000), '/assets/group.webp');
  assert.equal(photoSrcset('/assets/group.webp', [500]), '');
});
