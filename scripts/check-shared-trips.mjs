// Shared home/guide trip component: responsive style, controls and filtering.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {renderHomeTrips} from './render-home-trips.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {levelsFor} from './trip-model.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||'docs/qa/2026-10-25-niveles-cards-compartidas/browser';
fs.mkdirSync(out,{recursive:true});
const report={checks:[],issues:[],errors:[],contacts:[]};
const check=(name,pass,detail)=>{const item={name,pass,detail};report.checks.push(item);if(!pass)report.issues.push(item);};
const home=fs.readFileSync('dist/index.html','utf8'),guide=fs.readFileSync('dist/niveles/index.html','utf8');
const trips=JSON.parse(fs.readFileSync('dist/catalog-snapshot.json','utf8')).trips;
const first=trips[0];
const fixture={...structuredClone(first),id:'shared-test',name:first.name,levels:[1,2],availability:'available',state:'confirmed',departures:Array.from({length:18},(_,i)=>({id:`date-${i}`,start:`2027-01-${String(i+1).padStart(2,'0')}`,end:`2027-02-${String(i+1).padStart(2,'0')}`,date:`Del ${i+1} de enero al ${i+1} de febrero de 2027`,duration:'7 noches',price:899,state:'confirmed',availability:'available',promotions:i===0?[{label:'Early bird',price:860,firstPlace:1,lastPlace:5,active:true}]:[]}))};
const full={...structuredClone(first),id:'full-test',name:'Destino completo',levels:[2,3],availability:'full'};
const pending={...structuredClone(first),id:'pending-test',name:'Próximas fechas',levels:[4],state:'upcoming',departures:[]};
const fixtures=[fixture,full,pending];
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
async function context(options={},fake=false){
 const c=await browser.newContext({reducedMotion:'reduce',...options});
 c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
 await c.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='wa.me'){report.contacts.push(url.href);return route.fulfill({contentType:'text/plain',body:'Consulta interceptada.'});}
  if(fake&&url.origin===base&&['/','/niveles/'].includes(url.pathname))return route.fulfill({contentType:'text/html; charset=utf-8',body:url.pathname==='/'?renderHomeTrips(home,fixtures):renderLevelTrips(guide,fixtures)});
  return route.continue();
 });return c;
}
async function zoom(p,multiplier){if(multiplier===1)return;await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});}
async function styleOf(card){return card.evaluate(e=>{const props={root:['backgroundColor','borderRadius','padding','boxShadow','containerType'],media:['borderRadius','minHeight'],price:['fontFamily','fontSize','lineHeight'],action:['backgroundColor','color','borderRadius','minHeight'],link:['backgroundColor','color','borderRadius']},nodes={root:e,media:e.querySelector('.home-trip-media'),price:e.querySelector('.home-trip-price'),action:e.querySelector('.home-trip-action'),link:e.querySelector('.home-trip-link')};return Object.fromEntries(Object.entries(props).map(([key,fields])=>{const css=getComputedStyle(nodes[key]);return[key,Object.fromEntries(fields.map(field=>[field,css[field]]))];}));});}
async function datesLayout(p,label){
 const metrics=await p.locator('.home-trip[aria-labelledby$="shared-test-title"] [data-home-dates]').evaluate(e=>{const wasOpen=e.open;e.open=true;const rect=n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};},card=e.closest('.home-trip'),panel=e.querySelector('.home-trip-dates-panel'),result={panel:rect(panel),title:rect(card.querySelector('h3,h4')),media:rect(card.querySelector('.home-trip-media')),overflow:panel.scrollWidth>panel.clientWidth+1};e.open=wasOpen;return result;});
 check(label+' date panel contained above title',!metrics.overflow&&metrics.panel.height>=36&&metrics.panel.bottom<=metrics.title.top-7&&metrics.panel.left>=metrics.media.left-1&&metrics.panel.right<=metrics.media.right+1,metrics);
}
try{
 for(const [width,multiplier] of [[320,1],[390,1],[768,1],[1024,1],[1440,1],[320,2],[390,2],[768,2],[1440,2]]){
  const label=`${width}-text${multiplier*100}`,c=await context({viewport:{width,height:900}}),p=await c.newPage();
  await p.goto(base+'/');await p.evaluate(()=>document.fonts.ready);await zoom(p,multiplier);await p.mouse.move(0,0);
  const homeCard=p.locator('.home-trip').first(),name=await homeCard.locator('h3,h4').innerText(),expectedStyle=await styleOf(homeCard);
  await p.goto(base+'/niveles/');await p.evaluate(()=>document.fonts.ready);await zoom(p,multiplier);await p.mouse.move(0,0);
  const card=p.locator('[data-trip-name]').filter({has:p.locator('h4',{hasText:name})}).first();
  check(label+' same component styles as home',JSON.stringify(await styleOf(card))===JSON.stringify(expectedStyle));
  check(label+' shared compact cards',await p.locator('.guide-trip-card.home-trip[data-compact-home]').count()===trips.length);
  check(label+' all four levels readable',await p.locator('.guide-level:visible').count()===4);
  check(label+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check(label+' primary actions fit with touch targets',await p.locator('.guide-trip-card .home-trip-action').evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+1)));
  const contactCount=await p.locator('[data-guide-enquiry]').count();check(label+' one shared level enquiry',contactCount===1);
  for(const [index,slug] of ['rookies','aprendices','riders','supercracks'].entries()){
   await p.locator(`[data-guide-filter="${slug}"]`).click();
   const shown=await p.locator('.guide-trip-card:visible').evaluateAll(els=>els.map(e=>e.dataset.tripName).sort());
   const expected=trips.filter(t=>t.state==='confirmed'&&levelsFor(t).includes(index+1)).map(t=>t.name).sort();
   check(label+' retains filter '+slug,JSON.stringify(shown)===JSON.stringify(expected),{shown,expected});
  }
  await p.locator('[data-guide-filter=""]').click();
  if(multiplier===1&&[390,1440].includes(width)){
   for(const img of await p.locator('.guide-trip-card img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}
   await p.mouse.move(0,0);await p.keyboard.press('Escape');
   const screenshotStyle=await p.addStyleTag({content:'.site-header,.skip-link{visibility:hidden!important}'});
   await p.locator('#viajes-por-nivel').screenshot({path:path.join(out,`shared-cards-${width}.png`)});
   await screenshotStyle.evaluate(e=>e.remove());
  }
  await p.goBack();check(label+' history restores level',await p.locator('[data-guide-filter="supercracks"]').getAttribute('aria-pressed')==='true');
  await c.close();
 }
 for(const route of ['/','/niveles/'])for(const [width,multiplier] of [[320,1],[768,1],[1440,1],[320,2]]){
  const c=await context({viewport:{width,height:900}},true),p=await c.newPage();await p.goto(base+route);await p.evaluate(()=>document.fonts.ready);await zoom(p,multiplier);
  check(`${route} ${width} fixture active price and saving`,(await p.locator('.home-trip[aria-labelledby$="shared-test-title"] .home-trip-price').innerText()).includes('860')&&(await p.locator('.home-trip[aria-labelledby$="shared-test-title"] .home-trip-saving').innerText()).includes('39 € de descuento'));
  await datesLayout(p,`${route} ${width} text${multiplier*100}`);
  const dates=p.locator('.home-trip[aria-labelledby$="shared-test-title"] [data-home-dates]'),summary=dates.locator('summary');await summary.focus();await p.keyboard.press('Enter');
  check(`${route} ${width} keyboard opens dates`,await dates.evaluate(e=>e.open));
  await dates.locator('.home-trip-dates-panel').focus();await p.keyboard.press('Escape');
  check(`${route} ${width} Escape closes and restores focus`,await dates.evaluate(e=>!e.open&&document.activeElement===e.querySelector('summary')));
  if(route==='/niveles/'){
   await p.mouse.move(0,0);await summary.focus();await p.keyboard.press('Enter');
   await p.locator('[data-guide-filter="supercracks"]').click();
   check(`${width} hiding a pinned card closes dates`,await dates.evaluate(e=>!e.open)&&!await p.locator('.home-trip[aria-labelledby$="shared-test-title"]').isVisible());
   check(`${width} pending destination still available`,await p.locator('[data-guide-pending-count]').innerText()==='1');
   await p.locator('.guide-trip-pending>summary').click();check(`${width} native pending group opens`,await p.locator('[data-trip-name="Próximas fechas"]').isVisible());
   await p.locator('[data-guide-filter=""]').click();await p.mouse.move(0,0);await summary.focus();await p.keyboard.press('Enter');
   check(`${width} reappearing dates open on first activation`,await dates.evaluate(e=>e.open));
  }
  await c.close();
 }
 const touch=await context({viewport:{width:390,height:844},hasTouch:true,isMobile:true},true),p=await touch.newPage();await p.goto(base+'/niveles/');
 const touchDates=p.locator('[data-home-dates]').first();await touchDates.locator('summary').tap();check('touch opens shared dates',await touchDates.evaluate(e=>e.open));await touchDates.locator('summary').tap();check('touch closes shared dates',await touchDates.evaluate(e=>!e.open));
 await p.locator('.guide-trip-card .home-trip-link').first().click();check('shared card navigates to original trip',new URL(p.url()).pathname===`/viajes/${fixture.slug}/`);await touch.close();
 for(const js of [false,true]){
  const c=await context({viewport:{width:390,height:844},javaScriptEnabled:js},true),p=await c.newPage();await p.goto(base+'/niveles/');
  if(!js){check('without JS static levels and trip groups remain',await p.locator('.guide-level:visible').count()===4&&await p.locator('.guide-trip-filters').isHidden());await p.locator('.guide-trip-pending>summary').click();check('without JS pending trip opens',await p.locator('[data-trip-name="Próximas fechas"]').isVisible());}
  const dates=p.locator('[data-home-dates]').first();await dates.locator('summary').click();check(`JS ${js} native dates remain usable`,await dates.evaluate(e=>e.open));
  await p.locator('.guide-index a[href="#riders"]').click();check(`JS ${js} native level navigation`,new URL(p.url()).hash==='#riders');await c.close();
 }
 check('no JavaScript errors',report.errors.length===0,report.errors);
}finally{await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,errors:report.errors},null,2));if(report.issues.length)process.exitCode=1;
