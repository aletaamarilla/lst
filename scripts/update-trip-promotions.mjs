import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {querySanity, SANITY} from './sanity.mjs';
import {validatePromotions, promotionCondition} from './trip-pricing.mjs';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const price = n => `${new Intl.NumberFormat('es-ES', {useGrouping: 'always'}).format(n)} €`;
const sourceShape = list => list.map(({label, price, firstPlace = null, lastPlace = null, condition = ''}) => ({label, price, firstPlace, lastPlace, condition}));

export function planPromotionUpdate(documents, inventory) {
  if (inventory.sanityTarget?.projectId !== SANITY.projectId || inventory.sanityTarget?.dataset !== SANITY.dataset) throw Error('Inventario de otro proyecto o dataset');
  const sources = new Map(inventory.departures.map(d => [d.id, d]));
  const seen = new Set();
  const patches = [];
  for (const doc of documents.filter(d => !/^(drafts|versions)\./.test(d._id))) {
    const set = {};
    const conditions = [];
    for (const departure of doc.departures ?? []) {
      const source = sources.get(departure._key);
      if (!source) continue;
      if (seen.has(source.id)) throw Error('Salida duplicada en Sanity: ' + source.id);
      seen.add(source.id);
      if (source.dates.start !== departure.start || source.dates.end !== departure.end) throw Error('Fechas distintas del PDF: ' + source.id);
      const general = Math.max(...source.pricing.tariffs.map(t => t.amount));
      if (departure.price !== general) throw Error('La tarifa general cambió; revisar antes de aplicar: ' + source.id);
      const reduced = source.pricing.tariffs.filter(t => t.amount < general);
      if (!reduced.length) continue;
      if (documents.some(d => d._id === `drafts.${doc._id}` || d._id.startsWith('versions.') && d._id.endsWith('.' + doc._id))) throw Error('Hay una edición pendiente del viaje: ' + doc._id);
      const expected = reduced.map((t, index) => ({_key: `promotion-${index + 1}`, _type: 'promotion', label: index === 0 ? 'Early bird' : 'Segundo tramo', price: t.amount,
        ...(t.firstPlace != null ? {firstPlace: t.firstPlace, lastPlace: t.lastPlace} : {condition: 'Plazas limitadas'}), active: index === 0}));
      validatePromotions(expected, general, departure.capacity?.total ?? doc.capacity?.total);
      if (departure.promotions != null) {
        validatePromotions(departure.promotions, general, departure.capacity?.total ?? doc.capacity?.total);
        if (!same(sourceShape(departure.promotions), sourceShape(expected))) throw Error('Las tarifas existentes difieren del PDF: ' + source.id);
        // Never reset an editor's later choice of active stage on a rerun.
      } else {
        set[`departures[_key==${JSON.stringify(departure._key)}].promotions`] = expected;
      }
      const tariffs = validatePromotions(expected, general).map(t => `${t.label}: ${price(t.price)} (${promotionCondition(t).toLocaleLowerCase('es')})`);
      conditions.push(`${tariffs.join('; ')}. Tarifa general: ${price(general)}.`);
    }
    if (Object.keys(set).length) {
      if (!doc._rev) throw Error('Falta la revisión del documento: ' + doc._id);
      set.priceNote = `${[...new Set(conditions)].join(' ')} Precios por persona. La consulta no confirma la reserva.`;
      patches.push({id: doc._id, ifRevisionID: doc._rev, set});
    }
  }
  for (const id of sources.keys()) if (!seen.has(id)) throw Error('Falta una salida del inventario en Sanity: ' + id);
  return patches;
}

export function applyPromotionPlan(documents, patches) {
  const result = structuredClone(documents);
  for (const patch of patches) {
    const doc = result.find(d => d._id === patch.id);
    if (!doc || doc._rev !== patch.ifRevisionID) throw Error('Revisión distinta al preparar el cambio: ' + patch.id);
    for (const [key, value] of Object.entries(patch.set)) {
      if (key === 'priceNote') { doc.priceNote = value; continue; }
      const match = /^departures\[_key==("[^"\\]+")\]\.promotions$/.exec(key);
      if (!match) throw Error('Ruta de escritura no permitida');
      const departure = doc.departures.find(d => d._key === JSON.parse(match[1]));
      if (!departure) throw Error('Salida desaparecida al aplicar el plan');
      departure.promotions = structuredClone(value);
    }
  }
  return result;
}

const query = `*[_type == "trip"]{..., "dossier": coalesce(dossierFile.asset->url, dossier),
  "hero": hero{..., "url": asset->url}, "gallery": gallery[]{..., "url": asset->url},
  "departures": departures[]{..., "dossier": coalesce(dossierFile.asset->url, dossier)},
  "activities": activities[]{..., "image": image{..., "url": asset->url}},
  "spots": spots[]{..., "image": image{..., "url": asset->url}},
  "stay": stay{..., "image": image{..., "url": asset->url}, "gallery": gallery[]{..., "url": asset->url}}}`;

async function main() {
  const out = 'artifacts/early-bird-2026-10-25';
  await mkdir(out, {recursive: true});
  const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
  const sourceDirectory = process.env.LST_PDF_SOURCE_DIR || (process.platform === 'win32' ? inventory.sourceDirectoryWSL.replace('/mnt/c/', 'C:/') : inventory.sourceDirectoryWSL);
  for (const item of inventory.departures) {
    const hash = createHash('sha256').update(await readFile(path.join(sourceDirectory, item.source.file))).digest('hex');
    if (hash !== item.source.sha256) throw Error('El PDF original cambió: ' + item.source.file);
  }
  const configPath = process.env.LST_SANITY_AUTH_CONFIG || path.join(os.homedir(), '.config/sanity/config.json');
  const token = process.env.SANITY_IMPORT_TOKEN || JSON.parse(await readFile(configPath, 'utf8')).authToken;
  if (!token) throw Error('Falta una sesión de Sanity con permiso de edición');
  const docs = await querySanity(query, {token, perspective: 'raw'});
  const patches = planPromotionUpdate(docs, inventory);
  if (!process.argv.includes('--apply')) {
    await writeFile(`${out}/promotion-plan.json`, JSON.stringify(patches, null, 2));
    await writeFile(`${out}/sanity-candidate.json`, JSON.stringify(applyPromotionPlan(docs, patches).filter(d => !/^(drafts|versions)\./.test(d._id)), null, 2));
    console.log(JSON.stringify({mode: 'plan', documents: patches.length, departures: patches.reduce((n, p) => n + Object.keys(p.set).filter(k => k !== 'priceNote').length, 0), originalPdfsVerified: inventory.departures.length}));
    return;
  }
  const reviewed = JSON.parse(await readFile(`${out}/promotion-plan.json`, 'utf8'));
  if (!patches.length) { console.log('Las tarifas ya están configuradas; se conserva la selección editorial vigente.'); return; }
  if (!same(patches, reviewed)) throw Error('Cambió el contenido desde el plan revisado; no se ha escrito en Sanity');
  const response = await fetch(`https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data/mutate/${SANITY.dataset}?visibility=sync&returnDocuments=false`, {
    method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`}, redirect: 'error', signal: AbortSignal.timeout(30000),
    body: JSON.stringify({mutations: patches.map(patch => ({patch}))}),
  });
  if (!response.ok) throw Error('No se aplicó la transacción de tarifas: HTTP ' + response.status);
  const transaction = await response.json();
  await writeFile(`${out}/sanity-transaction.json`, JSON.stringify({transactionId: transaction.transactionId, documents: patches.map(p => p.id)}, null, 2));
  const after = await querySanity(query, {token, perspective: 'raw'});
  if (planPromotionUpdate(after, inventory).length) throw Error('La lectura posterior no coincide con las tarifas preparadas');
  await writeFile(`${out}/sanity-after.json`, JSON.stringify(after, null, 2));
  console.log(JSON.stringify({mode: 'applied', transactionId: transaction.transactionId, documents: patches.length, readback: 'verified'}));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
