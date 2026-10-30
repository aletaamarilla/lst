import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {renderTrip} from '../../../scripts/render-trips.mjs';
const qa='docs/qa/2026-10-28-trip-depth/';
const previous=JSON.parse(await readFile(qa+'independent-candidate-before-compact-sha256.json','utf8'));
const current=JSON.parse(await readFile(qa+'candidate-sha256.json','utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const actual=Object.fromEntries(await Promise.all(Object.keys(current).map(async file=>[file,hash(await readFile(file))])));
assert.deepEqual(actual,current);
await writeFile(qa+'independent-candidate-sha256.json',JSON.stringify(actual,null,2));
let priorSource=await readFile(qa+'independent-before-compact-renderer.txt','utf8');
assert.equal(hash(priorSource),previous['scripts/render-trips.mjs']);
priorSource=priorSource.replace(/from '\.\/([^']+)'/g,(_,file)=>"from '"+pathToFileURL(path.resolve('scripts',file)).href+"'");
const {renderTrip:before}=await import('data:text/javascript;base64,'+Buffer.from(priorSource).toString('base64'));
const {trips}=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const side=html=>html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];
const links=html=>[...side(html).matchAll(/<(?:a|button)\b([^>]+)>/g)].map(m=>[m[1].match(/href="([^"]+)"/)?.[1]??'',m[1].match(/data-registration="([^"]+)"/)?.[1]??'',m[1].match(/data-whatsapp="([^"]+)"/)?.[1]??'',m[1].includes('data-open-dates'),m[1].match(/aria-controls="([^"]+)"/)?.[1]??'']);
const results=[];
for(const trip of trips){
 const oldHtml=before(trip,trips),newHtml=renderTrip(trip,trips);
 assert.equal(oldHtml.replace(side(oldHtml),''),newHtml.replace(side(newHtml),''));
 assert.deepEqual(links(oldHtml),links(newHtml));
 for(const cls of ['booking-card-price','booking-card-price-note','booking-status','booking-essentials','booking-deposit']){
  const re=new RegExp('<(?:p|div) class="'+cls+'">([\\s\\S]*?)<\\/(?:p|div)>');
  assert.equal(side(oldHtml).match(re)?.[1],side(newHtml).match(re)?.[1],trip.slug+' '+cls);
 }
 for(const slug of [trip.slug,...(trip.aliases??[])]){
  const file='dist/viajes/'+slug+'/index.html';
  assert.equal(hash(oldHtml),previous[file]);
  assert.equal(hash(newHtml),current[file]);
  assert.equal(await readFile(file,'utf8'),newHtml);
  results.push({slug,previousGeneratedHashMatches:true,currentGeneratedHashMatches:true,outsideSidebarIdentical:true,actionTargetsIdentical:true,priceDateDepositStatusIdentical:true});
 }
}
const protectedFiles=JSON.parse(await readFile(qa+'protected-before.json','utf8'));
const protectedMatches=Object.fromEntries(await Promise.all(Object.entries(protectedFiles).map(async([file,expected])=>[file,hash(await readFile(file))===expected])));
assert(Object.values(protectedMatches).every(Boolean));
await writeFile(qa+'independent-incremental-validation.json',JSON.stringify({manifestMatches:true,results,protectedMatches},null,2));
console.log(JSON.stringify({files:Object.keys(actual).length,routes:results.length,allOutsideSidebarIdentical:true,allActionsAndCommercialValuesIdentical:true,protectedUnchanged:Object.keys(protectedMatches).length},null,2));
