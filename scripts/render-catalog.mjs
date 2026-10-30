import {renderHomeTrip} from './render-home-trips.mjs';
import {levelsFor, departuresFor} from './trip-model.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

export function renderCatalog(current, trips) {
  const cards = trips.map((trip, order) => ({trip, order,
    start: departuresFor(trip).map(d => d.start).filter(Boolean).sort()[0] || '9999',
  })).sort((a, b) => a.start.localeCompare(b.start) || a.order - b.order).map(({trip}) => {
    const departures = departuresFor(trip).map(d => ({start: d.start, end: d.end}));
    return renderHomeTrip(trip, {heading: 'h2', idPrefix: 'catalog', compact: true})
      .replace('<article class="home-trip', `<article data-catalog-trip data-levels="${levelsFor(trip).join(' ')}" data-departures="${escape(JSON.stringify(departures))}" class="catalog-card home-trip`)
      .replace('class="home-trip-link"', 'class="home-trip-link catalog-card-link"');
  }).join('\n');
  const markers = /<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->/;
  if (!markers.test(current)) throw Error('Missing catalog generation markers');
  const content = `<p class="catalog-status" id="catalog-status" role="status" aria-live="polite" aria-atomic="true">${trips.length ? `${trips.length} de ${trips.length} viajes.` : 'No hay viajes publicados en este momento.'}</p>
<div class="catalog-grid home-trip-grid" id="catalog-results">${cards}</div>`;
  return current.replace(markers, `<!-- catalog:start -->\n${content}\n<!-- catalog:end -->`);
}
