import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE);
const output=path.resolve('docs/qa/2026-10-25-trip-detail/browser');await mkdir(output,{recursive:true});
let root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
let checks=0;const results=[],errors=[];
const check=(name,condition,evidence)=>{results.push({name,passed:Boolean(condition),evidence});checks++;};
try{
 const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
 for(const promoted of [false,true]){
  root=path.resolve(promoted?'artifacts/trip-detail-2026-10-25/preview':'dist');
  for(const width of [320,390,768,1024,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   // Isolated local image fixtures avoid making network availability a layout dependency.
   await context.route('https://**/*',async route=>{if(route.request().url().startsWith('https://cdn.sanity.io/images/'))await route.fulfill({body:await readFile('dist/assets/community.webp'),contentType:'image/webp'});else await route.abort();});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   for(const trip of trips){
    await page.goto(base+'/viajes/'+trip.slug+'/');await page.evaluate(()=>document.fonts.ready);
    const tag=(promoted?'promo':'published')+'-'+trip.slug+'-'+width;
    const metrics=await page.evaluate(()=>{const h=document.querySelector('h1'),b=h.getBoundingClientRect(),dock=document.querySelector('.trip-dock'),header=document.querySelector('.trip-header');return{scroll:document.documentElement.scrollWidth,width:innerWidth,h1:{width:b.width,scroll:h.scrollWidth,client:h.clientWidth,left:b.left,right:b.right},header:header.getBoundingClientRect().bottom,dockHeight:dock.getBoundingClientRect().height};});
    check(tag+' page fits',metrics.scroll<=width+1,metrics);
    check(tag+' heading fits',await page.locator('h1').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);return [...r.getClientRects()].every(b=>b.left>=0&&b.right<=innerWidth+1);}),metrics.h1);
    check(tag+' eager local images load',await page.locator('img[src^="/"]').evaluateAll(imgs=>imgs.filter(img=>img.loading!=='lazy').every(img=>img.complete&&img.naturalWidth>0)));
    const cta=page.locator(width>=1000?'.booking-card-cta':'.dock-cta');check(tag+' visible booking',await cta.isVisible());
    const dimensions=await cta.boundingBox();check(tag+' touch target',dimensions?.height>=44,dimensions);
    if(['el-palmar','fuerteventura','marruecos'].includes(trip.slug)&&[320,390,1440].includes(width))await page.screenshot({path:path.join(output,tag+'-opening.png')});
    if(trip.departures.length>1){
     await cta.click();check(tag+' dates open',await page.locator('.departure-dialog').isVisible());
     check(tag+' close focused',await page.locator('.departure-close').evaluate(e=>document.activeElement===e));
     const options=page.locator('.departure-option');check(tag+' all dates',await options.count()===trip.departures.length);
     for(let i=0;i<trip.departures.length;i++){const option=options.nth(i);const url=new URL(await option.locator('.departure-enquiry').getAttribute('href'));check(tag+' context '+i,url.searchParams.get('text').includes(trip.departures[i].date));if(promoted)check(tag+' date offer '+i,await option.locator('.trip-offer').count()===1);}
     if(promoted&&width===390)await page.screenshot({path:path.join(output,tag+'-dates.png')});
     await page.keyboard.press('Escape');check(tag+' dates close',!await page.locator('.departure-dialog').isVisible());check(tag+' focus returned',await cta.evaluate(e=>document.activeElement===e));
    }
    if(trip.gallery.length){await page.locator('.cover-photos').click();check(tag+' gallery opens',await page.locator('.photo-dialog').isVisible());await page.keyboard.press('Escape');check(tag+' gallery closes',!await page.locator('.photo-dialog').isVisible());}
    if(promoted){const expected=trip.slug!=='hossegor';check(tag+' offer state',(await page.locator('.booking-card .trip-offer').count()===1)===expected);if(expected)check(tag+' mobile saving price',await page.locator('.dock-price del').count()===1);}
   }
   await context.close();console.log('QA matrix '+(promoted?'promo':'published')+' '+width);
  }
 }
 root=path.resolve('artifacts/trip-detail-2026-10-25/preview');
 for(const width of [320,390,768,1440]){
  for(const js of [true,false]){
   const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:js,reducedMotion:'reduce'});
   await context.route('https://**/*',r=>r.abort());const page=await context.newPage();
   for(const slug of ['el-palmar','marruecos','fuerteventura']){
    await page.goto(base+'/viajes/'+slug+'/');
    await page.evaluate(() => {const sizes=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size] of sizes)if(Number.isFinite(size))e.style.fontSize=(size*2)+'px';});
    const tag=(js?'text200':'nojs-text200')+'-'+slug+'-'+width;console.log('QA '+tag);
    const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);check(tag+' page fits',fits);
    if(!js&&slug==='marruecos'){check(tag+' native dates visible',await page.locator('.trip-native-dates').isVisible());check(tag+' two native enquiries',await page.locator('.trip-native-dates [data-whatsapp]').count()===2);}
    if(width===320)await page.screenshot({path:path.join(output,tag+'.png')});
   }
   await context.close();
  }
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(output,'results.json'),JSON.stringify({checks,failed:results.filter(r=>!r.passed),errors,imageFixtures:'Local community.webp in isolated browser routes. Real destination images additionally inspected in IAB.',results},null,2));
console.log(JSON.stringify({checks,failed:results.filter(r=>!r.passed),errors},null,2));
assert.equal(errors.length,0);assert(results.every(r=>r.passed));
