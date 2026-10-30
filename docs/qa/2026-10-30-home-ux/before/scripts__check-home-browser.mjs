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
fixture.departures = Array.from({length:18},(_,i)=>({id:`date-${i}`,start:`2027-01-${String(i+1).padStart(2,'0')}`,date:`Del ${i+1} al ${i+7} de enero de 2027`,price:i===1?null:399+i,state:'confirmed',duration:'7 noches'}));
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

const layoutResults=[];
const checkDateLayout=async(page,label)=>{
 const result=await page.evaluate(()=>{
  const collections=[...document.querySelectorAll('.home-more-trips')],collectionStates=collections.map(e=>e.open);
  collections.forEach(e=>e.open=true);
  const cards=[...document.querySelectorAll('.home-trip')],details=cards.map(e=>e.querySelector('[data-home-dates]')),states=details.map(e=>e.open);
  details.forEach(e=>e.open=true);
  const layout=cards.map(card=>{
   const box=selector=>{const r=card.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
   const media=box('.home-trip-media'),title=box('h3,h4'),panel=box('.home-trip-dates-panel'),level=box('.home-trip-level'),status=card.querySelector('.home-trip-status')?box('.home-trip-status'):null;
   const list=card.querySelector('.home-trip-dates-panel');
   return {name:card.querySelector('h3,h4').textContent,media,title,panel,level,status,scrollHeight:list.scrollHeight,clientHeight:list.clientHeight,horizontalOverflow:list.scrollWidth>list.clientWidth+1};
  });
  details.forEach((e,i)=>e.open=states[i]);collections.forEach((e,i)=>e.open=collectionStates[i]);
  return layout;
 });
 layoutResults.push({label,cards:result});
 await writeFile(path.join(output,"date-layout.json"),JSON.stringify(layoutResults,null,2));
 ok(result.length>0&&result.every(r=>r.panel.bottom<=r.title.top-8&&r.title.bottom<=r.media.bottom+1&&r.panel.top>=r.media.top&&r.panel.left>=r.media.left&&r.panel.right<=r.media.right+1&&r.panel.height>=36&&!r.horizontalOverflow),label+': dates stay above the complete title, inside the photograph and readable without horizontal scrolling');
 ok(result.every(r=>r.panel.top>=Math.max(r.level.bottom,r.status?.bottom||0)),label+': dates stay below the level and status badges');
};
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
  ok(await page.locator('.home-trip-action').first().evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(234, 89, 52)'&&getComputedStyle(e).borderTopColor==='rgb(234, 89, 52)'&&e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().height<=48),'compact trip action keeps its 44px touch target');
  ok(await page.locator('.home-trip-link').first().evaluate(e=>e.getBoundingClientRect().height>=44),'trip link keeps its touch target');
  ok(await page.evaluate(()=>{const panel=getComputedStyle(document.querySelector('.faq')),header=getComputedStyle(document.querySelector('.lst-faq-intro'));return panel.backgroundColor==='rgb(255, 250, 231)'&&parseFloat(panel.borderTopWidth)===0&&header.backgroundColor==='rgba(0, 0, 0, 0)'&&header.color==='rgb(27, 27, 27)'&&[...document.querySelectorAll('.lst-faq-list summary')].every(e=>getComputedStyle(e).backgroundColor==='rgb(27, 27, 27)'&&getComputedStyle(e).color==='rgb(255, 250, 231)');}),'FAQs use a quiet heading and separate ink accordion surfaces');
  ok(await page.evaluate(()=>{const intro=document.querySelector('.lst-level-intro'),r=intro.getBoundingClientRect(),photo=document.querySelector('.lst-level-photo img').getBoundingClientRect(),grid=document.querySelector('.lst-level-grid').getBoundingClientRect(),paper=getComputedStyle(document.body).backgroundColor;return getComputedStyle(intro).color===paper&&Math.abs(photo.width-r.width)<1&&Math.abs(photo.height-r.height)<1&&grid.top<r.bottom&&r.bottom-grid.top<=32&&[...document.querySelectorAll('.lst-level-card')].every(e=>getComputedStyle(e).backgroundColor===paper);}), 'level cards overlap a compact photographic introduction without changing their cream surface');
  ok(await page.evaluate(()=>{const paper=getComputedStyle(document.body).backgroundColor;return [...document.querySelectorAll('.home-trip')].every(e=>{const s=getComputedStyle(e),footer=getComputedStyle(e.querySelector('.home-trip-link'));return s.backgroundColor===paper&&s.boxShadow!=='none'&&footer.backgroundColor==='rgb(27, 27, 27)'&&footer.color===paper;});}),'trip cards use brand cream with an ink price and action footer');
  ok(await page.locator('.lst-hero h1').evaluate(e=>getComputedStyle(e).color==='rgb(255, 255, 255)'),'hero title is white');
  ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.lst-closing')).backgroundColor==='rgb(27, 27, 27)'&&['.lst-testimonials','.people','.faq','.lst-footer'].every(sel=>!['rgb(27, 27, 27)','rgb(234, 89, 52)'].includes(getComputedStyle(document.querySelector(sel)).backgroundColor))),'closing is the single large dark section');
  ok(await page.locator('.lst-people-layout').evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.backgroundColor==='rgb(234, 89, 52)'&&r.left>0&&r.right<innerWidth&&parseFloat(s.paddingLeft)>=24;}),'people have a contained orange panel');
  ok(await page.evaluate(()=>!document.querySelector('section.lst-experience')&&document.querySelectorAll('#experiencia').length===1&&(document.querySelector('#dudas').compareDocumentPosition(document.querySelector('#reservar'))&Node.DOCUMENT_POSITION_FOLLOWING)>0),'redundant experience removed, anchor retained and FAQs before booking');
  ok(await page.locator('.lst-review-symbol').evaluate(e=>e.getAttribute('src')==='/assets/brand/symbol-orange.svg'&&e.getAttribute('aria-hidden')==='true'&&e.getAttribute('alt')===''),'proof uses the existing decorative LST symbol');
  assert.deepEqual(await page.locator('main > section').evaluateAll(es=>es.map(e=>e.id||e.classList[0])),['lst-hero','viajes','niveles','nosotros','opiniones','dudas','reservar','lst-closing']);checks++;
  ok(await page.evaluate(()=>!document.querySelector('.lst-view-all')&&!document.querySelector('.lst-hero a')&&!document.querySelector('#reservar a')&&!document.querySelector('#opiniones a')&&document.querySelector('.lst-closing .lst-button').getAttribute('href')==='/viajes/'),'removed header, cover, booking and external review actions stay absent; catalogue remains in the closing');
  ok(await page.evaluate(()=>['.lst-testimonials','.faq'].every(sel=>getComputedStyle(document.querySelector(sel)).backgroundImage==='none')),'section surfaces remain flat rather than relying on gradients');
  assert.equal(await page.locator('.lst-quote-grid blockquote').count(),2);checks++;
  ok(await page.locator('.lst-story-cta').evaluate(e=>{const s=getComputedStyle(e);return e.getAttribute('href')==='/conocenos/'&&s.backgroundColor==='rgb(27, 27, 27)'&&s.color==='rgb(255, 250, 231)'&&e.getBoundingClientRect().height>=54;}),'story has a contrasting, accessible action');
  ok(await page.locator(width<1000?'.lst-header-trip':'.lst-nav-trip').evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(getComputedStyle(e).borderTopWidth)===0&&e.getBoundingClientRect().height>=44),'header navigation retains its accessible text link');
  ok(await page.locator('.home-trip-preview-label').evaluateAll(es=>es.length>0&&es.every(e=>['Próx. fecha','Fecha de la tarifa'].includes(e.textContent))),'next date is clearly labelled');
  ok(await page.evaluate(()=>{const more=document.querySelector('.home-more-trips'),wasOpen=more?.open;if(more)more.open=true;const aligned=[...document.querySelectorAll('.home-trip-preview')].every(e=>{const date=e.querySelector('.home-trip-preview-date').getBoundingClientRect(),duration=e.querySelector('.home-trip-duration')?.getBoundingClientRect(),bounds=e.getBoundingClientRect();return date.left>=bounds.left-1&&date.right<=bounds.right+1&&(!duration||duration.left>=date.right+4&&Math.abs(duration.top-date.top)<=5);});if(more)more.open=wasOpen;return aligned;}),'compact dates and durations remain readable without overlap');
  ok(await page.locator('.lst-closing-actions').evaluate(e=>{const [trip,question]=e.querySelectorAll('a'),a=trip.getBoundingClientRect(),b=question.getBoundingClientRect();return trip.textContent.trim()==='Ver viajes'&&question.textContent.trim()==='Pregúntanos'&&getComputedStyle(trip).backgroundColor==='rgb(234, 89, 52)'&&b.left>a.right&&Math.abs(b.top-a.top)<2&&question.href.startsWith('https://wa.me/34648189257?');}),'closing actions are paired with the orange trip CTA first');
  ok(await page.locator('.lst-footer-links a').evaluateAll(es=>es.length===6&&es.every(e=>{const s=getComputedStyle(e);return parseFloat(s.borderTopWidth)===0&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(s.minHeight)>=44;})),'footer uses accessible text links');
  ok(await page.locator('.home-trip-dates-panel').evaluateAll(es=>es.every(e=>e.children.length===1&&e.firstElementChild.matches('a.home-trip-dates-link')&&!!e.querySelector('ul')&&!e.textContent.includes('€'))),'date overlays contain only the departure list');
  ok(await page.locator('.lst-whatsapp').evaluate(e=>e.href.startsWith('https://wa.me/34648189257?')&&e.querySelector('svg')?.getAttribute('aria-hidden')==='true'&&e.textContent.includes('Escríbenos al')),'level help goes directly to WhatsApp with a decorative icon');
  ok(await page.locator('main a:not(.home-trip-link):not(.home-trip-dates-link):not(.lst-level-card)').evaluateAll(es=>es.every(e=>{const s=getComputedStyle(e);return parseFloat(s.borderTopWidth)>0&&parseFloat(s.minHeight)>=44&&!s.textDecorationLine.includes('underline');})),'text action targets remain at least 44px');
  ok(await page.locator('.home-trip-departures,.home-trip-departures li').evaluateAll(es=>es.length>0&&es.every(e=>{const s=getComputedStyle(e);return ['borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth'].every(side=>parseFloat(s[side])===0);})), 'trip departure lists and their rows have no borders');
  ok(await page.locator('.lst-level-cta').evaluateAll(es=>es.length===4&&es.every(e=>getComputedStyle(e).backgroundColor==='rgb(27, 27, 27)'&&e.querySelector('[aria-hidden=true]'))),'level trip actions have a solid primary treatment and decorative direction icons');
  const focusFailures=await page.evaluate(()=>{const details=[...document.querySelectorAll('.lst-faq-list details')],states=details.map(e=>e.open);details.forEach(e=>e.open=true);const failures=[...document.querySelectorAll('.lst-levels a,.faq a,.faq summary')].map(e=>{e.focus();const s=getComputedStyle(e);return {text:e.textContent.slice(0,50),visibleFocus:e.matches(':focus-visible'),active:e===document.activeElement,color:s.outlineColor,expected:e.closest('.lst-level-intro')||e.matches('.lst-faq-list summary')?'rgb(255, 250, 231)':'rgb(27, 27, 27)',width:s.outlineWidth};}).filter(s=>!s.visibleFocus||!s.active||s.color!==s.expected||parseFloat(s.width)<3);details.forEach((e,i)=>e.open=states[i]);return failures;});
  ok(focusFailures.length===0,'photographic and ink headings retain a readable keyboard focus: '+JSON.stringify(focusFailures));
  await page.locator('#viajes').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.site-header').classList.contains('is-scrolled'));
  ok(await page.locator('.site-header').evaluate(e=>e.classList.contains('is-scrolled')),'scrolled navigation state');
  ok(await page.locator('.brand-dark').isVisible(),'original dark logo after scroll');

  await page.locator('.home-trip').first().scrollIntoViewIfNeeded();
  await page.locator('.home-trip-photo').first().evaluate(img=>img.decode().catch(()=>{}));
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}: ${JSON.stringify(await overflow(page))}`);
  assert.equal(await page.locator('.home-trip-link').count(),trips.length);checks++;
  imageResults.push({width,images:await page.locator('.lst-hero-photo,.home-trip-photo').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})))});
  for (const img of await page.locator('.lst-level-photo img,.lst-people-photo img,.lst-review-photo img,.lst-review-symbol:visible,.lst-footer-brand img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(i=>i.decode()); }
  if(width===1440){await page.locator('.lst-footer-links a').first().hover();ok(await page.locator('.lst-footer-links a').first().evaluate(e=>{const s=getComputedStyle(e);return s.color==='rgb(27, 27, 27)'&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(s.borderTopWidth)===0&&s.textDecorationLine.includes('underline');}),'footer hover is a text link with an orange underline');await page.mouse.move(0,0);}
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});
  await checkDateLayout(page,`normal ${width}`);
  if(width===1440){
   const media=page.locator('.home-trip').first();const dates=page.locator('[data-home-dates]').first();const summary=dates.locator('summary');
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
  ok(await page.locator('.lst-level-card p').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),`level descriptions stay inside their cards at200% (${width})`);
  await checkDateLayout(page,`text 200% ${width}`);
  await page.close();
 }
 fixtureMode=true;
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await touch.goto(base);const dates=touch.locator('[data-home-dates]').first();const summary=dates.locator('summary');
 await summary.tap({position:{x:25,y:25}});ok(await dates.evaluate(e=>e.open),'touch opens');
 assert.equal(await dates.locator('li').count(),18);checks++;
 ok(!(await dates.locator('.home-trip-dates-panel').innerText()).includes('Precio')&&!(await dates.locator('.home-trip-dates-panel').innerText()).includes('€'),'date overlay contains dates without prices or prose');
 await checkDateLayout(touch,'18 departures on touch');
 ok(await dates.locator('li').evaluateAll(es=>es.every((e,i)=>!i||e.getBoundingClientRect().top>es[i-1].getBoundingClientRect().top)),'departures are stacked from top to bottom');
 await dates.locator('.home-trip-dates-panel').evaluate(e=>e.scrollTop=e.scrollHeight);
 ok(await dates.locator('li').last().evaluate(e=>{const panel=e.closest('.home-trip-dates-panel'),r=e.getBoundingClientRect(),p=panel.getBoundingClientRect();return panel.scrollHeight>panel.clientHeight&&r.top>=p.top&&r.bottom<=p.bottom+1;}),'last departure scrolls fully into the date panel without covering the title');
 await dates.locator('.home-trip-dates-panel').evaluate(e=>e.scrollTop=0);
 await touch.locator('.home-trip-photo').evaluate(e=>e.decode());
 await touch.screenshot({path:path.join(output,'home-dates-mobile.png'),fullPage:false});
 await summary.tap({position:{x:25,y:25}});ok(await dates.evaluate(e=>!e.open),'touch closes');
 await touch.locator('.home-trip-link').click();ok(new URL(touch.url()).pathname===`/viajes/${fixture.slug}/`,'direct trip link');await touch.close();

 for(const width of [320,768]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  for(const zoom of [1,2]){
   if(zoom===2)await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   const dateList=page.locator('[data-home-dates]').first();await dateList.evaluate(e=>e.open=true);
   await checkDateLayout(page,'long full dates '+width+' text '+zoom*100+'%');
   await dateList.locator('.home-trip-dates-panel').evaluate(e=>e.scrollTop=e.scrollHeight);
   ok(await dateList.locator('li:last-child>.departure-row-date').evaluate(e=>{const panel=e.closest('.home-trip-dates-panel'),r=e.getBoundingClientRect(),p=panel.getBoundingClientRect(),style=getComputedStyle(panel);return r.top>=p.top+parseFloat(style.paddingTop)-1&&r.bottom<=p.bottom-parseFloat(style.paddingBottom)+1;}),'complete last date remains readable in its panel at '+width+', text '+zoom*100+'%');
  }
  await page.close();
 }
 fixtureMode=false;
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await nojs.goto(base);ok(await nojs.locator('.static-navigation').isVisible(),'noJS navigation');
 await nojs.locator('[data-home-dates] summary').first().click({position:{x:20,y:20}});ok(await nojs.locator('[data-home-dates]').first().evaluate(e=>e.open),'noJS dates open');
 await checkDateLayout(nojs,'native dates without JavaScript');
 const more=nojs.locator('.home-more-trips');if(await more.count()){await more.locator(':scope>summary').click();ok(await more.evaluate(e=>e.open),'noJS more trips');ok(await more.locator(':scope>summary>span').evaluate(e=>getComputedStyle(e).transform==='none'),'more trips control stays straight');}
 await nojs.close();assert.deepEqual(errors,[]);
 await writeFile(path.join(output,'results.json'),JSON.stringify({checks,errors,imageResults,layoutResults},null,2));
 console.log(`PASS: ${checks} home browser checks; responsive, text 200%, hover, tap, keyboard, long dates, direct links and noJS. Evidence: ${output}`);
}finally{await browser.close();await new Promise(r=>server.close(r));}

