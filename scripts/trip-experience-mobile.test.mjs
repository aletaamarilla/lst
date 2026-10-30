import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTrip,publicDetail} from './render-trips.mjs';
import {tripMessage} from './trip-model.mjs';

const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const morocco=trips.find(t=>t.slug==='marruecos');
const maldives=trips.find(t=>t.slug==='maldivas');
const escape=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dock=html=>html.match(/<div class="trip-dock"[\s\S]*?<dialog/)[0];

test('the dock keeps a separate contextual WhatsApp action for open, multiple-date, full and pending trips',()=>{
 for(const trip of [morocco,maldives,{...morocco,availability:'full'},{...morocco,state:'upcoming',departures:[]}]){
  const before=structuredClone(trip),part=dock(renderTrip(trip,trips));
  const links=[...part.matchAll(/<a class="button dock-whatsapp"([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length,1);
  const [,attrs,body]=links[0],href=attrs.match(/href="([^"]+)"/)[1],enquiry=new URL(href);
  assert.equal(enquiry.origin,'https://wa.me');assert.equal(enquiry.pathname,'/34648189257');
  assert.equal(enquiry.searchParams.get('text'),tripMessage(trip));
  assert(attrs.includes(`aria-label="Hablar por WhatsApp · ${escape(trip.name)}, por WhatsApp"`));
  assert(body.includes('class="whatsapp-icon"'));assert.deepEqual(trip,before);
  if(trip===morocco)assert(part.includes('data-registration='));
  if(trip===maldives)assert(part.includes('data-open-dates'));
  if(trip.availability==='full'||trip.state==='upcoming')assert(!part.includes('data-registration='));
 }
});

test('the surf programme goes directly to practical content without repeating gallery images',()=>{
 const before=structuredClone(morocco),html=renderTrip(morocco,trips);
 const plan=html.slice(html.indexOf('id="plan"'),html.indexOf('id="spots"')),copy=plan.replace(/<[^>]*>/g,'');
 assert(plan.includes('Plan de surf.'));assert(!plan.includes('<img'));assert(!plan.includes('data-photo='));
 assert(plan.includes('El orden y los horarios se adaptan al mar y al grupo.'));
 for(const [title,text] of morocco.surfPlan){assert(copy.includes(escape(title)));assert(copy.includes(escape(publicDetail(text))));}
 const services=plan.match(/<div class="surf-plan-grid">([\s\S]*)$/)[1];
 assert.equal((services.match(/aria-hidden="true" focusable="false"/g)||[]).length,morocco.surfPlan.length);
 assert(!services.includes('class="plan-number"'));assert(plan.includes('<strong>Material de iniciación incluido</strong>'));
 assert(plan.includes('alquiler aparte.'));assert(!plan.includes('class="surf-plan-photo"'));
 assert(html.includes('Surfista sobre una ola al atardecer en Marruecos, 2025.'));
 const noPhoto=renderTrip({...morocco,hero:'',gallery:[]},trips);
 assert(!noPhoto.includes('class="programme-photo"'));assert(noPhoto.replace(/<[^>]*>/g,'').includes(escape(morocco.surfPlan[0][1])));
 assert.deepEqual(morocco,before);
});

test('related trips preserve custom dates, multiple-date and pending states without linking back to the current trip',()=>{
 const first={...trips.find(t=>t.slug==='el-palmar'),departures:[{...morocco.departures[0],date:'Una fecha editorial & propia'}]};
 const next={...trips.find(t=>t.slug==='senegal'),state:'upcoming',departures:[]};
 const html=renderTrip(morocco,[morocco,first,maldives,next]);
 const related=html.match(/<section class="related-section">[\s\S]*?<\/section>/)[0];
 assert.equal((related.match(/class="related-trip"/g)||[]).length,3);
 for(const trip of [first,maldives,next])assert(related.includes(`href="/viajes/${trip.slug}/"`));
 assert(!related.includes('href="/viajes/marruecos/"'));
 assert(related.includes('Una fecha editorial &amp; propia'));assert(related.includes('Varias salidas'));assert(related.includes('Próximamente'));
 assert(!related.includes('undefined'));assert(!related.includes('2027-'));
});
