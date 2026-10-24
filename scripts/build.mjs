import {readFile, writeFile, mkdir, cp, rm, rename, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPublishedTrips} from './sanity.mjs';
import {adaptTrips} from './sanity-trips.mjs';
import {renderTrip} from './render-trips.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {renderHomeTrips} from './render-home-trips.mjs';

export const legacySlugs = ['el-salvador', 'asturias', 'azores', 'euskadi', 'marruecos', 'cadiz'];
export function unavailablePage() {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#FFFAE7"><title>Viaje no disponible · Let’s Surf Together</title><meta name="description" content="Consulta las próximas salidas de Let’s Surf Together."><link rel="icon" href="/assets/brand/symbol-orange.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/aura.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/trip.css"></head><body class="trip-page"><a class="skip-link" href="#contenido">Saltar al contenido</a><header class="trip-header"><a class="brand" href="/" aria-label="Let’s Surf Together, inicio"><img src="/assets/brand/logo-black.svg" alt="Let’s Surf Together" width="774" height="126"></a><nav class="trip-header-nav" aria-label="Navegación principal"><a class="trip-back" href="/viajes/">Viajes</a><a class="trip-header-levels" href="/niveles/">Niveles</a></nav></header><main id="contenido" class="trip-shell section-space"><section class="trip-summary"><p class="eyebrow">VIAJES DE SURF</p><h1>Este viaje no está publicado.</h1><p>Consulta las próximas salidas con el equipo.</p><p><a class="text-link" href="/viajes/">Ver todos los viajes</a></p><a class="button" data-whatsapp="general" href="https://wa.me/34648189257?text=Hola%20LST%2C%20quiero%20consultar%20las%20pr%C3%B3ximas%20salidas." target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></section></main><footer class="trip-footer trip-shell"><a href="/">Let’s Surf Together</a><a href="/conocenos/">Conócenos</a><a href="/preguntas-frecuentes/">FAQs</a></footer></body></html>`;
}

export async function buildSite({out = 'dist', demo = false, read = readPublishedTrips, template = 'dist'} = {}) {
  const target = path.resolve(out);
  if (demo && target === path.resolve('dist')) throw Error('La demo requiere --out fuera de dist.');
  // Fetch once and validate everything before touching the existing output.
  const trips = demo ? JSON.parse(await readFile('data/trips.json', 'utf8')) : adaptTrips(await read());
  const parent = path.dirname(target);
  await mkdir(parent, {recursive: true});
  const lock = `${target}.build-lock`;
  await mkdir(lock); // Do not allow concurrent writers to the same output.
  const stage = `${target}.stage-${process.pid}`;
  const backup = `${target}.backup-${process.pid}`;
  let moved = false;
  try {
    await cp(template, stage, {recursive: true});
    // Keep every existing route reachable, but remove stale/unpublished commercial content.
    const previous = (await readdir(path.join(stage, 'viajes'), {withFileTypes: true})).filter(e => e.isDirectory()).map(e => e.name);
    for (const slug of new Set([...legacySlugs, ...previous])) {
      const dir = path.join(stage, 'viajes', slug);
      await rm(dir, {recursive: true, force: true});
      await mkdir(dir, {recursive: true});
      await writeFile(path.join(dir, 'index.html'), unavailablePage());
    }
    for (const trip of trips) {
      const dir = path.join(stage, 'viajes', trip.slug);
      await mkdir(dir, {recursive: true});
      await writeFile(path.join(dir, 'index.html'), renderTrip(trip, trips));
    }
    for (const [file, render] of [['index.html', renderHomeTrips], ['viajes/index.html', renderCatalog], ['niveles/index.html', renderLevelTrips]]) {
      const output = path.join(stage, file);
      await writeFile(output, render(await readFile(output, 'utf8'), trips));
    }
    // Only the whitelisted public model; never tokens, raw CMS documents or import evidence.
    await writeFile(path.join(stage, 'catalog-snapshot.json'), JSON.stringify({source: demo ? 'demo' : 'sanity-published', trips}, null, 2) + '\n');
    try { await rename(target, backup); moved = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    try { await rename(stage, target); } catch (error) { if (moved) { await rename(backup, target); moved = false; } throw error; }
    if (moved) await rm(backup, {recursive: true, force: true});
    return {source: demo ? 'demo' : 'sanity-published', count: trips.length, out: target};
  } finally {
    await rm(stage, {recursive: true, force: true});
    await rm(lock, {recursive: true, force: true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(a => a !== '--demo' && !a.startsWith('--out='))) throw Error('Uso: build.mjs [--demo --out=/ruta/local]');
  try { console.log(JSON.stringify(await buildSite({demo: args.includes('--demo'), out: args.find(a => a.startsWith('--out='))?.slice(6) ?? 'dist'}))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
