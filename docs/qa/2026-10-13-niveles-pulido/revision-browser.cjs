const {chromium}=require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const out='/tmp/lst-levels-polish-review';
const root='/home/amfernandez/personalProjects/letsurftogethersystem';
const report={checks:[],errors:[],whatsapp:[]};
const check=(name,pass,detail)=>report.checks.push({name,pass,...(detail===undefined?{}:{detail})});
const base='http://127.0.0.1:4175/niveles/';
const hashes={};
for(const f of ['dist/niveles/index.html','dist/levels.css','dist/levels.js','scripts/check-levels.mjs','scripts/render-level-trips.mjs','data/trips.json'])hashes[f]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
fs.writeFileSync(path.join(out,'sha256.json'),JSON.stringify(hashes,null,2));
const baseline=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/2026-10-13-niveles-pulido/baseline.json')));
const changed=Object.entries(baseline.protected).filter(([f,h])=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')!==h).map(([f])=>f);
check('all protected files identical to iteration baseline',changed.length===0,changed);
(async()=>{
 const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
 async function context(opts){const c=await browser.newContext(opts);await c.route('https://**/*',async r=>{if(new URL(r.request().url()).hostname==='wa.me')report.whatsapp.push(r.request().url());await r.fulfill({contentType:'text/plain',body:'Local review: no message sent.'});});c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));return c;}
 try{
  for(const opts of [{viewport:{width:320,height:740},isMobile:true,hasTouch:true,reducedMotion:'no-preference'},{viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'},{viewport:{width:1440,height:900},reducedMotion:'no-preference'}]){
   const tag=opts.viewport.width+' '+opts.reducedMotion,c=await context(opts),p=await c.newPage();
   await p.goto(base);await p.evaluate(()=>document.fonts.ready);
   await p.evaluate(()=>{window.arrivals=[];const cards=[...document.querySelectorAll('.guide-level')];new MutationObserver(m=>{for(const x of m){const el=x.target;window.arrivals.push({id:el.id,active:el.classList.contains('is-arriving'),at:performance.now(),top:el.getBoundingClientRect().top,offset:parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)});}}).observe(document.querySelector('.guide-levels-grid'),{subtree:true,attributes:true,attributeFilter:['class']});});
   check(tag+' initial cards unhighlighted',await p.locator('.is-arriving,.is-selected').count()===0);
   for(const slug of ['supercracks','supercracks','rookies']){
    await p.locator('.guide-index a[href="#'+slug+'"]').focus();await p.keyboard.press('Enter');
    await p.waitForFunction(s=>document.getElementById(s).classList.contains('is-arriving'),slug,{timeout:4000});
    const arrived=await p.locator('#'+slug).evaluate(e=>({top:e.getBoundingClientRect().top,offset:parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),focused:document.activeElement===e}));
    check(tag+' '+slug+' arrival at destination and focused',Math.abs(arrived.top-arrived.offset)<=3&&arrived.focused,arrived);
    await p.waitForFunction(()=>!document.querySelector('.is-arriving'),null,{timeout:2200});await p.waitForTimeout(220);
    const ended=await p.locator('#'+slug).evaluate(e=>({focused:document.activeElement===e,bg:getComputedStyle(e.querySelector('.guide-level-heading')).backgroundColor,border:getComputedStyle(e).borderColor}));
    check(tag+' '+slug+' cue expires with focus retained',ended.focused&&ended.bg==='rgb(27, 27, 27)',ended);
   }
   const events=await p.evaluate(()=>window.arrivals);const enabled=events.filter(e=>e.active),disabled=enabled.map(e=>events.find(d=>d.id===e.id&&!d.active&&d.at>e.at));
   check(tag+' each activation followed by ~1100ms removal',enabled.length===3&&disabled.length===3&&enabled.every((e,i)=>disabled[i].at-e.at>=1050&&disabled[i].at-e.at<1450),events);
   const actions=await p.locator('.guide-level-actions').evaluateAll(els=>els.map(e=>[...e.children].map(a=>{const r=a.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,label:a.getAttribute('aria-label'),text:a.innerText,overflow:a.scrollWidth>a.clientWidth};})));
   check(tag+' compact buttons share row with usable touch targets',actions.every(([a,b])=>a.top===b.top&&a.right<b.left&&a.height>=44&&b.height>=44&&!a.overflow&&!b.overflow&&a.text==='Ver viajes'&&b.text==='WhatsApp'&&a.label&&b.label),actions);
   check(tag+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.locator('#rookies .guide-level-cta').click();
   check(tag+' CTA filters without highlight',await p.locator('[data-guide-filter="rookies"]').getAttribute('aria-pressed')==='true'&&await p.locator('.is-arriving,.is-selected').count()===0);
   check(tag+' CTA context and focus',new URL(p.url()).searchParams.get('nivel')==='rookies'&&new URL(p.url()).hash==='#viajes-por-nivel'&&await p.evaluate(()=>document.activeElement.id==='viajes-por-nivel'));
   await p.locator('.guide-trip-pending summary').focus();
   const before=await p.locator('.guide-trip-pending summary').evaluate(e=>[...e.children].slice(0,2).map(el=>({size:getComputedStyle(el).fontSize,transform:getComputedStyle(el).transform})));
   await p.keyboard.press('Enter');await p.waitForTimeout(250);
   const after=await p.locator('.guide-trip-pending summary').evaluate(e=>[...e.children].map(el=>({size:getComputedStyle(el).fontSize,transform:getComputedStyle(el).transform})));
   check(tag+' disclosure label/count upright and font stable',after[0].transform==='none'&&after[1].transform==='none'&&before.every((b,i)=>b.size===after[i].size),{before,after});
   check(tag+' only plus rotates',after[2].transform!=='none',after[2]);
   await p.keyboard.press('Space');check(tag+' Space closes pending destinations',await p.locator('.guide-trip-pending').evaluate(e=>!e.open));
   if(opts.viewport.width===320){
    await p.locator('#rookies').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'320-controls.png')});
    await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
    const big=await p.locator('.guide-level-actions').evaluateAll(els=>els.map(e=>[...e.children].map(a=>{const r=a.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height,scroll:a.scrollWidth,client:a.clientWidth};})));
    check('320 text200 buttons reflow without clipping',big.every(([a,b])=>b.top>=a.bottom&&a.height>=44&&b.height>=44&&a.scroll<=a.client&&b.scroll<=b.client)&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),big);
    await p.locator('#rookies .guide-level-actions').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'320-text200-controls.png')});
   }
   await c.close();
  }
  const c=await context({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
  await p.goto(base+'#rookies');await p.evaluate(()=>document.fonts.ready);
  check('deep link restores logical state without highlight',await p.locator('[data-guide-filter=rookies]').getAttribute('aria-pressed')==='true'&&await p.locator('.is-arriving,.is-selected').count()===0);
  const old=p.url(),popupPromise=c.waitForEvent('page');await p.locator('.guide-index a[href="#riders"]').click({modifiers:['Control']});const popup=await popupPromise;await popup.waitForLoadState();await popup.close();
  check('Ctrl-click preserves original URL and logical state',p.url()===old&&await p.locator('[data-guide-filter=rookies]').getAttribute('aria-pressed')==='true'&&await p.locator('.is-arriving').count()===0);
  await p.locator('#rookies .guide-level-cta').click();await p.locator('[data-guide-filter=riders]').click();await p.reload();
  check('reload preserves travel filter without cue',await p.locator('[data-guide-filter=riders]').getAttribute('aria-pressed')==='true'&&await p.locator('.is-arriving').count()===0);
  await p.goBack();check('back restores previous travel filter',await p.locator('[data-guide-filter=rookies]').getAttribute('aria-pressed')==='true');
  await p.goForward();check('forward restores travel filter',await p.locator('[data-guide-filter=riders]').getAttribute('aria-pressed')==='true');
  check('logical state persists in help WhatsApp',new URL(await p.locator('[data-guide-enquiry]').getAttribute('href')).searchParams.get('text').includes('Riders'));
  for(const slug of ['rookies','aprendices','riders','supercracks']){
   const a=p.locator('#'+slug+' .guide-level-enquiry'),promise=c.waitForEvent('page');const href=await a.getAttribute('href');await a.click();const tab=await promise;await tab.waitForLoadState();await tab.close();const text=new URL(href).searchParams.get('text');check(slug+' WhatsApp keeps context/autonomy',text.toLowerCase().includes(slug)&&text.includes('autonomía')&&text.includes('consultar')&&new URL(href).pathname==='/34648189257');
  }
  await p.locator('[data-guide-filter=""]').click();check('all removes contextual filtering and leaves no highlight',await p.locator('[data-guide-filter=""]').getAttribute('aria-pressed')==='true'&&new URL(p.url()).searchParams.has('nivel')===false&&await p.locator('.is-arriving').count()===0);
  await c.close();
  const nc=await context({viewport:{width:320,height:740},javaScriptEnabled:false,reducedMotion:'no-preference'}),np=await nc.newPage();await np.goto(base);await np.locator('.guide-index a[href="#riders"]').click();await np.waitForTimeout(1600);
  check('noJS native anchor, static guide and no persistent cue',new URL(np.url()).hash==='#riders'&&await np.locator('.guide-level:visible').count()===4&&await np.locator('#riders .guide-level-heading').evaluate(e=>getComputedStyle(e).backgroundColor)==='rgb(27, 27, 27)');
  await np.locator('.guide-trip-pending summary').focus();await np.keyboard.press('Enter');await np.waitForTimeout(250);
  check('noJS disclosure remains usable and text upright',await np.locator('.guide-trip-pending').evaluate(e=>e.open&&[...e.querySelector('summary').children].slice(0,2).every(el=>getComputedStyle(el).transform==='none')));
  check('noJS all six trip destinations and contextual links available',await np.locator('.guide-trip-card:visible').count()===6&&await np.locator('.guide-level-enquiry[href^="https://wa.me/"]').count()===4);
  await nc.close();check('no page errors',report.errors.length===0,report.errors);check('four WhatsApp navigations intercepted locally',report.whatsapp.length===4);
 }catch(e){report.fatal=e.stack;}finally{await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(x=>!x.pass),errors:report.errors,fatal:report.fatal,whatsapp:report.whatsapp.length}));}
})();
