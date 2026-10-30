import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {renderTrip} from '../../../scripts/render-trips.mjs';
import {planPromotionUpdate} from '../../../scripts/update-trip-promotions.mjs';
import {SANITY} from '../../../scripts/sanity.mjs';
import {readLocalPreview} from '../../../scripts/serve.mjs';
const qa='docs/qa/2026-10-28-trip-focus/';
const hash=value=>createHash('sha256').update(value).digest('hex');
const prior=JSON.parse(await readFile(qa+'independent-candidate-before-generated-note-sha256.json','utf8'));
const candidate=JSON.parse(await readFile(qa+'candidate-sha256.json','utf8'));
const actual=Object.fromEntries(await Promise.all(Object.keys(candidate).map(async file=>[file,hash(await readFile(file))])));
assert.deepEqual(actual,candidate);
assert.equal(actual['dist/trip-detail.css'],prior['dist/trip-detail.css']);
await writeFile(qa+'independent-candidate-sha256.json',JSON.stringify(actual,null,2));
const {trips}=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const base=trips.find(t=>t.slug==='el-palmar');
const sidebar=html=>html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];
const note=html=>sidebar(html).match(/<p class="booking-card-price-note">([\s\S]*?)<\/p>/)[1];
const results=[];
for(const regularPrices of [[699],[699,699],[699,799],[699.5,799.5]]){
 const departures=regularPrices.map((price,i)=>({_key:'qa-'+i,start:base.departures[0].start,end:base.departures[0].end,price,capacity:{total:24}}));
 const inventory={sanityTarget:{projectId:SANITY.projectId,dataset:SANITY.dataset},departures:departures.map((d,i)=>({id:d._key,dates:{start:d.start,end:d.end},pricing:{tariffs:[{amount:d.price-100,firstPlace:1,lastPlace:8},{amount:d.price-50,firstPlace:9,lastPlace:20},{amount:d.price,firstPlace:21,lastPlace:24}]}}))};
 const [patch]=planPromotionUpdate([{_id:'qa-producer',_rev:'qa',departures,capacity:{total:24}}],inventory);
 const generated=patch.set.priceNote;
 const trip={...base,priceNote:generated,departures:departures.map((d,i)=>({...base.departures[0],id:d._key,date:'Fecha QA '+i,start:d.start,end:d.end,price:d.price,regularPrice:d.price,capacity:d.capacity,brevoValue:String(101+i),promotions:patch.set['departures[_key=='+JSON.stringify(d._key)+'].promotions']}))};
 const original=structuredClone(trip);
 assert.equal(note(renderTrip(trip,trips)),'por persona');
 const variants=[generated+' Suplemento <individual> & seguro aparte.','Condición adicional: '+generated,generated.replace('Tarifa general:','Tarifa general revisada:')];
 for(const custom of variants){
  const expected=custom.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  assert.equal(note(renderTrip({...trip,priceNote:custom},trips)),expected);
 }
 assert.deepEqual(trip,original);
 results.push({regularPrices,generatedByActualProducer:generated,condensed:true,customVariantsPreservedAndEscaped:variants.length,modelUnchanged:true});
}
const local=await readLocalPreview();
const localResults=local.map(trip=>({slug:trip.slug,previousNote:trip.priceNote,sidebarNote:note(renderTrip(trip,local))}));
const protectedFiles=JSON.parse(await readFile(qa+'protected-before.json','utf8'));
const protectedMatches=Object.fromEntries(await Promise.all(Object.entries(protectedFiles).map(async([file,expected])=>[file,hash(await readFile(file))===expected])));
assert(Object.values(protectedMatches).every(Boolean));
const result={manifestMatches:true,changedFromPrior:Object.keys(candidate).filter(f=>candidate[f]!==prior[f]),producerRoundTrips:results,localResults,protectedMatches};
await writeFile(qa+'independent-generated-note-validation.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({manifestMatches:true,changed:result.changedFromPrior,producerCases:results.length,customVariants:results.reduce((s,r)=>s+r.customVariantsPreservedAndEscaped,0),local:localResults.map(r=>({slug:r.slug,sidebarNote:r.sidebarNote})),protectedUnchanged:Object.keys(protectedMatches).length},null,2));
