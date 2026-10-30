import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip} from './render-trips.mjs';
import {adaptTrip} from './sanity-trips.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {consolidateTrips} from './trip-groups.mjs';
const inventory=JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json','utf8'));
const raw=()=>{const d=prepareDrafts(inventory).find(d=>d.slug.current==='marruecos-2027-01-17');return {...d,_id:d._id.slice(7)};};
const img={url:'https://cdn.sanity.io/images/q5bj2rn2/production/test-1200x800.webp',alt:'Foto <de prueba>',caption:'Una casa de ejemplo'};
const editorial=()=>({...raw(),destinationDescription:'Entre el océano & las montañas.',destinationFacts:['Costa atlántica'],audience:{text:'Ganar confianza.',profiles:[{title:'Iniciación',text:'Primeras olas.'}],objective:'Progresar juntos.'},activities:[{title:'Dunas',text:'Una tarde en grupo.',image:img},{title:'Zoco',text:'Colores locales.',image:img}],spots:[{title:'Imsouane',text:'Según el mar.',image:img}],spotsNote:'El mar decide.',surfPlan:[{title:'Coaching',text:'Cada sesión a tu nivel.'}],stay:{text:'Casa para el grupo.',gallery:[img,{...img,alt:'Otra foto'}],galleryNote:'Fotografías de ejemplo.'}});

test('cover copy contains only the trip name and fixed level, with breadcrumb and booking outside the image',()=>{
 const t=adaptTrip(editorial()),html=renderTrip(t),cover=html.match(/<section class="trip-cover"[\s\S]*?<\/section>/)[0];
 const copy=cover.match(/<div class="trip-cover-copy">([\s\S]*?)<\/div>/)[1];
 assert.equal((copy.match(/<(?:p|h1)\b/g)||[]).length,2);
 assert(copy.includes(t.name));assert.match(copy,/Niveles I–II/);
 assert.doesNotMatch(cover,/trip-breadcrumb|trip-cover-cta|Quiero vivir|trip-hero-fare|Ver fotos/);
 assert(html.indexOf('aria-label="Breadcrumb"')>html.indexOf('</section>'));
});

test('CMS editorial sections render in the requested order and retain their own exact content',()=>{
 const t=adaptTrip(editorial()),before=structuredClone(t),html=renderTrip(t);
 const ids=['destino','nivel','actividades','spots','plan','alojamiento','incluye','dudas','reservar'];
 for(let i=1;i<ids.length;i++)assert(html.indexOf(`id="${ids[i]}"`)>html.indexOf(`id="${ids[i-1]}"`));
 assert.match(html,/Entre el océano &amp; las montañas/);assert.match(html,/Progresar juntos/);assert.match(html,/Coaching/);assert.match(html,/Fotografías de ejemplo/);
 assert(html.includes(t.levelRequirement));
 assert.doesNotMatch(html,/<de prueba>/);assert.deepEqual(t,before);
 assert.match(html,/class="related-section"/);
});

test('optional editorial fields do not invent activities, spots or accommodation photographs for older documents',()=>{
 const t=adaptTrip(raw()),html=renderTrip(t);
 assert.equal(t.activities,undefined);assert.equal(t.spots,undefined);
 assert.doesNotMatch(html,/id="actividades"|id="spots"|stay-carousel-track/);
 for(const value of t.includes)assert(html.includes(value));
 assert.match(html,/stay-compact/);
});

test('visual CMS data rejects outside-project images and incomplete card copy',()=>{
 assert.throws(()=>adaptTrip({...editorial(),activities:[{title:'Incomplete'}]}),/activities.text/);
 assert.throws(()=>adaptTrip({...editorial(),spots:[{title:'Spot',text:'Texto',image:{url:'https://outside.example/image.jpg'}}]}),/Imagen fuera del proyecto/);
 assert.throws(()=>adaptTrip({...editorial(),stay:{gallery:[{url:img.url}]}}),/stay.gallery.alt/);
});

test('every trip WhatsApp link includes its icon and keeps a contextual message',()=>{
 const t=adaptTrip(editorial()),html=renderTrip(t);
 const links=[...html.matchAll(/<a\b[^>]*data-whatsapp="[^"]+" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 assert(links.length>=4);
 for(const [,href,body] of links){const u=new URL(href);assert.equal(u.origin,'https://wa.me');assert(u.searchParams.get('text'));assert.match(body,/class="whatsapp-icon"/);}
});

test('different editorial programmes are never consolidated into one dated trip',()=>{
 const first=adaptTrip(editorial()),second={...structuredClone(first),id:'marruecos-2027-02-01',slug:'marruecos-2027-02-01',departures:[{...first.departures[0],id:'second'}],spots:[{title:'Otro spot',text:'Otro programa',image:'',alt:''}]};
 assert.equal(consolidateTrips([first,second]).length,2);
});

test('confirmed single-date trips expose their date in the reading content available on mobile',()=>{
 const trip=adaptTrip(editorial()),html=renderTrip(trip);
 const content=html.slice(html.indexOf('<article class="trip-content">'),html.indexOf('<aside class="trip-booking"'));
 const dates=content.match(/<div class="trip-summary-dates">([\s\S]*?)<\/div>/)?.[1];
 assert(dates);assert(dates.includes(trip.departures[0].date));assert.match(dates,/Próxima salida/);
 const pending=renderTrip({...trip,state:'upcoming',departures:[]});assert.doesNotMatch(pending,/trip-summary-dates/);
});


test('hero thumbnails address every cover image and the removed figures and section bar stay absent',()=>{
 const t={...adaptTrip(editorial()),hero:img.url,heroAlt:img.alt,gallery:[[img.url.replace('test-','other-'),img.alt,'Otra foto']]},html=renderTrip(t);
 const photos=html.match(/class="cover-carousel-slide"/g)||[];
 const thumbs=[...html.matchAll(/<a\b[^>]*data-carousel-thumb="(\d+)"[^>]*>/g)];
 assert.equal(thumbs.length,photos.length);assert(thumbs.length>0);
 assert.equal(thumbs.filter(m=>m[0].includes('aria-current="true"')).length,1);
 for(const [,i] of thumbs){assert(html.includes(`id="cover-photo-${i}"`));assert(html.includes(`href="#cover-photo-${i}"`));}
 assert.doesNotMatch(html,/trip-quick-facts|trip-section-nav|El tiempo fuera/);
 assert.match(html,/aria-label="Miniaturas del viaje"/);
});

test('a single cover photo has no redundant thumbnails and no gallery still keeps the trip readable',()=>{
 const t={...adaptTrip(editorial()),hero:img.url,heroAlt:img.alt};
 const one=renderTrip({...t,gallery:[]});assert.equal((one.match(/class="cover-carousel-slide"/g)||[]).length,1);assert.doesNotMatch(one,/data-carousel-thumb="/);
 const empty=renderTrip({...t,hero:'',gallery:[]});assert.match(empty,/<h1/);assert.doesNotMatch(empty,/data-carousel-thumb="|cover-image-button/);
});
