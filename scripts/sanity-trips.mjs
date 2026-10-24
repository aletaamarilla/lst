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
function dates(d) {
  if (!validDate(d.start) || !validDate(d.end) || d.end < d.start) throw Error('Fechas de salida inválidas');
  const fmt = new Intl.DateTimeFormat('es-ES', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  return `${fmt.format(new Date(d.start))} — ${fmt.format(new Date(d.end))}`;
}

export function adaptTrip(doc) {
  if (doc._type !== 'trip' || !doc._id || /^(drafts|versions)\./.test(doc._id)) throw Error('Documento no publicado');
  const slug = doc.slug?.current;
  if (!slugPattern.test(slug ?? '')) throw Error('Slug inválido');
  if (!['confirmed', 'upcoming'].includes(doc.state)) throw Error(`Estado inválido: ${slug}`);
  if (!Array.isArray(doc.levels) || !doc.levels.length || new Set(doc.levels).size !== doc.levels.length || doc.levels.some(v => !Number.isInteger(v) || v < 1 || v > 4)) throw Error(`Niveles inválidos: ${slug}`);
  if (doc.availability != null && !['available', 'last_places', 'full', 'enquiry'].includes(doc.availability)) throw Error(`Disponibilidad inválida: ${slug}`);
  const keys = new Set();
  const departures = list(doc.departures, 'departures').map(d => {
    if (!/^[A-Za-z0-9_-]+$/.test(d._key ?? '') || keys.has(d._key)) throw Error(`Clave de salida inválida: ${slug}`);
    keys.add(d._key);
    return {id: d._key, date: dates(d), start: d.start, end: d.end, duration: text(d.duration, 'duration') || 'Por confirmar',
      price: positive(d.price, 'price'), state: doc.state, ...(d.message ? {message: text(d.message, 'message')} : {})};
  });
  if (doc.state === 'confirmed' && !departures.length) throw Error(`Faltan fechas: ${slug}`);
  const capacity = {total: doc.capacity?.total ?? null, available: doc.capacity?.available ?? null};
  for (const key of ['total', 'available']) if (capacity[key] != null && (!Number.isInteger(capacity[key]) || capacity[key] < (key === 'total' ? 1 : 0))) throw Error(`Capacidad inválida: ${slug}`);
  if (capacity.available != null && capacity.total != null && capacity.available > capacity.total) throw Error(`Disponibilidad superior a capacidad: ${slug}`);
  const depositAmount = positive(doc.payment?.depositAmount, 'depositAmount');
  const applicationUrl = httpsUrl(doc.booking?.applicationUrl, 'applicationUrl');
  const result = {id: slug, slug, name: text(doc.name, 'name', true), place: text(doc.place, 'place'), state: doc.state,
    availability: doc.availability ?? (doc.capacity?.available === 0 ? 'full' : doc.capacity?.available > 0 ? 'available' : 'enquiry'),
    levels: doc.levels, levelRequirement: text(doc.levelRequirement, 'levelRequirement'), departures,
    hero: image(doc.hero, 'hero'), heroAlt: text(doc.hero?.alt, 'hero.alt'), heroPosition: '50% 50%',
    tagline: text(doc.tagline, 'tagline') || doc.name, intro: text(doc.intro, 'intro'),
    notice: text(doc.notice, 'notice') || 'Consulta la disponibilidad con el equipo.',
    priceNote: text(doc.priceNote, 'priceNote'),
    storyTitle: text(doc.storyTitle, 'storyTitle') || 'El programa.', storyLabel: text(doc.storyLabel, 'storyLabel') || 'EL VIAJE',
    storyIntro: text(doc.storyIntro, 'storyIntro'), story: pairs(doc.story, 'title', 'text', 'story'),
    gallery: list(doc.gallery, 'gallery').map(v => [image(v, 'gallery'), text(v.alt, 'gallery.alt', true), text(v.caption, 'caption')]),
    levelTitle: text(doc.levelTitle, 'levelTitle') || 'Tu nivel de surf.', levelText: text(doc.levelText, 'levelText') || text(doc.levelRequirement, 'levelRequirement'),
    levelChecks: strings(doc.levelChecks, 'levelChecks'), includes: strings(doc.includes, 'includes'), excludes: strings(doc.excludes, 'excludes'),
    inclusionsNote: text(doc.inclusionsNote, 'inclusionsNote'), faqs: pairs(doc.faqs, 'question', 'answer', 'faqs'),
    dossier: httpsUrl(doc.dossier, 'dossier'), booking: {applicationUrl},
    payment: {depositAmount, terms: text(doc.payment?.terms, 'payment.terms')}, capacity,
    message: `¡Hola, LST! Me interesa ${doc.name}. ¿Podemos consultar las próximas salidas?`, cms: true,
  };
  if (doc.stay) result.stay = {title: text(doc.stay.title, 'stay.title'), name: text(doc.stay.name, 'stay.name'), text: text(doc.stay.text, 'stay.text'), note: text(doc.stay.note, 'stay.note'), image: image(doc.stay.image, 'stay.image'), alt: text(doc.stay.image?.alt, 'stay.alt')};
  if (doc.team) result.team = {title: text(doc.team.title, 'team.title'), text: text(doc.team.text, 'team.text')};
  return result;
}

export function adaptTrips(documents) {
  const trips = documents.map(adaptTrip);
  if (new Set(trips.map(t => t.slug)).size !== trips.length) throw Error('Slugs duplicados en Sanity');
  return trips;
}

export const assetUrl = value => /^https:\/\//.test(value ?? '') ? value : `/assets/${value}`;
