const {chromium}=require('C:/Users/Antonio Fernandez/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const out='C:/Users/Antonio Fernandez/.codex/visualizations/2026/10/27/01a17ebf-9515-7d12-8618-f92dce5f63f0/';
 const b=await chromium.launch({channel:'chrome',headless:true}),r={sizes:[],errors:[],interactions:[]};
 const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true}),p=await c.newPage();
 p.on('pageerror',e=>r.errors.push(e.message));await c.route('https://wa.me/**',x=>x.abort());
 async function go(slug){for(let i=0;i<3;i++){try{await p.goto('http://localhost:4175/'+slug,{waitUntil:'domcontentloaded'});return}catch(e){if(i===2)throw e;await p.waitForTimeout(1000)}}}
 for(const width of [320,390,768,1024,1440]){
  await p.setViewportSize({width,height:width<600?844:1000});
  for(const slug of ['marruecos','marruecos-avanzado','maldivas','fuerteventura','hossegor','senegal','el-palmar']){
   await go('viajes/'+slug+'/');await p.evaluate(()=>document.fonts.ready);
   const d=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,dock:getComputedStyle(document.querySelector('.trip-dock')).display,pos:getComputedStyle(document.querySelector('.trip-dock')).position,date:document.querySelector('.trip-summary-dates')?.innerText,wa:[...document.querySelectorAll('a[data-whatsapp]')].map(a=>({icon:!!a.querySelector('svg'),bg:getComputedStyle(a).backgroundColor}))}));
   assert(d.scroll<=width,slug+' overflow '+width);assert(d.wa.every(a=>a.icon&&a.bg==='rgb(29, 115, 72)'));assert(d.date,slug+' missing visible date');
   if(width<1000){assert.equal(d.pos,'fixed');assert.notEqual(d.dock,'none')}else assert.equal(d.dock,'none');r.sizes.push({slug,width,overflow:false});
  }
 }
 await p.setViewportSize({width:390,height:844});await go('viajes/marruecos/');
 assert.match(await p.locator('.trip-summary-dates').innerText(),/17 ene 2027/);
 const track=p.locator('#actividades [data-carousel-track]');await track.scrollIntoViewIfNeeded();
 const box=await track.boundingBox(),cdp=await c.newCDPSession(p),y=Math.min(box.y+100,500);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.8,y}]});
 for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.8-i*35,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(500);assert(await track.evaluate(t=>t.scrollLeft)>40);r.interactions.push('native touch swipe on activities');
 for(const id of ['spots','alojamiento']){const t=p.locator('#'+id+' [data-carousel-track]');await t.scrollIntoViewIfNeeded();await t.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(500);assert(await t.evaluate(e=>e.scrollLeft)>0)}
 r.interactions.push('spots and stay keyboard scrolling');
 await p.locator('.trip-dock .dock-cta').click();await p.waitForURL('**/inscripciones/marruecos/');assert.equal(await p.locator('form').count(),1);r.interactions.push('mobile registration route');
 await go('viajes/maldivas/');await p.locator('.trip-dock .dock-cta').click();assert(await p.locator('.departure-dialog').evaluate(d=>d.open));assert.equal(await p.locator('.departure-option').count(),2);assert.equal(await p.locator('.departure-option .departure-dossier').count(),2);await p.keyboard.press('Escape');assert(await p.locator('.trip-dock .dock-cta').evaluate(e=>document.activeElement===e));r.interactions.push('date PDFs, Escape and focus return');
 await p.setViewportSize({width:1440,height:1000});await go('viajes/marruecos/');
 const next=p.locator('.trip-cover [data-carousel-next]');for(let i=0;i<6;i++){if(await next.isDisabled())break;await next.focus();await p.keyboard.press('Enter');await p.waitForTimeout(600)}
 assert(await p.locator('.trip-cover [data-carousel-track]').evaluate(e=>document.activeElement===e));r.interactions.push('cover last slide retains keyboard focus');
 await p.locator('.cover-image-button').last().click();assert(await p.locator('.photo-dialog').evaluate(d=>d.open));await p.keyboard.press('Escape');assert(await p.locator('.cover-image-button').last().evaluate(e=>document.activeElement===e));r.interactions.push('photo modal focus return');
 await go('viajes/marruecos/');await p.waitForTimeout(600);await p.screenshot({path:out+'marruecos-1440-final.png',fullPage:true});
 await p.locator('#alojamiento').scrollIntoViewIfNeeded();await p.waitForTimeout(600);await p.screenshot({path:out+'marruecos-1440-stay.png'});
 await p.setViewportSize({width:390,height:844});await go('viajes/marruecos/');await p.waitForTimeout(500);await p.screenshot({path:out+'marruecos-390-final.png',fullPage:true});
 await p.locator('#nivel').scrollIntoViewIfNeeded();await p.screenshot({path:out+'marruecos-390-audience.png'});
 const nc=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),np=await nc.newPage();await np.goto('http://localhost:4175/viajes/maldivas/',{waitUntil:'domcontentloaded'});assert.equal(await np.locator('#fechas-sin-javascript article').count(),2);assert.match(await np.locator('.trip-summary-dates').innerText(),/2027/);r.interactions.push('no-JS dates and native fallback');
 assert.equal(r.errors.length,0);fs.writeFileSync(out+'browser-qa.json',JSON.stringify(r,null,2));console.log(JSON.stringify({sizes:r.sizes.length,interactions:r.interactions,errors:r.errors},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

