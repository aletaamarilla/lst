// Runs the real dist/analytics.js against the published pages, with a minimal DOM instead of a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';

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
function open({page = {page_type: 'home'}, html = '', hostname = HOST, cookie = '', consent = true} = {}) {
  const listeners = {};
  const listen = (type, fn) => (listeners[type] ??= []).push(fn);
  const store = new Map(consent === null ? [] : [['lst-consent', JSON.stringify({analytics: consent, version: 1, date: '2026-11-21'})]]);
  const elements = parse(html);
  const consentButton = {hidden: true, addEventListener: (type, fn) => { consentButton.click = fn; }};
  let notice = null;
  const window = {
    lstAnalytics: {id: ID, host: HOST, page},
    Element,
    location: {hostname},
    localStorage: {getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value)},
    document: {
      readyState: 'complete', cookie,
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
test('page views and every event carry the common standard parameters, with the version as text', () => {
  const site = open({page: trip});
  const common = {measurement_version: '1', traffic_type: 'external', page_type: 'trip'};
  assert.deepEqual(site.config(), common);
  const [view] = site.events();
  assert.deepEqual(view, {name: 'destination_view', ...common, destination_slug: 'maldivas'});
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

// --- Events -----------------------------------------------------------------------------------
test('going to the registration form reports who takes the booking', () => {
  const site = open({page: trip});
  site.click(el('a', {'data-registration': '', class: 'button reserve-main'}));
  const event = site.events().at(-1);
  assert.equal(event.name, 'destination_booking_click');
  assert.equal(event.booking_provider, 'own_form');
  assert.equal(event.cta_location, 'reserve');
});

test('the WhatsApp button that closes the FAQ page is a FAQ contact, the header one is not', async () => {
  const site = open({page: {page_type: 'faq'}, html: await readFile('dist/preguntas-frecuentes/index.html', 'utf8')});
  const links = site.elements.filter(e => e.matches('a[data-whatsapp]'));
  const help = links.find(e => e.matches('.faq-help *'));
  const header = links.find(e => e.matches('.lst-nav-contact'));
  site.click(help);
  site.click(header);
  const [faq, other] = site.events();
  assert.deepEqual([faq.name, faq.cta_location, faq.whatsapp_topic], ['faq_contact_click', 'faq_contact', undefined]);
  assert.deepEqual([other.name, other.cta_location], ['whatsapp_click', 'header_whatsapp']);
});

test('a trip view is counted once per page, even if consent is withdrawn and given again', () => {
  const site = open({page: trip, consent: null});
  assert.equal(site.events().length, 0);
  site.choose('accept');
  site.choose('reject');
  site.choose('accept');
  assert.deepEqual(site.events().map(e => e.name), ['destination_view']);
});

test('nothing is reported after consent is withdrawn', () => {
  const site = open({page: trip});
  site.choose('reject');
  site.click(el('a', {'data-registration': '', class: 'button reserve-main'}));
  assert.deepEqual(site.events().map(e => e.name), ['destination_view']);
});

// Full trips and trips without dates swap the booking buttons for a WhatsApp enquiry in the same places.
test('a trip that cannot be booked online reports its main buttons as enquiries', async () => {
  const site = open({page: {page_type: 'trip', destination_slug: 'hossegor'}, html: await readFile('dist/viajes/hossegor/index.html', 'utf8')});
  const located = selector => {
    site.click(site.elements.find(e => e.matches(`a[data-whatsapp]${selector}`)));
    return site.events().at(-1).cta_location;
  };
  assert.equal(located('.trip-header-cta'), 'header_enquiry');
  assert.equal(located('.reserve-main'), 'reserve_enquiry');
  assert.equal(located('.booking-card-cta'), 'booking_card_enquiry');
  assert.equal(located('.dock-cta'), 'mobile_dock_enquiry');
  assert.equal(located('.trip-team-contact'), 'team_whatsapp');
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

test('no button of the published pages is reported as unclassified', async () => {
  const unclassified = [];
  let measured = 0;
  for (const file of await pages()) {
    const folder = path.relative('dist', path.dirname(file)).split(path.sep).join('/');
    const site = open({page: analyticsPage(folder ? `/${folder}/` : '/', published), html: await readFile(file, 'utf8')});
    const before = site.events().length;
    for (const element of site.elements.filter(e => e.matches('a[data-whatsapp], a[data-registration], [data-open-dates], a.dossier-link'))) site.click(element);
    for (const event of site.events().slice(before)) {
      measured++;
      if (event.cta_location === 'unclassified' || !event.cta_location) unclassified.push(`${file} ${event.name} ${event.whatsapp_topic ?? event.destination_slug}`);
    }
  }
  assert.ok(measured > 150, `expected the published buttons to be measured, got ${measured}`);
  assert.deepEqual(unclassified, []);
});

// --- Registration form ------------------------------------------------------------------------
test('an accepted registration is reported with its trip', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'senegal'}});
  site.dispatch('lst:registration-accepted');
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug]), [['registration_form_accepted', 'senegal']]);
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
    cases.map(([, category]) => ['registration_form_error', 'senegal', category]));
});
