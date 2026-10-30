import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {prepareDrafts} from './import-departures.mjs';
import {adaptTrip, adaptTrips} from './sanity-trips.mjs';
import {tripName} from './trip-groups.mjs';
import {levelsFor, levelLabel, departureMessage, tripFacts} from './trip-model.mjs';
import {renderTrip} from './render-trips.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {renderHomeTrips} from './render-home-trips.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {buildSite} from './build.mjs';

const inventory=JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const documents=()=>prepareDrafts(inventory).map(d=>({...d,_id:d._id.slice(7),availability:'available',
 dossier:'https://example.com/'+d.slug.current+'.pdf',
 departures:d.departures.map(x=>({...x,price:899}))}));
const find=(docs,slug)=>docs.find(d=>d.slug.current===slug);
const morocco=['marruecos-2027-01-17','marruecos-2027-01-24'];
const maldives=['maldivas-2027-03-21','maldivas-2027-03-28'];

test('editorial destination names exclude old imported labels',()=>{
 for(const name of ['Marruecos · nivel 1–2','Marruecos · nivel 3','Marruecos · niveles II–III'])assert.equal(tripName(name),'Marruecos');
 for(const name of ['Maldivas · Semana Santa','Maldivas · Pascua'])assert.equal(tripName(name),'Maldivas');
 assert.equal(tripName('Marruecos avanzado'),'Marruecos avanzado');
});

test('eight source dates become seven trips: two Morocco programmes and one Maldives programme',()=>{
 const docs=documents(),before=structuredClone(docs),trips=adaptTrips(docs);
 assert.equal(trips.length,7);assert.deepEqual(docs,before);
 assert.deepEqual(trips.map(t=>t.name).sort(),['El Palmar','Fuerteventura','Hossegor','Maldivas','Marruecos','Marruecos avanzado','Senegal']);
 const trip=trips.find(t=>t.slug==='maldivas');
 assert.deepEqual(trip.aliases,maldives);assert.equal(trip.departures.length,2);
 assert.deepEqual(levelsFor(trip),[2,3]);assert.equal(levelLabel(trip),'Niveles II–III');
 assert.deepEqual(trip.departures.map(d=>d.dossier),maldives.map(slug=>'https://example.com/'+slug+'.pdf'));
 assert(trip.departures.every(d=>d.capacity.total===10));
 for(const d of trip.departures){assert.equal(d.levels,undefined);assert.equal(d.programme,undefined);assert(renderTrip(trip).includes(encodeURIComponent(departureMessage(trip,d))));}
});

test('each Morocco product retains its own programme, material, requirements and dossier',()=>{
 const docs=documents(),trips=adaptTrips(docs),basic=trips.find(t=>t.slug==='marruecos'),advanced=trips.find(t=>t.slug==='marruecos-avanzado');
 assert.deepEqual(basic.levels,[1,2]);assert.deepEqual(advanced.levels,[3]);
 for(const [i,trip] of [basic,advanced].entries()){
  const source=adaptTrip(find(docs,morocco[i]));
  assert.equal(trip.departures.length,1);assert.deepEqual(trip.aliases,[morocco[i]]);
  for(const field of ['includes','excludes','story','levelRequirement','levelText'])assert.deepEqual(trip[field],source[field]);
  assert.equal(trip.departures[0].dossier,source.dossier);
  const html=renderTrip(trip,trips);
  assert(!html.includes('data-open-dates'));assert(!html.includes('departure-programme'));
  assert(html.includes(source.levelRequirement));
  assert(html.includes('/viajes/'+(i?'marruecos':'marruecos-avanzado')+'/'));
 }
 assert(basic.includes.includes('Material de iniciación y neoprenos'));
 assert(!advanced.includes.includes('Material de iniciación y neoprenos'));
 assert(advanced.includes.includes('Surf coaching intensivo con Lucas'));
 assert.equal(tripFacts(advanced)[2][1],'Nivel III · '+advanced.levelRequirement);
});

test('stale per-date levels, requirements or programmes fail before publication',()=>{
 for(const override of [{levels:[3]},{levelRequirement:'Otra autonomía'},{programme:{includes:['Otro material']}}]){
  const doc=documents()[0];Object.assign(doc.departures[0],override);
  assert.throws(()=>adaptTrip(doc),/Separa el nivel y el programa/);
 }
 const doc=documents()[0];doc.departures[0].levels=[];doc.departures[0].levelRequirement='';
 assert.deepEqual(adaptTrip(doc).levels,doc.levels);
});

test('same destination and level with a different itinerary never merge',()=>{
 for(const change of [{story:[{title:'Otra ruta',text:'Programa diferente'}]},{includes:['Otros servicios']},{levelRequirement:'Otra autonomía'}]){
  const docs=documents().filter(d=>maldives.includes(d.slug.current));Object.assign(docs[1],change);
  const trips=adaptTrips(docs);assert.equal(trips.length,2);
  assert.deepEqual(trips.map(t=>t.slug),maldives);
  assert(trips.every(t=>t.departures.length===1));
 }
});

test('all discovery views expose independent Morocco cards with a fixed range',()=>{
 const trips=adaptTrips(documents()).filter(t=>t.slug.startsWith('marruecos'));
 for(const html of [renderHomeTrips('<!-- home-trips:start --><!-- home-trips:end -->',trips),renderCatalog('<!-- catalog:start --><!-- catalog:end -->',trips),renderLevelTrips('<!-- level-trips:start --><!-- level-trips:end -->',trips)]){
  assert(html.includes('/viajes/marruecos/'));assert(html.includes('/viajes/marruecos-avanzado/'));
  assert(html.includes('Marruecos avanzado'));assert(html.includes('Niveles I–II'));assert(html.includes('Nivel III'));
  assert(!html.includes('Nivel según la fecha'));
 }
 const catalog=renderCatalog('<!-- catalog:start --><!-- catalog:end -->',trips);
 assert.equal((catalog.match(/data-catalog-trip/g)||[]).length,2);
 assert(catalog.includes('data-levels="1 2"'));assert(catalog.includes('data-levels="3"'));
});

test('Maldives keeps per-date availability and payment without mixing booking conditions',()=>{
 const docs=documents().filter(d=>maldives.includes(d.slug.current));
 docs[0].availability='full';docs[1].availability='available';docs[1].payment={depositAmount:321,terms:'Condición de la segunda fecha'};
 const trip=adaptTrips(docs)[0],html=renderTrip(trip);
 assert.equal(trip.availability,'available');assert(html.includes('Consultar alternativas'));
 assert.deepEqual(trip.departures.map(d=>d.availability),['full','available']);
 assert(html.includes('321 €'));assert(html.includes('Condición de la segunda fecha'));
 docs[1].availability='full';
 const fullHtml=renderTrip(adaptTrips(docs)[0]);
 assert.match(fullHtml,/data-open-dates/);assert.match(fullHtml,/id="departure-dialog"/);
 assert.doesNotMatch(fullHtml,/data-registration=/);
 const fullOptions=[...fullHtml.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 assert.equal(fullOptions.length,2);
 for(const [i,option] of fullOptions.entries()){
  assert(option.includes(docs[i].dossier));assert.match(option,/Consultar alternativas/);
  assert.doesNotMatch(option,/Inscribirme/);
 }
});

test('canonical and dated URLs survive splitting, regrouping and withdrawal',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'lst-fixed-programme-')),out=path.join(dir,'site');
 const docs=documents();
 try{
  await buildSite({out,read:async()=>docs});
  for(const [slug,aliases] of [['maldivas',maldives],['marruecos',[morocco[0]]],['marruecos-avanzado',[morocco[1]]]]){
   const canonical=await readFile(path.join(out,'viajes',slug,'index.html'),'utf8');
   for(const alias of aliases)assert.equal(await readFile(path.join(out,'viajes',alias,'index.html'),'utf8'),canonical);
  }
  await buildSite({out,template:out,read:async()=>docs.filter(d=>d.slug.current!==morocco[1])});
  for(const slug of ['marruecos-avanzado',morocco[1]])assert.match(await readFile(path.join(out,'viajes',slug,'index.html'),'utf8'),/no está publicado/);
  assert.match(await readFile(path.join(out,'viajes/marruecos/index.html'),'utf8'),/Material de iniciación/);
  await buildSite({out,template:out,read:async()=>[]});
  assert.match(await readFile(path.join(out,'viajes/maldivas/index.html'),'utf8'),/no está publicado/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('native multi-date documents inherit their PDF and vary availability independently',()=>{
 const doc=documents()[0];doc.slug.current='native-trip';doc.availability='full';
 doc.departures.push({...doc.departures[0],_key:'second',dossier:'https://example.com/special.pdf'});doc.departures[0].availability='available';
 const trip=adaptTrips([doc])[0],html=renderTrip(trip);
 assert.equal(trip.availability,'available');assert(html.includes('id="departure-dialog"'));
 for(const pdf of [doc.dossier,'https://example.com/special.pdf'])assert(html.includes(pdf));
});

test('pending advanced Morocco remains separate from the confirmed basic trip',()=>{
 const docs=documents().filter(d=>morocco.includes(d.slug.current));
 docs[1].state='upcoming';docs[1].departures=[];docs[1].availability='enquiry';
 const trips=adaptTrips(docs);assert.equal(trips.length,2);
 const pending=trips.find(t=>t.slug==='marruecos-avanzado');
 assert.equal(pending.state,'upcoming');assert.equal(pending.availability,'enquiry');assert.equal(pending.departures.length,0);
});

test('obsolete invisible level titles never split otherwise identical dates',()=>{
 const docs=documents().filter(d=>maldives.includes(d.slug.current));docs[1].levelTitle='Título retirado';
 const trips=adaptTrips(docs);assert.equal(trips.length,1);assert.equal(trips[0].slug,'maldivas');assert.equal(trips[0].departures.length,2);
});
