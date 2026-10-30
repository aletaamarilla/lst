import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compactDepartureDate, levelProfileTitle, surfRhythm} from './trip-decision.mjs';
import {renderTrip} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const morocco=trips.find(t=>t.slug==='marruecos');
const maldives=trips.find(t=>t.slug==='maldivas');
test('the removed upper summary does not duplicate the trip while commercial details remain available',()=>{
  const html=renderTrip(morocco,trips);
  assert.doesNotMatch(html,/trip-offer-overview|offer-scope|offer-promise|overview-cta|price-decision|decision-price/);
  const cost=html.slice(html.indexOf('id="incluye"'),html.indexOf('id="dudas"'));
  for(const text of ['7 noches en Surf House','Pensión completa','Vuelos','Seguro de viaje'])assert(cost.includes(text));
  assert(html.includes(morocco.departures[0].date));
  assert(html.includes('booking-card-cta'));assert(html.includes('dock-cta'));
});

test('section navigation is initially hidden and every link addresses an existing section',()=>{
  for(const trip of [morocco,{...maldives,stay:null},{...morocco,state:'upcoming',departures:[]}]){
    const html=renderTrip(trip),nav=html.match(/<nav class="trip-section-nav"[^>]*>[\s\S]*?<\/nav>/)[0];
    assert.match(nav,/<nav[^>]*\bhidden>/);
    for(const [,id] of nav.matchAll(/href="#([^"]+)"/g))assert(html.includes(`id="${id}"`));
    if(!trip.stay)assert(!nav.includes('#alojamiento'));
    assert(!html.includes('trip-offer-overview'));
  }
});

test('all date alternatives and their own prices, deposits and actions remain visible before optional documents',()=>{
  const html=renderTrip(maldives,trips);
  const dialog=html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)[0];
  assert(dialog.includes('21–28 mar 2027'));assert(dialog.includes('28 mar–4 abr 2027'));
  const options=[...dialog.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  assert.equal(options.length,2);
  for(let i=0;i<2;i++){
    const split=options[i].indexOf('<details class="departure-more">');
    assert(split>0);const main=options[i].slice(0,split),more=options[i].slice(split);
    assert(main.includes(maldives.departures[i].id));assert(main.includes('data-registration='));assert(main.includes('departure-summary-deposit'));
    assert(more.includes(maldives.departures[i].dossier));assert(more.includes('Condiciones de pago'));assert(more.includes('data-whatsapp='));
  }
});

test('date compaction preserves custom labels and years spanning New Year',()=>{
  assert.equal(compactDepartureDate({date:'17 ene 2027 — 24 ene 2027'}),'17–24 ene 2027');
  assert.equal(compactDepartureDate({date:'28 mar 2027 — 4 abr 2027'}),'28 mar–4 abr 2027');
  for(const date of ['Fecha editorial propia','29 dic 2027 — 4 ene 2028'])assert.equal(compactDepartureDate({date}),date);
});

test('inclusions and exclusions remain clear without the removed payment and cancellation panel',()=>{
  const html=renderTrip(morocco,trips),start=html.indexOf('id="incluye"'),cost=html.slice(start,html.indexOf('id="dudas"'));
  assert(cost.includes('id="included-title"'));assert(cost.includes('id="excluded-title"'));
  assert(!cost.includes('Pago y confirmación'));assert(!cost.includes('cancellation-details'));
  assert(html.includes('Señal al confirmar tu plaza'));assert(html.includes('dossier-link'));
});

test('level names agree with the guide while custom editorial headings and numeric Brevo values survive',()=>{
  const html=renderTrip(morocco,trips),form=renderRegistration(morocco);
  for(const name of ['Rookies','Aprendices']){assert(html.includes(name));assert(form.includes(name));}
  for(const [value,label] of [[1,'Rookies'],[2,'Aprendices'],[3,'Riders'],[4,'Supercracks']])assert.match(form,new RegExp(`name="NIVEL_SURF" value="${value}" required><span>[^<]*${label}`));
  assert.equal(levelProfileTitle('Mi grupo especial'),'Mi grupo especial');assert.equal(levelProfileTitle('toString'),'toString');
  assert(form.includes('data-date-picker open'));assert(form.includes('data-selected-fare'));
  assert(form.includes('Enviar solicitud'));assert.equal((form.match(/data-registration-step="/g)||[]).length,5);
});

test('day rhythm only illustrates the activities documented in this trip without fixing hours or adding sessions',()=>{
  assert.deepEqual(surfRhythm(morocco),['Preparar el cuerpo','Entrar al agua','Revisar y aprender']);
  assert.deepEqual(surfRhythm({...morocco,surfPlan:[['Coaching','Trabajo en el agua.']]}),['Entrar al agua']);
  assert.deepEqual(surfRhythm({...morocco,state:'upcoming'}),[]);
  const html=renderTrip(morocco,trips);assert(html.includes('Secuencia orientativa'));
  for(const [,copy] of morocco.surfPlan)assert(html.includes(copy));
});
