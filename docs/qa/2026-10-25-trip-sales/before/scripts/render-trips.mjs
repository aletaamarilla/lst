import {levelLabel, departuresFor, departureMessage, tripMessage, tripFacts, tripPrice, tripPriceDetails, formatPrice, isFull, availabilityLabel} from './trip-model.mjs';
import {registrationUrl} from './brevo.mjs';
import {promotionCondition} from './trip-pricing.mjs';
import {tripMood, renderQuickFacts, experienceScenes, groupedInclusions} from './trip-experience.mjs';

// Reuse literal services from this programme; do not infer names or transfer staff between trips.
export function accompanimentItems(trip) {
  if (trip.state !== 'confirmed' || trip.team) return [];
  const terms = /\b(?:coach(?:ing)?|instructor(?:a|es|as)?|monitor(?:a|es|as)?|gu[ií]as?|acompañamiento|clases de surf|surf guiding)\b/i;
  return [...new Set((trip.includes ?? []).filter(item => typeof item === 'string' && terms.test(item)))];
}
const origin='https://lst-sepia.vercel.app';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=trip=>`/viajes/${trip.slug}/`;
const wa=(trip,message=tripMessage(trip))=>`https://wa.me/34648189257?text=${encodeURIComponent(message)}`;
const arrow=(direction='external')=>`<svg class="action-arrow" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${direction==='left'?'M20 12H4m6-6-6 6 6 6':direction==='down'?'M12 4v16m-6-6 6 6 6-6':direction==='right'?'M4 12h16m-6-6 6 6-6 6':'M6 18 18 6M6 6h12v12'}"/></svg>`;
const contact=(trip,label,classes='button',message)=>`<a class="${classes}" data-whatsapp="${trip.id}" href="${wa(trip,message)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)} · ${escape(trip.name)}, por WhatsApp">${escape(label)}</a>`;
const figure=(img,alt,caption)=>`<figure class="trip-figure"><img src="${escape(img)}" alt="${escape(alt)}" loading="lazy" decoding="async" width="1000" height="600"><figcaption>${escape(caption)}</figcaption></figure>`;
const facts=tripFacts;
const status=trip=>availabilityLabel(trip).toLocaleUpperCase('es');
const price=tripPrice;
const summaryPrice=trip=>departuresFor(trip).some(d=>d.price!==null)?trip.priceNote:'Precio y programa por confirmar';

const detailTitles = {
 'el-palmar': 'Este puente, cambia de orilla.',
 fuerteventura: 'Sal del invierno. Entra al agua.',
 hossegor: 'Un finde. Todo tu surf por delante.',
 maldivas: 'Cambia de azul. Sigue surfeando.',
 marruecos: 'Tu semana entre olas y zocos.',
 'marruecos-avanzado': 'Más olas. Más intención en cada giro.',
 senegal: 'El Atlántico tiene otro ritmo.',
};

const programmeTitles = {
 'el-palmar': ['Al agua, cada día.', 'El surf también se entrena fuera.', 'Después de la última ola.', 'El plan cuando cae el sol.'],
 fuerteventura: ['Más sesiones. Más recursos.', 'Un día con ritmo de isla.', 'La isla también se vive fuera del agua.'],
 hossegor: ['Tu surf, visto con otros ojos.', 'Aprender a leer el mar.'],
 marruecos: ['Tu surf empieza aquí.', 'Marruecos también se vive fuera del agua.'],
 'marruecos-avanzado': ['Coaching para dar el siguiente paso.', 'Leer el mar. Elegir la ola.'],
 maldivas: ['De la primera sesión al último sunset.', 'Si el mar pide una pausa.'],
 senegal: ['Surfear. Revisar. Volver al agua.', 'Otro ritmo fuera del agua.', 'Una noche bajo otro cielo.'],
};
const programmeTitle = (trip, title, index) => /^Programa \d+$/.test(title) ? programmeTitles[trip.slug]?.[index] ?? title : title;

// Keep CMS copy and services; remove only PDF brand lines and visual headings.
export function detailIntro(value = '') {
 const importedHeadings = new Set(['ESCÁPATE DEL INVIERNO A SURFEAR', 'UN FINDE PARA SUBIR DE NIVEL', 'UNA SEMANA PARA SUBIR DE NIVEL EN EL PARAÍSO', 'UNA AVENTURA DE SURF EN ÁFRICA'].map(line => line.replaceAll(' ', '')));
 return value.split(/\n+/).map(line => line.trim()).filter(line => line && !/^let[’']s surf together$/i.test(line) && !importedHeadings.has(line.replaceAll(' ', '')) && line !== 'La familia LST en un viaje anterior').join(' ');
}
// Remove import annotations while retaining the actual accommodation details.
function stayCopy(value = '') {
 return value.replace(/\s*\(p\.\s*\d+(?:[–-]\d+)?\)/g, '').replace(/\s+sin nombre/g, '').replace(/;\s*(?:nombre y habitaciones no indicados|no se especifica distribución de habitaciones)\.?/g, '.').trim();
}
function offerMarkup(trip, departure, {date = false} = {}) {
 if (trip.state !== 'confirmed' || isFull(trip) || !departure?.promotion || isFull(departure)) return '';
 const promotion = departure.promotion;
 const saving = Math.round((departure.regularPrice - departure.price) * 100) / 100;
 return `<div class="trip-offer"><p class="trip-offer-label">${escape(promotion.label)} <strong>${escape(formatPrice(saving))} de descuento</strong></p><p class="trip-offer-condition">${escape(promotionCondition(promotion))}</p>${date ? `<p class="trip-offer-date">Tarifa para el ${escape(departure.date)}</p>` : ''}</div>`;
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
const registrationLink=(trip,departure,classes='button trip-registration')=>{const href=registrationUrl(trip,departure);return href?`<a class="${classes}" data-registration="${escape(trip.id)}" href="${escape(href)}">Inscribirme${departure?' en esta fecha':''}</a>`:'';};
const departurePayment=d=>(d.payment?.depositAmount!=null||d.payment?.terms)?`<details class="departure-payment"><summary>Condiciones de pago</summary>${d.payment?.depositAmount!=null?`<p>Señal: ${formatPrice(d.payment.depositAmount)}</p>`:''}${d.payment?.terms?`<p>${escape(d.payment.terms)}</p>`:''}</details>`:'';
const bookingAction=(trip,label,classes)=>departuresFor(trip).length>1?`<button type="button" class="${classes}" data-open-dates aria-haspopup="dialog" aria-controls="departure-dialog">Fechas</button>`:isFull(trip)?contact(trip,'Consultar viaje completo',classes,`¡Hola, LST! Veo que ${trip.name} está completo. Quiero consultar otras opciones con el equipo.`):registrationUrl(trip)?registrationLink(trip,undefined,classes):contact(trip,label,classes);

const dateDossier=d=>d.dossier?`<a class="dossier-link departure-dossier" href="${escape(d.dossier)}" target="_blank" rel="noopener noreferrer" aria-label="Ver PDF del ${escape(d.date)}"><span class="dossier-format">PDF</span> Ver programa ${arrow('external')}</a>`:'';
function dateDialog(trip){
 const departures=departuresFor(trip);
 if(departures.length<2)return '';
 const options=departures.map((d,i)=>{
  const full=isFull(trip)||isFull(d);
  const availability=full?'Completo':d.availability?availabilityLabel(d):availabilityLabel(trip);
  return `<article class="departure-option"><div class="departure-option-top"><p class="departure-option-status"><span class="departure-index" aria-hidden="true">0${i+1}</span> ${escape(availability)}</p><div class="departure-option-date"><h3>${escape(d.date)}</h3>${dateDossier(d)}</div><p class="departure-option-meta">${escape(d.duration)}${d.capacity?.total!=null?` · ${d.capacity.total} personas`:''}</p></div><div class="departure-option-booking">${offerMarkup(trip,d)}<p class="departure-option-price">${fareMarkup(trip,d)}${d.price!==null?'<span>por persona</span>':''}</p>${departurePayment(d)}${registrationLink(trip,d)}<a class="departure-enquiry" data-whatsapp="${trip.id}" href="${wa(trip,departureMessage(trip,d))}" data-departure="${escape(d.id)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${escape(trip.name)}, ${escape(d.date)}, ${escape(levelLabel(trip))}, por WhatsApp">${full?'Consultar alternativas':'Tengo una duda'}</a></div></article>`;
 }).join('');
 return `<dialog class="departure-dialog" id="departure-dialog" aria-labelledby="departure-dialog-title" aria-describedby="departure-dialog-description"><div class="departure-dialog-heading"><div><p class="eyebrow">${escape(trip.name)} / SURFTRIP</p><h2 id="departure-dialog-title">Fechas.</h2></div><button class="departure-close" type="button">Cerrar <span aria-hidden="true">×</span></button></div><p id="departure-dialog-description" class="departure-dialog-intro">${escape(levelLabel(trip))} · Mismo programa en todas las fechas.</p><div class="departure-dialog-list">${options}</div><p class="departure-dialog-help">El PDF de cada fecha recoge su programa y condiciones. ¿Alguna duda? Puedes consultarnos antes de inscribirte.</p></dialog>`;
}

export function renderTrip(trip, trips = []){
const real=trip.state==='confirmed';
const departures=departuresFor(trip);
const multiple=departures.length>1;
const firstDeparture=departures[0];
const pricing=tripPriceDetails(trip);
const shownDeparture=pricing.departure;
const offer=real&&!isFull(trip)&&shownDeparture?.promotion;
const summaryTitle=trip.tagline && trip.tagline!==trip.name ? trip.tagline : real ? detailTitles[trip.slug]??'Tu próximo viaje empieza en el agua.' : trip.name;
const mood=tripMood(trip);
const cta=isFull(trip)?'Consultar viaje completo':real?'Consultar plaza':'Consultar destino';
const mainCta=isFull(trip)?'Consultar viaje completo':'Consultar por WhatsApp';
const team=real?trip.team:null;
const canRegister=!!registrationUrl(trip);
const sidebarFacts=all=>all.map(([k,v])=>[k,k==='Nivel de surf'?levelLabel(trip):k==='Fechas'&&multiple?`${departures.length} salidas`:v]);
const accompaniment=accompanimentItems(trip);
const description=real?`Surftrip a ${trip.name}. ${multiple?`${departures.length} fechas${isFull(trip)?' · Completo':' disponibles'}`:firstDeparture?.date??'Consulta las fechas'}. ${levelLabel(trip)}. Consulta el programa y las fechas${canRegister?' e inscríbete con el formulario':' de este viaje'}.`:`Conoce los viajes de surf de LST a ${trip.name}. ${levelLabel(trip)}. Próximas fechas y programa por anunciar. Consulta el destino por WhatsApp.`;
const allFacts=facts(trip);
const durationLabel=allFacts.find(([label])=>label==='Duración')[1];
const mobileOptions=!multiple&&(trip.dossier||departures.some(d=>d.dossier))?`<div class="mobile-booking-options">${dossier(trip)}</div>`:"";
const commercial=`<dl class="trip-facts">${trip.payment?.depositAmount!=null?`<div><dt>Señal</dt><dd>${formatPrice(trip.payment.depositAmount)}</dd></div>`:''}${trip.capacity?.total!=null?`<div><dt>Capacidad total</dt><dd>${trip.capacity.total} personas</dd></div>`:''}<div><dt>Disponibilidad</dt><dd>${escape(availabilityLabel(trip))}</dd></div></dl>${trip.payment?.terms?`<p class="fine-print">${escape(trip.payment.terms)}</p>`:''}<p class="fine-print">${canRegister?'La inscripción es una solicitud de plaza. El equipo revisa la disponibilidad y te indica cómo confirmar la reserva.':'La disponibilidad y las condiciones se confirman con el equipo antes de reservar.'}</p>`;
const photoSlides=trip.gallery.map(([img,alt,caption],i)=>`<figure class="photo-slide" aria-label="Foto ${i+1} de ${trip.gallery.length}"><img src="${escape(img)}" alt="${escape(alt)}" width="1000" height="600" loading="lazy" decoding="async"><figcaption>${escape(caption)}</figcaption></figure>`).join("\n");
const gallery=trip.gallery.map(([img,alt,caption],i)=>`<figure><button class="gallery-photo" type="button" data-photo="${i}" aria-label="Ampliar foto ${i+1}: ${escape(alt)}"><img src="${escape(img)}" alt="${escape(alt)}" width="1000" height="600" loading="lazy" decoding="async"><span aria-hidden="true">+</span></button><figcaption>${escape(caption)}</figcaption></figure>`).join('\n');
const story=trip.story.map(([title,copy],i)=>`<details class="plan-item"${i===0?' open':''}><summary><span class="plan-number" aria-hidden="true">0${i+1}</span><span>${escape(programmeTitle(trip,title,i))}</span><span class="plan-toggle" aria-hidden="true">+</span></summary><p>${escape(copy)}</p></details>`).join('\n');
const inclusions=(trip.includes?.length||trip.excludes?.length||trip.inclusionsNote)?`<section id="incluye" class="trip-block trip-costs"><p class="eyebrow">EL PRECIO, AL DETALLE</p><h2>Incluido y no incluido.</h2><div class="inclusion-grid">${trip.includes?.length?`<div class="inclusion-list" aria-labelledby="included-title"><h3 id="included-title"><span aria-hidden="true">✓</span> Incluido</h3><div class="inclusion-groups">${groupedInclusions(trip.includes)}</div></div>`:''}${trip.excludes?.length?`<div class="inclusion-list exclusion-list" aria-labelledby="excluded-title"><h3 id="excluded-title"><span aria-hidden="true">↗</span> No incluido</h3><ul>${trip.excludes.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></div>`:''}</div>${trip.inclusionsNote?`<p class="fine-print">${escape(trip.inclusionsNote)}</p>`:''}</section>`:`<section id="incluye" class="trip-block pending-program"><p class="eyebrow">LA PRÓXIMA SALIDA</p><h2>El programa, cuando esté cerrado.</h2><p>Publicaremos aquí las fechas, el alojamiento, las sesiones y el precio de la nueva salida a ${escape(trip.name)}. También podrás ver qué incluye y qué gastos van aparte.</p><dl class="pending-facts"><div><dt>Alojamiento y comidas</dt><dd>Por confirmar</dd></div><div><dt>Sesiones y actividades</dt><dd>Por confirmar</dd></div><div><dt>Material y traslados</dt><dd>Por confirmar</dd></div><div><dt>Precio y condiciones</dt><dd>Por confirmar</dd></div></dl><p class="fine-print">Las experiencias y fotos de viajes anteriores no constituyen el programa de la próxima salida.</p></section>`;
const stay=trip.stay?`<section id="alojamiento" class="trip-block stay-block${trip.stay.image?'':' stay-compact'}"><p class="eyebrow">EL ALOJAMIENTO</p><h2>${escape(trip.stay.title||'Dónde nos quedamos.')}</h2>${trip.stay.image?figure(trip.stay.image,trip.stay.alt,trip.stay.name):""}<p>${escape(stayCopy(trip.stay.text))}</p>${trip.stay.note?`<p class="fine-print">${escape(trip.stay.note)}</p>`:''}</section>`:'';
const related=trips.filter(t=>t.id!==trip.id).slice(0,3).map(t=>`<a class="related-trip" href="${url(t)}">${t.hero?`<img src="${escape(t.hero)}" alt="" width="1000" height="600" loading="lazy">`:""}<div><span>${escape(t.name)}</span><small>${t.state==='confirmed'?escape(departuresFor(t).length>1?'Varias salidas':departuresFor(t)[0]?.date??'Consultar fechas'):'Próximamente'}</small></div></a>`).join('');
return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#FFFAE7"><title>${escape(trip.name)} · Viaje de surf — Let’s Surf Together</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(trip.name)} · Let’s Surf Together"><meta property="og:description" content="${escape(description)}">${trip.hero?`<meta property="og:image" content="${escape(trip.hero)}">`:""}<meta property="og:url" content="${origin}${url(trip)}"><meta property="og:type" content="website"><link rel="icon" href="/assets/brand/symbol-orange.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/aura.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/trip.css"><link rel="stylesheet" href="/trip-detail.css"></head>
<body class="trip-page trip-designed" data-state="${trip.state}">
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="trip-header"><a class="brand" href="/" aria-label="Let’s Surf Together, inicio"><img src="/assets/brand/logo-black.svg" alt="Let’s Surf Together" width="774" height="126"></a><nav class="trip-header-nav" aria-label="Navegación principal"><a class="trip-back" href="/viajes/" aria-label="Ver todos los viajes">${arrow("left")} Viajes</a><a class="trip-header-levels" href="/niveles/">Niveles</a></nav>${bookingAction(trip,cta,'trip-header-cta')}</header>
<main id="contenido">
 <section class="trip-cover" aria-labelledby="trip-title">${trip.hero?`<img class="trip-cover-image" src="${escape(trip.hero)}" alt="${escape(trip.heroAlt)}" width="1000" height="600" fetchpriority="high" decoding="async">`:""}<div class="trip-cover-shade" aria-hidden="true"></div><div class="trip-cover-copy"><p class="eyebrow"><span class="trip-dot" aria-hidden="true"></span> ${escape(trip.place)} / SURFTRIP</p><p class="trip-cover-level">${escape(levelLabel(trip))}</p><h1 id="trip-title"${trip.name.length>11?' class="trip-title-long"':''}>${escape(trip.name)}</h1><p class="trip-cover-lead">${escape(summaryTitle)}</p>${real?`<div class="cover-key-facts"><span>${multiple?"Varias salidas":escape(firstDeparture?.date??'Consultar fechas')}</span><span>${escape(durationLabel)}</span></div>`:`<span class="trip-state">${status(trip)}</span>`}<a class="button trip-cover-cta" href="#reservar">${isFull(trip)?'Consultar alternativas':multiple?'Encuentra tu fecha':real?'Me apunto al plan':'Quiero saber más'}</a></div>${trip.gallery.length?`<button type="button" class="cover-photos" data-open-gallery aria-label="Ver las ${trip.gallery.length} fotos del viaje">Ver fotos <span>${trip.gallery.length}</span></button>`:""}</section>
 <div class="trip-manifesto"><span>Más que un surftrip.</span><span>Olas. Gente. Vida.</span><span>LET’S SURF TOGETHER <span aria-hidden="true">↗</span></span></div>
 <div class="trip-layout">
  <article class="trip-content">
   <section class="trip-summary" aria-labelledby="trip-summary-title"><p class="eyebrow">${real?'APAGA EL PILOTO AUTOMÁTICO':'EL PRÓXIMO PLAN'}</p><h2 id="trip-summary-title">${escape(mood[0])}</h2><p class="trip-kickoff">${escape(mood[1])}</p>${renderQuickFacts(trip)}<div class="trip-price-summary">${offerMarkup(trip,shownDeparture,{date:multiple})}<p class="trip-summary-price">${fareMarkup(trip,shownDeparture,{from:pricing.from})}<span>${shownDeparture?.price!=null?'por persona':'Consulta con el equipo'}</span></p><p class="trip-summary-price-note">${escape(offer?'Tarifa vigente para el cupo indicado. Confirmamos disponibilidad contigo.':summaryPrice(trip))}</p>${bookingAction(trip,cta,'button trip-summary-cta')}</div>${isFull(trip)?'<p class="trip-notice">Esta salida está completa. Consulta otras opciones con el equipo.</p>':''}${isFull(trip)&&multiple?`<dl class="trip-facts">${departures.map(d=>`<div><dt>${escape(d.date)}</dt><dd>${escape(d.duration)} · ${d.price!==null?formatPrice(d.price):'Consultar precio'} · Completo</dd></div>`).join('')}</dl>`:''}${mobileOptions}</section>
   <nav class="trip-section-nav" aria-label="En este viaje"><a href="#plan">Programa</a><a href="#nivel">Nivel de surf</a>${trip.stay?'<a href="#alojamiento">Alojamiento</a>':''}<a href="#incluye">Incluido / No incluido</a><a href="#reservar">${canRegister?'Inscripción':'Tu viaje'}</a></nav>
   ${experienceScenes(trip)}
   <section id="nivel" class="trip-block trip-level"><p class="eyebrow">TU GRUPO EN EL AGUA</p><div class="level-heading"><h2>${escape(levelLabel(trip))}</h2><p class="level-fixed-note">Tu punto de partida.</p></div><p>${escape(trip.levelText || trip.levelRequirement)}</p>${trip.levelRequirement&&trip.levelText&&trip.levelRequirement!==trip.levelText?`<p class="level-requirement"><strong>Para este viaje:</strong> ${escape(trip.levelRequirement)}</p>`:''}${trip.levelChecks?.length?`<ul>${trip.levelChecks.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`:''}<div class="level-actions"><a class="text-link" href="/niveles/">Ver la guía de niveles</a>${contact(trip,'Consultar mi nivel','button button-level',`¡Hola, LST! Me interesa ${trip.name}, pero quiero consultar si mi nivel de surf encaja. ¿Podéis orientarme?`)}</div>${trips.some(t=>t.slug===(trip.slug==='marruecos'?'marruecos-avanzado':trip.slug==='marruecos-avanzado'?'marruecos':''))?`<a class="trip-alternative" href="/viajes/${trip.slug==='marruecos'?'marruecos-avanzado':'marruecos'}/">${trip.slug==='marruecos'?'¿Ya tienes autonomía? Conoce Marruecos avanzado.':'¿Estás empezando? Conoce Marruecos I–II.'}</a>`:''}</section>
   <section class="trip-programme" id="plan" aria-label="Programa del viaje"><p class="eyebrow">EL PROGRAMA DEL VIAJE</p>${trip.story.length||trip.storyIntro?`<section class="trip-block"><h2>${escape(trip.storyTitle==='El programa.'?'Qué vamos a hacer.':trip.storyTitle)}</h2><p>${escape(trip.storyIntro)}</p><div class="plan-list">${story}</div></section>`:''}${trip.intro?trip.story.length||trip.storyIntro?`<details class="programme-context"><summary>Sobre este viaje <span aria-hidden="true">+</span></summary><p class="trip-intro">${escape(detailIntro(trip.intro))}</p></details>`:`<p class="trip-intro">${escape(detailIntro(trip.intro))}</p>`:''}${stay}
<section class="trip-block trip-team"><p class="eyebrow">QUIÉN TE ACOMPAÑA</p><h2>${escape(team?.title??(real?'Lucas va contigo.':'Viajamos en grupo.'))}</h2><p>${escape(team?.text??(real?'Lucas te acompaña durante el viaje, comparte las sesiones y está cerca para ayudarte a disfrutar del surf y del grupo.':`El próximo programa de ${trip.name} está pendiente. Publicaremos el acompañamiento junto con los detalles de la salida.`))}</p>${accompaniment.length ? `<ul class="trip-team-roles">${accompaniment.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>` : ''}<a class="text-link" href="/conocenos/#acompanamiento">Conoce al equipo de LST</a>${!real?contact(trip,'Consultar el acompañamiento','button button-small trip-team-contact',`¡Hola, LST! Me interesa ${trip.name}. ¿Qué acompañamiento está previsto para la próxima salida?`):''}</section>
</section>
   ${inclusions}
   ${trip.gallery.length?`<details class="trip-photo-file"><summary>Más fotos. Más ganas de ir. <span>${trip.gallery.length} fotos <span aria-hidden="true">+</span></span></summary><section class="trip-gallery" aria-labelledby="photos-title"><h2 id="photos-title">El álbum de ${escape(trip.name)}.</h2><div class="gallery-track" aria-label="Fotos del destino">${gallery}</div></section></details>`:''}
   <section id="dudas" class="trip-block trip-faq"><p class="eyebrow">LAS DUDAS ANTES DEL VIAJE</p><h2>Las dudas, fuera de la maleta.</h2>${trip.faqs.length?'':'<p>Viajar por tu cuenta, elegir nivel, preparar la mochila… Empieza por nuestras preguntas frecuentes o cuéntanos tu duda.</p><a class="text-link" href="/preguntas-frecuentes/">Resolver las dudas del viaje</a>'}<div class="faq-list">${trip.faqs.map(([q,a])=>`<details><summary>${escape(q)}<span aria-hidden="true">+</span></summary><p>${escape(a)}</p></details>`).join('')}</div></section>
   <section id="reservar" class="trip-block trip-reserve"><p class="eyebrow">${canRegister?'INSCRIPCIÓN AL VIAJE':real?'TU PRÓXIMO VIAJE':'PRÓXIMAS SALIDAS'}</p><h2>${isFull(trip)?'Nos vemos en otra ola.':canRegister?'¿Te vienes?':`¿Te apetece ${escape(trip.name)}?`}</h2><p>${isFull(trip)?'Esta salida está completa. Puedes consultar otras opciones con el equipo.':canRegister?multiple?'Elige la fecha que te encaje y completa el formulario de inscripción.':'Completa el formulario de inscripción para solicitar tu plaza en el viaje.':real?'Consulta la disponibilidad y las condiciones de esta salida con el equipo.':'Consulta las próximas fechas y el programa con el equipo.'}</p>${bookingAction(trip,mainCta,'button reserve-main')}<p class="fine-print">${canRegister?'La inscripción no confirma la reserva. El equipo revisará tu solicitud y te indicará los siguientes pasos.':'La consulta no confirma una reserva.'}</p><details class="booking-conditions"><summary>Pago y confirmación de la plaza <span aria-hidden="true">+</span></summary>${commercial}${trip.notice?`<p class="trip-notice">${escape(isFull(trip)?'Esta salida está completa. Consulta otras opciones con el equipo.':trip.notice)}</p>`:''}</details>${multiple?`<noscript><style>.trip-designed [data-open-dates],.trip-designed [data-open-gallery],.trip-designed .gallery-photo>span{display:none}</style><section id="fechas-sin-javascript" class="trip-native-dates"><h2>Fechas</h2>${departures.map(d=>`<article><h3>${escape(d.date)}</h3>${dateDossier(d)}${offerMarkup(trip,d)}<p>${fareMarkup(trip,d)}</p>${departurePayment(d)}${registrationLink(trip,d)}${contact(trip,isFull(trip)||isFull(d)?'Consultar alternativas':'Consultar esta fecha','button',departureMessage(trip,d))}</article>`).join('')}</section></noscript>`:''}</section>
  </article>
  <aside class="trip-booking" aria-label="${real?'Consultar este viaje':'Consultar la próxima salida'}"><div class="booking-card"><p class="eyebrow">${status(trip)}</p><h2>¿Te vienes<br>o qué?</h2>${offerMarkup(trip,shownDeparture,{date:multiple})}<p class="booking-card-price">${fareMarkup(trip,shownDeparture,{from:pricing.from})}</p><p class="booking-card-price-note">${escape(offer?'Por persona · tarifa vigente para el cupo indicado':summaryPrice(trip))}</p><dl>${sidebarFacts(allFacts).map(([k,v])=>`<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl>${bookingAction(trip,cta,"button booking-card-cta")}${dossier(trip)}<p class="booking-card-help">${canRegister?'Inscríbete con el formulario. Revisaremos tu solicitud antes de confirmar la plaza.':'Consulta las próximas salidas con el equipo.'}</p><a class="booking-card-link" href="#dudas">Tengo una duda</a></div></aside>
 </div>
 <section class="related-section"><div class="trip-shell"><p class="eyebrow">SIGUE MIRANDO</p><h2>Siempre hay otra ola.</h2><div class="related-list">${related}</div><a class="text-link" href="/#viajes">Ver todos los viajes</a></div></section>
</main>
<footer class="trip-footer trip-shell"><a class="brand" href="/"><img src="/assets/brand/logo-black.svg" alt="Let’s Surf Together" width="774" height="126" loading="lazy"></a><div><a href="https://www.instagram.com/letsurftogether/" target="_blank" rel="noopener">@letsurftogether</a><a href="/conocenos/">Conócenos</a><a href="/preguntas-frecuentes/">FAQs</a><a href="/#experiencia">La experiencia</a><a href="/#reservar">Cómo reservar</a></div><p>© 2026 LET’S SURF TOGETHER</p></footer>
<div class="trip-dock" aria-label="Fechas e inscripción"><div>${offer?`<span class="dock-offer">${escape(shownDeparture.promotion.label)} · ${escape(promotionCondition(shownDeparture.promotion))}</span>`:''}${isFull(trip)?'<strong>Completo</strong>':real?`<p class="dock-price">${fareMarkup(trip,shownDeparture,{from:pricing.from})}</p>`:'<strong>Próximamente</strong>'}<span>${real?`por persona · ${escape(offer?shownDeparture.duration:durationLabel)}`:'Fechas por anunciar'}</span></div>${bookingAction(trip,cta,'button dock-cta')}</div>
<dialog class="photo-dialog" aria-labelledby="photo-title"><div class="photo-heading"><div><p id="photo-title">Fotos de ${escape(trip.name)}</p><p class="photo-instruction">Desliza para ver más</p></div><button class="photo-close" type="button" aria-label="Cerrar fotos">Cerrar</button></div><div class="photo-strip" tabindex="0" role="region" aria-label="Galería de fotos, desplazamiento horizontal">${photoSlides}</div><div class="photo-controls"><button type="button" data-photo-prev aria-label="Foto anterior">Anterior</button><span class="photo-counter" aria-live="polite" aria-atomic="true">1 / ${trip.gallery.length}</span><button type="button" data-photo-next aria-label="Foto siguiente">Siguiente</button></div></dialog>
${dateDialog(trip)}

<script src="/trip.js" type="module"></script></body></html>
`.replace(/[ \t]+$/gm, '');
}
