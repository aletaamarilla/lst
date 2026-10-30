import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE);
const qa='docs/qa/2026-10-24-home-superficies';
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const result=[];
try{for(const baseline of [false,true])for(const width of [320,390,1440])for(const scale of (baseline?[1]:[1,2])){
const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
if(baseline)await page.route('**/home.css',r=>r.fulfill({body:readFile(qa+'/before/home.css','utf8'),contentType:'text/css'}));
if(baseline){await page.unroute('**/home.css');const old=await readFile(qa+'/before/home.css','utf8');await page.route('**/home.css',r=>r.fulfill({body:old,contentType:'text/css'}));}
await page.goto('http://127.0.0.1:4198',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
if(scale===2)await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')];const sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=(sizes[i]*2)+'px');});
const data=await page.evaluate(()=>{const actualBg=s=>{let e=document.querySelector(s);while(e){let c=getComputedStyle(e).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;e=e.parentElement;}};return {overflow:document.documentElement.scrollWidth-innerWidth,colors:Object.fromEntries(['.lst-trips','.home-trip','.lst-levels','.lst-level-card','.lst-testimonials','.faq','.lst-booking'].map(s=>[s,actualBg(s)])),levels:[...document.querySelectorAll('.lst-level-card h3')].map(e=>{const text=e.firstChild;const lines={};for(let i=0;i<text.length;i++){const r=new Range();r.setStart(text,i);r.setEnd(text,i+1);const y=r.getBoundingClientRect().top;lines[y]=(lines[y]||'')+text.textContent[i];}return {text:e.textContent,lines:Object.values(lines),width:e.clientWidth,scrollWidth:e.scrollWidth,font:getComputedStyle(e).font,fontSize:getComputedStyle(e).fontSize};}),cta:document.querySelector('.home-trip-action').getBoundingClientRect().height};});
result.push({baseline,width,scale,...data});
if(!baseline&&width===390&&scale===1){await page.locator('.lst-levels').scrollIntoViewIfNeeded();await page.locator('.lst-levels').screenshot({path:qa+'/levels-review-390.png'});}
await page.close();}
await writeFile(qa+'/browser-independiente.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}finally{await browser.close();}
