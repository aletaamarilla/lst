import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import http from 'node:http';
import path from 'node:path';

// Exercise the actual local build through an isolated server, never the user's preview.
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const output=path.resolve(process.env.LST_QA_OUTPUT||'docs/qa/2026-10-24-home-transitions/levels');
const root=path.resolve('dist');
const levels=[['rookies','Rookies','1'],['aprendices','Aprendices','2'],['riders','Riders','3'],['supercracks','Supercracks','4']];
await mkdir(output,{recursive:true});
const testedFiles=['dist/index.html','dist/home.css','dist/home.js','dist/app.js','dist/styles.css','dist/mobile.css','dist/niveles/index.html','dist/levels.css','dist/levels.js','dist/viajes/index.html','dist/catalog.js','dist/catalog-filter.js'];
const hashes=Object.fromEntries(await Promise.all(testedFiles.map(async file=>[file,createHash('sha256').update(await readFile(file)).digest('hex')])));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(file!==root&&!file.startsWith(root+path.sep))throw Error('outside root');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
 res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let browser;
const checks=[],layouts=[],arrivals=[],pageErrors=[];
const check=(condition,name,details=null)=>checks.push({name,pass:!!condition,...(details?{details}:{})});
const scenario=async(name,fn)=>{try{await fn();}catch(error){check(false,name,{error:error.message});}};
const pageOptions={viewport:{width:390,height:900},reducedMotion:'reduce'};
const zoomText=page=>page.evaluate(()=>{const elements=[...document.querySelectorAll('body,body *')];const sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));elements.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
const loadHome=async page=>{await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);};
const measureActions=page=>page.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
 const overlap=(a,b)=>Math.min(a.right,b.right)>Math.max(a.left,b.left)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1;
 return [...document.querySelectorAll('.lst-level-card')].map(card=>{
  const actions=[...card.querySelectorAll('.lst-level-actions a')];
  const bounds=rect(card),heading=card.querySelector('h3');
  const links=actions.map(link=>({text:link.textContent.trim(),href:link.getAttribute('href'),label:link.getAttribute('aria-label'),bounds:rect(link),clipped:link.scrollWidth>link.clientWidth+1||link.scrollHeight>link.clientHeight+1}));
  return {tag:card.tagName,title:heading?.textContent,id:heading?.id,labelledby:card.getAttribute('aria-labelledby'),bounds,links,nested:!!card.querySelector('a a,button a,a button'),sameParent:actions.length===2&&actions[0].parentElement===actions[1].parentElement,overlap:links.length===2&&overlap(links[0].bounds,links[1].bounds)};
 });
});
const checkLayout=async(page,label)=>{
 const cards=await measureActions(page);layouts.push({label,cards});
 check(cards.length===4&&cards.every(card=>card.tag==='ARTICLE'&&card.labelledby===card.id&&card.links.length===2&&!card.nested&&card.sameParent),label+': four named cards expose two sibling native links',cards);
 check(cards.every(card=>!card.overlap&&card.links.every(link=>link.bounds.height>=43.9&&link.bounds.width>=43.9&&!link.clipped&&link.bounds.left>=card.bounds.left-1&&link.bounds.right<=card.bounds.right+1&&link.bounds.top>=card.bounds.top&&link.bounds.bottom<=card.bounds.bottom+1)),label+': both actions have 44px targets, no overlap or clipping',cards);
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+': no horizontal page overflow');
};
const checkArrival=async(page,slug,label)=>{
 await page.waitForURL(url=>url.pathname==='/niveles/'&&url.hash==='#'+slug);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(slug=>{
  const target=document.getElementById(slug),heading=target?.querySelector('h2'),header=document.querySelector('.site-header');
  if(!heading)return false;
  const r=heading.getBoundingClientRect(),h=header.getBoundingClientRect();
  return r.top>=Math.max(h.bottom,0)-1&&r.bottom<=innerHeight;
 },slug);
 const result=await page.evaluate(slug=>{
  const target=document.getElementById(slug),heading=target.querySelector('h2');
  const r=heading.getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect();
  return {slug,url:location.pathname+location.search+location.hash,active:document.activeElement.id,heading:heading.textContent,headingTop:r.top,headingBottom:r.bottom,headerBottom:h.bottom,viewportHeight:innerHeight};
 },slug);
 arrivals.push({label,...result});
 check(result.active===slug&&result.headingTop>=result.headerBottom-1&&result.headingBottom<=result.viewportHeight,label+': intended guide section receives focus and its heading clears the fixed header',result);
};
try{
 browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
 for(const width of [320,390,768,1440])await scenario('layout '+width,async()=>{
  const page=await browser.newPage({...pageOptions,viewport:{width,height:900}});
  page.on('pageerror',error=>pageErrors.push(error.message));
  try{
   await loadHome(page);await checkLayout(page,'width '+width+' normal');
   const contracts=await page.locator('.lst-level-card').evaluateAll(cards=>cards.map(card=>({title:card.querySelector('h3')?.textContent,heading:card.querySelector('h3')?.id,trip:card.querySelector('.lst-level-cta')?.getAttribute('href'),more:card.querySelector('.lst-level-more')?.getAttribute('href'),labels:[...card.querySelectorAll('.lst-level-actions a')].map(a=>a.getAttribute('aria-label')||'')})));
   check(contracts.every((card,i)=>card.heading==='home-level-'+levels[i][0]+'-title'&&card.trip==='/viajes/?nivel='+levels[i][2]&&card.more==='/niveles/#'+levels[i][0]&&card.labels[0].toLowerCase().includes('ver viajes')&&card.labels[1].toLowerCase().includes('saber más')&&card.labels.every(label=>label.toLowerCase().includes(levels[i][1].toLowerCase()))),'width '+width+': each action preserves its own destination and accessible level name',contracts);
   await page.locator('.lst-level-grid').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,'levels-'+width+'.png'),fullPage:false});
   await zoomText(page);await checkLayout(page,'width '+width+' text 200%');
   await page.locator('.lst-level-grid').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,'levels-'+width+'-text-200.png'),fullPage:false});
  }finally{await page.close();}
 });
 for(const javaScriptEnabled of [true,false])await scenario('navigation JS '+javaScriptEnabled,async()=>{
  const page=await browser.newPage({...pageOptions,javaScriptEnabled});
  page.on('pageerror',error=>pageErrors.push(error.message));
  try{
   for(const [slug,name,number]of levels){
    await loadHome(page);
    const card=page.locator('.lst-level-card').filter({has:page.locator('#home-level-'+slug+'-title')});
    await card.locator('.lst-level-cta').click();
    await page.waitForURL(url=>url.pathname==='/viajes/'&&url.searchParams.get('nivel')===number);
    check(new URL(page.url()).searchParams.get('nivel')===number,'JS '+javaScriptEnabled+': '+name+' Ver viajes opens its catalogue filter');
    await loadHome(page);
    await card.locator('.lst-level-more').click();
    await checkArrival(page,slug,'JS '+javaScriptEnabled+' '+name);
   }
  }finally{await page.close();}
 });
 await scenario('keyboard traversal',async()=>{
  const page=await browser.newPage(pageOptions);
  try{
   await loadHome(page);
   const first=page.locator('.lst-level-card').first();
   await first.locator('.lst-level-cta').focus();
   await page.keyboard.press('Tab');
   check(await first.locator('.lst-level-more').evaluate(e=>{const style=getComputedStyle(e);return document.activeElement===e&&e.matches(':focus-visible')&&style.outlineStyle!=='none'&&parseFloat(style.outlineWidth)>=2;}),'keyboard Tab reaches sibling Saber más with visible focus');
   await page.keyboard.press('Enter');await checkArrival(page,'rookies','keyboard Enter');
  }finally{await page.close();}
 });
 check(pageErrors.length===0,'no page runtime errors',pageErrors);
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
 const unchanged=await Promise.all(testedFiles.map(async file=>hashes[file]===createHash('sha256').update(await readFile(file)).digest('hex')));
 check(unchanged.every(Boolean),'tested build remained unchanged during verification');
 const result={testedAt:new Date().toISOString(),checks:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,hashes,results:checks,layouts,arrivals,pageErrors};
 await writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));
 await writeFile(path.join(output,'candidate.sha256.json'),JSON.stringify(hashes,null,2));
 console.log((result.failed?'FAIL':'PASS')+': '+result.passed+'/'+result.checks+' level action checks. Evidence: '+output);
 if(result.failed){for(const failure of checks.filter(c=>!c.pass))console.error(failure.name+': '+JSON.stringify(failure.details));process.exitCode=1;}
}
