import {createRequire} from 'node:module';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const root=path.resolve('dist'),out=path.resolve('docs/qa/2026-10-24-card-navigation');
const trips=JSON.parse(await readFile(root+'/catalog-snapshot.json','utf8')).trips;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
let checks=0;const errors=[],headers=[];const ok=(v,m)=>{assert(v,m);checks++;};
try {
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/', '/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/','/viajes/marruecos/']){
   await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
   const menu=page.locator('.menu-toggle');
   if(width===390&&await menu.count()&&await menu.isVisible())await menu.click();
   const result=await page.locator('header.site-header,header.trip-header').evaluate(h=>[...h.querySelectorAll('nav a,.header-cta,.lst-header-trip,.trip-header-cta')].filter(e=>e.getClientRects().length).map(e=>{const s=getComputedStyle(e);return {text:e.textContent.trim(),background:s.backgroundColor,border:s.borderTopWidth,radius:s.borderTopLeftRadius,height:e.getBoundingClientRect().height};}));
   headers.push({width,route,links:result});
   ok(result.length>0&&result.every(x=>x.background==='rgba(0, 0, 0, 0)'&&parseFloat(x.border)===0&&parseFloat(x.radius)===0&&x.height>=43.5),'text header '+width+' '+route+' '+JSON.stringify(result));
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page width '+route);
  }
  await page.goto(base+'/');
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:out+'/header-'+width+'.png',fullPage:false});
  const card=page.locator('.home-trip').filter({has:page.locator('h3',{hasText:/^Marruecos$/})});
  await card.scrollIntoViewIfNeeded();
  await card.locator('img').evaluate(i=>i.decode());
  await card.locator('[data-home-dates]>summary').click();
  const rows=await card.locator('.departure-row').evaluateAll(es=>es.map(e=>{const date=e.querySelector('.departure-row-date').getBoundingClientRect(),level=e.querySelector('.departure-row-level').getBoundingClientRect();return {dateRight:date.right,levelLeft:level.left,rowRight:e.getBoundingClientRect().right,levelRight:level.right,text:e.textContent};}));
  ok(rows.length===2&&rows.every(r=>r.dateRight<r.levelLeft&&r.levelRight<=r.rowRight+1),'right column levels');
  ok(await card.locator('.home-trip-dates-panel').evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(255, 250, 231, 0.78)'),'translucent dates');
  await card.screenshot({path:out+'/marruecos-card-'+width+'.png'});
  await page.goto(base+'/viajes/marruecos/');
  await page.locator(width===390?'.dock-cta':'.trip-header-cta').click();
  ok(await page.locator('.departure-option-date').evaluateAll(es=>es.every(e=>{const d=e.querySelector('h3').getBoundingClientRect(),l=e.querySelector('.departure-option-level').getBoundingClientRect();return d.right<=l.left&&l.right<=e.getBoundingClientRect().right+1;})),'selector levels right');
  await page.screenshot({path:out+'/date-selector-'+width+'.png',fullPage:false});
  await page.close();
 }
 ok(errors.length===0,'JS errors '+errors.join(','));
 await writeFile(out+'/headers-and-cards.json',JSON.stringify({checks,errors,headers},null,2)+'\n');
 console.log('PASS: '+checks+' checks for textual headers across six routes, right-column levels, transparency and modal layout.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
