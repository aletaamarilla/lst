import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import http from 'node:http';
import path from 'node:path';

// Exercise the actual local build through an isolated server, never the user's preview.
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const output=path.resolve(process.env.LST_QA_OUTPUT||'docs/qa/2026-10-24-home-transitions/levels');
const root=path.resolve('dist');
const levels=[['nivel-1','Iniciación','1'],['nivel-2','Base','2'],['nivel-3','Intermedio','3'],['nivel-4','Avanzado','4']];
await mkdir(output,{recursive:true});
const testedFiles=['dist/index.html','dist/homepage.css','dist/home.js','dist/app.js','dist/styles.css','dist/niveles/index.html','dist/levels.css','dist/levels.js','dist/viajes/index.html','dist/catalog.js','dist/catalog-filter.js'];
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
const loadHome=async page=>{await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);};
// Home level list (.hp-lvl): each level has one action, «Ver viajes»; the guide is linked once below the list.
const measureActions=page=>page.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
 const overlap=(a,b)=>Math.min(a.right,b.right)>Math.max(a.left,b.left)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1;
 return [...document.querySelectorAll('.hp-lvl')].map(item=>{
  const actions=[...item.querySelectorAll('.hp-lvl-links a')];
  const bounds=rect(item),heading=item.querySelector('h3');
  const links=actions.map(link=>({text:link.textContent.trim(),href:link.getAttribute('href'),bounds:rect(link),clipped:link.scrollWidth>link.clientWidth+1}));
  return {tag:item.tagName,title:heading?.textContent,bounds,links,nested:!!item.querySelector('a a,button a,a button'),overlap:false};
 });
});
const checkLayout=async(page,label)=>{
 const items=await measureActions(page);layouts.push({label,items});
 check(items.length===4&&items.every(item=>item.tag==='LI'&&item.links.length===1&&!item.nested),label+': four levels expose one native link each',items);
 check(items.every(item=>!item.overlap&&item.links.every(link=>!link.clipped&&link.bounds.left>=item.bounds.left-1&&link.bounds.right<=item.bounds.right+1)),label+': actions do not overlap or clip',items);
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+': no horizontal page overflow');
};
try{
 browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
 for(const width of [320,390,768,1440])await scenario('layout '+width,async()=>{
  const page=await browser.newPage({...pageOptions,viewport:{width,height:900}});
  page.on('pageerror',error=>pageErrors.push(error.message));
  try{
   await loadHome(page);await checkLayout(page,'width '+width+' normal');
   const contracts=await page.locator('.hp-lvl').evaluateAll(items=>items.map(item=>({title:item.querySelector('h3')?.textContent,links:[...item.querySelectorAll('.hp-lvl-links a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])})));
   check(contracts.every((item,i)=>item.title.includes(levels[i][1])&&item.links.length===1&&item.links[0][1]==='/viajes/?nivel='+levels[i][2]&&/ver viajes/i.test(item.links[0][0])),'width '+width+': each action preserves its own destination and level name',contracts);
   check(await page.locator('.hp-levels-foot a').evaluateAll(as=>as.length===1&&as[0].getAttribute('href')==='/niveles/'),'width '+width+': one link to the full level guide');
   await page.locator('.hp-lvls').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,'levels-'+width+'.png'),fullPage:false});
   await zoomText(page);await checkLayout(page,'width '+width+' text 200%');
   await page.locator('.hp-lvls').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,'levels-'+width+'-text-200.png'),fullPage:false});
  }finally{await page.close();}
 });
 for(const javaScriptEnabled of [true,false])await scenario('navigation JS '+javaScriptEnabled,async()=>{
  const page=await browser.newPage({...pageOptions,javaScriptEnabled});
  page.on('pageerror',error=>pageErrors.push(error.message));
  try{
   for(const [,name,number]of levels){
    await loadHome(page);
    const item=page.locator('.hp-lvl').nth(Number(number)-1);
    await item.locator('a[href^="/viajes/"]').click();
    await page.waitForURL(url=>url.pathname==='/viajes/'&&url.searchParams.get('nivel')===number,{waitUntil:'domcontentloaded'});
    check(new URL(page.url()).searchParams.get('nivel')===number,'JS '+javaScriptEnabled+': '+name+' Ver viajes opens its catalogue filter');
   }
  }finally{await page.close();}
 });
 await scenario('keyboard traversal',async()=>{
  const page=await browser.newPage(pageOptions);
  try{
   await loadHome(page);
   await page.locator('.hp-lvl').first().locator('a[href^="/viajes/"]').focus();
   await page.keyboard.press('Tab');
   check(await page.locator('.hp-lvl').nth(1).locator('a[href^="/viajes/"]').evaluate(e=>{const style=getComputedStyle(e);return document.activeElement===e&&e.matches(':focus-visible')&&style.outlineStyle!=='none'&&parseFloat(style.outlineWidth)>=2;}),'keyboard Tab reaches the next level Ver viajes with visible focus');
   await page.locator('.hp-levels-foot a').focus();await page.keyboard.press('Enter');
   await page.waitForURL(url=>url.pathname==='/niveles/',{waitUntil:'domcontentloaded'});
   check(new URL(page.url()).pathname==='/niveles/','keyboard Enter on the guide link opens /niveles/');
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
