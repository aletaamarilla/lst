import {assetUrl} from './sanity-trips.mjs';
import {tripFacts, isFull, availabilityLabel} from './trip-model.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export function renderHomeTrips(current, trips) {
  const card = trip => {
    const dated = trip.state === 'confirmed';
    const heading = dated ? 'h3' : 'h4';
    return `<article class="home-trip${dated ? '' : ' home-trip-pending'}" aria-labelledby="trip-${trip.id}-title"><a class="home-trip-link" href="/viajes/${trip.slug}/" aria-labelledby="trip-${trip.id}-action trip-${trip.id}-title">
${trip.hero ? `<img class="home-trip-photo" src="${escape(assetUrl(trip.hero))}" alt="${escape(trip.heroAlt)}" width="1000" height="600" loading="lazy">` : ''}
<div class="home-trip-copy"><${heading} id="trip-${trip.id}-title">${escape(trip.name)}</${heading}><p class="home-trip-date">${trip.cms ? escape(availabilityLabel(trip)) + ' · ' : isFull(trip) ? 'Completo · ' : ''}${dated ? escape(tripFacts(trip)[0][1]) : 'Próximamente'}</p><p class="home-trip-meta">${dated ? escape(tripFacts(trip)[1][1]) + ' · ' : ''}${escape(tripFacts(trip)[2][1])}</p><span class="button home-trip-action" id="trip-${trip.id}-action">${dated ? 'Ver viaje' : 'Ver destino'} <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></span></div></a></article>`;
  };
  const dated = trips.filter(t => t.state === 'confirmed');
  const pending = trips.filter(t => t.state === 'upcoming');
  const content = `${!trips.length ? '<p role="status">No hay viajes publicados en este momento. Puedes consultar las próximas salidas con el equipo.</p>' : ''}<div id="trip-content" class="home-trip-grid">${dated.map(card).join('\n')}</div>${pending.length ? `<section class="destination-collection" aria-labelledby="more-destinations-title"><div class="destination-collection-heading"><div><p class="journeys-eyebrow">PRÓXIMAMENTE</p><h3 id="more-destinations-title">Próximos viajes por anunciar</h3></div><p>Estamos preparando las próximas fechas.</p></div><div class="home-trip-grid home-trip-grid-pending">${pending.map(card).join('\n')}</div></section>` : ''}`;
  const markers = /<!-- home-trips:start -->[\s\S]*?<!-- home-trips:end -->/;
  // Accept the existing home once; keep the surrounding editorial layout intact.
  const region = markers.test(current) ? markers : /<div id="trip-content" class="home-trip-grid">[\s\S]*?(?=\s*<p class="home-catalog-link">)/;
  if (!region.test(current)) throw Error('Missing home trip generation region');
  return current.replace(region, `<!-- home-trips:start -->\n${content}\n<!-- home-trips:end -->`);
}
