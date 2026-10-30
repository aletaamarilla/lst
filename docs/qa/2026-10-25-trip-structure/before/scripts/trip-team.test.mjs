import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {accompanimentItems,renderTrip} from './render-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {adaptTrip} from './sanity-trips.mjs';
const inventory=JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const draft=prepareDrafts(inventory)[0];
const fixture=()=>adaptTrip({...structuredClone(draft),_id:draft._id.slice(7)});

test('accompaniment reuses exact services from its own confirmed departure without borrowing staff',()=>{
 const trip={state:'confirmed',includes:['2 noches','Coaching con Lucas','Acompañamiento del equipo local','Coaching con Lucas']};
 const before=structuredClone(trip);
 assert.deepEqual(accompanimentItems(trip),['Coaching con Lucas','Acompañamiento del equipo local']);
 assert.deepEqual(accompanimentItems({state:'confirmed',includes:['Clases de surf con la escuela local','Surf todos los días con clases o surf guiding']}),['Clases de surf con la escuela local','Surf todos los días con clases o surf guiding']);
 assert.deepEqual(trip,before);
});

test('pending programmes and explicit editorial team text retain their own authority',()=>{
 assert.deepEqual(accompanimentItems({state:'upcoming',includes:['Coaching con Lucas']}),[]);
 assert.deepEqual(accompanimentItems({state:'confirmed',team:{title:'Equipo de esta salida',text:'Coach elegido para esta fecha.'},includes:['Coaching histórico']}),[]);
 assert.deepEqual(accompanimentItems({state:'confirmed'}),[]);
});

test('rendered accompaniment is escaped and its enquiry retains destination and existing WhatsApp channel',()=>{
 const trip={...fixture(),includes:['Coaching con Lucas <olas> & técnica','Acompañamiento 24h']};
 delete trip.team;
 const html=renderTrip(trip);
 const section=html.match(/<section class="trip-block trip-team">([\s\S]*?)<\/section>/)[1];
 assert.match(section,/Coaching con Lucas &lt;olas&gt; &amp; técnica/);
 assert.doesNotMatch(section,/<olas>/);
 assert.match(section,/Acompañamiento 24h/);
 const contact=section.match(/data-whatsapp="[^"]+" href="([^"]+)"/)[1];
 const url=new URL(contact);
 assert.equal(url.origin,'https://wa.me');
 assert.equal(url.pathname,'/34648189257');
 assert(url.searchParams.get('text').includes(trip.name));
 assert(url.searchParams.get('text').includes('Quién acompaña'));
});

test('a destination without confirmed staff keeps a candid enquiry without asserting named people',()=>{
 const trip={...fixture(),state:'upcoming',includes:['Coaching con Lucas']};
 delete trip.team;
 const section=renderTrip(trip).match(/<section class="trip-block trip-team">([\s\S]*?)<\/section>/)[1];
 assert.match(section,/está pendiente/);
 assert.doesNotMatch(section,/trip-team-roles|Coaching con Lucas/);
 assert.match(section,/Consultar el acompañamiento/);
});
