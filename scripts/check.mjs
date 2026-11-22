import {readFile,access,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {departuresFor, departureMessage, levelLabel, isFull} from './trip-model.mjs';
import {execFileSync} from 'node:child_process';
import {renderTrip} from './render-trips.mjs';
import {renderRegistration} from './render-registration.mjs';
import {brevoConfig, registrationDepartures} from './brevo.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {renderHomeTrips} from './render-home-trips.mjs';
import {legalRoutes} from './legal.mjs';
import {applyStructuredData} from './structured-data.mjs';
import {llmsTxt} from './llms.mjs';
import {TRIP_BUNDLE, tripBundle} from './trip-styles.mjs';
import {siteConfig, pageMeta, applySiteMeta, robotsTxt, sitemapXml, routeOf} from './site-meta.mjs';
const site=siteConfig();
const root=path.resolve(process.argv.find(a=>a.startsWith('--dir='))?.slice(6)??'dist');
const args=process.argv.slice(2);
if(args.some(a=>!a.startsWith('--dir=')))throw Error('Uso: check.mjs [--dir=/ruta/local]');
const snapshot=JSON.parse(await readFile(path.join(root,'catalog-snapshot.json'),'utf8'));
if(snapshot.source!=='sanity-published')throw Error('El catálogo debe proceder de Sanity publicado');
const trips=snapshot.trips;
const errors=[];
execFileSync(process.execPath,['--check',root+'/registration.js']);
execFileSync(process.execPath,['--check',root+'/app.js']);
execFileSync(process.execPath,['--check',root+'/home.js']);
execFileSync(process.execPath,['--check',root+'/trip.js']);
execFileSync(process.execPath,['--check',root+'/levels.js']);
execFileSync(process.execPath,['--check',root+'/catalog.js']);
execFileSync(process.execPath,['--check',root+'/catalog-filter.js']);
for(const [file,render] of [['index.html',renderHomeTrips],['viajes/index.html',renderCatalog],['niveles/index.html',renderLevelTrips]]){
 const current=await readFile(path.join(root,file),'utf8');
 if(render(current,trips)!==current)errors.push(`Generated view out of date: ${file}`);
}
for(const t of trips)for(const slug of [t.slug,...(t.aliases??[])]){const current=await readFile(path.join(root,'viajes',slug,'index.html'),'utf8');const route=`/viajes/${slug}/`,meta=pageMeta(route,trips,site);if(current!==applyStructuredData(applySiteMeta(renderTrip(t,trips),meta,site),route,trips,site,{public:meta.canonical===route}))errors.push(`Trip page out of date: ${slug}`);}
for(const t of trips)for(const slug of [t.slug,...(t.aliases??[])]){const file=path.join(root,'inscripciones',slug,'index.html');const html=await readFile(file,'utf8');if(html!==applySiteMeta(renderRegistration(t,slug),pageMeta(`/inscripciones/${slug}/`,trips,site),site))errors.push(`Registration page out of date: ${slug}`);if(registrationDepartures(t).length&&!html.includes(`action="${brevoConfig.action}"`))errors.push(`Brevo endpoint missing: ${slug}`);}
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const files=await walk(root);
const pages=new Map();
for(const file of files.filter(f=>f.endsWith('.html'))){
 const html=await readFile(file,'utf8');const matches=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const ids=new Set(matches);if(ids.size!==matches.length)errors.push(`Duplicate IDs: ${file}`);
 pages.set(file,{html,ids});
 if(!file.startsWith(path.join(root,'inscripciones')+path.sep)&&!/<header[^>]*>[\s\S]*?href="\/niveles\/"[\s\S]*?<\/header>/.test(html))errors.push(`Missing level guide in header: ${file}`);
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`Expected one page heading: ${file}`);
 for(const route of legalRoutes)if(!html.includes(`href="${route}"`))errors.push(`Missing legal link ${route}: ${file}`);
 if(site.indexable&&html.includes('[PENDIENTE'))errors.push(`Pending legal text cannot be published as indexable: ${file}`);
 if(applySiteMeta(html,pageMeta(routeOf(path.relative(root,file)),trips,site),site)!==html)errors.push(`Robots/canonical out of date for this deployment: ${file}`);
 {const route=routeOf(path.relative(root,file)),meta=pageMeta(route,trips,site),ld=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  if(meta.canonical===route){if(!ld)errors.push(`Missing structured data: ${file}`);else{try{const data=JSON.parse(ld[1]);if(!data['@graph']?.some(n=>n['@type']==='Organization'))errors.push(`Structured data without organization: ${file}`);}catch{errors.push(`Invalid structured data: ${file}`);}}if(!/<meta property="og:image" content="https:/.test(html))errors.push(`Missing og:image: ${file}`);
   // Hand-written pages only (trip names come from the CMS): longer texts are cut in search results.
   if(!/^\/viajes\/[^/]+\/$/.test(route)){const pageTitle=/<title>([^<]*)<\/title>/.exec(html)?.[1]??'',pageDescription=/<meta name="description" content="([^"]*)"/.exec(html)?.[1]??'';if(pageTitle.length>60)errors.push(`Title over 60 characters (${pageTitle.length}): ${file}`);if(pageDescription.length>160)errors.push(`Description over 160 characters (${pageDescription.length}): ${file}`);}}
  else if(ld)errors.push(`Structured data on a non-canonical page: ${file}`);}
 if((!file.startsWith(path.join(root,'inscripciones')+path.sep)&&/<form\b|type="email"/.test(html))||/mailto:|data-details=/.test(html))errors.push(`Legacy form or modal trip action: ${file}`);
 const contacts=[...html.matchAll(/data-whatsapp="([^"]+)" href="([^"]+)"/g)];
 if(!contacts.length)errors.push(`Missing contact: ${file}`);
 for(const m of contacts){const u=new URL(m[2]);if(u.origin!=='https://wa.me'||u.pathname!=='/34648189257'||!u.searchParams.get('text'))errors.push(`Invalid WhatsApp: ${file}`);}
}
for(const [file,{html,ids}] of pages){
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const ref=m[1];if(!ref.startsWith('/')&&!ref.startsWith('#')&&!ref.startsWith('?'))continue;
  // Trip PDFs are not files of dist: vercel.json rewrites /descargas/* to the PDF host (scripts/vercel-rewrites.test.mjs pins it).
  if(ref.startsWith('/descargas/'))continue;
  if(ref.startsWith('?')){const u=new URL(ref,'https://local.test/'+path.relative(root,path.dirname(file)).replaceAll(path.sep,'/')+'/');if(u.hash&&!ids.has(u.hash.slice(1)))errors.push(`Broken local query anchor ${ref}: ${file}`);continue;}
  if(ref.startsWith('#')){if(ref.length>1&&!ids.has(ref.slice(1)))errors.push(`Broken anchor ${ref}: ${file}`);continue;}
  const u=new URL(ref,'https://local.test');let target=path.join(root,decodeURIComponent(u.pathname));
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await access(target);}
  catch{errors.push(`Missing local target ${ref}: ${file}`);continue;}
  if(u.hash&&!pages.get(target)?.ids.has(u.hash.slice(1)))errors.push(`Broken page anchor ${ref}: ${file}`);
 }
}
for(const file of files.filter(f=>f.endsWith('.css'))){const css=await readFile(file,'utf8');for(const m of css.matchAll(/url\(['"]?([^)'" ]+)/g)){if(m[1].startsWith('/'))try{await access(path.join(root,m[1]));}catch{errors.push(`Missing CSS asset ${m[1]}`)}}}
// Crawler files must describe exactly the pages of this deployment.
const publicRoutes=[...pages.keys()].map(file=>routeOf(path.relative(root,file)));
for(const [name,expected] of [[TRIP_BUNDLE,await tripBundle(root)],['robots.txt',robotsTxt(site)],['sitemap.xml',sitemapXml(publicRoutes,trips,site)],['llms.txt',site.indexable?llmsTxt(trips,site):null]]){
 const current=await readFile(path.join(root,name),'utf8').catch(()=>null);
 if(current!==expected)errors.push(`${name} missing or out of date for this deployment`);
}
// Route expectations grow with trip data; retain all per-page checks above.
const routes=['/', '/niveles/', '/conocenos/', '/viajes/', '/preguntas-frecuentes/', ...legalRoutes, ...trips.flatMap(t=>[`/viajes/${t.slug}/`,`/inscripciones/${t.slug}/`])];
for(const route of routes){if(!pages.has(path.join(root,route,'index.html')))errors.push(`Missing expected route ${route}`);}
const guide=pages.get(path.join(root,'niveles/index.html'));
if(guide){
 for(const [,href] of guide.html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){if(/^https?:/.test(href)&&!['wa.me','www.instagram.com'].includes(new URL(href).hostname))errors.push(`Guide must not send visitors to an external content page: ${href}`);}
 // The guide is generated from scripts/surf-levels.mjs: levels 1–4, the competition route and every sublevel.
 if(!guide.html.includes('<!-- level-guide:start -->'))errors.push('Missing level guide generation markers');
 for(const level of [1,2,3,4,5])if(!guide.ids.has(`nivel-${level}`)||!guide.html.includes(`href="#nivel-${level}"`))errors.push(`Missing direct level navigation: nivel-${level}`);
 for(const sub of ['1-1','1-2','1-3','2-1','2-2','2-3','3-1','3-2','3-3','4-1','4-2','4-3'])if(!guide.ids.has(`subnivel-${sub}`))errors.push(`Missing sublevel ${sub}`);
 for(const anchor of ['test','orientacion'])if(!guide.ids.has(anchor))errors.push(`Missing level guidance section ${anchor}`);
 if(/Rookies|Aprendices|Supercracks/.test(guide.html))errors.push('Level guide must use the current level names');
 if(!guide.html.includes('href="/viajes/"'))errors.push('Level guide must link to the catalog');
 for(const level of [1,2,3,4])if(!guide.html.includes(`href="/viajes/?nivel=${level}"`))errors.push(`Missing catalog entry for level ${level}`);
 if(!guide.html.includes('src="/app.js"'))errors.push('Level guide must use shared navigation');
}
const about=pages.get(path.join(root,'conocenos/index.html'));
if(about){
 for(const id of ['origen','acompanamiento','respeto'])if(!about.ids.has(id))errors.push(`Missing about section ${id}`);
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
  if(/booking-page-nav|Explora el viaje/.test(page.html))errors.push(`Removed sidebar navigation returned ${t.slug}`);
  if(t.dossier&&!page.html.includes('dossier-link'))errors.push(`Missing booking dossier ${t.slug}`);
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
 if(/salidas? de ejemplo|fechas? de muestra|fechas? ficticias?|MAQUETA/i.test(html))errors.push(`Obsolete sample labels: ${file}`);
 if(/<details class="inclusion-list/.test(html))errors.push(`Inclusions should always remain visible: ${file}`);
}
const faq=pages.get(path.join(root,'preguntas-frecuentes/index.html'));
if(faq){
 for(const id of ['grupo','nivel','preparacion','reserva'])if(!faq.ids.has(id))errors.push(`Missing FAQ topic ${id}`);
 if(/<details[^>]*\bname=/.test(faq.html))errors.push('FAQs must allow multiple open answers');
 if(!faq.html.includes('El mensaje inicia una consulta.'))errors.push('FAQ must distinguish enquiry from confirmation');
 if([...faq.html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].some(m=>!['/app.js','/analytics.js'].includes(m[1])))errors.push('FAQ must not need additional JavaScript');
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
console.log(`PASS: ${pages.size} pages, independent routes, all local links/anchors/assets, contextual WhatsApp, published catalogue, optional data and pending states, modal dates and fixed inclusions, JavaScript, robots/canonical (${site.indexable?'indexable':'noindex'} at ${site.origin}), robots.txt and sitemap.`);
