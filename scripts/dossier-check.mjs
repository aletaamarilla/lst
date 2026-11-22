// Asks the PDF host whether each dossier a trip links to is really there, so a mistyped file name
// never ships as a "Descargar dossier" button that answers 404. Only a clear 404/410 stops the build:
// a network error, a server error or a non-PDF answer only warns, so an outage of the PDF host
// never blocks publishing prices or dates.
const urlsOf = trips => [...new Set(trips.flatMap(trip => [trip.dossier, ...(trip.departures ?? []).map(d => d.dossier)]).filter(Boolean))];

export async function missingDossiers(trips, {fetchImpl = fetch, timeoutMs = 10000} = {}) {
  const urls = urlsOf(trips);
  const outcomes = await Promise.all(urls.map(async url => {
    try {
      const response = await fetchImpl(url, {method: 'HEAD', signal: AbortSignal.timeout(timeoutMs)});
      if (response.status === 404 || response.status === 410) return 'missing';
      return response.ok && /pdf/i.test(response.headers.get('content-type') ?? '') ? 'ok' : 'unverified';
    } catch { return 'unverified'; }
  }));
  return {missing: urls.filter((_, i) => outcomes[i] === 'missing'), unverified: urls.filter((_, i) => outcomes[i] === 'unverified')};
}

export async function assertDossiersReachable(trips, {warn = console.warn, ...options} = {}) {
  const {missing, unverified} = await missingDossiers(trips, options);
  for (const url of unverified) warn(`No se pudo comprobar el PDF (se publica igualmente): ${url}`);
  if (missing.length) throw Error(`PDF no encontrado en R2 (404): ${missing.join(', ')}. Sube el archivo al bucket con ese nombre exacto, o corrige la URL del dossier, y vuelve a publicar.`);
}
