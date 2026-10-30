import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip,publicDetail} from './render-trips.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const beginner=trips.find(t=>t.slug==='marruecos');
const advanced=trips.find(t=>t.slug==='marruecos-avanzado');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('level profiles retain their copy while contextual enquiries support level and group fit',()=>{
 const html=renderTrip(beginner,trips);
 const level=html.match(/<section id="nivel"[\s\S]*?<\/section>/)[0];
 assert.match(level,/<h2>¿Es este tu viaje\?<\/h2>/);
 for(const [title,text] of beginner.audience.profiles){assert(level.includes(escape(title)));assert(level.includes(escape(text)));}
 for(const value of [beginner.audience.text,beginner.audience.objective])assert(!level.includes(escape(value)));
 assert.doesNotMatch(level,/Para este viaje:|Consultar mi nivel/);
 assert.match(level,/¿Dudas con tu nivel\?/);assert.match(level,/¿Vienes por tu cuenta\?/);assert.match(level,/data-whatsapp=/);
 assert.match(level,/href="\/niveles\/"/);
 const advancedLevel=renderTrip(advanced,trips).match(/<section id="nivel"[\s\S]*?<\/section>/)[0];
 assert(advancedLevel.includes(escape(publicDetail(advanced.levelRequirement))));
});

test('the surf plan replaces both extra programme disclosures while older trips retain their only programme',()=>{
 const html=renderTrip(beginner,trips);
 assert.doesNotMatch(html,/Ver el programa completo|Sobre este viaje|programme-context|class="programme-full"/);
 for(const [title,text] of beginner.surfPlan){assert(html.includes(escape(title)));assert(html.includes(escape(publicDetail(text))));}
 const old=trips.find(t=>!t.surfPlan?.length),fallback=renderTrip(old,trips);
 for(const [,text] of old.story)assert(fallback.includes(escape(publicDetail(text))));
});

test('the removed accommodation preview notice does not suppress other editorial gallery notes',()=>{
 const html=renderTrip(beginner,trips);
 assert(!html.includes(beginner.stay.galleryNote));
 for(const [image,alt,caption] of beginner.stay.gallery){assert(html.includes(image));assert(html.includes(escape(alt)));assert(html.includes(escape(caption)));}
 const note='La distribución de las habitaciones se confirma con el equipo.';
 const custom=renderTrip({...beginner,stay:{...beginner.stay,galleryNote:note}});
 assert(custom.includes(escape(note)));
});

test('booking separates the primary action, supporting links and conditions without the removed section navigation',()=>{
 const html=renderTrip(beginner,trips);
 const sidebar=html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];
 assert(sidebar.indexOf('booking-card-price')<sidebar.indexOf('booking-card-cta'));
 const secondary=sidebar.match(/<div class="booking-secondary">([\s\S]*?)<\/div>/)[1];
 assert.match(secondary,/dossier-link/);assert.match(secondary,/data-whatsapp=/);assert.doesNotMatch(secondary,/data-registration=/);
 assert.doesNotMatch(sidebar,/aria-label="En este viaje"|Explora el viaje|booking-page-nav/);
 const reserve=html.match(/<section id="reservar"[\s\S]*?<\/section>/)[0];
 assert.match(reserve,/reserve-copy/);
 const actions=reserve.match(/<div class="reserve-actions">([\s\S]*?)<\/div>/)[1];
 assert.match(actions,/reserve-main[^>]*data-registration=/);
 assert.match(actions,/reserve-whatsapp[^>]*data-whatsapp=/);
 assert.match(reserve,/reserve-note/);assert.match(reserve,/La inscripción no confirma la reserva/);assert.match(reserve,/href="#incluye"/);
 const costs=html.match(/<section id="incluye"[\s\S]*?<\/section>/)[0];
 assert.match(costs,/booking-conditions/);assert.match(costs,/Pago y confirmación de la plaza/);
});

test('shared autonomy and new requirements remain visible with any number of editorial level profiles',()=>{
 const requirement='Es obligatorio remontar solo y coger olas propias sin ayuda.';
 for(const base of [beginner,trips.find(t=>t.slug==='maldivas')]){
  const trip={...base,levelRequirement:requirement,audience:{profiles:[['Nivel II','Primeras paredes.'],['Nivel III','Primeros giros.']]}};
  const level=renderTrip(trip,trips).match(/<section id="nivel"[\s\S]*?<\/section>/)[0];
  assert.equal(level.split(requirement).length-1,1);
  assert.doesNotMatch(level,/Para este viaje:/);
 }
});
