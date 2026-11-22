// Shared markup for a live early bird. The adapter already dropped offers that are past
// their date, full or unconfirmed on build day; every piece here also carries
// `data-eb-until` so /app.js can retire it in the browser once that day has passed,
// even if nobody rebuilds the site.
import {formatPrice} from './trip-model.mjs';
import {earlyBirdUntilLong, earlyBirdUntilShort} from './trip-pricing.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const until = departure => ` data-eb-until="${escape(departure.earlyBird.until)}"`;

export const liveEarlyBird = departure => departure?.earlyBird ?? null;

// The general price, struck through. Removed in the browser when the offer ends.
export function earlyBirdWas(departure, className = 'eb-was') {
  if (!liveEarlyBird(departure)) return '';
  return `<del class="${className}"${until(departure)} data-eb="was"><span class="visually-hidden">Precio general: </span>${escape(formatPrice(departure.regularPrice))}</del>`;
}

// Attributes for the element showing the current price: the browser swaps in `regularText`.
export function earlyBirdPriceAttrs(departure, regularText) {
  if (!liveEarlyBird(departure)) return '';
  return `${until(departure)} data-eb="price" data-eb-regular="${escape(regularText)}"`;
}

// Attributes for anything that only exists while the offer lasts (tags, notes).
export const earlyBirdOnly = departure => liveEarlyBird(departure) ? `${until(departure)} data-eb="only"` : '';

// "39 € menos hasta el 6 dic": one line for cards and rows.
export function earlyBirdShortLine(departure) {
  const offer = liveEarlyBird(departure);
  return offer ? `${formatPrice(offer.saving)} menos hasta el ${earlyBirdUntilShort(offer.until)}` : '';
}

// Booking card note: the deadline is the message, the countdown is filled in the browser.
export function earlyBirdNote(departure, {date = null, className = 'eb-note'} = {}) {
  const offer = liveEarlyBird(departure);
  if (!offer) return '';
  return `<div class="${className}"${earlyBirdOnly(departure)}><p class="eb-note-deadline"><strong>Early bird hasta el ${escape(earlyBirdUntilLong(offer.until))}.</strong> Ahorras ${escape(formatPrice(offer.saving))}${date ? ` en la salida del ${escape(date)}` : ''}.</p><p class="eb-note-after"><span${until(departure)} data-eb="days"></span>Después, ${escape(formatPrice(departure.regularPrice))}.</p></div>`;
}
