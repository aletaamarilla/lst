import {readFile,access,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {departuresFor, departureMessage, levelLabel} from './trip-model.mjs';
import {execFileSync} from 'node:child_process';
import {renderTrip} from './render-trips.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {renderHomeTrips} from './render-home-trips.mjs';
const root=path.resolve(process.argv.find(a=>a.startsWith('--dir='))?.slice(6)??'dist');
const demo=process.argv.includes('--demo');
const trips=demo?JSON.parse(await readFile('data/trips.json','utf8')):JSON.parse(await readFile(path.join(root,'catalog-snapshot.json'),'utf8')).trips;
const errors=[];
execFileSync(process.execPath,['--check',root+'/app.js']);
execFileSync(process.execPath,['--check',root+'/trip.js']);
execFileSync(process.execPath,['--check',root+'/levels.js']);
execFileSync(process.execPath,['--check',root+'/catalog.js']);
execFileSync(process.execPath,['--check',root+'/catalog-filter.js']);
for(const [file,render] of [['index.html',renderHomeTrips],['viajes/index.html',renderCatalog],['niveles/index.html',renderLevelTrips]]){
 const current=await readFile(path.join(root,file),'utf8');
 if(render(current,trips)!==current)errors.push(`Generated view out of date: ${file}`);
}
for(const t of trips){const current=await readFile(path.join(root,'viajes',t.slug,'index.html'),'utf8');if(current!==renderTrip(t,trips))errors.push(`Trip page out of date: ${t.slug}`);}
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const files=await walk(root);
const pages=new Map();
for(const file of files.filter(f=>f.endsWith('.html'))){
 const html=await readFile(file,'utf8');const matches=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const ids=new Set(matches);if(ids.size!==matches.length)errors.push(`Duplicate IDs: ${file}`);
 pages.set(file,{html,ids});
 if(!/<header[^>]*>[\s\S]*?href="\/niveles\/"[\s\S]*?<\/header>/.test(html))errors.push(`Missing level guide in header: ${file}`);
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`Expected one page heading: ${file}`);
 if(!html.includes('noindex,nofollow'))errors.push(`Prototype noindex missing: ${file}`);
 if(/<form\b|type="email"|mailto:|data-details=/.test(html))errors.push(`Legacy form or modal trip action: ${file}`);
 const contacts=[...html.matchAll(/data-whatsapp="([^"]+)" href="([^"]+)"/g)];
 if(!contacts.length)errors.push(`Missing contact: ${file}`);
 for(const m of contacts){const u=new URL(m[2]);if(u.origin!=='https://wa.me'||u.pathname!=='/34648189257'||!u.searchParams.get('text'))errors.push(`Invalid WhatsApp: ${file}`);}
}
for(const [file,{html,ids}] of pages){
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const ref=m[1];if(!ref.startsWith('/')&&!ref.startsWith('#')&&!ref.startsWith('?'))continue;
  if(ref.startsWith('?')){const u=new URL(ref,'https://local.test/'+path.relative(root,path.dirname(file)).replaceAll(path.sep,'/')+'/');if(u.hash&&!ids.has(u.hash.slice(1)))errors.push(`Broken local query anchor ${ref}: ${file}`);continue;}
  if(ref.startsWith('#')){if(ref.length>1&&!ids.has(ref.slice(1)))errors.push(`Broken anchor ${ref}: ${file}`);continue;}
  const u=new URL(ref,'https://local.test');let target=path.join(root,decodeURIComponent(u.pathname));
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await access(target);}
  catch{errors.push(`Missing local target ${ref}: ${file}`);continue;}
  if(u.hash&&!pages.get(target)?.ids.has(u.hash.slice(1)))errors.push(`Broken page anchor ${ref}: ${file}`);
 }
}
for(const file of files.filter(f=>f.endsWith('.css'))){const css=await readFile(file,'utf8');for(const m of css.matchAll(/url\(['"]?([^)'" ]+)/g)){if(m[1].startsWith('/'))try{await access(path.join(root,m[1]));}catch{errors.push(`Missing CSS asset ${m[1]}`)}}}
// Route expectations grow with trip data; retain all per-page checks above.
const routes=['/', '/niveles/', '/conocenos/', '/viajes/', '/preguntas-frecuentes/', ...trips.map(t=>`/viajes/${t.slug}/`)];
for(const route of routes){if(!pages.has(path.join(root,route,'index.html')))errors.push(`Missing expected route ${route}`);}
const guide=pages.get(path.join(root,'niveles/index.html'));
if(guide){
 for(const [,href] of guide.html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){if(/^https?:/.test(href)&&new URL(href).hostname!=='wa.me')errors.push(`Guide must not send visitors to an external content page: ${href}`);}
 for(const level of ['rookies','aprendices','riders','supercracks']){
  if(!guide.ids.has(level)||!guide.html.includes(`href="#${level}"`))errors.push(`Missing direct level navigation: ${level}`);
 }
 if(/role="tablist"|<input\b|<select\b/.test(guide.html))errors.push('Level guide must remain static and directly readable');
 for(const anchor of ['autonomia','orientacion'])if(!guide.ids.has(anchor))errors.push(`Missing level guidance section ${anchor}`);
 if(!guide.html.includes('href="/viajes/"'))errors.push('Level guide must link to the catalog');
 for(const level of [1,2,3,4])if(!guide.html.includes(`href="/viajes/?nivel=${level}"`))errors.push(`Missing catalog entry for level ${level}`);
 if(!guide.html.includes('src="/app.js"'))errors.push('Level guide must use shared navigation');
}
const about=pages.get(path.join(root,'conocenos/index.html'));
if(about){
 for(const id of ['origen','asi-viajamos','acompanamiento','respeto'])if(!about.ids.has(id))errors.push(`Missing about section ${id}`);
 if(!about.html.includes('src="/app.js"')||!about.html.includes('Nos vemos en el pico.'))errors.push('About must preserve shared navigation and Lucas signature');
 if(/Universal Plastic|3\s*%|recogida de plásticos/i.test(about.html.replace(/<[^>]+>/g,'')))errors.push('Environmental actions must remain pending current evidence');
 for(const [,href] of about.html.matchAll(/<a\b[^>]*href="([^"]+)"/g))if(/^https?:/.test(href)&&!['wa.me','www.instagram.com'].includes(new URL(href).hostname))errors.push(`About must not link to legacy content: ${href}`);
}
const home=pages.get(path.join(root,'index.html')).html;
if(!/<section class="people"[\s\S]*?href="\/conocenos\/"[\s\S]*?<\/section>/.test(home))errors.push('Home introduction must link to Conócenos');
if(!home.includes('href="/niveles/"')||!home.includes('id="niveles"'))errors.push('Keep the home summary and link to the level guide');
for(const t of trips){
 if(!home.includes(`href="/viajes/${t.slug}/"`))errors.push(`Home missing trip route ${t.slug}`);
 const page=pages.get(path.join(root,'viajes',t.slug,'index.html'));
 if(page){
  if(!page.html.includes('href="/conocenos/#acompanamiento"'))errors.push(`Missing LST accompaniment link ${t.slug}`);
  if(!page.html.includes('href="/niveles/"'))errors.push(`Missing internal level guide ${t.slug}`);
  if(!page.html.includes(levelLabel(t)))errors.push(`Missing configured level ${t.slug}`);
  if(page.html.includes('trip-section-nav')||page.html.includes('Leer el programa completo'))errors.push(`Old detail navigation or dossier position ${t.slug}`);
  if(t.dossier&&!page.html.includes('Descargar dossier'))errors.push(`Missing booking dossier ${t.slug}`);
  const departures=departuresFor(t);
  if(departures.length>1){
   if(!page.html.includes('id="departure-dialog"')||page.html.includes('data-date-picker'))errors.push(`Date popup missing or old inline dates ${t.slug}`);
   for(const d of departures){
    const links=[...page.html.matchAll(/data-whatsapp="[^"]+" href="([^"]+)" data-departure="([^"]+)"/g)].filter(m=>m[2]===d.id);
    if(!t.booking?.applicationUrl&&(links.length!==1||links.some(m=>new URL(m[1]).searchParams.get('text')!==departureMessage(t,d))))errors.push(`Incorrect dated enquiry ${t.slug}/${d.id}`);
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
if(trips.some(t=>t.state==='confirmed'&&!t.cms&&!t.source&&!t.demoData?.clientPresentation))errors.push('Commercial data needs a verified source or an explicit internal demo record');
const faq=pages.get(path.join(root,'preguntas-frecuentes/index.html'));
if(faq){
 for(const id of ['grupo','nivel','preparacion','reserva'])if(!faq.ids.has(id))errors.push(`Missing FAQ topic ${id}`);
 if(/<details[^>]*\bname=/.test(faq.html))errors.push('FAQs must allow multiple open answers');
 if(!faq.html.includes('El mensaje inicia una consulta.'))errors.push('FAQ must distinguish enquiry from confirmation');
 if([...faq.html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].some(m=>m[1]!=='/app.js'))errors.push('FAQ must not need additional JavaScript');
}
for(const route of ['/niveles/','/conocenos/','/viajes/','/preguntas-frecuentes/']){
 const html=pages.get(path.join(root,route,'index.html'))?.html??'';
 const header=html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0]??'';
 for(const link of ['/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/'])if(!header.includes(`href="${link}"`))errors.push(`Missing primary link ${link} on ${route}`);
 if(!html.includes('aria-label="Navegación sin JavaScript"'))errors.push(`Missing native navigation fallback on ${route}`);
}
const homeFaq=home.match(/<section class="faq\b[\s\S]*?<\/section>/)?.[0]??'';
if(!homeFaq.includes('href="/preguntas-frecuentes/"')||(homeFaq.match(/<details>/g)??[]).length>3)errors.push('Keep a short home FAQ summary with a link to all questions');
if(errors.length)throw Error(errors.join('\n'));
console.log(`PASS: ${pages.size} pages, independent routes, all local links/anchors/assets, contextual WhatsApp, published catalogue, optional data and pending states, modal dates and fixed inclusions, JavaScript and noindex.`);
