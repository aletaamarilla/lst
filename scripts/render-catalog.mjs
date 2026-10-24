import {assetUrl} from './sanity-trips.mjs';
import {levelsFor, tripFacts, isFull, availabilityLabel} from './trip-model.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
export function renderCatalog(current, trips) {
const cards = trips.map(trip => {
  const dated = trip.state === 'confirmed';
  const facts = tripFacts(trip);
  return `<article class="catalog-card" data-catalog-trip data-levels="${levelsFor(trip).join(' ')}" data-state="${escape(trip.state)}">
 <a class="catalog-card-link" href="/viajes/${escape(trip.slug)}/" aria-labelledby="catalog-${escape(trip.id)}-action catalog-${escape(trip.id)}-title">
  ${trip.hero?`<img class="catalog-photo${trip.heroLayout === 'group' ? ' catalog-photo-group' : ''}" src="${escape(assetUrl(trip.hero))}" alt="${escape(trip.heroAlt)}" width="1000" height="667" loading="lazy" decoding="async" style="object-position:${escape(trip.heroPosition ?? '50% 50%')}">`:""}
  <div class="catalog-card-copy"><p class="catalog-card-state">${trip.cms ? escape(availabilityLabel(trip)) : isFull(trip) ? 'Completo' : dated ? 'Con fecha' : 'Próximamente'}</p>
   <h2 id="catalog-${escape(trip.id)}-title">${escape(trip.name)}</h2>
   <p class="catalog-date">${dated ? escape(facts[0][1]) : 'Fechas y programa por anunciar'}</p>${dated ? `
   <p class="catalog-duration">${escape(facts[1][1])}</p>` : ''}
   <p class="catalog-level">${escape(facts[2][1])}</p>
   <span class="button catalog-action" id="catalog-${escape(trip.id)}-action">${dated ? 'Ver viaje' : 'Ver destino'} <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></span>
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
