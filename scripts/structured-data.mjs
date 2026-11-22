// Social preview tags and schema.org JSON-LD for every public page.
// Both are written between markers so the versioned output can be rebuilt idempotently.
import {departuresFor} from './trip-model.mjs';

export const organization = Object.freeze({
  name: 'Let’s Surf Together',
  alternateName: 'LST',
  email: 'info@letsurftogether.com',
  telephone: '+34648189257',
  locality: 'Bilbao',
  country: 'ES',
  sameAs: ['https://www.instagram.com/letsurftogether/'],
  description: 'Let’s Surf Together (LST) organiza viajes de surf en grupo por niveles, de iniciación a avanzado, con clases, coaching, videoanálisis y convivencia. Con base en Bilbao, en marcha desde finales de 2024.',
  // From Conócenos: Lucas started LST, which launched at the end of 2024.
  founder: 'Lucas',
  foundingDate: '2024',
});

const DEFAULT_IMAGE = '/assets/og-default.jpg';
// Pages whose preview should be their own hero photo, cropped to 1200×630.
const PAGE_IMAGES = {'/': '/assets/og-home.jpg'};
const sections = {
  '/viajes/': 'Viajes', '/niveles/': 'Niveles', '/conocenos/': 'Conócenos', '/preguntas-frecuentes/': 'Preguntas frecuentes',
  '/aviso-legal/': 'Aviso legal', '/condiciones/': 'Condiciones', '/privacidad/': 'Privacidad', '/cookies/': 'Cookies',
};
const availability = {available: 'InStock', last_places: 'LimitedAvailability', full: 'SoldOut', enquiry: 'InStock'};

const decode = value => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ');
const escapeAttr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = html => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const absolute = (url, site) => /^https?:\/\//.test(url) ? url : `${site.origin}${url}`;
const title = html => plain(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? '');
const description = html => decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '');

// FAQs are written as <details><summary>Question<span>+</span></summary>Answer</details>.
export function faqsFrom(html) {
  return [...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map(([, q, a]) => [plain(q.replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, '')), plain(a)])
    .filter(([q, a]) => q.endsWith('?') && a);
}

function organizationNode(site) {
  return {'@type': 'Organization', '@id': `${site.origin}/#organization`, name: organization.name, alternateName: organization.alternateName,
    url: `${site.origin}/`, logo: `${site.origin}/assets/brand/logo-black.svg`, image: `${site.origin}${DEFAULT_IMAGE}`,
    description: organization.description, foundingDate: organization.foundingDate, founder: {'@type': 'Person', name: organization.founder},
    email: organization.email, telephone: organization.telephone,
    address: {'@type': 'PostalAddress', addressLocality: organization.locality, addressCountry: organization.country},
    sameAs: organization.sameAs,
    contactPoint: {'@type': 'ContactPoint', contactType: 'customer service', telephone: organization.telephone, email: organization.email, availableLanguage: ['es']}};
}

function breadcrumb(route, name, site) {
  const items = [{name: 'Inicio', path: '/'}];
  if (route.startsWith('/viajes/') && route !== '/viajes/') items.push({name: 'Viajes', path: '/viajes/'});
  items.push({name, path: route});
  return {'@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({'@type': 'ListItem', position: i + 1, name: item.name, item: `${site.origin}${item.path}`}))};
}

function tripNode(trip, route, html, site) {
  const departures = trip.state === 'confirmed' ? departuresFor(trip) : [];
  const levels = [...trip.levels].sort();
  return {'@type': 'TouristTrip', '@id': `${site.origin}${route}#viaje`, name: `Viaje de surf a ${trip.name}`, url: `${site.origin}${route}`,
    description: plain(trip.destinationDescription || trip.intro || '') || description(html),
    ...(trip.hero ? {image: trip.hero} : {}),
    touristType: `Surfistas de nivel ${levels.length > 1 ? `${levels[0]} a ${levels.at(-1)}` : levels[0]} (escala LST de 1 a 4)`,
    ...(trip.place ? {itinerary: {'@type': 'Place', name: `${trip.place}`}} : {}),
    provider: {'@id': `${site.origin}/#organization`},
    ...(departures.length ? {offers: departures.filter(d => Number.isFinite(d.price)).map(d => ({'@type': 'Offer',
      name: `${trip.name} · ${d.date}`, price: d.price, priceCurrency: 'EUR', url: `${site.origin}${route}`,
      availability: `https://schema.org/${availability[d.availability ?? trip.availability] ?? 'InStock'}`,
      ...(d.earlyBird ? {priceValidUntil: d.earlyBird.until} : {}),
      ...(d.start ? {validThrough: d.start} : {})}))} : {}),
    ...(departures.length ? {subTrip: departures.map(d => ({'@type': 'Trip', name: `${trip.name} · ${d.date}`, departureTime: d.start, arrivalTime: d.end}))} : {})};
}

export function structuredData(route, html, trips, site) {
  const graph = [organizationNode(site)];
  if (route === '/') graph.push({'@type': 'WebSite', '@id': `${site.origin}/#website`, name: organization.name, url: `${site.origin}/`, inLanguage: 'es-ES', publisher: {'@id': `${site.origin}/#organization`}});
  const slug = /^\/viajes\/([^/]+)\/$/.exec(route)?.[1];
  const trip = slug && trips.find(t => t.slug === slug);
  if (trip) graph.push(tripNode(trip, route, html, site), breadcrumb(route, trip.name, site));
  else if (sections[route]) graph.push(breadcrumb(route, sections[route], site));
  // Trip pages also use <details> for other blocks: take their FAQs from Sanity.
  const faqs = trip ? (trip.faqs ?? []).map(([q, a]) => [plain(q), plain(a)]).filter(([q, a]) => q && a) : faqsFrom(html);
  if (faqs.length) graph.push({'@type': 'FAQPage', '@id': `${site.origin}${route}#faq`, url: `${site.origin}${route}`,
    mainEntity: faqs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
  return {'@context': 'https://schema.org', '@graph': graph};
}

// Pages that only lack social tags get them from <title>, the description and a default photo.
export function socialTags(html, route, site) {
  const has = property => new RegExp(`<meta property="${property}"`).test(html);
  const tags = [];
  if (!has('og:title')) tags.push(['og:title', title(html)]);
  if (!has('og:description') && description(html)) tags.push(['og:description', description(html)]);
  if (!has('og:image')) tags.push(['og:image', absolute(PAGE_IMAGES[route] ?? DEFAULT_IMAGE, site)], ['og:image:width', '1200'], ['og:image:height', '630']);
  if (!has('og:url')) tags.push(['og:url', `${site.origin}${route}`]);
  if (!has('og:type')) tags.push(['og:type', 'website']);
  if (!has('og:site_name')) tags.push(['og:site_name', organization.name]);
  if (!has('og:locale')) tags.push(['og:locale', 'es_ES']);
  const meta = tags.map(([p, c]) => `<meta property="${p}" content="${escapeAttr(c)}">`).join('');
  return `${meta}${/<meta name="twitter:card"/.test(html) ? '' : '<meta name="twitter:card" content="summary_large_image">'}`;
}

const region = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
export function applyStructuredData(html, route, trips, site, {public: isPublic}) {
  const clean = html.replace(region, '');
  if (!isPublic) return clean;
  const json = JSON.stringify(structuredData(route, clean, trips, site)).replace(/</g, '\\u003c');
  const block = `<!-- seo:start -->${socialTags(clean, route, site)}<script type="application/ld+json">${json}</script><!-- seo:end -->`;
  if (!clean.includes('</head>')) throw Error(`Falta </head> en ${route}`);
  return clean.replace('</head>', `${block}</head>`);
}
