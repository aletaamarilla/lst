import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Antonio Fernandez/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const cwd=process.cwd(),qa=path.join(cwd,'docs/qa/2026-10-25-landings-ux');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const report={views:[],errors:[],issues:[]};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
try{
for(const [kind,route]of [['about','/conocenos/'],['faq','/preguntas-frecuentes/']])for(const width of [320,390,768,1440])for(const mode of ['normal','text200','no-js']){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js'});
 await context.route('**/*',r=>{try{let f=path.join(cwd,'dist',decodeURIComponent(new URL(r.request().url()).pathname));if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');return r.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'application/octet-stream'})}catch{return r.abort()}});
 const page=await context.newPage();page.setDefaultTimeout(4000);console.log('view',kind,width,mode);page.on('pageerror',e=>report.errors.push({kind,width,mode,error:e.message}));
 await page.goto('http://review.test'+route);await Promise.race([page.evaluate(()=>document.fonts.ready),new Promise(r=>setTimeout(r,3000))]);
 if(mode==='text200')await page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px')});
 if(mode!=='no-js')await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const geometry=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,heroHeight:document.querySelector('.landing-hero').clientHeight,titleTop:document.querySelector('h1').getBoundingClientRect().top,headerHeight:document.querySelector('header').clientHeight,overflow:[...document.querySelectorAll('main *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cls:e.className,sw:e.scrollWidth,cw:e.clientWidth,text:e.textContent.slice(0,60)}))}));
 const record={kind,width,mode,...geometry};
 if(kind==='faq'){
 for(const summary of await page.locator('.faq-answers summary').all()){await summary.focus();await page.keyboard.press('Enter')};
 record.answersOpen=await page.locator('.faq-answers details[open]').count();
 }
 if(mode!=='no-js'&&width<1000){await page.locator('.menu-toggle').click();record.menuOpen=await page.locator('#main-nav').isVisible();await page.keyboard.press('Escape');record.menuClosed=(await page.locator('.menu-toggle').getAttribute('aria-expanded'))==='false'}
 await page.evaluate(()=>scrollTo(0,500));record.headerScrolled=await page.locator('.site-header').evaluate(e=>({top:e.getBoundingClientRect().top,position:getComputedStyle(e).position}));
 report.views.push(record);
 if(record.scrollWidth>width+1||record.overflow.length||record.answersOpen!==undefined&&record.answersOpen!==8)report.issues.push(record);
 await context.close();
}
}finally{await browser.close()}
report.hashes=['dist/landing.css','dist/about.css','dist/faq.css','dist/conocenos/index.html','dist/preguntas-frecuentes/index.html'].map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
const baseFaq=fs.readFileSync(path.join(qa,'before/faqs.html'),'utf8');const currentFaq=fs.readFileSync('dist/preguntas-frecuentes/index.html','utf8');
const answers=html=>[...html.matchAll(/<details>[\s\S]*?<\/details>/g)].map(x=>x[0]);report.exactFaqAnswers=JSON.stringify(answers(baseFaq))===JSON.stringify(answers(currentFaq));
fs.writeFileSync(path.join(qa,'independent-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,errors:report.errors,issues:report.issues,exactFaqAnswers:report.exactFaqAnswers},null,2));


