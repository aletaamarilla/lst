import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {coverPhotoSources,renderTrip} from './render-trips.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const palmar=trips.find(t=>t.slug==='el-palmar');
const candidates=photo=>photo.srcset.split(', ').map(value=>{const [src,width]=value.split(' ');return {url:new URL(src),width:Number(width.slice(0,-1))};});

test('cover variants use real dimensions, high density candidates and no upscaling beyond the source',()=>{
 for(const [source,width,height] of [[palmar.hero,3000,2000],['https://cdn.sanity.io/images/a/b/test-6000x4000.jpg',6000,4000],['https://cdn.sanity.io/images/a/b/test-900x500.jpg',900,500]]){
  const photo=coverPhotoSources(source),variants=candidates(photo);
  assert.equal(photo.width,width);assert.equal(photo.height,height);
  assert.equal(variants.at(-1).width,Math.min(width,3840));
  assert(variants.every(({url,width:requested})=>requested<=width&&Number(url.searchParams.get('w'))===requested));
  assert(variants.every(({url})=>url.searchParams.get('q')==='85'&&url.searchParams.get('fit')==='max'&&url.searchParams.get('auto')==='format'));
 }
 assert(candidates(coverPhotoSources(palmar.hero)).some(({width})=>width>=2560));
});

test('existing CDN width parameters are replaced once while editorial image parameters are retained',()=>{
 const photo=coverPhotoSources('https://cdn.sanity.io/images/a/b/test-3000x2000.jpg?w=120&w=240&q=30&rect=10,20,800,600');
 for(const {url} of candidates(photo)){
  assert.equal(url.searchParams.getAll('w').length,1);assert.equal(url.searchParams.getAll('q').length,1);
  assert.equal(url.searchParams.get('rect'),'10,20,800,600');
 }
 assert.equal(new URL(coverPhotoSources('https://cdn.sanity.io/images/a/b/test-3000x2000.jpg?q=95').src).searchParams.get('q'),'95');
});

test('local and non-CDN images retain their original URL without invented derivative requests',()=>{
 for(const source of ['/assets/photo.jpg','https://example.com/photo.jpg']){
  const photo=coverPhotoSources(source);assert.equal(photo.src,source);assert.equal(photo.srcset,undefined);assert.equal(photo.sizes,undefined);
  assert.equal(photo.ratio,'3 / 2');assert.equal(photo.width/photo.height,1.5);
 }
});

test('cover controls sit outside the images and only the first photo is prioritised',()=>{
 const before=structuredClone(palmar),html=renderTrip(palmar,trips);
 const cover=html.match(/<section class="trip-cover"[\s\S]*?<\/section>/)[0];
 const images=[...cover.matchAll(/<img class="trip-cover-image"[^>]*>/g)].map(m=>m[0]);
 assert(images[0].includes('width="3000" height="2000"'));assert(images[0].includes('srcset='));assert(images[0].includes('fetchpriority="high"'));
 assert(!images[0].includes('loading="lazy"'));assert(images.slice(1).every(img=>img.includes('loading="lazy"')));
 assert(!cover.includes('data-carousel-next'));assert(!cover.includes('data-open-gallery'));
 const backgrounds=[...cover.matchAll(/<img class="cover-photo-backdrop"[^>]*>/g)].map(m=>m[0]);
 assert.equal(backgrounds.length,images.length);assert(backgrounds.every(img=>img.includes('alt="" aria-hidden="true"')&&img.includes('fetchpriority="low"')));
 assert(html.includes('class="cover-gallery-bar"'));assert(html.includes('aria-label="Fotos del viaje: siguiente"'));
 assert(!renderTrip({...palmar,hero:'',gallery:[]},trips).includes('class="cover-gallery-bar"'));
 assert.deepEqual(palmar,before);
});
