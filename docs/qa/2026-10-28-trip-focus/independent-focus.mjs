import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {renderTrip} from '../../../scripts/render-trips.mjs';
const qa='docs/qa/2026-10-28-trip-focus/';
const current=JSON.parse(await readFile(qa+'candidate-sha256.json','utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const actual=Object.fromEntries(await Promise.all(Object.keys(current).map(async file=>[file,hash(await readFile(file))])));
await writeFile(qa+'independent-candidate-sha256.json',JSON.stringify(actual,null,2));
let priorSource=await readFile(qa+'before/scripts/render-trips.mjs','utf8');
const previousRendererHash=hash(priorSource);
priorSource=priorSource.replace(/from '\.\/([^']+)'/g,(_,file)=>"from '"+pathToFileURL(path.resolve('scripts',file)).href+"'");
const {renderTrip:before}=await import('data:text/javascript;base64,'+Buffer.from(priorSource).toString('base64'));
const {trips}=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8'));
const side=html=>html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];
const links=html=>[...html.matchAll(/<(?:a|button)\b([^>]+)>/g)].map(m=>[m[1].match(/href="([^"]+)"/)?.[1]??'',m[1].match(/data-registration="([^"]+)"/)?.[1]??'',m[1].match(/data-whatsapp="([^"]+)"/)?.[1]??'',m[1].includes('data-open-dates'),m[1].match(/aria-controls="([^"]+)"/)?.[1]??'']);
const source=trips.find(t=>t.slug==='maldivas');
const restriction='Precio en habitación compartida & suplemento <individual>.';
const makePromo=t=>({...t,departures:t.departures.map((d,i)=>({...d,promotions:i?[{label:'Early bird',price:1399,firstPlace:1,lastPlace:5,active:true}]:undefined}))});
const cases=[];
for(const promo of [false,true])for(const priceNote of [restriction,'Tarifa general por persona, sin promociones. La solicitud no confirma la reserva.','']){
 const trip={...(promo?makePromo(source):source),priceNote};
 const html=renderTrip(trip,trips),card=side(html),oldHtml=before(trip,trips);
 cases.push({promo,priceNote,nonSidebarHtmlIdentical:html.replace(card,'')===oldHtml.replace(side(oldHtml),''),escapedRestrictionShown:card.includes('Precio en habitación compartida &amp; suplemento &lt;individual&gt;.'),note:card.match(/<p class="booking-card-price-note">([\s\S]*?)<\/p>/)?.[1],applicableDatePreserved:!promo||card.includes(trip.departures[1].date),quotaPreserved:!promo||card.includes('Primeras 5 plazas'),nonSidebarDiscountPreserved:!promo||html.replace(card,'').includes('100 € de descuento'),sidebarDiscountRemoved:!card.includes('de descuento'),sidebar:card});
}
const checks=[];
for(const trip of trips){
 const oldHtml=before(trip,trips),newHtml=renderTrip(trip,trips);
 const routes=[trip.slug,...(trip.aliases??[])];
 checks.push({slug:trip.slug,routes,htmlOutsideSidebarIdentical:oldHtml.replace(side(oldHtml),'')===newHtml.replace(side(newHtml),''),allActionTargetsIdentical:JSON.stringify(links(oldHtml))===JSON.stringify(links(newHtml)),generatedCurrentMatches:await Promise.all(routes.map(async slug=>newHtml===await readFile('dist/viajes/'+slug+'/index.html','utf8')))});
}
const protectedFiles=JSON.parse(await readFile(qa+'protected-before.json','utf8'));
const protectedMatches=Object.fromEntries(await Promise.all(Object.entries(protectedFiles).map(async([file,expected])=>[file,hash(await readFile(file))===expected])));
const result={manifestMatches:JSON.stringify(actual)===JSON.stringify(current),previousRendererHash,checks,cases,protectedMatches};
await writeFile(qa+'independent-validation.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({manifestMatches:result.manifestMatches,previousRendererHash,cases:cases.map(({sidebar,...rest})=>rest),checks,protectedMatches},null,2));
