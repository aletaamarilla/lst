// Public origin and indexing are decided per deployment, never per page by hand.
// Defaults describe the test deployment: its own URL and no indexing.
const TEST_ORIGIN = 'https://lst-sepia.vercel.app';

export function siteConfig(env = process.env) {
  const raw = env.SITE_URL?.trim() || TEST_ORIGIN;
  let url;
  try { url = new URL(raw); } catch { throw Error('SITE_URL debe ser una URL completa, por ejemplo https://www.ejemplo.com'); }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) throw Error('SITE_URL debe ser https y no llevar ruta ni parámetros.');
  const indexable = env.SITE_INDEXABLE === '1';
  // Never invite search engines to a deployment URL instead of the client's domain.
  if (indexable && (!env.SITE_URL?.trim() || url.hostname.endsWith('.vercel.app'))) throw Error('SITE_INDEXABLE=1 exige SITE_URL con el dominio definitivo.');
  return Object.freeze({origin: url.origin, indexable});
}

// Route is the public path of the page, e.g. "/viajes/marruecos/".
export function pageMeta(route, trips, site) {
  const self = {canonical: route, index: site.indexable};
  if (route.startsWith('/inscripciones/')) return {canonical: null, index: false};
  const slug = /^\/viajes\/([^/]+)\/$/.exec(route)?.[1];
  if (!slug) return self;
  if (trips.some(trip => trip.slug === slug)) return self;
  // Dated legacy URLs show the same trip: point search engines at the main page.
  const owner = trips.find(trip => (trip.aliases ?? []).includes(slug));
  if (owner) return {canonical: `/viajes/${owner.slug}/`, index: site.indexable};
  return {canonical: null, index: false}; // Unpublished trip notice.
}

const robotsTag = /<meta name="robots" content="[^"]*">/;
const canonicalTag = /<link rel="canonical" href="[^"]*">/g;
const ogUrlTag = /<meta property="og:url" content="[^"]*">/;
const iconTags = /<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>/g;

// One icon set for every page: square tile for tabs (ico + svg), home screens and Android.
export const ICON_LINKS = '<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">';

// Idempotent: the versioned output is also the template of the next build.
export function applySiteMeta(html, meta, site) {
  if (!robotsTag.test(html)) throw Error('Falta la etiqueta robots en una página.');
  const canonical = meta.canonical ? `<link rel="canonical" href="${site.origin}${meta.canonical}">` : '';
  let result = html.replace(canonicalTag, '').replace(iconTags, '').replace(robotsTag, `<meta name="robots" content="${meta.index ? 'index,follow' : 'noindex,nofollow'}">${canonical}${ICON_LINKS}`);
  if (meta.canonical) result = result.replace(ogUrlTag, `<meta property="og:url" content="${site.origin}${meta.canonical}">`);
  return result;
}

export function robotsTxt(site) {
  return site.indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
}

// Only pages that are indexable and are their own canonical URL.
export function sitemapXml(routes, trips, site) {
  const listed = site.indexable ? routes.filter(route => { const meta = pageMeta(route, trips, site); return meta.index && meta.canonical === route; }).sort() : [];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map(route => `  <url><loc>${site.origin}${route}</loc></url>\n`).join('')}</urlset>\n`;
}

export const routeOf = relativeFile => `/${relativeFile.split(/[\\/]/).slice(0, -1).map(part => `${part}/`).join('')}`;
