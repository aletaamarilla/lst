import {readFile,writeFile} from 'node:fs/promises';
import {renderTrip,tripDeposit} from '../../../scripts/render-trips.mjs';
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const source=trips.find(t=>t.slug==='marruecos');
const date=(id,extra={})=>({...source.departures[0],id,payment:{depositAmount:270,terms:'Señal y saldo de '+id},...extra});
const extract=html=>({dialog:html.match(/<dialog class="departure-dialog"[\s\S]*?<\/dialog>/)?.[0],native:html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0],sidebar:html.match(/<aside class="trip-booking"[\s\S]*?<\/aside>/)?.[0],team:html.match(/<section class="trip-block trip-team">([\s\S]*?)<\/section>/)?.[1]});
const pendingTrip={...source,state:'upcoming',departures:[date('one'),date('two',{date:'Otra fecha',start:'2027-02-01'})]};
const pendingDate={...source,departures:[date('one'),date('pending',{state:'upcoming',date:'Fecha pendiente',start:'2027-02-01'})]};
const legacy={...source,payment:{depositAmount:320,terms:'Condiciones generales confirmadas.'},departures:[date('one',{payment:undefined}),date('two',{payment:undefined,date:'Otra fecha',start:'2027-02-01'})]};
const otherTeam={...source,team:{title:'Marta va contigo.',text:'Marta te acompaña durante el viaje. Lucas no viajará con este grupo.'}};
const result={};
for(const [name,trip] of Object.entries({pendingTrip,pendingDate,legacy,otherTeam})){
 const blocks=extract(renderTrip(trip,trips));
 result[name]={summary:tripDeposit(trip),...blocks};
}
await writeFile('docs/qa/2026-10-28-trip-depth/independent-cases.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({pendingTrip:{summary:result.pendingTrip.summary,dialogAdvertisesReservation:/Reserva con/.test(result.pendingTrip.dialog),nativeAdvertisesReservation:/Reserva con/.test(result.pendingTrip.native),hasRegistration:/data-registration=/.test(result.pendingTrip.dialog)},pendingDate:result.pendingDate.dialog?.match(/<article class="departure-option">[\s\S]*?<\/article>/g)?.map(x=>({pending:x.includes('Fecha pendiente'),reserves:/Reserva con/.test(x),registration:/data-registration=/.test(x)})),legacy:{summary:result.legacy.summary,dialogShowsFallback:/320 €/.test(result.legacy.dialog),nativeShowsFallback:/320 €/.test(result.legacy.native)},otherTeam:{portraitShown:/trip-team-portrait/.test(result.otherTeam.team),title:otherTeam.team.title,text:otherTeam.team.text}},null,2));
