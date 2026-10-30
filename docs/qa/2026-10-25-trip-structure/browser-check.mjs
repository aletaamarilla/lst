import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createSiteServer} from '../../../scripts/serve.mjs';
import {renderTrip} from '../../../scripts/render-trips.mjs';
import {departuresFor} from '../../../scripts/trip-model.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE||'/home/amfernandez/.npm/_npx/bbb8a2c4738e2b0c/node_modules/playwright');
const {trips}=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const out='docs/qa/2026-10-25-trip-structure/browser';await mkdir(out,{recursive:true});
const files=['scripts/render-trips.mjs','dist/trip-detail.css','dist/trip.js'];
const hashes=async()=>Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(f)).digest('hex')])));
const report={startHashes:await hashes(),checks:[],issues:[],errors:[],screenshots:[]};
const check=(label,pass,detail)=>{report.checks.push({label,pass:!!pass,...(detail===undefined?{}:{detail})});if(!pass)report.issues.push({label,detail})};
const server=createSiteServer({previewTrips:trips});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH||'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
const overflow=p=>p.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth+1,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
const enlarge=p=>p.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px')});
const setup=async(options={})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',...options});
 context.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
 await context.route('https://**/*',r=>r.request().resourceType()==='image'?r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600"><rect width="1000" height="600" fill="#517768"/></svg>'}):r.abort());
 return context;
};
const snap=async(page,name)=>{await page.screenshot({path:out+'/'+name+'.png'});report.screenshots.push(name+'.png')};
const visibleControl=async locator=>locator.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {ok:r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1&&(hit===e||e.contains(hit)),rect:r.toJSON()}});
async function modalChecks(page,width,tag){
 const trigger=page.locator(width>=1000?'.booking-card-cta':'.dock-cta');
 await trigger.scrollIntoViewIfNeeded();
 const reading=await page.evaluate(()=>scrollY);
 await trigger.click();
 const d=page.locator('.departure-dialog'),close=page.locator('.departure-close');
 check(tag+' modal opens',await d.isVisible());
 check(tag+' close initially focused',await close.evaluate(e=>document.activeElement===e));
 check(tag+' close visible',(await visibleControl(close)).ok,await visibleControl(close));
 check(tag+' no modal horizontal overflow',await d.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 const options=page.locator('.departure-option');
 const deps=departuresFor(trips.find(t=>t.slug==='maldivas'));
 check(tag+' two dates',await options.count()===2);
 for(let i=0;i<deps.length;i++){
  const option=options.nth(i),pdf=option.locator('.departure-dossier');
  check(tag+' '+i+' PDF href',(await pdf.getAttribute('href'))===deps[i].dossier);
  check(tag+' '+i+' PDF beside date DOM',await pdf.evaluate(e=>e.parentElement.classList.contains('departure-option-date')));
  check(tag+' '+i+' registration href',(await option.locator('[data-registration]').getAttribute('href'))==='/inscripciones/maldivas/?salida='+encodeURIComponent(deps[i].id));
  await pdf.scrollIntoViewIfNeeded();
  check(tag+' '+i+' PDF visible',(await visibleControl(pdf)).ok,await visibleControl(pdf));
 }
 await close.focus();await page.keyboard.press('Shift+Tab');
 check(tag+' reverse tab stays in dialog',await d.evaluate(e=>e.contains(document.activeElement)));
 await page.keyboard.press('Tab');
 check(tag+' tab wraps to close',await close.evaluate(e=>document.activeElement===e));
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.departure-dialog').open&&document.body.style.position!=='fixed');
 check(tag+' Escape closes',!await d.isVisible());
 check(tag+' focus and reading restored',await trigger.evaluate(e=>document.activeElement===e)&&Math.abs(await page.evaluate(()=>scrollY)-reading)<2,{reading,after:await page.evaluate(()=>scrollY)});
}
try{
 for(const width of [320,390,768,1440]){
  const context=await setup({viewport:{width,height:900}}),page=await context.newPage();page.setDefaultTimeout(6000);
  for(const trip of trips){
   const tag=width+'/'+trip.slug;
   await page.goto(base+'/viajes/'+trip.slug+'/');await page.evaluate(()=>document.fonts.ready);
   const over=await overflow(page);check(tag+' no page overflow',over.ok,over);
   if(width>=1000){
    const contrast=await page.locator('.booking-card').evaluate(card=>{
     const channels=value=>value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
     const luminance=value=>{const [r,g,b]=channels(value);return .2126*r+.7152*g+.0722*b};
     const bg=luminance(getComputedStyle(card).backgroundColor);
     return [...card.querySelectorAll('h2,.booking-card-price,dd,.booking-card-price-note,dt,.booking-card-help,.dossier-link,.dossier-format,.booking-card-link')].map(e=>{const css=getComputedStyle(e),fg=luminance(css.color);return {text:e.textContent.trim(),ratio:(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05),required:parseFloat(css.fontSize)>=24?3:4.5,color:css.color}});
    });
    check(tag+' sidebar text contrast',contrast.every(c=>c.ratio>=c.required),contrast);
   }
   const side=await page.locator('.booking-card dl').innerText();
   check(tag+' compact sidebar level',!side.includes(trip.levelRequirement));
   const buttons=await page.locator('.level-actions a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
   check(tag+' level actions same row',buttons.length===2&&Math.abs(buttons[0].top-buttons[1].top)<2&&buttons[0].right<=buttons[1].left+1,buttons);
   check(tag+' no-photo stay compact',await page.locator('.stay-compact').count()===1);
   check(tag+' Lucas named',await page.locator('.trip-team h2').innerText()==='Lucas va contigo.');
   check(tag+' conventional inclusion labels',(await page.locator('#included-title').innerText()).includes('Incluido')&&(await page.locator('#excluded-title').innerText()).includes('No incluido'));
   check(tag+' no WhatsApp onboarding',!/Empieza con un WhatsApp|TU PLAZA, PASO A PASO/.test(await page.locator('body').innerText()));
   const departures=departuresFor(trip);
   if(departures.length===1){
    for(const cls of ['trip-header-cta','trip-summary-cta','booking-card-cta','reserve-main','dock-cta'])check(tag+' '+cls+' registration',(await page.locator('.'+cls).getAttribute('href'))==='/inscripciones/'+trip.slug+'/');
   }else{
    for(const cls of ['trip-header-cta','trip-summary-cta','booking-card-cta','reserve-main','dock-cta'])check(tag+' '+cls+' Fechas',(await page.locator('.'+cls).innerText())==='Fechas');
    check(tag+' no PDF outside date choices',await page.locator('.booking-card .dossier-link,.mobile-booking-options .dossier-link').count()===0);
   }
   check(tag+' section navigation destinations valid',await page.locator('.trip-section-nav a').evaluateAll(es=>es.every(e=>document.querySelector(e.getAttribute('href')))));
  }
  await page.goto(base+'/viajes/maldivas/');await modalChecks(page,width,width+' standard');
  await page.locator(width>=1000?'.booking-card-cta':'.dock-cta').click();await page.locator('.departure-close').focus();await page.locator('.departure-dialog-list').evaluate(e=>e.scrollTop=0);await page.locator('.departure-dialog').evaluate(e=>e.scrollTop=0);await snap(page,'maldivas-dates-'+width);await page.keyboard.press('Escape');
  await page.locator('#nivel').scrollIntoViewIfNeeded();if([390,1440].includes(width))await snap(page,'maldivas-level-'+width);
  await page.locator('#plan').scrollIntoViewIfNeeded();if([390,1440].includes(width))await snap(page,'maldivas-programme-'+width);
  await page.locator('[data-open-gallery]').click();check(width+' gallery opens',await page.locator('.photo-dialog').isVisible());await page.keyboard.press('Escape');check(width+' gallery closes',!await page.locator('.photo-dialog').isVisible());
  await context.close();
 }
 for(const javaScriptEnabled of [true,false]){
  const context=await setup({javaScriptEnabled,viewport:{width:320,height:568}}),page=await context.newPage();
  await page.goto(base+'/viajes/maldivas/');await page.evaluate(()=>document.fonts.ready);await enlarge(page);
  const tag='text200 js'+javaScriptEnabled,over=await overflow(page);check(tag+' no page overflow',over.ok,over);
  const actions=await page.locator('.level-actions a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));check(tag+' levels same row',Math.abs(actions[0].top-actions[1].top)<2,actions);
  await page.locator('#nivel').scrollIntoViewIfNeeded();await snap(page,'maldivas-level-text200-js'+javaScriptEnabled);
  if(javaScriptEnabled){await modalChecks(page,320,tag);await page.locator('.dock-cta').scrollIntoViewIfNeeded();await page.locator('.dock-cta').click();await page.locator('.departure-close').focus();await page.locator('.departure-dialog-list').evaluate(e=>e.scrollTop=0);await page.locator('.departure-dialog').evaluate(e=>e.scrollTop=0);await snap(page,'maldivas-dates-text200');await page.keyboard.press('Escape')}
  else{
   check(tag+' native dates visible',await page.locator('#fechas-sin-javascript').isVisible());
   check(tag+' two native PDFs',await page.locator('#fechas-sin-javascript .departure-dossier').count()===2);
   check(tag+' two native registrations',await page.locator('#fechas-sin-javascript [data-registration]').count()===2);
   const pdfs=await page.locator('#fechas-sin-javascript .departure-dossier').evaluateAll(es=>es.map(e=>e.href));check(tag+' native exact PDF mapping',departuresFor(trips.find(t=>t.slug==='maldivas')).every((d,i)=>pdfs[i]===d.dossier));
   await page.locator('#fechas-sin-javascript').scrollIntoViewIfNeeded();await snap(page,'maldivas-native-dates-text200');
  }
  await context.close();
 }
 const fullContext=await setup({viewport:{width:390,height:844}}),fullPage=await fullContext.newPage();
 const fullSource=trips.find(t=>t.slug==='maldivas'),fullTrip={...structuredClone(fullSource),availability:'full'};
 await fullContext.route('**/viajes/maldivas/',r=>r.fulfill({contentType:'text/html',body:renderTrip(fullTrip,trips)}));
 await fullPage.goto(base+'/viajes/maldivas/');await fullPage.locator('.dock-cta').click();
 check('global full retains two PDFs',await fullPage.locator('.departure-option .departure-dossier').count()===2);
 check('global full suppresses registrations',await fullPage.locator('.departure-option [data-registration]').count()===0);
 check('global full labels every date complete',(await fullPage.locator('.departure-option-status').allTextContents()).every(text=>/Completo/i.test(text)));
 check('global full offers alternatives',(await fullPage.locator('.departure-enquiry').allTextContents()).every(text=>text==='Consultar alternativas'));
 await fullContext.close();
 const context=await setup({viewport:{width:390,height:568}}),page=await context.newPage();
 const source=trips.find(t=>t.slug==='maldivas'),fixture={...structuredClone(source),slug:'maldivas',departures:Array.from({length:16},(_,i)=>({...source.departures[0],id:'qa-'+i,start:new Date(Date.UTC(2027,0,1+i*7)).toISOString().slice(0,10),end:new Date(Date.UTC(2027,0,8+i*7)).toISOString().slice(0,10),date:'Salida de prueba '+(i+1),brevoValue:String(100+i)}))};
 await context.route('**/viajes/maldivas/',r=>r.fulfill({contentType:'text/html',body:renderTrip(fixture,trips)}));
 await page.goto(base+'/viajes/maldivas/');await page.locator('.dock-cta').click();
 await page.locator('.departure-close').focus();await page.keyboard.press('Shift+Tab');check('long dates focus reaches last enquiry',await page.locator('.departure-enquiry').last().evaluate(e=>document.activeElement===e));check('long dates last enquiry visible',(await visibleControl(page.locator('.departure-enquiry').last())).ok);check('long dates close remains reachable',(await visibleControl(page.locator('.departure-close'))).ok);await snap(page,'long-dates-last');await context.close();
 // Real destination images are loaded only for presentation screenshots; no actions leave the preview.
 const real=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await real.route('https://wa.me/**',r=>r.abort());await real.route('https://*.sibforms.com/**',r=>r.abort());
 const realPage=await real.newPage();await realPage.goto(base+'/viajes/el-palmar/');await realPage.evaluate(()=>document.fonts.ready);await realPage.waitForTimeout(1800);await snap(realPage,'real-el-palmar-cover-1440');
 await realPage.locator('#nivel').scrollIntoViewIfNeeded();await realPage.waitForTimeout(1200);await snap(realPage,'real-el-palmar-level-1440');
 await realPage.locator('#plan').scrollIntoViewIfNeeded();await realPage.waitForTimeout(1000);await snap(realPage,'real-el-palmar-programme-1440');
 await realPage.setViewportSize({width:390,height:844});await realPage.goto(base+'/viajes/el-palmar/');await realPage.evaluate(()=>document.fonts.ready);await realPage.waitForTimeout(1200);await snap(realPage,'real-el-palmar-cover-390');await realPage.locator('.trip-section-nav').scrollIntoViewIfNeeded();await realPage.waitForTimeout(1200);await snap(realPage,'real-el-palmar-experience-390');
 check('real hero image loaded',await realPage.locator('.trip-cover-image').evaluate(e=>e.complete&&e.naturalWidth>0));await real.close();
 check('no browser exceptions',report.errors.length===0,report.errors);
}catch(error){report.issues.push({label:'Harness exception',detail:error.stack});console.error(error.stack)}finally{
 report.endHashes=await hashes();report.total=report.checks.length;report.failed=report.issues.length;await writeFile(out+'/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({total:report.total,failed:report.failed,issues:report.issues,errors:report.errors,hashes:report.endHashes},null,2));await browser.close();await new Promise(r=>server.close(r));
}




