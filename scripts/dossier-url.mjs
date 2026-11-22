// Rules for the PDF link of a trip. Shared by Studio (exact host, at publish time) and the build
// (only refuses links back to Sanity, so a typo in a host never stops the whole site from rebuilding).
export const DOSSIER_HOST = 'descargas.letsurftogether.com';

const parse = value => { try { return new URL(value); } catch { return null; } };

// '' when the value is empty or valid; otherwise a message for the editor.
export function dossierProblem(value) {
  if (value == null || String(value).trim() === '') return '';
  const url = parse(String(value));
  if (!url) return 'La URL no es válida.';
  if (url.protocol !== 'https:' || url.hostname !== DOSSIER_HOST || !/\.pdf$/i.test(url.pathname))
    return `Pega la URL de un PDF subido al bucket de Cloudflare, con la forma https://${DOSSIER_HOST}/nombre.pdf`;
  return '';
}

export function isSanityFileUrl(value) {
  const url = parse(value);
  return !!url && url.hostname === 'cdn.sanity.io' && url.pathname.startsWith('/files/');
}

// Browsers fetch the PDFs through the site's own domain: vercel.json rewrites /descargas/* to DOSSIER_HOST.
// Spanish ISPs block the Cloudflare IPs behind DOSSIER_HOST during football matches; the site's host is not blocked.
export const DOSSIER_PATH = '/descargas';

// The stored URL (what Studio validates and the build checks) -> the link the page renders.
// Anything not on DOSSIER_HOST is returned untouched.
export function dossierHref(value) {
  if (value == null || value === '') return '';
  const url = parse(String(value));
  return url && url.protocol === 'https:' && url.hostname === DOSSIER_HOST ? DOSSIER_PATH + url.pathname + url.search : value;
}
