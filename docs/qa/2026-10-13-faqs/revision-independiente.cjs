const fs=require('fs');
const crypto=require('crypto');
const {chromium}=require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
(async()=>{
const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
const report={checks:[],errors:[],hashes:{}};
const check=(name,pass,data)=>report.checks.push({name,pass,data});
const routes=['/','/niveles/','/conocenos/','/viajes/','/preguntas-frecuentes/','/viajes/el-salvador/','/viajes/asturias/','/viajes/azores/','/viajes/euskadi/','/viajes/marruecos/','/viajes/cadiz/'];
for(const javaScriptEnabled of [true,false])for(const width of [320,390,768,1000,1440]){
 const context=await browser.newContext({viewport:{width,height:800},javaScriptEnabled,reducedMotion:'reduce'});
 await context.route('https://**/*',r=>r.abort());
 const page=await context.newPage(); page.on('pageerror',err=>report.errors.push({width,javaScriptEnabled,error:String(err)}));
 for(const route of routes){
  const key=`${javaScriptEnabled?'JS':'noJS'} ${width} ${route}`;
  const response=await page.goto('http://127.0.0.1:4175'+route); await page.evaluate(()=>document.fonts.ready);
  const dimensions=await page.evaluate(()=>({w:innerWidth,scrollWidth:document.documentElement.scrollWidth,noindex:document.querySelector('[name=robots]')?.content,header:(()=>{let h=document.querySelector('header');let r=h.getBoundingClientRect();return {top:r.top,bottom:r.bottom,position:getComputedStyle(h).position}})()}));
  check(key+' route/noindex/width',response.status()===200&&dimensions.noindex==='noindex,nofollow'&&dimensions.scrollWidth<=width,dimensions);
  if(!route.includes('/viajes/')||route==='/viajes/'){
   if(!javaScriptEnabled){
    const fallback=await page.locator('.static-navigation a').evaluateAll(els=>els.map(e=>{let r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.textContent,top:r.top,bottom:r.bottom,hit:e===hit||e.contains(hit)}}));
    check(key+' fallback links clickable',fallback.length===4&&fallback.every(x=>x.hit),fallback);
   }else if(width<1000){
    await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
    check(key+' menu keyboard enters',await page.evaluate(()=>document.activeElement===document.querySelector('#main-nav a')));
    const menu=await page.locator('#main-nav a').evaluateAll(els=>els.map(e=>{let r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.textContent,top:r.top,bottom:r.bottom,hit:e===hit||e.contains(hit)}}));
    check(key+' menu fits',menu.every(x=>x.hit),menu);
    await page.keyboard.press('Escape');check(key+' escape restores focus',await page.evaluate(()=>document.activeElement.matches('.menu-toggle')&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'));
   }
  }
  if(route==='/preguntas-frecuentes/'){
   const summaries=page.locator('.faq-answers summary');
   check(key+' native questions',await summaries.count()===8);
   for(let i=0;i<8;i++){await summaries.nth(i).focus();await page.keyboard.press(i%2?'Space':'Enter');}
   check(key+' all eight open with keyboard',await page.locator('.faq-answers details[open]').count()===8);
   check(key+' no overflow after opening',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(let i=0;i<8;i++){const p=page.locator('.faq-answers details>p').nth(i);check(key+' answer '+i+' visible',await p.isVisible());}
   await page.locator('.faq-index a[href="#preparacion"]').click();await page.waitForTimeout(80);
   const target=await page.evaluate(()=>({target:document.querySelector('#preparacion .faq-topic-heading').getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom}));
   check(key+' anchor heading below fixed header',target.target>=target.header,target);
   if(width===390){await page.screenshot({path:`/tmp/lst-faq-review-${javaScriptEnabled?'js':'nojs'}.png`,fullPage:true});}
  }
 }
 await context.close();
}
for(const f of ['dist/preguntas-frecuentes/index.html','dist/faq.css','dist/index.html','dist/styles.css','dist/mobile.css','dist/app.js','dist/niveles/index.html','dist/conocenos/index.html','dist/viajes/index.html','scripts/render-trips.mjs','data/trips.json'])report.hashes[f]=crypto.createHash('sha256').update(fs.readFileSync('/home/amfernandez/personalProjects/letsurftogethersystem/'+f)).digest('hex');
fs.writeFileSync('/tmp/lst-faq-independent-review.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({count:report.checks.length,failures:report.checks.filter(c=>!c.pass),errors:report.errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
