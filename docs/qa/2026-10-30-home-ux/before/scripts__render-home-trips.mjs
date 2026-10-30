import {renderDepartureRows} from './render-departure-rows.mjs';
import {departuresFor, levelLabel, tripPrice, tripPriceDetails, formatPrice, availabilityLabel} from './trip-model.mjs';
import {promotionCondition} from './trip-pricing.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// Keep the next date on one line when the published range allows it.
const compactDate = value => {
  const match = /^(\d{1,2}) ([a-z]{3,4}) (\d{4}) — (\d{1,2}) ([a-z]{3,4}) (\d{4})$/i.exec(value);
  if (!match) return value;
  const [, firstDay, firstMonth, firstYear, lastDay, lastMonth, lastYear] = match;
  if (firstYear === lastYear && firstMonth === lastMonth) return `${firstDay}–${lastDay} ${firstMonth} ${firstYear}`;
  if (firstYear === lastYear) return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth} ${firstYear}`;
  return value;
};

export function renderHomeTrip(trip, {heading, idPrefix = 'trip', compact = false} = {}) {
    const departures = departuresFor(trip);
    const dated = trip.state === 'confirmed';
    heading ??= dated ? 'h3' : 'h4';
    const id = escape(trip.id);
    const availability = availabilityLabel(trip);
    const firstDate = [...departures].sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'))[0];
    const pricing = tripPriceDetails(trip);
    const offer = compact ? pricing.departure?.promotion : null;
    // Keep the displayed date, current price and saving on the same departure.
    const shownDate = offer ? pricing.departure : firstDate;
    const preview = shownDate ? compactDate(shownDate.date) : 'Por anunciar';
    const previewLabel = offer && shownDate.id !== firstDate?.id ? 'Fecha de la tarifa' : 'Próx. fecha';
    const discount = offer ? `<p class="home-trip-saving" id="${idPrefix}-${id}-offer"><strong>${escape(formatPrice(Math.round((pricing.departure.regularPrice - pricing.departure.price) * 100) / 100))} de descuento</strong><span>${escape(promotionCondition(offer))}</span></p>` : '';
    const currentPrice = `${escape(tripPrice(trip))}${departures.some(d => d.price !== null) ? '<small>por persona</small>' : ''}`;
    const footer = compact ? `<div class="home-trip-booking${offer ? ' has-offer' : ''}">${discount}<a class="home-trip-link" aria-describedby="${idPrefix}-${id}-facts${offer ? ` ${idPrefix}-${id}-offer` : ''}" href="/viajes/${escape(trip.slug)}/" aria-labelledby="${idPrefix}-${id}-action ${idPrefix}-${id}-title"><span class="home-trip-price">${offer ? `<del>${escape(formatPrice(pricing.departure.regularPrice))}</del>` : ''}${currentPrice}</span><span class="home-trip-action" id="${idPrefix}-${id}-action">${dated ? 'Ver viaje' : 'Ver destino'}</span></a></div>` : `<a class="home-trip-link" aria-describedby="${idPrefix}-${id}-facts" href="/viajes/${escape(trip.slug)}/" aria-labelledby="${idPrefix}-${id}-action ${idPrefix}-${id}-title"><span class="home-trip-action" id="${idPrefix}-${id}-action">${dated ? 'Ver viaje' : 'Ver destino'}</span><span class="home-trip-price">${currentPrice}</span></a>`;
    const status = availability === 'Plazas disponibles' ? '' : `<span class="home-trip-status">${escape(availability)}</span>`;
    const dates = `<a class="home-trip-dates-link" href="/viajes/${escape(trip.slug)}/" aria-label="Ver viaje de ${escape(trip.name)}">${departures.length ? renderDepartureRows(trip, 'home-trip-departures') : '<p>Fechas por anunciar</p>'}</a>`;
    return `<article class="home-trip${dated ? '' : ' home-trip-pending'}" ${compact ? 'data-compact-home ' : ''}aria-labelledby="${idPrefix}-${id}-title">
<div class="home-trip-media">${trip.hero ? `<img class="home-trip-photo" src="${escape(trip.hero)}" alt="${escape(trip.heroAlt || trip.name)}" width="1000" height="600" loading="lazy" decoding="async">` : '<div class="home-trip-placeholder" aria-hidden="true">LST</div>'}
<span class="home-trip-level">${escape(levelLabel(trip))}</span>${status}<${heading} id="${idPrefix}-${id}-title">${escape(trip.name)}</${heading}>
<details class="home-trip-dates" data-home-dates><summary aria-label="Ver fechas de ${escape(trip.name)}"><span class="home-trip-dates-label"><span class="dates-label-closed">Ver fechas</span><span class="dates-label-open">Cerrar ×</span></span></summary><div class="home-trip-dates-panel" role="region" tabindex="0" aria-label="Fechas de ${escape(trip.name)}">${dates}</div></details>
</div><p class="home-trip-preview" id="${idPrefix}-${id}-facts"><span class="home-trip-preview-label">${escape(previewLabel)}</span><span class="home-trip-preview-date">${escape(preview)}</span>${compact && shownDate?.duration && shownDate.duration !== 'Por confirmar' ? `<span class="home-trip-duration">${escape(shownDate.duration)}</span>` : ''}</p>${footer}</article>`;
}

export function renderHomeTrips(current, trips) {
  const card = trip => renderHomeTrip(trip, {compact: true});
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
