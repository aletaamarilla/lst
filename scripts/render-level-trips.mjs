import {readFile, writeFile} from 'node:fs/promises';
import {levelsFor, tripFacts} from './trip-model.mjs';
const file='dist/niveles/index.html';
const trips=JSON.parse(await readFile('data/trips.json','utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=trip=>`<a class="guide-trip-card" data-trip-levels="${levelsFor(trip).join(' ')}" data-trip-name="${escape(trip.name)}" href="/viajes/${trip.slug}/"><img src="/assets/${trip.hero}" alt="" width="1000" height="600" loading="lazy" decoding="async"><div><h4>${escape(trip.name)}</h4><p class="guide-trip-date">${trip.state==='confirmed'?escape(tripFacts(trip)[0][1]):'Fechas por anunciar'}</p><p class="guide-trip-levels">${escape(tripFacts(trip)[2][1])}</p><span class="guide-trip-action">${trip.state==='confirmed'?'Ver el viaje a':'Conocer'} ${escape(trip.name)}</span></div></a>`;
const groups=[['confirmed','Viajes con fecha'],['upcoming','Destinos por anunciar']].map(([state,title])=>{
 const group=trips.filter(trip=>trip.state===state);if(!group.length)return '';
 if(state==='upcoming')return `<details class="guide-trip-group guide-trip-pending" data-trip-group data-trip-state="upcoming"><summary><span>Otros destinos por anunciar</span><span class="guide-pending-count" data-guide-pending-count>${group.length}</span><span class="guide-pending-toggle" aria-hidden="true">+</span></summary><p class="guide-pending-intro">Sus próximas fechas y programas están pendientes de anuncio.</p><div class="guide-trips-grid">${group.map(card).join('\n')}</div></details>`;
 return `<div class="guide-trip-group" data-trip-group data-trip-state="confirmed"><h3>${title}</h3><div class="guide-trips-grid">${group.map(card).join('\n')}</div></div>`;
}).join('\n');
const html=`<section class="guide-trips section-width" id="viajes-por-nivel" aria-labelledby="guide-trips-title" tabindex="-1"><p class="eyebrow">DEL NIVEL AL VIAJE</p><h2 id="guide-trips-title">Viajes de surf por nivel.</h2><p class="guide-trips-intro">Explora las salidas que admiten el nivel en el que te reconoces. El equipo revisará contigo tu experiencia y las condiciones antes de reservar.</p><div class="guide-trip-filters" role="group" aria-label="Explorar viajes por nivel" hidden><button type="button" data-guide-filter="" aria-pressed="true">Todos</button><button type="button" data-guide-filter="rookies" aria-pressed="false">I · Rookies</button><button type="button" data-guide-filter="aprendices" aria-pressed="false">II · Aprendices</button><button type="button" data-guide-filter="riders" aria-pressed="false">III · Riders</button><button type="button" data-guide-filter="supercracks" aria-pressed="false">IV · Supercracks</button></div><p class="guide-trips-status" id="guide-trips-status" role="status" aria-live="polite" aria-atomic="true">Consulta los niveles, las fechas y el programa de cada destino.</p>${groups}<p class="guide-trips-empty" hidden>No hay viajes publicados para este nivel. Consulta con LST qué opciones hay para ti.</p></section>`;
const current=await readFile(file,'utf8');
const markers=/<!-- level-trips:start -->[\s\S]*?<!-- level-trips:end -->/;
if(!markers.test(current))throw Error('Missing guide trip generation markers');
const candidate=current.replace(markers,`<!-- level-trips:start -->\n${html}\n<!-- level-trips:end -->`);
if(process.argv.includes('--check')){if(candidate!==current)throw Error('Guide trip data is outdated. Run npm run build.');}
else await writeFile(file,candidate);
console.log(`${process.argv.includes('--check')?'Verified':'Rendered'} ${trips.length} guide destinations from configured levels.`);
