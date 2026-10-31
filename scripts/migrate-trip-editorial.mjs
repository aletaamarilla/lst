import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {querySanity, SANITY} from './sanity.mjs';
import {sharedTripContentFields} from './trip-content-fields.mjs';

export const editorialVersion = '2026-10-31-v1';
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const missing = value => value == null || value === '';
const faqContent = value => (value ?? []).map(({question, answer}) => ({question, answer}));

// Seed is a reviewed, one-off content inventory, never a runtime destination fallback.
function editorialChanges(doc, item) {
  const set = {};
  for (const [key, value] of Object.entries(item.setIfMissing)) if (missing(doc[key]) && value != null) set[key] = structuredClone(value);
  const story = (doc.story ?? []).map(part => /^Programa \d+$/.test(part.title) && item.storyTitles[part._key] ? {...part, title: item.storyTitles[part._key]} : part);
  if (!same(story, doc.story ?? [])) set.story = story;
  if (same(faqContent(doc.faqs), faqContent(item.faqs.before)) && !same(faqContent(doc.faqs), faqContent(item.faqs.after))) set.faqs = structuredClone(item.faqs.after);
  return set;
}

export function planEditorialMigration(documents, seed) {
  if (seed.projectId !== SANITY.projectId || seed.dataset !== SANITY.dataset || seed.version !== 1) throw Error('Inventario editorial de otro proyecto o versión');
  const plans = [];
  for (const item of seed.trips) {
    const doc = documents.find(d => d._id === item.id);
    if (!doc || doc._type !== 'trip' || doc.slug?.current !== item.slug || !doc._rev) throw Error('Falta el viaje original o cambió su identidad: ' + item.id);
    const draft = documents.find(d => d._id === 'drafts.' + item.id);
    if (draft?.editorialMigration?.version === editorialVersion || doc.editorialMigration?.version === editorialVersion) continue;
    if (documents.some(d => d._id.startsWith('versions.') && d._id.endsWith('.' + item.id))) throw Error('Hay una edición en release: ' + item.id);
    if (draft && !draft._rev) throw Error('Falta la revisión del borrador: ' + item.id);
    const ownerId = item.setIfMissing.editorialSource?._ref;
    if (draft && ownerId && !draft.editorialSource) {
      const owner = documents.find(d => d._id === 'drafts.' + ownerId) ?? documents.find(d => d._id === ownerId);
      if (sharedTripContentFields.some(field => !same(draft[field], doc[field]) && !same(draft[field], owner?.[field]))) throw Error('Hay contenido compartido pendiente distinto del principal: ' + item.id);
    }
    const marker = {version: editorialVersion, sourceRevision: doc._rev};
    const set = {...editorialChanges(doc, item), editorialMigration: marker};
    const draftSet = draft ? {...editorialChanges(draft, item), editorialMigration: marker} : structuredClone(set);
    plans.push({id: doc._id, revision: doc._rev, set, ...(draft ? {draftRevision: draft._rev, sourceDraft: structuredClone(draft), draftSet} : {})});
  }
  return plans;
}

export function applyEditorialPlan(documents, plans) {
  return documents.filter(d => !/^(drafts|versions)\./.test(d._id)).map(doc => {
    const plan = plans.find(p => p.id === doc._id);
    if (!plan) return structuredClone(doc);
    if (doc._rev !== plan.revision) throw Error('Revisión distinta: ' + doc._id);
    return {...structuredClone(doc), ...structuredClone(plan.set)};
  });
}

export function editorialDrafts(documents, plans) {
  return plans.map(plan => {
    const doc = documents.find(d => d._id === plan.id);
    if (!doc || doc._rev !== plan.revision) throw Error('Revisión distinta: ' + plan.id);
    const {_rev, _createdAt, _updatedAt, _system, ...content} = plan.sourceDraft ?? doc;
    return {...structuredClone(content), ...structuredClone(plan.draftSet ?? plan.set), _id: 'drafts.' + doc._id};
  });
}

export function editorialDraftMutations(documents, plans) {
  const drafts = editorialDrafts(documents, plans);
  return plans.map((plan, index) => plan.draftRevision ? {patch: {id: 'drafts.' + plan.id, ifRevisionID: plan.draftRevision, set: plan.draftSet}} : {create: drafts[index]});
}

// Offline previews resolve public assets without copying credentials or internal CMS notes into dist.
export function resolveEditorialAssets(value) {
  if (Array.isArray(value)) return value.map(resolveEditorialAssets);
  if (!value || typeof value !== 'object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveEditorialAssets(item)]));
  const ref = value.asset?._ref;
  if (/^image-[a-f0-9]+-\d+x\d+-[a-z0-9]+$/.test(ref ?? '')) {
    const id = ref.slice(6), split = id.lastIndexOf('-');
    result.url = 'https://cdn.sanity.io/images/' + SANITY.projectId + '/' + SANITY.dataset + '/' + id.slice(0, split) + '.' + id.slice(split + 1);
  }
  if (value.dossierFile?.asset?._ref) {
    const id = value.dossierFile.asset._ref;
    if (!/^file-[a-f0-9]+-pdf$/.test(id)) throw Error('Dossier sin un asset PDF válido');
    result.dossier = 'https://cdn.sanity.io/files/' + SANITY.projectId + '/' + SANITY.dataset + '/' + id.slice(5, -4) + '.pdf';
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a !== '--apply-drafts' && !a.startsWith('--source=') && !a.startsWith('--out='))) throw Error('Uso: migrate-trip-editorial.mjs [--source=archivo.json] [--out=carpeta] [--apply-drafts]');
  const source = args.find(a => a.startsWith('--source='))?.slice(9);
  const out = args.find(a => a.startsWith('--out='))?.slice(6) ?? 'artifacts/sanity-editorial-2026-10-31';
  const seed = JSON.parse(await readFile('docs/sanity/2026-10-31-editorial/seed.json', 'utf8'));
  let token = process.env.SANITY_IMPORT_TOKEN;
  if (!source && !token) token = JSON.parse(await readFile(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8')).authToken;
  if (!source && !token) throw Error('Falta una sesión de Sanity o una credencial privada para comprobar borradores y releases');
  const loaded = source ? JSON.parse(await readFile(source, 'utf8')) : await querySanity('*[_type == "trip"]', {token, perspective: 'raw'});
  const documents = Array.isArray(loaded) ? loaded : loaded.result ?? loaded.documents;
  if (!Array.isArray(documents)) throw Error('Inventario de documentos inválido');
  const plans = planEditorialMigration(documents, seed);
  await mkdir(out, {recursive: true});
  if (args.includes('--apply-drafts')) {
    if (source || !token) throw Error('Crear borradores requiere una lectura actual y credencial privada');
    const reviewed = JSON.parse(await readFile(path.join(out, 'plan.json'), 'utf8'));
    if (!plans.length) { console.log('La migración ya está preparada; se conservan las ediciones posteriores.'); return; }
    if (!same(reviewed, plans)) throw Error('El plan cambió desde la revisión. No se ha escrito en Sanity.');
    const drafts = editorialDrafts(documents, plans);
    const response = await fetch('https://' + SANITY.projectId + '.api.sanity.io/v' + SANITY.apiVersion + '/data/mutate/' + SANITY.dataset + '?visibility=sync&returnDocuments=false', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + token},
      body: JSON.stringify({mutations: editorialDraftMutations(documents, plans)}),
    });
    if (!response.ok) throw Error('No se confirmó la creación de borradores: HTTP ' + response.status + '. Relee Sanity antes de reintentar.');
    const after = await querySanity('*[_type == "trip"]', {token, perspective: 'raw'});
    if (!drafts.every(d => after.some(a => a._id === d._id && Object.entries(d).every(([key, value]) => same(value, a[key]))))) throw Error('No se confirmó el contenido de los borradores. Relee Sanity antes de reintentar.');
    console.log(JSON.stringify({createdDrafts: plans.filter(p => !p.draftRevision).length, updatedDrafts: plans.filter(p => p.draftRevision).length, published: false, readback: 'verified'}));
    return;
  }
  if (!plans.length) { console.log('La migración ya está preparada; se conserva el plan revisado.'); return; }
  const candidates = applyEditorialPlan(documents, plans);
  await writeFile(path.join(out, 'plan.json'), JSON.stringify(plans, null, 2) + '\n');
  await writeFile(path.join(out, 'candidate.json'), JSON.stringify(candidates, null, 2) + '\n');
  await writeFile(path.join(out, 'preview.json'), JSON.stringify({source: 'sanity-drafts-local', documents: candidates.map(resolveEditorialAssets)}, null, 2) + '\n');
  console.log(JSON.stringify({mode: 'plan', documents: plans.length, out, published: false}));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => {console.error(error.message); process.exitCode = 1;});
