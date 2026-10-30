// One reviewed batch only. No credential values, general seeds, replacements or publication.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {SANITY, createDrafts, readImportInventory} from '../../../../scripts/sanity.mjs';
import {prepareDrafts, planImport} from '../../../../scripts/import-departures.mjs';
import {adaptTrip} from '../../../../scripts/sanity-trips.mjs';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(path.join(root, 'studio/package.json'));
const {createClient} = await import(require.resolve('@sanity/client'));
const apply = process.argv.includes('--apply');
assert(process.argv.slice(2).every(a => a === '--apply'), 'Only --apply is supported; default is read-only.');
assert(process.env.SANITY_IMPORT_TOKEN, 'Missing private SANITY_IMPORT_TOKEN.');
assert(process.env.SANITY_IMPORT_TOKEN !== process.env.SANITY_READ_TOKEN, 'Import and public reader credentials must differ.');
const client = createClient({...SANITY, token: process.env.SANITY_IMPORT_TOKEN, useCdn: false, perspective: 'raw', maxRetries: 0, timeout: 30000});
const directory = path.join(root, 'docs/sanity/2026-10-23/import', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(directory, {recursive: true});
const hash = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const clean = value => JSON.parse(JSON.stringify(value));
const scrub = text => String(text).split(process.env.SANITY_IMPORT_TOKEN).join('[REDACTED]').replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
const save = (name, data) => writeFile(path.join(directory, name), JSON.stringify(data, null, 2) + '\n');
const manifest = {batch: 'lst-reviewed-2026-10-23', target: SANITY, mode: apply ? 'apply' : 'preflight', startedAt: new Date().toISOString(), status: 'running', createdIds: [], modifiedIds: [], assets: [], transactions: [], phase: 'preflight'};
manifest.executorSha256 = hash(await readFile(fileURLToPath(import.meta.url)));
await save('manifest.json', manifest);
const persist = () => save('manifest.json', manifest);

async function schemaValidation(documents, label) {
  const filename = path.join(directory, `${label}.ndjson`);
  await writeFile(filename, documents.map(d => JSON.stringify(d)).join('\n') + '\n');
  const result = spawnSync(process.execPath, [path.join(root, 'studio/node_modules/sanity/bin/sanity'), 'documents', 'validate', '--file', filename, '--project-id', SANITY.projectId, '--dataset', SANITY.dataset, '--yes', '--format', 'json', '--level', 'info'], {
    cwd: path.join(root, 'studio'), timeout: 180000, maxBuffer: 5 * 1024 * 1024, encoding: 'utf8',
    env: {...process.env, SANITY_AUTH_TOKEN: process.env.SANITY_IMPORT_TOKEN, DO_NOT_TRACK: '1', SANITY_CLI_NO_TELEMETRY: '1'},
  });
  await writeFile(path.join(directory, `${label}-schema-stderr.txt`), scrub(result.stderr ?? ''));
  await writeFile(path.join(directory, `${label}-schema-stdout.json`), scrub(result.stdout ?? ''));
  assert.equal(result.status, 0, `Schema validation failed: ${label}; inspect saved diagnostics.`);
  const findings = JSON.parse(result.stdout.trim());
  assert(Array.isArray(findings), 'Invalid schema validation report.');
  assert(!findings.some(f => f.markers.some(m => m.level === 'error')), 'Schema errors remain.');
  return {documents: documents.length, status: 'passed', findings};
}

function checkCdn(url) {
  const u = new URL(url);
  assert.equal(u.origin, 'https://cdn.sanity.io');
  assert(u.pathname.startsWith(`/files/${SANITY.projectId}/${SANITY.dataset}/`), 'PDF outside the required project/dataset.');
  return u;
}

try {
  const project = await client.projects.getById(SANITY.projectId);
  const datasets = await client.datasets.list();
  assert.equal(project.id, SANITY.projectId);
  assert(datasets.some(d => d.name === SANITY.dataset), 'Dataset not found.');
  const inventoryBytes = await readFile(path.join(root, 'docs/sanity/2026-10-23/salidas.json'));
  const inventory = JSON.parse(inventoryBytes);
  if (project.organizationId) assert.equal(project.organizationId, inventory.sanityTarget.organizationId);
  manifest.project = {id: project.id, name: project.displayName, organizationId: project.organizationId};
  manifest.inventorySha256 = hash(inventoryBytes);
  const documents = prepareDrafts(inventory);
  const before = await client.fetch('*[]{_id,_type,_rev,slug}');
  const beforeAssets = await client.fetch('*[_type in ["sanity.fileAsset","sanity.imageAsset"]]{_id,_type,_rev,sha1hash,mimeType,size,url,originalFilename}');
  const plan = planImport(documents, before);
  manifest.plan = plan;
  const creates = documents.filter(d => plan.find(p => p.id === d._id).action === 'create-draft');
  // Existing identities are preserved, even if they were imported by a previous run.
  const reservedIds = documents.flatMap(d => [d._id, d._id.slice(7)]);
  const preserved = await client.fetch('*[_id in $ids]', {ids: reservedIds});
  await save('before-metadata.json', before);
  await save('before-assets.json', beforeAssets);
  await save('preserved-reserved-documents.json', preserved);
  const files = [];
  for (let i = 0; i < documents.length; i++) {
    const source = inventory.departures[i];
    const bytes = await readFile(path.join(inventory.sourceDirectoryWSL, source.source.file));
    assert.equal(hash(bytes), source.source.sha256, `Source PDF changed: ${source.id}`);
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    const sha1 = hash(bytes, 'sha1');
    const asset = beforeAssets.find(a => a._type === 'sanity.fileAsset' && a.sha1hash === sha1 && a.mimeType === 'application/pdf');
    if (asset) checkCdn(asset.url);
    files.push({id: documents[i]._id, source: source.source.file, bytes: bytes.length, sha256: source.source.sha256, sha1, expectedAssetId: `file-${sha1}-pdf`, existingAssetId: asset?._id, existingUrl: asset?.url});
    documents[i].editorialNotes += `\nDatos documentales íntegros (NO confirman vigencia):\n${JSON.stringify({pricing: source.pricing, payment: source.payment, booking: source.booking})}`;
    const payment = source.payment;
    if (payment.balanceAmountPublished != null) documents[i].payment.terms += ` Saldo publicado en el PDF: ${payment.balanceAmountPublished} € (vigencia pendiente).`;
    if (payment.balancePercentPublished != null) documents[i].payment.terms += ` Porcentaje de saldo publicado: ${payment.balancePercentPublished} % (vigencia y equivalencia pendientes).`;
  }
  manifest.files = files;
  await save('preflight.json', {project: manifest.project, target: SANITY, plan, files, existingDocuments: before.length, existingAssets: beforeAssets.length});
  manifest.phase = 'candidate-schema-validation';
  await persist();
  manifest.candidateSchemaValidation = await schemaValidation(documents, 'candidates');
  await persist();
  if (!apply) {
    manifest.status = 'preflight-passed';
    manifest.completedAt = new Date().toISOString();
    await persist();
    console.log(JSON.stringify({status: manifest.status, report: directory, target: SANITY, plannedCreates: creates.length, preserved: plan.length - creates.length, remoteWrites: 0}));
    process.exit(0);
  }
  manifest.phase = 'pdf-assets';
  await persist();
  for (const document of creates) {
    const file = files.find(f => f.id === document._id);
    let asset;
    const current = await client.fetch('*[_type == "sanity.fileAsset" && sha1hash == $sha1 && mimeType == "application/pdf"]', {sha1: file.sha1});
    if (current.length) {
      asset = current[0];
      manifest.assets.push({id: asset._id, action: 'reused', sha256: file.sha256, url: asset.url});
    } else {
      // Persist intent before uploading: a lost response can be resolved by hash/ID.
      const record = {id: file.expectedAssetId, action: 'upload-pending', sha256: file.sha256, sha1: file.sha1};
      manifest.assets.push(record);
      await persist();
      const bytes = await readFile(path.join(inventory.sourceDirectoryWSL, file.source));
      assert.equal(hash(bytes), file.sha256, 'PDF changed since preflight.');
      asset = await client.assets.upload('file', bytes, {filename: file.source, contentType: 'application/pdf'});
      assert.equal(asset._id, file.expectedAssetId);
      Object.assign(record, {id: asset._id, revision: asset._rev, action: 'created', url: asset.url});
    }
    assert.equal(asset.sha1hash, file.sha1);
    assert.equal(asset.size, file.bytes);
    checkCdn(asset.url);
    document.dossier = asset.url;
    document.editorialNotes = document.editorialNotes.replace('Aprobar material fotográfico y URL pública del dossier', 'Aprobar material fotográfico; PDF original adjunto, revisión editorial pendiente.').replace('Confirmar señal, fotos autorizadas y URL pública del PDF.', 'Confirmar señal y fotos autorizadas. PDF original adjunto; no acredita vigencia comercial.');
    document.editorialNotes += `\nLote: ${manifest.batch}. PDF: ${asset._id}; SHA256 ${file.sha256}.`;
    adaptTrip({...document, _id: document._id.slice(7)});
    await persist();
  }
  manifest.phase = 'final-schema-validation';
  await persist();
  manifest.finalSchemaValidation = await schemaValidation(documents, 'final-candidates');
  // Recheck all logical IDs/slugs immediately before the only trip transaction.
  const latest = await readImportInventory();
  assert.deepEqual(planImport(documents, latest), plan, 'Remote identities changed; no trip documents written.');
  manifest.phase = 'create-drafts';
  manifest.plannedCreateIds = creates.map(d => d._id);
  await save('expected-documents.json', creates);
  await persist();
  if (creates.length) {
    const result = await createDrafts(creates);
    manifest.transactions.push({id: result.transactionId, documentIds: creates.map(d => d._id)});
    manifest.createdIds = creates.map(d => d._id);
    await persist();
  }
  manifest.phase = 'readback';
  await persist();
  const after = await client.fetch('*[]{_id,_type,_rev,slug}');
  planImport(documents, after); // Fails on a duplicate slug under another logical ID.
  const readback = await client.fetch('*[_id in $ids]', {ids: documents.map(d => d._id)});
  await save('readback.json', readback);
  await save('after-metadata.json', after);
  for (const previous of before) assert.equal(after.find(d => d._id === previous._id)?._rev, previous._rev, `Preexisting document changed: ${previous._id}`);
  const created = new Set(manifest.createdIds);
  const unexpected = after.filter(d => !before.some(b => b._id === d._id) && !created.has(d._id) && !manifest.assets.some(a => a.id === d._id));
  assert.equal(unexpected.length, 0, 'Unexpected concurrent documents; inspect metadata.');
  const checks = [];
  for (let i = 0; i < documents.length; i++) {
    const expected = documents[i];
    const source = inventory.departures[i];
    const actual = readback.find(d => d._id === expected._id);
    if (!created.has(expected._id)) {
      checks.push({id: expected._id, status: 'existing-preserved', requiresManualReview: true});
      continue;
    }
    assert(actual, `Missing draft: ${expected._id}`);
    const business = {...actual};
    for (const key of ['_createdAt', '_updatedAt', '_rev', '_system']) delete business[key];
    assert.deepEqual(business, clean(expected), `Readback differs from candidate: ${expected._id}`);
    assert.equal(actual.departures[0].start, source.dates.start);
    assert.equal(actual.departures[0].end, source.dates.end);
    assert.deepEqual(actual.levels, source.levels.value);
    assert.equal(actual.payment.depositAmount, source.payment.depositAmount);
    assert(actual.departures.every(d => d.price == null) && actual.price == null);
    assert(actual.capacity.available == null && actual.booking?.applicationUrl == null);
    assert(actual.hero == null && !actual.gallery?.length && actual.stay?.image == null);
    assert(actual.editorialNotes.includes(source.booking.formUrl));
    assert(actual.editorialNotes.includes('NO confirmada'));
    assert(!after.some(d => d._id === actual._id.slice(7)), 'Unexpected published trip.');
    checkCdn(actual.dossier);
    const response = await fetch(actual.dossier, {redirect: 'error', signal: AbortSignal.timeout(30000)});
    assert(response.ok, `PDF cannot be read: ${actual._id}`);
    const downloaded = Buffer.from(await response.arrayBuffer());
    assert.equal(hash(downloaded), source.source.sha256, `Remote PDF bytes differ: ${actual._id}`);
    checks.push({id: actual._id, revision: actual._rev, status: 'readback-verified', dates: source.dates, levels: actual.levels, depositAmount: actual.payment.depositAmount, effectivePrice: null, availablePlaces: null, formRetainedForReview: source.booking.formUrl, formActivated: false, approvedPhotos: 0, pdfUrl: actual.dossier, pdfSha256Verified: true, pending: source.pending.filter(p => !p.includes('URL pública')).concat(['Aprobar fotos; revisar editorialmente el PDF adjunto.'])});
  }
  manifest.readbackSchemaValidation = await schemaValidation(readback, 'readback');
  await save('verification.json', {checks, noDuplicateSlugs: true, preexistingRevisionsPreserved: true, noPublication: true, unexpectedDocuments: unexpected});
  manifest.checks = checks;
  manifest.status = 'completed-verified';
  manifest.completedAt = new Date().toISOString();
  await persist();
  console.log(JSON.stringify({status: manifest.status, target: SANITY, report: directory, created: manifest.createdIds, modified: manifest.modifiedIds, pdfAssets: manifest.assets.map(a => ({id: a.id, action: a.action})), schemaValidation: 'passed', published: 0}));
} catch (error) {
  manifest.status = 'failed-or-needs-reconciliation';
  manifest.failure = {phase: manifest.phase, httpStatus: error.statusCode ?? null, message: scrub(error.message)};
  await persist();
  console.error(JSON.stringify({status: manifest.status, report: directory, failure: manifest.failure}));
  process.exitCode = 1;
}
