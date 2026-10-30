import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip, publicDetail} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';

const trips = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8')).trips;
const source = trips.find(t => t.slug === 'marruecos');
const section = (html, id) => html.match(new RegExp(`<section id="${id}"[\\s\\S]*?<\\/section>`))[0];
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

test('payment, notice and single-date PDF survive a programme without any inclusion lists', () => {
  const trip = {...source, includes: [], excludes: [], inclusionsNote: '', notice: 'Consulta los requisitos de esta salida.',
    departures: [{...source.departures[0], payment: {depositAmount: 321, terms: 'Condiciones propias de la fecha.'}}]};
  const cost = section(renderTrip(trip, trips), 'incluye');
  assert(cost.includes('321 €'));
  assert(cost.includes('Condiciones propias de la fecha.'));
  assert(cost.includes(trip.notice));
  assert(cost.includes('mobile-booking-options'));
  assert(cost.includes(source.departures[0].dossier));
  assert(cost.includes('Por confirmar'));
  assert(!cost.includes('Pensión completa'));
});

test('payment summaries preserve each date and never replace explicit null with global terms', () => {
  const first = {...source.departures[0], id: 'one', date: 'Primera salida', payment: {depositAmount: 111, terms: 'Condición exclusiva primera.'}};
  const second = {...first, id: 'two', date: 'Segunda salida', start: '2027-02-01', payment: null};
  const trip = {...source, payment: {depositAmount: 999, terms: 'Condición general que no aplica.'}, departures: [first, second]};
  const cost = section(renderTrip(trip, trips), 'incluye');
  const dates = cost.split('<div class="payment-date">').slice(1);
  assert(dates[0].includes('111 €'));assert(dates[0].includes('Condición exclusiva primera.'));
  assert(dates[1].includes('Segunda salida'));assert(!dates[1].includes('111 €'));
  assert(!cost.includes('999 €'));assert(!cost.includes('Condición general que no aplica.'));
});

test('the early offer pairs price, promotion date and truthful group capacity across heterogeneous departures', () => {
  const a = {...source.departures[0], id: 'early', capacity: {total: 8}, promotions: undefined, price: 899, regularPrice: 899};
  const b = {...a, id: 'later', date: 'Salida posterior', start: '2027-02-01', capacity: null, promotions: [{label: 'Oferta posterior', price: 799, active: true, condition: 'Cupo confirmado'}]};
  const trip = {...source, capacity: {total: 99}, departures: [a, b]};
  const html = renderTrip(trip, trips);
  const overview = html.match(/<section class="trip-offer-overview trip-shell"[\s\S]*?<\/section>/)[0];
  assert(overview.includes('Desde 799 €'));assert(overview.includes('Salida posterior'));
  assert(!overview.includes('Hasta 99 personas'));assert(!overview.includes('Hasta 8 personas'));
  const level = section(html, 'nivel');assert(!level.includes('grupo de hasta'));
});

test('cancellation component quotes only this trip and otherwise asks without promising refunds', () => {
  const answer = 'Cancelación <específica>: consulta el plazo de 12 días.';
  const trip = {...source, faqs: [['¿Cómo se cancela?', answer]]};
  const html = renderTrip(trip, trips), cost = section(html, 'incluye');
  assert(cost.includes(escape(answer)));assert(!cost.includes('<específica>'));
  const without = section(renderTrip({...source, faqs: []}, trips), 'incluye');
  assert(without.includes('Cambios y cancelación'));assert(without.includes('Consultar estas condiciones'));
  assert(!without.includes('12 días'));assert(!without.includes('cancelación gratuita'));
});

test('essential activities and spots are visible lists while photo galleries retain their controls', () => {
  const html = renderTrip(source, trips);
  for (const [id, field] of [['spots', 'spots'], ['actividades', 'activities']]) {
    const content = section(html, id);
    assert(!content.includes('data-carousel'));assert(!content.includes('desplazamiento horizontal'));
    for (const item of source[field]) assert(content.includes(escape(publicDetail(item.text))));
  }
  assert(html.includes('data-open-gallery'));assert(html.includes('data-photo-next'));
  const overview = html.indexOf('aria-label="Resumen del viaje"');
  assert(overview < html.indexOf('id="nivel"'));assert(html.indexOf('id="plan"') < html.indexOf('id="actividades"'));
});

test('registration keeps the original required fields and category payload while clarifying no payment', () => {
  const html = renderRegistration(source);
  for (const name of ['VIAJE_SURF', 'NOMBRE', 'APELLIDOS', 'EMAIL', 'WHATSAPP', 'DNI', 'NIVEL_SURF', 'MATERIAL', 'MOTIVA']) {
    assert(html.includes(`name="${name}"`));
  }
  assert(html.includes('aquí no realizas ningún pago'));
  assert.equal((html.match(/data-registration-step="/g) || []).length, 5);
});

test('global closure overrides per-date availability in the economic decision block', () => {
  for (const departures of [source.departures, [...source.departures, {...source.departures[0], id: 'other', date: 'Otra salida', start: '2027-02-01'}]]) {
    const html = renderTrip({...source, availability: 'full', departures}, trips);
    const cost = section(html, 'incluye');
    assert(cost.includes('Completo'));assert(!cost.includes('Plazas disponibles'));
    assert(!cost.includes('data-registration='));assert(!cost.includes('Reserva con'));
  }
});
