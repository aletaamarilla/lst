import {createRequire} from 'node:module';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const root=path.resolve('dist'),out=path.resolve('docs/qa/2026-10-24-viajes-unificados');
const trips=JSON.parse(await readFile(root+'/catalog-snapshot.json','utf8')).trips;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto(base+'/viajes/');
  const images=await page.evaluate(async()=>{await document.fonts.ready;return Promise.all([...document.images].map(async img=>{img.loading='eager';try{await img.decode();}catch{}return {src:img.src,loaded:img.complete&&img.naturalWidth>0};}));});
  if(images.some(i=>!i.loaded))throw Error('Image not loaded');
  await page.screenshot({path:out+'/catalog-'+width+'.png',fullPage:true});
  await page.close();
 }
 console.log('Both catalogue captures have decoded photographs.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
