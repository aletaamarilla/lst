import {compactDate} from './render-home-trips.mjs';
import {levelsFor, levelLabel, departuresFor, tripPriceDetails, tripPrice, formatPrice, availabilityLabel} from './trip-model.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {sizedPhoto, photoSrcset} from './photo.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

// /viajes/ reads as the season: trips grouped by the month of their first
// departure, with a "tide line" index of every departure at the top.
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const PENDING = 'pendiente';

const photoWidths = [500, 800, 1200];
const photoSizes = '(min-width: 900px) 34vw, 100vw';

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
const monthIndex = key => Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;
const keyOf = index => `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}`;
// "Landas · Francia" → "Landas, Francia".
const place = trip => trip.place ? String(trip.place).split('·').map(s => s.trim()).filter(Boolean).join(', ') : '';
// "20–22 nov 2026" → "20–22": the month is already the column.
const dayRange = departure => {
  const [start, end] = [departure.start, departure.end].map(v => v && new Date(v + 'T00:00:00Z'));
  if (!start) return '';
  if (!end || end <= start) return String(start.getUTCDate());
  return start.getUTCMonth() === end.getUTCMonth()
    ? `${start.getUTCDate()}–${end.getUTCDate()}`
    : `${start.getUTCDate()} – ${end.getUTCDate()} ${SHORT[end.getUTCMonth()]}`;
};

const levelBar = trip => {
  const levels = levelsFor(trip);
  return `<span class="ct-lvbar" aria-hidden="true">${[1, 2, 3, 4].map(l => `<i${levels.includes(l) ? ' class="on"' : ''}></i>`).join('')}</span>`;
};

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
  const tag = !dated ? 'Fechas por anunciar' : availability === 'Plazas disponibles' ? '' : availability;
  const durations = [...new Set(departures.map(d => d.duration).filter(d => d && d !== 'Por confirmar'))];
  const where = place(trip);
  const tagline = dated && trip.tagline && trip.tagline !== trip.name ? `<p class="ct-tagline">${escape(trip.tagline)}</p>` : '';
  const dates = departures.length
    ? `<ul class="ct-dates">${departures.map(d => `<li>${escape(compactDate(d.date))}</li>`).join('')}</ul>`
    : 'Por anunciar';
  const facts = [
    [departures.length > 1 ? 'Fechas' : 'Fecha', dates],
    durations.length ? ['Duración', escape(durations.join(' o '))] : null,
    ['Nivel', `${levelBar(trip)}<span>${escape(levelLabel(trip))}</span>`],
  ].filter(Boolean).map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('');
  const price = fare
    ? `<p class="ct-price">${from ? '<small>desde</small>' : ''}${offer ? `<del>${escape(formatPrice(fare.regularPrice))}</del>` : ''}<strong>${escape(formatPrice(fare.price))}</strong><small>por persona</small></p>`
    : `<p class="ct-price ct-price-tbc"><strong>${escape(tripPrice(trip))}</strong></p>`;
  const saving = offer ? Math.round((fare.regularPrice - fare.price) * 100) / 100 : 0;
  const condition = offer ? `<p class="ct-offer" id="catalog-${id}-offer"><strong>${escape(formatPrice(saving))} de descuento</strong> ${escape(promotionCondition(offer))}</p>` : '';
  return `<article class="ct-ticket" id="viaje-${escape(trip.slug)}" data-catalog-trip data-levels="${levelsFor(trip).join(' ')}" aria-labelledby="catalog-${id}-title">
<a class="ct-photo" href="${href}" tabindex="-1" aria-hidden="true">${image ? `<img src="${escape(sizedPhoto(image, 800))}"${srcset ? ` srcset="${escape(srcset)}" sizes="${photoSizes}"` : ''} alt="${escape(alt)}" width="800" height="600" loading="lazy" decoding="async">` : '<span class="ct-photo-empty">LST</span>'}${tag ? `<span class="ct-tag${availability === 'Últimas plazas' ? ' ct-tag-hot' : ''}">${escape(tag)}</span>` : ''}</a>
<div class="ct-body">${where ? `<p class="ct-place">${escape(where)}</p>` : ''}<h3 class="ct-name" id="catalog-${id}-title" style="--len:${[...trip.name].length}"><a href="${href}">${escape(trip.name)}</a></h3>${tagline}<dl class="ct-facts">${facts}</dl></div>
<div class="ct-stub">${price}${condition}<a class="hp-btn catalog-card-link" href="${href}" aria-label="${dated ? 'Ver viaje' : 'Ver destino'}: ${escape(trip.name)}">${dated ? 'Ver viaje' : 'Ver destino'}</a></div>
</article>`;
}

const monthTitle = key => key === PENDING ? 'Fechas por anunciar' : MONTHS[Number(key.slice(5, 7)) - 1];

function renderSeason(groups) {
  // One entry per departure, in the month it starts; the ticket sits in the trip's first month.
  const entries = groups.filter(g => g.key !== PENDING).flatMap(g => g.trips.flatMap(trip =>
    departuresFor(trip).filter(d => d.start).map(d => ({trip, d, key: d.start.slice(0, 7)}))))
    .sort((a, b) => a.d.start.localeCompare(b.d.start));
  if (!entries.length) return '';
  const first = monthIndex(entries[0].key), last = monthIndex(entries.at(-1).key);
  const byKey = new Map(groups.map(g => [g.key, g]));
  let previousYear = '';
  const columns = Array.from({length: last - first + 1}, (_, i) => {
    const key = keyOf(first + i);
    const list = entries.filter(e => e.key === key);
    const year = key.slice(0, 4);
    const label = `<span class="ct-season-m">${SHORT[Number(key.slice(5, 7)) - 1]}</span>${year !== previousYear ? `<span class="ct-season-y">${year}</span>` : ''}`;
    previousYear = year;
    const head = byKey.has(key) ? `<a class="ct-season-head" href="#mes-${key}">${label}</a>` : `<span class="ct-season-head">${label}</span>`;
    if (!list.length) return `<li class="ct-season-col is-quiet">${head}<p class="ct-season-none">Sin salidas</p></li>`;
    return `<li class="ct-season-col">${head}<ul>${list.map(({trip, d}) => `<li data-levels="${levelsFor(trip).join(' ')}"><a href="#viaje-${escape(trip.slug)}"><span class="ct-season-d">${escape(dayRange(d))}</span> ${escape(trip.name)}</a></li>`).join('')}</ul></li>`;
  });
  const pending = byKey.get(PENDING);
  if (pending) columns.push(`<li class="ct-season-col ct-season-later"><a class="ct-season-head" href="#mes-${PENDING}"><span class="ct-season-m">Más</span></a><ul>${pending.trips.map(trip => `<li data-levels="${levelsFor(trip).join(' ')}"><a href="#viaje-${escape(trip.slug)}">${escape(trip.name)}</a></li>`).join('')}</ul></li>`);
  return `<nav class="ct-season" aria-label="Salidas de la temporada, por mes"><svg class="ct-tide" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 26 C 60 26, 90 8, 150 8 S 240 30, 300 28 S 400 6, 470 10 S 560 32, 640 26 S 760 4, 840 12 S 950 34, 1030 24 S 1140 10, 1200 18"/></svg><ol class="ct-season-cols" style="--cols:${columns.length}">${columns.join('')}</ol></nav>`;
}

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
  let html = current.replace(markers, () => `<!-- catalog:start -->\n${content}\n<!-- catalog:end -->`);
  const season = /<!-- catalog-season:start -->[\s\S]*?<!-- catalog-season:end -->/;
  if (season.test(html)) html = html.replace(season, () => `<!-- catalog-season:start -->${renderSeason(groups)}<!-- catalog-season:end -->`);
  return html;
}
