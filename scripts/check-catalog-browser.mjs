import {createRequire} from 'node:module';
import {readFile, writeFile, mkdir, stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {renderCatalog} from './render-catalog.mjs';
import {filterCatalog} from '../dist/catalog-filter.js';
import {departuresFor, levelsFor} from './trip-model.mjs';
const {chromium} = createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.LST_QA_OUTPUT || 'docs/qa/2026-10-25-viajes-home/browser';
await mkdir(output, {recursive:true});
const root = path.resolve('dist');
const before = path.resolve(process.env.LST_QA_BEFORE || 'docs/qa/2026-10-25-viajes-home/before/dist');
const template = await readFile(path.join(root, 'viajes/index.html'), 'utf8');
const {trips} = JSON.parse(await readFile(path.join(root, 'catalog-snapshot.json'), 'utf8'));
const model = trips.map(t => ({levels:levelsFor(t), departures:departuresFor(t)}));
let baseline = false, fixture = false;
const mixed = {...structuredClone(trips[0]), id:'qa-mixed', name:'Varias fechas, mismo nivel', slug:'qa-mixed', hero:'/assets/el-salvador.webp', levels:[1,2], departures:[
 {id:'jan',start:'2027-01-25',end:'2027-02-02',date:'25 ene — 2 feb 2027',price:500,state:'confirmed'},
 {id:'mar',start:'2027-03-01',end:'2027-03-08',date:'1–8 mar 2027',price:650,state:'confirmed'},
]};
const pending = {...mixed, id:'qa-pending',slug:'qa-pending', name:'Sin fechas', state:'upcoming',levels:[4], departures:[],hero:''};
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 let content;
 if(fixture && file===path.join(root,'viajes/index.html')) content=renderCatalog(template,[mixed,pending]);
 else if(baseline){try{content=await readFile(path.join(before,path.relative(root,file)));}catch{content=await readFile(file);}}
 else content=await readFile(file);
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(content);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const errors=[];let checks=0;
const ok=(value,label)=>{assert.equal(value,true,label);checks++;};
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const results=[];
try{
 for(const width of [320,390,481,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  if([390,1440].includes(width)){
   baseline=true;await page.goto(base+'/viajes/');await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(output,`before-${width}.png`),fullPage:true});baseline=false;
  }
  await page.goto(base+'/viajes/');await page.evaluate(()=>document.fonts.ready);
  eq(await page.locator('.catalog-field label').allTextContents(),['Nivel'],'only the requested level filter');
  eq(await page.locator('select').count(),1,'one select control');
  eq(await page.locator('#catalog-date').count(),0,'date filter removed');
  eq(await page.locator('#catalog-state,.catalog-card-state,.destination-collection,.home-more-trips,.catalog-help').count(),0,'no state controls, groups or extra help sections');
  ok(!/Con fecha|Próximamente/.test(await page.locator('main').innerText()),'obsolete state wording absent');
  eq(await page.locator('[data-catalog-trip]:visible').count(),trips.length,'every destination visible');
  ok(await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily.startsWith('Aura')),'same display type');
  ok(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(255, 250, 231)'&&getComputedStyle(e).fontFamily.includes('Work Sans')),'same cream and body type');
  ok(await page.locator('.catalog-card').evaluateAll(es=>es.every(e=>{const s=getComputedStyle(e),footer=getComputedStyle(e.querySelector('.home-trip-link'));return parseFloat(s.borderRadius)===25&&s.boxShadow!=='none'&&footer.backgroundColor==='rgb(27, 27, 27)';})),'same rounded cards and ink booking footer');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)){
   await page.screenshot({path:path.join(output,`overflow-${width}.png`),fullPage:true});
   await writeFile(path.join(output,`overflow-${width}.json`),JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,60),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width}))),null,2));
  }
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
  for(const level of ['','1','2','3','4']){
   await page.selectOption('#catalog-level',level);
   const expected=filterCatalog(model,level).length;
   eq(await page.locator('[data-catalog-trip]:visible').count(),expected,'matches level '+level+'/'+width);
   eq(await page.locator('#catalog-empty').isVisible(),expected===0,'empty status');
  }
  await page.locator('[data-catalog-clear]:visible').first().click();
  eq(await page.locator('[data-catalog-trip]:visible').count(),trips.length,'clear restores all');
  eq(new URL(page.url()).search,'','clear removes filter query');
  const summary=page.locator('[data-home-dates] summary').first();
  await summary.click();
  ok(await page.locator('[data-home-dates]').first().evaluate(e=>e.open),'date overlay opens');
  ok(await page.locator('.home-trip-dates-panel').first().evaluate(e=>{const r=e.getBoundingClientRect(),card=e.closest('.home-trip-media').getBoundingClientRect(),title=e.closest('.home-trip-media').querySelector('h2').getBoundingClientRect();return r.left>=card.left&&r.right<=card.right+1&&r.bottom<=title.top&&r.height>30;}),'date overlay stays within photo above title');
  await page.keyboard.press('Escape');
  ok(await page.locator('[data-home-dates]').first().evaluate(e=>!e.open),'date overlay escapes');
  await summary.click();
  await page.mouse.move(0,0);
  await page.selectOption('#catalog-level','4');
  await page.selectOption('#catalog-level','');
  const wasOpen=await page.locator('[data-home-dates]').first().evaluate(e=>e.open);
  await summary.click();
  ok(await page.locator('[data-home-dates]').first().evaluate((e,previous)=>e.open!==previous,wasOpen),'date control toggles on first click after hiding and restoring its card');
  await page.keyboard.press('Escape');
  await page.mouse.move(0,0);
  if(width<1000){await page.locator('.menu-toggle').click();ok(await page.locator('#main-nav').isVisible(),'mobile menu opens');await page.keyboard.press('Escape');ok(!(await page.locator('#main-nav').isVisible()),'mobile menu escapes');}
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
  const images=await page.locator('.home-trip-photo').evaluateAll(async es=>Promise.all(es.map(async e=>{e.loading='eager';await e.decode().catch(()=>{});return {url:e.currentSrc,loaded:e.naturalWidth>0};})));
  results.push({width,images});
  await page.screenshot({path:path.join(output,`viajes-${width}-opening.png`)});
  await page.screenshot({path:path.join(output,`viajes-${width}.png`),fullPage:true});
  await page.goto(base+'/viajes/?nivel=3&fecha=2027-03&estado=upcoming&source=qa');
  eq(await page.locator('[data-catalog-trip]:visible').count(),filterCatalog(model,'3').length,'legacy date ignored while level applies');
  await page.selectOption('#catalog-level','1');
  ok(!new URL(page.url()).searchParams.has('estado'),'obsolete state removed on change');
  ok(!new URL(page.url()).searchParams.has('fecha'),'obsolete date removed on change');
  eq(new URL(page.url()).searchParams.get('source'),'qa','other query parameters retained');
  await page.goBack();eq(await page.locator('#catalog-level').inputValue(),'3','back restores level');
  await page.goForward();eq(await page.locator('#catalog-level').inputValue(),'1','forward restores level');
  await page.goto(base+'/viajes/?nivel=oops&fecha=2027-99');
  eq(await page.locator('[data-catalog-trip]:visible').count(),trips.length,'invalid filter links fall back to all');
  await page.close();
 }
 fixture=true;
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'/viajes/?nivel=3&fecha=2027-03');
 eq(await page.locator('[data-catalog-trip]:visible').count(),0,'fixed trip range excludes incompatible levels');
 await page.locator('#catalog-empty [data-catalog-clear]').click();
 eq(await page.locator('#catalog-level').evaluate(e=>e===document.activeElement),true,'empty clear restores visible focus');
 eq(await page.locator('[data-catalog-trip]:visible').count(),2,'pending destination survives clear');
 await page.selectOption('#catalog-level','2');
 eq(await page.locator('[data-catalog-trip]:visible').count(),1,'level applies to every departure');
 await page.selectOption('#catalog-level','3');
 eq(await page.locator('[data-catalog-trip]:visible').count(),0,'trip range applies to every departure');
 await page.close();fixture=false;
 const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await noJs.goto(base+'/viajes/');eq(await noJs.locator('[data-catalog-trip]:visible').count(),trips.length,'no JS lists all trips');ok(!(await noJs.locator('[data-catalog-filters]').isVisible()),'nonfunctional filters hidden without JS');
 await noJs.locator('[data-home-dates] summary').first().click();ok(await noJs.locator('[data-home-dates]').first().evaluate(e=>e.open),'native dates work without JS');await noJs.close();
 const enlarged=await browser.newPage({viewport:{width:320,height:568}});await enlarged.goto(base+'/viajes/');await enlarged.addStyleTag({content:'html{font-size:200%} body{font-size:200%} select,button{font-size:inherit!important}'});ok(await enlarged.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'enlarged text narrow viewport no overflow');await enlarged.screenshot({path:path.join(output,'viajes-320-text200.png'),fullPage:true});await enlarged.close();
 eq(errors,[],'no browser exceptions');
 await writeFile(path.join(output,'images.json'),JSON.stringify(results,null,2));
 console.log(`PASS: ${checks} browser assertions; 320, 390, 481, 768, 1024, 1440px, level combinations, fixed-range matching, legacy date links, history, legacy and invalid URLs, dates, keyboard, menu, no JavaScript and enlarged text.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}





