import {createRequire} from 'node:module';
import {readFile,writeFile,stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE);
const root=path.resolve('dist');
const server=http.createServer(async(req,res)=>{try{let p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(p!==root&&!p.startsWith(root+path.sep))throw Error('path');if((await stat(p)).isDirectory())p=path.join(p,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const out={checks:[]};
try{for(const width of [320,390,768,1440]){
const page=await browser.newPage({viewport:{width,height:900},javaScriptEnabled:false,reducedMotion:'reduce'});
await page.goto(base);await page.locator('#opiniones').scrollIntoViewIfNeeded();
const summary=page.locator('#dudas summary').nth(1);
await summary.focus();await summary.press('Enter');
assert(await page.locator('#dudas details').nth(1).getAttribute('open')!==null,'native Enter');
await summary.press('Tab');const target=await page.locator(':focus').getAttribute('href');assert.equal(target,'/niveles/');
const focus=await page.locator(':focus').evaluate(e=>{const r=e.getBoundingClientRect(),d=e.closest('details').getBoundingClientRect(),s=getComputedStyle(e);return {color:s.color,bg:s.backgroundColor,outline:s.outlineColor,width:s.outlineWidth,offset:s.outlineOffset,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},details:{left:d.left,right:d.right,top:d.top,bottom:d.bottom}}});
assert.equal(focus.outline,'rgb(27, 27, 27)');assert.equal(focus.width,'3px');assert(focus.rect.left-8>=focus.details.left&&focus.rect.right+8<=focus.details.right&&focus.rect.bottom+8<=focus.details.bottom,'unclipped link focus');
await summary.focus();await summary.press('Space');assert.equal(await page.locator('#dudas details').nth(1).getAttribute('open'),null,'native Space closes');
const computed=await summary.evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,bg:s.backgroundColor,outline:s.outlineColor,offset:s.outlineOffset};});
assert.equal(computed.color,'rgb(255, 250, 231)');assert.equal(computed.bg,'rgb(27, 27, 27)');assert.equal(computed.outline,'rgb(255, 250, 231)');assert.equal(computed.offset,'-6px');
const content=await page.locator('#reservar').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,steps:e.querySelectorAll('ol > li').length,href:e.querySelector('a').href}));
assert.equal(content.bg,'rgb(234, 89, 52)');assert.equal(content.color,'rgb(27, 27, 27)');assert.equal(content.steps,3);assert(content.href.startsWith('https://wa.me/34648189257?text='));
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!overflow);
out.checks.push({width,nativeFaq:true,focus,computed,booking:content,overflow});
await page.close();}
const contrast=(a,b)=>{const l=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
out.contrasts={paperInk:contrast([255,250,231],[27,27,27]),orangeInk:contrast([234,89,52],[27,27,27]),paperOrange:contrast([255,250,231],[234,89,52])};
await writeFile('docs/qa/2026-10-24-home-final-sections/independent-check.json',JSON.stringify(out,null,2));console.log(JSON.stringify({status:'PASS',viewports:out.checks.map(x=>x.width),contrasts:out.contrasts}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
