import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SANITY, readImportInventory, createDrafts} from './sanity.mjs';
import {adaptTrip, httpsUrl} from './sanity-trips.mjs';

export const departureIds = Object.freeze(['hossegor-2026-11-20', 'el-palmar-2026-12-04', 'marruecos-2027-01-17', 'marruecos-2027-01-24', 'fuerteventura-2027-02-12', 'senegal-2027-02-28', 'maldivas-2027-03-21', 'maldivas-2027-03-28']);
export function prepareDrafts(inventory) {
  if (inventory.sanityTarget?.projectId !== SANITY.projectId || inventory.sanityTarget?.dataset !== SANITY.dataset) throw Error('Destino del inventario incorrecto');
  if (inventory.departures?.length !== 8 || new Set(inventory.departures.map(d => d.id)).size !== 8 || inventory.departures.some(d => !departureIds.includes(d.id))) throw Error('Se requieren exactamente las ocho salidas identificadas');
  return inventory.departures.map(d => {
    if (!/^[a-f0-9]{64}$/.test(d.source?.sha256 ?? '') || !d.source.file || !Number.isInteger(d.source.pageCount)) throw Error(`Fuente incompleta: ${d.id}`);
    if (d.pricing?.effectiveAmount != null || d.capacity?.value?.available != null) throw Error(`No importar vigencia o disponibilidad sin revisión: ${d.id}`);
    const tariffs = d.pricing.tariffs.map(t => `${t.label}: ${t.amount} € · ${t.condition ?? ''}${t.lastPlace ? ` · hasta plaza ${t.lastPlace}` : ''}`).join('\n');
    const payment = d.payment;
    const terms = [payment.depositAmount != null ? `Señal publicada: ${payment.depositAmount} €${payment.depositPercentPublished != null ? ` / ${payment.depositPercentPublished} % (equivalencia pendiente de aclarar)` : ''}.` : '', payment.depositDue ? `Señal: ${payment.depositDue}.` : '', payment.balanceDue ? `Resto: ${payment.balanceDue}.` : ''].filter(Boolean).join(' ');
    const document = {
      _id: `drafts.lst-${d.id}`, _type: 'trip', name: d.name.value, slug: {_type: 'slug', current: d.id},
      place: d.place.value, state: 'confirmed', levels: d.levels.value, levelRequirement: d.levelRequirement?.value ?? '',
      departures: [{_type: 'departure', _key: d.id, start: d.dates.start, end: d.dates.end, duration: d.duration.value.label}],
      intro: d.introduction?.value ?? '', story: d.program.map((p, i) => ({_type: 'storyItem', _key: `program-${i + 1}`, title: `Programa ${i + 1}`, text: p.value})),
      includes: d.includes.value, excludes: d.excludes.value,
      stay: {_type: 'stay', text: d.stay?.value ?? ''},
      faqs: d.faqs.map((f, i) => ({_type: 'faq', _key: `faq-${i + 1}`, question: f.question, answer: f.answer})),
      capacity: {_type: 'capacity', total: d.capacity.value.total},
      payment: {_type: 'payment', depositAmount: payment.depositAmount, terms},
      notice: 'Consulta la disponibilidad con el equipo antes de organizar tu viaje.',
      // No active price, availability, images, dossier URL or channel switch is inferred.
      editorialNotes: `BORRADOR: revisión comercial y de textos necesaria antes de publicar.\nFuente: ${d.source.file}; SHA256 ${d.source.sha256}; ${d.source.pageCount} páginas. Inventario local: docs/sanity/2026-10-23/salidas.json (${d.id}).\nTarifas del PDF, vigencia NO confirmada:\n${tariffs}\nCanal de consulta: WhatsApp. No se importan enlaces de formulario.\n${(d.pending ?? []).join('\n')}\nConfirmar señal, fotos autorizadas y URL pública del PDF. La fecha de revisión documental no acredita vigencia comercial.`,
    };
    adaptTrip({...document, _id: document._id.slice(7)}); // Same data validation as the production reader.
    return document;
  });
}

const logicalId = id => id.startsWith('drafts.') ? id.slice(7) : id.startsWith('versions.') ? id.split('.').slice(2).join('.') : id;
export function planImport(documents, existing) {
  // Detect all conflicts before returning any mutation. Same identity is always left untouched,
  // including edited slugs, published documents and drafts changed manually after an earlier run.
  for (const doc of documents) {
    const base = logicalId(doc._id);
    for (const other of existing) {
      if (logicalId(other._id) === base && other._type !== 'trip') throw Error(`Colisión de ID: ${doc._id}`);
      if (other.slug?.current === doc.slug.current && logicalId(other._id) !== base) throw Error(`Colisión de slug: ${doc.slug.current}`);
    }
  }
  return documents.map(doc => ({id: doc._id, slug: doc.slug.current,
    action: existing.some(e => logicalId(e._id) === logicalId(doc._id)) ? 'skip-existing-preserve-manual' : 'create-draft'}));
}

export async function runImport({remote = false, apply = false, env = process.env, inventory, read = readImportInventory, write = createDrafts} = {}) {
  const documents = prepareDrafts(inventory);
  if (apply && !remote) throw Error('--apply requiere preflight remoto autenticado');
  if (remote && !env.SANITY_IMPORT_TOKEN) throw Error('El preflight de borradores requiere SANITY_IMPORT_TOKEN privado; una lectura anónima no detecta todas las colisiones.');
  if (env.SANITY_IMPORT_TOKEN && env.SANITY_IMPORT_TOKEN === env.SANITY_READ_TOKEN) throw Error('Separa SANITY_READ_TOKEN de SANITY_IMPORT_TOKEN');
  const plan = remote ? planImport(documents, await read({env})) : documents.map(d => ({id: d._id, slug: d.slug.current, action: 'pending-authenticated-preflight'}));
  const creates = documents.filter(d => plan.find(p => p.id === d._id)?.action === 'create-draft');
  if (apply && creates.length) await write(creates, {env});
  return {target: SANITY, mode: apply ? 'apply-drafts' : 'dry-run', remoteCollisionCheck: remote ? 'completed' : 'pending',
    writes: apply ? creates.length : 0, plan};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(a => !['--check-remote', '--apply'].includes(a) && !a.startsWith('--report='))) throw Error('Uso: import-departures.mjs [--check-remote] [--apply] [--report=/ruta/local.json]');
  try {
    const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
    const result = await runImport({inventory, remote: args.includes('--check-remote'), apply: args.includes('--apply')});
    const report = JSON.stringify(result, null, 2) + '\n';
    const output = args.find(a => a.startsWith('--report='))?.slice(9);
    if (output) await writeFile(output, report);
    console.log(report);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
