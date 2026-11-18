// Optional real-browser coverage of the level guide (/niveles/): level tabs,
// sublevel ladder and cards, the quick test, trips by level and integrations.
// Uses an existing browser installation; no dependency added.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {levelsFor} from './trip-model.mjs';
import {SURF_LEVELS, SUBLEVELS, COMPETITION, LEVEL_TEST} from './surf-levels.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||path.join(os.tmpdir(),'lst-levels-verification');
fs.mkdirSync(path.join(out,'capturas'),{recursive:true});
const trips=JSON.parse(fs.readFileSync('dist/catalog-snapshot.json')).trips;
const hasPending=trips.some(t=>t.state==='upcoming');
const steps=[...SUBLEVELS.map(s=>s.c),...COMPETITION.subs.map(s=>s.c)];
const report={checks:[],issues:[],errors:[],whatsapp:[],routes:['/niveles/',...trips.map(t=>`/viajes/${t.slug}/`)]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
async function context(options){
 const c=await browser.newContext({reducedMotion:'reduce',...options});
 await c.route('https://**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.sanity.io'){await r.continue();}else if(['wa.me','chat.whatsapp.com','www.instagram.com'].includes(u.hostname)){report.whatsapp.push(u.href);await r.fulfill({contentType:'text/plain',body:'Enlace interceptado localmente; no se envía ningún mensaje.'});}else await r.abort();});
 c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
 return c;
}
const enlarge=async(p,zoom)=>{if(zoom===2){await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});await p.waitForTimeout(80);}};
const geometry=async(p,selector)=>p.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,header:document.querySelector('.site-header').getBoundingClientRect().bottom};});
const visiblePanels=p=>p.locator('[data-level-panel]').evaluateAll(els=>els.filter(e=>!e.hidden).map(e=>e.dataset.levelPanel));
const shownTrips=p=>p.locator('.guide-trip-card:visible').evaluateAll(els=>els.map(e=>e.querySelector('.home-trip-link').pathname.split('/')[2]).sort());
const datedFor=level=>trips.filter(t=>t.state==='confirmed'&&levelsFor(t).includes(level)).map(t=>t.slug).sort();
const answer=async(p,yes)=>p.locator(`[data-level-test] [data-answer="${yes?'yes':'no'}"]`).click();
try{
 for(const [width,height,zoom] of [[320,740,1],[390,844,1],[768,1024,1],[1024,900,1],[1440,900,1],[390,360,1],[320,740,2],[390,844,2],[1440,900,2]]){
  const tag=`${width}x${height}-text${zoom*100}`;
  const c=await context({viewport:{width,height}}),p=await c.newPage();
  check(tag+' HTTP',(await p.goto(base+'/niveles/')).status()===200);
  await p.evaluate(()=>document.fonts.ready);
  await enlarge(p,zoom);
  check(tag+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check(tag+' fixed header',await p.locator('.site-header').evaluate(e=>getComputedStyle(e).position==='fixed'));
  const title=await geometry(p,'#guide-title');check(tag+' title below header',title.top>=title.header,title);
  const external=await p.locator('main a[href^="http"]').evaluateAll(links=>links.map(a=>a.href).filter(href=>!['wa.me','www.instagram.com'].includes(new URL(href).hostname)));
  check(tag+' no legacy or external content links',external.length===0,external);
  check(tag+' three phases',await p.locator('.lv-phase').count()===3);
  check(tag+' five level tabs',await p.locator('[data-level-tab]:visible').count()===5);
  check(tag+' one level panel at a time',JSON.stringify(await visiblePanels(p))==='["1"]',await visiblePanels(p));
  check(tag+' ladder lists every sublevel',JSON.stringify(await p.locator('[data-step]').evaluateAll(els=>els.map(e=>e.dataset.step)))===JSON.stringify(steps));
  check(tag+' one shared help block',await p.locator('[data-guide-enquiry]').count()===1);
  if(hasPending)check(tag+' pending destinations initially folded',await p.locator('.guide-trip-pending').evaluate(e=>!e.open));
  if(zoom===1&&[390,1440].includes(width)&&height>500){
   for(const img of await p.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>new Promise((resolve,reject)=>{if(e.complete)return e.naturalWidth?resolve():reject(Error('Image failed: '+e.src));e.addEventListener('load',resolve,{once:true});e.addEventListener('error',()=>reject(Error('Image failed: '+e.src)),{once:true});}));}
   check(tag+' photographs loaded',await p.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)));
   await p.evaluate(()=>scrollTo(0,0));
   await p.screenshot({path:path.join(out,'capturas',`niveles-${width}-portada.png`)});
   await p.screenshot({path:path.join(out,'capturas',`niveles-${width}-completa.png`),fullPage:true});
  }
  // Level tabs: one panel, its URL and its trips.
  for(const level of [...SURF_LEVELS.map(l=>l.n),5]){
   await p.locator(`[data-level-tab="${level}"]`).click();
   check(tag+' tab shows level '+level,JSON.stringify(await visiblePanels(p))===JSON.stringify([String(level)]));
   check(tag+' tab current '+level,await p.locator(`[data-level-tab="${level}"]`).getAttribute('aria-current')==='true');
   check(tag+' tab URL '+level,new URL(p.url()).hash==='#nivel-'+level&&new URL(p.url()).searchParams.get('nivel')===(level<=4?String(level):null),p.url());
   if(level<=4)check(tag+' tab filters trips '+level,JSON.stringify(await shownTrips(p))===JSON.stringify(datedFor(level)));
   const tab=await p.locator(`[data-level-tab="${level}"]`).evaluate(e=>{const r=e.getBoundingClientRect();return {height:r.height,clipped:e.scrollWidth>e.clientWidth+1};});
   check(tag+' tab touch target '+level,tab.height>=44&&!tab.clipped,tab);
   const head=await geometry(p,`#nivel-${level}`);check(tag+' level head below header '+level,head.top>=head.header-1,head);
  }
  // Ladder: opens and reveals the sublevel card.
  await p.locator('[data-step="2.3"]').click();
  check(tag+' ladder opens sublevel',await p.locator('#subnivel-2-3').evaluate(e=>e.open)&&JSON.stringify(await visiblePanels(p))==='["2"]');
  check(tag+' ladder URL',new URL(p.url()).hash==='#subnivel-2-3');
  const summary=await p.locator('#subnivel-2-3 summary').evaluate(e=>({upright:[...e.children].every(c=>getComputedStyle(c).transform==='none'),top:e.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom}));
  check(tag+' sublevel heading upright and below header',summary.upright&&summary.top>=summary.header-1,summary);
  for(const box of await p.locator('#subnivel-2-3 [data-can]').all())await box.check();
  check(tag+' all «Ya hace» suggests next sublevel',await p.locator('#subnivel-2-3 [data-can-hint]').isVisible());
  await p.locator('#subnivel-2-3 [data-can]').first().uncheck();
  check(tag+' hint hides again',await p.locator('#subnivel-2-3 [data-can-hint]').isHidden());
  // Quick test: five «Sí» then «Todavía no» places the visitor in 2.2.
  await p.locator('#test').scrollIntoViewIfNeeded();
  check(tag+' test first question',(await p.locator('.lv-q-count').innerText()).includes(`1 de ${LEVEL_TEST.length}`));
  await answer(p,true);await answer(p,false);await p.locator('[data-level-test] [data-back]').click();
  check(tag+' test back keeps answers',(await p.locator('.lv-q-count').innerText()).startsWith('Pregunta 2'));
  for(let i=0;i<4;i++)await answer(p,true);
  await answer(p,false);
  check(tag+' test result 2.2',await p.locator('.lv-result-code').innerText()==='2.2'&&(await p.locator('.lv-result h3').innerText())==='Cambio de tabla');
  check(tag+' result stored',await p.evaluate(()=>localStorage.getItem('lstLevel'))==='2.2');
  check(tag+' ladder marks result',await p.locator('[data-step="2.2"]').evaluate(e=>e.classList.contains('is-mine')));
  const actions=await p.locator('.lv-result-actions :is(a,button)').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),height:r.height,clipped:e.scrollWidth>e.clientWidth+1};}));
  check(tag+' result actions fit',actions.every(a=>a.height>=44&&!a.clipped),actions);
  await p.locator('[data-level-test] [data-trips]').click();
  check(tag+' result filters trips',JSON.stringify(await shownTrips(p))===JSON.stringify(datedFor(2))&&new URL(p.url()).searchParams.get('nivel')==='2');
  const message=new URL(await p.locator('[data-guide-enquiry]').getAttribute('href')).searchParams.get('text');
  check(tag+' enquiry carries the result',message.includes('2.2')&&message.includes('autonomía'),message);
  await p.locator('[data-level-test] [data-see]').click();
  check(tag+' result opens its sublevel',await p.locator('#subnivel-2-2').evaluate(e=>e.open));
  await p.locator('[data-level-test] [data-yes]').click();
  check(tag+' agreeing shows the community',await p.locator('[data-level-test] [data-thanks] a[href^="https://chat.whatsapp.com/"]').isVisible());
  // Disagreeing lets the visitor choose a sublevel by hand.
  await p.locator('[data-level-test] [data-restart]').first().click();
  for(let i=0;i<3;i++)await answer(p,true);
  await answer(p,false);
  check(tag+' second result 1.3',await p.locator('.lv-result-code').innerText()==='1.3');
  await p.locator('[data-level-test] [data-no]').click();await p.locator('[data-level-test] [data-choose-open]').click();
  check(tag+' choose mode',await p.locator('[data-pickbar]').isVisible());
  await p.locator('[data-level-tab="3"]').click();await p.locator('#subnivel-3-1 summary').click();await p.locator('[data-choose="3.1"]').click();
  check(tag+' chosen level',await p.locator('.lv-result-code').innerText()==='3.1'&&await p.locator('[data-pickbar]').isHidden()&&await p.locator('[data-choose="3.1"]').isHidden());
  await p.reload();await p.evaluate(()=>document.fonts.ready);
  check(tag+' reload restores result',await p.locator('.lv-result-code').innerText()==='3.1'&&await p.locator('[data-step="3.1"]').evaluate(e=>e.classList.contains('is-mine')));
  await p.evaluate(()=>localStorage.clear());
  // Trips filters.
  for(const {n,name} of SURF_LEVELS){
   await p.locator(`[data-guide-filter="${n}"]`).click();
   check(tag+' travel context '+n,new URL(p.url()).searchParams.get('nivel')===String(n)&&new URL(p.url()).hash==='#viajes-por-nivel');
   check(tag+' prioritises dated trips '+n,JSON.stringify(await shownTrips(p))===JSON.stringify(datedFor(n)));
   const pendingCount=trips.filter(t=>t.state==='upcoming'&&levelsFor(t).includes(n)).length;
   if(hasPending)check(tag+' pending matching count '+n,await p.locator('[data-guide-pending-count]').innerText()===String(pendingCount));
   check(tag+' selected enquiry '+n,new URL(await p.locator('[data-guide-enquiry]').getAttribute('href')).searchParams.get('text').includes(name));
  }
  await p.locator('[data-guide-filter=""]').click();
  check(tag+' all shows dated trips',await p.locator('.guide-trip-card:visible').count()===trips.filter(t=>t.state==='confirmed').length);
  await p.goto(base+'/niveles/');await p.evaluate(()=>document.fonts.ready);await enlarge(p,zoom);
  check(tag+' mobile/direct levels access',await p.locator(width<1000?'.header-levels':'#main-nav a[href="/niveles/"]').isVisible());
  await p.locator('.skip-link').focus();await p.keyboard.press('Enter');
  check(tag+' skip link',await p.evaluate(()=>document.activeElement.id==='contenido'));
  for(let n=0;n<60;n++){
   await p.keyboard.press('Tab');
   const focus=await p.evaluate(()=>{const e=document.activeElement;if(e===document.body||e.closest('.site-header'))return null;const r=e.getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect().bottom;return {text:e.textContent.trim().slice(0,65),top:r.top,bottom:r.bottom,header:h,visible:r.top>=h-1&&r.bottom<=innerHeight+1};});
   if(focus)check(tag+' keyboard focus visible',focus.visible,focus);
  }
  await p.locator('.guide-next a').click();
  await p.locator('[data-catalog-filters]').waitFor({state:'visible'});
  check(tag+' explore full catalog',new URL(p.url()).pathname==='/viajes/'&&await p.locator('[data-catalog-trip]:visible').count()===trips.length);
  await c.close();
 }
 // Direct and legacy URLs.
 {
  const c=await context({viewport:{width:390,height:844}}),p=await c.newPage();
  await p.goto(base+'/niveles/#nivel-4');check('direct level URL',JSON.stringify(await visiblePanels(p))==='["4"]');
  await p.goto(base+'/niveles/#subnivel-3-2');check('direct sublevel URL',await p.locator('#subnivel-3-2').evaluate(e=>e.open)&&JSON.stringify(await visiblePanels(p))==='["3"]');
  await p.goto(base+'/niveles/#riders');check('legacy anchor opens level 3',JSON.stringify(await visiblePanels(p))==='["3"]'&&new URL(p.url()).hash==='#nivel-3');
  await p.goto(base+'/niveles/?nivel=aprendices#viajes-por-nivel');check('legacy travel filter',await p.locator('[data-guide-filter="2"]').getAttribute('aria-pressed')==='true');
  await p.goto(base+'/niveles/');await p.locator('[data-guide-filter="1"]').click();await p.locator('[data-guide-filter="3"]').click();
  await p.reload();check('reload restores travel level',await p.locator('[data-guide-filter="3"]').getAttribute('aria-pressed')==='true');
  await p.goBack();check('back restores level 1 trips',await p.locator('[data-guide-filter="1"]').getAttribute('aria-pressed')==='true');
  await p.goForward();check('forward restores level 3 trips',await p.locator('[data-guide-filter="3"]').getAttribute('aria-pressed')==='true');
  await c.close();
 }
 // Every trip page links to the guide.
 for(const width of [390,1440]){
  const c=await context({viewport:{width,height:900}}),p=await c.newPage();
  for(const trip of trips){await p.goto(base+`/viajes/${trip.slug}/`);check(width+' '+trip.slug+' header has levels',await p.locator('.trip-header a[href="/niveles/"]').isVisible());await p.locator('.trip-level a[href="/niveles/"]').click();check(width+' '+trip.slug+' to guide',new URL(p.url()).pathname==='/niveles/');}
  await c.close();
 }
 // Without JavaScript the whole guide stays readable.
 const c=await context({viewport:{width:390,height:844},javaScriptEnabled:false}),p=await c.newPage();
 await p.goto(base+'/niveles/');
 check('all levels without JS',await p.locator('.lv-level:visible').count()===5);
 check('every sublevel without JS',await p.locator('.lv-sub').count()===SUBLEVELS.length);
 await p.locator('[data-step="3.3"]').click();check('native ladder anchor without JS',new URL(p.url()).hash==='#subnivel-3-3');
 await p.locator('#subnivel-3-3 summary').click();check('native disclosure without JS',await p.locator('#subnivel-3-3').evaluate(e=>e.open));
 check('test explains it needs JS',(await p.locator('[data-level-test]').innerText()).includes('JavaScript'));
 if(hasPending){await p.locator('.guide-trip-pending summary').focus();await p.keyboard.press('Enter');}
 check('travel links without JS',await p.locator('.guide-trip-card:visible').count()===trips.length);
 check('contact without JS',await p.locator('#orientacion [data-whatsapp]').getAttribute('href')!==null);
 await c.close();
 for(const href of report.whatsapp){const u=new URL(href);if(u.hostname==='wa.me')check('WhatsApp destination',u.pathname==='/34648189257'&&!!u.searchParams.get('text'));}
 check('guide script has no page errors',report.errors.length===0,report.errors);
} finally {await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,errors:report.errors,whatsapp:report.whatsapp.length},null,2));
if(report.issues.length)process.exitCode=1;
