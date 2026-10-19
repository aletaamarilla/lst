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
const report={checks:[],issues:[],errors:[],views:[]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const photos=page=>page.locator('img').evaluateAll(async es=>Promise.all(es.map(e=>{e.loading='eager';return e.decode()})));
try{
 for(const width of [320,390,768,1024,1440]){
  for(const mode of ['normal','text200','no-js']){
   const height=width===1440?1000:844, tag=`${width}-${mode}`;
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js',hasTouch:width<700});
   const external=[];
   await context.route('https://**/*',route=>{external.push(route.request().url());return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Consulta interceptada localmente</title>'});});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push({tag,message:e.message}));
   check(tag+' HTTP 200',(await page.goto(base+'/conocenos/')).status()===200);
   await page.evaluate(()=>document.fonts.ready);await photos(page);
   if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   const geometry=await page.evaluate(()=>{
    const h=document.querySelector('header'),b=h.getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect();
    const overflow=[...document.querySelectorAll('main *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60)}));
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,headerHeight:b.height,headerPosition:getComputedStyle(h).position,titleTop:title.top,overflow,images:[...document.querySelectorAll('main img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,fullFrame:Math.abs(i.clientWidth/i.clientHeight-i.naturalWidth/i.naturalHeight)<.02})),fonts:{heading:getComputedStyle(document.querySelector('h1')).fontFamily,body:getComputedStyle(document.body).fontFamily,label:getComputedStyle(document.querySelector('.eyebrow')).fontFamily},h1:document.querySelectorAll('h1').length};
   });
   report.views.push({tag,...geometry});
   check(tag+' no overflow',geometry.scrollWidth<=width+1&&geometry.overflow.length===0,geometry.overflow);
   check(tag+' fixed header clears title',geometry.headerPosition==='fixed'&&geometry.titleTop>=geometry.headerHeight);
   check(tag+' complete documentary frames',geometry.images.every(i=>i.loaded&&i.fullFrame),geometry.images);
   check(tag+' retained fonts and heading',geometry.h1===1&&geometry.fonts.heading.includes('Aura')&&geometry.fonts.body.includes('Work Sans')&&geometry.fonts.label.includes('Space Mono'));
   const mainText=await page.locator('main').innerText();
   check(tag+' required content',mainText.includes('Lucas')&&mainText.includes('Nos vemos en el pico.')&&mainText.includes('Marruecos')&&mainText.includes('La plaza se confirma con el equipo.'));
   check(tag+' no unsupported promises',!/Universal Plastic|3\s*%|recogida de plásticos|garantiz|certificad|placeholder/i.test(mainText));
   if(mode==='normal'){
    await page.screenshot({path:path.join(out,'capturas',`conocenos-${width}.png`),fullPage:true});
    if([390,1440].includes(width))await page.screenshot({path:path.join(out,'capturas',`apertura-${width}.png`)});
   }
   if(mode!=='no-js'){
    await page.getByRole('link',{name:'Te contamos cómo empezó'}).click();
    const anchor=await page.evaluate(()=>({header:document.querySelector('header').getBoundingClientRect().bottom,heading:document.querySelector('#origin-title').getBoundingClientRect().top,fixed:document.querySelector('header').getBoundingClientRect().top}));
    check(tag+' origin anchor clears fixed header',anchor.heading>=anchor.header-1&&anchor.fixed===0,anchor);
    if(width<1000){
     const toggle=page.locator('.menu-toggle');await toggle.click();
     check(tag+' menu open',await toggle.getAttribute('aria-expanded')==='true'&&await page.locator('#main-nav').isVisible());
     const current=page.locator('#main-nav [aria-current="page"]');
     check(tag+' current page in menu',await current.innerText()==='Conócenos');
     await page.keyboard.press('Escape');
     check(tag+' Escape restores focus',await toggle.getAttribute('aria-expanded')==='false'&&await toggle.evaluate(e=>e===document.activeElement));
     await toggle.click();await page.locator('#main-nav a[href="/niveles/"]').click();await page.waitForURL(base+'/niveles/');
     check(tag+' mobile navigation to levels',await page.locator('h1').count()===1);
     await page.goBack();await page.waitForURL(base+'/conocenos/#origen');
    }
   }
   if(mode==='normal'){
    const contact=page.locator('[data-whatsapp="conocenos"]');
    const popup=page.waitForEvent('popup');await contact.click();const p=await popup;await p.waitForLoadState();await p.close();
    check(tag+' WhatsApp consult intercepted',external.length===1&&external[0].startsWith('https://wa.me/34648189257?')&&new URL(external[0]).searchParams.get('text').includes('quién acompañará'));
    await page.locator('.about-actions a[href="/#viajes"]').click();await page.waitForURL(base+'/#viajes');
    check(tag+' trips CTA reaches existing calendar',await page.locator('#viajes .home-trip').count()===6);
    await page.locator('#nosotros a[href="/conocenos/"]').click();await page.waitForURL(base+'/conocenos/');
    check(tag+' home introduction leads to about',await page.locator('h1').innerText()==='Gente, sal\ny ganas\nde repetir.');
    await page.goto(base+'/');await photos(page);await page.locator('#nosotros').scrollIntoViewIfNeeded();
    if([390,1440].includes(width))await page.locator('#nosotros').screenshot({path:path.join(out,'capturas',`home-resumen-${width}.png`),style:'.site-header{visibility:hidden!important}'});
    const trips=JSON.parse(fs.readFileSync('data/trips.json'));
    for(const t of trips){
     await page.goto(base+`/viajes/${t.slug}/`);
     const team=page.locator('.trip-team');check(tag+' '+t.slug+' team text preserved',(await team.innerText()).includes(t.state==='confirmed'?t.team.text:'está pendiente'));
     await team.getByRole('link',{name:'Conoce cómo viajamos en LST'}).click();await page.waitForURL(base+'/conocenos/#acompanamiento');
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
  await page.keyboard.press('Tab');check(width+' skip link focus',await page.locator('.skip-link').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');check(width+' skip link target',await page.locator('main').evaluate(e=>e===document.activeElement));
  await page.getByRole('link',{name:'Te contamos cómo empezó'}).click();await page.waitForFunction(()=>Math.abs(document.querySelector('#origen').getBoundingClientRect().top-document.querySelector('header').getBoundingClientRect().height-12)<3);
  check(width+' smooth scroll arrival',await page.locator('#origin-title').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('header').getBoundingClientRect().bottom));
  await page.screenshot({path:path.join(out,'capturas',`pantalla-baja-${width}.png`)});await context.close();
 }
}finally{await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));}
if(report.issues.length||report.errors.length)throw Error(JSON.stringify({issues:report.issues,errors:report.errors},null,2));
console.log(`PASS: ${report.views.length} responsive views; ${report.checks.length} checks; local navigation, full image frames, fixed header, keyboard, no JS, 200% text and intercepted WhatsApp.`);
