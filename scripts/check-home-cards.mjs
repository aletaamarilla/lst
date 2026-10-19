// Optional browser acceptance checks. Reuses the project's external Playwright runtime.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {departuresFor,levelLabel} from './trip-model.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.LST_PREVIEW_URL||'http://127.0.0.1:4175';
const out=process.env.LST_QA_OUTPUT||path.join(os.tmpdir(),'lst-home-cards');
fs.mkdirSync(path.join(out,'capturas'),{recursive:true});
const trips=JSON.parse(fs.readFileSync('data/trips.json'));
const report={checks:[],issues:[],errors:[],measurements:[]};
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});if(!pass)report.issues.push({name,detail});};
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
try{
 for(const width of [320,390,768,1440]){
  for(const mode of ['normal','text200','no-js']){
   const tag=`${width}-${mode}`;
   const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js',hasTouch:width<700});
   await context.route('https://**/*',r=>r.abort());
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push({tag,error:e.message}));
   await page.goto(base);await page.evaluate(()=>document.fonts.ready);
   await page.locator('#viajes img').evaluateAll(async imgs=>await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode()})));
   if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>getComputedStyle(e).fontSize);es.forEach((e,i)=>e.style.fontSize=parseFloat(sizes[i])*2+'px');});
   check(tag+' no horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const cards=page.locator('#viajes .home-trip');
   check(tag+' six cards',await cards.count()===trips.length);
   for(const trip of trips){
    const card=cards.filter({has:page.locator(`a[href="/viajes/${trip.slug}/"]`)});
    check(tag+' '+trip.slug+' unique main link',await card.locator('a').count()===1&&await card.locator('button,input,[tabindex]').count()===0);
    await card.locator('img').evaluate(async img=>{img.loading='eager';await img.decode();});
    const text=await card.innerText();
    check(tag+' '+trip.slug+' destination and level',text.includes(trip.name)&&text.includes(levelLabel(trip).replace(/^Niveles? /,'')));
    const departures=departuresFor(trip);
    check(tag+' '+trip.slug+' date state',departures.length? !text.includes('Próximamente')&&text.includes(departures[0].duration):text.includes('Próximamente'));
    if(trip.slug==='el-salvador')check(tag+' autonomy retained',text.includes('autonomía'));
    check(tag+' '+trip.slug+' expanded commercial info stays in detail',!await card.locator('.departure-booking,.departure-note,.departure-description').count()&&!/€|disponibilidad|Fechas confirmadas/i.test(text));
    const metrics=await card.evaluate(e=>{const r=e.getBoundingClientRect(),a=e.querySelector('a'),ar=a.getBoundingClientRect(),img=e.querySelector('img');return {width:r.width,height:r.height,linkWidth:ar.width,linkHeight:ar.height,overflow:[e,...e.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>n.className),photoLoaded:img.complete&&img.naturalWidth>0,fonts:[...e.querySelectorAll('p,.home-trip-action')].map(n=>parseFloat(getComputedStyle(n).fontSize))};});
    check(tag+' '+trip.slug+' legibility and complete hit area',metrics.photoLoaded&&metrics.linkWidth>=metrics.width-1&&metrics.linkHeight>=metrics.height-1&&Math.min(...metrics.fonts)>=14&&metrics.overflow.length===0,metrics);
    if(mode==='normal'){
     report.measurements.push({viewport:width,slug:trip.slug,...metrics});
     // The photograph itself is an entry point, including on touch devices.
     await card.locator('img').click();await page.waitForURL(base+`/viajes/${trip.slug}/`);
     check(tag+' '+trip.slug+' photo opens correct detail',(await page.locator('h1').innerText()).includes(trip.name));
     await page.goBack();await page.waitForURL(base+'/');
    }
   }
   if(mode==='normal'){
    // Tab from the preceding guide link traverses exactly one stop per card.
    await page.locator('.journeys-level-link').focus();
    for(const trip of trips){
     await page.keyboard.press('Tab');
     const focus=await page.evaluate(()=>{const a=document.activeElement,r=a.getBoundingClientRect(),s=getComputedStyle(a);return {href:a.getAttribute('href'),visible:a.matches(':focus-visible'),outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),top:r.top,bottom:r.bottom,header:document.querySelector('.site-header').getBoundingClientRect().bottom};});
     check(tag+' '+trip.slug+' keyboard focus visible',focus.href===`/viajes/${trip.slug}/`&&focus.visible&&focus.outline!=='none'&&focus.outlineWidth>=3&&focus.top>=focus.header-1&&focus.bottom<= (width===1440?1000:844)+1,focus);
    }
    await page.keyboard.press('Enter');await page.waitForURL(base+`/viajes/${trips.at(-1).slug}/`);
    check(tag+' Enter opens detail',page.url().endsWith(`/viajes/${trips.at(-1).slug}/`));
    await page.goBack();
    if(width>=700){
     const alignment=await page.locator('.home-trip-grid').evaluateAll(grids=>grids.map(g=>{const es=[...g.children];const rows=Map.groupBy(es,e=>Math.round(e.getBoundingClientRect().top));return [...rows.values()].map(row=>['h3,h4','.home-trip-date','.home-trip-action'].map(sel=>row.map(e=>e.querySelector(sel).getBoundingClientRect().top)));}));
     check(tag+' titles dates and actions align by row',alignment.flat().every(row=>row.every(ys=>Math.max(...ys)-Math.min(...ys)<2)),alignment);
    }
    await page.locator('#viajes').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:path.join(out,'capturas',`despues-${width}.png`)});
    await page.locator('.home-trip-link').first().focus();
    await page.screenshot({path:path.join(out,'capturas',`foco-${width}.png`)});
   }
   if(mode==='text200')await page.locator('#viajes').screenshot({style:'.site-header,.skip-link{visibility:hidden!important}',path:path.join(out,'capturas',`texto200-${width}.png`)});
   if(mode==='no-js'){
    await page.locator('.home-trip-link').first().click();await page.waitForURL(base+`/viajes/${trips[0].slug}/`);
    check(tag+' navigates without JavaScript',page.url().endsWith(`/viajes/${trips[0].slug}/`));
   }
   await context.close();
  }
 }
 check('no JavaScript errors',report.errors.length===0,report.errors);
 fs.writeFileSync(path.join(out,'browser-home.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:report.checks.length,issues:report.issues,errors:report.errors},null,2));
 if(report.issues.length)process.exitCode=1;
}finally{await browser.close();}
