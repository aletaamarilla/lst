// Optional browser acceptance checks. Uses the same external runtime as other LST checks.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||path.join(os.tmpdir(),'lst-about');
fs.mkdirSync(path.join(out,'capturas'),{recursive:true});
const trips=JSON.parse(fs.readFileSync('dist/catalog-snapshot.json')).trips;
const report={checks:[],issues:[],errors:[],views:[]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const photos=page=>page.locator('img').evaluateAll(async es=>Promise.all(es.map(e=>{e.loading='eager';return e.decode().catch(()=>{})})));
const anchorClears=(page,id)=>page.evaluate(id=>({header:document.querySelector('header').getBoundingClientRect().bottom,fixed:document.querySelector('header').getBoundingClientRect().top,heading:document.querySelector(`#${id}`).getBoundingClientRect().top}),id);
try{
 for(const width of [320,390,768,1024,1440]){
  for(const mode of ['normal','text200','no-js']){
   const height=width===1440?1000:844, tag=`${width}-${mode}`;
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js',hasTouch:width<700});
   const external=[];
   await context.route('https://**/*',route=>{if(new URL(route.request().url()).hostname==='cdn.sanity.io')return route.continue();external.push(route.request().url());return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Consulta interceptada localmente</title>'});});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push({tag,message:e.message}));
   page.on('console',m=>{if(m.type()==='error')report.errors.push({tag,console:m.text()});});
   check(tag+' HTTP 200',(await page.goto(base+'/conocenos/')).status()===200);
   await page.evaluate(()=>document.fonts.ready);await photos(page);
   if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   const geometry=await page.evaluate(()=>{
    const h=document.querySelector('header'),b=h.getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect();
    const overflow=[...document.querySelectorAll('main *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60)}));
    const loaded=family=>[...document.fonts].some(f=>f.family.replace(/["']/g,'')===family&&f.status==='loaded');
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,headerHeight:b.height,headerPosition:getComputedStyle(h).position,titleTop:title.top,overflow,
     images:[...document.querySelectorAll('main img')].map(i=>({src:i.getAttribute('src'),alt:i.getAttribute('alt'),loaded:i.complete&&i.naturalWidth>0,
      background:!!i.closest('.ab-hero .lp-hero-photo')||i.matches('.ab-respect-bg'),documentary:!!i.closest('figure.ab-photo,figure.ab-postcard-photo'),caption:i.closest('figure')?.querySelector('figcaption')?.textContent.trim()||'',
      cover:getComputedStyle(i).objectFit==='cover',fullFrame:Math.abs(i.clientWidth/i.clientHeight-i.naturalWidth/i.naturalHeight)<.02})),
     fonts:{heading:getComputedStyle(document.querySelector('h1')).fontFamily,section:getComputedStyle(document.querySelector('.ab-h')).fontFamily,body:getComputedStyle(document.body).fontFamily,label:document.querySelector('.eyebrow')?getComputedStyle(document.querySelector('.eyebrow')).fontFamily:null,auraLoaded:loaded('Aura'),workSansLoaded:loaded('Work Sans'),auraFile:performance.getEntriesByType('resource').some(e=>new URL(e.name).pathname==='/assets/fonts/aura.woff2')},
     h1:document.querySelectorAll('h1').length};
   });
   report.views.push({tag,...geometry});
   check(tag+' no overflow',geometry.scrollWidth<=width+1&&geometry.overflow.length===0,geometry.overflow);
   // With JS the header is fixed over the photo; without JS home.css turns it into a paper bar in the flow.
   check(tag+' header clears title',geometry.headerPosition===(mode==='no-js'?'relative':'fixed')&&geometry.titleTop>=geometry.headerHeight,{position:geometry.headerPosition,titleTop:geometry.titleTop,header:geometry.headerHeight});
   const masthead=await page.locator('.site-header').evaluate(e=>({ink:getComputedStyle(e).color,paper:getComputedStyle(e).backgroundColor,light:getComputedStyle(e.querySelector('.brand-light')).display,dark:getComputedStyle(e.querySelector('.brand-dark')).display}));
   // The opening is a full-bleed photo: cream masthead with the light logo (without JS, the paper bar).
   check(tag+' masthead colours and logo',mode==='no-js'?masthead.ink==='rgb(27, 27, 27)'&&masthead.light==='none'&&masthead.dark==='block':masthead.ink==='rgb(255, 250, 231)'&&masthead.light==='block'&&masthead.dark==='none',masthead);
   const heroSpacing=await page.locator('.ab-hero').evaluate(e=>({copyTop:e.querySelector('h1').getBoundingClientRect().top,captionBottom:e.querySelector('.lp-hero-cap').getBoundingClientRect().bottom}));
   check(tag+' photo caption clears copy',heroSpacing.captionBottom+8<=heroSpacing.copyTop,heroSpacing);
   // Background photos (hero and respect) crop with cover; album photos keep their full frame and a caption.
   check(tag+' photos load, background photos cover and documentary photos have a caption',geometry.images.filter(i=>i.background).length===2&&geometry.images.filter(i=>!i.src.includes('/brand/')).every(i=>i.loaded&&(i.background?i.cover:i.documentary&&i.caption.length>0)),geometry.images);
   check(tag+' images have alt text',geometry.images.every(i=>i.alt!==null&&(i.src.includes('francia-atardecer')||i.src.includes('/brand/')?i.alt==='':i.alt.trim().length>10)),geometry.images.map(i=>({src:i.src,alt:i.alt})));
   check(tag+' retained fonts and heading',geometry.h1===1&&geometry.fonts.heading.includes('Aura')&&geometry.fonts.section.includes('Aura')&&geometry.fonts.body.includes('Work Sans')&&(geometry.fonts.label??'Work Sans').includes('Work Sans')&&geometry.fonts.auraLoaded&&geometry.fonts.workSansLoaded&&geometry.fonts.auraFile,geometry.fonts);
   const mainText=await page.locator('main').evaluate(e=>e.textContent.replace(/\s+/g,' '));
   check(tag+' required content',['Lucas','Nos vemos en el pico.','Marruecos fue el principio','Venimos con vosotros','Al mar se viene con respeto','La plaza se confirma con el equipo.'].every(t=>mainText.includes(t)));
   check(tag+' no unsupported promises',!/Universal Plastic|3\s*%|recogida de plásticos|garantiz|certificad|placeholder/i.test(mainText));
   if(mode==='normal'){
    await page.screenshot({path:path.join(out,'capturas',`conocenos-${width}.png`),fullPage:true});
    if([390,1440].includes(width))await page.screenshot({path:path.join(out,'capturas',`apertura-${width}.png`)});
    check(tag+' tap targets at least 44px',await page.locator('main a, main button').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&!e.closest('p')).every(e=>e.getBoundingClientRect().height>=44)));
    check(tag+' footer links',await page.locator('.lst-footer-links a').count()>=5&&await page.locator('.footer-legal a').count()===4);
   }
   if(mode!=='no-js'){
    for(const id of ['origen','asi-viajamos','acompanamiento']){
     await page.goto(base+`/conocenos/#${id}`);await page.evaluate(()=>document.fonts.ready);
     const anchor=await anchorClears(page,id);
     check(tag+' anchor clears fixed header '+id,anchor.heading>=anchor.header-1&&anchor.fixed===0,anchor);
    }
    if(width<1000){
     const toggle=page.locator('.menu-toggle');await toggle.click();
     check(tag+' menu open',await toggle.getAttribute('aria-expanded')==='true'&&await page.locator('#main-nav').isVisible());
     const current=page.locator('#main-nav [aria-current="page"]');
     check(tag+' current page in menu',await current.innerText()==='Conócenos');
     await page.keyboard.press('Escape');
     check(tag+' Escape restores focus',await toggle.getAttribute('aria-expanded')==='false'&&await toggle.evaluate(e=>e===document.activeElement));
     await toggle.click();await page.locator('#main-nav a[href="/niveles/"]').click();await page.waitForURL(base+'/niveles/');
     check(tag+' mobile navigation to levels',await page.locator('h1').count()===1);
     await page.goBack();await page.waitForURL(base+'/conocenos/#acompanamiento');
    }
   }else{
    check(tag+' no-JS navigation visible',await page.locator('.static-navigation a').count()===4&&await page.locator('.static-navigation a[href="/viajes/"]').isVisible());
   }
   if(mode==='normal'){
    const contact=page.locator('[data-whatsapp="conocenos"]');
    const popup=page.waitForEvent('popup');await contact.click();const p=await popup;await p.waitForLoadState();await p.close();
    check(tag+' WhatsApp consult intercepted',external.length===1&&external[0].startsWith('https://wa.me/34648189257?')&&new URL(external[0]).searchParams.get('text').includes('quién acompañará'),external);
    await page.locator('.about-actions a[href="/viajes/"]').click();await page.waitForURL(base+'/viajes/');
    check(tag+' trips CTA reaches catalog',await page.locator('[data-catalog-trip]').count()===trips.length);
    await page.goto(base+'/');
    await page.locator('#nosotros a[href="/conocenos/"]').click();await page.waitForURL(base+'/conocenos/');
    check(tag+' home introduction leads to about',(await page.locator('h1').textContent()).replace(/\s+/g,' ').trim()==='Tú trae las ganas');
    await page.goto(base+'/');await photos(page);await page.locator('#nosotros').scrollIntoViewIfNeeded();
    if([390,1440].includes(width))await page.locator('#nosotros').screenshot({path:path.join(out,'capturas',`home-resumen-${width}.png`),style:'.site-header{visibility:hidden!important}'});
    for(const t of trips){
     await page.goto(base+`/viajes/${t.slug}/`);
     const team=page.locator('.trip-team');check(tag+' '+t.slug+' team text preserved',(await team.innerText()).includes(t.state==='confirmed'?(t.team?.text||'Consulta con LST'):'está pendiente'));
     await team.locator('a[href="/conocenos/#acompanamiento"]').click();await page.waitForURL(base+'/conocenos/#acompanamiento');
     const position=await page.evaluate(()=>({top:document.querySelector('#team-title').getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom}));
     check(tag+' '+t.slug+' accompaniment reachable',position.top>=position.header-1,position);
    }
   }
   if(mode==='text200'&&[390,1440].includes(width))await page.screenshot({path:path.join(out,'capturas',`texto200-${width}.png`),fullPage:true});
   await context.close();
  }
 }
 // Short-screen reading, normal motion and keyboard navigation in a real browser.
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:500}});await context.route('https://**/*',r=>r.abort());const page=await context.newPage();await page.goto(base+'/conocenos/');await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Tab');check(width+' skip link focus',await page.locator('.skip-link').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'&&e.getBoundingClientRect().top>=0));await page.keyboard.press('Enter');check(width+' skip link target',await page.locator('main').evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Tab');
  check(width+' keyboard focus is visible',await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return e.matches(':focus-visible')&&s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2;}));
  await photos(page);await page.evaluate(()=>{location.hash='origen';});
  // Smooth scrolling has finished when the page stops moving after leaving the top.
  // Headless smooth scrolling can pause between frames, so wait for 600 ms without movement.
  await page.waitForFunction(()=>new Promise(r=>{const y=scrollY;setTimeout(()=>r(y>0&&scrollY===y),600);}),null,{polling:200,timeout:15000});
  check(width+' smooth scroll arrival',await page.locator('#origin-title').evaluate(e=>{const t=e.getBoundingClientRect().top;return t>=document.querySelector('header').getBoundingClientRect().bottom-1&&t<innerHeight;}),await page.locator('#origin-title').evaluate(e=>({top:e.getBoundingClientRect().top,scrollY,innerHeight})));
  await page.screenshot({path:path.join(out,'capturas',`pantalla-baja-${width}.png`)});await context.close();
 }
}finally{await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));}
if(report.issues.length||report.errors.length)throw Error(JSON.stringify({issues:report.issues,errors:report.errors},null,2));
console.log(`PASS: ${report.views.length} responsive views; ${report.checks.length} checks; anchors, full image frames, fixed header, keyboard, no JS, 200% text and intercepted WhatsApp.`);
