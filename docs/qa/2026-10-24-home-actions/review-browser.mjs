import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE);
const out='docs/qa/2026-10-24-home-actions';
const product=['dist/index.html','dist/home.css','scripts/render-home-trips.mjs','scripts/home-trips.test.mjs','scripts/check-home-browser.mjs'];
const hashes={};for(const f of product)hashes[f]=crypto.createHash('sha256').update(await fs.readFile(f)).digest('hex');
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const evidence={hashes,pages:[],errors:[]};
try {
 for(const width of [320,390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 page.on('pageerror',e=>evidence.errors.push(e.message));
 await page.goto('http://127.0.0.1:4175/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
 await page.locator('.lst-faq-list details').evaluateAll(es=>es.forEach(e=>e.open=true));
 const controls=await page.locator('a').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.replace(/\s+/g,' ').trim(),href:e.getAttribute('href'),height:e.getBoundingClientRect().height,border:getComputedStyle(e).borderTopWidth,decoration:getComputedStyle(e).textDecorationLine,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth}))); 
 assert.deepEqual(controls.filter(e=>!e.href),[],'empty link');
 const wa=await page.locator('.lst-whatsapp').evaluate(e=>({label:e.textContent.replace(/\s+/g,' ').trim(),href:e.href,trigger:e.dataset.whatsapp,svg:e.querySelector('svg').getAttribute('aria-hidden')}));
 assert.equal(wa.href,'https://wa.me/34648189257?text=Hola%2C%20LST.%20Quiero%20consultar%20un%20viaje%20de%20surf.');assert.equal(wa.label,'Escríbenos al WhatsApp');assert.equal(wa.trigger,'orientacion');
 const all=await page.locator('.lst-view-all').boundingBox(),title=await page.locator('#trips-title').boundingBox();assert(all.x>title.x && all.y<title.y+title.height,'ver todos alongside title');
 const styles=await page.evaluate(()=>Object.fromEntries(['.lst-hero-actions .lst-button','.lst-nav-trip','.lst-header-trip','.lst-level-help'].map(s=>{const e=document.querySelector(s),c=getComputedStyle(e);return [s,{background:c.backgroundColor,color:c.color,border:c.borderTopColor}]})));
 assert.equal(styles['.lst-hero-actions .lst-button'].background,'rgb(234, 89, 52)');
 const focus=[];for(const s of ['.lst-view-all','.lst-level-help','.lst-whatsapp','.lst-people-copy .lst-link','.lst-faq-intro .lst-link','.lst-closing-help .lst-link']){
 await page.locator(s).focus();focus.push(await page.locator(s).evaluate(e=>({text:e.textContent.trim(),outline:getComputedStyle(e).outlineColor,width:getComputedStyle(e).outlineWidth,active:e===document.activeElement,visible:e.matches(':focus-visible')})));}
 assert(focus.every(f=>f.active&&f.visible&&f.width==='3px'),'new actions keyboard focus');
 if(width===1440){const date=page.locator('[data-home-dates]').first();await page.locator('.home-trip-media').first().hover();assert(await date.evaluate(e=>e.open));const text=await date.locator('.home-trip-dates-panel').innerText();assert.equal(text.trim(),'20 nov 2026 — 22 nov 2026');await page.keyboard.press('Escape');assert(!(await date.evaluate(e=>e.open)));await page.locator('.lst-level-help').hover();assert.equal(await page.locator('.lst-level-help').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(234, 89, 52)');}
 if(width<1000){await page.locator('.menu-toggle').click();assert(await page.locator('#main-nav').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#main-nav').isVisible()));}
 await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')];const sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
 const reflow=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,failures:[...document.querySelectorAll('main a,.lst-footer-links a')].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).map(e=>({text:e.textContent.trim(),scroll:e.scrollWidth,client:e.clientWidth}))}));
 assert(reflow.documentWidth<=width+1,'text200 page overflow');assert.deepEqual(reflow.failures,[],'text200 action internal overflow');
 evidence.pages.push({width,controls,wa,styles,focus,reflow});await page.close();
 }
 assert.deepEqual(evidence.errors,[]);evidence.result='PASS';await fs.writeFile(out+'/browser-independiente.json',JSON.stringify(evidence,null,2));console.log('PASS independent controls, WhatsApp, hover, keyboard, 320/390/1440 and text200');
}finally{await browser.close();}
