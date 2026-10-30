import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip,coverRatio} from './render-trips.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const morocco=trips.find(trip=>trip.slug==='marruecos');

test('cover geometry follows image metadata and rejects invalid or unbounded dimension strings',()=>{
 assert.equal(coverRatio(morocco.hero),'6000 / 4000');
 assert.equal(coverRatio('https://cdn.sanity.io/images/a/b/c-1322x1044.jpg?w=1600'),'1322 / 1044');
 for(const path of ['/photo.jpg','/photo-0x2.jpg','/photo-9x0.jpg','/photo-999999999999999999x2.jpg'])assert.equal(coverRatio(path),'3 / 2');
});

test('the title, duration and concise facts are outside the photograph, with no invented climate data',()=>{
 const before=structuredClone(morocco),html=renderTrip(morocco,trips);
 const cover=html.match(/<section class="trip-cover"[\s\S]*?<\/section>/)[0];
 const meta=html.match(/<section class="trip-essentials[\s\S]*?<\/section>/)[0];
 assert.match(cover,/--trip-cover-ratio:6000 \/ 4000/);assert.doesNotMatch(cover,/<h1|trip-cover-level/);
 assert.match(meta,/<h1 id="trip-title">Marruecos<\/h1>/);
 for(const text of ['7 noches','17–24 ene 2027','Niveles I–II','Hasta 15 personas','Costa atlántica'])assert(meta.includes(text));
 assert.doesNotMatch(meta,/°C|desértico|clima/i);assert.deepEqual(morocco,before);
});

test('community has its own photograph and testimony without duplicating that photo in the host block',()=>{
 const html=renderTrip(morocco,trips);
 const community=html.slice(html.indexOf('class="trip-community'),html.indexOf('id="plan"'));
 assert.match(community,/community-moment|community-copy/);assert.match(community,/Laura · Marruecos · viaje anterior/);
 const host=html.match(/<section class="trip-block trip-team">[\s\S]*?<\/section>/)[0];
 assert.match(host,/Lucas va contigo/);assert.doesNotMatch(host,/<img/);
 const another=renderTrip(trips.find(trip=>trip.slug==='el-palmar'),trips);
 assert.doesNotMatch(another,/Laura · Marruecos/);
});

test('a destination with no images still has one readable identity and no empty photographic spacer',()=>{
 const html=renderTrip({...morocco,hero:'',gallery:[]},trips);
 assert.match(html,/data-cover-empty/);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.doesNotMatch(html,/<button\b[^>]*data-open-gallery|class="community-moment"/);
});
