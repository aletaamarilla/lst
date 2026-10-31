import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareDrafts} from './import-departures.mjs';
import {adaptTrip, adaptTrips} from './sanity-trips.mjs';
import {renderHomeTrips, renderHomeTrip} from './render-home-trips.mjs';
import {renderTrip, tripDeposit} from './render-trips.mjs';
import {planEditorialPublication, editorialPublicationMutations} from './publish-trip-editorial.mjs';
import {registrationDepartures} from './brevo.mjs';
import {planEditorialMigration, applyEditorialPlan, editorialDrafts, editorialVersion, editorialDraftMutations, resolveEditorialAssets} from './migrate-trip-editorial.mjs';
const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const raw = () => {const d=prepareDrafts(inventory)[0];return {...structuredClone(d),_id:d._id.slice(7),_rev:'revision-a'};};
const shell = '<!-- home-trips:start --><!-- home-trips:end -->';
const image = {url:'https://cdn.sanity.io/images/q5bj2rn2/production/test-1200x800.webp',alt:'Tarjeta <propia> & mar'};

test('CMS card copy and photo work for an arbitrary new trip without changing shared covers or source data',()=>{
 const doc={...raw(),tagline:'Texto <propio> & breve',cardImage:image,destinationDescription:'Destino <nuevo> & único',testimonial:{quote:'Una cita <real>',author:'Ana & Luis',trip:'Otra experiencia'},team:{title:'Tu equipo',text:'El acompañamiento de esta salida.'}};
 const trip=adaptTrip(doc),before=structuredClone(trip),home=renderHomeTrips(shell,[trip]),detail=renderTrip(trip);
 assert(home.includes('Texto &lt;propio&gt; &amp; breve'));assert(home.includes('alt="Tarjeta &lt;propia&gt; &amp; mar"'));
 assert(home.includes(image.url));assert(!renderHomeTrip(trip).includes(image.url));
 assert(detail.includes('Destino &lt;nuevo&gt; &amp; único'));assert(detail.includes('Una cita &lt;real&gt;'));assert(detail.includes('Ana &amp; Luis'));
 assert(!detail.includes('<real>'));assert.deepEqual(trip,before);
 const renamed={...trip,slug:'nuevo-destino',id:'nuevo-destino'};
 assert(renderHomeTrips(shell,[renamed]).includes(image.url));assert(renderTrip(renamed).includes('Una cita &lt;real&gt;'));
});

test('optional editorial fields can be removed without reviving destination-specific photos, quotes or people',()=>{
 const trip={...adaptTrip(raw()),slug:'marruecos',id:'marruecos',tagline:'',hero:'',gallery:[]};
 const html=renderTrip(trip);
 assert(!html.includes('trip-guest-voice'));assert(!html.includes('Lucas, tu coordinador'));
 assert(!renderHomeTrips(shell,[trip]).includes('home-trip-description'));
 for(const change of [{cardImage:{...image,url:'https://outside.example/a.jpg'}},{cardImage:{url:image.url}},{testimonial:{quote:'Sin autor'}}])assert.throws(()=>adaptTrip({...raw(),...change}));
});

test('departure payment overrides inherit empty fields, validate amounts and never advertise a misleading common deposit',()=>{
 const doc=raw();doc.payment={depositAmount:250,terms:'Condiciones generales'};
 doc.departures=[{...doc.departures[0],payment:{depositAmount:125,terms:'Solo esta fecha'}},{...doc.departures[0],_key:'second',start:'2027-05-01',end:'2027-05-03',brevoValue:99,payment:{terms:'Otra fecha'}}];
 const trip=adaptTrip(doc);assert.deepEqual(trip.departures[0].payment,{depositAmount:125,terms:'Solo esta fecha'});
 assert.deepEqual(trip.departures[1].payment,{depositAmount:250,terms:'Otra fecha'});
 assert.equal(tripDeposit(trip).amount,null);
 const html=renderTrip(trip);assert(html.includes('Solo esta fecha'));assert(html.includes('Otra fecha'));assert(html.includes('125 €'));assert(html.includes('250 €'));
 doc.departures[0].payment.depositAmount=-1;assert.throws(()=>adaptTrip(doc),/departure.payment/);
});

const seedFor=doc=>({version:1,projectId:'q5bj2rn2',dataset:'production',trips:[{id:doc._id,slug:doc.slug.current,setIfMissing:{tagline:'La frase inicial',destinationDescription:'El destino inicial',cardImage:doc.hero,team:{title:'Equipo editorial',text:'Texto aprobado'}},storyTitles:Object.fromEntries(doc.story.map(s=>[s._key,'Programa aprobado'])),faqs:{before:doc.faqs??[],after:[{_key:'approved',_type:'faq',question:'¿Vuelos?',answer:'Consulta los horarios.'}]}}]});

test('the editorial migration preserves commercial data, existing copy and later edits; reruns are a no-op',()=>{
 const doc=raw();doc.destinationDescription='Texto del editor';const seed=seedFor(doc),before=structuredClone(doc);
 const plans=planEditorialMigration([doc],seed),candidate=applyEditorialPlan([doc],plans)[0];
 assert.equal(candidate.destinationDescription,'Texto del editor');assert.equal(candidate.tagline,'La frase inicial');
 for(const field of ['departures','payment','capacity','levels','hero','gallery','dossier','availability'])assert.deepEqual(candidate[field],doc[field]);
 assert.deepEqual(doc,before);assert.deepEqual(planEditorialMigration([candidate],seed),[]);
 const edited={...candidate,tagline:'Edición posterior'};assert.deepEqual(planEditorialMigration([edited],seed),[]);
 const drafts=editorialDrafts([doc],plans);assert.equal(drafts[0]._id,'drafts.'+doc._id);assert(!('_rev' in drafts[0]));
 assert.throws(()=>applyEditorialPlan([{...doc,_rev:'new'}],plans),/Revisión distinta/);
});

test('the migration refuses release edits, changed identities and foreign datasets',()=>{
 const doc=raw(),seed=seedFor(doc);
 assert.throws(()=>planEditorialMigration([doc,{...doc,_id:'versions.release.'+doc._id}],seed),/release/);
 assert.throws(()=>planEditorialMigration([{...doc,slug:{current:'changed'}}],seed),/identidad/);
 assert.throws(()=>planEditorialMigration([doc],{...seed,dataset:'other'}),/otro proyecto/);
 assert.deepEqual(planEditorialMigration([doc,{...doc,_id:'drafts.'+doc._id,editorialMigration:{version:editorialVersion}}],seed),[]);
});

test('migration leaves custom FAQ edits and programme titles intact while replacing the exact imported inventory',()=>{
 const doc=raw(),seed=seedFor(doc);
 doc.faqs=[{_key:'custom',question:'Pregunta del editor',answer:'Respuesta propia'}];
 doc.story[0].title='Título del editor';
 const candidate=applyEditorialPlan([doc],planEditorialMigration([doc],seed))[0];
 assert.deepEqual(candidate.faqs,doc.faqs);assert.equal(candidate.story[0].title,'Título del editor');
 const fresh=raw(),normalized=applyEditorialPlan([fresh],planEditorialMigration([fresh],seedFor(fresh)))[0];
 assert.deepEqual(normalized.faqs,seedFor(fresh).trips[0].faqs.after);
});


test('the reviewed eight-document migration retains level isolation, legacy routes and Brevo values', async ()=>{
 const docs=prepareDrafts(inventory).map((d,i)=>({...d,_id:d._id.slice(7),_rev:'base-'+i}));
 const seed=JSON.parse(await readFile('docs/sanity/2026-10-31-editorial/seed.json','utf8'));
 const original=adaptTrips(docs);
 const candidates=applyEditorialPlan(docs,planEditorialMigration(docs,seed)).map(resolveEditorialAssets);
 const migrated=adaptTrips(candidates);
 const contracts=trips=>trips.map(t=>({slug:t.slug,aliases:t.aliases,levels:t.levels,dates:t.departures.map(d=>({id:d.id,start:d.start,end:d.end,price:d.price})),categories:registrationDepartures(t).map(d=>d.brevoValue)}));
 assert.equal(migrated.length,7);assert.deepEqual(contracts(migrated),contracts(original));
 assert.equal(migrated.flatMap(t=>t.departures).length,8);
 for(const t of migrated)assert(t.cardImage);
});

test('additional dates inherit content from their visible editorial owner and keep their own commercial data',()=>{
 const first=raw(),second={...raw(),_id:'second-doc',slug:{current:'hossegor-2027-05-01'},editorialSource:{_ref:first._id},tagline:'Ignored duplicate',departures:[{...first.departures[0],_key:'later',start:'2027-05-01',end:'2027-05-03',price:555,brevoValue:99}],payment:{depositAmount:125,terms:'Own terms'}};
 first.tagline='The shared phrase';first.destinationDescription='The shared programme';first.testimonial={quote:'The shared opinion',author:'Ana'};
 const trips=adaptTrips([first,second]);assert.equal(trips.length,1);assert.equal(trips[0].departures.length,2);
 assert.equal(trips[0].tagline,first.tagline);assert.equal(trips[0].testimonial.quote,'The shared opinion');
 const later=trips[0].departures.find(d=>d.id==='later');assert.equal(later.price,555);assert.equal(later.payment.depositAmount,125);assert.equal(later.brevoValue,99);
 first.story[0].text='An updated common programme';
 assert.equal(adaptTrips([first,second]).length,1);
 for(const bad of [{_ref:'missing'},{_ref:second._id}])assert.throws(()=>adaptTrips([first,{...second,editorialSource:bad}]),/Referencia/);
 assert.throws(()=>adaptTrips([{...first,editorialSource:{_ref:second._id}},second]),/Referencia/);
});

test('existing promotion drafts receive guarded editorial patches and are retained without publishing their pending fares',()=>{
 const doc=raw(),draft={...structuredClone(doc),_id:'drafts.'+doc._id,_rev:'pending-revision',_system:{base:{id:doc._id}}};
 draft.departures[0].promotions=[{label:'Pending early bird',price:299,active:true}];draft.priceNote='Pending reduced tariff';
 const before=structuredClone(draft),plans=planEditorialMigration([doc,draft],seedFor(doc));
 assert.equal(plans[0].draftRevision,'pending-revision');assert(!('departures' in plans[0].set));assert(!('priceNote' in plans[0].set));
 const [mutation]=editorialDraftMutations([doc,draft],plans);assert.equal(mutation.patch.ifRevisionID,draft._rev);assert.equal(mutation.patch.id,draft._id);
 assert(!('departures' in mutation.patch.set));assert(!('priceNote' in mutation.patch.set));assert.deepEqual(draft,before);
 const [prepared]=editorialDrafts([doc,draft],plans);assert.deepEqual(prepared.departures,draft.departures);assert.equal(prepared.priceNote,draft.priceNote);
 const publication=planEditorialPublication([doc,{...prepared,_rev:'prepared-revision'}],plans);
 assert(publication[0].retainDraft);const operations=editorialPublicationMutations(publication);
 assert.equal(operations.length,2);assert(!operations.some(op=>op.delete));
 assert(!('departures' in operations[1].patch.set));assert(!('priceNote' in operations[1].patch.set));
});
