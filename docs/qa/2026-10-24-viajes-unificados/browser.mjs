import {createRequire} from 'node:module';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const root=path.resolve('dist'),out=path.resolve('docs/qa/2026-10-24-viajes-unificados');
const trips=JSON.parse(await readFile(root+'/catalog-snapshot.json','utf8')).trips;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
let checks=0;const errors=[],evidence=[];
const ok=(value,message)=>{assert(value,message);checks++;};
const noOverflow=async(page,label)=>ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' no horizontal page overflow');
try{
 for(const width of [320,390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://wa.me/**',route=>route.fulfill({status:200,contentType:'text/plain',body:'Consulta interceptada en QA'}));
  await page.goto(base+'/viajes/');
  await page.evaluate(()=>document.fonts.ready);
  ok(await page.locator('[data-catalog-trip]').count()===6,'six cards');
  const names=await page.locator('.catalog-card h2').allTextContents();
  ok(names.includes('Maldivas')&&names.includes('Marruecos')&&!names.some(n=>/nivel|pascua|semana santa/i.test(n)),'clean unique names');
  for(const level of ['1','2','3']){
   await page.selectOption('#catalog-level',level);
   ok(await page.locator('[data-catalog-trip]:visible h2').allTextContents().then(ns=>ns.filter(n=>n==='Marruecos').length===1),'Morocco matches effective level '+level);
  }
  await page.selectOption('#catalog-level','4');
  ok(!(await page.locator('[data-catalog-trip]:visible h2').allTextContents()).includes('Marruecos'),'Morocco excludes IV');
  await page.selectOption('#catalog-level','');
  await noOverflow(page,'catalog '+width);
  if(width!==320)await page.screenshot({path:out+'/catalog-'+width+'.png',fullPage:true});
  await page.goto(base+'/');
  await page.locator('.home-more-trips>summary').click();
  ok(await page.locator('.home-trip h3').allTextContents().then(ns=>ns.filter(n=>n==='Marruecos').length===1&&ns.filter(n=>n==='Maldivas').length===1),'one home card per destination');
  const morocco=page.locator('.home-trip').filter({has:page.locator('h3',{hasText:/^Marruecos$/})});
  await morocco.locator('[data-home-dates]>summary').click({position:{x:20,y:20}});
  ok(await morocco.locator('.home-trip-dates-panel').textContent().then(t=>t.includes('Niveles I–II')&&t.includes('Nivel III')),'home date levels');
  await noOverflow(page,'home '+width);
  for(const slug of ['maldivas','marruecos']){
   const trip=trips.find(t=>t.slug===slug);
   await page.goto(base+'/viajes/'+slug+'/');
   await page.evaluate(()=>document.fonts.ready);
   ok(await page.locator('h1').textContent()===trip.name,'destination heading '+slug);
   await page.locator(width<1000?'.dock-cta':'.trip-header-cta').click();
   ok(await page.locator('#departure-dialog').isVisible(),'date dialog '+slug);
   const options=page.locator('.departure-option');
   ok(await options.count()===2,'two dates '+slug);
   for(let i=0;i<2;i++){
    const d=trip.departures[i],option=options.nth(i);
    ok(await option.locator('h3').textContent()===d.date,'right date');
    ok(await option.locator('.dossier-link').getAttribute('href')===d.dossier,'right PDF');
    const url=new URL(await option.locator('[data-whatsapp]').getAttribute('href'));
    ok(url.searchParams.get('text').includes(d.date),'dated enquiry');
    if(slug==='marruecos')ok(await option.locator('.departure-option-meta').first().textContent().then(t=>t.includes(i?'Nivel III':'Niveles I–II')),'right date level');
   }
   await page.screenshot({path:out+'/'+slug+'-dates-'+width+'.png',fullPage:false});
   if(slug==='marruecos'){
    await options.nth(1).locator('[data-view-programme]').click();
    await page.waitForFunction(()=>!document.querySelector('#departure-dialog').open&&document.querySelector('#programa-marruecos-2027-01-24').open);
    const second=page.locator('#programa-marruecos-2027-01-24');
    ok(await second.textContent().then(t=>t.includes('Surf coaching intensivo con Lucas')&&!t.includes('Material de iniciación y neoprenos')),'programme isolation');
    ok(await second.locator(':scope>summary').evaluate(e=>e===document.activeElement),'programme focus');
   }else{
    await page.keyboard.press('Escape');
    ok(!(await page.locator('#departure-dialog').isVisible()),'Escape closes');
    ok(await page.locator(width<1000?'.dock-cta':'.trip-header-cta').evaluate(e=>e===document.activeElement),'opener focus restored');
   }
   await noOverflow(page,slug+' '+width);
   if(width!==320)await page.screenshot({path:out+'/'+slug+'-'+width+'.png',fullPage:true});
   for(const alias of trip.aliases){
    await page.goto(base+'/viajes/'+alias+'/');
    ok(await page.locator('h1').textContent()===trip.name,'legacy route '+alias);
    ok(await page.locator('[data-open-dates]').count()>0,'legacy route still has both dates');
   }
  }
  // At enlarged text, date options must remain scrollable without overflow.
  await page.goto(base+'/viajes/marruecos/');
  await page.addStyleTag({content:'html{font-size:200%}body *{font-size:max(1em,16px)}'});
  await page.locator(width<1000?'.dock-cta':'.trip-header-cta').click();
  const dialog=page.locator('#departure-dialog');
  ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'dialog text zoom horizontal fit');
  await page.keyboard.press('Escape');
  evidence.push({width,names});
  await page.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 const page=await context.newPage();
 await page.goto(base+'/viajes/marruecos/');
 ok(await page.locator('.departure-programme').count()===2,'programme choices readable without JS');
 for(const summary of await page.locator('.departure-programme>summary').all())await summary.click();
 ok(await page.locator('.departure-programme[open]').count()===2,'native programme disclosures');
 ok(await page.locator('a[href*=".pdf"]').count()>=2,'PDFs accessible without JS');
 await context.close();
 ok(errors.length===0,'no browser errors: '+errors.join(','));
 await writeFile(out+'/browser.json',JSON.stringify({checks,errors,evidence},null,2)+'\n');
 console.log('PASS: '+checks+' browser checks at 320/390/1440px; six destinations, effective-level filters, dates/PDFs, legacy routes, programme isolation, focus, enlarged text and no-JS.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
