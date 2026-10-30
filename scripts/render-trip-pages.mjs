// Re-render presentation only, using the existing public snapshot when CMS is offline.
// This never reads the private local-preview snapshot or changes catalogue data.
import {readFile, writeFile} from 'node:fs/promises';
import {renderTrip} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';

const snapshot = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8'));
if (snapshot.source !== 'sanity-published' || !Array.isArray(snapshot.trips)) {
  throw Error('Se requiere el snapshot público de Sanity, sin datos de previsualización.');
}
const pages = [];
const routes = new Set();
for (const trip of snapshot.trips) {
  for (const slug of [trip.slug, ...(trip.aliases ?? [])]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || routes.has(slug)) throw Error('Ruta de viaje no válida o duplicada.');
    routes.add(slug);
    pages.push([`dist/viajes/${slug}/index.html`, renderTrip(trip, snapshot.trips)]);
    pages.push([`dist/inscripciones/${slug}/index.html`, renderRegistration(trip, slug)]);
  }
}
// All target files must exist; this operation updates presentation, not route inventory.
await Promise.all(pages.map(([file]) => readFile(file)));
for (const [file, html] of pages) await writeFile(file, html);
console.log(`Presentación regenerada: ${pages.length} páginas desde sanity-published. Catálogo y CMS intactos.`);
