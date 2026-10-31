import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planEditorialPublication, editorialPublicationMutations} from './publish-trip-editorial.mjs';
import {planEditorialMigration, editorialDrafts, applyEditorialPlan, resolveEditorialAssets} from './migrate-trip-editorial.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {adaptTrips} from './sanity-trips.mjs';
const inventory=JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const seed=JSON.parse(await readFile('docs/sanity/2026-10-31-editorial/seed.json','utf8'));
const fixture=()=>{const docs=prepareDrafts(inventory).map((d,i)=>({...d,_id:d._id.slice(7),_rev:'base-'+i}));const migration=planEditorialMigration(docs,seed);const drafts=editorialDrafts(docs,migration).map((d,i)=>({...d,_rev:'draft-'+i}));return {docs,migration,drafts,all:[...docs,...drafts]};};

test('publication covers all reviewed documents in one revision-guarded transaction and retains the Maldives routes',()=>{
 const {all,migration}=fixture(),plans=planEditorialPublication(all,migration);
 assert.equal(plans.length,8);const mutations=editorialPublicationMutations(plans);
 assert.equal(mutations.length,24);
 for(let i=0;i<plans.length;i++){assert.equal(mutations[i*3].patch.ifRevisionID,plans[i].draftRevision);assert.equal(mutations[i*3+1].patch.ifRevisionID,plans[i].revision);assert.equal(mutations[i*3+2].delete.id,plans[i].draftId);}
 const after=adaptTrips(applyEditorialPlan(all,migration).map(resolveEditorialAssets));
 const maldives=after.find(t=>t.slug==='maldivas');assert(maldives);assert.equal(maldives.departures.length,2);assert.equal(maldives.aliases.length,2);
});

test('publication rejects stale sources, changed drafts, missing documents and release edits before returning mutations',()=>{
 const {all,migration,docs,drafts}=fixture();
 for(const changes of [
  all.map(d=>d._id===docs[0]._id?{...d,_rev:'updated-source'}:d),
  all.map(d=>d._id===drafts[0]._id?{...d,tagline:'Later editor change'}:d),
  all.filter(d=>d._id!==drafts[0]._id),
  [...all,{...docs[0],_id:'versions.release.'+docs[0]._id}],
 ])assert.throws(()=>planEditorialPublication(changes,migration),/Cambió|falta|release/);
 assert.throws(()=>planEditorialPublication(all,[]),/vacío/);
 assert.throws(()=>planEditorialPublication(all,[...migration,migration[0]]),/duplicado/);
});

test('draft freshness participates in the reviewed plan even when its content is unchanged',()=>{
 const {all,migration,drafts}=fixture(),before=planEditorialPublication(all,migration);
 const after=planEditorialPublication(all.map(d=>d._id===drafts[0]._id?{...d,_rev:'new-draft-revision'}:d),migration);
 assert.notDeepEqual(before,after);assert.equal(after[0].draftRevision,'new-draft-revision');
});

test('a partial publication of the first Maldives document is rejected before canonical routes disappear',()=>{
 const {all,migration}=fixture();
 const first=migration.find(p=>p.id.endsWith('maldivas-2027-03-21'));
 assert(first);assert.throws(()=>planEditorialPublication(all,[first]),/rutas/);
});
