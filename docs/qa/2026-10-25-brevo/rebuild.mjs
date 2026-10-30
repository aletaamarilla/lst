import {readFile} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {adaptTrips} from '../../../scripts/sanity-trips.mjs';
import {buildSite} from '../../../scripts/build.mjs';
const raw=JSON.parse(await readFile('artifacts/early-bird-2026-10-25/sanity-published-final.json','utf8'));
const before=JSON.parse(await readFile('docs/qa/2026-10-25-brevo/before/dist/catalog-snapshot.json','utf8')).trips;
if(!isDeepStrictEqual(adaptTrips(raw),before))throw Error('La copia publicada retenida no coincide con la base');
console.log('Retained published documents match the pre-task public snapshot exactly. No remote content refresh.');
console.log(await buildSite({read:async()=>raw}));
