import {departuresFor, levelLabel, tripPrice, formatPrice, availabilityLabel} from './trip-model.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export function renderHomeTrips(current, trips) {
  const card = trip => {
    const departures = departuresFor(trip);
    const dated = trip.state === 'confirmed';
    const heading = dated ? 'h3' : 'h4';
    const id = escape(trip.id);
    const availability = availabilityLabel(trip);
    const firstDate = [...departures].sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'))[0];
    const preview = firstDate ? `${firstDate.date}${departures.length > 1 ? ` · ${departures.length} fechas` : ''}` : 'Fechas por anunciar';
    const status = availability === 'Plazas disponibles' ? '' : `<span class="home-trip-status">${escape(availability)}</span>`;
    const dates = departures.length ? `<ul class="home-trip-departures">${departures.map(d => `<li><span>${escape(d.date)}</span><span>${d.price === null ? 'Precio por confirmar' : escape(formatPrice(d.price))}</span></li>`).join('')}</ul>` : '<p>Fechas por anunciar. Consulta las próximas salidas con el equipo.</p>';
    return `<article class="home-trip${dated ? '' : ' home-trip-pending'}" aria-labelledby="trip-${id}-title">
<div class="home-trip-media">${trip.hero ? `<img class="home-trip-photo" src="${escape(trip.hero)}" alt="${escape(trip.heroAlt || trip.name)}" width="1000" height="600" loading="lazy" decoding="async">` : '<div class="home-trip-placeholder" aria-hidden="true">LST</div>'}
<span class="home-trip-level">${escape(levelLabel(trip))}</span>${status}<${heading} id="trip-${id}-title">${escape(trip.name)}</${heading}>
<details class="home-trip-dates" data-home-dates><summary aria-label="Ver fechas de ${escape(trip.name)}"><span class="home-trip-dates-label"><span class="dates-label-closed">Ver fechas</span><span class="dates-label-open">Cerrar ×</span></span></summary><div class="home-trip-dates-panel" role="region" tabindex="0" aria-label="Fechas y precios de ${escape(trip.name)}"><p class="home-trip-dates-title">${escape(trip.name)}</p>${dates}${trip.levelRequirement ? `<p class="home-trip-requirement">${escape(trip.levelRequirement)}</p>` : ''}<p class="home-trip-date-note">${escape(availability)} · Consulta el programa en la ficha.</p></div></details>
</div><p class="home-trip-preview" id="trip-${id}-facts">${escape(preview)}</p><a class="home-trip-link" aria-describedby="trip-${id}-facts" href="/viajes/${escape(trip.slug)}/" aria-labelledby="trip-${id}-action trip-${id}-title"><span class="home-trip-action" id="trip-${id}-action">${dated ? 'Ver viaje' : 'Ver destino'} <span aria-hidden="true">↗</span></span><span class="home-trip-price">${escape(tripPrice(trip))}${departures.some(d => d.price !== null) ? '<small>por persona</small>' : ''}</span></a></article>`;
  };
  // Start with the nearest departure. Keep all published trips in the HTML,
  // including destinations without dates and the native expandable collection.
  const dated = trips.filter(t => t.state === 'confirmed').map((trip, order) => ({trip, order, start: departuresFor(trip).map(d => d.start).filter(Boolean).sort()[0]})).sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999') || a.order - b.order).map(t => t.trip);
  const pending = trips.filter(t => t.state === 'upcoming');
  const more = dated.slice(3);
  const content = `${!trips.length ? '<p role="status">No hay viajes publicados en este momento. Puedes consultar las próximas salidas con el equipo.</p>' : ''}<div id="trip-content" class="home-trip-grid">${dated.slice(0, 3).map(card).join('\n')}</div>${more.length ? `<details class="home-more-trips"><summary>Más viajes <span>${more.length} ${more.length === 1 ? 'viaje' : 'viajes'} <span aria-hidden="true">↓</span></span></summary><div class="home-trip-grid">${more.map(card).join('\n')}</div></details>` : ''}${pending.length ? `<section class="destination-collection" aria-labelledby="more-destinations-title"><h3 id="more-destinations-title">Próximos viajes por anunciar</h3><p>Estamos preparando las próximas fechas.</p><div class="home-trip-grid home-trip-grid-pending">${pending.map(card).join('\n')}</div></section>` : ''}`;
  const markers = /<!-- home-trips:start -->[\s\S]*?<!-- home-trips:end -->/;
  if (!markers.test(current)) throw Error('Missing home trip generation region');
  return current.replace(markers, `<!-- home-trips:start -->\n${content}\n<!-- home-trips:end -->`);
}
