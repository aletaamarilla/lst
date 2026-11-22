# Eventos de analítica (parte 1) Implementation Plan

> **Superado en parte el 22/11/2026:** los nombres de eventos de este plan son los del primer diseño. El vocabulario vigente está en la sección «Cambio de rumbo» de `docs/superpowers/specs/2026-11-22-auditoria-analitica-panel-design.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Leave the site emitting exactly the event list of the approved design: three parameters/events removed, three events added, campaign origin kept until consent, and a link to mark the team's own visits.

**Architecture:** `dist/analytics.js` stays the only file that talks to GA4. Pages never call it: they announce facts with `CustomEvent`s on `document` (as `registration.js` already does) and `analytics.js` turns them into events with controlled values. Everything is tested by running the real `dist/analytics.js` in `node:vm` with the minimal DOM of `scripts/analytics-browser.test.mjs`.

**Tech Stack:** Plain browser JavaScript (no bundler), gtag.js, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-22-auditoria-analitica-panel-design.md` (part 1). Parts 2–4 (GA4 configuration, ads sheet, Looker Studio panel) get their own plan once Antonio answers how LST runs its ads and who counts the registrations.

## Global Constraints

- Nothing loads from Google before the visitor accepts; `ad_storage`, `ad_user_data` and `ad_personalization` stay denied.
- No names, emails, phones, messages or form fields in any event. Every parameter value comes from a closed list or a catalogue code; anything else is dropped, never forwarded.
- Travelhood's event names and `measurement_version: '1'` (text) do not change. Every hit keeps `measurement_version`, `traffic_type`, `page_type`.
- `dist/*.js` are the sources (no step generates them). Do **not** run `npm run build`: it rewrites `dist/*.html` from live Sanity data and the tree carries unrelated pending work.
- No commits: Antonio decides when. Each task ends with the tests green instead.
- `npm test` baseline before starting: 239 pass, 0 fail.
- Visitor-facing copy in Spanish; code comments in English, as in the existing files.

## Review Focus

1. Session storage blocked or holding unreadable data → the site is still measured, just without the kept origin (Task 4).
2. Accepting on a later page whose address already has a query and a hash → the campaign labels are added without losing either (Task 4).
3. A page announcing an out-of-range step, level or a departure that is not a catalogue code → nothing personal or unexpected reaches GA4 (Tasks 2 and 3).
4. A returning visitor who already accepted or rejected lands from an ad → nothing is noted and no address is overridden (Task 4).
5. Going back and forward in the form, or reloading `/niveles/` with a stored result → no repeated step or test event (Task 6, real browser).

---

### Task 1: Remove what does not inform

**Files:**
- Modify: `dist/analytics.js` (click listener, lines 92–105)
- Test: `scripts/analytics-browser.test.mjs`

**Interfaces:**
- Produces: `destination_booking_click {destination_slug, cta_location}`; `whatsapp_click {cta_location}` for every WhatsApp link outside a trip, the FAQ one included (`cta_location: 'faq_contact'`). No event named `faq_contact_click`; no parameters `booking_provider` or `whatsapp_topic` anywhere.

- [ ] **Step 1: Replace the two tests that pin the removed names**

Replace `going to the registration form reports who takes the booking` and `the WhatsApp button that closes the FAQ page is a FAQ contact, the header one is not` with:

```js
test('going to the registration form reports the trip and the button, nothing else', () => {
  const site = open({page: trip});
  site.click(el('a', {'data-registration': '', class: 'button reserve-main'}));
  const {name, destination_slug, cta_location, ...rest} = site.events().at(-1);
  assert.deepEqual([name, destination_slug, cta_location], ['destination_booking_click', 'maldivas', 'reserve']);
  assert.deepEqual(Object.keys(rest).sort(), ['measurement_version', 'page_type', 'traffic_type']);
});

test('WhatsApp outside a trip is one event, the FAQ button included, told apart by its place', async () => {
  const site = open({page: {page_type: 'faq'}, html: await readFile('dist/preguntas-frecuentes/index.html', 'utf8')});
  const links = site.elements.filter(e => e.matches('a[data-whatsapp]'));
  site.click(links.find(e => e.matches('.faq-help *')));
  site.click(links.find(e => e.matches('.lst-nav-contact')));
  assert.deepEqual(site.events().map(e => [e.name, e.cta_location]), [['whatsapp_click', 'faq_contact'], ['whatsapp_click', 'header_whatsapp']]);
  assert.ok(site.events().every(e => !('whatsapp_topic' in e)));
});
```

In `no button of the published pages is reported as unclassified`, the failure message uses `event.whatsapp_topic ?? event.destination_slug`: change it to `event.destination_slug ?? event.page_type`.

- [ ] **Step 2: Run and see both fail**

Run: `node --test scripts/analytics-browser.test.mjs`
Expected: the two new tests FAIL (`booking_provider` still present; `faq_contact_click` still sent).

- [ ] **Step 3: Simplify the click listener in `dist/analytics.js`**

Outside a trip every WhatsApp link sends `whatsapp_click` with only `cta_location`; the booking click loses `booking_provider`. Update the two comments that mention them.

- [ ] **Step 4: Run the whole suite**

Run: `npm test`
Expected: 239 pass, 0 fail.

---

### Task 2: Registration form: steps and the departure chosen

**Files:**
- Modify: `dist/registration.js` (`show()` in `createSteps`, line 70; the accepted dispatch, line 177)
- Modify: `dist/analytics.js` (registration listeners, lines 107–123)
- Test: `scripts/analytics-browser.test.mjs`

**Interfaces:**
- Produces (page → analytics): `lst:registration-step` with `detail: {step}` — the 1-based number of a step reached for the first time in this page load (2 to 5). `lst:registration-accepted` gains `detail: {departure}` — the `data-departure-id` of the checked `VIAJE_SURF` radio.
- Produces (analytics → GA4): `registration_form_step {destination_slug, form_step}` with `form_step` `'2'`…`'5'`; `registration_form_accepted {destination_slug, trip_id}` where `trip_id` is sent only when the departure matches `/^[a-z0-9-]{1,80}$/`.

- [ ] **Step 1: Write the failing tests**

Replace `an accepted registration is reported with its trip` with:

```js
test('an accepted registration is reported with its trip and the departure chosen', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'maldivas'}});
  site.dispatch('lst:registration-accepted', {departure: 'maldivas-2027-03-21'});
  site.dispatch('lst:registration-accepted', {departure: 'ana@example.com'});
  site.dispatch('lst:registration-accepted');
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug, e.trip_id]), [
    ['registration_form_accepted', 'maldivas', 'maldivas-2027-03-21'],
    ['registration_form_accepted', 'maldivas', undefined],
    ['registration_form_accepted', 'maldivas', undefined]]);
});

test('reaching a later step of the form is reported with a controlled step number', () => {
  const site = open({page: {page_type: 'registration', destination_slug: 'senegal'}});
  for (const step of [2, 3, 5, 1, 6, '3', 2.5]) site.dispatch('lst:registration-step', {step});
  site.dispatch('lst:registration-step');
  assert.deepEqual(site.events().map(e => [e.name, e.destination_slug, e.form_step]),
    [2, 3, 5].map(step => ['registration_form_step', 'senegal', String(step)]));
});

// A renamed fact would silently stop being measured: both sides must use the same name.
const ANNOUNCED = {'dist/registration.js': ['lst:registration-step', 'lst:registration-accepted', 'lst:registration-failed']};
test('the pages announce facts with the names this script listens for', async () => {
  for (const [file, names] of Object.entries(ANNOUNCED)) {
    const text = await readFile(file, 'utf8');
    for (const name of names) {
      assert.ok(text.includes(`CustomEvent('${name}'`), `${file} must announce ${name}`);
      assert.ok(source.includes(`addEventListener('${name}'`), `analytics.js must listen for ${name}`);
    }
  }
});
```

- [ ] **Step 2: Run and see them fail**

Run: `node --test scripts/analytics-browser.test.mjs`
Expected: the three tests FAIL (no `trip_id`, no `registration_form_step`, `registration.js` does not announce `lst:registration-step`).

- [ ] **Step 3: Announce the facts in `dist/registration.js`**

In `show(index, focus)`, before `visited` is updated: when `index > visited`, dispatch `lst:registration-step` with `{step: index + 1}`. Give `lst:registration-accepted` the detail `{departure: dates.find(input => input.checked)?.dataset.departureId}`. The initial `show(0, false)`, `validateAll()` and `reveal()` never go past `visited`, so they announce nothing.

- [ ] **Step 4: Listen in `dist/analytics.js`**

`lst:registration-step`: send only when `detail.step` is an integer from 2 to 5 and the page has a `destination_slug`. `lst:registration-accepted`: add `trip_id` only when the departure passes the pattern above.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: 241 pass, 0 fail.

---

### Task 3: Level test and community links

**Files:**
- Modify: `dist/home.js` (quiz result, line ~108), `dist/levels.js` (`answer()`, line ~66)
- Modify: `dist/analytics.js` (click listener; one new listener)
- Test: `scripts/analytics-browser.test.mjs` (also: `Element` gains `getAttribute`)

**Interfaces:**
- Produces (page → analytics): `lst:level-test` with `detail: {level}`, the main level as a number 1–4. `home.js` announces it when the third answer produces a result; `levels.js` announces it in `answer()` when a result exists, with `levelOf(r.code)`. Not announced when a level is chosen by hand or a stored result is shown on load.
- Produces (analytics → GA4): `level_test_complete {surf_level}` with `'1'`…`'4'`; `social_click {link_type}` with `'instagram'` (link host `instagram.com` or `www.instagram.com`) or `'whatsapp_group'` (host `chat.whatsapp.com`). The host is read from the link's `href` attribute; a link with any other host sends nothing.

- [ ] **Step 1: Write the failing tests**

Add `getAttribute(name) { return this.attrs[name] ?? null; }` to the test's `Element`, add `'dist/home.js': ['lst:level-test'], 'dist/levels.js': ['lst:level-test']` to `ANNOUNCED`, and add:

```js
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
    ['social_click', 'instagram', undefined], ['social_click', 'whatsapp_group', undefined], ['whatsapp_click', undefined, 'footer_whatsapp']]);
});
```

- [ ] **Step 2: Run and see them fail**

Run: `node --test scripts/analytics-browser.test.mjs`
Expected: the two new tests and the announce test FAIL.

- [ ] **Step 3: Announce the test result in `dist/home.js` and `dist/levels.js`**

- [ ] **Step 4: Add the listener and the community branch in `dist/analytics.js`**

The community check looks at the closest `a` of the click target and is independent of the WhatsApp/registration branch (no link is both). Relative or unparsable `href`s send nothing.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: 243 pass, 0 fail.

---

### Task 4: Keep the campaign until the visitor accepts

**Files:**
- Modify: `dist/analytics.js` (start of the script, `load()`, `choose()`)
- Modify: `dist/cookies/index.html` (one sentence)
- Test: `scripts/analytics-browser.test.mjs` (`open()` gains `url`, `referrer`, `session`)

**Interfaces:**
- Session storage key `lst-entry`, value `JSON.stringify({query, referrer})`:
  - `query`: the landing address's `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, in the order they appear, as a query string without `?`. Nothing else (no `fbclid`).
  - `referrer`: `document.referrer` when its host, ignoring `www.`, differs from the site's; otherwise `''`.
- Written once, when the script starts, only if there is no stored consent choice, no entry yet, and `query` or `referrer` is not empty.
- Used by the first `gtag('config', …)` after accepting: `page_location` = current address plus the stored labels, only if the current address carries no `utm_` parameter and `query` is not empty; `page_referrer` = stored referrer, only if it is not empty and the current `document.referrer` is empty or same-site. Neither key is present otherwise.
- Removed on accept (after use) and on reject. Any storage error or unreadable value counts as "no entry".

- [ ] **Step 1: Extend the test harness**

`open()` takes `url = \`https://${hostname}/\``, `referrer = ''` and `session = new Map()`. The window gets `location: {hostname, href: url, search: new URL(url).search}`, `URL`, `URLSearchParams`, `document.referrer`, and a `sessionStorage` over `session` (`getItem`, `setItem`, `removeItem`); with `session: null` its three methods throw. Run `npm test`: still 243 pass.

- [ ] **Step 2: Write the failing tests**

```js
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
  assert.deepEqual(blocked.events().map(e => e.name), ['destination_view']);
  const garbled = open({consent: null, session: new Map([['lst-entry', '{bad']])});
  garbled.choose('accept');
  assert.equal('page_location' in garbled.config(), false);
});
```

- [ ] **Step 3: Run and see them fail**

Run: `node --test scripts/analytics-browser.test.mjs`
Expected: the first, third and fourth tests FAIL; `page views and every event carry the common standard parameters` still passes.

- [ ] **Step 4: Implement in `dist/analytics.js`**

Build `page_location` with `URL`/`searchParams.append`, so an existing query and hash survive. The overrides go only into the `gtag('config', id, …)` call, not into `common`.

- [ ] **Step 5: Add the sentence to the cookie policy**

In `dist/cookies/index.html`, right after the sentence that says the choice is stored in the browser:

> Mientras no eliges, tu navegador recuerda, solo durante esa visita, desde qué enlace llegaste (por ejemplo, un anuncio). Si aceptas, se usa para la medición; si rechazas, se borra. No se envía a nadie antes de que aceptes.

- [ ] **Step 6: Run the whole suite and the site check**

Run: `npm test && npm run check`
Expected: 248 pass, 0 fail; check ends without errors.

---

### Task 5: Mark the team's visits with a link

**Files:**
- Modify: `dist/analytics.js` (before `traffic_type` is computed)
- Modify: `README.md` (section «Analítica», bullet «Visitas del equipo»)
- Test: `scripts/analytics-browser.test.mjs` (`open()` returns `cookie()`)

**Interfaces:**
- `?equipo=1` on any page: sets `lst_analytics_internal=1; path=/; max-age=31536000; SameSite=Lax; Secure` and this very page already counts as internal. `?equipo=0`: sets `lst_analytics_internal=; path=/; max-age=0; SameSite=Lax; Secure` and this page counts as a normal visit. Any other value: ignored.

- [ ] **Step 1: Write the failing test**

`open()` returns `cookie: () => window.document.cookie`. Then:

```js
test('the team marks or unmarks a browser by opening a link once', () => {
  const marked = open({url: `https://${HOST}/?equipo=1`});
  assert.equal(marked.config().traffic_type, 'internal');
  assert.equal(marked.cookie(), 'lst_analytics_internal=1; path=/; max-age=31536000; SameSite=Lax; Secure');
  const unmarked = open({url: `https://${HOST}/?equipo=0`, cookie: 'lst_analytics_internal=1'});
  assert.equal(unmarked.config().traffic_type, 'external');
  assert.equal(unmarked.cookie(), 'lst_analytics_internal=; path=/; max-age=0; SameSite=Lax; Secure');
  assert.equal(open({url: `https://${HOST}/?equipo=si`}).config().traffic_type, 'external');
});
```

- [ ] **Step 2: Run and see it fail**

Run: `node --test scripts/analytics-browser.test.mjs`
Expected: FAIL (`traffic_type` is `external` with `?equipo=1`).

- [ ] **Step 3: Implement in `dist/analytics.js`**

With the parameter present, `internal` comes from the parameter; without it, from the cookie as today.

- [ ] **Step 4: Rewrite the README bullet**

The team opens `https://<dominio>/?equipo=1` once on each device (and accepts the notice); `?equipo=0` undoes it. Remove the console command.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: 249 pass, 0 fail.

---

### Task 6: Real-browser pass and documents

**Files:**
- Modify: `README.md` (section «Analítica»), `docs/superpowers/specs/2026-11-19-analitica-ga4-design.md` (event table; first line points to the 22/11 design)
- No product code unless the pass finds a defect (then fix it under the task that owns the file, test first).

- [ ] **Step 1: Serve a copy of the site with a test measurement ID**

Build into the scratchpad, never into `dist/`: `buildSite({out})` from `scripts/build.mjs` with `GA4_MEASUREMENT_ID=G-TEST000000` in the environment, and serve that folder locally. `localhost` is reported as `developer` traffic with `debug_mode`.

- [ ] **Step 2: Check each fact in the browser by reading `window.dataLayer`**

Never send a real registration: Brevo belongs to the client. Stub `fetch` in the page to answer `{success: true}` before submitting.

| Action | Expected in `dataLayer` |
| --- | --- |
| Accept the notice on a trip page | `destination_view` once |
| Click «Inscribirme» | `destination_booking_click` without `booking_provider` |
| Advance the form to step 5, go back to 2, forward again | `registration_form_step` with `2`, `3`, `4`, `5`, each once |
| Submit with `fetch` stubbed | `registration_form_accepted` with `trip_id` = the chosen departure |
| Finish the home quiz; finish the `/niveles/` test | `level_test_complete` each time |
| Reload `/niveles/` with the result stored | no new `level_test_complete` |
| Footer Instagram link; «Unirme al grupo» in the test result | `social_click` with `instagram`, `whatsapp_group` |
| Land with `?utm_source=ig&utm_medium=paid_social&utm_campaign=prueba`, open a trip, accept there | `config` carries `page_location` with the three labels |
| Open `/?equipo=1` | `config.traffic_type` is `internal` |

- [ ] **Step 3: Update the documents**

README «Analítica»: point to the 22/11 design; in «Inscripción» add the step and the departure; one line each for the level test, community links and the origin kept until consent. In the 19/11 design, replace the event table with the final list of the 22/11 design and note at the top that the 22/11 document amends it.

- [ ] **Step 4: Final run**

Run: `npm test && npm run check`
Expected: 249 pass, 0 fail; check ends without errors.
