import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {programmeSummary, compactDepartureDate, levelProfileTitle, surfRhythm} from './trip-decision.mjs';
import {renderTrip} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const morocco=trips.find(t=>t.slug==='marruecos');
const maldives=trips.find(t=>t.slug==='maldivas');
const overview=html=>html.match(/<section class="trip-offer-overview trip-shell"[\s\S]*?<\/section>/)[0];

test('the opening exposes programme inclusions and extra costs before level and long-form content',()=>{
  const html=renderTrip(morocco,trips),opening=overview(html);
  for(const text of ['7 noches en Surf House','Pensión completa','Vuelos','Seguro de viaje'])assert(opening.includes(text));
  assert(opening.includes('Aparte del precio:'));
  assert(opening.includes('href="#incluye"'));
  assert(html.indexOf('offer-scope')<html.indexOf('id="nivel"'));
});

test('summary services are literal, scoped to this programme and never inferred for pending trips',()=>{
  const trip={...morocco,includes:['Casa propia','Clases <especiales>'],excludes:['Vuelo <aparte>']};
  assert.deepEqual(programmeSummary(trip),['Clases <especiales>']);
  const opening=overview(renderTrip(trip));
  assert(opening.includes('Clases &lt;especiales&gt;'));assert(opening.includes('Vuelo &lt;aparte&gt;'));
  assert(!opening.includes('Pensión completa'));assert(!opening.includes('<especiales>'));
  assert.deepEqual(programmeSummary({...trip,state:'upcoming'}),[]);
  assert(!overview(renderTrip({...trip,state:'upcoming',departures:[]})).includes('offer-scope'));
});

test('all date alternatives and their own prices, deposits and actions remain visible before optional documents',()=>{
  const html=renderTrip(maldives,trips),opening=overview(html);
  assert(opening.includes('21–28 mar 2027'));assert(opening.includes('28 mar–4 abr 2027'));
  const dialog=html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)[0];
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

test('inclusions and exclusions precede the complete unchanged payment and cancellation conditions',()=>{
  const html=renderTrip(morocco,trips),start=html.indexOf('id="incluye"'),cost=html.slice(start,html.indexOf('id="dudas"'));
  assert(cost.indexOf('id="included-title"')<cost.indexOf('Pago y confirmación'));
  assert(cost.indexOf('id="excluded-title"')<cost.indexOf('Pago y confirmación'));
  assert(cost.includes(morocco.departures[0].payment.terms));assert(cost.includes('Cambios y cancelación'));
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
