import {renderDepartureRows} from './render-departure-rows.mjs';
import {departuresFor, levelLabel, levelsFor, tripPrice, tripPriceDetails, formatPrice, availabilityLabel} from './trip-model.mjs';
import {registrationDepartures, registrationUrl} from './brevo.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {sizedPhoto, photoSrcset} from './photo.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// Cards span one, two or three columns depending on the viewport.
const cardWidths = [500, 1000, 1600];
const cardSizes = '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw';

// Keep the next date on one line when the published range allows it.
export const compactDate = value => {
  const match = /^(\d{1,2}) ([a-z]{3,4}) (\d{4}) — (\d{1,2}) ([a-z]{3,4}) (\d{4})$/i.exec(value);
  if (!match) return value;
  const [, firstDay, firstMonth, firstYear, lastDay, lastMonth, lastYear] = match;
  if (firstYear === lastYear && firstMonth === lastMonth) return `${firstDay}–${lastDay} ${firstMonth} ${firstYear}`;
  if (firstYear === lastYear) return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth} ${firstYear}`;
  return value;
};

export function renderHomeTrip(trip, {heading, idPrefix = 'trip', compact = false, homepage = false} = {}) {
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
    const amount = escape(tripPrice(trip));
    const currentPrice = `${homepage ? amount.replace(/([\d.,]+ €)$/, '<span class="home-trip-current">$1</span>') : amount}${departures.some(d => d.price !== null) ? '<small>por persona</small>' : ''}`;
    const footer = compact ? `<div class="home-trip-booking${offer ? ' has-offer' : ''}">${discount}<a class="home-trip-link" aria-describedby="${idPrefix}-${id}-facts${offer ? ` ${idPrefix}-${id}-offer` : ''}" href="/viajes/${escape(trip.slug)}/" aria-labelledby="${idPrefix}-${id}-action ${idPrefix}-${id}-title"><span class="home-trip-price">${offer ? `<del>${escape(formatPrice(pricing.departure.regularPrice))}</del>` : ''}${currentPrice}</span><span class="home-trip-action" id="${idPrefix}-${id}-action">${dated ? 'Ver viaje' : 'Ver destino'}</span></a></div>` : `<a class="home-trip-link" aria-describedby="${idPrefix}-${id}-facts" href="/viajes/${escape(trip.slug)}/" aria-labelledby="${idPrefix}-${id}-action ${idPrefix}-${id}-title"><span class="home-trip-action" id="${idPrefix}-${id}-action">${dated ? 'Ver viaje' : 'Ver destino'}</span><span class="home-trip-price">${currentPrice}</span></a>`;
    const status = availability === 'Plazas disponibles' ? '' : `<span class="home-trip-status">${escape(availability)}</span>`;
    const dates = `<a class="home-trip-dates-link" href="/viajes/${escape(trip.slug)}/" aria-label="Ver viaje de ${escape(trip.name)}">${departures.length ? renderDepartureRows(trip, 'home-trip-departures') : '<p>Fechas por anunciar</p>'}</a>`;
    const [image, imageAlt] = homepage && trip.cardImage ? [trip.cardImage, trip.cardImageAlt] : [trip.hero, trip.heroAlt || trip.name];
    const dateControl = !homepage || departures.length > 1;
    const description = homepage && dated && trip.tagline && trip.tagline !== trip.name ? `<p class="home-trip-description">${escape(trip.tagline)}</p>` : '';
    return `<article class="home-trip${dated ? '' : ' home-trip-pending'}" ${compact ? 'data-compact-home ' : ''}aria-labelledby="${idPrefix}-${id}-title">
<div class="home-trip-media">${image ? `<img class="home-trip-photo" src="${escape(sizedPhoto(image, 1000))}"${photoSrcset(image, cardWidths) ? ` srcset="${escape(photoSrcset(image, cardWidths))}" sizes="${cardSizes}"` : ''} alt="${escape(imageAlt)}" width="1000" height="600" loading="lazy" decoding="async">` : '<div class="home-trip-placeholder" aria-hidden="true">LST</div>'}
<span class="home-trip-level">${escape(levelLabel(trip))}</span>${status}<${heading} id="${idPrefix}-${id}-title">${escape(trip.name)}</${heading}>
${dateControl ? `<details class="home-trip-dates" data-home-dates><summary aria-label="Ver fechas de ${escape(trip.name)}"><span class="home-trip-dates-label"><span class="dates-label-closed">Ver fechas</span><span class="dates-label-open">Cerrar ×</span></span></summary><div class="home-trip-dates-panel" role="region" tabindex="0" aria-label="Fechas de ${escape(trip.name)}">${dates}</div></details>` : ''}
</div><p class="home-trip-preview" id="${idPrefix}-${id}-facts"><span class="home-trip-preview-label">${escape(previewLabel)}</span><span class="home-trip-preview-date">${escape(preview)}</span>${compact && shownDate?.duration && shownDate.duration !== 'Por confirmar' ? `<span class="home-trip-duration">${escape(shownDate.duration)}</span>` : ''}</p>${description}${footer}</article>`;
}

// ---------------------------------------------------------------------------
// Home page: every commercial fact (dates, prices, levels, availability, the
// next departure) comes from the published catalogue. The hand-written page
// only provides the layout and the generation regions.

const WHATSAPP = 'https://wa.me/34648189257?text=Hola%2C%20LST.%20Quiero%20consultar%20un%20viaje%20de%20surf.';
const ticketWidths = [500, 800, 1200];
const ticketSizes = '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 84vw';
// Level filters on the home: beginners, intermediate, and autonomous surfers.
// Names match /niveles/; the second line says the wave in surfer words, on one
// growing scale: foam up to the waist, knee to chest, chest and up.
export const homeLevelFilters = [['all', 'Todas', 'Cualquier nivel'], ['1', 'Iniciación', 'Espuma, hasta la cintura'], ['2', 'Base', 'De la rodilla al pecho'], ['3', 'Intermedio y avanzado', 'Del pecho para arriba']];
// Same rule as home.js: the last filter groups the autonomous levels 3 and 4.
export const matchesLevelFilter = (trip, filter) => filter === 'all' || (filter === '3' ? levelsFor(trip).some(l => l >= 3) : levelsFor(trip).includes(Number(filter)));
// A wave that grows with the level; "Todas" stacks the small and the big one.
const filterWaves = {
  all: '<path d="M2 30c8-2 14-12 24-12s14 10 22 12" /><path d="M2 30c10-4 16-24 30-24 9 0 12 8 8 12" />',
  1: '<path d="M2 30c8 0 12-4 20-4s14 4 24 4" />',
  2: '<path d="M2 30c10-2 14-14 26-14 7 0 9 6 6 9" />',
  3: '<path d="M2 30c10-4 14-26 30-26 10 0 14 9 9 14-3 3-8 1-7-3" />',
};
const filterButton = (trips, [value, label, detail], i) => {
  const count = trips.filter(t => matchesLevelFilter(t, value)).length;
  return `<button class="hp-chip" type="button" data-filter="${value}" aria-pressed="${i === 0}"><svg class="hp-chip-wave" viewBox="0 0 50 34" aria-hidden="true">${filterWaves[value]}</svg><span class="hp-chip-label">${label}</span><span class="hp-chip-detail">${detail}</span><span class="hp-chip-count" aria-label="${count} ${count === 1 ? 'viaje' : 'viajes'}">${count}</span></button>`;
};

const firstStart = trip => departuresFor(trip).map(d => d.start).filter(Boolean).sort()[0];
const chronological = trips => trips.filter(t => t.state === 'confirmed').map((trip, order) => ({trip, order, start: firstStart(trip)}))
  .sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999') || a.order - b.order).map(t => t.trip);
// Short label for a tag: "20–22 nov", "28 feb – 7 mar".
const shortDate = value => compactDate(value).replace(/ \d{4}$/, '');
// Natural Spanish list: "A", "A y B", "A, B y C" ("e" before an "i" sound: "Agadir e Imsouane").
const and = next => /^h?i(?![aeiouáéíóú])/i.test(next) ? 'e' : 'y';
const listOf = items => items.length > 1 ? `${items.slice(0, -1).join(', ')} ${and(items.at(-1))} ${items.at(-1)}` : items.join('');
// A concrete line for the ticket: where you surf. More than three spots are
// summarised so the line stays short; without spots, the CMS tagline.
export const ticketLine = trip => {
  const spots = (trip.spots ?? []).map(s => String(s?.title ?? s?.name ?? '').trim()).filter(Boolean);
  if (spots.length) return `Surf en ${spots.length > 3 ? `${spots.slice(0, 3).join(', ')} y ${spots.length - 3} ${spots.length - 3 === 1 ? 'spot' : 'spots'} más` : listOf(spots)}`;
  return trip.tagline && trip.tagline !== trip.name ? trip.tagline : '';
};
const photo = (trip, width) => {
  const image = trip.cardImage || trip.hero;
  return image ? {src: sizedPhoto(image, width), srcset: photoSrcset(image, ticketWidths), alt: trip.cardImage ? trip.cardImageAlt : (trip.heroAlt || trip.name)} : null;
};
const whatsappLink = (label, className = '') => `<a class="${className}" data-whatsapp="orientacion" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">${label}</a>`;

// The departure a visitor can actually request first: dated, open and with a form.
export function nextDeparture(trips) {
  for (const trip of chronological(trips)) {
    const departure = registrationDepartures(trip).sort((a, b) => (a.start || '').localeCompare(b.start || ''))[0];
    if (departure) return {trip, departure};
  }
  return null;
}

export function renderHomeTicket(trip) {
  const id = escape(trip.id);
  const departures = departuresFor(trip);
  const dated = trip.state === 'confirmed';
  const sorted = [...departures].sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'));
  const first = sorted[0];
  const {departure: fare, from} = tripPriceDetails(trip);
  const offer = fare?.promotion;
  const availability = availabilityLabel(trip);
  const href = `/viajes/${escape(trip.slug)}/`;
  const image = photo(trip, 800);
  // An offer always shows the date of the departure that carries it.
  const shown = offer ? fare : first;
  const dateTag = !dated || !shown ? 'Por anunciar'
    : offer && departures.length > 1 ? `Tarifa del ${shortDate(shown.date)}`
    : departures.length > 1 ? `${departures.length} fechas · desde ${shortDate(shown.date)}` : shortDate(shown.date);
  const status = availability === 'Últimas plazas' ? `<span class="hp-tag hp-tag-hot">Últimas plazas</span>`
    : availability === 'Completo' ? `<span class="hp-tag hp-tag-soft">Completo</span>`
    : offer ? `<span class="hp-tag hp-tag-hot">${escape(offer.label || 'Oferta')}</span>` : '';
  const duration = shown?.duration && shown.duration !== 'Por confirmar' ? shown.duration : '';
  const area = trip.place ? String(trip.place).split('·').at(-1).trim() : '';
  const facts = [duration, area].filter(Boolean).map(escape).join(' · ');
  const price = fare
    ? `<p class="hp-price">${from ? '<small class="hp-from">desde</small>' : ''}${offer ? `<del>${escape(formatPrice(fare.regularPrice))}</del>` : ''}<span>${escape(formatPrice(fare.price))}</span><small>por persona</small></p>`
    : `<p class="hp-price hp-price-tbc"><span>${escape(tripPrice(trip))}</span></p>`;
  const saving = offer ? Math.round((fare.regularPrice - fare.price) * 100) / 100 : 0;
  const condition = offer ? `<p class="hp-offer"><strong>${escape(formatPrice(saving))} de descuento</strong> · ${escape(promotionCondition(offer))}</p>` : '';
  const line = dated ? ticketLine(trip) : '';
  const tagline = line ? `<p class="hp-tagline">${escape(line)}</p>` : '';
  const action = `<a class="hp-btn" href="${href}" aria-label="Ver viaje de ${escape(trip.name)}">${dated ? 'Ver viaje' : 'Ver destino'}</a>`;
  return `<article class="hp-ticket" data-levels="${levelsFor(trip).join(' ')}" aria-labelledby="ticket-${id}-title">
<a class="hp-ticket-media" href="${href}" tabindex="-1" aria-hidden="true">${image ? `<img src="${escape(image.src)}"${image.srcset ? ` srcset="${escape(image.srcset)}" sizes="${ticketSizes}"` : ''} alt="${escape(image.alt)}" width="800" height="860" loading="lazy" decoding="async">` : '<span class="hp-ticket-placeholder" aria-hidden="true">LST</span>'}<span class="hp-tag hp-tag-date">${escape(dateTag)}</span>${status}</a>
<h3 class="hp-ticket-name" id="ticket-${id}-title"><a href="${href}">${escape(trip.name)}</a></h3>
<div class="hp-stub"><div class="hp-stub-top"><div class="hp-facts"><span class="hp-lv"><span class="hp-lvtext">${escape(levelLabel(trip))}</span></span>${facts ? `<span class="hp-where">${facts}</span>` : ''}</div>${price}</div>${tagline}${condition}<div class="hp-acts">${action}</div></div>
</article>`;
}

// The trip list is required; the hero and mobile bar regions are optional.
const region = (current, name, content, required = false) => {
  const markers = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if (!markers.test(current)) { if (required) throw Error('Missing home trip generation region'); return current; }
  return current.replace(markers, () => `<!-- ${name}:start -->${content}<!-- ${name}:end -->`);
};

export function renderHomeTrips(current, trips) {
  const dated = chronological(trips);
  const pending = trips.filter(t => t.state === 'upcoming');
  const next = nextDeparture(trips);

  const tickets = `${!trips.length ? '<p class="hp-empty" role="status">No hay viajes publicados en este momento. Puedes consultar las próximas salidas con el equipo.</p>' : ''}${dated.length ? `<div class="hp-chips" role="group" aria-label="¿Cómo surfeas? Filtra las salidas por nivel">${homeLevelFilters.map((filter, i) => filterButton(dated, filter, i)).join('')}</div>
<div class="hp-rail" id="trip-content" tabindex="0" aria-label="Salidas">${dated.map(renderHomeTicket).join('\n')}</div>
<p class="hp-filter-empty" hidden>No hay salidas para ese nivel ahora mismo. ${whatsappLink('Cuéntanos cómo surfeas', 'hp-inline')} y te orientamos.</p>
<div class="hp-railnav" aria-hidden="true"><span class="hp-count"></span><span class="hp-dots"></span><span>Desliza →</span></div>` : ''}${pending.length ? `<div class="hp-pending"><h3>Próximamente</h3><ul>${pending.map(t => `<li><a href="/viajes/${escape(t.slug)}/">${escape(t.name)}</a></li>`).join('')}</ul><p>Estamos preparando las fechas.</p></div>` : ''}`;

  const nextCard = next ? (() => {
    const image = photo(next.trip, 200);
    const availability = availabilityLabel(next.trip);
    return `<a class="hp-next" href="/viajes/${escape(next.trip.slug)}/">${image ? `<img src="${escape(image.src)}" alt="" width="88" height="88" decoding="async">` : ''}<span class="hp-next-body"><span class="hp-next-k">Próxima salida</span><strong>${escape(next.trip.name)}</strong><span class="hp-next-row"><span>${escape(compactDate(next.departure.date))}${next.departure.price ? ` · <span class="hp-next-price">${escape(formatPrice(next.departure.price))}</span>` : ''}</span><span class="hp-next-go">${availability === 'Últimas plazas' ? 'Últimas plazas' : 'Ver viaje'}</span></span></span></a>`;
  })() : '';

  const bar = next
    ? `<nav class="hp-bar" aria-label="Próxima salida"><a class="hp-bar-info" href="/viajes/${escape(next.trip.slug)}/"><span>Próxima salida</span><strong>${escape(next.trip.name)}${next.departure.price ? ` · ${escape(formatPrice(next.departure.price))}` : ''}</strong></a><span class="hp-bar-acts">${whatsappLink('<span class="hp-sr">WhatsApp</span><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M20.5 11.5a8.6 8.6 0 0 1-12.7 7.5L3 20.5l1.5-4.7A8.6 8.6 0 1 1 20.5 11.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>', 'hp-bar-wa')}<a class="hp-btn" href="${escape(registrationUrl(next.trip, next.departure))}">Solicitar</a></span></nav>`
    : `<nav class="hp-bar" aria-label="Contacto"><a class="hp-bar-info" href="/viajes/"><span>Viajes de surf</span><strong>Ver todas las salidas</strong></a><span class="hp-bar-acts">${whatsappLink('WhatsApp', 'hp-btn')}</span></nav>`;

  // Short destination names rotate in the hero after "¿Te vienes a…".
  const words = [...new Set(dated.map(t => t.name).filter(name => name.length <= 10))];

  let html = region(current, 'home-trips', `\n${tickets}\n`, true);
  html = region(html, 'home-next', nextCard);
  html = region(html, 'home-bar', bar);
  html = region(html, 'home-words', `<span class="hp-rot" aria-hidden="true" data-words="${escape(JSON.stringify(words.map(w => `${w}?`)))}"><span>surfear?</span></span>`);
  return html;
}
