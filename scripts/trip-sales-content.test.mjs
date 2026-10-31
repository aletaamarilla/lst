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

test('meal arrangements remain specific: full board, two free dinners, or lunches paid separately', () => {
  assert.match(practicalText(bySlug('el-palmar')), /Pensión completa: cena del viernes a comida del martes/);
  assert.match(practicalText(bySlug('hossegor')), /desayuno del domingo/);
  assert.match(practicalText(bySlug('fuerteventura')), /2 cenas en casa/);
  assert.match(practicalText(bySlug('fuerteventura')), /Por tu cuenta: 2 cenas libres/);
  assert.doesNotMatch(practicalText(bySlug('fuerteventura')), /Pensión completa/);
  assert.match(practicalText(bySlug('senegal')), /Desayuno y cena todos los días/);
  assert.match(practicalText(bySlug('senegal')), /Por tu cuenta: Comidas del mediodía; Bebidas de la cena del desierto/);
  assert.doesNotMatch(practicalText(bySlug('senegal')), /Pensión completa/);
  assert.match(practicalText(bySlug('maldivas')), /Pensión completa: desayuno, comida y cena/);
});

test('the Moroccan programmes keep different equipment requirements, and Maldivas never inherits included equipment', () => {
  const beginner = practicalText(bySlug('marruecos'));
  const advanced = practicalText(bySlug('marruecos-avanzado'));
  assert.match(beginner, /Material de iniciación y neoprenos/);
  assert.match(beginner, /Tablas evolutivas y shortboards: alquiler aparte/);
  assert.doesNotMatch(advanced, /Material de iniciación y neoprenos/);
  assert.match(advanced, /Tabla propia o alquiler en destino/);
  assert.match(practicalText(bySlug('hossegor')), /Aparte del precio: Material de surf/);
  assert.match(practicalText(bySlug('maldivas')), /Consulta.*tabla y equipación/);
  assert.doesNotMatch(practicalText(bySlug('maldivas')), /material.*incluido|neopreno.*incluido/i);
});

test('school cover and travel insurance are distinguished without inventing a policy for Maldivas', () => {
  assert.match(practicalText(bySlug('el-palmar')), /seguro de la escuela local/);
  assert.match(practicalText(bySlug('el-palmar')), /distinta de un seguro de viaje/);
  assert.match(practicalText(bySlug('senegal')), /seguro de viaje no está incluido/);
  assert.match(practicalText(bySlug('maldivas')), /descuento no equivale a una póliza incluida/);
  assert.doesNotMatch(practicalText(bySlug('maldivas')), /seguro de viaje no está incluido|seguro de viaje incluido/);
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
  assert.deepEqual(practicalDetails(unknown), []);
  assert.deepEqual(salesFaqs(unknown), []);
  const changed = {...bySlug('maldivas'), includes: [], excludes: [], story: []};
  assert.deepEqual(practicalDetails(changed), []);
  assert.deepEqual(salesFaqs(changed), []);
  assert.doesNotMatch(allText(changed), /Lucas|snorkel|Transfers|pensión completa/i);
});


test('snorkel optionality is only asserted when the current inclusion explicitly says so', () => {
  const trip = {...bySlug('maldivas'), includes: ['Surf en barco 2 veces al día', 'Snorkel en arrecife', 'Excursiones opcionales'], story: []};
  assert(!salesFaqs(trip).some(([q]) => q === '¿Y si no hay olas?'));
  const explicit = {...trip, includes: [...trip.includes, 'Actividades de grupo y snorkel opcional']};
  assert(salesFaqs(explicit).some(([q, a]) => q === '¿Y si no hay olas?' && /^El snorkel es una actividad opcional/.test(a)));
});
