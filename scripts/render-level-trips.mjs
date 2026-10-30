import {renderHomeTrip} from './render-home-trips.mjs';
import {levelsFor} from './trip-model.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderLevelTrips(current, trips) {
// The home owns card markup, compact pricing and native date controls.
const card=trip=>renderHomeTrip(trip,{heading:'h4',idPrefix:'guide-trip',compact:true})
 .replace('<article class="home-trip',`<article data-trip-levels="${levelsFor(trip).join(' ')}" data-trip-name="${escape(trip.name)}" class="home-trip guide-trip-card`);
const groups=[['confirmed','Viajes con fecha'],['upcoming','Destinos por anunciar']].map(([state,title])=>{
 const group=trips.filter(trip=>trip.state===state);if(!group.length)return '';
 if(state==='upcoming')return `<details class="guide-trip-group guide-trip-pending" data-trip-group data-trip-state="upcoming"><summary><span>Otros destinos por anunciar</span><span class="guide-pending-count" data-guide-pending-count>${group.length}</span><span class="guide-pending-toggle" aria-hidden="true">+</span></summary><p class="guide-pending-intro">Sus próximas fechas y programas están pendientes de anuncio.</p><div class="home-trip-grid">${group.map(card).join('\n')}</div></details>`;
 return `<div class="guide-trip-group" data-trip-group data-trip-state="confirmed"><h3>${title}</h3><div class="home-trip-grid">${group.map(card).join('\n')}</div></div>`;
}).join('\n');
const html=`<section class="guide-trips section-width" id="viajes-por-nivel" aria-labelledby="guide-trips-title" tabindex="-1"><p class="eyebrow">DEL NIVEL AL VIAJE</p><h2 id="guide-trips-title">Viajes de surf por nivel.</h2><p class="guide-trips-intro">Explora las salidas que admiten el nivel en el que te reconoces. El equipo revisará contigo tu experiencia y las condiciones antes de reservar.</p><div class="guide-trip-filters" role="group" aria-label="Explorar viajes por nivel" hidden><button type="button" data-guide-filter="" aria-pressed="true">Todos</button><button type="button" data-guide-filter="rookies" aria-pressed="false">I · Rookies</button><button type="button" data-guide-filter="aprendices" aria-pressed="false">II · Aprendices</button><button type="button" data-guide-filter="riders" aria-pressed="false">III · Riders</button><button type="button" data-guide-filter="supercracks" aria-pressed="false">IV · Supercracks</button></div><p class="guide-trips-status" id="guide-trips-status" role="status" aria-live="polite" aria-atomic="true">Consulta los niveles, las fechas y el programa de cada destino.</p>${groups}<p class="guide-trips-empty"${trips.length?' hidden':''}>No hay viajes publicados para este nivel. Consulta con LST qué opciones hay para ti.</p></section>`;
const markers=/<!-- level-trips:start -->[\s\S]*?<!-- level-trips:end -->/;
if(!markers.test(current))throw Error('Missing guide trip generation markers');
const candidate=current.replace(markers,`<!-- level-trips:start -->\n${html}\n<!-- level-trips:end -->`);
return candidate;
}
