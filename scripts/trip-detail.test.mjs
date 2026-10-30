import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip, detailIntro, publicDetail} from './render-trips.mjs';
import {departuresFor, departureMessage} from './trip-model.mjs';
import {registrationUrl} from './brevo.mjs';
const source=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips.find(t=>t.slug==='el-palmar');
const offer=(overrides={})=>({label:'Early bird',price:599,firstPlace:1,lastPlace:8,active:true,...overrides});
const date=(overrides={})=>({...source.departures[0],id:'one',price:699,regularPrice:699,availability:'available',promotions:[offer()],...overrides});
const trip=(overrides={})=>({...source,availability:'available',departures:[date()],...overrides});
const block=(html,cls)=>{const start=html.indexOf('class="'+cls+'"');assert(start>=0);const end=html.indexOf(cls==='offer-overview-booking'?'</section>':cls==='trip-booking'?'</aside>':'<dialog',start);return html.slice(start,end);};

test('trip details show the same active price, general price, saving and cup at all booking placements',()=>{
 const t=trip(),before=structuredClone(t),html=renderTrip(t);
 for(const section of ['trip-booking','trip-dock']){
  const part=block(html,section);
  assert.match(part,/599 €/);assert.match(part,/699 €/);assert.match(part,/Early bird/);assert.match(part,/Primeras 8 plazas/);
 }
 assert.deepEqual(t,before);
});

test('date selector keeps the offer and enquiry with its own date, and never borrows a missing price',()=>{
 const t=trip({departures:[date(),date({id:'two',date:'Otra fecha',start:'2027-01-01',end:'2027-01-03',price:null,regularPrice:null,promotions:undefined})]});
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
 assert.match(html,/class="booking-essentials"/);assert.match(html,/2 salidas/);
});

test('unknown cup, fractional prices and editor labels remain exact and escaped',()=>{
 const t=trip({departures:[date({price:699.5,regularPrice:699.5,promotions:[offer({label:'Early <bird>',price:649.25,firstPlace:null,lastPlace:null,condition:'Plazas <limitadas>'})]})]});
 const html=renderTrip(t);
 assert.match(html,/649,25 €/);assert.match(html,/699,5 €/);assert.match(html,/Plazas &lt;limitadas&gt;/);assert.match(html,/Early &lt;bird&gt;/);
 assert.doesNotMatch(html,/<bird>|<limitadas>|Quedan|Primeras/);
});

test('native date enquiries remain reachable without JavaScript and keep the common range and per-date offers',()=>{
 const t=trip({departures:[date(),date({id:'rider',date:'Riders',start:'2027-01-01',end:'2027-01-03',promotions:undefined})]});
 const html=renderTrip(t),fallback=html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
 assert.match(fallback,/fechas-sin-javascript/);assert.match(html,/Todos los niveles/);assert.match(fallback,/Primeras 8 plazas/);
 assert.equal((fallback.match(/data-whatsapp=/g)??[]).length,2);
 assert(html.indexOf('<noscript>')<html.indexOf('<aside class="trip-booking"'));
});

test('the original service copy and restriction content are preserved while PDF headings are cleaned',()=>{
 assert.equal(detailIntro('Let’s Surf Together\nUN FINDE PARA SUBIR DE NIVEL\nUna semana para\ncompartir.'),'Una semana para compartir.');
 const html=renderTrip(trip());
 for(const text of source.includes)assert(html.includes(text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')));
 assert(html.includes(publicDetail(source.levelRequirement))); 
});

test('PDF cleanup preserves conditions while the requested introductory block stays removed',()=>{
 const t=trip({intro:'Viaja con nosotros.\nVUELOS NO INCLUIDOS\nConsulta las condiciones.'});
 assert.match(detailIntro(t.intro),/VUELOS NO INCLUIDOS/);assert.doesNotMatch(renderTrip(t),/programme-context|Sobre este viaje/);
});

test('no numeric price means no from prefix, while mixed durations are described per departure',()=>{
 const t=trip({departures:[date({price:null,regularPrice:null,promotions:undefined,duration:'2 noches'}),date({id:'later',date:'Otra salida',start:'2027-01-01',end:'2027-01-08',price:null,regularPrice:null,promotions:undefined,duration:'7 noches'})]});
 const html=renderTrip(t);
 assert.doesNotMatch(html,/Desde Precio|Desde Consultar/);
 assert.match(html,/Según la salida/);
 assert.doesNotMatch(html,/cover-key-facts|trip-cover-cta/);
 assert.match(html,/por persona · Según la salida/);
});

test('the reading journey preserves custom programme titles, visible services and a useful FAQ fallback',()=>{
 const t=trip({story:[['Mi sesión especial','Texto editorial de la sesión.']],faqs:[],stay:{title:'',text:'Casa para el grupo.',note:''}});
 const html=renderTrip(t);
 assert.match(html,/Mi sesión especial/);assert.match(html,/Texto editorial de la sesión\./);
 assert.match(html,/Casa para el grupo\./);assert.match(html,/Resolver las dudas del viaje/);
 assert.doesNotMatch(html,/<h2><\/h2>|undefined/);
});

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action=(html,cls)=>{const found=html.match(new RegExp('<(?:a|button)\\b[^>]*class="[^"]*\\b'+cls+'\\b[^"]*"[^>]*>[\\s\\S]*?<\\/(?:a|button)>'));assert(found,`Missing ${cls}`);return found[0];};
const primaryActions=['trip-header-cta','booking-card-cta','dock-cta','reserve-main'];

test('the sidebar keeps the range concise and the level section retains requirements, guide and contextual help',()=>{
 const requirement='Autonomía obligatoria: remontar solo, coger olas propias y recorrer la pared.';
 const t=trip({levels:[2,3],levelRequirement:requirement,levelText:requirement}),html=renderTrip(t);
 const sidebar=html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];
 const level=html.match(/<section id="nivel"[\s\S]*?<\/section>/)[0];
 assert.match(sidebar,/Niveles II–III/);assert(!sidebar.includes(requirement));
 assert(level.includes(requirement));
 const actions=level.match(/<div class="level-actions">([\s\S]*?)<\/div>/)?.[1];
 assert(actions,'The level guide remains available');
 assert.match(actions,/href="\/niveles\/"/);assert.match(actions,/Ver la guía de niveles/);
 assert.match(actions,/data-whatsapp=/);assert.match(actions,/¿Dudas con tu nivel\?/);
 assert.equal((actions.match(/<a\b/g)??[]).length,2);
});

test('multiple dates expose their own PDF next to each date with and without JavaScript, without duplicating them in the sidebar',()=>{
 const dates=[date({id:'first',date:'Primera fecha',dossier:'https://example.com/first.pdf'}),date({id:'second',date:'Segunda fecha',dossier:'https://example.com/second.pdf',start:'2027-01-01'})];
 const html=renderTrip(trip({dossier:'https://example.com/general.pdf',departures:dates}));
 const options=[...html.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 const native=html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0];
 assert(native,'Dates and PDFs need a native fallback');
 const nativeOptions=[...native.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 assert.equal(options.length,2);assert.equal(nativeOptions.length,2);
 for(const group of [options,nativeOptions])for(let i=0;i<dates.length;i++){
  assert(group[i].includes(dates[i].date));assert(group[i].includes(dates[i].dossier));
  assert(!group[i].includes(dates[1-i].dossier));
 }
 const outsideDates=html.replace(/<dialog\b[\s\S]*?<\/dialog>/g,'').replace(/<noscript>[\s\S]*?<\/noscript>/g,'');
 assert.doesNotMatch(outsideDates,/first\.pdf|second\.pdf|general\.pdf|mobile-booking-options/);
 for(const cls of primaryActions){const cta=action(html,cls);assert.match(cta,/data-open-dates/);assert.match(cta,/>Elegir fecha<\/button>/);}
});

test('single-date PDF fallback stays available and registration is the primary action at every booking placement',()=>{
 const t=trip({dossier:'https://example.com/common.pdf',departures:[date({dossier:''})]}),html=renderTrip(t);
 assert(registrationUrl(t),'Fixture must have a supported registration date');
 for(const cls of primaryActions){
  const cta=action(html,cls);assert.match(cta,/data-registration=/);
  assert(cta.includes(`href="${registrationUrl(t)}"`));assert.match(cta,/Solicitar plaza/);
 }
 assert.match(html,/https:\/\/example\.com\/common\.pdf/);
 assert.doesNotMatch(html,/Empieza con un WhatsApp|TU PLAZA, PASO A PASO|El mensaje inicia una consulta/);
});

test('date-specific registration links preserve the departure parameter and closed dates keep enquiries only',()=>{
 const first=date({id:'available',brevoValue:'21'}),closed=date({id:'closed',start:'2027-01-01',date:'Salida completa',availability:'full',brevoValue:'22'});
 const t=trip({departures:[first,closed]}),html=renderTrip(t);
 const options=[...html.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 const native=html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
 assert(options[0].includes(escape(registrationUrl(t,first))));assert.match(options[0],/data-registration=/);
 assert.doesNotMatch(options[1],/data-registration=/);assert.match(options[1],/Consultar alternativas/);
 assert(native.includes(escape(registrationUrl(t,first))));assert(!native.includes('?salida=closed'));
 assert.match(options[1],/data-whatsapp=/);
});

test('full, pending and unmapped trips keep consultation without promising an unavailable registration form',()=>{
 const cases=[trip({availability:'full'}),trip({state:'upcoming',departures:[]}),trip({departures:[date({start:'2028-01-01',end:'2028-01-08',brevoValue:undefined})]})];
 for(const t of cases){
  const html=renderTrip(t),reserve=html.match(/<section id="reservar"[\s\S]*?<\/section>/)[0];
  assert.equal(registrationUrl(t),'');assert.doesNotMatch(html,/data-registration=/);
  for(const cls of primaryActions)assert.match(action(html,cls),/data-whatsapp=/);
  assert.doesNotMatch(reserve,/Completa el formulario|Rellena el formulario|Empieza con un WhatsApp|TU PLAZA, PASO A PASO/);
 }
});

test('accommodation without photos is compact and preserves useful facts while photographed accommodation remains visual',()=>{
 const stay={title:'Casa del grupo',name:'Casa Norte',text:'Habitaciones dobles y triples. Cocina compartida.',note:'Consulta las necesidades de accesibilidad.',image:'',alt:''};
 const compact=renderTrip(trip({stay})).match(/<section\b[^>]*class="[^"]*\bstay-block\b[^>]*>[\s\S]*?<\/section>/)?.[0];
 assert(compact,'Accommodation section must remain present');assert.match(compact,/\bstay-compact\b/);
 assert(compact.includes(stay.text));assert(compact.includes(stay.note));
 assert.doesNotMatch(compact,/<figure|<img|<p[^>]*>\s*<\/p>|undefined/);
 const visualStay={...stay,image:'https://example.com/stay.jpg',alt:'Terraza de la casa'};
 const visual=renderTrip(trip({stay:visualStay})).match(/<section\b[^>]*class="[^"]*\bstay-block\b[^>]*>[\s\S]*?<\/section>/)?.[0];
 assert(visual);assert.doesNotMatch(visual,/\bstay-compact\b/);assert.match(visual,/<figure/);
 assert(visual.includes(visualStay.image));assert(visual.includes(visualStay.alt));
 const sparse=renderTrip(trip({stay:{title:'',name:'',text:'Casa para el grupo.',note:'',image:'',alt:''}})).match(/<section\b[^>]*class="[^"]*\bstay-block\b[^>]*>[\s\S]*?<\/section>/)[0];
 assert.doesNotMatch(sparse,/<p[^>]*>\s*<\/p>|<h2>\s*<\/h2>|undefined/);
});

test('inclusions use explicit labels and preserve all included services, exclusions and conditions',()=>{
 const t=trip({includes:['Clases de surf con material','4 noches con desayuno'],excludes:['Vuelos','Alquiler de tabla avanzada'],inclusionsNote:'Traslados sujetos al horario del grupo.'});
 const section=renderTrip(t).match(/<section id="incluye"[\s\S]*?<\/section>/)[0];
 assert.match(section,/>[^<]*Incluido[^<]*<\/h[23]>/);assert.match(section,/>[^<]*No incluido[^<]*<\/h[23]>/);
 for(const value of [...t.includes,...t.excludes,t.inclusionsNote])assert(section.includes(escape(value)));
 assert.doesNotMatch(section,/Lo que entra|Dentro del precio|Por tu cuenta/);
});
test('a full multi-date trip still exposes all dates and their PDFs, with alternatives instead of registration',()=>{
 const dates=[date({id:'first',date:'Primera fecha',availability:'full',dossier:'https://example.com/full-first.pdf'}),date({id:'second',date:'Segunda fecha',start:'2027-01-01',availability:'full',dossier:''})];
 const t=trip({availability:'full',dossier:'https://example.com/full-general.pdf',departures:dates}),html=renderTrip(t);
 const dialog=html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)?.[0];
 const native=html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0];
 assert(dialog,'Full dates must retain the date/PDF selector');assert(native,'Full dates need the native date/PDF fallback');
 for(const content of [dialog,native]){
  assert(content.includes(dates[0].date));assert(content.includes(dates[1].date));
  assert.match(content,/https:\/\/example\.com\/full-first\.pdf/);assert.match(content,/https:\/\/example\.com\/full-general\.pdf/);
  assert.doesNotMatch(content,/data-registration=|Inscribirme/);assert.match(content,/Consultar alternativas/);
 }
 for(const cls of primaryActions){const cta=action(html,cls);assert.match(cta,/data-open-dates/);assert.match(cta,/>Elegir fecha<\/button>/);}
});
test('distinct level introduction and autonomy requirement both remain visible, without duplicating identical copy',()=>{
 const intro='Progresamos en un grupo con una experiencia de surf parecida.';
 const requirement='Es obligatorio remontar solo y coger olas propias en el pico.';
 const level=(levelText,levelRequirement)=>renderTrip(trip({levels:[2,3],levelText,levelRequirement,levelChecks:[]})).match(/<section id="nivel"[\s\S]*?<\/section>/)[0];
 const distinct=level(intro,requirement);
 assert(distinct.includes(intro));assert(distinct.includes(requirement));
 assert.equal(distinct.split(intro).length-1,1);assert.equal(distinct.split(requirement).length-1,1);
 for(const [text,rule] of [[requirement,requirement],['',requirement],[intro,'']]){
  const section=level(text,rule),expected=text||rule;
  assert.equal(section.split(expected).length-1,1,'A requirement used as the intro must not be repeated');
  assert.doesNotMatch(section,/<p[^>]*>\s*<\/p>|undefined/);
 }
});

test('trip navigation exposes the same pages as the rest of the site and loads both shared navigation and trip interactions',()=>{
 const html=renderTrip(trip()),header=html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
 assert(header,'A shared header must be present');
 const classes=header.match(/<header\b[^>]*class="([^"]+)"/)?.[1].split(/\s+/)??[];
 assert(classes.includes('site-header'));assert(classes.includes('trip-header'));
 assert.match(header,/<button\b[^>]*class="menu-toggle"[^>]*aria-controls="main-nav"[^>]*aria-expanded="false"/);
 const nav=header.match(/<nav\b[^>]*id="main-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
 assert(nav,'The menu must use the shared navigation target');
 for(const href of ['/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/'])assert(nav.includes('href="'+href+'"'));
 assert.match(nav,/data-whatsapp=/);
 for(const script of ['/app.js','/trip.js'])assert(html.includes('src="'+script+'"'));
 const native=[...html.matchAll(/<noscript>[\s\S]*?<\/noscript>/g)].map(m=>m[0]).find(part=>part.includes('/conocenos/'));
 assert(native,'All main pages remain reachable without JavaScript');
 for(const href of ['/viajes/','/niveles/','/conocenos/','/preguntas-frecuentes/'])assert(native.includes('href="'+href+'"'));
});

test('sales FAQs preserve editorial conditions while replacing stale imported flight-price claims',()=>{
 const condition=['¿Qué pasa si cambian las condiciones?','Puedes elegir entre reembolso o bono si cancelamos por las condiciones del mar.'];
 const insurance=['¿El seguro de viaje es obligatorio?','Sí, debes contratar un seguro de viaje antes de participar.'];
 const staleFlight=['¿Están incluidos los vuelos?','No. Ahora mismo hay vuelos por 1.000 – 1.300 € y suben con el tiempo.'];
 const t=trip({faqs:[condition,insurance,staleFlight],excludes:['Vuelos','Seguro de viaje']});
 const section=renderTrip(t).match(/<section id="dudas"[\s\S]*?<\/section>/)[0];
 for(const value of [...condition,...insurance])assert(section.includes(escape(value)));
 assert(section.includes(escape(staleFlight[0])));assert(!section.includes(escape(staleFlight[1])));
 assert.equal(section.split(escape(staleFlight[0])).length-1,1);
 const pending=renderTrip({...t,state:'upcoming',departures:[]}).match(/<section id="dudas"[\s\S]*?<\/section>/)[0];
 for(const value of [...condition,...insurance])assert(pending.includes(escape(value)));
});


test('PDF page references are removed while customer-facing restrictions and meaningful parentheses remain',()=>{
 assert.equal(publicDetail('Tabla propia o alquiler en destino (p. 5; no consta incluido)'), 'Tabla propia o alquiler en destino');
 assert.equal(publicDetail('Todos los niveles (p. 5).'), 'Todos los niveles.');
 for(const copy of ['Autonomía obligatoria (sin ayuda).','Neopreno (alquiler aparte)','Snorkel (opcional)','El orden cambia (según el mar).'])assert.equal(publicDetail(copy),copy);
 const t=trip({levelText:'Autonomía obligatoria (sin ayuda).',levelRequirement:'Autonomía obligatoria (sin ayuda).',includes:['Material (solo durante las clases) (p. 5)'],excludes:['Neopreno (alquiler aparte) (p. 8)']});
 const html=renderTrip(t);
 for(const copy of ['Autonomía obligatoria (sin ayuda).','Material (solo durante las clases)','Neopreno (alquiler aparte)'])assert(html.includes(escape(copy)));
 assert.doesNotMatch(html,/\(p\. (?:5|8)\)/);
});
