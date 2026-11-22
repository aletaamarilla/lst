import {compactDate} from './render-home-trips.mjs';
import {levelsFor, levelLabel, departuresFor, tripPriceDetails, tripPrice, formatPrice, availabilityLabel} from './trip-model.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {sizedPhoto} from './photo.mjs';
import {renderLevelGuide} from './surf-levels.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WHATSAPP='https://wa.me/34648189257?text=%C2%A1Hola%2C%20LST%21%20Quiero%20consultar%20mi%20nivel%20de%20surf%20y%20saber%20si%20encajo%20en%20un%20viaje.%20%C2%BFPod%C3%A9is%20orientarme%3F';
const startOf=trip=>departuresFor(trip).map(d=>d.start).filter(Boolean).sort()[0]??'';

// One compact row per trip: photo, name, next date, levels and price.
function tripRow(trip){
 const dated=trip.state==='confirmed';
 const departures=dated?[...departuresFor(trip)].sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999')):[];
 const more=departures.length>1?` y ${departures.length-1} ${departures.length===2?'fecha más':'fechas más'}`:'';
 const when=departures.length?`${compactDate(departures[0].date)}${more}`:'Fechas por anunciar';
 const {departure:fare,from}=tripPriceDetails(trip);
 const offer=fare?.promotion;
 const price=fare?`<span class="lv-trip-price">${from?'<small>desde</small>':''}${offer?`<del>${escape(formatPrice(fare.regularPrice))}</del>`:''}${escape(formatPrice(fare.price))}</span>`:`<span class="lv-trip-price lv-trip-price-tbc">${escape(tripPrice(trip))}</span>`;
 const saving=offer?Math.round((fare.regularPrice-fare.price)*100)/100:0;
 const offerText=offer?`<span class="lv-trip-offer"><strong>${escape(formatPrice(saving))} de descuento</strong> ${escape(promotionCondition(offer))}</span>`:'';
 const availability=dated?availabilityLabel(trip):'';
 const tag=availability&&availability!=='Plazas disponibles'?`<span class="lv-trip-tag${availability==='Completo'?' is-full':''}">${escape(availability)}</span>`:'';
 const image=trip.cardImage||trip.hero;
 const levels=levelsFor(trip);
 return `<li class="lv-trip" data-trip-levels="${levels.join(' ')}" data-trip-name="${escape(trip.name)}"><a href="/viajes/${escape(trip.slug)}/">${image?`<img src="${escape(sizedPhoto(image,320))}" alt="" width="160" height="120" loading="lazy" decoding="async">`:'<span class="lv-trip-photo-empty" aria-hidden="true"></span>'}<span class="lv-trip-text"><span class="lv-trip-name">${escape(trip.name)}</span>${tag}<span class="lv-trip-when">${escape(when)}</span><span class="lv-trip-levels"><span class="lv-lvbar" aria-hidden="true">${[1,2,3,4].map(l=>`<i${levels.includes(l)?' class="on"':''}></i>`).join('')}</span>${escape(levelLabel(trip))}</span>${offerText}</span>${price}</a></li>`;
}

/** Rows of the trips that admit each level, dated trips first. */
export function tripRowsByLevel(trips){
 const ordered=[...trips].sort((a,b)=>(a.state==='confirmed'?0:1)-(b.state==='confirmed'?0:1)||(startOf(a)||'9999').localeCompare(startOf(b)||'9999'));
 return Object.fromEntries([1,2,3,4].map(level=>[level,ordered.filter(t=>levelsFor(t).includes(level)).map(tripRow).join('')]));
}

export function renderLevelTrips(current, trips) {
// After the test: the help to find your level, and the way to the whole catalogue.
const html=`<section class="lv-help" id="orientacion" aria-labelledby="orientation-title" tabindex="-1"><div class="lv-help-inner section-width">
<h2 id="orientation-title">Mándanos un vídeo</h2>
<p>Mándanos un vídeo de 2 o 3 olas a <strong>info@letsurftogether.com</strong> o por Instagram a <a href="https://www.instagram.com/letsurftogether/" target="_blank" rel="noopener noreferrer">@letsurftogether</a> y te decimos tu nivel y qué trabajar.</p>
${trips.length?'':'<p class="lv-help-empty">No hay viajes publicados en este momento. Escríbenos y te contamos las próximas salidas.</p>'}
<div class="hp-ctas"><a class="hp-btn" data-guide-enquiry data-whatsapp="nivel" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a><a class="hp-btn hp-btn-line" href="/viajes/">Ver todos los viajes</a></div>
</div></section>`;
const markers=/<!-- level-trips:start -->[\s\S]*?<!-- level-trips:end -->/;
if(!markers.test(current))throw Error('Missing guide trip generation markers');
const candidate=current.replace(markers,`<!-- level-trips:start -->\n${html}\n<!-- level-trips:end -->`);
// The level guide itself is generated from scripts/surf-levels.mjs (when the page has its markers).
return candidate.includes('<!-- level-guide:start -->')?renderLevelGuide(candidate,tripRowsByLevel(trips)):candidate;
}
