import {renderDepartureRows} from './render-departure-rows.mjs';
import {levelsFor, tripFacts, availabilityLabel, hasDepartureLevels} from './trip-model.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
export function renderCatalog(current, trips) {
const cards = trips.map(trip => {
  const dated = trip.state === 'confirmed';
  const facts = tripFacts(trip);
  return `<article class="catalog-card" data-catalog-trip data-levels="${levelsFor(trip).join(' ')}" data-state="${escape(trip.state)}">
 <a class="catalog-card-link" href="/viajes/${escape(trip.slug)}/" aria-labelledby="catalog-${escape(trip.id)}-action catalog-${escape(trip.id)}-title">
  ${trip.hero?`<img class="catalog-photo" src="${escape(trip.hero)}" alt="${escape(trip.heroAlt)}" width="1000" height="667" loading="lazy" decoding="async" style="object-position:${escape(trip.heroPosition ?? '50% 50%')}">`:""}
  <div class="catalog-card-copy"><p class="catalog-card-state">${escape(availabilityLabel(trip))}</p>
   <h2 id="catalog-${escape(trip.id)}-title">${escape(trip.name)}</h2>
   ${dated ? `${hasDepartureLevels(trip) ? '<p class="catalog-date-heading">Nivel según la fecha</p>' : ''}${renderDepartureRows(trip, 'catalog-date')}` : '<p class="catalog-date">Fechas y programa por anunciar</p>'}${dated ? `
   <p class="catalog-duration">${escape(facts[1][1])}</p>` : ''}
${!dated ? `<p class="catalog-level">${escape(facts[2][1])}</p>` : trip.levelRequirement && !hasDepartureLevels(trip) ? `<p class="catalog-level">${escape(trip.levelRequirement)}</p>` : ''}
   <span class="button catalog-action" id="catalog-${escape(trip.id)}-action">${dated ? 'Ver viaje' : 'Ver destino'}</span>
  </div>
 </a>
</article>`;
}).join('\n');
const markers = /<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->/;
if (!markers.test(current)) throw Error('Missing catalog generation markers');
const content = `<p class="catalog-status" id="catalog-status" role="status" aria-live="polite" aria-atomic="true">${trips.length?`${trips.length} de ${trips.length} destinos.`:'No hay viajes publicados en este momento.'}</p>
<div class="catalog-grid" id="catalog-results">${cards}</div>`;
const candidate = current.replace(markers, `<!-- catalog:start -->\n${content}\n<!-- catalog:end -->`);
return candidate;
}
