import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdtemp, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {readPublishedTrips, readImportInventory, createDrafts} from './sanity.mjs';
import {adaptTrip, adaptTrips} from './sanity-trips.mjs';
import {buildSite, legacySlugs} from './build.mjs';
import {renderTrip} from './render-trips.mjs';
import {tripPrice, departuresFor} from './trip-model.mjs';
import {prepareDrafts, planImport, runImport} from './import-departures.mjs';

const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
const drafts = prepareDrafts(inventory);
const published = index => ({...structuredClone(drafts[index]), _id: drafts[index]._id.slice(7)});
const reply = result => ({ok: true, json: async () => ({result})});

test('production explicitly requests published perspective, fixed target and separate private reader', async () => {
  let calls = 0;
  const docs = await readPublishedTrips({env: {SANITY_READ_TOKEN: 'private-read', SANITY_IMPORT_TOKEN: 'private-write'}, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url.origin, 'https://q5bj2rn2.api.sanity.io');
    assert.equal(url.pathname, '/v2025-02-19/data/query/production');
    assert.equal(url.searchParams.get('perspective'), 'published');
    assert.match(url.searchParams.get('query'), /drafts\.\*\*/);
    assert.match(url.searchParams.get('query'), /versions\.\*\*/);
    assert.match(url.searchParams.get('query'), /coalesce\(dossierFile\.asset->url, dossier\)/);
    assert.equal(options.headers.Authorization, 'Bearer private-read');
    assert.equal(options.redirect, 'error');
    return reply([]);
  }});
  assert.deepEqual(docs, []);
  assert.equal(calls, 1);
});

test('an importer token is never reused as a production reader; failures do not leak credentials or bodies', async () => {
  await readPublishedTrips({env: {SANITY_IMPORT_TOKEN: 'write-secret'}, fetchImpl: async (_, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return reply([]);
  }});
  for (const fetchImpl of [async () => ({ok: false, status: 401, text: async () => 'secret'}), async () => {throw Error('private-token');}, async () => reply(null)]) {
    await assert.rejects(readPublishedTrips({fetchImpl, env: {SANITY_READ_TOKEN: 'secret'}}), error => !/secret|private-token/.test(error.message));
  }
});

test('raw inspection uses importer token only; mutation is create-only and draft-only', async () => {
  const env = {SANITY_IMPORT_TOKEN: 'import-secret', SANITY_READ_TOKEN: 'read-secret'};
  await readImportInventory({env, fetchImpl: async (url, options) => {
    assert.equal(url.searchParams.get('perspective'), 'raw');
    assert.equal(options.headers.Authorization, 'Bearer import-secret');
    return reply([]);
  }});
  await createDrafts([drafts[0]], {env, fetchImpl: async (url, options) => {
    assert.match(url, /mutate\/production\?visibility=sync/);
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), {mutations: [{create: drafts[0]}]});
    return {ok: true, json: async () => ({results: []})};
  }});
  await assert.rejects(createDrafts([published(0)], {env}), /borradores/);
  await assert.rejects(createDrafts(drafts, {env: {SANITY_READ_TOKEN: 'same', SANITY_IMPORT_TOKEN: 'same'}}), /distintas/);
});

test('adapter rejects drafts/releases, invalid business data, unsafe URLs and duplicate routes', () => {
  for (const change of [
    {_id: drafts[0]._id}, {_id: 'versions.release.lst-a'}, {slug: {current: '../escape'}}, {levels: []}, {levels: [2, 2]},
    {state: 'booked'}, {capacity: {total: 10, available: 11}}, {capacity: {available: -1}},
    {departures: []}, {departures: [{_key: 'a', start: '2027-02-30', end: '2027-03-02'}]},
    {departures: [{...published(0).departures[0], price: -1}]}, {dossier: 'javascript:alert(1)'},
    {booking: {applicationUrl: 'https://user:password@example.com/'}},
  ]) assert.throws(() => adaptTrip({...published(0), ...change}));
  assert.throws(() => adaptTrips([published(0), {...published(0), _id: 'other'}]), /duplicados/);
});

test('manual price, deposit and availability stay independent; decimals are not rounded to euros', () => {
  const doc = published(2);
  doc.departures[0].price = 860.29;
  doc.price = 899; // obsolete data must never become a fallback
  doc.capacity = {total: 15, available: 0};
  const trip = adaptTrip(doc);
  assert.equal(trip.payment.depositAmount, 270);
  assert.equal(tripPrice(trip), '860,29 €');
  const html = renderTrip(trip);
  assert.match(html, /Completo/);
  assert.match(html, /270 €/);
  assert.match(html, /equivalencia pendiente/);
  doc.departures[0].price = null;
  assert.equal(tripPrice(adaptTrip(doc)), 'Precio por confirmar');
  assert.equal(departuresFor({state: 'confirmed', price: 100, departures: [{id: 'a', date: 'hoy', price: null}]} )[0].price, null);
});

test('optional content is omitted without fake services, photos or undefined markup; default request stays contextual WhatsApp', () => {
  const doc = published(0);
  for (const field of ['payment', 'capacity', 'story', 'includes', 'excludes', 'stay', 'faqs', 'intro']) delete doc[field];
  const trip = adaptTrip(doc);
  const html = renderTrip(trip);
  assert.doesNotMatch(html, /undefined|NaN|\/assets\/null|\/assets\/undefined|habitación compartida|data-open-gallery|og:image/);
  assert.match(html, /Disponibilidad<\/dt><dd>Consultar disponibilidad/);
  assert.match(html, /Precio por confirmar/);
  const link = html.match(/data-whatsapp="[^"]+" href="([^"]+)"/)[1];
  assert.match(new URL(link).searchParams.get('text'), /Hossegor.*20 nov/);
  assert.doesNotMatch(html, /data-application/);
});

test('approved application URL changes all booking placements and dated choices, while help retains WhatsApp', () => {
  const doc = published(0);
  doc.booking = {applicationUrl: 'https://forms.gle/approved'};
  const trip = adaptTrip(doc);
  let html = renderTrip(trip);
  assert.equal((html.match(/data-application=/g) ?? []).length, 4);
  assert.match(html, /no confirma|no confirma|confirmación se acuerda/);
  assert.match(html, /Consultar mi nivel/);
  assert.match(html, /data-whatsapp=/);
  doc.departures.push({...doc.departures[0], _key: 'second', start: '2026-12-01', end: '2026-12-03', price: 500});
  html = renderTrip(adaptTrip(doc));
  assert.match(html, /id="departure-dialog"/);
  assert.equal((html.match(/data-application=/g) ?? []).length, 2);
  assert.match(html, /data-departure="second"/);
});

test('public snapshot whitelists fields and strips internal notes and unknown nested metadata', () => {
  const doc = published(0);
  doc.secret = 'secret-sentinel';
  doc.capacity.privateNotes = 'secret-sentinel';
  assert.doesNotMatch(JSON.stringify(adaptTrip(doc)), /secret-sentinel|editorialNotes|sha256|Formulario extraído/);
});

test('editorial tariff text is escaped instead of executing markup in a published card', () => {
  const doc = published(0);
  doc.departures[0].price = 399;
  doc.priceNote = '<img src=x onerror="window.__cmsInjected=true">';
  const html = renderTrip(adaptTrip(doc));
  assert.match(html, /booking-card-price-note">&lt;img src=x onerror=&quot;window\.__cmsInjected=true&quot;&gt;<\/p>/);
  assert.doesNotMatch(html, /<img src=x onerror=/);
});

test('exclusions and conditions remain visible independently of optional included services', () => {
  const doc = published(0);
  doc.departures[0].price = 399;
  delete doc.includes;
  doc.excludes = ['Vuelos no incluidos'];
  doc.inclusionsNote = 'Seguro obligatorio a cargo del viajero';
  let html = renderTrip(adaptTrip(doc));
  assert.match(html, /Vuelos no incluidos/);
  assert.match(html, /Seguro obligatorio a cargo del viajero/);
  assert.doesNotMatch(html, /El programa, cuando esté cerrado|id="included-title"/);
  delete doc.excludes;
  html = renderTrip(adaptTrip(doc));
  assert.match(html, /Seguro obligatorio a cargo del viajero/);
  assert.doesNotMatch(html, /El programa, cuando esté cerrado/);
});

test('one read supplies home, catalogue, levels and details; stale demo content disappears and routes stay reachable', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'lst-integration-'));
  const out = path.join(dir, 'site');
  try {
    let calls = 0;
    await buildSite({out, read: async () => {calls++; return [published(0)];}});
    assert.equal(calls, 1);
    for (const file of ['index.html', 'viajes/index.html', 'niveles/index.html', `viajes/${published(0).slug.current}/index.html`]) {
      const html = await readFile(path.join(out, file), 'utf8');
      assert.match(html, /Hossegor/);
      assert.doesNotMatch(html, /349 €|Noviembre 2026/);
    }
    for (const slug of legacySlugs) assert.match(await readFile(path.join(out, 'viajes', slug, 'index.html'), 'utf8'), /no está publicado/);
    // A later unpublish must remove both the card and the previous detail contents.
    await buildSite({out, template: out, read: async () => []});
    assert.match(await readFile(path.join(out, 'viajes', published(0).slug.current, 'index.html'), 'utf8'), /no está publicado/);
    for (const file of ['index.html', 'viajes/index.html', 'niveles/index.html']) {
      const html = await readFile(path.join(out, file), 'utf8');
      assert.match(html, /No hay viajes publicados/);
      assert.doesNotMatch(html, /Hossegor|catalog-card-link|guide-trip-card|home-trip-link/);
    }
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('reading/validation/render errors preserve the last output; demo cannot replace production', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'lst-failure-'));
  try {
    await writeFile(path.join(dir, 'sentinel'), 'last-valid');
    for (const read of [async () => {throw Error('read failed');}, async () => [{...published(0), levels: []}]]) {
      await assert.rejects(buildSite({out: dir, read}));
      assert.equal(await readFile(path.join(dir, 'sentinel'), 'utf8'), 'last-valid');
    }
    await assert.rejects(buildSite({out: dir, template: '/does-not-exist', read: async () => []}));
    assert.equal(await readFile(path.join(dir, 'sentinel'), 'utf8'), 'last-valid');
    await assert.rejects(buildSite({demo: true}), /fuera de dist/);
  } finally { await rm(dir, {recursive: true, force: true}); }
});

test('specific eight-draft mapping keeps unknown prices/availability, source distinctions and fixed deposits', () => {
  assert.equal(drafts.length, 8);
  assert.deepEqual(drafts, prepareDrafts(inventory));
  for (const d of drafts) {
    assert.match(d._id, /^drafts\.lst-/);
    assert.equal(d.departures.length, 1);
    assert.equal(d.departures[0].price, undefined);
    assert.equal(d.capacity.available, undefined);
    assert.equal(d.booking, undefined);
    assert.equal(d.hero, undefined);
    assert.equal(d.dossier, undefined);
    assert.match(d.editorialNotes, /vigencia NO confirmada/);
  }
  assert.equal(drafts[3].capacity.total, 10);
  assert.match(drafts[3].editorialNotes, /hasta plaza 5/);
  assert.equal(drafts[5].payment.depositAmount, 325);
  assert.match(drafts[5].payment.terms, /25 %/);
});

test('collision detection covers IDs, slugs, drafts, published and release versions; existing manual edits are skipped', () => {
  assert.ok(planImport(drafts, []).every(p => p.action === 'create-draft'));
  assert.ok(planImport(drafts, drafts).every(p => p.action === 'skip-existing-preserve-manual'));
  const manual = {...published(0), slug: {current: 'manually-changed'}, departures: [{price: 500}]};
  assert.equal(planImport(drafts, [manual])[0].action, 'skip-existing-preserve-manual');
  assert.equal(planImport(drafts, [{...manual, _id: `versions.release.${manual._id}`}])[0].action, 'skip-existing-preserve-manual');
  assert.throws(() => planImport(drafts, [{...drafts[0], _type: 'other'}]), /Colisión de ID/);
  for (const _id of ['other', 'drafts.other', 'versions.release.other']) assert.throws(() => planImport(drafts, [{...drafts[0], _id}]), /Colisión de slug/);
});

test('remote preflight includes a different document type without slug occupying a reserved ID', async () => {
  let writes = 0;
  for (const _id of [drafts[0]._id, drafts[0]._id.slice(7)]) {
    await assert.rejects(runImport({inventory, remote: true, apply: true, env: {SANITY_IMPORT_TOKEN: 'test-import'},
      read: options => readImportInventory({...options, fetchImpl: async url => {
        // An unfiltered metadata scan must include non-trip records lacking a slug.
        assert.equal(url.searchParams.get('query'), '*[]{_id, _type, slug}');
        return reply([{_id, _type: 'other'}]);
      }}), write: async () => {writes++;}}), /Colisión de ID/);
  }
  assert.equal(writes, 0);
});

test('dry run has zero writes; full validation and authenticated collision checks precede a single transaction', async () => {
  let reads = 0, writes = 0;
  const env = {SANITY_IMPORT_TOKEN: 'test-import'};
  const read = async () => {reads++; return [];};
  const write = async docs => {writes++; assert.equal(docs.length, 8);};
  const local = await runImport({inventory, read, write});
  assert.equal(local.remoteCollisionCheck, 'pending');
  assert.equal(reads, 0); assert.equal(writes, 0);
  const remote = await runImport({inventory, remote: true, env, read, write});
  assert.equal(remote.writes, 0); assert.equal(reads, 1); assert.equal(writes, 0);
  await assert.rejects(runImport({inventory, apply: true, read, write}), /preflight/);
  await assert.rejects(runImport({inventory, remote: true, read, write}), /SANITY_IMPORT_TOKEN/);
  const bad = structuredClone(inventory); bad.departures[7].dates.end = '2020-01-01';
  await assert.rejects(runImport({inventory: bad, remote: true, apply: true, env, read, write}));
  assert.equal(reads, 1); assert.equal(writes, 0);
  await assert.rejects(runImport({inventory, remote: true, apply: true, env, read: async () => [{...drafts[7], _id: 'collision'}], write}), /Colisión/);
  assert.equal(writes, 0);
  await runImport({inventory, remote: true, apply: true, env, read, write});
  assert.equal(writes, 1);
  await runImport({inventory, remote: true, apply: true, env, read: async () => drafts, write});
  assert.equal(writes, 1);
});


test('a full trip remains visible with dates/prices, suppresses applications and date choices, and can reopen', async () => {
  const {renderCatalog} = await import('./render-catalog.mjs');
  const {renderHomeTrips} = await import('./render-home-trips.mjs');
  const {renderLevelTrips} = await import('./render-level-trips.mjs');
  const doc = published(0);
  doc.departures[0].price = 399;
  doc.booking = {applicationUrl: 'https://forms.gle/approved'};
  doc.notice = 'Plazas disponibles. Envía tu solicitud.';
  doc.capacity.available = 0;
  for (const multiple of [false, true]) {
    if (multiple) doc.departures.push({...doc.departures[0], _key: 'second', start: '2026-12-01', end: '2026-12-03', price: 450});
    const trip = adaptTrip(doc);
    const html = renderTrip(trip);
    assert.match(html, /COMPLETO/);
    assert.match(html, /399 €/);
    assert.match(html, /Completo/);
    assert.match(html, /Consultar viaje completo/);
    assert.doesNotMatch(html, /Plazas disponibles\. Envía tu solicitud/);
    assert.match(html, /20 nov 2026/);
    if (multiple) { assert.match(html, /1 dic 2026/); assert.match(html, /450 €/); }
    assert.doesNotMatch(html, /data-application|forms.gle|data-open-dates|departure-dialog/);
    assert.match(renderCatalog('<!-- catalog:start --><!-- catalog:end -->', [trip]), /Completo/);
    assert.match(renderHomeTrips('<!-- home-trips:start --><!-- home-trips:end -->', [trip]), /Completo/);
    assert.match(renderLevelTrips(await readFile('dist/niveles/index.html', 'utf8'), [trip]), /Completo/);
  }
  doc.capacity.available = 1;
  assert.match(renderTrip(adaptTrip(doc)), /data-application/);
});


test('manual availability labels have no free-place counts and override obsolete quantities', () => {
  const doc = published(0);
  doc.capacity.available = 0;
  doc.booking = {applicationUrl: 'https://forms.gle/approved'};
  for (const [availability, label] of [['available', 'Plazas disponibles'], ['last_places', 'Últimas plazas'], ['full', 'Completo'], ['enquiry', 'Consultar disponibilidad']]) {
    doc.availability = availability;
    const html = renderTrip(adaptTrip(doc));
    assert.ok(html.includes(label));
    assert.doesNotMatch(html, /0 plazas disponibles|\d+ plazas disponibles/);
    assert.equal(html.includes('data-application'), availability !== 'full');
  }
  doc.availability = 'invented';
  assert.throws(() => adaptTrip(doc), /Disponibilidad inválida/);
});


test('old documents without manual status retain enquiry when no availability was confirmed', () => {
  const doc = published(0);
  assert.equal(adaptTrip(doc).availability, 'enquiry');
  doc.capacity.available = 2;
  assert.equal(adaptTrip(doc).availability, 'available');
  doc.capacity.available = 0;
  assert.equal(adaptTrip(doc).availability, 'full');
});
