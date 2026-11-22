import {compactDate} from './render-home-trips.mjs';
import {levelsFor, levelLabel, departuresFor, tripPriceDetails, tripPrice, formatPrice, availabilityLabel} from './trip-model.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {sizedPhoto, photoSrcset} from './photo.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

// /viajes/ is a departures board: a short opening, the level filter, and every
// trip as a compact ticket (photo, date, name, level, length and price), in date
// order under the month of its first departure.
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const PENDING = 'pendiente';

const photoWidths = [500, 800, 1200];
const photoSizes = '(min-width: 900px) 280px, 120px';

// Level filters: one per guide level, so /viajes/?nivel=N links keep working.
export const catalogLevels = [
  ['', 'Todos', 'Cualquier nivel', '<path d="M2 30c8-2 14-12 24-12s14 10 22 12" /><path d="M2 30c10-4 16-24 30-24 9 0 12 8 8 12" />'],
  ['1', 'Iniciación', 'Nivel 1', '<path d="M2 30c8 0 12-4 20-4s14 4 24 4" />'],
  ['2', 'Base', 'Nivel 2', '<path d="M2 30c10-2 14-14 26-14 7 0 9 6 6 9" />'],
  ['3', 'Intermedio', 'Nivel 3', '<path d="M2 30c10-4 14-26 30-26 10 0 14 9 9 14-3 3-8 1-7-3" />'],
  ['4', 'Avanzado', 'Nivel 4', '<path d="M2 31c6-2 9-27 26-28 12-1 18 8 14 15-3 5-10 4-10-1 0-4 5-5 7-2" />'],
];

const startOf = trip => trip.state === 'confirmed' ? departuresFor(trip).map(d => d.start).filter(Boolean).sort()[0] : undefined;
const monthKey = start => start ? start.slice(0, 7) : PENDING;
// "4–8 dic 2026" → "4–8 dic": the month heading already gives the year.
const shortDate = value => compactDate(value).replace(/ \d{4}$/, '');
// The region after the last "·": "Vejer de la Frontera · Cádiz" → "Cádiz".
const area = trip => trip.place ? String(trip.place).split('·').at(-1).trim() : '';

function renderTicket(trip) {
  const id = escape(trip.id);
  const href = `/viajes/${escape(trip.slug)}/`;
  const dated = trip.state === 'confirmed';
  const departures = dated ? [...departuresFor(trip)].sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999')) : [];
  const {departure: fare, from} = tripPriceDetails(trip);
  const offer = fare?.promotion;
  const availability = availabilityLabel(trip);
  const image = trip.cardImage || trip.hero;
  const alt = trip.cardImage ? trip.cardImageAlt : (trip.heroAlt || trip.name);
  const srcset = image ? photoSrcset(image, photoWidths) : '';
  const tag = availability === 'Últimas plazas' || availability === 'Completo' ? availability : offer ? (offer.label || 'Oferta') : '';
  const hot = availability === 'Últimas plazas' || (offer && availability !== 'Completo');
  const durations = [...new Set(departures.map(d => d.duration).filter(d => d && d !== 'Por confirmar'))];
  const place = area(trip);
  const length = durations.length ? `${escape(durations.join(' o '))}${place ? `<span class="ct-area"> · ${escape(place)}</span>` : ''}` : escape(place);
  const when = departures.length
    ? `<ul class="ct-dates">${departures.map(d => `<li>${escape(shortDate(d.date))}</li>`).join('')}</ul>`
    : ''; // Without dates the month heading already says «Fechas por anunciar».
  const price = fare
    ? `<p class="ct-price">${from ? '<small>desde</small> ' : ''}${offer ? `<del>${escape(formatPrice(fare.regularPrice))}</del> ` : ''}<strong>${escape(formatPrice(fare.price))}</strong> <small>por persona</small></p>`
    : `<p class="ct-price ct-price-tbc"><strong>${escape(tripPrice(trip))}</strong></p>`;
  const saving = offer ? Math.round((fare.regularPrice - fare.price) * 100) / 100 : 0;
  const condition = offer ? `<p class="ct-offer" id="catalog-${id}-offer"><strong>${escape(formatPrice(saving))} de descuento:</strong> ${escape(promotionCondition(offer))}</p>` : '';
  return `<article class="ct-ticket" id="viaje-${escape(trip.slug)}" data-catalog-trip data-levels="${levelsFor(trip).join(' ')}" aria-labelledby="catalog-${id}-title">
<div class="ct-photo">${image ? `<img src="${escape(sizedPhoto(image, 500))}"${srcset ? ` srcset="${escape(srcset)}" sizes="${photoSizes}"` : ''} alt="${escape(alt)}" width="500" height="500" loading="lazy" decoding="async">` : '<span class="ct-photo-empty" aria-hidden="true">LST</span>'}${tag ? `<span class="ct-tag${hot ? ' ct-tag-hot' : ''}">${escape(tag)}</span>` : ''}</div>
<div class="ct-body">${when}<h3 class="ct-name" id="catalog-${id}-title">${escape(trip.name)}</h3><p class="ct-level">${escape(levelLabel(trip))}</p>
<div class="ct-foot">${length ? `<p class="ct-length">${length}</p>` : ''}${price}</div>${condition}</div>
<a class="hp-btn catalog-card-link" href="${href}" aria-label="${dated ? 'Ver viaje' : 'Ver destino'}: ${escape(trip.name)}"${offer ? ` aria-describedby="catalog-${id}-offer"` : ''}><span>${dated ? 'Ver viaje' : 'Ver destino'}</span></a>
</article>`;
}

const monthTitle = key => key === PENDING ? 'Fechas por anunciar' : MONTHS[Number(key.slice(5, 7)) - 1];

function renderFilters(trips) {
  return `<div class="ct-filters" data-catalog-filters role="group" aria-label="Filtrar viajes por nivel" hidden><p class="ct-filters-q" aria-hidden="true">¿Cómo surfeas?</p><div class="ct-chips">${catalogLevels.map(([value, label, detail, wave]) => {
    const count = value ? trips.filter(t => levelsFor(t).includes(Number(value))).length : trips.length;
    return `<button class="hp-chip" type="button" data-catalog-level="${value}" data-catalog-label="${value ? `${detail.toLowerCase()} (${label.toLowerCase()})` : ''}" aria-pressed="${!value}"><svg class="hp-chip-wave" viewBox="0 0 50 34" aria-hidden="true">${wave}</svg><span class="ct-chip-n" aria-hidden="true">${value || label}</span><span class="hp-chip-label">${label}</span><span class="hp-chip-detail">${detail}</span><span class="hp-chip-count" aria-label="${count} ${count === 1 ? 'viaje' : 'viajes'}">${count}</span></button>`;
  }).join('')}</div></div>`;
}

export function renderCatalog(current, trips) {
  const ordered = trips.map((trip, order) => ({trip, order, start: startOf(trip)}))
    .sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999') || a.order - b.order);
  const groups = [];
  for (const {trip, start} of ordered) {
    const key = monthKey(start);
    if (groups.at(-1)?.key !== key) groups.push({key, year: start?.slice(0, 4), trips: []});
    groups.at(-1).trips.push(trip);
  }
  let previousYear = '';
  const months = groups.map(({key, year, trips: list}) => {
    const showYear = year && year !== previousYear;
    if (year) previousYear = year;
    return `<section class="ct-month${key === PENDING ? ' ct-month-later' : ''}" id="mes-${key}" data-catalog-month aria-labelledby="mes-${key}-title"><h2 class="ct-month-name" id="mes-${key}-title">${escape(monthTitle(key))}${showYear ? ` <span>${year}</span>` : ''}</h2><div class="ct-month-trips">${list.map(renderTicket).join('\n')}</div></section>`;
  }).join('\n');

  const markers = /<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->/;
  if (!markers.test(current)) throw Error('Missing catalog generation markers');
  const content = trips.length
    ? `${renderFilters(trips)}
<p class="ct-status" id="catalog-status" role="status" aria-live="polite" aria-atomic="true">${trips.length} de ${trips.length} viajes.</p>
<div class="ct-months" id="catalog-results">${months}</div>`
    : '<p class="ct-status" id="catalog-status" role="status">No hay viajes publicados en este momento.</p>';
  return current.replace(markers, () => `<!-- catalog:start -->\n${content}\n<!-- catalog:end -->`);
}
