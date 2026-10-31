import {sharedTripContentFields} from './trip-content-fields.mjs';
import {validateRegistrationMappings} from './brevo.mjs';
import {tripName, consolidateTrips, aggregateAvailability} from './trip-groups.mjs';
import {departurePricing, validatePromotions} from './trip-pricing.mjs';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const optional = value => value == null || value === '';
const text = (value, field, required = false) => {
  if (optional(value)) { if (required) throw Error(`Falta ${field}`); return ''; }
  if (typeof value !== 'string') throw Error(`Texto inválido: ${field}`);
  return value;
};
const positive = (value, field) => {
  if (value == null) return null;
  if (!Number.isFinite(value) || value <= 0 || Math.abs(Math.round(value * 100) - value * 100) > 1e-8) throw Error(`Importe inválido: ${field}`);
  return value;
};
export function httpsUrl(value, field) {
  if (optional(value)) return '';
  let url; try { url = new URL(value); } catch { throw Error(`URL inválida: ${field}`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw Error(`URL HTTPS requerida: ${field}`);
  return url.href;
}
function image(value, field) {
  if (!value) return '';
  const url = httpsUrl(value.url, field);
  if (!url) throw Error(`Imagen sin asset publicado: ${field}`);
  if (!url.startsWith('https://cdn.sanity.io/images/q5bj2rn2/production/')) throw Error(`Imagen fuera del proyecto: ${field}`);
  return url;
}
const list = (value, field) => {
  if (value == null) return [];
  if (!Array.isArray(value)) throw Error(`Lista inválida: ${field}`);
  return value;
};
const strings = (value, field) => list(value, field).map(v => text(v, field, true));
const pairs = (value, a, b, field) => list(value, field).map(v => [text(v[a], field, true), text(v[b], field, true)]);
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validateBrevoValue(value) {
  if (!Number.isSafeInteger(value) || value < 1) throw Error('Valor VIAJE_SURF inválido');
  return value;
}
function dates(d) {
  if (!validDate(d.start) || !validDate(d.end) || d.end < d.start) throw Error('Fechas de salida inválidas');
  const fmt = new Intl.DateTimeFormat('es-ES', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  return `${fmt.format(new Date(d.start))} — ${fmt.format(new Date(d.end))}`;
}

function validateAvailability(value, slug) {
  if (!['available', 'last_places', 'full', 'enquiry'].includes(value)) throw Error(`Disponibilidad inválida: ${slug}`);
  return value;
}
function validateCapacity(value, slug) {
  const capacity = {total: value.total ?? null, available: value.available ?? null};
  for (const key of ['total', 'available']) if (capacity[key] != null && (!Number.isInteger(capacity[key]) || capacity[key] < (key === 'total' ? 1 : 0))) throw Error(`Capacidad inválida: ${slug}`);
  if (capacity.available != null && capacity.total != null && capacity.available > capacity.total) throw Error(`Disponibilidad superior a capacidad: ${slug}`);
  return capacity;
}

export function adaptTrip(doc) {
  if (doc._type !== 'trip' || !doc._id || /^(drafts|versions)\./.test(doc._id)) throw Error('Documento no publicado');
  const slug = doc.slug?.current;
  if (!slugPattern.test(slug ?? '')) throw Error('Slug inválido');
  if (!['confirmed', 'upcoming'].includes(doc.state)) throw Error(`Estado inválido: ${slug}`);
  if (!Array.isArray(doc.levels) || !doc.levels.length || new Set(doc.levels).size !== doc.levels.length || doc.levels.some(v => !Number.isInteger(v) || v < 1 || v > 4)) throw Error(`Niveles inválidos: ${slug}`);
  if (doc.availability != null && !['available', 'last_places', 'full', 'enquiry'].includes(doc.availability)) throw Error(`Disponibilidad inválida: ${slug}`);
  const name = tripName(text(doc.name, 'name', true));
  const keys = new Set();
  const departures = list(doc.departures, 'departures').map(d => {
    if (!/^[A-Za-z0-9_-]+$/.test(d._key ?? '') || keys.has(d._key)) throw Error(`Clave de salida inválida: ${slug}`);
    keys.add(d._key);
    if (d.levels?.length || d.levelRequirement || d.programme) throw Error(`Separa el nivel y el programa en otro viaje: ${slug}/${d._key}`);
    const departure = {id: d._key, date: dates(d), start: d.start, end: d.end, duration: text(d.duration, 'duration') || 'Por confirmar',
      price: positive(d.price, 'price'), state: doc.state,
      ...(d.dossier ? {dossier: httpsUrl(d.dossier, 'departure.dossier')} : {}),
      ...(d.availability != null ? {availability: validateAvailability(d.availability, slug)} : {}),
      ...(d.capacity ? {capacity: validateCapacity(d.capacity, slug)} : {}),
      ...(d.brevoValue != null ? {brevoValue: validateBrevoValue(d.brevoValue)} : {}),
      ...(d.message ? {message: text(d.message, 'message')} : {}),
      ...(d.payment ? {payment: {depositAmount: positive(d.payment.depositAmount ?? doc.payment?.depositAmount, 'departure.payment.depositAmount'), terms: text(d.payment.terms, 'departure.payment.terms') || text(doc.payment?.terms, 'payment.terms')}} : {}),
      ...(d.promotions != null ? {promotions: validatePromotions(d.promotions, d.price, d.capacity?.total ?? doc.capacity?.total)} : {})};
    return {...departure, ...departurePricing(departure, {state: doc.state, availability: doc.availability ?? (doc.capacity?.available === 0 ? 'full' : undefined), capacity: doc.capacity})};
  });
  if (doc.state === 'confirmed' && !departures.length) throw Error(`Faltan fechas: ${slug}`);
  const capacity = {total: doc.capacity?.total ?? null, available: doc.capacity?.available ?? null};
  for (const key of ['total', 'available']) if (capacity[key] != null && (!Number.isInteger(capacity[key]) || capacity[key] < (key === 'total' ? 1 : 0))) throw Error(`Capacidad inválida: ${slug}`);
  if (capacity.available != null && capacity.total != null && capacity.available > capacity.total) throw Error(`Disponibilidad superior a capacidad: ${slug}`);
  const depositAmount = positive(doc.payment?.depositAmount, 'depositAmount');
  const result = {id: slug, slug, name, place: text(doc.place, 'place'), state: doc.state,
    availability: doc.availability ?? (doc.capacity?.available === 0 ? 'full' : doc.capacity?.available > 0 ? 'available' : 'enquiry'),
    levels: doc.levels, levelRequirement: text(doc.levelRequirement, 'levelRequirement'), departures,
    hero: image(doc.hero, 'hero'), heroAlt: text(doc.hero?.alt, 'hero.alt'), heroPosition: '50% 50%',
    tagline: !doc.tagline || doc.tagline === doc.name ? name : text(doc.tagline, 'tagline'), intro: text(doc.intro, 'intro'),
    notice: text(doc.notice, 'notice') || 'Consulta la disponibilidad con el equipo.',
    priceNote: text(doc.priceNote, 'priceNote'),
    storyTitle: text(doc.storyTitle, 'storyTitle') || 'El programa.', storyLabel: text(doc.storyLabel, 'storyLabel') || 'EL VIAJE',
    storyIntro: text(doc.storyIntro, 'storyIntro'), story: pairs(doc.story, 'title', 'text', 'story'),
    gallery: list(doc.gallery, 'gallery').map(v => [image(v, 'gallery'), text(v.alt, 'gallery.alt', true), text(v.caption, 'caption')]),
    levelText: text(doc.levelText, 'levelText') || text(doc.levelRequirement, 'levelRequirement'),
    levelChecks: strings(doc.levelChecks, 'levelChecks'), includes: strings(doc.includes, 'includes'), excludes: strings(doc.excludes, 'excludes'),
    inclusionsNote: text(doc.inclusionsNote, 'inclusionsNote'), faqs: pairs(doc.faqs, 'question', 'answer', 'faqs'),
    dossier: httpsUrl(doc.dossier, 'dossier'),
    payment: {depositAmount, terms: text(doc.payment?.terms, 'payment.terms')}, capacity,
    message: `¡Hola, LST! Me interesa ${name}. ¿Podemos consultar las próximas salidas?`, cms: true,
  };
  if (departures.some(d => d.availability != null)) {
    for (const d of departures) d.availability ??= result.availability;
    result.availability = aggregateAvailability(departures);
  }
  for (const key of ['destinationDescription', 'spotsNote']) if (doc[key] != null) result[key] = text(doc[key], key);
  if (doc.destinationFacts != null) result.destinationFacts = strings(doc.destinationFacts, 'destinationFacts');
  for (const key of ['activities', 'spots']) if (doc[key] != null) result[key] = list(doc[key], key).map(item => ({
    title: text(item.title, key + '.title', true), text: text(item.text, key + '.text', true),
    image: image(item.image, key + '.image'), alt: text(item.image?.alt, key + '.alt'),
  }));
  if (doc.surfPlan != null) result.surfPlan = pairs(doc.surfPlan, 'title', 'text', 'surfPlan');
  if (doc.audience) result.audience = {text: text(doc.audience.text, 'audience.text'), objective: text(doc.audience.objective, 'audience.objective'), profiles: pairs(doc.audience.profiles, 'title', 'text', 'audience.profiles')};
  if (doc.stay) result.stay = {title: text(doc.stay.title, 'stay.title'), name: text(doc.stay.name, 'stay.name'), text: text(doc.stay.text, 'stay.text'), note: text(doc.stay.note, 'stay.note'), image: image(doc.stay.image, 'stay.image'), alt: text(doc.stay.image?.alt, 'stay.alt')};
  if (doc.stay?.gallery != null) result.stay.gallery = list(doc.stay.gallery, 'stay.gallery').map(v => [image(v, 'stay.gallery'), text(v.alt, 'stay.gallery.alt', true), text(v.caption, 'stay.gallery.caption')]);
  if (doc.stay?.galleryNote != null) result.stay.galleryNote = text(doc.stay.galleryNote, 'stay.galleryNote');
  if (doc.cardImage) { result.cardImage = image(doc.cardImage, 'cardImage'); result.cardImageAlt = text(doc.cardImage.alt, 'cardImage.alt', true); }
  if (doc.testimonial) result.testimonial = {context: text(doc.testimonial.context, 'testimonial.context'), quote: text(doc.testimonial.quote, 'testimonial.quote', true), author: text(doc.testimonial.author, 'testimonial.author', true), trip: text(doc.testimonial.trip, 'testimonial.trip')};
  if (doc.team) result.team = {title: text(doc.team.title, 'team.title'), text: text(doc.team.text, 'team.text')};
  return result;
}

export function adaptTrips(documents) {
  const trips = documents.map(doc => {
    if (!doc.editorialSource) return adaptTrip(doc);
    const id = doc.editorialSource._ref;
    const source = documents.find(candidate => candidate._id === id);
    if (!source || source._type !== 'trip' || source === doc || source.editorialSource || /^(drafts|versions)\./.test(id ?? '')) throw Error('Referencia de contenido inválida: ' + doc._id);
    const shared = Object.fromEntries(sharedTripContentFields.map(field => [field, source[field]]));
    return adaptTrip({...doc, ...shared});
  });
  if (new Set(trips.map(t => t.slug)).size !== trips.length) throw Error('Slugs duplicados en Sanity');
  const consolidated = consolidateTrips(trips);
  validateRegistrationMappings(consolidated);
  return consolidated;
}
