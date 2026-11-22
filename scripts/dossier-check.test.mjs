import test from 'node:test';
import assert from 'node:assert/strict';
import {missingDossiers, assertDossiersReachable} from './dossier-check.mjs';

const A = 'https://descargas.letsurftogether.com/a.pdf';
const B = 'https://descargas.letsurftogether.com/b.pdf';
const C = 'https://descargas.letsurftogether.com/c.pdf';
const pdf = () => new Response(null, {status: 200, headers: {'content-type': 'application/pdf'}});
const status = code => () => new Response(null, {status: code});
// Answers per URL; an Error value makes the request fail like a network error.
const fake = (answers, seen = []) => async (url, options) => {
  seen.push([url, options.method]);
  const answer = answers[url];
  if (answer instanceof Error) throw answer;
  return answer();
};

test('a dossier that answers 404 is missing; one that answers as a PDF is fine', async () => {
  const trips = [{dossier: A, departures: [{dossier: B}]}];
  const result = await missingDossiers(trips, {fetchImpl: fake({[A]: status(404), [B]: pdf})});
  assert.deepEqual(result, {missing: [A], unverified: []});
});

test('each URL is asked once, with HEAD, however many trips and departures share it', async () => {
  const seen = [];
  const trips = [{dossier: A, departures: [{dossier: A}, {dossier: ''}, {}]}, {dossier: A, departures: []}];
  await missingDossiers(trips, {fetchImpl: fake({[A]: pdf}, seen)});
  assert.deepEqual(seen, [[A, 'HEAD']]);
});

test('trips without any dossier make no request', async () => {
  const seen = [];
  const result = await missingDossiers([{dossier: '', departures: [{}]}], {fetchImpl: fake({}, seen)});
  assert.deepEqual(seen, []);
  assert.deepEqual(result, {missing: [], unverified: []});
});

test('network errors, server errors and answers that are not a PDF are unverified, never missing', async () => {
  const html = () => new Response(null, {status: 200, headers: {'content-type': 'text/html'}});
  const trips = [{dossier: A, departures: [{dossier: B}, {dossier: C}]}];
  const result = await missingDossiers(trips, {fetchImpl: fake({[A]: new Error('offline'), [B]: status(503), [C]: html})});
  assert.deepEqual(result, {missing: [], unverified: [A, B, C]});
});

test('assertDossiersReachable stops on a missing PDF naming it, and only warns about unverified ones', async () => {
  const trips = [{dossier: A, departures: [{dossier: B}]}];
  const warnings = [];
  await assert.rejects(assertDossiersReachable(trips, {fetchImpl: fake({[A]: status(404), [B]: status(503)}), warn: m => warnings.push(m)}),
    error => error.message.includes(A) && !error.message.includes(B));
  warnings.length = 0;
  await assertDossiersReachable(trips, {fetchImpl: fake({[A]: pdf, [B]: status(503)}), warn: m => warnings.push(m)});
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], new RegExp(B));
});
