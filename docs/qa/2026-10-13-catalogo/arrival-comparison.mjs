import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const b=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
const results=[];
try{
for(let run=1;run<=5;run++)for(const [version,port] of [['base',4177],['candidate',4175]]){
 const c=await b.newContext({viewport:{width:320,height:844},reducedMotion:'no-preference'});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();await p.goto(`http://127.0.0.1:${port}/niveles/`);await p.evaluate(()=>document.fonts.ready);
 for(const slug of ['supercracks','supercracks','rookies']){
  await p.locator(`.guide-index a[href="#${slug}"]`).focus();await p.keyboard.press('Enter');
  try{await p.waitForFunction(s=>document.getElementById(s).classList.contains('is-arriving'),slug,{timeout:5000});
   const r=await p.locator(`#${slug}`).evaluate(e=>({top:e.getBoundingClientRect().top,header:document.querySelector('header').getBoundingClientRect().bottom,padding:getComputedStyle(document.documentElement).scrollPaddingTop}));
   results.push({run,version,slug,...r,passesOriginal:r.top>=r.header-1&&r.top<=r.header+20,clearsHeader:r.top>=r.header-1});
   await p.waitForFunction(()=>!document.querySelector('.is-arriving'));await p.waitForTimeout(220);
  }catch(e){results.push({run,version,slug,error:e.message});}
 }
 await c.close();
}
}finally{await b.close();fs.writeFileSync('/home/amfernandez/personalProjects/letsurftogethersystem/docs/qa/2026-10-13-catalogo/arrival-comparison.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}
