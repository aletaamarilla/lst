import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Antonio Fernandez/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/Antonio Fernandez/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const qa=path.resolve('docs/qa/2026-10-25-landings-caracter');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const report={views:[],errors:[],issues:[],contrasts:[]};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const linear=x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4;
const lum=rgb=>.2126*linear(rgb[0])+.7152*linear(rgb[1])+.0722*linear(rgb[2]);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
try{
for(const [kind,route]of [['about','/conocenos/']])for(const width of [390])for(const mode of ['normal']){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js'});
 await context.route('**/*',r=>{try{let f=path.join(process.cwd(),'dist',decodeURIComponent(new URL(r.request().url()).pathname));if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');return r.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'application/octet-stream'})}catch{return r.abort()}});
 const page=await context.newPage();page.setDefaultTimeout(5000);page.on('pageerror',e=>report.errors.push({kind,width,mode,error:e.message}));
 await page.goto('http://review.test'+route);await page.evaluate(()=>document.fonts.ready);
 await page.locator('main img').evaluateAll(async es=>Promise.all(es.map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
 if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px')});
 if(mode!=='no-js')await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const measure=()=>page.evaluate(()=>({width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cls:e.className,sw:e.scrollWidth,cw:e.clientWidth,text:e.textContent.slice(0,65)}))}));
 const record={kind,width,mode,closed:await measure()};
 if(kind==='faq'){
 for(const s of await page.locator('.faq-answers summary').all()){await s.focus();await page.keyboard.press('Enter')}
 record.answersOpen=await page.locator('.faq-answers details[open]').count();record.open=await measure();
 }
 if(mode!=='no-js'&&width<1000){await page.locator('.menu-toggle').click();record.menuOpen=await page.locator('#main-nav').isVisible();await page.keyboard.press('Escape');record.menuClosed=(await page.locator('.menu-toggle').getAttribute('aria-expanded'))==='false'}
 await page.evaluate(()=>scrollTo(0,500));record.headerScrolled=await page.locator('.site-header').evaluate(e=>({top:e.getBoundingClientRect().top,position:getComputedStyle(e).position,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));
 if(mode==='normal'&&[390,1440].includes(width)){
  await page.evaluate(()=>scrollTo(0,0));const foreground=PNG.sync.read(await page.screenshot());
  const rect=await page.locator('h1 em').evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}});
  await page.locator('h1').evaluate(e=>{e.style.color='transparent';e.querySelectorAll('*').forEach(n=>n.style.color='transparent')});const background=PNG.sync.read(await page.screenshot());
  const ratios=[],low=[];for(let y=Math.max(0,Math.floor(rect.y));y<Math.min(foreground.height,Math.ceil(rect.y+rect.height));y++)for(let x=Math.max(0,Math.floor(rect.x));x<Math.min(foreground.width,Math.ceil(rect.x+rect.width));x++){const n=(y*foreground.width+x)*4;const f=[foreground.data[n],foreground.data[n+1],foreground.data[n+2]];if(f.every((c,i)=>Math.abs(c-[234,89,52][i])<=2)&&f.reduce((s,c,i)=>s+Math.abs(c-background.data[n+i]),0)>24){const bg=[background.data[n],background.data[n+1],background.data[n+2]],v=ratio(f,bg);ratios.push(v);if(v<3)low.push({x,y,fg:f,bg,ratio:v})}}
  ratios.sort((a,b)=>a-b);low.sort((a,b)=>a.ratio-b.ratio);report.contrasts.push({kind,width,lowCount:low.length,lowest:low.slice(0,8),pixels:ratios.length,min:ratios[0],p05:ratios[Math.floor(ratios.length*.05)],max:ratios.at(-1)});
 }
 report.views.push(record);if(record.closed.width>width+1||record.closed.overflow.length||record.open&&(record.open.width>width+1||record.open.overflow.length)||record.answersOpen!==undefined&&record.answersOpen!==8)report.issues.push(record);
 await context.close();
}
}finally{await browser.close()}
report.hashes=['dist/landing.css','dist/about.css','dist/faq.css','dist/conocenos/index.html','dist/preguntas-frecuentes/index.html'].map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
const before=fs.readFileSync(path.join(qa,'before/faqs.html'),'utf8'),after=fs.readFileSync('dist/preguntas-frecuentes/index.html','utf8');const summaries=h=>[...h.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map(x=>x[1]);report.sameFaqQuestions=JSON.stringify(summaries(before))===JSON.stringify(summaries(after));const links=h=>[...h.matchAll(/<details>[\s\S]*?<\/details>/g)].map(d=>[...d[0].matchAll(/href="([^"]+)"/g)].map(x=>x[1]));report.sameFaqAnswerTargets=JSON.stringify(links(before))===JSON.stringify(links(after));
fs.writeFileSync(path.join(qa,'independent-about-low-contrast.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,errors:report.errors,issues:report.issues,contrasts:report.contrasts,sameFaqQuestions:report.sameFaqQuestions,sameFaqAnswerTargets:report.sameFaqAnswerTargets},null,2));
