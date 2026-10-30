import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
import {createSiteServer,readLocalPreview} from './serve.mjs';

const snapshot=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const trips=structuredClone(snapshot.trips);
const trip=trips.find(t=>t.slug==='el-palmar');
trip.departures[0]={...trip.departures[0],price:699,regularPrice:699,promotions:[{label:'Early bird',price:599,firstPlace:1,lastPlace:8,active:true}]};

test('local offers survive navigation through home, levels, catalogue and canonical/historical details without altering dist',async()=>{
 const files=['index.html','niveles/index.html','viajes/index.html','viajes/el-palmar/index.html','viajes/el-palmar-2026-12-04/index.html','catalog-snapshot.json'];
 const before=await Promise.all(files.map(f=>readFile('dist/'+f,'utf8')));
 const server=createSiteServer({previewTrips:trips});server.listen(0,'127.0.0.1');await once(server,'listening');
 try {
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const route of ['/','/niveles/','/viajes/','/viajes/el-palmar/','/viajes/el-palmar-2026-12-04/']) {
   const response=await fetch(origin+route),html=await response.text();
   assert.equal(response.status,200,route);
   assert.equal(response.headers.get('x-lst-data-source'),'sanity-local-preview');
   if(!route.startsWith('/viajes/el-palmar'))assert.match(html,/100 € de descuento/,route);
   assert.match(html,/599 €/);assert.match(html,/Primeras 8 plazas/);assert([...html.matchAll(/<del>([\s\S]*?)<\/del>/g)].some(([,text])=>text.replace(/<[^>]+>/g,'').includes('699 €')));
   if(route==='/viajes/')assert.match(html,/class="catalog-card home-trip" data-compact-home/);
  }
  const preview=await fetch(origin+'/catalog-snapshot.json').then(r=>r.json());
  assert.equal(preview.source,'sanity-local-preview');
  assert.equal((await fetch(origin+'/scripts/serve.mjs')).status,404);
  assert.equal((await fetch(origin+'/artifacts/local-trip-preview.json')).status,404);
 } finally {await new Promise(r=>server.close(r));}
 assert.deepEqual(await Promise.all(files.map(f=>readFile('dist/'+f,'utf8'))),before);
});

test('published preview remains byte-for-byte dist without the explicit local-preview option',async()=>{
 const server=createSiteServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 try {
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const file of ['index.html','catalog-snapshot.json'])assert.equal(await fetch(origin+'/'+file).then(r=>r.text()),await readFile('dist/'+file,'utf8'));
 } finally {await new Promise(r=>server.close(r));}
});

test('missing local configuration falls back to dist; an invalid configuration fails visibly',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'lst-local-preview-'));
 try {
  const file=path.join(dir,'preview.json');assert.equal(await readLocalPreview(file),null);
  await writeFile(file,JSON.stringify({source:'unexpected',documents:[]}));
  await assert.rejects(readLocalPreview(file),/formato válido/);
  await writeFile(file,JSON.stringify({source:'sanity-drafts-local',documents:[{}]}));
  await assert.rejects(readLocalPreview(file));
 } finally {await rm(dir,{recursive:true,force:true});}
});
