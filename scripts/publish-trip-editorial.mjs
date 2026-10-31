import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {querySanity, SANITY} from './sanity.mjs';
import {editorialVersion, editorialDrafts, applyEditorialPlan, resolveEditorialAssets} from './migrate-trip-editorial.mjs';
import {adaptTrips} from './sanity-trips.mjs';

const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const content = ({_rev, _createdAt, _updatedAt, _system, ...doc}) => doc;

// A publication always covers the complete reviewed migration, including both Maldives dates.
export function planEditorialPublication(documents, migration) {
  if (!migration.length || new Set(migration.map(p => p.id)).size !== migration.length) throw Error('Plan de migración vacío o duplicado');
  const plans = migration.map(plan => {
    const published = documents.find(d => d._id === plan.id);
    const draft = documents.find(d => d._id === 'drafts.' + plan.id);
    if (!published || published._rev !== plan.revision || !draft?._rev || draft.editorialMigration?.version !== editorialVersion || draft.editorialMigration?.sourceRevision !== published._rev) throw Error('Cambió el origen o falta un borrador: ' + plan.id);
    if (documents.some(d => d._id.startsWith('versions.') && d._id.endsWith('.' + plan.id))) throw Error('Hay una edición en release: ' + plan.id);
    const [expected] = editorialDrafts([published], [plan]);
    if (!same(content(draft), expected)) throw Error('Cambió el contenido del borrador: ' + plan.id);
    return {id: plan.id, revision: published._rev, draftId: draft._id, draftRevision: draft._rev, retainDraft: !!plan.draftRevision, set: plan.set};
  });
  // Validate the complete candidate and refuse a partial update that loses grouped canonical routes.
  const before = adaptTrips(documents.filter(d => !/^(drafts|versions)\./.test(d._id)).map(resolveEditorialAssets));
  const after = adaptTrips(applyEditorialPlan(documents, migration).map(resolveEditorialAssets));
  const routes = trips => trips.flatMap(t => [t.slug, ...(t.aliases ?? [])]).sort();
  if (!same(routes(before), routes(after))) throw Error('La publicación alteraría las rutas: revisa el grupo completo');
  return plans;
}

export function editorialPublicationMutations(plans) {
  return plans.flatMap(plan => [
    {patch: {id: plan.draftId, ifRevisionID: plan.draftRevision, set: {'editorialMigration.version': editorialVersion}}},
    {patch: {id: plan.id, ifRevisionID: plan.revision, set: plan.set}},
    ...(plan.retainDraft ? [] : [{delete: {id: plan.draftId}}]),
  ]);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a !== '--apply' && !a.startsWith('--out='))) throw Error('Uso: publish-trip-editorial.mjs [--out=carpeta-del-plan] [--apply]');
  const out = args.find(a => a.startsWith('--out='))?.slice(6) ?? 'artifacts/sanity-editorial-2026-10-31';
  const migration = JSON.parse(await readFile(path.join(out, 'plan.json'), 'utf8'));
  const token = process.env.SANITY_IMPORT_TOKEN || JSON.parse(await readFile(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8')).authToken;
  if (!token) throw Error('Falta una credencial privada de edición');
  const seed = JSON.parse(await readFile('docs/sanity/2026-10-31-editorial/seed.json', 'utf8'));
  if (!same(migration.map(p => p.id).sort(), seed.trips.map(t => t.id).sort())) throw Error('La publicación requiere los ocho documentos del inventario revisado');
  const documents = await querySanity('*[_type == "trip"]', {token, perspective: 'raw'});
  const plans = planEditorialPublication(documents, migration);
  await mkdir(out, {recursive: true});
  if (!args.includes('--apply')) {
    await writeFile(path.join(out, 'publication-plan.json'), JSON.stringify(plans, null, 2) + '\n');
    console.log(JSON.stringify({mode: 'publication-plan', documents: plans.length, published: false}));
    return;
  }
  const reviewed = JSON.parse(await readFile(path.join(out, 'publication-plan.json'), 'utf8'));
  if (!same(plans, reviewed)) throw Error('Cambió el plan de publicación. No se ha escrito en Sanity.');
  const response = await fetch('https://' + SANITY.projectId + '.api.sanity.io/v' + SANITY.apiVersion + '/data/mutate/' + SANITY.dataset + '?visibility=sync&returnDocuments=false', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + token},
    body: JSON.stringify({mutations: editorialPublicationMutations(plans)}),
  });
  if (!response.ok) throw Error('No se confirmó la publicación: HTTP ' + response.status + '. Relee Sanity antes de reintentar.');
  const after = await querySanity('*[_type == "trip"]', {token, perspective: 'raw'});
  for (const plan of plans) {
    const doc = after.find(d => d._id === plan.id);
    if (!doc || (!plan.retainDraft && after.some(d => d._id === plan.draftId)) || (plan.retainDraft && !after.some(d => d._id === plan.draftId)) || !Object.entries(plan.set).every(([key, value]) => same(doc[key], value))) throw Error('No se confirmó el resultado. Relee Sanity antes de reintentar.');
  }
  console.log(JSON.stringify({published: plans.length, atomic: true, readback: 'verified'}));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => {console.error(error.message); process.exitCode = 1;});
