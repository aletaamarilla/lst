// Optional real-browser coverage of the guide and every home/trip integration.
// Uses the existing browser installation, like check-ux.mjs; no dependency added.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {levelsFor} from './trip-model.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||path.join(os.tmpdir(),'lst-levels-verification');
fs.mkdirSync(path.join(out,'capturas'),{recursive:true});
const trips=JSON.parse(fs.readFileSync('data/trips.json'));
const slugs=['rookies','aprendices','riders','supercracks'];
const report={checks:[],issues:[],errors:[],whatsapp:[],routes:['/','/niveles/',...trips.map(t=>`/viajes/${t.slug}/`)]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
async function context(options){
 const c=await browser.newContext({reducedMotion:'reduce',...options});
 await c.route('https://**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='wa.me'){report.whatsapp.push(u.href);await r.fulfill({contentType:'text/plain',body:'Consulta interceptada localmente; no se envía ningún mensaje.'});}else await r.abort();});
 c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
 return c;
}
const enlarge=async(p,zoom)=>{if(zoom===2){await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});await p.waitForTimeout(80);}};
const geometry=async(p,selector)=>p.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,header:document.querySelector('.site-header').getBoundingClientRect().bottom};});
try{
 for(const [width,height,zoom] of [[320,740,1],[390,844,1],[768,1024,1],[1024,900,1],[1440,900,1],[320,320,1],[390,360,1],[320,740,2],[390,844,2],[768,1024,2],[1024,900,2],[1440,900,2]]){
  const tag=`${width}x${height}-text${zoom*100}`;
  const c=await context({viewport:{width,height}}),p=await c.newPage();
  check(tag+' HTTP',(await p.goto(base+'/niveles/')).status()===200);
  await p.evaluate(()=>document.fonts.ready);
  await enlarge(p,zoom);
  await p.waitForTimeout(80);
  check(tag+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check(tag+' four levels visible without tabs',(await p.locator('.guide-level:visible').count())===4);
  check(tag+' fixed header',await p.locator('.site-header').evaluate(e=>getComputedStyle(e).position==='fixed'));
  const title=await geometry(p,'#guide-title');check(tag+' title below header',title.top>=title.header,title);
  const external=await p.locator('main a[href^="http"]').evaluateAll(links=>links.map(a=>a.href).filter(href=>new URL(href).hostname!=='wa.me'));
  check(tag+' no legacy or external content links',external.length===0,external);
  check(tag+' level numerals stay on one line',await p.locator('.guide-index-number').evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height<=parseFloat(getComputedStyle(e).lineHeight)+1)));
  check(tag+' one shared help block',await p.locator('[data-guide-enquiry]').count()===1&&await p.locator('.guide-trips-help').count()===0);
  check(tag+' pending destinations initially folded',await p.locator('.guide-trip-pending').evaluate(e=>!e.open));
  if(zoom===1&&[390,1440].includes(width)&&height>500){
   await p.locator('.guide-trip-pending summary').click();
   for(const img of await p.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>new Promise((resolve,reject)=>{if(e.complete)return e.naturalWidth?resolve():reject(Error('Image failed: '+e.src));e.addEventListener('load',resolve,{once:true});e.addEventListener('error',()=>reject(Error('Image failed: '+e.src)),{once:true});}));}await p.locator('.guide-trip-pending summary').click();await p.evaluate(()=>scrollTo(0,0));
   check(tag+' photographs loaded',await p.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)));
   await p.screenshot({path:path.join(out,'capturas',`niveles-${width}-portada.png`)});
   await p.screenshot({path:path.join(out,'capturas',`niveles-${width}-completa.png`),fullPage:true});
  }
  for(const slug of slugs){
   await p.locator(`.guide-index a[href="#${slug}"]`).click();
   const rect=await geometry(p,`#${slug}`);check(tag+' anchor '+slug,rect.top>=rect.header-1&&rect.top<=rect.header+20,rect);
   await p.waitForFunction(s=>document.getElementById(s).classList.contains('is-arriving'),slug);
   check(tag+' brief arrival cue '+slug,await p.locator('.guide-level.is-arriving').evaluateAll((els,slug)=>els.length===1&&els[0].id===slug,slug));
   await p.waitForFunction(()=>!document.querySelector('.guide-level.is-arriving'));
   check(tag+' highlight expires '+slug,await p.locator(`#${slug}`).evaluate(e=>getComputedStyle(e).borderLeftColor!=='rgb(234, 89, 52)'&&getComputedStyle(e.querySelector('.guide-level-heading')).backgroundColor==='rgb(27, 27, 27)'));
   const actions=await p.locator(`#${slug} .guide-level-actions a`).evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,scroll:e.scrollWidth,client:e.clientWidth,label:e.getAttribute('aria-label')};}));
   check(tag+' compact card actions '+slug,actions.length===2&&actions.every(a=>a.height>=44&&a.scroll<=a.client&&a.label),actions);
   if(zoom===1)check(tag+' card actions on one row '+slug,Math.abs(actions[0].top-actions[1].top)<1&&actions[0].right<actions[1].left,actions);
   check(tag+' selected index '+slug,await p.locator('.guide-index [aria-current=location]').getAttribute('href')==='#'+slug);
   check(tag+' anchor focus '+slug,await p.evaluate(s=>document.activeElement.id===s,slug));
  }
  for(const [index,slug] of slugs.entries()){
   await p.locator(`#${slug} .guide-level-cta`).click();
   check(tag+' travel context '+slug,new URL(p.url()).searchParams.get('nivel')===slug&&new URL(p.url()).hash==='#viajes-por-nivel');
   const expectedDated=trips.filter(t=>t.state==='confirmed'&&levelsFor(t).includes(index+1)).map(t=>t.slug).sort();
   const datedShown=await p.locator('.guide-trip-card:visible').evaluateAll(els=>els.map(e=>e.pathname.split('/')[2]).sort());
   check(tag+' prioritises dated trips '+slug,JSON.stringify(datedShown)===JSON.stringify(expectedDated),{datedShown,expectedDated});
   const pendingCount=trips.filter(t=>t.state==='upcoming'&&levelsFor(t).includes(index+1)).length;
   check(tag+' pending matching count '+slug,await p.locator('[data-guide-pending-count]').innerText()===String(pendingCount));
   await p.locator('.guide-trip-pending summary').focus();await p.keyboard.press('Enter');
   check(tag+' pending opens with keyboard '+slug,await p.locator('.guide-trip-pending').evaluate(e=>e.open));
   const disclosure=await p.locator('.guide-trip-pending').evaluate(e=>{const summary=e.querySelector('summary'),r=summary.getBoundingClientRect(),title=summary.firstElementChild.getBoundingClientRect(),intro=e.querySelector('.guide-pending-intro').getBoundingClientRect();return {upright:[...summary.children].slice(0,2).every(e=>getComputedStyle(e).transform==='none'),contained:title.top>=r.top&&title.bottom<=r.bottom&&title.left>=r.left&&title.right<=r.right,introGap:intro.top-r.bottom};});
   check(tag+' disclosure text stays in place '+slug,disclosure.upright&&disclosure.contained&&disclosure.introGap>=0&&disclosure.introGap<24,disclosure);
   const expected=trips.filter(t=>levelsFor(t).includes(index+1)).map(t=>t.slug).sort();
   const shown=await p.locator('.guide-trip-card:visible').evaluateAll(els=>els.map(e=>e.pathname.split('/')[2]).sort());
   check(tag+' configured matching trips '+slug,JSON.stringify(shown)===JSON.stringify(expected),{shown,expected});
   await p.locator('.guide-trip-pending summary').focus();await p.keyboard.press('Space');
   check(tag+' pending closes with keyboard '+slug,await p.locator('.guide-trip-pending').evaluate(e=>!e.open));
   const message=new URL(await p.locator('[data-guide-enquiry]').getAttribute('href')).searchParams.get('text');
   check(tag+' selected enquiry '+slug,message.includes(['Rookies','Aprendices','Riders','Supercracks'][index])&&message.includes('autonomía'));
   const cardContact=p.locator(`#${slug} .guide-level-enquiry`);await cardContact.focus();const contactTab=c.waitForEvent('page');await p.keyboard.press('Enter');const contactPage=await contactTab;await contactPage.waitForLoadState();await contactPage.close();
   check(tag+' card WhatsApp context '+slug,new URL(await cardContact.getAttribute('href')).searchParams.get('text').includes(['Rookies','Aprendices','Riders','Supercracks'][index]));
  }
  await p.locator('[data-guide-filter=""]').click();
  check(tag+' all leaves no highlighted card',await p.locator('.guide-level.is-arriving').count()===0);
  check(tag+' all shows dated trips first',await p.locator('.guide-trip-card:visible').count()===trips.filter(t=>t.state==='confirmed').length);
  await p.locator('.guide-trip-pending summary').click();check(tag+' all pending remain available',await p.locator('.guide-trip-card:visible').count()===trips.length);
  await p.goto(base+'/niveles/#aprendices');await p.evaluate(()=>document.fonts.ready);
  let rect=await geometry(p,'#aprendices');check(`${width}x${height} direct URL anchor at default text size`,rect.top>=rect.header-1,rect);
  await p.goto(base+'/niveles/');await p.evaluate(()=>document.fonts.ready);await enlarge(p,zoom);
  check(tag+' mobile/direct levels access',await p.locator(width<1000?'.header-levels':'#main-nav a[href="/niveles/"]').isVisible());
  if(width<1000){
   await p.locator('.menu-toggle').focus();await p.keyboard.press('Enter');await p.keyboard.press('Tab');
   check(tag+' menu first tab',await p.evaluate(()=>document.activeElement===document.querySelector('#main-nav a')));
   await p.keyboard.press('Escape');check(tag+' Escape returns focus',await p.evaluate(()=>document.activeElement.matches('.menu-toggle')&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'));
   await p.keyboard.press('Enter');await p.locator('.nav-whatsapp').focus();
   const opened=c.waitForEvent('page');await p.keyboard.press('Enter');const popup=await opened;await popup.waitForLoadState();await popup.close();
   check(tag+' menu WhatsApp closes and restores focus',await p.evaluate(()=>document.activeElement.matches('.menu-toggle')&&!document.querySelector('#main-nav').classList.contains('is-open')));
  }
  await p.locator('.skip-link').focus();await p.keyboard.press('Enter');
  check(tag+' skip link',await p.evaluate(()=>document.activeElement.id==='contenido'));
  // Traverse the whole page by keyboard, including the guide and consultation.
  for(let n=0;n<45;n++){
   await p.keyboard.press('Tab');
   const focus=await p.evaluate(()=>{const e=document.activeElement;if(e===document.body||e.closest('.site-header'))return null;const r=e.getBoundingClientRect(),h=e.matches('.skip-link')?0:document.querySelector('.site-header').getBoundingClientRect().bottom;return {text:e.textContent.trim().slice(0,65),top:r.top,bottom:r.bottom,header:h,visible:r.top>=h-1&&r.bottom<=innerHeight+1};});
   if(focus)check(tag+' keyboard focus visible',focus.visible,focus);
  }
  const link=p.locator('#orientacion [data-whatsapp]');await link.focus();
  const opened=c.waitForEvent('page');await p.keyboard.press('Enter');const popup=await opened;await popup.waitForLoadState();await popup.close();
  check(tag+' level WhatsApp context',new URL(await link.getAttribute('href')).searchParams.get('text')==='¡Hola, LST! Quiero consultar mi nivel de surf y saber si encajo en un viaje. ¿Podéis orientarme?');
  await p.locator('.guide-next a').click();
  check(tag+' explore home calendar',new URL(p.url()).pathname==='/'&&new URL(p.url()).hash==='#viajes');
  rect=await geometry(p,'#viajes');check(`${width}x${height} calendar below header at default text size`,rect.top>=rect.header-1,rect);
  await c.close();
 }
 // Integration through every rendered route, including all four home tabs.
 for(const width of [390,1440]){
  const c=await context({viewport:{width,height:900}}),p=await c.newPage();
  await p.goto(base+'/');check(width+' home header levels',await p.locator(width<1000?'.header-levels':'#main-nav a[href="/niveles/"]').isVisible());await p.locator('.journeys-level-link').click();check(width+' calendar to guide',new URL(p.url()).pathname==='/niveles/');
  await p.goto(base+'/#niveles');await p.locator('[data-level="1"]').focus();await p.keyboard.press('End');check(width+' home tabs End key',await p.locator('#level-source').getAttribute('href')==='/niveles/#supercracks');await p.keyboard.press('ArrowLeft');check(width+' home tabs ArrowLeft key',await p.locator('#level-source').getAttribute('href')==='/niveles/#riders');
  for(const [i,slug] of slugs.entries()){
   await p.goto(base+'/#niveles');await p.locator(`[data-level="${i+1}"]`).click();await p.locator('#level-source').click();
   check(width+' home tab to '+slug,new URL(p.url()).pathname==='/niveles/'&&new URL(p.url()).hash==='#'+slug);
  }
  for(const trip of trips){await p.goto(base+`/viajes/${trip.slug}/`);check(width+' '+trip.slug+' header has levels',await p.locator('.trip-header a[href="/niveles/"]').isVisible());await p.locator('.trip-level a[href="/niveles/"]').click();check(width+' '+trip.slug+' to guide',new URL(p.url()).pathname==='/niveles/');}
  await c.close();
 }
 const historyContext=await context({viewport:{width:390,height:844}}),historyPage=await historyContext.newPage();
 await historyPage.goto(base+'/niveles/#rookies');await historyPage.locator('#rookies .guide-level-cta').click();await historyPage.locator('[data-guide-filter="riders"]').click();
 const bordered=()=>historyPage.locator('.guide-level').evaluateAll(els=>els.filter(e=>getComputedStyle(e).borderLeftColor==='rgb(234, 89, 52)').map(e=>e.id));
 check('travel filter does not highlight a card',JSON.stringify(await bordered())==='[]');
 await historyPage.reload();check('reload restores selected travel level',await historyPage.locator('[data-guide-filter="riders"]').getAttribute('aria-pressed')==='true');
 await historyPage.goBack();check('back restores Rookies trips',await historyPage.locator('[data-guide-filter="rookies"]').getAttribute('aria-pressed')==='true');
 await historyPage.goForward();check('forward restores Riders trips',await historyPage.locator('[data-guide-filter="riders"]').getAttribute('aria-pressed')==='true');
 await historyPage.locator('[data-guide-filter=""]').click();check('all clears obsolete target',JSON.stringify(await bordered())==='[]');
 await historyPage.goto(base+'/niveles/#rookies');await historyPage.waitForFunction(()=>new URL(location.href).searchParams.get('nivel')==='rookies'&&document.querySelector('[data-guide-filter=rookies]').getAttribute('aria-pressed')==='true');const beforeUrl=historyPage.url();const newTabPromise=historyContext.waitForEvent('page');await historyPage.locator('.guide-index a[href="#riders"]').click({modifiers:['Control']});const newTab=await newTabPromise;await newTab.waitForLoadState();await newTab.close();
 check('modified click keeps current context',historyPage.url()===beforeUrl&&await historyPage.locator('.guide-level.is-arriving').count()===0&&await historyPage.locator('[data-guide-filter="rookies"]').getAttribute('aria-pressed')==='true',{beforeUrl,afterUrl:historyPage.url()});
 await historyContext.close();
 for(const width of [320,390,1440]){
  const motionContext=await context({viewport:{width,height:844},reducedMotion:'no-preference'}),motionPage=await motionContext.newPage();
  await motionPage.goto(base+'/niveles/');await motionPage.evaluate(()=>document.fonts.ready);
  for(const slug of ['supercracks','supercracks','rookies']){
   const link=motionPage.locator(`.guide-index a[href="#${slug}"]`);
   await link.focus();await motionPage.keyboard.press('Enter');
   await motionPage.waitForFunction(s=>document.getElementById(s).classList.contains('is-arriving'),slug);
   const rect=await geometry(motionPage,`#${slug}`);
   check(width+' smooth arrival cue at destination '+slug,rect.top>=rect.header-1&&rect.top<=rect.header+20,rect);
   await motionPage.waitForFunction(()=>!document.querySelector('.is-arriving'));await motionPage.waitForTimeout(220);
   check(width+' smooth cue clears with focus retained '+slug,await motionPage.locator(`#${slug}`).evaluate(e=>e===document.activeElement&&getComputedStyle(e.querySelector('.guide-level-heading')).backgroundColor==='rgb(27, 27, 27)'));
  }
  await motionContext.close();
 }
 const c=await context({viewport:{width:390,height:844},javaScriptEnabled:false}),p=await c.newPage();
 await p.goto(base+'/niveles/');check('static content without JS',await p.locator('.guide-level:visible').count()===4);await p.locator('.guide-index a[href="#riders"]').click();check('native anchor without JS',new URL(p.url()).hash==='#riders');check('pending folded without JS',await p.locator('.guide-trip-pending').evaluate(e=>!e.open));await p.locator('.guide-trip-pending summary').focus();await p.keyboard.press('Enter');check('travel links without JS',await p.locator('.guide-trip-card:visible').count()===trips.length);check('no persistent highlight without JS',await p.locator('#riders').evaluate(e=>getComputedStyle(e).borderLeftColor!=='rgb(234, 89, 52)'));check('contact without JS',await p.locator('#orientacion [data-whatsapp]').getAttribute('href')!==null);await c.close();
 for(const href of report.whatsapp){const u=new URL(href);check('WhatsApp destination',u.origin==='https://wa.me'&&u.pathname==='/34648189257'&&!!u.searchParams.get('text'));}
 check('shared script has no page errors',report.errors.length===0,report.errors);
} finally {await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,errors:report.errors,whatsapp:report.whatsapp.length},null,2));
if(report.issues.length)process.exitCode=1;
