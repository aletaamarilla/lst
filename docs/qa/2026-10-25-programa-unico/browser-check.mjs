import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createSiteServer} from '../../../scripts/serve.mjs';
import {brevoValue} from '../../../scripts/brevo.mjs';
import {levelLabel} from '../../../scripts/trip-model.mjs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE);
const {trips}=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const out='artifacts/single-programme-browser';await mkdir(out,{recursive:true});
const report={checks:[],errors:[],images:[]};
const check=(label,value)=>{report.checks.push({label,pass:!!value});assert(value,label)};
const server=createSiteServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH});
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
try{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  context.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
  const page=await context.newPage();
  for(const trip of trips){
   await page.goto(base+'/viajes/'+trip.slug+'/');await page.evaluate(()=>document.fonts.ready);
   check(width+'/'+trip.slug+' no overflow',await overflow(page));
   check(width+'/'+trip.slug+' fixed cover level',await page.locator('.trip-cover-level').innerText()===levelLabel(trip));
   check(width+'/'+trip.slug+' programme visible',await page.locator('.trip-programme').isVisible());
   check(width+'/'+trip.slug+' no per-date programme controls',await page.locator('[data-view-programme],.departure-programme,.departure-level-override,.level-meter').count()===0);
   check(width+'/'+trip.slug+' registration href',(await page.locator('.booking-card [data-registration]').getAttribute('href'))==='/inscripciones/'+trip.slug+'/');
   if(['marruecos','marruecos-avanzado','maldivas'].includes(trip.slug)){
    check(width+'/'+trip.slug+' correct date control',await page.locator('[data-open-dates]').count()===(trip.slug==='maldivas'?5:0));
    if([390,1440].includes(width)){
     await page.screenshot({path:out+'/'+trip.slug+'-'+width+'-cover.png'});
     await page.locator('#nivel').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+trip.slug+'-'+width+'-level.png'});
     await page.locator('#plan').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+trip.slug+'-'+width+'-programme.png'});
    }
   }
  }
  await page.goto(base+'/viajes/maldivas/');
  const trigger=page.locator(width>=1000?'.booking-card-cta':'.dock-cta');
  await trigger.click();check(width+' date modal open',await page.locator('#departure-dialog').isVisible());
  check(width+' date modal common programme',await page.locator('#departure-dialog-description').innerText()==='Niveles II–III · Mismo programa en todas las fechas. Elige cuándo te vienes.');
  check(width+' both dates',await page.locator('.departure-option').count()===2);
  check(width+' modal close has focus',await page.locator('.departure-close').evaluate(e=>document.activeElement===e));
  if(width===390)await page.screenshot({path:out+'/maldivas-dates-390.png'});
  await page.keyboard.press('Escape');check(width+' modal focus returns',await trigger.evaluate(e=>document.activeElement===e));
  await page.locator('[data-open-gallery]').click();check(width+' gallery opens',await page.locator('.photo-dialog').isVisible());await page.keyboard.press('Escape');
  check(width+' gallery closes',!await page.locator('.photo-dialog').isVisible());
  await page.goto(base+'/viajes/?nivel=3&fecha=2027-01');
  const visible=await page.locator('[data-catalog-trip]:visible h2').allTextContents();check(width+' filters separate Morocco',visible.includes('Marruecos avanzado')&&!visible.includes('Marruecos'));
  for(const [slug,alias,value] of [['marruecos','marruecos-2027-01-17','3'],['marruecos-avanzado','marruecos-2027-01-24','4']]){
   await page.goto(base+'/inscripciones/'+alias+'/');
   check(width+'/'+slug+' dated signup correct category',await page.locator('input[name=VIAJE_SURF]:checked').inputValue()===value);
   check(width+'/'+slug+' form links correct detail',await page.locator('a[href="/viajes/'+slug+'/"]').count()>0);
  }
  await context.close();
 }
 for(const javaScriptEnabled of [true,false]){
  const context=await browser.newContext({javaScriptEnabled,viewport:{width:320,height:568},reducedMotion:'reduce'}),page=await context.newPage();
  for(const slug of ['marruecos','marruecos-avanzado','maldivas']){
   await page.goto(base+'/viajes/'+slug+'/');await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px')});
   check(slug+' text200 js'+javaScriptEnabled+' no overflow',await overflow(page));
   check(slug+' text200 js'+javaScriptEnabled+' programme remains visible',await page.locator('.trip-programme').isVisible());
   if(!javaScriptEnabled&&slug==='maldivas')check('native date queries accessible',await page.locator('#fechas-sin-javascript a[data-whatsapp]').count()===2);
   await page.locator('#nivel').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+slug+'-text200-js'+javaScriptEnabled+'.png'});
  }
  await context.close();
 }
 check('no browser exceptions',report.errors.length===0);
 console.log('PASS '+report.checks.length+' browser checks');
}finally{await writeFile(out+'/results.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r))}
