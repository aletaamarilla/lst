const {chromium}=require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const fs=require('node:fs');
const phase=process.argv[2]||'before';const out=`/tmp/lst-balance-20261012/${phase}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});const report=[];
for(const width of [320,390,768,1024,1440]) for(const slug of ['home','el-salvador','asturias','azores','euskadi','marruecos','cadiz']){
 const page=await browser.newPage({viewport:{width,height:width<600?844:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 const res=await page.goto('http://127.0.0.1:4175/'+(slug==='home'?'':`viajes/${slug}/`));await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}scrollTo(0,0)});
 await page.screenshot({path:`${out}/${slug}-${width}-hero.png`});await page.screenshot({path:`${out}/${slug}-${width}-full.png`,fullPage:true});
 const selectors=slug==='home'?['#viajes','#experiencia','#nosotros']:['.trip-summary','.trip-gallery','#nivel'];
 for(const sel of selectors){const clip=await page.locator(sel).evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height}});await page.screenshot({path:`${out}/${slug}-${width}-${sel.slice(1)}.png`,fullPage:true,clip});}
 report.push({slug,width,status:res.status(),errors,...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,fonts:document.fonts.status,missingImages:[...document.images].filter(i=>!i.closest('dialog:not([open])')&&(!i.complete||!i.naturalWidth)).map(i=>i.src),headings:[...document.querySelectorAll('main h2')].map(e=>({text:e.textContent,y:Math.round(e.getBoundingClientRect().top+scrollY)}))}))});await page.close();
}await browser.close();fs.writeFileSync(`${out}/audit.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.length,failures:report.filter(r=>r.scrollWidth>r.width||r.errors.length||r.missingImages.length)}));})().catch(e=>{console.error(e);process.exitCode=1});
