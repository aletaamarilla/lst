// Node only. Never import this module from dist/ or from Studio.
export const SANITY = Object.freeze({projectId: 'q5bj2rn2', dataset: 'production', apiVersion: '2025-02-19'});
const endpoint = `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data`;

async function request(url, {token, fetchImpl = fetch, ...options} = {}) {
  let response;
  try {
    response = await fetchImpl(url, {...options, redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: {...(options.body ? {'Content-Type': 'application/json'} : {}), ...(token ? {Authorization: `Bearer ${token}`} : {})}});
  } catch { throw Error('No se pudo conectar con Sanity. No se ha sustituido el catálogo.'); }
  // Do not log response bodies, request URLs or credentials.
  if (!response.ok) throw Error(`Sanity HTTP ${response.status}. Revisa acceso y credencial privada de lectura/importación.`);
  try { return await response.json(); } catch { throw Error('Sanity devolvió una respuesta JSON inválida.'); }
}

export async function querySanity(query, {perspective = 'published', params = {}, ...options} = {}) {
  const url = new URL(`${endpoint}/query/${SANITY.dataset}`);
  url.searchParams.set('perspective', perspective);
  url.searchParams.set('query', query);
  url.searchParams.set('returnQuery', 'false');
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
  const data = await request(url, options);
  if (!Array.isArray(data.result)) throw Error('Respuesta de catálogo Sanity inválida.');
  return data.result;
}

export function readPublishedTrips({env = process.env, ...options} = {}) {
  return querySanity(`*[_type == "trip" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_createdAt asc, _id asc) {
    ..., "dossier": coalesce(dossierFile.asset->url, dossier), "hero": hero{..., "url": asset->url},
    "gallery": gallery[]{..., "url": asset->url},
    "stay": stay{..., "image": image{..., "url": asset->url}}
  }`, {...options, token: env.SANITY_READ_TOKEN, perspective: 'published'});
}

export function readImportInventory({env = process.env, ...options} = {}) {
  // Raw is restricted to the importer: drafts/releases must participate in collision detection.
  return querySanity('*[]{_id, _type, slug}',
    {...options, token: env.SANITY_IMPORT_TOKEN, perspective: 'raw'});
}

export async function createDrafts(documents, {env = process.env, ...options} = {}) {
  if (!env.SANITY_IMPORT_TOKEN) throw Error('Falta SANITY_IMPORT_TOKEN privado.');
  if (env.SANITY_IMPORT_TOKEN === env.SANITY_READ_TOKEN) throw Error('Usa credenciales distintas para lectura e importación.');
  if (documents.some(d => !d._id?.startsWith('drafts.lst-'))) throw Error('La importación solo admite sus borradores estables.');
  // create is deliberately fail-if-present; the entire transaction rolls back on ID races.
  // Never patch/replace/delete: reruns and unknown outcomes are resolved by a fresh preflight.
  return request(`${endpoint}/mutate/${SANITY.dataset}?visibility=sync&returnDocuments=false`, {
    ...options, token: env.SANITY_IMPORT_TOKEN, method: 'POST',
    body: JSON.stringify({mutations: documents.map(document => ({create: document}))}),
  });
}
