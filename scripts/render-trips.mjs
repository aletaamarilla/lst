import {levelLabel, departuresFor, departureMessage, tripMessage, tripFacts, tripPrice, tripPriceDetails, formatPrice, isFull, availabilityLabel} from './trip-model.mjs';
import {registrationUrl} from './brevo.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {groupedInclusions} from './trip-experience.mjs';
import {salesPitch, practicalDetails, salesFaqs} from './trip-sales-content.mjs';
import {compactDepartureDate, levelProfileTitle, surfRhythm} from './trip-decision.mjs';

// Reuse literal services from this programme; do not infer names or transfer staff between trips.
export function accompanimentItems(trip) {
  if (trip.state !== 'confirmed' || trip.team) return [];
  const terms = /\b(?:coach(?:ing)?|instructor(?:a|es|as)?|monitor(?:a|es|as)?|gu[ií]as?|acompañamiento|clases de surf|surf guiding)\b/i;
  return [...new Set((trip.includes ?? []).filter(item => typeof item === 'string' && terms.test(item)))];
}
const origin='https://lst-sepia.vercel.app';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Hide source-page annotations while preserving all service and restriction wording.
export const publicDetail=value=>String(value??'').replace(/\s*\(p\.\s*\d+[^)]*\)/gi,'').trim();
const url=trip=>`/viajes/${trip.slug}/`;
const wa=(trip,message=tripMessage(trip))=>`https://wa.me/34648189257?text=${encodeURIComponent(message)}`;
const arrow=(direction='external')=>`<svg class="action-arrow" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${direction==='left'?'M20 12H4m6-6-6 6 6 6':direction==='down'?'M12 4v16m-6-6 6 6 6-6':direction==='right'?'M4 12h16m-6-6 6 6-6 6':'M6 18 18 6M6 6h12v12'}"/></svg>`;
const whatsappIcon = '<svg class="whatsapp-icon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.2 7.4c-.5.1-1 1.2-.6 2.4.7 2.4 3.2 4.9 5.8 5.5 1.2.3 2.1-.5 2.3-1.1.1-.3-1.8-1.3-2-1.1l-.9.8c-1.5-.5-2.9-1.8-3.5-3.2l.6-1c.2-.3-1.1-2.4-1.7-2.3Z"/></svg>';
const withWhatsApp = html => html.replace(/<a\b([^>]*\bdata-whatsapp=[^>]*)>([\s\S]*?)<\/a>/g, (_, attrs, label) => `<a${attrs}>${whatsappIcon}<span>${label}</span></a>`);
const railControls = label => `<div class="rail-controls"><button type="button" data-carousel-prev aria-label="${escape(label)}: anterior">${arrow('left')}</button><button type="button" data-carousel-next aria-label="${escape(label)}: siguiente">${arrow('right')}</button></div>`;
const visualRail = (items, id, title, label, note = '') => items?.length ? `<section id="${id}" class="trip-block visual-section"><div class="section-heading"><div><p class="eyebrow">${escape(label)}</p><h2>${title}</h2></div></div><div class="visual-track">${items.map((item,i) => `<article class="visual-card">${item.image ? `<img src="${escape(photoSource(item.image,900))}" alt="${escape(item.alt)}" loading="lazy" decoding="async" width="800" height="1000">` : ''}<div class="visual-card-copy"><div class="visual-card-heading"><span class="visual-card-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${escape(item.title)}</h3></div><p>${escape(publicDetail(item.text))}</p></div></article>`).join('')}</div>${note ? `<p class="fine-print rail-note">${escape(note)}</p>` : ''}</section>` : '';
const photoSource = (source, width = 1600) => source.startsWith('https://cdn.sanity.io/images/') ? `${source}${source.includes('?')?'&':'?'}w=${width}&fit=max&auto=format` : source;
function photoDimensions(source='') {
 const dimensions=String(source).match(/-(\d+)x(\d+)\.[a-z0-9]+(?:\?|$)/i);
 return dimensions&&dimensions.slice(1).every(value=>Number.isSafeInteger(Number(value))&&Number(value)>0)?dimensions.slice(1).map(Number):null;
}
export function coverRatio(source='') {
 const dimensions=photoDimensions(source);
 return dimensions?`${dimensions[0]} / ${dimensions[1]}`:'3 / 2';
}
// Only the cover requests responsive variants; keep every original asset and caption.
export function coverPhotoSources(source) {
 const dimensions=photoDimensions(source),[width,height]=dimensions??[1500,1000];
 const photo={src:source,width,height,ratio:coverRatio(source)};
 if(!source.startsWith('https://cdn.sanity.io/images/'))return photo;
 const ceiling=Math.min(dimensions?.[0]??3840,3840);
 const widths=[...new Set([...([640,960,1280,1600,1920,2560,3200].filter(value=>value<ceiling)),ceiling])];
 const variant=value=>{
  const url=new URL(source);
  const quality=Number(url.searchParams.get('q'));
  url.searchParams.set('w',String(value));url.searchParams.set('fit','max');
  url.searchParams.set('auto','format');url.searchParams.set('q',String(Number.isFinite(quality)&&quality>85?Math.min(100,quality):85));
  return url.href;
 };
 return {...photo,src:variant(Math.min(1920,ceiling)),srcset:widths.map(value=>`${variant(value)} ${value}w`).join(', '),sizes:`(max-width: 599px) 100vw, min(100vw, ${Math.min(width,Math.ceil(640*width/height))}px)`};
}
const contact=(trip,label,classes='button',message)=>`<a class="${classes}" data-whatsapp="${trip.id}" href="${wa(trip,message)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)} · ${escape(trip.name)}, por WhatsApp">${escape(label)}</a>`;
const facts=tripFacts;
const status=trip=>availabilityLabel(trip).toLocaleUpperCase('es');
const price=tripPrice;
const summaryPrice=trip=>departuresFor(trip).some(d=>d.price!==null)?trip.priceNote:'Precio y programa por confirmar';

// Keep CMS copy and services; remove only PDF brand lines and visual headings.
export function detailIntro(value = '') {
 const importedHeadings = new Set(['ESCÁPATE DEL INVIERNO A SURFEAR', 'UN FINDE PARA SUBIR DE NIVEL', 'UNA SEMANA PARA SUBIR DE NIVEL EN EL PARAÍSO', 'UNA AVENTURA DE SURF EN ÁFRICA'].map(line => line.replaceAll(' ', '')));
 return value.split(/\n+/).map(line => line.trim()).filter(line => line && !/^let[’']s surf together$/i.test(line) && !importedHeadings.has(line.replaceAll(' ', '')) && line !== 'La familia LST en un viaje anterior').join(' ');
}
// Remove import annotations while retaining the actual accommodation details.
function stayCopy(value = '') {
 return value.replace(/\s*\(p\.\s*\d+(?:[–-]\d+)?\)/g, '').replace(/\s+sin nombre/g, '').replace(/;\s*(?:nombre y habitaciones no indicados|no se especifica distribución de habitaciones)\.?/g, '.').trim();
}
function offerMarkup(trip, departure, {date = false, compact = false} = {}) {
 if (trip.state !== 'confirmed' || isFull(trip) || !departure?.promotion || isFull(departure)) return '';
 const promotion = departure.promotion;
 const saving = Math.round((departure.regularPrice - departure.price) * 100) / 100;
 return `<div class="trip-offer${compact?' trip-offer-compact':''}"><p class="trip-offer-label">${escape(promotion.label)}${compact?'':` <strong>${escape(formatPrice(saving))} de descuento</strong>`}</p><p class="trip-offer-condition">${escape(promotionCondition(promotion))}</p>${date ? `<p class="trip-offer-date">Tarifa para el ${escape(departure.date)}</p>` : ''}</div>`;
}
// Match the exact summary produced by update-trip-promotions.mjs; never strip custom additions.
function generatedTariffNote(trip) {
 const conditions=departuresFor(trip).filter(d=>d.promotions?.length&&d.regularPrice!=null).map(d=>`${d.promotions.map(p=>`${p.label}: ${formatPrice(p.price)} (${promotionCondition(p).toLocaleLowerCase('es')})`).join('; ')}. Tarifa general: ${formatPrice(d.regularPrice)}.`);
 return conditions.length?`${[...new Set(conditions)].join(' ')} Precios por persona. La consulta no confirma la reserva.`:null;
}
function fareMarkup(trip, departure, {from = false} = {}) {
 const offer = trip.state === 'confirmed' && !isFull(trip) && !isFull(departure ?? {}) && departure?.promotion;
 return `${offer ? `<del><span class="visually-hidden">Precio general: </span>${escape(formatPrice(departure.regularPrice))}</del> ` : ''}<strong>${from && departure?.price != null ? 'Desde ' : ''}${escape(departure?.price != null ? formatPrice(departure.price) : departure ? 'Consultar precio' : price(trip))}</strong>`;
}

const dossier=trip=>{
 const departures=departuresFor(trip);
 if(departures.length>1)return '';
 const href=departures[0]?.dossier||trip.dossier;
 return href?`<a class="dossier-link" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${arrow("down")} Descargar dossier <span class="dossier-format">PDF</span></a>`:'';
};
const registrationLink=(trip,departure,classes='button trip-registration',label=departure?'Solicitar plaza en esta fecha':'Solicitar plaza')=>{const href=registrationUrl(trip,departure);return href?`<a class="${classes}" data-registration="${escape(trip.id)}" href="${escape(href)}">${escape(label)}</a>`:'';};
const paymentFor=(trip,departure)=>departure.payment===undefined?trip.payment:departure.payment;
// A common deposit is advertised only when every open, confirmed departure has that exact value.
export function tripDeposit(trip) {
 if(trip.state!=='confirmed'||isFull(trip))return null;
 const dates=departuresFor(trip).filter(d=>d.state==='confirmed'&&!isFull(d));
 if(!dates.length)return null;
 const values=dates.map(d=>paymentFor(trip,d)?.depositAmount);
 const known=value=>Number.isFinite(value)&&value>=0;
 const common=values.every(known)&&values.every(value=>value===values[0]);
 return {amount:common?values[0]:null,multiple:dates.length>1};
}
const calendarIcon='<svg class="booking-icon" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4m8-4v4M3 11h18"/></svg>';
const clockIcon='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const peopleIcon='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>';
const surfIcon='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M2 16c3 0 3-3 6-3s3 3 6 3 3-3 8-3M3 21c3 0 3-2 6-2s3 2 6 2 3-2 6-2M8 9c0-4 4-7 8-6-3 1-4 4-2 6"/></svg>';
// Decorative cues follow the service label, never its position or an assumed inclusion.
const programmeIcon=label=>{
 const kind=/v[ií]deo|revisar/i.test(label)?'video':/animal flow|estiramiento|movilidad|cuerpo/i.test(label)?'movement':/material|neopreno/i.test(label)?'board':/clases|coaching|sesiones|agua|surf/i.test(label)?'wave':'compass';
 const shapes={
  wave:'<path d="M3 16c4-1 4-10 10-11 3-.5 6 1 7 4-3-2-7-1-7 2 0 2 2 3 5 3h3"/><path class="icon-accent" d="M3 20c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/>',
  video:'<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path class="icon-accent" d="m10 9 5 3-5 3Z"/>',
  movement:'<circle cx="13" cy="4" r="2"/><path d="m4 8 7 2 5-2 4-4M11 10l1 6-5 5m5-5 7 4"/><path class="icon-accent" d="M3 15h3m-2-2v4"/>',
  board:'<path d="M12 2C8 6 6.5 11 6.5 16c0 3.5 2 6 5.5 6s5.5-2.5 5.5-6C17.5 11 16 6 12 2Z"/><path class="icon-accent" d="M12 5v14m-2-3 2-2 2 2"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path class="icon-accent" d="m15.5 8.5-2 5-5 2 2-5Z"/>',
 };
 return `<svg class="programme-icon programme-icon-${kind}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shapes[kind]}</svg>`;
};
const programmeCopy=value=>{
 const copy=publicDetail(value),lead=/^(De lunes a sábado|Correcciones grupales e individuales|Material de iniciación incluido)(.*)$/s.exec(copy);
 return lead?`<strong>${escape(lead[1])}</strong>${escape(lead[2])}`:escape(copy);
};
const depositIcon='<svg class="booking-icon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H5a2 2 0 0 1 0-4h13v4M4 7v12a2 2 0 0 0 2 2h14V7"/><path d="M20 12h-5v5h5"/><circle cx="16.8" cy="14.5" r=".6" fill="currentColor"/></svg>';
const depositMarkup=deposit=>!deposit?'':`<div class="booking-deposit">${depositIcon}<div>${deposit.amount!==null?`<p>Reserva con <strong>${escape(formatPrice(deposit.amount))}</strong></p><span>Señal al confirmar tu plaza</span>`:`<p>${deposit.multiple?'Señal según la fecha':'Señal de reserva por confirmar'}</p><span>${deposit.multiple?'Consulta el importe en cada salida':'El equipo te indicará las condiciones'}</span>`}</div></div>`;
const departurePayment=(trip,d,{showDeposit=true,openTerms=false}={})=>{
 const payment=paymentFor(trip,d);
 const reservable=trip.state==='confirmed'&&d.state==='confirmed'&&!isFull(trip)&&!isFull(d);
 return ((showDeposit&&payment?.depositAmount!=null)||payment?.terms)?`<div class="departure-payment">${showDeposit&&payment?.depositAmount!=null?`<p class="departure-deposit">${reservable?'Reserva con':'Señal prevista:'} <strong>${formatPrice(payment.depositAmount)}</strong></p>`:''}${payment?.terms?openTerms?`<p class="payment-terms">${escape(payment.terms)}</p>`:`<details><summary>Condiciones de pago</summary><p>${escape(payment.terms)}</p></details>`:''}</div>`:'';
};

const bookingAction=(trip,label,classes)=>departuresFor(trip).length>1?`<button type="button" class="${classes}" data-open-dates aria-haspopup="dialog" aria-controls="departure-dialog">Elegir fecha</button>`:isFull(trip)?contact(trip,'Consultar viaje completo',classes,`¡Hola, LST! Veo que ${trip.name} está completo. Quiero consultar otras opciones con el equipo.`):registrationUrl(trip)?registrationLink(trip,undefined,classes):contact(trip,label,classes);

const dateDossier=d=>d.dossier?`<a class="dossier-link departure-dossier" href="${escape(d.dossier)}" target="_blank" rel="noopener noreferrer" aria-label="Ver PDF del ${escape(d.date)}"><span class="dossier-format">PDF</span> Ver programa ${arrow('external')}</a>`:'';
function dateDialog(trip){
 const departures=departuresFor(trip);
 if(departures.length<2)return '';
 const options=departures.map((d,i)=>{
  const full=isFull(trip)||isFull(d);
  const availability=full?'Completo':trip.state!=='confirmed'||d.state!=='confirmed'?'Por confirmar':d.availability?availabilityLabel(d):availabilityLabel(trip);
  const reservable=trip.state==='confirmed'&&d.state==='confirmed'&&!full;
  const payment=paymentFor(trip,d);
  const enquiry=`<a class="departure-enquiry" data-whatsapp="${trip.id}" href="${wa(trip,departureMessage(trip,d))}" data-departure="${escape(d.id)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${escape(trip.name)}, ${escape(d.date)}, ${escape(levelLabel(trip))}, por WhatsApp">${full?'Consultar alternativas':'Tengo una duda'}</a>`;
  const registration=registrationLink(trip,d,'button trip-registration','Solicitar plaza');
  return `<article class="departure-option"><div class="departure-option-top"><p class="departure-option-status"><span class="departure-index" aria-hidden="true">0${i+1}</span> ${escape(availability)}</p><div class="departure-option-date"><h3 aria-label="${escape(d.date)}">${escape(compactDepartureDate(d))}</h3></div><p class="departure-option-meta">${escape(d.duration)}${d.capacity?.total!=null?` · Hasta ${d.capacity.total} personas`:''}</p></div><div class="departure-option-booking"><p class="departure-option-price">${fareMarkup(trip,d)}${d.price!==null?'<span>por persona</span>':''}</p>${payment?.depositAmount!=null?`<p class="departure-summary-deposit">Señal ${reservable?'al confirmar':'prevista'}: <strong>${escape(formatPrice(payment.depositAmount))}</strong></p>`:''}${offerMarkup(trip,d,{compact:true})}${registration||enquiry}</div><details class="departure-more"><summary>Programa y condiciones</summary><div class="departure-more-content">${dateDossier(d)}${departurePayment(trip,d,{showDeposit:false})}${registration?enquiry:''}</div></details></article>`;
 }).join('');
 return `<dialog class="departure-dialog" id="departure-dialog" aria-labelledby="departure-dialog-title" aria-describedby="departure-dialog-description"><div class="departure-dialog-heading"><div><p class="eyebrow">${escape(trip.name)} / ${departures.length} SALIDAS</p><h2 id="departure-dialog-title">Elige tu fecha.</h2></div><button class="departure-close" type="button">Cerrar <span aria-hidden="true">×</span></button></div><p id="departure-dialog-description" class="departure-dialog-intro">${escape(levelLabel(trip))} · Mismo programa en todas las fechas.</p><div class="departure-dialog-list">${options}</div><p class="departure-dialog-help">Solicitar plaza no realiza ningún pago. El equipo confirma la disponibilidad contigo.</p></dialog>`;
}

export function renderTrip(trip, trips = []){
const real=trip.state==='confirmed';
const departures=departuresFor(trip);
const multiple=departures.length>1;
const firstDeparture=departures[0];
const pricing=tripPriceDetails(trip);
const shownDeparture=pricing.departure;
const offer=real&&!isFull(trip)&&shownDeparture?.promotion;
const pitch=salesPitch(trip);
const practical=practicalDetails(trip);
const extraFaqs=salesFaqs(trip);
const faqs=[...trip.faqs,...extraFaqs.filter(([q])=>!trip.faqs.some(([key])=>key===q))];
const cta=isFull(trip)?'Consultar viaje completo':real?'Consultar plaza':'Consultar destino';
const mainCta=isFull(trip)?'Consultar viaje completo':'Consultar por WhatsApp';
const team=real?trip.team:null;
const canRegister=!!registrationUrl(trip);
const deposit=tripDeposit(trip);
const bookingTone=isFull(trip)?'quiet':availabilityLabel(trip)==='Plazas disponibles'?'available':availabilityLabel(trip)==='Últimas plazas'?'limited':'quiet';
// Condense only the known generic note; keep any custom commercial wording.
const sidebarPriceNote=!summaryPrice(trip)||summaryPrice(trip)==='Tarifa general por persona, sin promociones. La solicitud no confirma la reserva.'||summaryPrice(trip)===generatedTariffNote(trip)?'por persona':summaryPrice(trip);

// A documented group moment is not a portrait or identification of the host.
const teamMoment=real?trip.gallery.find(([,alt,caption])=>/grupo|comunidad/i.test(alt)&&! /ejemplo|generad[ao]|\bIA\b/i.test(alt+' '+caption)):null;
// Only this unchanged introductory copy duplicates the beginner level cards; other CMS requirements remain visible.
const profileRequirement = trip.slug==='marruecos'&&trip.levelRequirement==='Iniciación e intermedio bajo: de espumas a primeras paredes y maniobras sencillas.' ? '' : publicDetail(trip.levelRequirement);

const accompaniment=accompanimentItems(trip);
const description=real?`Surftrip a ${trip.name}. ${multiple?`${departures.length} fechas${isFull(trip)?' · Completo':' disponibles'}`:firstDeparture?.date??'Consulta las fechas'}. ${levelLabel(trip)}. Consulta el programa y las fechas${canRegister?' e inscríbete con el formulario':' de este viaje'}.`:`Conoce los viajes de surf de LST a ${trip.name}. ${levelLabel(trip)}. Próximas fechas y programa por anunciar. Consulta el destino por WhatsApp.`;
const allFacts=facts(trip);
const durationLabel=allFacts.find(([label])=>label==='Duración')[1];
const mobileOptions=!multiple&&(trip.dossier||departures.some(d=>d.dossier))?`<div class="mobile-booking-options">${dossier(trip)}</div>`:"";
const sharedCapacities=departures.map(d=>d.capacity?.total);
const groupSize=real&&sharedCapacities.length&&sharedCapacities.every(n=>Number.isFinite(n)&&n===sharedCapacities[0])?sharedCapacities[0]:null;
const groupFit=`<div class="group-fit"><div><p class="group-fit-label">EL VIAJE TAMBIÉN ES EL GRUPO</p><h3>Compártelo.</h3><p>${groupSize!=null?`Compartirás la salida con un grupo de hasta ${groupSize} personas.`:'Consulta cómo se organiza el grupo de esta salida.'} ${team?.text?'Más abajo te presentamos a quien te acompaña.':'El equipo puede orientarte antes de solicitar plaza.'}</p></div>${contact(trip,'¿Vienes por tu cuenta? Hablemos','text-link group-fit-contact',`¡Hola, LST! Me interesa ${trip.name} y viajaría por mi cuenta. ¿Cómo se organiza el grupo y encaja mi nivel con esta salida?`)}</div>`;
const guestVoice=real&&trip.testimonial?`<figure class="trip-guest-voice">${trip.testimonial.context?`<p class="quote-context">${escape(trip.testimonial.context)}</p>`:''}<blockquote>${escape(trip.testimonial.quote)}</blockquote><figcaption>${escape([trip.testimonial.author,trip.testimonial.trip].filter(Boolean).join(' · '))}</figcaption></figure>`:'';
const community=`<div class="trip-community${teamMoment?' has-moment':''}">${teamMoment?`<figure class="community-moment"><img src="${escape(photoSource(teamMoment[0],1100))}" alt="${escape(teamMoment[1])}" width="1100" height="800" loading="lazy" decoding="async"><figcaption>${escape(teamMoment[2]||teamMoment[1])}</figcaption></figure>`:''}<div class="community-copy">${groupFit}${guestVoice}</div></div>`;
const genericNotice='La solicitud inicia una consulta; el equipo confirmará la reserva contigo.';
const programmeNotice=trip.notice&&trip.notice!==genericNotice?`<p class="trip-notice">${escape(isFull(trip)?'Esta salida está completa. Consulta otras opciones con el equipo.':trip.notice)}</p>`:'';
const coverImages = [...(trip.hero ? [[trip.hero, trip.heroAlt, '']] : []), ...trip.gallery.filter(([img]) => img !== trip.hero)];
const essentials=`<section class="trip-essentials trip-shell" aria-label="Datos de este viaje"><nav class="trip-crumbs" aria-label="Breadcrumb"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/viajes/">Viajes</a><span aria-hidden="true">/</span><span aria-current="page">${escape(trip.name)}</span></nav><div class="trip-heading-row"><div class="trip-identity"><h1 id="trip-title"${trip.name.length>11?' class="trip-title-long"':''}>${escape(trip.name)}</h1><span class="trip-meta-duration">${clockIcon}<span><span class="visually-hidden">Duración: </span>${escape(durationLabel)}</span></span></div>${contact(trip,'Hablamos','text-link trip-meta-contact')}</div><dl class="trip-essential-facts"><div><dt class="visually-hidden">${multiple?'Salidas':'Fecha'}</dt><dd>${calendarIcon}${multiple?`<button type="button" class="essential-dates" data-open-dates aria-haspopup="dialog" aria-controls="departure-dialog">Ver ${departures.length} fechas ${arrow('down')}</button>`:`<span>${escape(real&&firstDeparture?compactDepartureDate(firstDeparture):'Fechas por anunciar')}</span>`}</dd></div><div><dt class="visually-hidden">Surf</dt><dd>${surfIcon}<span>${escape(levelLabel(trip))}</span></dd></div><div><dt class="visually-hidden">Grupo</dt><dd>${peopleIcon}<span>${groupSize!=null?`Hasta ${groupSize} personas`:'Grupo por confirmar'}</span></dd></div>${trip.destinationFacts?.[0]?`<div class="trip-meta-location"><dt class="visually-hidden">Destino</dt><dd><span aria-hidden="true">↗</span><span>${escape(publicDetail(trip.destinationFacts[0]))}</span></dd></div>`:''}</dl><div class="essentials-footer">${offerMarkup(trip,shownDeparture,{date:multiple,compact:true})}<a class="text-link" href="#incluye">Qué incluye ${arrow('down')}</a></div></section>`;
const coverCarousel = `<div class="cover-carousel-track" id="trip-cover-track" data-carousel-track tabindex="0" role="region" aria-label="Fotos de ${escape(trip.name)}; desliza para ver más">${coverImages.map(([img,alt],i) => {const photo=coverPhotoSources(img),sources=`src="${escape(photo.src)}"${photo.srcset?` srcset="${escape(photo.srcset)}" sizes="${escape(photo.sizes)}"`:''} width="${photo.width}" height="${photo.height}"`;return `<figure class="cover-carousel-slide" id="cover-photo-${i}" style="--cover-photo-max-width:${photo.width}px"><button class="cover-image-button" data-photo="${i}" type="button" aria-label="Ampliar foto ${i+1}: ${escape(alt)}"><img class="trip-cover-image" ${sources} alt="${escape(alt)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"><img class="cover-photo-backdrop" ${sources} alt="" aria-hidden="true" loading="lazy" fetchpriority="low" decoding="async"></button></figure>`;}).join('')}</div>`;
const photoSlides=coverImages.map(([img,alt,caption],i)=>`<figure class="photo-slide" aria-label="Foto ${i+1} de ${coverImages.length}"><img src="${escape(img)}" alt="${escape(alt)}" width="1000" height="600" loading="lazy" decoding="async"><figcaption>${escape(caption)}</figcaption></figure>`).join("\n");
const story=trip.story.map(([title,copy],i)=>`<details class="plan-item"${i===0?' open':''}><summary><span class="plan-number" aria-hidden="true">0${i+1}</span><span>${escape(title)}</span><span class="plan-toggle" aria-hidden="true">+</span></summary><p>${escape(publicDetail(copy))}</p></details>`).join('\n');
const inclusions=`<section id="incluye" class="trip-block trip-costs"><p class="eyebrow">EL PRECIO, AL DETALLE</p><h2>Tu viaje, al detalle.</h2>
 ${trip.includes?.length||trip.excludes?.length||trip.inclusionsNote?`<div class="inclusion-grid">${trip.includes?.length?`<div class="inclusion-list" aria-labelledby="included-title"><h3 id="included-title"><span aria-hidden="true">✓</span> Incluido</h3><div class="inclusion-groups">${groupedInclusions(trip.includes.map(publicDetail))}</div></div>`:''}${trip.excludes?.length?`<div class="inclusion-list exclusion-list" aria-labelledby="excluded-title"><h3 id="excluded-title"><span aria-hidden="true">↗</span> No incluido</h3><ul>${trip.excludes.map(item=>`<li>${escape(publicDetail(item))}</li>`).join('')}</ul></div>`:''}</div>${trip.inclusionsNote?`<p class="fine-print">${escape(trip.inclusionsNote)}</p>`:''}`:`<div class="pending-program"><h3>El programa, cuando esté cerrado.</h3><p>Publicaremos aquí las inclusiones y los gastos que van aparte de ${escape(trip.name)}.</p><dl class="pending-facts"><div><dt>Alojamiento y comidas</dt><dd>Por confirmar</dd></div><div><dt>Sesiones y actividades</dt><dd>Por confirmar</dd></div><div><dt>Material y traslados</dt><dd>Por confirmar</dd></div></dl><p class="fine-print">Las experiencias y fotos de viajes anteriores no constituyen el programa de la próxima salida.</p></div>`}
 <span id="condiciones" aria-hidden="true"></span>${programmeNotice}${mobileOptions}</section>`;
const stayPhotos = trip.stay?.gallery?.length ? trip.stay.gallery : trip.stay?.image ? [[trip.stay.image,trip.stay.alt,trip.stay.name]] : [];
// Omit the temporary preview notice requested for removal, preserving other editorial gallery notes.
const stayGalleryNote = trip.stay?.galleryNote === 'Imágenes de ejemplo generadas para mostrar el ambiente. Las fotos del alojamiento definitivo se actualizarán aquí.' ? '' : trip.stay?.galleryNote;

const stay=trip.stay?`<section id="alojamiento" class="trip-block stay-block${stayPhotos.length?'':' stay-compact'}" data-carousel><div class="section-heading"><div><p class="eyebrow">DESCANSAR, COMPARTIR, REPETIR</p><h2>${escape(trip.stay.title||'Alojamiento y comidas.')}</h2></div>${stayPhotos.length>1?railControls('Alojamiento'):''}</div><p>${escape(stayCopy(trip.stay.text))}</p>${stayPhotos.length?`<div class="stay-carousel-track" data-carousel-track tabindex="0" role="region" aria-label="Fotos del alojamiento; desplazamiento horizontal">${stayPhotos.map(([img,alt,caption])=>`<figure class="trip-figure"><img src="${escape(photoSource(img,1200))}" alt="${escape(alt)}" loading="lazy" decoding="async" width="1200" height="800">${caption?`<figcaption>${escape(caption)}</figcaption>`:''}</figure>`).join('')}</div>`:''}${stayGalleryNote?`<p class="fine-print stay-gallery-note">${escape(stayGalleryNote)}</p>`:''}${trip.stay.note?`<p class="fine-print">${escape(trip.stay.note)}</p>`:''}</section>`:'';
const related=trips.filter(t=>t.id!==trip.id).slice(0,3).map(t=>`<a class="related-trip" href="${url(t)}">${t.hero?`<img src="${escape(photoSource(t.hero,900))}" alt="" width="1000" height="625" loading="lazy">`:""}<div class="related-trip-copy"><span class="related-trip-name">${escape(t.name)}</span><small>${t.state==='confirmed'?escape(departuresFor(t).length>1?'Varias salidas':compactDepartureDate(departuresFor(t)[0]??{})??'Consultar fechas'):'Próximamente'}</small></div><span class="related-trip-arrow" aria-hidden="true">${arrow('right')}</span></a>`).join('');
return withWhatsApp(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#FFFAE7"><title>${escape(trip.name)} · Viaje de surf — Let’s Surf Together</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(trip.name)} · Let’s Surf Together"><meta property="og:description" content="${escape(description)}">${trip.hero?`<meta property="og:image" content="${escape(trip.hero)}">`:""}<meta property="og:url" content="${origin}${url(trip)}"><meta property="og:type" content="website"><link rel="icon" href="/assets/brand/symbol-orange.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/aura.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/home.css"><link rel="stylesheet" href="/trip.css"><link rel="stylesheet" href="/trip-detail.css"><link rel="stylesheet" href="/trip-conversion.css"></head>
<body class="home-modern trip-page trip-designed" data-state="${trip.state}">
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header trip-header trip-sales-header"><a class="brand" href="/" aria-label="Let’s Surf Together, inicio"><img class="brand-light" src="/assets/brand/logo-white.svg" alt="Let’s Surf Together" width="774" height="126"><img class="brand-dark" src="/assets/brand/logo-black.svg" alt="" width="774" height="126" aria-hidden="true"></a><a class="lst-header-trip" href="/viajes/">Ver viajes</a><button class="menu-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Abrir menú"><span></span><span></span></button><nav id="main-nav" aria-label="Navegación principal"><a class="lst-nav-trip" href="/viajes/">Ver viajes</a><a href="/niveles/">Niveles</a><a href="/conocenos/">Conócenos</a><a href="/preguntas-frecuentes/">FAQs</a><a class="lst-nav-contact" data-whatsapp="${escape(trip.id)}" href="${wa(trip)}" target="_blank" rel="noopener noreferrer">Hablamos</a></nav>${bookingAction(trip,cta,'button trip-header-cta')}</header>
<main id="contenido" tabindex="-1">
 <div class="trip-opening-gallery" data-carousel>
  <section class="trip-cover"${coverImages.length?'':' data-cover-empty'} style="--trip-cover-ratio:${coverRatio(coverImages[0]?.[0])}" aria-labelledby="trip-title">${coverCarousel}</section>
  ${coverImages.length?`<div class="cover-gallery-bar"><div class="cover-carousel-controls">${coverImages.length>1?railControls('Fotos del viaje'):''}<span data-carousel-counter aria-live="polite">01 / ${String(coverImages.length).padStart(2,'0')}</span></div><button class="cover-gallery-open" type="button" data-open-gallery>Ver fotos <span>${String(coverImages.length).padStart(2,'0')}</span></button></div>`:''}
  ${coverImages.length>1?`<nav class="cover-thumbnails trip-shell" aria-label="Miniaturas del viaje" data-carousel-thumbnails>${coverImages.map(([img,alt],i)=>`<a href="#cover-photo-${i}" class="cover-thumbnail" data-carousel-thumb="${i}" aria-controls="trip-cover-track" aria-label="Mostrar foto ${i+1}: ${escape(alt)}"${i===0?' aria-current="true"':''}><img src="${escape(photoSource(img,240))}" alt="" width="120" height="80" loading="lazy" decoding="async"></a>`).join('')}</nav>`:''}
 </div>
 ${essentials}
 <div class="trip-layout">
  <article class="trip-content">
   <section id="destino" class="trip-summary" aria-labelledby="trip-summary-title"><details class="destination-details" open><summary id="trip-summary-title">¿Por qué ${escape(trip.name)}?<span aria-hidden="true">+</span></summary><p class="trip-kickoff">${escape(trip.destinationDescription||detailIntro(pitch.text))}</p></details>${isFull(trip)?'<p class="trip-notice">Esta salida está completa. Consulta otras opciones con el equipo.</p>':''}</section>
   <section id="nivel" class="trip-block trip-level"><p class="eyebrow">TU GRUPO EN EL AGUA</p><div class="level-heading"><h2>¿Es este tu viaje?</h2><p class="level-fixed-note">${escape(levelLabel(trip))}</p></div>${trip.audience?.profiles?.length?`<div class="audience-profiles">${trip.audience.profiles.map(([title,text])=>`<article><h3>${escape(levelProfileTitle(title))}</h3><p>${escape(text)}</p></article>`).join('')}${profileRequirement?`<p class="level-requirement">${escape(profileRequirement)}</p>`:''}</div>`:`<p>${escape(publicDetail(trip.levelText||trip.levelRequirement))}</p>${trip.levelRequirement&&trip.levelRequirement!==(trip.levelText||trip.levelRequirement)?`<p class="level-requirement">${escape(publicDetail(trip.levelRequirement))}</p>`:''}`}${trip.levelChecks?.length?`<ul>${trip.levelChecks.map(s=>`<li>${escape(publicDetail(s))}</li>`).join('')}</ul>`:''}<div class="level-actions"><a class="text-link" href="/niveles/">Ver la guía de niveles</a>${contact(trip,'¿Dudas con tu nivel?','text-link',`¡Hola, LST! Me interesa ${trip.name}. ¿Me ayudáis a comprobar si mi nivel encaja con este viaje?`)}</div>${community}${trips.some(t=>t.slug===(trip.slug==='marruecos'?'marruecos-avanzado':trip.slug==='marruecos-avanzado'?'marruecos':''))?`<a class="trip-alternative" href="/viajes/${trip.slug==='marruecos'?'marruecos-avanzado':'marruecos'}/">${trip.slug==='marruecos'?'¿Ya tienes autonomía? Conoce Marruecos avanzado.':'¿Estás empezando? Conoce Marruecos I–II.'}</a>`:''}</section>
   <section class="trip-programme trip-block" id="plan" aria-labelledby="surf-plan-title"><p class="eyebrow">SURF Y PROGRESO</p><h2 id="surf-plan-title">Plan de surf.</h2>
    ${surfRhythm(trip).length>1?`<div class="day-rhythm"><strong>El ritmo de un día de surf</strong><ol class="day-sequence" role="list">${surfRhythm(trip).map(label=>`<li><span class="rhythm-icon" aria-hidden="true">${programmeIcon(label)}</span><span class="rhythm-label">${escape(label)}</span></li>`).join('')}</ol><p>Secuencia orientativa con actividades del programa. El orden y los horarios se adaptan al mar y al grupo.</p></div>`:''}
    ${trip.surfPlan?.length?`<div class="surf-plan-grid">${trip.surfPlan.map(([title,text])=>`<article><div class="surf-service-heading">${programmeIcon(title)}<h3>${escape(title)}</h3></div><p>${programmeCopy(text)}</p></article>`).join('')}</div>`:''}
    ${!trip.surfPlan?.length&&(trip.story.length||trip.storyIntro)?`<div class="programme-full"><h3>${escape(trip.storyTitle==='El programa.'?'El programa del viaje':trip.storyTitle)}</h3>${trip.storyIntro?`<p>${escape(trip.storyIntro)}</p>`:''}<div class="plan-list">${story}</div></div>`:''}
    ${visualRail(trip.spots,'spots','Spots.','BUSCANDO NUESTRA OLA',trip.spotsNote)}
    <section class="trip-block trip-team"><div class="trip-team-copy"><p class="eyebrow">EL VIAJE, BIEN ACOMPAÑADO</p><h3>${escape(team?.title||'Viajamos en grupo.')}</h3><p>${escape(team?.text||(real?'Consulta con el equipo quién acompaña esta salida.':`El próximo programa de ${trip.name} está pendiente. Publicaremos el acompañamiento junto con los detalles de la salida.`))}</p>${accompaniment.length?`<p class="team-programme-label">En el programa de esta salida</p><ul class="trip-team-roles">${accompaniment.map(item=>`<li>${escape(publicDetail(item))}</li>`).join('')}</ul>`:''}<a class="text-link" href="/conocenos/#acompanamiento">Conoce al equipo de LST ${arrow('right')}</a>${!real?contact(trip,'Consultar el acompañamiento','button button-small trip-team-contact',`¡Hola, LST! Me interesa ${trip.name}. ¿Qué acompañamiento está previsto para la próxima salida?`):''}</div></section>
   </section>
   ${stay}
   ${visualRail(trip.activities,'actividades','La vida fuera del agua.','MÁS ALLÁ DEL AGUA')}
   ${inclusions}
   <section id="dudas" class="trip-block trip-faq"><p class="eyebrow">LAS DUDAS ANTES DEL VIAJE</p><h2>Preguntas frecuentes.</h2>${faqs.length?'':'<p>Viajar por tu cuenta, elegir nivel, preparar la mochila… Empieza por nuestras preguntas frecuentes o cuéntanos tu duda.</p><a class="text-link" href="/preguntas-frecuentes/">Resolver las dudas del viaje</a>'}<div class="faq-list">${practical.length?`<details><summary>¿Cómo preparo el viaje?<span aria-hidden="true">+</span></summary><div class="practical-grid">${practical.map(item=>`<article><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></article>`).join('')}</div></details>`:''}${faqs.map(([q,a])=>`<details><summary>${escape(q)}<span aria-hidden="true">+</span></summary><p>${escape(a)}</p></details>`).join('')}</div>${!trip.faqs.length&&faqs.length?'<a class="text-link" href="/preguntas-frecuentes/">Resolver las dudas del viaje</a>':''}</section>
   <section id="reservar" class="trip-block trip-reserve">
    <div class="reserve-layout"><div class="reserve-copy"><p class="eyebrow">${canRegister?'TU SIGUIENTE PASO':real?'TU PRÓXIMO VIAJE':'PRÓXIMAS SALIDAS'}</p><h2>${isFull(trip)?'Nos vemos en otra ola.':canRegister?'¿Te vienes?':`¿Te apetece ${escape(trip.name)}?`}</h2><p>${isFull(trip)?'Esta salida está completa. Puedes consultar otras opciones con el equipo.':canRegister?'Solicita tu plaza. El equipo comprobará la disponibilidad y te acompañará en los siguientes pasos.':real?'Consulta la disponibilidad y las condiciones de esta salida con el equipo.':'Consulta las próximas fechas y el programa con el equipo.'}</p></div><div class="reserve-actions">${bookingAction(trip,mainCta,'button reserve-main')}${contact(trip,'Resuelve tus dudas','button reserve-whatsapp')}</div></div>
    ${canRegister?'<ol class="request-steps"><li><span>01</span><strong>Envía tu solicitud</strong><p>Elige la salida y cuéntanos sobre ti y tu surf.</p></li><li><span>02</span><strong>Lo vemos contigo</strong><p>El equipo revisa la disponibilidad y tu inscripción.</p></li><li><span>03</span><strong>Confirma con el equipo</strong><p>Te indicamos los pasos y las condiciones para reservar.</p></li></ol>':''}
    <p class="fine-print reserve-note">${canRegister?'La inscripción no confirma la reserva. El equipo revisará tu solicitud y te indicará los siguientes pasos.':'La consulta no confirma una reserva.'}</p><a class="reserve-conditions-link" href="#incluye">Ver qué incluye el viaje</a>
    ${multiple?`<noscript><style>.trip-designed [data-open-dates],.trip-designed [data-open-gallery],.trip-designed .gallery-photo>span{display:none}</style><section id="fechas-sin-javascript" class="trip-native-dates"><h2>Fechas</h2>${departures.map(d=>`<article><h3>${escape(d.date)}</h3>${dateDossier(d)}${offerMarkup(trip,d)}<p>${fareMarkup(trip,d)}</p>${departurePayment(trip,d)}${registrationLink(trip,d)}${contact(trip,isFull(trip)||isFull(d)?'Consultar alternativas':'Consultar esta fecha','button',departureMessage(trip,d))}</article>`).join('')}</section></noscript>`:''}
   </section>
  </article>
  <aside class="trip-booking" aria-label="${real?'Consultar este viaje':'Consultar la próxima salida'}"><div class="booking-card"><div class="booking-card-top"><p class="booking-trip-name">${escape(trip.name)}</p><p class="booking-status" data-tone="${bookingTone}">${status(trip)}</p></div><p class="booking-card-price">${fareMarkup(trip,shownDeparture,{from:pricing.from})}</p><p class="booking-card-price-note">${escape(sidebarPriceNote)}</p>${offerMarkup(trip,shownDeparture,{date:multiple,compact:true})}<div class="booking-essentials"><p class="booking-date">${calendarIcon}<span>${escape(multiple?`${departures.length} salidas`:firstDeparture?.date??'Fechas por anunciar')}</span></p><div class="booking-tags"><span>${escape(durationLabel)}</span><span>${escape(levelLabel(trip))}</span></div></div>${depositMarkup(deposit)}${bookingAction(trip,cta,"button booking-card-cta")}<p class="booking-card-help">${canRegister?'Solicitud sujeta a confirmación.':real?'Consulta la disponibilidad.':'Fechas por confirmar.'}</p><div class="booking-secondary">${dossier(trip).replace('Descargar dossier','Ver dossier')}${contact(trip,'¿Dudas?','button booking-whatsapp')}</div></div></aside>
 </div>
 <section class="related-section"><div class="trip-shell"><p class="eyebrow">SIGUE MIRANDO</p><h2>¿Y si tu próxima ola está aquí?</h2><div class="related-list">${related}</div><a class="text-link" href="/viajes/">Ver todos los viajes</a></div></section>
</main>
<footer class="trip-footer trip-shell"><a class="brand" href="/"><img src="/assets/brand/logo-black.svg" alt="Let’s Surf Together" width="774" height="126" loading="lazy"></a><div><a href="https://www.instagram.com/letsurftogether/" target="_blank" rel="noopener">@letsurftogether</a><a href="/conocenos/">Conócenos</a><a href="/preguntas-frecuentes/">FAQs</a><a href="/#experiencia">La experiencia</a><a href="/#reservar">Cómo reservar</a></div><p>© 2026 LET’S SURF TOGETHER</p></footer>
<div class="trip-dock" aria-label="Fechas e inscripción">${offer?`<span class="dock-offer">${escape(shownDeparture.promotion.label)} · ${escape(promotionCondition(shownDeparture.promotion))}</span>`:''}<div class="dock-details">${isFull(trip)?'<strong>Completo</strong>':real?`<p class="dock-price">${fareMarkup(trip,shownDeparture,{from:pricing.from})}</p>`:'<strong>Próximamente</strong>'}<span>${real?`por persona · ${escape(offer?shownDeparture.duration:durationLabel)}`:'Fechas por anunciar'}</span>${deposit?`<span class="dock-deposit">${deposit.amount!==null?`Señal: ${escape(formatPrice(deposit.amount))}`:deposit.multiple?'Señal según la fecha':'Señal por confirmar'}</span>`:''}</div>${bookingAction(trip,cta,'button dock-cta')}${contact(trip,'Hablar por WhatsApp','button dock-whatsapp')}</div>
<dialog class="photo-dialog" aria-labelledby="photo-title"><div class="photo-heading"><div><p id="photo-title">Fotos de ${escape(trip.name)}</p><p class="photo-instruction">Desliza para ver más</p></div><button class="photo-close" type="button" aria-label="Cerrar fotos">Cerrar</button></div><div class="photo-strip" tabindex="0" role="region" aria-label="Galería de fotos, desplazamiento horizontal">${photoSlides}</div><div class="photo-controls"><button type="button" data-photo-prev aria-label="Foto anterior">Anterior</button><span class="photo-counter" aria-live="polite" aria-atomic="true">1 / ${coverImages.length}</span><button type="button" data-photo-next aria-label="Foto siguiente">Siguiente</button></div></dialog>
${dateDialog(trip)}

<noscript><nav class="trip-static-nav" aria-label="Más páginas de LST"><a href="/viajes/">Viajes</a><a href="/niveles/">Niveles</a><a href="/conocenos/">Conócenos</a><a href="/preguntas-frecuentes/">FAQs</a></nav><style>.trip-designed .menu-toggle,.trip-designed .rail-controls,.trip-designed [data-open-gallery]{display:none}.trip-designed .trip-sales-header{position:absolute}.trip-designed .trip-static-nav{display:flex;flex-wrap:wrap;gap:20px;padding:24px}</style></noscript>
<script src="/app.js" type="module"></script><script src="/trip.js" type="module"></script></body></html>
`.replace(/[ \t]+$/gm, ''));
}
