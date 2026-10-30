import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip} from './render-trips.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const source=trips.find(t=>t.slug==='maldivas');
const sidebar=html=>html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)[0];

test('compact promotion keeps its amount, quota and applicable date while removing redundant discount prose only from the sidebar',()=>{
 const trip={...source,departures:source.departures.map((d,i)=>({...d,promotions:i?[{label:'Early bird',price:1399,firstPlace:1,lastPlace:5,active:true}]:undefined}))};
 const before=structuredClone(trip),html=renderTrip(trip,trips),card=sidebar(html);
 assert.match(card,/1\.399 €/);assert.match(card,/1\.499 €/);
 assert.match(card,/Early bird/);assert.match(card,/Primeras 5 plazas/);
 assert(card.includes(trip.departures[1].date));
 assert.match(card,/Reserva con <strong>500 €/);
 assert.doesNotMatch(card,/de descuento|tarifa vigente para el cupo indicado/);
 assert.match(html,/100 € de descuento/);
 assert.match(card,/Solicitud sujeta a confirmación/);
 assert.deepEqual(trip,before);
});

test('only the known generic price note is condensed; custom commercial restrictions remain visible and escaped',()=>{
 const generic=sidebar(renderTrip(source,trips));
 assert.match(generic,/booking-card-price-note">por persona<\/p>/);
 const restriction='Precio en habitación compartida & suplemento <individual>.';
 for(const promotions of [undefined,[{label:'Early bird',price:1399,condition:'Plazas limitadas',active:true}]]){
  const trip={...source,priceNote:restriction,departures:source.departures.map(d=>({...d,promotions}))};
  const custom=sidebar(renderTrip(trip,trips));
  assert.match(custom,/Precio en habitación compartida &amp; suplemento &lt;individual&gt;\./);
  assert.doesNotMatch(custom,/<individual>/);
 }
});

test('the exact generated tariff summary is condensed, but any additional commercial condition remains visible',()=>{
 const base=trips.find(t=>t.slug==='el-palmar');
 const note='Early bird: 599 € (primeras 8 plazas); Segundo tramo: 649 € (plazas 9–20). Tarifa general: 699 €. Precios por persona. La consulta no confirma la reserva.';
 const trip={...base,priceNote:note,departures:base.departures.map(d=>({...d,promotions:[{label:'Early bird',price:599,firstPlace:1,lastPlace:8,active:true},{label:'Segundo tramo',price:649,firstPlace:9,lastPlace:20,active:false}]}))};
 const card=sidebar(renderTrip(trip,trips));
 assert.match(card,/booking-card-price-note">por persona<\/p>/);
 assert.match(card,/Early bird/);assert.match(card,/Primeras 8 plazas/);
 assert.doesNotMatch(card,/Segundo tramo|La consulta no confirma la reserva/);
 const extra=' Suplemento individual obligatorio de 80 €.';
 const custom=sidebar(renderTrip({...trip,priceNote:note+extra},trips));
 assert(custom.includes(extra.trim()));
 assert(custom.includes('Segundo tramo'));
});
