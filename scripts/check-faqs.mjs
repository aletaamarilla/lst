// Optional browser acceptance test, using the external runtime already used by LST.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||path.join(os.tmpdir(),'lst-faqs');
fs.mkdirSync(path.join(out,'capturas'),{recursive:true});
const report={checks:[],issues:[],errors:[],views:[]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const trips=JSON.parse(fs.readFileSync('dist/catalog-snapshot.json')).trips;
const routes=['/','/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/',...trips.map(t=>`/viajes/${t.slug}/`)];
const links=['/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/'];
const measure=page=>page.evaluate(()=>{
 const h=document.querySelector('.site-header'),b=h.getBoundingClientRect();
 const overflow=[...document.querySelectorAll('main *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,50)}));
 return {scrollWidth:document.documentElement.scrollWidth,headerHeight:b.height,headerPosition:getComputedStyle(h).position,titleTop:document.querySelector('h1').getBoundingClientRect().top,overflow,fonts:{heading:getComputedStyle(document.querySelector('h1')).fontFamily,body:getComputedStyle(document.body).fontFamily,label:getComputedStyle(document.querySelector('.eyebrow')).fontFamily}};
});
try{
 for(const width of [320,390,768,1024,1440])for(const mode of ['normal','text200','no-js']){
  const tag=`${width}-${mode}`,height=width>=1000?1000:844;
  const context=await browser.newContext({viewport:{width,height},javaScriptEnabled:mode!=='no-js',reducedMotion:'reduce'});
  const external=[];
  await context.route('https://**/*',r=>{if(new URL(r.request().url()).hostname==='cdn.sanity.io')return r.continue();external.push(r.request().url());return r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Consulta interceptada localmente</title>'});});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push({tag,message:e.message}));
  check(tag+' FAQ HTTP 200',(await page.goto(base+'/preguntas-frecuentes/')).status()===200);
  await page.evaluate(()=>document.fonts.ready);
  if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
  const geometry=await measure(page);report.views.push({tag,...geometry});
  check(tag+' no horizontal overflow',geometry.scrollWidth<=width+1&&geometry.overflow.length===0,geometry);
  check(tag+' title clears header',geometry.titleTop>=geometry.headerHeight,geometry);
  const masthead=await page.locator('.site-header').evaluate(e=>({ink:getComputedStyle(e).color,paper:getComputedStyle(e).backgroundColor,light:getComputedStyle(e.querySelector('.brand-light')).display,dark:getComputedStyle(e.querySelector('.brand-dark')).display}));
  const heroSpacing=await page.locator('.faq-hero').evaluate(e=>({copyTop:e.querySelector('h1').getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom}));
  check(tag+' paper opening clears header',heroSpacing.copyTop>=heroSpacing.headerBottom,heroSpacing);
  check(tag+' masthead colours and logo',masthead.ink==='rgb(27, 27, 27)'&&masthead.paper==='rgb(255, 250, 231)'&&masthead.light==='none'&&masthead.dark==='block',masthead);
  check(tag+' opening uses typography without a repeated photo',await page.locator('.faq-hero img').count()===0);
  check(tag+' useful category icons',await page.locator('.faq-topic-heading > svg[aria-hidden="true"]').count()===4);
  check(tag+' retained fonts',geometry.fonts.heading.includes('Aura')&&geometry.fonts.body.includes('Work Sans')&&geometry.fonts.label.includes('Space Mono'));
  await page.keyboard.press('Tab');check(tag+' skip-link first',await page.locator('.skip-link').evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Enter');check(tag+' skip-link focuses main',await page.locator('main').evaluate(e=>e===document.activeElement));
  // Use native keyboard activation; neither app.js nor a custom accordion is involved.
  const summaries=page.locator('.faq-answers summary');
  for(let i=0;i<await summaries.count();i++){
   await summaries.nth(i).focus();await page.keyboard.press(i%2?'Space':'Enter');
   check(tag+' keyboard opens answer '+i,await summaries.nth(i).evaluate(e=>e.parentElement.open));
  }
  check(tag+' answer links are visibly underlined',await page.locator('.faq-answers a').evaluateAll(es=>es.every(e=>getComputedStyle(e).textDecorationLine.includes('underline'))));
  check(tag+' multiple answers stay open',await page.locator('.faq-answers details[open]').count()===8);
  const openGeometry=await measure(page);check(tag+' open answers do not overflow',openGeometry.scrollWidth<=width+1&&openGeometry.overflow.length===0,openGeometry.overflow);
  await summaries.first().focus();await page.keyboard.press('Enter');check(tag+' independent close preserves others',await page.locator('.faq-answers details[open]').count()===7);
  for(const id of ['grupo','nivel','preparacion','reserva']){
   await page.locator(`.faq-index a[href="#${id}"]`).click();
   const position=await page.evaluate(id=>({header:document.querySelector('header').getBoundingClientRect().bottom,title:document.querySelector(`#${id}-title`).getBoundingClientRect().top}),id);
   check(tag+' anchor clears header '+id,position.title>=position.header-1,position);
  }
  if(mode!=='no-js'){
   check(tag+' fixed header after scrolling',await page.locator('.site-header').evaluate(e=>getComputedStyle(e).position==='fixed'&&Math.abs(e.getBoundingClientRect().top)<1));
   if(width<1000){
    const toggle=page.locator('.menu-toggle');await toggle.focus();await page.keyboard.press('Enter');
    check(tag+' keyboard opens menu',await toggle.getAttribute('aria-expanded')==='true'&&await page.locator('#main-nav').isVisible());
    await page.keyboard.press('Tab');check(tag+' next focus is Viajes',await page.locator('#main-nav a').first().evaluate(e=>e===document.activeElement));
    if(mode==='normal'&&width===390)await page.screenshot({path:path.join(out,'capturas','menu-390.png')});
    await page.keyboard.press('Escape');check(tag+' Escape closes and restores focus',await toggle.getAttribute('aria-expanded')==='false'&&await toggle.evaluate(e=>e===document.activeElement));
    await toggle.click();await page.locator('#main-nav a[href="/niveles/"]').click();await page.waitForURL(base+'/niveles/');
    check(tag+' mobile menu navigation',await page.locator('h1').count()===1);
    await page.goBack();
   }else{
    const boxes=await page.locator('.site-header > a:visible, #main-nav a:visible').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom};}));
    const overlap=boxes.some((a,i)=>boxes.slice(i+1).some(b=>Math.min(a.right,b.right)>Math.max(a.left,b.left)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1));
    check(tag+' desktop menu fits',!overlap&&boxes.every(b=>b.left>=0&&b.right<=width),boxes);
   }
  }else{
   for(const href of links){const a=page.locator(`.static-navigation a[href="${href}"]`);check(tag+' no-JS navigation visible '+href,await a.isVisible());}
   await page.locator('.static-navigation a[href="/viajes/"]').click();await page.waitForURL(base+'/viajes/');
   check(tag+' no-JS catalog has all destinations',await page.locator('[data-catalog-trip]').count()===trips.length);
   await page.goBack();
  }
  // Navigation may restore collapsed state; save deliberate open/closed examples.
  if(mode==='normal'){
   await page.goto(base+'/preguntas-frecuentes/');await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(out,'capturas',`faq-${width}.png`),fullPage:true});
   if([390,1440].includes(width)){
    await page.screenshot({path:path.join(out,'capturas',`apertura-${width}.png`)});
    await page.locator('#preparacion summary').first().click();await page.locator('#preparacion summary').nth(1).click();
    await page.locator('#preparacion').screenshot({path:path.join(out,'capturas',`respuestas-${width}.png`),style:'.site-header{visibility:hidden!important}'});
   }
   const popup=page.waitForEvent('popup');await page.locator('[data-whatsapp="preguntas-frecuentes"]').click();const p=await popup;await p.waitForLoadState();await p.close();
   check(tag+' WhatsApp is an intercepted enquiry',external.length===1&&external[0].startsWith('https://wa.me/34648189257?')&&new URL(external[0]).searchParams.get('text').includes('una duda'));
   await page.goto(base+'/');
   check(tag+' home keeps three questions',await page.locator('#dudas details').count()===3);
   await page.locator('#dudas a[href="/preguntas-frecuentes/"]').click();await page.waitForURL(base+'/preguntas-frecuentes/');
   check(tag+' home enters full FAQ',await page.locator('.faq-topic').count()===4);
  }
  if(mode!=='normal'&&[390,1440].includes(width))await page.screenshot({path:path.join(out,'capturas',`${mode}-${width}.png`),fullPage:true});
  await context.close();
 }
 for(const width of [320,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});await context.route('https://**/*',r=>r.abort());
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push({width,message:e.message}));
  for(const route of routes){
   const response=await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
   check(`${width} route ${route}`,response.status()===200&&await page.locator('h1').count()===1);
   check(`${width} noindex ${route}`,await page.locator('meta[name=robots]').getAttribute('content')==='noindex,nofollow');
   check(`${width} page fits ${route}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(links.includes(route)){
    if(width<1000)await page.locator('.menu-toggle').click();
    for(const href of links)check(`${width} header link ${route} -> ${href}`,await page.locator(`#main-nav a[href="${href}"]`).isVisible());
    check(`${width} logo home ${route}`,await page.locator('.site-header .brand').getAttribute('href')==='/');
   }
   if(route.startsWith('/viajes/')&&route!=='/viajes/'){
    const trip=trips.find(t=>route===`/viajes/${t.slug}/`);
    const questions=trip.faqs.length;
    check(`${width} specific FAQs preserved ${route}`,await page.locator('.trip-faq details').count()===questions);
    for(let i=0;i<Math.min(questions,2);i++)await page.locator('.trip-faq summary').nth(i).click();
    check(`${width} detail disclosures work ${route}`,await page.locator('.trip-faq details[open]').count()===Math.min(questions,2));
    await page.locator('footer a[href="/preguntas-frecuentes/"]').click();await page.waitForURL(base+'/preguntas-frecuentes/');
   }
  }
  await context.close();
 }
 // Short display: menu must scroll instead of trapping links below the viewport.
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:500},reducedMotion:'reduce'});const page=await context.newPage();await page.goto(base+'/preguntas-frecuentes/');
  if(width<1000){await page.locator('.menu-toggle').click();const last=page.locator('#main-nav a').last();await last.focus();check(width+' short menu contact reachable',await last.evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));}
  await page.screenshot({path:path.join(out,'capturas',`pantalla-baja-${width}.png`)});await context.close();
 }
}finally{await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));}
if(report.issues.length||report.errors.length)throw Error(JSON.stringify({issues:report.issues,errors:report.errors},null,2));
console.log(`PASS: ${report.views.length} FAQ views, ${report.checks.length} behavior checks, ${routes.length} routes; keyboard, disclosures, menu, no JS, 200% text and intercepted WhatsApp.`);
