import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip, detailIntro} from './render-trips.mjs';
import {departuresFor, departureMessage} from './trip-model.mjs';
const source=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips.find(t=>t.slug==='el-palmar');
const offer=(overrides={})=>({label:'Early bird',price:599,firstPlace:1,lastPlace:8,active:true,...overrides});
const date=(overrides={})=>({...source.departures[0],id:'one',price:699,regularPrice:699,availability:'available',promotions:[offer()],...overrides});
const trip=(overrides={})=>({...source,availability:'available',departures:[date()],...overrides});
const block=(html,cls)=>{const start=html.indexOf('class="'+cls+'"');assert(start>=0);const end=html.indexOf(cls==='trip-price-summary'?'</section>':cls==='trip-booking'?'</aside>':'<dialog',start);return html.slice(start,end);};

test('trip details show the same active price, general price, saving and cup at all booking placements',()=>{
 const t=trip(),before=structuredClone(t),html=renderTrip(t);
 for(const section of ['trip-price-summary','trip-booking','trip-dock']){
  const part=block(html,section);
  assert.match(part,/599 €/);assert.match(part,/699 €/);assert.match(part,/Early bird/);assert.match(part,/Primeras 8 plazas/);
 }
 assert.match(html,/100 € de descuento/);
 assert.deepEqual(t,before);
 const links=[...html.matchAll(/data-whatsapp="[^"]+" href="([^"]+)"/g)];
 assert(links.some(m=>new URL(m[1]).searchParams.get('text')===departureMessage(t,departuresFor(t)[0])));
});

test('date selector keeps the offer and enquiry with its own date, and never borrows a missing price',()=>{
 const t=trip({departures:[date(),date({id:'two',date:'Otra fecha',price:null,regularPrice:null,promotions:undefined})]});
 const html=renderTrip(t),options=[...html.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 assert.equal(options.length,2);assert.match(options[0],/599 €|100 € de descuento/);assert.match(options[0],/699 €/);
 assert.match(options[1],/Consultar precio/);assert.doesNotMatch(options[1],/599 €|699 €|Early bird/);
 const d=departuresFor(t);
 for(let i=0;i<2;i++){
  const href=options[i].match(/data-whatsapp="[^"]+" href="([^"]+)"/)[1];
  assert.equal(new URL(href).searchParams.get('text'),departureMessage(t,d[i]));
 }
});

test('full, inactive and pending tariffs never advertise a discount',()=>{
 for(const t of [trip({availability:'full'}),trip({departures:[date({availability:'full'})]}),trip({departures:[date({promotions:[offer({active:false})]})]}),trip({state:'upcoming',departures:[]})]){
  const html=renderTrip(t);assert.doesNotMatch(html,/Early bird|de descuento|<del>/);
 }
});

test('the price for a later promoted date names that date without changing the earliest trip facts',()=>{
 const t=trip({departures:[date({promotions:undefined,price:699}),date({id:'later',date:'La fecha posterior',start:'2027-02-01',price:699})]});
 const html=renderTrip(t);
 assert.match(html,/Tarifa para el La fecha posterior/);assert.match(html,/Desde 599 €/);
 assert.match(html,/class="trip-facts"/);assert.match(html,/Varias salidas/);
});

test('unknown cup, fractional savings and editor labels remain exact and escaped',()=>{
 const t=trip({departures:[date({price:699.5,regularPrice:699.5,promotions:[offer({label:'Early <bird>',price:649.25,firstPlace:null,lastPlace:null,condition:'Plazas <limitadas>'})]})]});
 const html=renderTrip(t);
 assert.match(html,/50,25 € de descuento/);assert.match(html,/Plazas &lt;limitadas&gt;/);assert.match(html,/Early &lt;bird&gt;/);
 assert.doesNotMatch(html,/<bird>|<limitadas>|Quedan|Primeras/);
});

test('native date enquiries remain reachable without JavaScript and keep per-date level and conditions',()=>{
 const t=trip({departures:[date(),date({id:'rider',date:'Riders',levels:[3],promotions:undefined})]});
 const html=renderTrip(t),fallback=html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
 assert.match(fallback,/fechas-sin-javascript/);assert.match(fallback,/Nivel III/);assert.match(fallback,/Primeras 8 plazas/);
 assert.equal((fallback.match(/data-whatsapp=/g)??[]).length,2);
 assert(html.indexOf('<noscript>')<html.indexOf('<aside class="trip-booking"'));
});

test('the original service copy and restriction content are preserved while PDF headings are cleaned',()=>{
 assert.equal(detailIntro('Let’s Surf Together\nUN FINDE PARA SUBIR DE NIVEL\nUna semana para\ncompartir.'),'Una semana para compartir.');
 const html=renderTrip(trip());
 for(const text of source.includes)assert(html.includes(text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')));
 assert(html.includes(source.levelRequirement));
});

test('uppercase editorial conditions survive PDF typography cleanup',()=>{
 const t=trip({intro:'Viaja con nosotros.\nVUELOS NO INCLUIDOS\nConsulta las condiciones.'});
 assert.match(detailIntro(t.intro),/VUELOS NO INCLUIDOS/);assert.match(renderTrip(t),/VUELOS NO INCLUIDOS/);
});

test('no numeric price means no from prefix, while mixed durations are described per departure',()=>{
 const t=trip({departures:[date({price:null,regularPrice:null,promotions:undefined,duration:'2 noches'}),date({id:'later',date:'Otra salida',price:null,regularPrice:null,promotions:undefined,duration:'7 noches'})]});
 const html=renderTrip(t);
 assert.doesNotMatch(html,/Desde Precio|Desde Consultar/);
 assert.match(html,/<div class="cover-key-facts"><span>Varias salidas<\/span><span>Según la salida<\/span>/);
 assert.match(html,/por persona · Según la salida/);
});

test('the reading journey preserves custom programme titles, visible services and a useful FAQ fallback',()=>{
 const t=trip({story:[['Mi sesión especial','Texto editorial de la sesión.']],faqs:[],stay:{title:'',text:'Casa para el grupo.',note:''}});
 const html=renderTrip(t);
 assert.match(html,/Mi sesión especial/);assert.match(html,/Texto editorial de la sesión\./);
 assert.match(html,/Aquí recargamos\./);assert.match(html,/Resolver las dudas del viaje/);
 assert.doesNotMatch(html,/<h2><\/h2>|undefined/);
});
