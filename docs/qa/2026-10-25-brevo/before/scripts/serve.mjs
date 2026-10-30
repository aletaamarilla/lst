import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {adaptTrips} from './sanity-trips.mjs';
import {renderHomeTrips} from './render-home-trips.mjs';
import {renderCatalog} from './render-catalog.mjs';
import {renderLevelTrips} from './render-level-trips.mjs';
import {renderTrip} from './render-trips.mjs';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2'};

export async function readLocalPreview(file='artifacts/local-trip-preview.json') {
  let content;
  try { content=await readFile(file,'utf8'); }
  catch(error) { if(error.code==='ENOENT')return null;throw error; }
  const data=JSON.parse(content);
  if(data.source!=='sanity-drafts-local'||!Array.isArray(data.documents))throw Error('La copia local de promociones no tiene un formato válido.');
  return adaptTrips(data.documents);
}

export function renderPreviewPage(relative, current, trips) {
  if(relative==='catalog-snapshot.json')return JSON.stringify({source:'sanity-local-preview',trips},null,2)+'\n';
  if(relative==='index.html')return renderHomeTrips(current,trips);
  if(relative==='viajes/index.html')return renderCatalog(current,trips);
  if(relative==='niveles/index.html')return renderLevelTrips(current,trips);
  const slug=/^viajes\/([^/]+)\/index\.html$/.exec(relative)?.[1];
  const trip=slug&&trips.find(t=>t.slug===slug||t.aliases?.includes(slug));
  return trip?renderTrip(trip,trips):current;
}

export function createSiteServer({root=path.resolve('dist'),previewTrips=null}={}) {
  root=path.resolve(root);
  return http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      const name=decodeURIComponent(url.pathname);
      let file=path.resolve(root,'.'+name);
      if(file!==root&&!file.startsWith(root+path.sep))throw Error('Invalid path');
      if((await stat(file)).isDirectory())file=path.join(file,'index.html');
      const extension=path.extname(file);
      let content=await readFile(file);
      // Render against current templates on each request, without modifying release output.
      if(previewTrips&&(extension==='.html'||path.basename(file)==='catalog-snapshot.json')) {
        const relative=path.relative(root,file).split(path.sep).join('/');
        content=renderPreviewPage(relative,content.toString('utf8'),previewTrips);
      }
      res.writeHead(200,{'Content-Type':types[extension]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','X-LST-Data-Source':previewTrips?'sanity-local-preview':'dist'});
      res.end(content);
    } catch {
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
      res.end('No encontrado');
    }
  });
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if(args.some(arg=>arg!=='--local-preview'))throw Error('Uso: serve.mjs [--local-preview]');
  const previewTrips=args.includes('--local-preview')?await readLocalPreview():null;
  createSiteServer({previewTrips}).listen(4175,previewTrips?'127.0.0.1':'0.0.0.0',()=>{
    console.log('Local: http://localhost:4175');
    console.log(previewTrips?'Promociones en vista local; dist y Sanity no se modifican.':'Datos de dist.');
  });
}
