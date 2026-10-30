import test from 'node:test';
import assert from 'node:assert/strict';

let instance = 0;
async function catalogue(t, query = '', cards = ['1 2', '3', '4']) {
  const original = Object.fromEntries(['document', 'location', 'history', 'window'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => {
    for (const [key, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  let url = new URL('https://lst.test/viajes/' + query);
  const events = new Map();
  const element = extra => Object.defineProperties({hidden: false, addEventListener(type, fn) { events.set(this.id + ':' + type, fn); }}, Object.getOwnPropertyDescriptors(extra));
  const labels = {'': 'Todos los niveles', 1: 'I · Rookies', 2: 'II · Aprendices', 3: 'III · Riders', 4: 'IV · Supercracks'};
  const level = element({id: 'level', value: '', get selectedOptions() { return [{textContent: labels[this.value]}]; }, focus(options) { this.focused = options; }});
  const clear = element({id: 'clear'});
  const emptyClear = element({id: 'empty-clear'});
  const empty = element({contains: button => button === emptyClear});
  const controls = element({hidden: true});
  const status = element({textContent: ''});
  const trips = cards.map(levels => element({dataset: {levels}}));
  const elements = {'[data-catalog-filters]': controls, '#catalog-level': level, '#catalog-status': status, '#catalog-empty': empty};
  const entries = [url.href];
  let cursor = 0, popstate;
  Object.assign(globalThis, {
    document: {querySelector: selector => elements[selector] || null, querySelectorAll: selector => selector === '[data-catalog-trip]' ? trips : [clear, emptyClear]},
    location: {get search() { return url.search; }, get href() { return url.href; }},
    history: {pushState(_state, _title, next) { url = new URL(next); entries.splice(++cursor); entries.push(url.href); }},
    window: {addEventListener(type, fn) { if (type === 'popstate') popstate = fn; }},
  });
  await import('../dist/catalog.js?ui-test=' + ++instance);
  return {level, empty, controls, status, trips, entries,
    visible: () => trips.filter(card => !card.hidden),
    url: () => url,
    change(value) { level.value = value; events.get('level:change')(); },
    clear(fromEmpty = false) { events.get((fromEmpty ? 'empty-clear' : 'clear') + ':click')(); },
    back() { url = new URL(entries[--cursor]); popstate(); },
    forward() { url = new URL(entries[++cursor]); popstate(); },
  };
}

test('catalogue boots with only the level control; old date links do not hide trips', async t => {
  const ui = await catalogue(t, '?fecha=2027-02&estado=upcoming');
  assert.equal(ui.controls.hidden, false);
  assert.equal(ui.visible().length, 3);
  assert.equal(ui.status.textContent, '3 de 3 viajes.');
  assert.equal(ui.empty.hidden, true);
  assert.equal(ui.entries.length, 1);
});

test('level links and changes preserve unrelated query and hash, with back and forward', async t => {
  const ui = await catalogue(t, '?nivel=3&fecha=2027-02&estado=upcoming&source=qa#catalog-results');
  assert.equal(ui.visible().length, 1);
  assert.equal(ui.level.value, '3');
  ui.change('1');
  assert.equal(ui.url().searchParams.get('nivel'), '1');
  assert.equal(ui.url().searchParams.get('source'), 'qa');
  assert.equal(ui.url().hash, '#catalog-results');
  assert.equal(ui.url().searchParams.has('fecha'), false);
  assert.equal(ui.url().searchParams.has('estado'), false);
  assert.equal(ui.status.textContent, '1 de 3 viajes · I · Rookies.');
  ui.back();
  assert.equal(ui.level.value, '3');
  assert.equal(ui.visible().length, 1);
  ui.forward();
  assert.equal(ui.level.value, '1');
  ui.clear();
  assert.equal(ui.visible().length, 3);
  assert.equal(ui.url().search, '?source=qa');
});

test('empty state clear restores all trips and focus to the visible select', async t => {
  const ui = await catalogue(t, '?nivel=4&fecha=2027-02', ['1 2', '3']);
  assert.equal(ui.visible().length, 0);
  assert.equal(ui.empty.hidden, false);
  ui.clear(true);
  assert.equal(ui.level.value, '');
  assert.equal(ui.visible().length, 2);
  assert.equal(ui.empty.hidden, true);
  assert.deepEqual(ui.level.focused, {preventScroll: true});
  assert.equal(ui.url().search, '');
});

test('invalid level links fall back to all trips', async t => {
  const ui = await catalogue(t, '?nivel=oops&fecha=2027-99');
  assert.equal(ui.level.value, '');
  assert.equal(ui.visible().length, 3);
});

test('a catalogue without published trips has a clear status and no filter empty state', async t => {
  const ui = await catalogue(t, '?nivel=1', []);
  assert.equal(ui.status.textContent, 'No hay viajes publicados en este momento.');
  assert.equal(ui.empty.hidden, true);
});
