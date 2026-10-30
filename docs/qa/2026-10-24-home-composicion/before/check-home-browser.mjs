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
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
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
  ok(await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily.startsWith('Aura')),'original display font');
  ok(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily.includes('Work Sans')),'original body font');
  ok(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(255, 250, 231)'),'original cream');
  ok(await page.locator('.lst-hero-photo').evaluate(e=>{const p=e.closest('.lst-hero').getBoundingClientRect(),r=e.getBoundingClientRect();return Math.abs(r.left)<1&&Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-p.height)<1&&getComputedStyle(e).objectFit==='cover'}),'photograph fills the complete hero');
  ok(await page.locator('.brand-dark').isVisible(),'original dark logo on the clean cover');
  assert.equal(await page.locator('.lst-hero h1').innerText(),'¿Te vienes\na surfear?');checks++;
  assert.equal(await page.locator('.home-trip-preview small').count(),0);checks++;
  ok(await page.locator('.home-trip-action').first().evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(234, 89, 52)'&&getComputedStyle(e).borderTopColor==='rgb(234, 89, 52)'&&e.getBoundingClientRect().height>=32&&e.getBoundingClientRect().height<=40),'trip action has a subtle visual weight');
  ok(await page.locator('.home-trip-link').first().evaluate(e=>e.getBoundingClientRect().height>=44),'trip link keeps its touch target');
  ok(await page.evaluate(()=>{const bg=sel=>{let e=document.querySelector(sel);while(e){const c=getComputedStyle(e).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;e=e.parentElement;}};const s=getComputedStyle(document.querySelector('.faq'));return bg('.faq')!==bg('.lst-testimonials')&&bg('.faq')!==bg('.lst-booking')&&bg('.faq')===bg('.lst-levels')&&parseFloat(s.borderTopLeftRadius)>0&&parseFloat(s.borderTopWidth)>0;}),'FAQs visibly separate opinions and booking through their effective backgrounds');
  ok(await page.evaluate(()=>{const section=getComputedStyle(document.querySelector('.lst-levels')).backgroundColor,paper=getComputedStyle(document.body).backgroundColor;return section!==paper&&section!=='rgba(0, 0, 0, 0)'&&[...document.querySelectorAll('.lst-level-card')].every(e=>getComputedStyle(e).backgroundColor===paper);}), 'level section has its own surface behind the original cream cards');
  ok(await page.evaluate(()=>{const paper=getComputedStyle(document.body).backgroundColor;return [...document.querySelectorAll('.home-trip')].every(e=>{const s=getComputedStyle(e);return s.backgroundColor==='rgb(255, 255, 255)'&&s.backgroundColor!==paper&&s.boxShadow!=='none';});}),'trip cards have a distinct light surface and contained depth');
  ok(await page.locator('.lst-hero h1').evaluate(e=>getComputedStyle(e).color==='rgb(255, 255, 255)'),'hero title is white');
  ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.lst-closing')).backgroundColor==='rgb(27, 27, 27)'&&['.lst-testimonials','.people','.faq','.lst-footer'].every(sel=>!['rgb(27, 27, 27)','rgb(234, 89, 52)'].includes(getComputedStyle(document.querySelector(sel)).backgroundColor))),'closing is the single large dark section');
  ok(await page.locator('.lst-people-layout').evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.backgroundColor==='rgb(234, 89, 52)'&&r.left>0&&r.right<innerWidth&&parseFloat(s.paddingLeft)>=24;}),'people have a contained orange panel');
  ok(await page.evaluate(()=>!document.querySelector('section.lst-experience')&&document.querySelectorAll('#experiencia').length===1&&(document.querySelector('#dudas').compareDocumentPosition(document.querySelector('#reservar'))&Node.DOCUMENT_POSITION_FOLLOWING)>0),'redundant experience removed, anchor retained and FAQs before booking');
  ok(await page.locator('.lst-review-symbol').evaluate(e=>e.getAttribute('src')==='/assets/brand/symbol-orange.svg'&&e.getAttribute('aria-hidden')==='true'&&e.getAttribute('alt')===''),'proof uses the existing decorative LST symbol');
  assert.deepEqual(await page.locator('main > section').evaluateAll(es=>es.map(e=>e.id||e.classList[0])),['lst-hero','viajes','niveles','nosotros','opiniones','dudas','reservar','lst-closing']);checks++;
  ok(await page.evaluate(()=>document.querySelector('.lst-trip-actions a').getAttribute('href')==='/viajes/'&&document.querySelector('.lst-trip-actions .lst-link').getAttribute('href')==='#niveles'&&document.querySelector('.lst-closing .lst-button').getAttribute('href')==='/viajes/'),'catalogue and level routes support the next decision without looping to the same cards');
  ok(await page.evaluate(()=>['.lst-testimonials','.faq'].every(sel=>getComputedStyle(document.querySelector(sel)).backgroundImage==='none')),'section surfaces remain flat rather than relying on gradients');
  assert.equal(await page.locator('.lst-quote-grid blockquote').count(),2);checks++;
  const focusFailures=await page.evaluate(()=>{const details=[...document.querySelectorAll('.lst-faq-list details')],states=details.map(e=>e.open);details.forEach(e=>e.open=true);const failures=[...document.querySelectorAll('.lst-levels a,.faq a,.faq summary')].map(e=>{e.focus();const s=getComputedStyle(e);return {text:e.textContent.slice(0,50),visibleFocus:e.matches(':focus-visible'),active:e===document.activeElement,color:s.outlineColor,width:s.outlineWidth};}).filter(s=>!s.visibleFocus||s.color!=='rgb(27, 27, 27)'||parseFloat(s.width)<3);details.forEach((e,i)=>e.open=states[i]);return failures;});
  ok(focusFailures.length===0,'neutral panels retain a high contrast keyboard focus: '+JSON.stringify(focusFailures));
  await page.locator('#viajes').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.site-header').classList.contains('is-scrolled'));
  ok(await page.locator('.site-header').evaluate(e=>e.classList.contains('is-scrolled')),'scrolled navigation state');
  ok(await page.locator('.brand-dark').isVisible(),'original dark logo after scroll');

  await page.locator('.home-trip').first().scrollIntoViewIfNeeded();
  await page.locator('.home-trip-photo').first().evaluate(img=>img.decode().catch(()=>{}));
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}: ${JSON.stringify(await overflow(page))}`);
  assert.equal(await page.locator('.home-trip-link').count(),trips.length);checks++;
  imageResults.push({width,images:await page.locator('.lst-hero-photo,.home-trip-photo').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})))});
  for (const img of await page.locator('.lst-level-photo img,.lst-people-photo img,.lst-review-symbol,.lst-footer-brand img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
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

