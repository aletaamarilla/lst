import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip} from './render-trips.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const source=trips.find(t=>t.slug==='maldivas');
const sidebar=html=>html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];

test('the sidebar names the early bird deadline and the date that carries it',()=>{
 const live={price:1399,regularPrice:1499,earlyBird:{price:1399,until:'2026-12-20',saving:100}};
 const trip={...source,departures:source.departures.map((d,i)=>({...d,price:1499,regularPrice:1499,earlyBird:null,...(i?live:{})}))};
 const before=structuredClone(trip),html=renderTrip(trip,trips),card=sidebar(html);
 assert.match(card,/1\.399 €/);assert.match(card,/1\.499 €/);
 assert.match(card,/Early bird hasta el 20 de diciembre\.<\/strong> Ahorras 100 € en la salida del /);
 assert(card.includes(trip.departures[1].date));
 assert.match(card,/Reserva con <strong>500 €/);
 assert.doesNotMatch(card,/de descuento|Primeras/);
 assert.match(card,/Solicitud sujeta a confirmación/);
 assert.deepEqual(trip,before);
});

test('without a price note the sidebar says per person; a custom note stays visible and escaped',()=>{
 const generic=sidebar(renderTrip({...source,priceNote:''},trips));
 assert.match(generic,/booking-card-price-note">por persona<\/p>/);
 const restriction='Precio en habitación compartida & suplemento <individual>.';
 for(const earlyBird of [null,{price:1399,until:'2026-12-20',saving:100}]){
  const trip={...source,priceNote:restriction,departures:source.departures.map(d=>({...d,price:earlyBird?1399:1499,regularPrice:1499,earlyBird}))};
  const custom=sidebar(renderTrip(trip,trips));
  assert.match(custom,/Precio en habitación compartida &amp; suplemento &lt;individual&gt;\./);
  assert.doesNotMatch(custom,/<individual>/);
 }
});
