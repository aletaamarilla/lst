import {siteConfig} from './site-meta.mjs';

// GA4 shared with the travelhood-admin panel. The panel reads GA4; this site only emits.
// The measurement ID is decided per deployment: without it, nothing is measured (previews).
// The public domain goes with it: visits anywhere else are reported as developer traffic.
export function analyticsConfig(env = process.env, site = siteConfig(env)) {
  const id = env.GA4_MEASUREMENT_ID?.trim();
  if (!id) return null;
  if (!/^G-[A-Z0-9]{4,16}$/.test(id)) throw Error('GA4_MEASUREMENT_ID debe ser un ID de medición de GA4, por ejemplo G-ABC123XYZ.');
  return Object.freeze({id, host: new URL(site.origin).hostname});
}

const STATIC_TYPES = {'/': 'home', '/viajes/': 'catalog', '/niveles/': 'levels', '/conocenos/': 'about', '/preguntas-frecuentes/': 'faq'};

// Controlled values only: page type and the published trip that owns the route (never a departure).
export function analyticsPage(route, trips) {
  const match = /^\/(viajes|inscripciones)\/([^/]+)\/$/.exec(route);
  if (match) {
    const owner = trips.find(trip => trip.slug === match[2] || (trip.aliases ?? []).includes(match[2]));
    if (!owner) return {page_type: 'trip_unavailable'};
    return {page_type: match[1] === 'viajes' ? 'trip' : 'registration', destination_slug: owner.slug};
  }
  return {page_type: STATIC_TYPES[route] ?? 'legal'};
}

const block = /<!--lst-analytics-->[\s\S]*?<!--\/lst-analytics-->/g;

// Idempotent: the versioned output is also the template of the next build.
export function applyAnalytics(html, page, config) {
  const clean = html.replace(block, '');
  if (!config) return clean;
  if (!clean.includes('</head>')) throw Error('Falta </head> en una página.');
  const data = JSON.stringify({id: config.id, host: config.host, page}).replaceAll('<', '\\u003c');
  return clean.replace('</head>', `<!--lst-analytics--><script>window.lstAnalytics=${data}</script><script defer src="/analytics.js"></script><!--/lst-analytics--></head>`);
}
