import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip,tripDeposit} from './render-trips.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const source=trips.find(t=>t.slug==='marruecos');
const date=(id,amount,extra={})=>({...source.departures[0],id,payment:{depositAmount:amount,terms:'Condiciones de '+id},...extra});
const sidebar=trip=>renderTrip(trip,trips).match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];

test('the minimal booking card separates total price from the confirmed deposit and removes the section explorer',()=>{
 const trip={...source,departures:[date('one',270)],payment:{depositAmount:999,terms:'Condición general'}};
 const html=sidebar(trip);
 assert.match(html,/booking-card-price/);assert.match(html,/899 €/);
 assert.match(html,/Reserva con <strong>270 €<\/strong>/);
 assert.doesNotMatch(html,/999 €|Explora el viaje|booking-page-nav|En este viaje/);
 assert(html.indexOf('booking-card-price')<html.indexOf('booking-deposit'));
 assert(html.indexOf('booking-deposit')<html.indexOf('booking-card-cta'));
 assert.match(html,/Solicitud sujeta a confirmación/);
});

test('a common deposit is never inferred from a cheaper, full or unknown departure',()=>{
 const one=date('one',270),two=date('two',500,{date:'Otra fecha',start:'2027-02-01',end:'2027-02-08'});
 assert.deepEqual(tripDeposit({...source,departures:[one,two]}),{amount:null,multiple:true});
 assert.deepEqual(tripDeposit({...source,departures:[{...one,availability:'full'},two]}),{amount:500,multiple:false});
 for(const payment of [{},null]){
  const trip={...source,departures:[one,{...two,payment}]};
  assert.deepEqual(tripDeposit(trip),{amount:null,multiple:true});
  assert.match(sidebar(trip),/Señal según la fecha/);assert.doesNotMatch(sidebar(trip),/Reserva con/);
 }
 const legacy={...source,departures:[{...one,payment:undefined}],payment:{depositAmount:320}};
 assert.deepEqual(tripDeposit(legacy),{amount:320,multiple:false});
 assert.deepEqual(tripDeposit({...source,departures:[date('zero',0)]}),{amount:0,multiple:false});
 for(const trip of [{...source,state:'upcoming'},{...source,availability:'full'},{...source,departures:[{...one,availability:'full'}]}]){
  assert.equal(tripDeposit(trip),null);assert.doesNotMatch(sidebar(trip),/Reserva con/);
 }
});

test('each date shows its own deposit before the optional terms, also without JavaScript',()=>{
 const trip={...source,departures:[date('one',270),date('two',500,{date:'Otra fecha',start:'2027-02-01'})]};
 const html=renderTrip(trip,trips);
 for(const fragment of [html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)[0],html.match(/<noscript>[\s\S]*?<\/noscript>/)[0]]){
  const options=[...fragment.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  assert.equal(options.length,2);
  for(let i=0;i<2;i++){
   assert.match(options[i],new RegExp('(?:Reserva con|Señal al confirmar:) <strong>'+[270,500][i]+' €</strong>'));
   const deposit=options[i].search(/class="departure-(?:summary-)?deposit"/);
   assert(deposit>=0&&deposit<options[i].indexOf('<details'));
   assert(options[i].includes('Condiciones de '+['one','two'][i]));
   assert(!options[i].includes('<strong>'+[500,270][i]+' €</strong>'));
  }
 }
 const closed=renderTrip({...trip,availability:'full'},trips);
 assert.doesNotMatch(closed,/Reserva con/);assert.match(closed,/Señal prevista:/);
});

test('accompaniment uses a documented group photograph without an artificial host portrait',()=>{
 const html=renderTrip(source,trips);
 assert.doesNotMatch(html,/trip-team-portrait|lucas-concept-ai|Retrato provisional/);
 const moment=source.gallery.find(([,alt])=>/grupo|comunidad/i.test(alt));
 assert(moment);assert(html.includes(moment[0]));assert(html.includes(moment[2]));
 for(const trip of [{...source,state:'upcoming'},{...source,team:{title:'Tu equipo',text:'Marta acompaña al grupo.'}},{...source,team:{title:'Marta va contigo.',text:'Marta te acompaña. Lucas no viajará con este grupo.'}}]){
  const section=renderTrip(trip,trips).match(/<section class="trip-block trip-team">([\s\S]*?)<\/section>/)[1];
  assert.doesNotMatch(section,/trip-team-portrait|lucas-concept-ai/);
  if(trip.state==='upcoming')assert.doesNotMatch(section,/trip-team-moment/);
 }
});

test('unconfirmed dates retain neutral payment information without an invitation to reserve',()=>{
 const confirmed=date('one',270);
 const pending=date('two',500,{date:'Por confirmar',start:'2027-02-01',state:'upcoming'});
 for(const trip of [{...source,state:'upcoming',departures:[confirmed,pending]},{...source,departures:[confirmed,pending]}]){
  const html=renderTrip(trip,trips),dialog=html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)[0];
  const options=[...dialog.matchAll(/<article class="departure-option">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  assert.doesNotMatch(options[1],/Reserva con/);assert.match(options[1],/Señal prevista: <strong>500 €/);
  if(trip.state==='upcoming')assert.doesNotMatch(dialog,/Reserva con/);
  const native=html.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
  assert.doesNotMatch(native,/Reserva con <strong>500 €/);assert.match(native,/Señal prevista: <strong>500 €/);
 }
});

test('legacy global payment fallback is identical in the card, date selector and native date list',()=>{
 const trip={...source,payment:{depositAmount:320,terms:'El resto se confirma con el equipo.'},departures:[date('one',undefined,{payment:undefined}),date('two',undefined,{payment:undefined,date:'Otra fecha',start:'2027-02-01'})]};
 const html=renderTrip(trip,trips);
 assert.match(sidebar(trip),/Reserva con <strong>320 €/);
 for(const fragment of [html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)[0],html.match(/<noscript>[\s\S]*?<\/noscript>/)[0]]){
  assert.equal((fragment.match(/(?:Reserva con|Señal al confirmar:) <strong>320 €/g)||[]).length,2);
  assert.equal((fragment.match(/El resto se confirma con el equipo\./g)||[]).length,2);
 }
});
