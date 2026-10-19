// Optional browser regression checks; uses an existing Playwright installation.
// Start npm run dev first. See docs/qa/2026-10-12-whatsapp/README.md.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {departuresFor, departureMessage, tripMessage} from './trip-model.mjs';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.LST_QA_OUTPUT || path.join(os.tmpdir(), 'lst-ux-verification');
fs.mkdirSync(output, {recursive: true});
const trips = JSON.parse(fs.readFileSync(new URL('../data/trips.json', import.meta.url)));
const baseURL = process.env.LST_PREVIEW_URL || 'http://127.0.0.1:4175';
let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
 const report={checks:[],issues:[],whatsapp:[],errors:[]};
 const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
 for(const [width,height,zoom] of [[320,740,1],[390,844,1],[768,1024,1],[1024,900,1],[1440,900,1],[390,480,1],[320,568,1],[390,480,2],[320,740,2]]){
  for(const slug of ['home','el-salvador','asturias','azores']){
   const tag=`${slug} ${width}x${height} text${zoom*100}`;
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   await context.route('https://**/*',async route=>{const url=new URL(route.request().url());if(url.hostname==='wa.me'){report.whatsapp.push({tag,url:url.href,message:url.searchParams.get('text')});await route.fulfill({contentType:'text/plain',body:'WhatsApp intercepted locally. No message sent.'});}else await route.abort();});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push({tag,error:e.message}));
   await page.goto(baseURL+'/' +(slug==='home'?'':`viajes/${slug}/`));await page.evaluate(()=>document.fonts.ready);
   if(zoom===2)await page.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')];const sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   await page.waitForTimeout(50);
   const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,rootBehavior:getComputedStyle(document.documentElement).scrollBehavior,transition:getComputedStyle(document.querySelector('.button')).transitionDuration}));
   check(tag+' no horizontal overflow',dimensions.scrollWidth<=width,dimensions);
   check(tag+' reduced motion',dimensions.rootBehavior==='auto'&&dimensions.transition==='0s',dimensions);
   if(slug==='home'){
    check(tag+' exploration CTA',(await page.locator('.hero-primary').getAttribute('href'))==='#viajes');
    check(tag+' destinations',JSON.stringify(await page.locator('.destination-preview-action').allTextContents()).includes('Ver destino')&&!(await page.locator('.destination-preview-action').allTextContents()).some(t=>t.includes('Me interesa')));
    if(width<1000){
     await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
     check(tag+' first tab enters menu',await page.evaluate(()=>document.activeElement===document.querySelector('#main-nav a')));
     for(let i=1;i<await page.locator('#main-nav a').count();i++)await page.keyboard.press('Tab');
     check(tag+' menu WhatsApp focus',await page.evaluate(()=>document.activeElement.matches('.nav-whatsapp')));
     const popupPromise=context.waitForEvent('page');await page.keyboard.press('Enter');const popup=await popupPromise;await popup.waitForLoadState();await popup.close();
     check(tag+' WhatsApp closes menu, restores focus',await page.evaluate(()=>document.activeElement.matches('.menu-toggle')&&!document.querySelector('#main-nav').classList.contains('is-open')));
     await page.keyboard.press('Enter');await page.keyboard.press('Escape');
     check(tag+' Escape',await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false');
     await page.keyboard.press('Enter');for(let i=0;i<(await page.locator('#main-nav a').count())+1;i++)await page.keyboard.press('Tab');
     check(tag+' Tab exits disclosure',await page.evaluate(()=>document.activeElement.matches('.hero-primary')&&!document.querySelector('#main-nav').classList.contains('is-open')));
     await page.locator('.menu-toggle').click();await page.locator('#main-nav a[href="#viajes"]').click();
     check(tag+' navigation closes menu',await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false');
    } else {
     check(tag+' desktop WhatsApp visible',await page.locator('.header-cta').isVisible());
    }
    await page.locator('.hero-primary').click();
    const y=await page.locator('#viajes').evaluate(e=>e.getBoundingClientRect().top);check(tag+' exploration scrolls to trips',y>=0&&y<150,y);
   }else{
    const action=width>=1000?page.locator('.trip-header-cta'):page.locator('.dock-cta');
    if(slug==='asturias'){
     await action.scrollIntoViewIfNeeded();const pos=await page.evaluate(()=>scrollY);await action.click();
     check(tag+' dates open and close focused',await page.evaluate(()=>document.querySelector('.departure-dialog').open&&document.activeElement.matches('.departure-close')));
     await page.keyboard.press('Shift+Tab');check(tag+' reverse focus wraps to last date',await page.evaluate(()=>document.activeElement===Array.from(document.querySelectorAll('.departure-enquiry')).at(-1)));
     for(const link of await page.locator('.departure-enquiry').all()){
      await link.scrollIntoViewIfNeeded();
      const usable=await link.evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;});
      check(tag+' date is reachable',usable,await link.getAttribute('data-departure'));
      const popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;await popup.waitForLoadState();await popup.close();
     }
     await page.keyboard.press('Escape');await page.waitForTimeout(50);
     check(tag+' dates restore focus and scroll',await page.evaluate(()=>!document.querySelector('.departure-dialog').open&&document.activeElement.matches('[data-open-dates]'))&&Math.abs(await page.evaluate(()=>scrollY)-pos)<3);
    }else{
     const popupPromise=context.waitForEvent('page');await action.click();const popup=await popupPromise;await popup.waitForLoadState();await popup.close();
    }
    await page.locator('[data-open-gallery]').click();await page.keyboard.press('ArrowRight');
    check(tag+' gallery keyboard and reduced motion',await page.locator('.photo-counter').innerText()==='2 / '+await page.locator('.photo-slide').count());
    await page.keyboard.press('Escape');await page.waitForTimeout(50);check(tag+' gallery focus restored',await page.evaluate(()=>document.activeElement.matches('[data-open-gallery]')));
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    const bottom=await page.evaluate(()=>{const dock=document.querySelector('.trip-dock');const f=document.querySelector('.trip-footer').getBoundingClientRect();return {footerBottom:f.bottom,dockTop:dock.getBoundingClientRect().top,position:getComputedStyle(dock).position,display:getComputedStyle(dock).display,padding:parseFloat(getComputedStyle(document.body).paddingBottom),dockHeight:dock.getBoundingClientRect().height};});
    check(tag+' footer not covered',bottom.display==='none'||bottom.position!=='fixed'||bottom.footerBottom<=bottom.dockTop+1,bottom);
    // Start a real Tab traversal at the skip link; don't just inspect CSS focus rules.
    await page.locator('.skip-link').focus();
    for(let i=0;i<40;i++){
     await page.keyboard.press('Tab');
     const f=await page.evaluate(()=>{const e=document.activeElement;if(e===document.body||e.closest('header,.trip-dock,dialog'))return null;if(e.matches('.skip-link')){const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.textContent,top:r.top,bottom:r.bottom,limitTop:0,limitBottom:innerHeight,hit:e===hit||e.contains(hit)};}const r=e.getBoundingClientRect();const h=document.querySelector('.trip-header');const d=document.querySelector('.trip-dock');return {tag:e.tagName,text:e.textContent.slice(0,70),top:r.top,bottom:r.bottom,limitTop:getComputedStyle(h).position==='sticky'?h.getBoundingClientRect().bottom:0,limitBottom:getComputedStyle(d).display!=='none'&&getComputedStyle(d).position==='fixed'?d.getBoundingClientRect().top:innerHeight};});
     if(f)check(tag+' keyboard focus visible',f.top>=f.limitTop-1&&f.bottom<=f.limitBottom+1&&f.hit!==false,f);
    }
   }
   await context.close();
  }
 }
 for (const entry of report.whatsapp) {
  const url = new URL(entry.url);
  const slug = entry.tag.split(' ')[0];
  const trip = trips.find(trip => trip.slug === slug);
  const expected = slug === 'home'
    ? ['¡Hola, LST! Me gustaría apuntarme a uno de vuestros viajes de surf. ¿Me ayudáis con las fechas, el nivel y la reserva?']
    : departuresFor(trip).length > 1
      ? departuresFor(trip).map(departure => departureMessage(trip, departure))
      : [tripMessage(trip)];
  check(entry.tag + ' intercepted WhatsApp context', url.origin === 'https://wa.me' && url.pathname === '/34648189257' && expected.includes(entry.message), entry.message);
 }
 check('no page errors', report.errors.length === 0, report.errors);
 fs.writeFileSync(path.join(output, 'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,whatsapp:report.whatsapp.length,errors:report.errors},null,2));await browser.close();if(report.issues.length)process.exitCode=1;
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
