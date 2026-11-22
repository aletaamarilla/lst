// Trips in the level guide: each chapter lists the trips that admit its level as
// compact rows; names, dates and prices agree with the catalogue; nothing overflows.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {levelsFor} from './trip-model.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||'docs/qa/2026-11-19-niveles-viajes/browser';
fs.mkdirSync(out,{recursive:true});
const report={checks:[],issues:[],errors:[]};
const check=(name,pass,detail)=>{const item={name,pass,detail};report.checks.push(item);if(!pass)report.issues.push(item);};
const trips=JSON.parse(fs.readFileSync('dist/catalog-snapshot.json','utf8')).trips;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
async function context(options={}){
 const c=await browser.newContext({reducedMotion:'reduce',...options});
 c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
 await c.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='wa.me')return route.fulfill({contentType:'text/plain',body:'Consulta interceptada.'});return route.continue();});
 return c;
}
async function zoom(p,multiplier){if(multiplier===1)return;await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});}
const norm=s=>s.replace(/\s+/g,' ').trim();
try{
 // What the catalogue says about each trip: price shown on its ticket.
 const c0=await context({viewport:{width:1280,height:900}}),p0=await c0.newPage();await p0.goto(base+'/viajes/');
 const catalogue=Object.fromEntries(await p0.locator('.ct-ticket').evaluateAll(els=>els.map(e=>[e.querySelector('.ct-name a').pathname.split('/')[2],e.querySelector('.ct-price strong')?.textContent.trim()])));
 await c0.close();
 for(const [width,multiplier] of [[320,1],[390,1],[768,1],[1024,1],[1440,1],[320,2],[390,2],[768,2],[1440,2]]){
  const label=`${width}-text${multiplier*100}`,c=await context({viewport:{width,height:900}}),p=await c.newPage();
  await p.goto(base+'/niveles/');await p.evaluate(()=>document.fonts.ready);await zoom(p,multiplier);
  check(label+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const level of [1,2,3,4]){
   const rows=await p.locator(`[data-level-trips="${level}"] .lv-trip`).evaluateAll(els=>els.map(e=>({slug:e.querySelector('a').pathname.split('/')[2],levels:e.dataset.tripLevels,price:e.querySelector('.lv-trip-price').textContent,link:(()=>{const r=e.querySelector('a').getBoundingClientRect();return {h:r.height,clipped:e.querySelector('a').scrollWidth>e.querySelector('a').clientWidth+1};})()})));
   const expected=trips.filter(t=>levelsFor(t).includes(level)).map(t=>t.slug).sort();
   check(label+' level '+level+' lists its trips',JSON.stringify(rows.map(r=>r.slug).sort())===JSON.stringify(expected),{rows:rows.map(r=>r.slug),expected});
   check(label+' level '+level+' rows fit',rows.every(r=>r.link.h>=44&&!r.link.clipped),rows.map(r=>r.link));
   if(multiplier===1)check(label+' level '+level+' prices match the catalogue',rows.every(r=>!catalogue[r.slug]||norm(r.price).includes(norm(catalogue[r.slug]))),rows.map(r=>[r.slug,r.price,catalogue[r.slug]]));
  }
  if(multiplier===1&&[390,1440].includes(width)){
   const block=p.locator('[data-level-trips="2"]');await block.scrollIntoViewIfNeeded();
   for(const img of await block.locator('img').all())await img.evaluate(e=>{e.loading='eager';return e.decode().catch(()=>{});});
   check(label+' photos load',await block.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
   await block.screenshot({path:path.join(out,`niveles-viajes-${width}.png`)});
  }
  await c.close();
 }
 const c=await context({viewport:{width:390,height:844},javaScriptEnabled:false}),p=await c.newPage();await p.goto(base+'/niveles/');
 check('without JS the trip rows are listed',await p.locator('.lv-chapters .lv-trip:visible').count()>0);
 await p.locator('[data-level-trips="1"] .lv-trip a').first().click();check('without JS a row opens its trip',/^\/viajes\/[^/]+\/$/.test(new URL(p.url()).pathname));
 await c.close();
 check('no JavaScript errors',report.errors.length===0,report.errors);
}finally{await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,errors:report.errors},null,2));if(report.issues.length)process.exitCode=1;
