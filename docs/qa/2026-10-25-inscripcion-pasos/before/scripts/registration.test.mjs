import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {brevoValue, registrationDepartures, registrationUrl, brevoConfig, validateRegistrationMappings} from './brevo.mjs';
import {renderRegistration} from './render-registration.mjs';
import {renderTrip} from './render-trips.mjs';
import {adaptTrip} from './sanity-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {buildSite} from './build.mjs';
import {createSiteServer, renderPreviewPage} from './serve.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const get=slug=>structuredClone(trips.find(t=>t.slug===slug));
const inventory=JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const documents=prepareDrafts(inventory).map(doc=>({...doc,_id:doc._id.replace(/^drafts\./,'')}));

test('all eight client categories map by destination and exact start/end, regardless of order',()=>{
 const expected={hossegor:['1'],'el-palmar':['2'],marruecos:['3'],'marruecos-avanzado':['4'],fuerteventura:['5'],senegal:['6'],maldivas:['7','8']};
 for(const [slug,values] of Object.entries(expected)) {
  const t=get(slug);assert.deepEqual(t.departures.map(d=>brevoValue(t,d)),values);
  t.departures.reverse();assert.deepEqual(t.departures.map(d=>brevoValue(t,d)),values.toReversed());
 }
 const t=get('el-palmar');t.departures[0].end='2026-12-09';assert.equal(registrationUrl(t),'');
 t.slug='otro-destino';assert.equal(brevoValue(t,t.departures[0]),'');
 t.departures[0].brevoValue=42;assert.equal(brevoValue(t,t.departures[0]),'42');
});

test('pending, full and unmapped trips expose consultation without a form or signup link',()=>{
 for(const t of [Object.assign(get('el-palmar'),{state:'upcoming'}),Object.assign(get('el-palmar'),{availability:'full'}),Object.assign(get('el-palmar'),{slug:'sin-mapeo'})]) {
  assert.equal(registrationUrl(t),'');assert.doesNotMatch(renderRegistration(t),/<form\b|registration.js/);
  assert.match(renderRegistration(t),/no está disponible/);assert.doesNotMatch(renderTrip(t),/data-registration=/);
 }
 const t=get('maldivas');t.departures[0].availability='full';
 assert.deepEqual(registrationDepartures(t).map(d=>brevoValue(t,d)),['8']);
 assert.equal(registrationUrl(t,t.departures[0]),'');assert.doesNotMatch(renderRegistration(t),/name="VIAJE_SURF"[^>]*value="7"/);
});

test('canonical multi-date pages require an explicit date; single and dated aliases preselect correctly',()=>{
 const t=get('maldivas');assert.doesNotMatch(renderRegistration(t),/name="VIAJE_SURF"[^>]* checked/);
 assert.match(renderRegistration(t,'maldivas-2027-03-28'),/name="VIAJE_SURF"[^>]*value="8"[^>]* checked/);
 assert.doesNotMatch(renderRegistration(t,'maldivas-2027-03-28'),/name="VIAJE_SURF"[^>]*value="7"[^>]* checked/);
 t.departures[0].availability='full';
 const closedAlias=renderRegistration(t,'maldivas-2027-03-21');
 assert.doesNotMatch(closedAlias,/name="VIAJE_SURF"[^>]* checked/);
 assert.match(closedAlias,/id="registration-date-error" role="alert">/);
 assert.match(renderRegistration(get('hossegor')),/name="VIAJE_SURF"[^>]*value="1"[^>]* checked/);
 assert.equal(registrationUrl(t,t.departures[1]),'/inscripciones/maldivas/?salida='+t.departures[1].id);
});

test('Brevo payload keeps every supplied field, category value and required/optional distinction',()=>{
 const html=renderRegistration(get('el-palmar'));
 assert(html.includes(`action="${brevoConfig.action}"`));assert.match(html,/method="POST"/);
 for(const name of ['NOMBRE','APELLIDOS','DIRECCION','CIUDAD','CODIGO_POSTAL','PAIS','WHATSAPP','FECHADENACIMIENTO','DNI','EMAIL','MOTIVA'])assert.match(html,new RegExp(`<input[^>]*name="${name}"[^>]*required`),name);
 for(const name of ['ACOMPANANTES','MATERIAL_MEDIDAS','ALERGIAS_INTOLERANCIAS','ENFERMEDAD_PROBLEMA']){
  const input=html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))[0];assert(!input.includes('required'),name);
 }
 for(const [name,count] of [['NIVEL_SURF',4],['TALLA_CAMISETA',4],['CONQUIENVIAJO',2],['MATERIAL',2],['CONOCIDO',5]]) {
  assert.equal((html.match(new RegExp(`name="${name}"`,'g'))??[]).length,count);
  for(let i=1;i<=count;i++)assert.match(html,new RegExp(`name="${name}"[^>]*value="${i}"[^>]*required`));
 }
 assert.match(html,/<option value="\+34" selected>\+34 ES/);
 assert.match(html,/name="email_address_check" value=""/);assert.match(html,/name="locale" value="es"/);
 assert.doesNotMatch(html,/api-key|localStorage|sessionStorage|main.js|sib-styles.css/);
});

test('the optional CMS category is validated and preserved without exposing private metadata',()=>{
 const doc=structuredClone(documents[0]);doc.departures[0].brevoValue=101;doc.departures[0].privateNote='PRIVATE';
 const trip=adaptTrip(doc);assert.equal(trip.departures[0].brevoValue,101);assert(!JSON.stringify(trip).includes('PRIVATE'));
 for(const value of [0,-1,1.5,'3',NaN]){doc.departures[0].brevoValue=value;assert.throws(()=>adaptTrip(doc),/VIAJE_SURF/);}
 const palmar=get('el-palmar'),marruecos=get('marruecos');palmar.departures[0].brevoValue=3;assert.throws(()=>validateRegistrationMappings([palmar,marruecos]),/compartido/);
 const duplicate=get('maldivas');duplicate.departures[1].brevoValue=7;assert.throws(()=>renderRegistration(duplicate),/duplicado/);
});

test('registration links are additive and remain available in the native date fallback',()=>{
 const t=get('maldivas'),html=renderTrip(t);
 assert.match(html,/class="button reserve-main" data-open-dates/);
 for(const d of t.departures)assert(html.includes(registrationUrl(t,d)));
 const noJs=html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
 assert.equal((noJs.match(/data-registration=/g)??[]).length,2);
 assert.equal((noJs.match(/data-whatsapp=/g)??[]).length,2);
 const copy=get('el-palmar');copy.name='<script>bad</script>';copy.place='"<img>';const rendered=renderRegistration(copy);
 assert.doesNotMatch(rendered,/<script>bad|<img>/);assert.match(rendered,/&lt;script&gt;bad/);
});

test('build generates forms and aliases, preserves static serving and removes forms when unpublished',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'lst-brevo-'));const out=path.join(temp,'dist');
 try {
  await buildSite({out,read:async()=>documents});
  assert.match(await readFile(path.join(out,'inscripciones/maldivas/index.html'),'utf8'),/name="VIAJE_SURF"/);
  assert.match(await readFile(path.join(out,'inscripciones/maldivas-2027-03-28/index.html'),'utf8'),/value="8"[^>]* checked/);
  const server=createSiteServer({root:out});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
   const base=`http://127.0.0.1:${server.address().port}`;
   for(const suffix of ['','/'])assert.equal((await fetch(base+'/inscripciones/el-palmar'+suffix)).status,200);
   assert.equal((await fetch(base+'/inscripciones/desconocido/')).status,404);
  } finally {await new Promise(r=>server.close(r));}
  await buildSite({out,read:async()=>[]});
  assert.doesNotMatch(await readFile(path.join(out,'inscripciones/maldivas/index.html'),'utf8'),/<form\b/);
  assert.doesNotMatch(await readFile(path.join(out,'inscripciones/maldivas-2027-03-28/index.html'),'utf8'),/<form\b/);
 } finally {await rm(temp,{recursive:true,force:true});}
});

test('local preview uses current registration templates and availability without mutating published output',async()=>{
 const t=get('el-palmar');const file='dist/inscripciones/el-palmar/index.html';const before=await readFile(file,'utf8');
 t.availability='full';t.departures[0].availability='full';
 const preview=renderPreviewPage('inscripciones/el-palmar/index.html',before,[t]);
 assert.doesNotMatch(preview,/<form\b/);assert.match(preview,/no está disponible/);
 assert.equal(await readFile(file,'utf8'),before);
});


test('split Morocco signups and old URLs keep categories 3 and 4 isolated',()=>{
 for(const [slug,alias,value,other] of [['marruecos','marruecos-2027-01-17','3','4'],['marruecos-avanzado','marruecos-2027-01-24','4','3']]){
  const t=get(slug),html=renderRegistration(t,alias);
  assert.match(html,new RegExp('name="VIAJE_SURF"[^>]*value="'+value+'"[^>]* checked'));
  assert.doesNotMatch(html,new RegExp('name="VIAJE_SURF"[^>]*value="'+other+'"'));
  assert.match(renderTrip(t),new RegExp('href="/inscripciones/'+slug+'/"'));
  assert.equal(brevoValue(t,t.departures[0]),value);
 }
});
