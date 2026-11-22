import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {salesPitch, practicalDetails, salesFaqs} from './trip-sales-content.mjs';

const {trips} = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8'));
const bySlug = slug => {
  const trip = trips.find(item => item.slug === slug);
  assert(trip, 'Missing current trip fixture: ' + slug);
  return trip;
};
const practicalText = trip => practicalDetails(trip).map(item => item.text).join(' ');
const allText = trip => JSON.stringify([salesPitch(trip), practicalDetails(trip), salesFaqs(trip)]);

test('editorial framing comes from CMS fields regardless of the destination slug', () => {
  const trip = {...bySlug('el-palmar'), tagline: 'Una frase nueva.', destinationDescription: 'Un texto aprobado & propio.'};
  const before = structuredClone(trip);
  assert.deepEqual(salesPitch(trip), {title: trip.tagline, text: trip.destinationDescription});
  assert.deepEqual(salesPitch({...trip, slug: 'otro-destino'}), salesPitch(trip));
  assert.deepEqual(trip, before);
});

const listText = trip => [...(trip.includes ?? []), ...(trip.excludes ?? [])].join(' ');

test('meals and equipment are not repeated in the practical cards; the price lists keep the specific arrangements', () => {
  for (const trip of trips.filter(item => item.state === 'confirmed')) {
    const titles = practicalDetails(trip).map(item => item.title);
    assert(!titles.some(title => /comidas|neopreno/i.test(title)), trip.slug + ' repeats meals or equipment: ' + titles.join(', '));
  }
  assert.match(listText(bySlug('el-palmar')), /Pensión completa/);
  assert.match(listText(bySlug('fuerteventura')), /cenas/);
  assert.match(listText(bySlug('marruecos')), /Material de iniciación y neoprenos/);
  assert.match(listText(bySlug('marruecos')), /Tablas evolutivas y shortboards: alquiler aparte/);
});

test('a trip whose lists say nothing about equipment still tells you to ask, and Maldivas never inherits included equipment', () => {
  assert.match(practicalText(bySlug('maldivas')), /Consulta.*tabla y equipación/);
  assert.doesNotMatch(practicalText(bySlug('maldivas')), /material.*incluido|neopreno.*incluido/i);
  assert.doesNotMatch(practicalText(bySlug('marruecos-avanzado')), /Material de iniciación y neoprenos/);
});

test('every trip states the compulsory travel insurance; school cover is not presented as a substitute', () => {
  for (const slug of ['el-palmar', 'senegal', 'maldivas']) assert.match(practicalText(bySlug(slug)), /seguro de viaje es obligatorio[\s\S]*IATI Seguros/);
  assert.match(practicalText(bySlug('el-palmar')), /seguro de la escuela local, que no sustituye al seguro de viaje/);
  assert.match(practicalText(bySlug('senegal')), /No está incluido en el precio/);
  assert.doesNotMatch(practicalText(bySlug('maldivas')), /seguro de viaje incluido/);
});

test('transport reflects current inclusions and generated flight answers replace old estimates without urgency', () => {
  assert.match(practicalText(bySlug('el-palmar')), /coches compartidos/);
  assert.match(practicalText(bySlug('marruecos')), /Transfers: aeropuerto, spots y actividades/);
  for (const slug of ['marruecos', 'marruecos-avanzado', 'fuerteventura', 'senegal', 'maldivas']) {
    const trip = bySlug(slug);
    const flightFaq = salesFaqs(trip).find(([q]) => q === '¿Están incluidos los vuelos?');
    assert(flightFaq);
    assert.match(flightFaq[1], /no están incluidos/);
    assert.doesNotMatch(flightFaq[1], /1[.,]000|1[.,]300|415|405|50 €|ahora mismo|cuanto antes|suben/i);
  }
  assert.doesNotMatch(allText(bySlug('el-palmar')), /Los vuelos se contratan aparte/);
});

test('Maldivas retains optional snorkel without promising sightings and replaces the imported no-wave FAQ', () => {
  const trip = bySlug('maldivas');
  const answer = salesFaqs(trip).find(([q]) => q === '¿Y si no hay olas?')?.[1];
  assert(answer);
  assert.match(answer, /^El snorkel es una actividad opcional/);
  assert.match(answer, /dependen de la naturaleza/);
  assert.doesNotMatch(answer, /vamos a hacer snorkel con mantarrayas|garantiza/i);
  const generic = salesFaqs(trip).find(([q]) => q === '¿El programa de surf es fijo?')?.[1];
  assert.match(generic, /condiciones del mar/);
  assert.doesNotMatch(generic, /el equipo adapta.*spots/i);
});

test('upcoming destinations never advertise services left in their CMS document', () => {
  const pending = {...structuredClone(bySlug('maldivas')), state: 'upcoming'};
  assert.deepEqual(practicalDetails(pending), []);
  assert.deepEqual(salesFaqs(pending), []);
  assert.doesNotMatch(salesPitch(pending).text, /Lucas|pensión completa|snorkel|incluido/i);
});

test('unknown destinations and removed services have no inherited itinerary or material claims', () => {
  const unknown = {slug: 'nuevo-destino', state: 'confirmed', includes: [], excludes: [], story: []};
  // Only the general rule applies: compulsory insurance (términos de participación).
  const onlyInsurance = details => details.map(d => d.title);
  assert.deepEqual(onlyInsurance(practicalDetails(unknown)), ['El seguro para tu viaje']);
  assert.deepEqual(salesFaqs(unknown), []);
  const changed = {...bySlug('maldivas'), includes: [], excludes: [], story: []};
  assert.deepEqual(onlyInsurance(practicalDetails(changed)), ['El seguro para tu viaje']);
  assert.deepEqual(salesFaqs(changed), []);
  assert.doesNotMatch(allText(changed), /Lucas|snorkel|Transfers|pensión completa/i);
});


test('snorkel optionality is only asserted when the current inclusion explicitly says so', () => {
  const trip = {...bySlug('maldivas'), includes: ['Surf en barco 2 veces al día', 'Snorkel en arrecife', 'Excursiones opcionales'], story: []};
  assert(!salesFaqs(trip).some(([q]) => q === '¿Y si no hay olas?'));
  const explicit = {...trip, includes: [...trip.includes, 'Actividades de grupo y snorkel opcional']};
  assert(salesFaqs(explicit).some(([q, a]) => q === '¿Y si no hay olas?' && /^El snorkel es una actividad opcional/.test(a)));
});
