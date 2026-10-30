import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {renderHomeTrips} from './render-home-trips.mjs';
const {chromium} = createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.LST_QA_OUTPUT || '/tmp/lst-home-browser';
await mkdir(output, {recursive:true});
const root = path.resolve('dist');
const original = await readFile(path.join(root,'index.html'),'utf8');
const trips = JSON.parse(await readFile(path.join(root,'catalog-snapshot.json'),'utf8')).trips;
const fixture = structuredClone(trips[0]);
fixture.departures = Array.from({length:18},(_,i)=>({id:`date-${i}`,start:`2027-01-${String(i+1).padStart(2,'0')}`,date:`Salida ${i+1} · enero 2027`,price:i===1?null:399+i,state:'confirmed',duration:'7 noches'}));
let fixtureMode = false;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
 res.end(fixtureMode&&file===path.join(root,'index.html')?renderHomeTrips(original,[fixture]):await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
let checks=0;const errors=[];const imageResults=[];
const ok=(value,message)=>{assert.equal(value,true,message);checks++;};
const overflow=page=>page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,70),right:e.getBoundingClientRect().right})));
try{
 for(const width of [320,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.locator('.home-trip').first().scrollIntoViewIfNeeded();
  await page.locator('.home-trip-photo').first().evaluate(img=>img.decode().catch(()=>{}));
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}: ${JSON.stringify(await overflow(page))}`);
  assert.equal(await page.locator('.home-trip-link').count(),trips.length);checks++;
  imageResults.push({width,images:await page.locator('.lst-hero-photo,.home-trip-photo').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})))});
  for (const img of await page.locator('.lst-memory img,.lst-footer-brand img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
  ok(await page.locator('.lst-memory-main img').evaluate(e=>Math.abs(e.clientWidth/e.clientHeight-(innerWidth<=620?1.3:1.45))<.02),'community photo keeps designed ratio');
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});
  if(width===1440){
   const media=page.locator('.home-trip-media').first();const dates=page.locator('[data-home-dates]').first();const summary=dates.locator('summary');
   await media.hover();ok(await dates.evaluate(e=>e.open),'hover opens');ok(await dates.locator('.home-trip-dates-label').evaluate(e=>getComputedStyle(e).transform==='none'),'date control stays straight');
   await page.mouse.move(0,0);ok(await dates.evaluate(e=>!e.open),'leave closes');
   await summary.click({position:{x:20,y:20}});await page.mouse.move(0,0);ok(await dates.evaluate(e=>e.open),'click pins');
   await page.keyboard.press('Escape');ok(await dates.evaluate(e=>!e.open),'escape closes');
   await summary.focus();await page.keyboard.press('Enter');ok(await dates.evaluate(e=>e.open),'keyboard Enter opens');
   await page.keyboard.press('Tab');ok(await dates.locator('.home-trip-dates-panel').evaluate(e=>e===document.activeElement),'panel keyboard scroll focus');
   await page.keyboard.press('Escape');ok(await summary.evaluate(e=>e===document.activeElement),'escape restores focus');
   await page.keyboard.press('Space');ok(await dates.evaluate(e=>e.open),'keyboard Space opens');
   await page.locator('#trips-title').click();ok(await dates.evaluate(e=>!e.open),'outside click closes');
   await media.hover();await page.screenshot({path:path.join(output,'home-dates-desktop.png'),fullPage:false});
  }
  if(width<1000){await page.locator('.menu-toggle').click();ok(await page.locator('#main-nav').isVisible(),'mobile menu opens');await page.keyboard.press('Escape');ok(!await page.locator('#main-nav').isVisible(),'mobile menu escape');}
  await page.goto(base);await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')];const sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=`${sizes[i]*2}px`);});
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`200% overflow ${width}: ${JSON.stringify(await overflow(page))}`);
  await page.close();
 }
 fixtureMode=true;
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touch.goto(base);const dates=touch.locator('[data-home-dates]').first();const summary=dates.locator('summary');
 await summary.tap({position:{x:25,y:25}});ok(await dates.evaluate(e=>e.open),'touch opens');
 assert.equal(await dates.locator('li').count(),18);checks++;
 ok((await dates.innerText()).includes('Precio por confirmar'),'unknown price stays unknown');
 await dates.locator('.home-trip-dates-panel').evaluate(e=>e.scrollTop=e.scrollHeight);
 ok(await dates.locator('li').last().isVisible(),'long list last date exists');
 await touch.screenshot({path:path.join(output,'home-dates-mobile.png'),fullPage:false});
 await summary.tap({position:{x:25,y:25}});ok(await dates.evaluate(e=>!e.open),'touch closes');
 await touch.locator('.home-trip-link').click();ok(new URL(touch.url()).pathname===`/viajes/${fixture.slug}/`,'direct trip link');await touch.close();
 fixtureMode=false;
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base);ok(await nojs.locator('.static-navigation').isVisible(),'noJS navigation');
 await nojs.locator('[data-home-dates] summary').first().click({position:{x:20,y:20}});ok(await nojs.locator('[data-home-dates]').first().evaluate(e=>e.open),'noJS dates open');
 const more=nojs.locator('.home-more-trips');if(await more.count()){await more.locator(':scope>summary').click();ok(await more.evaluate(e=>e.open),'noJS more trips');ok(await more.locator(':scope>summary>span').evaluate(e=>getComputedStyle(e).transform==='none'),'more trips control stays straight');}
 await nojs.close();assert.deepEqual(errors,[]);
 await writeFile(path.join(output,'results.json'),JSON.stringify({checks,errors,imageResults},null,2));
 console.log(`PASS: ${checks} home browser checks; responsive, text 200%, hover, tap, keyboard, long dates, direct links and noJS. Evidence: ${output}`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
