import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip} from './render-trips.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const palmar=trips.find(t=>t.slug==='el-palmar');
const summary=html=>html.match(/<section class="trip-essentials[\s\S]*?<\/section>/)[0];
const offer={label:'Early bird',price:599,firstPlace:1,lastPlace:8,active:true};

test('single-date essentials expose the actual date, level and group before the reading content without a second booking action',()=>{
 const original=structuredClone(palmar),html=renderTrip(palmar,trips),facts=summary(html);
 for(const value of ['4–8 dic 2026','4 noches','Todos los niveles','Hasta 30 personas'])assert(facts.includes(value));
 assert(html.indexOf(facts)<html.indexOf('id="destino"'));
 assert(!facts.includes('data-registration='));assert(!facts.includes('data-open-dates'));
 assert(facts.includes('href="#incluye"'));assert(html.includes('id="incluye"'));
 assert.deepEqual(palmar,original);
});

test('mobile offer copy belongs to the selected fare and does not combine capacities from different departures',()=>{
 const first={...palmar.departures[0],price:799,regularPrice:799,capacity:{total:30},promotions:undefined};
 const later={...first,id:'later',date:'18 dic 2026 — 22 dic 2026',start:'2026-12-18',end:'2026-12-22',price:699,regularPrice:699,capacity:{total:12},promotions:[offer]};
 const trip={...palmar,departures:[first,later]},html=renderTrip(trip,trips),facts=summary(html);
 assert(facts.includes('Ver 2 fechas'));assert(facts.includes('data-open-dates'));
 assert(facts.includes('Primeras 8 plazas'));assert(facts.includes(later.date));
 assert(!facts.includes('Hasta 30 personas'));assert(!facts.includes('Hasta 12 personas'));
 assert.match(facts,/grupo por confirmar/i);
 const dock=html.match(/<div class="trip-dock"[\s\S]*?<dialog/)[0];
 assert(dock.includes('599 €'));assert(dock.includes('Primeras 8 plazas'));
});

test('closed and pending trips never advertise the active promotional conditions in the essentials',()=>{
 const departure={...palmar.departures[0],price:699,regularPrice:699,promotions:[offer]};
 for(const extra of [{availability:'full'},{state:'upcoming'}]){
  const html=renderTrip({...palmar,departures:[departure],...extra},trips),facts=summary(html);
  assert(!facts.includes('Primeras 8 plazas'));assert(!facts.includes('Early bird'));
  if(extra.state==='upcoming'){assert.match(facts,/por anunciar/i);assert(!facts.includes('4–8 dic 2026'));}
 }
});

test('the programme avoids repeated photography and keeps the documented photos in the upper gallery',()=>{
 const html=renderTrip(palmar,trips);
 const programme=html.slice(html.indexOf('id="plan"'),html.indexOf('id="alojamiento"'));
 assert(!programme.includes('<img'));assert(!programme.includes('class="programme-photo"'));
 assert(html.includes('Surfista deslizándose en una ola en El Palmar, 2024.'));
 assert(html.includes('Recuerdo de un viaje de LST a El Palmar en 2024.'));
 assert(!programme.includes('lucas-concept-ai'));assert(!programme.includes('Retrato provisional'));
 const noImages=renderTrip({...palmar,hero:'',gallery:[]},trips);
 assert(!noImages.includes('class="programme-photo"'));assert(!noImages.includes('class="trip-team-moment"'));
 assert(!noImages.includes('lucas-concept-ai'));
});

test('the removed conditions panel leaves custom notices and actual cancellation FAQ answers intact',()=>{
 const html=renderTrip({...palmar,notice:'Requisito propio de esta salida.'},trips);
 assert(!html.includes('cancellation-details'));assert(!html.includes('booking-conditions'));
 assert(!html.includes('están pendientes de confirmar con el equipo'));
 assert(html.includes('Requisito propio de esta salida.'));
 assert(html.includes('id="condiciones"'),'Saved conditions anchors retain a destination');
 const specific=renderTrip({...palmar,faqs:[['¿Cómo se cancela?','Condición específica & documentada.']]},trips);
 assert(specific.includes('Condición específica &amp; documentada.'));
 assert(!specific.includes('están pendientes de confirmar con el equipo'));
});
