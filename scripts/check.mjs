import {readFile,access,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {departuresFor, departureMessage, levelLabel} from './trip-model.mjs';
import {execFileSync} from 'node:child_process';
const root=path.resolve('dist');
const trips=JSON.parse(await readFile('data/trips.json','utf8'));
const errors=[];
execFileSync(process.execPath,['--check','dist/app.js']);
execFileSync(process.execPath,['--check','dist/trip.js']);
execFileSync(process.execPath,['scripts/render-trips.mjs','--check'],{stdio:'inherit'});
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const files=await walk(root);
const pages=new Map();
for(const file of files.filter(f=>f.endsWith('.html'))){
 const html=await readFile(file,'utf8');const matches=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const ids=new Set(matches);if(ids.size!==matches.length)errors.push(`Duplicate IDs: ${file}`);
 pages.set(file,{html,ids});
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`Expected one page heading: ${file}`);
 if(!html.includes('noindex,nofollow'))errors.push(`Prototype noindex missing: ${file}`);
 if(/<form\b|type="email"|mailto:|data-details=/.test(html))errors.push(`Legacy form or modal trip action: ${file}`);
 const contacts=[...html.matchAll(/data-whatsapp="([^"]+)" href="([^"]+)"/g)];
 if(!contacts.length)errors.push(`Missing contact: ${file}`);
 for(const m of contacts){const u=new URL(m[2]);if(u.origin!=='https://wa.me'||u.pathname!=='/34648189257'||!u.searchParams.get('text'))errors.push(`Invalid WhatsApp: ${file}`);}
}
for(const [file,{html,ids}] of pages){
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const ref=m[1];if(!ref.startsWith('/')&&!ref.startsWith('#'))continue;
  if(ref.startsWith('#')){if(ref.length>1&&!ids.has(ref.slice(1)))errors.push(`Broken anchor ${ref}: ${file}`);continue;}
  const u=new URL(ref,'https://local.test');let target=path.join(root,decodeURIComponent(u.pathname));
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await access(target);}
  catch{errors.push(`Missing local target ${ref}: ${file}`);continue;}
  if(u.hash&&!pages.get(target)?.ids.has(u.hash.slice(1)))errors.push(`Broken page anchor ${ref}: ${file}`);
 }
}
for(const file of files.filter(f=>f.endsWith('.css'))){const css=await readFile(file,'utf8');for(const m of css.matchAll(/url\(['"]?([^)'" ]+)/g)){if(m[1].startsWith('/'))try{await access(path.join(root,m[1]));}catch{errors.push(`Missing CSS asset ${m[1]}`)}}}
const home=pages.get(path.join(root,'index.html')).html;
for(const t of trips){
 if(!home.includes(`href="/viajes/${t.slug}/"`))errors.push(`Home missing trip route ${t.slug}`);
 const page=pages.get(path.join(root,'viajes',t.slug,'index.html'));
 if(page){
  if(!page.html.includes(levelLabel(t)))errors.push(`Missing configured level ${t.slug}`);
  if(page.html.includes('trip-section-nav')||page.html.includes('Leer el programa completo'))errors.push(`Old detail navigation or dossier position ${t.slug}`);
  if(t.dossier&&!page.html.includes('Descargar dossier'))errors.push(`Missing booking dossier ${t.slug}`);
  const departures=departuresFor(t);
  if(departures.length>1){
   if(!page.html.includes('id="departure-dialog"')||page.html.includes('data-date-picker'))errors.push(`Date popup missing or old inline dates ${t.slug}`);
   for(const d of departures){
    const links=[...page.html.matchAll(/data-whatsapp="[^"]+" href="([^"]+)" data-departure="([^"]+)"/g)].filter(m=>m[2]===d.id);
    if(links.length!==1||links.some(m=>new URL(m[1]).searchParams.get('text')!==departureMessage(t,d)))errors.push(`Incorrect dated enquiry ${t.slug}/${d.id}`);
   }
  }else if(page.html.includes('data-open-dates'))errors.push(`Unexpected multiple-date action ${t.slug}`);
 }
 if(!page)errors.push(`Missing trip page ${t.slug}`);
 else if(t.state==='upcoming'&&!page.html.includes('Por confirmar'))errors.push(`Pending state unclear ${t.slug}`);
}
for(const [file,{html}] of pages){
 if(/salidas? de ejemplo|fechas? de muestra|fechas? ficticias?|MAQUETA/i.test(html))errors.push(`Old sample labels in client demo: ${file}`);
 if(/<details class="inclusion-list/.test(html))errors.push(`Inclusions should always remain visible: ${file}`);
}
if(trips.some(t=>t.state==='confirmed'&&!t.source&&!t.demoData?.clientPresentation))errors.push('Commercial data needs a verified source or an explicit internal demo record');
if(errors.length)throw Error(errors.join('\n'));
console.log(`PASS: ${pages.size} pages, independent routes, all local links/anchors/assets, contextual WhatsApp, client demo and pending states, modal dates and fixed inclusions, JavaScript and noindex.`);
