// Runs the real dist/analytics.js against the published pages, with a minimal DOM instead of a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {renderTrip} from './render-trips.mjs';

const source = await readFile('dist/analytics.js', 'utf8');
const ID = 'G-ABC123XYZ';
const HOST = 'www.letssurftogether.com';

// --- Minimal DOM: only what analytics.js asks of the page -------------------------------------
const VOID = new Set(['meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'track']);
class Element {
  constructor(tag, attrs, parent) { Object.assign(this, {tag, attrs, parent}); }
  get dataset() {
    return Object.fromEntries(Object.entries(this.attrs).filter(([k]) => k.startsWith('data-'))
      .map(([k, v]) => [k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase()), v]));
  }
  matches(selector) {
    return selector.split(',').some(part => {
      const steps = part.trim().split(/\s+/);
      const last = steps.pop();
      if (!simple(this, last)) return false;
      let node = this.parent;
      for (const step of steps.reverse()) {
        while (node && !simple(node, step)) node = node.parent;
        if (!node) return false;
        node = node.parent;
      }
      return true;
    });
  }
  closest(selector) {
    for (let node = this; node; node = node.parent) if (node.matches(selector)) return node;
    return null;
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
}
function simple(el, compound) {
  return [...compound.matchAll(/\*|^[a-z]+|\.[\w-]+|#[\w-]+|\[[\w-]+\]/g)].every(([token]) => {
    if (token === '*') return true;
    if (token[0] === '.') return (el.attrs.class ?? '').split(/\s+/).includes(token.slice(1));
    if (token[0] === '#') return el.attrs.id === token.slice(1);
    if (token[0] === '[') return token.slice(1, -1) in el.attrs;
    return el.tag === token;
  });
}
function parse(html) {
  const all = [];
  let current = null;
  for (const [, close, tag, rawAttrs] of html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g)) {
    const name = tag.toLowerCase();
    if (close) {
      for (let node = current; node; node = node.parent) if (node.tag === name) { current = node.parent; break; }
      continue;
    }
    const attrs = {};
    for (const [, key, value] of rawAttrs.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[key] = value ?? '';
    const el = new Element(name, attrs, current);
    all.push(el);
    if (!VOID.has(name)) current = el;
  }
  return all;
}

// --- A page with consent already given, unless told otherwise ---------------------------------
// `session` stands for the tab's session storage: share one Map between pages of the same visit; null blocks it.
function open({page = {page_type: 'home'}, html = '', hostname = HOST, cookie = '', consent = true, url = `https://${hostname}/`, referrer = '', session = new Map()} = {}) {
  const blocked = () => { throw Error('blocked'); };
  const listeners = {};
  const listen = (type, fn) => (listeners[type] ??= []).push(fn);
  const store = new Map(consent === null ? [] : [['lst-consent', JSON.stringify({analytics: consent, version: 1, date: '2026-11-21'})]]);
  const elements = parse(html);
  const consentButton = {hidden: true, addEventListener: (type, fn) => { consentButton.click = fn; }};
  let notice = null;
  const window = {
    lstAnalytics: {id: ID, host: HOST, page},
    Element,
    location: {hostname, href: url, search: new URL(url).search},
    URL, URLSearchParams,
    history: {state: null, replaceState(state, title, address) { window.location.href = String(address); window.location.search = new URL(String(address)).search; }},
    localStorage: {getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value)},
    sessionStorage: session
      ? {getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key)}
      : {getItem: blocked, setItem: blocked, removeItem: blocked},
    document: {
      readyState: 'complete', cookie, referrer,
      head: {append() {}}, body: {append(node) { notice = node; }},
      addEventListener: listen,
      querySelectorAll: selector => selector === '[data-consent-open]' ? [consentButton] : [],
      createElement: () => ({setAttribute() {}, remove() { notice = null; }, querySelector: () => ({focus() {}}), addEventListener(type, fn) { this.click = fn; }})
    }
  };
  window.window = window;
  vm.runInNewContext(source, window);
  const calls = () => Array.from(window.dataLayer ?? [], args => [...args]); // Copies: the script's arrays belong to another realm.
  return {
    elements,
    cookie: () => window.document.cookie,
    address: () => window.location.href,
    config: () => ({...calls().find(([command, id]) => command === 'config' && id === ID)?.[2]}),
    events: () => calls().filter(([command]) => command === 'event').map(([, name, params]) => ({name, ...params})),
    click(target) { for (const fn of listeners.click ?? []) fn({target}); },
    dispatch(type, detail) { for (const fn of listeners[type] ?? []) fn({detail}); },
    choose(answer) {
      if (!notice) consentButton.click();
      notice.click({target: new Element('button', {'data-consent': answer}, null)});
    }
  };
}
const el = (tag, attrs, parent = null) => new Element(tag, attrs, parent);
const trip = {page_type: 'trip', destination_slug: 'maldivas'};

// --- Common parameters ------------------------------------------------------------------------
test('every hit carries the page type, the trip of the page and who is visiting; loading a page sends no event of its own', () => {
  const site = open({page: trip});
  assert.deepEqual(site.config(), {traffic_type: 'external', page_type: 'trip', destination_slug: 'maldivas'});
  assert.deepEqual(site.events(), []); // The page view is GA4's own and already carries all of it.
  assert.deepEqual(open().config(), {traffic_type: 'external', page_type: 'home'});
});

test('only the public domain counts as external traffic; anything else is developer and flagged for debug', () => {
  assert.equal(open().config().traffic_type, 'external');
  assert.equal('debug_mode' in open().config(), false);
  assert.equal(open({hostname: 'letssurftogether.com'}).config().traffic_type, 'external');
  for (const hostname of ['lst-sepia.vercel.app', 'localhost']) {
    const config = open({hostname}).config();
    assert.equal(config.traffic_type, 'developer');
    assert.equal(config.debug_mode, true);
  }
});

test('the team marks its own visits with a cookie and they are reported as internal', () => {
  const config = open({cookie: 'other=1; lst_analytics_internal=1'}).config();
  assert.equal(config.traffic_type, 'internal');
  assert.equal(config.debug_mode, true);
  assert.equal(open({cookie: 'lst_analytics_internal=0'}).config().traffic_type, 'external');
});

test('the team marks or unmarks a browser by opening a link once', () => {
  const marked = open({url: `https://${HOST}/?equipo=1`});
  assert.equal(marked.config().traffic_type, 'internal');
  assert.equal(marked.cookie(), 'lst_analytics_internal=1; path=/; max-age=31536000; SameSite=Lax; Secure');
  const unmarked = open({url: `https://${HOST}/?equipo=0`, cookie: 'lst_analytics_internal=1'});
  assert.equal(unmarked.config().traffic_type, 'external');
  assert.equal(unmarked.cookie(), 'lst_analytics_internal=; path=/; max-age=0; SameSite=Lax; Secure');
  assert.equal(open({url: `https://${HOST}/?equipo=si`}).config().traffic_type, 'external');
});

test('the team link does not stay in the address, so it cannot be passed on by copying it', () => {
  const marked = open({url: `https://${HOST}/viajes/?equipo=1&nivel=2#mes`});
  assert.equal(marked.address(), `https://${HOST}/viajes/?nivel=2#mes`);
  assert.equal(open({url: `https://${HOST}/?equipo=0`}).address(), `https://${HOST}/`);
  assert.equal(open({url: `https://${HOST}/?equipo=si`}).address(), `https://${HOST}/?equipo=si`);
});

// --- Where the visit came from, kept until the visitor chooses ---------------------------------
const AD = `https://${HOST}/?utm_source=ig&utm_medium=paid_social&utm_campaign=maldivas&utm_id=123&fbclid=x`;
const LABELS = 'utm_source=ig&utm_medium=paid_social&utm_campaign=maldivas&utm_id=123';

test('a visit that accepts on a later page keeps its campaign and the site it came from', () => {
  const session = new Map();
  open({consent: null, url: AD, referrer: 'https://l.instagram.com/', session});
  const later = open({consent: null, page: trip, url: `https://${HOST}/viajes/maldivas/?salida=a#fechas`, referrer: `https://${HOST}/`, session});
  later.choose('accept');
  assert.equal(later.config().page_location, `https://${HOST}/viajes/maldivas/?salida=a&${LABELS}#fechas`);
  assert.equal(later.config().page_referrer, 'https://l.instagram.com/');
  assert.equal(session.size, 0);
});

test('accepting on the page of arrival overrides nothing: GA4 already sees the address', () => {
  const session = new Map();
  const site = open({consent: null, url: AD, referrer: 'https://l.instagram.com/', session});
  site.choose('accept');
  assert.equal('page_location' in site.config(), false);
  assert.equal('page_referrer' in site.config(), false);
  assert.equal(session.size, 0);
});

test('only the first page is noted, and only campaign labels and outside sites', () => {
  const session = new Map();
  open({consent: null, url: `https://${HOST}/?nivel=2`, referrer: `https://${HOST}/viajes/`, session});
  assert.equal(session.size, 0);
  open({consent: null, url: AD, referrer: 'https://www.google.com/', session});
  open({consent: null, url: `https://${HOST}/?utm_source=other`, referrer: 'https://example.org/', session});
  assert.deepEqual(JSON.parse(session.get('lst-entry')), {query: LABELS, referrer: 'https://www.google.com/'});
});

test('rejecting forgets the origin, and a visitor who already chose is never noted', () => {
  const session = new Map();
  const site = open({consent: null, url: AD, session});
  assert.equal(session.size, 1);
  site.choose('reject');
  assert.equal(session.size, 0);
  const returning = open({consent: true, url: AD, session});
  assert.equal('page_location' in returning.config(), false);
  open({consent: false, url: AD, session});
  assert.equal(session.size, 0);
});

test('a browser that blocks or garbles session storage is still measured', () => {
  const blocked = open({consent: null, page: trip, url: AD, session: null});
  blocked.choose('accept');
  assert.equal(blocked.config().page_type, 'trip');
  const garbled = open({consent: null, session: new Map([['lst-entry', '{bad']])});
  garbled.choose('accept');
  assert.equal(garbled.config().page_type, 'home'); // Measured all the same...
  assert.equal('page_location' in garbled.config(), false); // ...only without the kept origin.
});

test('a choice made in another tab uses the note once and erases it', () => {
  const session = new Map([['lst-entry', JSON.stringify({query: LABELS, referrer: 'https://l.instagram.com/'})]]);
  const accepted = open({consent: true, page: trip, url: `https://${HOST}/viajes/maldivas/`, referrer: `https://${HOST}/`, session});
  assert.equal(accepted.config().page_location, `https://${HOST}/viajes/maldivas/?${LABELS}`);
  assert.equal(session.size, 0);
  const rejected = new Map([['lst-entry', JSON.stringify({query: LABELS, referrer: ''})]]);
  open({consent: false, url: `https://${HOST}/`, session: rejected});
  assert.equal(rejected.size, 0);
});

// --- Events -----------------------------------------------------------------------------------
test('going to the registration form reports the button; the trip comes with every hit of the page', () => {
  const site = open({page: trip});
  site.click(el('a', {'data-registration': '', class: 'button reserve-main'}));
  const {name, cta_location, ...rest} = site.events().at(-1);
  assert.deepEqual([name, cta_location], ['registration_click', 'reserve']);
  assert.deepEqual(rest, {traffic_type: 'external', page_type: 'trip', destination_slug: 'maldivas'});
});

test('opening the dates and the PDF are their own events, with the place of the button', () => {
  const site = open({page: trip});
  site.click(el('button', {'data-open-dates': '', class: 'button trip-header-cta'}));
  site.click(el('a', {class: 'dossier-link', href: 'https://example.com/programa.pdf'}));
  assert.deepEqual(site.events().map(e => [e.name, e.cta_location]), [['dates_open', 'header'], ['pdf_click', 'trip_info']]);
});

test('every WhatsApp contact is one event, the FAQ button included, told apart by its place', async () => {
  const site = open({page: {page_type: 'faq'}, html: await readFile('dist/preguntas-frecuentes/index.html', 'utf8')});
  const links = site.elements.filter(e => e.matches('a[data-whatsapp]'));
  site.click(links.find(e => e.matches('.faq-help *')));
  site.click(links.find(e => e.matches('.lst-nav-contact')));
  assert.deepEqual(site.events().map(e => [e.name, e.cta_location]), [['whatsapp_click', 'faq'], ['whatsapp_click', 'header']]);
});

test('a WhatsApp click on a trip page names the trip; outside a trip it does not', () => {
  const onTrip = open({page: trip});
  onTrip.click(el('a', {'data-whatsapp': 'maldivas', class: 'reserve-whatsapp'}));
  assert.equal(onTrip.events().at(-1).destination_slug, 'maldivas');
  const home = open();
  home.click(el('a', {'data-whatsapp': 'orientacion'}, el('footer', {})));
  assert.equal('destination_slug' in home.events().at(-1), false);
});

test('nothing is reported after consent is withdrawn', () => {
  const site = open({page: trip});
  site.choose('reject');
  site.click(el('a', {'data-registration': '', class: 'button reserve-main'}));
  assert.deepEqual(site.events(), []);
});

// Full trips and trips without dates swap the booking buttons for a WhatsApp enquiry in the same places.
test('a trip that cannot be booked online reports its main buttons in the same places', async () => {
  // No published trip is always in this state, so a published one is rendered without dates ("próximamente").
  const {trips} = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8'));
  const pending = {...trips.find(t => t.slug === 'el-palmar'), state: 'upcoming', availability: 'enquiry', departures: []};
  const site = open({page: {page_type: 'trip', destination_slug: 'el-palmar'}, html: renderTrip(pending, trips)});
  const located = selector => {
    site.click(site.elements.find(e => e.matches(`a[data-whatsapp]${selector}`)));
    return site.events().at(-1).cta_location;
  };
  assert.equal(located('.trip-header-cta'), 'header');
  assert.equal(located('.reserve-main'), 'reserve');
  assert.equal(located('.booking-card-cta'), 'reserve');
  assert.equal(located('.dock-cta'), 'mobile_bar');
  assert.equal(located('.trip-team-contact'), 'trip_info');
});

test('registration, dates and PDF buttons only count on a trip; WhatsApp counts everywhere', () => {
  const site = open({page: {page_type: 'home'}});
  site.click(el('a', {'data-registration': '', class: 'reserve-main'}));
  site.click(el('button', {'data-open-dates': '', class: 'trip-header-cta'}));
  site.click(el('a', {class: 'dossier-link'}));
  assert.deepEqual(site.events(), []);
  site.click(el('a', {'data-whatsapp': 'orientacion'}, el('footer', {})));
  assert.deepEqual(site.events().map(e => e.name), ['whatsapp_click']);
});

test('finishing the level test reports the level, from 1 to 4 and nothing else', () => {
  const site = open({page: {page_type: 'levels'}});
  for (const level of [1, 4, 0, 5, 2.3, '2']) site.dispatch('lst:level-test', {level});
  site.dispatch('lst:level-test');
  assert.deepEqual(site.events().map(e => [e.name, e.surf_level, e.page_type]),
    [['level_test_complete', '1', 'levels'], ['level_test_complete', '4', 'levels']]);
});

test('links to Instagram and to the WhatsApp group are community clicks, apart from contact', async () => {
  const site = open({html: await readFile('dist/index.html', 'utf8')});
  site.click(site.elements.find(e => e.matches('.lst-footer-ig')));
  site.click(el('a', {href: 'https://chat.whatsapp.com/abc', class: 'button'}));
  site.click(el('a', {href: 'https://example.com/instagram.com'}));
  site.click(el('a', {href: '#test'}));
  site.click(el('a', {'data-whatsapp': 'orientacion', href: 'https://wa.me/34600000000'}, el('footer', {})));
  assert.deepEqual(site.events().map(e => [e.name, e.link_type, e.cta_location]), [
    ['social_click', 'instagram', undefined], ['social_click', 'whatsapp_group', undefined], ['whatsapp_click', undefined, 'footer']]);
  assert.ok(site.events().every(e => e.traffic_type === 'external' && e.page_type === 'home'));
});

// --- Every measurable button of the published site has a known place ----------------------------
async function pages(dir = 'dist') {
  const found = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) found.push(...await pages(path.join(dir, entry.name)));
    else if (entry.name === 'index.html') found.push(path.join(dir, entry.name));
  }
  return found;
}
const published = JSON.parse(await readFile('dist/catalog-snapshot.json', 'utf8')).trips;
const {analyticsPage} = await import('./analytics.mjs');

// The eleven places the report shows (README and design document list the same).
const PLACES = ['closing', 'departure', 'faq', 'footer', 'header', 'help', 'levels', 'mobile_bar', 'registration', 'reserve', 'trip_info'];

// Where each kind of button really is. The wildcard selectors make a wrong order land in a plausible place,
// so the pairs where the table's order decides are pinned here by name.
const PLACE_CASES = [
  ['dist/viajes/maldivas/index.html', 'a.group-fit-contact', 'trip_info'], // Also inside #nivel
  ['dist/viajes/maldivas/index.html', 'button.essential-dates', 'departure'], // Also inside .trip-summary
  ['dist/viajes/maldivas/index.html', 'a.departure-dossier', 'departure'], // Also a .dossier-link
  ['dist/viajes/maldivas/index.html', 'a.departure-enquiry', 'departure'],
  ['dist/viajes/maldivas/index.html', 'button.trip-header-cta', 'header'],
  ['dist/inscripciones/maldivas/index.html', 'a.rg-whatsapp', 'registration'],
  ['dist/niveles/index.html', 'a[data-guide-enquiry]', 'levels'],
  ['dist/index.html', '.hp-how a[data-whatsapp]', 'help'],
  ['dist/index.html', '.hp-close a[data-whatsapp]', 'closing'],
  ['dist/index.html', 'a.hp-bar-wa', 'mobile_bar'],
  ['dist/index.html', 'footer a[data-whatsapp]', 'footer'],
  ['dist/viajes/index.html', '.ct-help a[data-whatsapp]', 'help'],
  ['dist/preguntas-frecuentes/index.html', '.faq-help a[data-whatsapp]', 'faq'],
  ['dist/conocenos/index.html', 'a.lst-nav-contact', 'header']
];
test('each kind of button reports the place it is in, including where the order of the table decides', async () => {
  for (const [file, selector, expected] of PLACE_CASES) {
    const folder = path.relative('dist', path.dirname(file)).split(path.sep).join('/');
    const site = open({page: analyticsPage(folder ? `/${folder}/` : '/', published), html: await readFile(file, 'utf8')});
    const target = site.elements.find(e => e.matches(selector));
    assert.ok(target, `${selector} must exist in ${file}`);
    site.click(target);
    assert.equal(site.events().at(-1)?.cta_location, expected, `${selector} in ${file}`);
  }
});

test('no button of the published pages is reported as unclassified', async () => {
  const unclassified = [];
  let measured = 0;
  const seen = new Set();
  const dropped = [];
  for (const file of await pages()) {
    const folder = path.relative('dist', path.dirname(file)).split(path.sep).join('/');
    const site = open({page: analyticsPage(folder ? `/${folder}/` : '/', published), html: await readFile(file, 'utf8')});
    const before = site.events().length;
    const clickable = site.elements.filter(e => e.matches('a[data-whatsapp], a[data-registration], [data-open-dates], a.dossier-link'));
    for (const element of clickable) site.click(element);
    // A button that sends nothing is as bad as one in the wrong place: nothing would ever show it.
    if (site.events().length - before !== clickable.length) dropped.push(`${file}: ${clickable.length} buttons, ${site.events().length - before} events`);
    for (const event of site.events().slice(before)) {
      measured++;
      seen.add(event.cta_location);
      if (event.cta_location === 'unclassified' || !event.cta_location) unclassified.push(`${file} ${event.name} ${event.destination_slug ?? event.page_type}`);
    }
  }
  assert.ok(measured > 150, `expected the published buttons to be measured, got ${measured}`);
  assert.deepEqual(unclassified, []);
  assert.deepEqual(dropped, []);
  assert.deepEqual([...seen].sort(), PLACES.slice().sort(), 'the places in use are the documented ones');
});

// --- Registration form ------------------------------------------------------------------------
test('an accepted registration is a lead, with the departure chosen', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'maldivas'}});
  for (const start of ['2027-03-21', 'ana@example.com', '2027-3-1', 'maldivas-2027-03-21']) site.dispatch('lst:registration-accepted', {start});
  site.dispatch('lst:registration-accepted');
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug, e.trip_id]), [
    ['generate_lead', 'maldivas', 'maldivas-2027-03-21'],
    ...Array(4).fill(['generate_lead', 'maldivas', undefined])]);
});

// The code sent to GA4 is the trip plus the start date: readable whatever key the CMS gives a departure.
test('every departure offered on a published form carries the date its code is built from', async () => {
  let offered = 0;
  for (const file of (await pages()).filter(f => f.split(path.sep).includes('inscripciones'))) {
    for (const radio of parse(await readFile(file, 'utf8')).filter(e => e.tag === 'input' && e.attrs.name === 'VIAJE_SURF')) {
      offered++;
      assert.match(radio.attrs['data-departure-start'] ?? '', /^\d{4}-\d{2}-\d{2}$/, file);
    }
  }
  assert.ok(offered > 0, 'expected published forms with departures');
});

test('reaching a later step of the form is reported with a controlled step number', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'senegal'}});
  for (const step of [2, 3, 5, 1, 6, '3', 2.5]) site.dispatch('lst:registration-step', {step});
  site.dispatch('lst:registration-step');
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug, e.form_step]),
    [2, 3, 5].map(step => ['registration_step', 'senegal', String(step)]));
});

// A renamed fact would silently stop being measured: both sides must use the same name.
const ANNOUNCED = {
  'dist/registration.js': ['lst:registration-step', 'lst:registration-accepted', 'lst:registration-failed'],
  'dist/home.js': ['lst:level-test'], 'dist/levels.js': ['lst:level-test']
};
test('the pages announce facts with the names this script listens for', async () => {
  for (const [file, names] of Object.entries(ANNOUNCED)) {
    const text = await readFile(file, 'utf8');
    for (const name of names) {
      assert.ok(text.includes(`CustomEvent('${name}'`), `${file} must announce ${name}`);
      assert.ok(source.includes(`addEventListener('${name}'`), `analytics.js must listen for ${name}`);
    }
  }
});

test('a failed registration reports why, from a closed list and never from messages', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'senegal'}});
  const cases = [
    [{status: 429}, 'rate_limited'], [{status: 503}, 'provider_unavailable'], [{status: 400}, 'provider_rejected'],
    [{fields: true}, 'validation'], [{fields: false}, 'provider_rejected'],
    [{error: 'TimeoutError'}, 'timeout'], [{error: 'TypeError'}, 'network'],
    [{error: 'SyntaxError'}, 'unknown'], [{message: 'ana@example.com no es válido'}, 'unknown'], [undefined, 'unknown']
  ];
  for (const [detail] of cases) site.dispatch('lst:registration-failed', detail);
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug, e.error_category]),
    cases.map(([, category]) => ['registration_error', 'senegal', category]));
});

test('a field Brevo refused is reported by its form name, from a closed list', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'senegal'}});
  const fields = ['EMAIL', 'WHATSAPP', 'FECHADENACIMIENTO', 'ana@example.com', 'email', 'EMAIL: no es válido', 'OTRO_CAMPO', 42, undefined];
  for (const field of fields) site.dispatch('lst:registration-failed', {fields: true, field});
  assert.deepEqual(site.events().map(e => [e.error_category, e.error_field]),
    fields.map((field, i) => ['validation', i < 3 ? field : undefined]));
});

test('every field of the published form can be reported when Brevo refuses it', async () => {
  const html = await readFile('dist/inscripciones/el-palmar/index.html', 'utf8');
  const names = new Set([...html.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([A-Z][A-Z0-9_]*)"/g)].map(([, name]) => name));
  names.delete('WHATSAPP__COUNTRY_CODE'); // Reported as WHATSAPP: the prefix and the number are one answer.
  assert.ok(names.has('EMAIL') && names.has('FECHADENACIMIENTO'));
  for (const name of names) assert.ok(source.includes(`'${name}'`), `analytics.js must list ${name}`);
});
