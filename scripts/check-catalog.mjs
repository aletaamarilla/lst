// Optional real-browser checks, using the existing external Playwright runtime.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {levelsFor, tripFacts} from './trip-model.mjs';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.LST_PREVIEW_URL || 'http://127.0.0.1:4175';
const out = process.env.LST_QA_OUTPUT || path.join(os.tmpdir(), 'lst-catalog');
fs.mkdirSync(path.join(out, 'capturas'), {recursive: true});
const trips = JSON.parse(fs.readFileSync('data/trips.json'));
const report = {checks: [], issues: [], errors: [], intercepted: []};
const check = (name, pass, detail) => {report.checks.push({name, pass, detail}); if (!pass) report.issues.push({name, detail});};
const browser = await chromium.launch({executablePath: process.env.LST_CHROMIUM_PATH, args: ['--no-sandbox']});
const context = async options => {
  const c = await browser.newContext({reducedMotion: 'reduce', ...options});
  await c.route('https://**/*', r => {report.intercepted.push(r.request().url()); return r.abort();});
  c.on('page', p => p.on('pageerror', e => report.errors.push(e.message)));
  return c;
};
const shown = p => p.locator('[data-catalog-trip]:visible a').evaluateAll(as => as.map(a => a.pathname.split('/')[2]));
const ready = async p => {await p.locator('[data-catalog-filters]').waitFor({state: 'visible'}); await p.evaluate(() => document.fonts.ready);};
const noOverflow = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const photos = p => p.locator('.catalog-photo').evaluateAll(imgs => Promise.all(imgs.map(img => {img.loading = 'eager'; return img.decode();})));
try {
  for (const width of [320, 390, 768, 1440]) {
    const height = width === 1440 ? 1000 : 844;
    const c = await context({viewport: {width, height}, hasTouch: width < 700});
    const p = await c.newPage();
    check(`${width} catalog HTTP`, (await p.goto(base + '/viajes/')).status() === 200);
    await ready(p); await photos(p);
    check(`${width} initial six destinations`, (await shown(p)).length === 6);
    check(`${width} header fixed, title clear`, await p.evaluate(() => getComputedStyle(document.querySelector('.site-header')).position === 'fixed' && document.querySelector('h1').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom));
    check(`${width} original photos/fonts`, await p.evaluate(() => [...document.querySelectorAll('.catalog-photo')].every(i => i.complete && i.naturalWidth > 0) && getComputedStyle(document.querySelector('h1')).fontFamily.includes('Aura')));
    for (const trip of trips) {
      const card = p.locator('[data-catalog-trip]').filter({has: p.locator(`a[href="/viajes/${trip.slug}/"]`)});
      const text = await card.textContent();
      const facts = tripFacts(trip);
      check(`${width} ${trip.slug} data and native detail link`, text.includes(trip.name) && text.includes(facts[2][1]) && (trip.state === 'confirmed' ? text.includes(facts[0][1]) && text.includes(facts[1][1]) : text.includes('Próximamente')) && await card.locator('a').count() === 1);
      await card.locator('a').click(); await p.waitForURL(base + `/viajes/${trip.slug}/`);
      check(`${width} ${trip.slug} detail opens`, (await p.locator('h1').innerText()).includes(trip.name));
      if (trip.slug === 'asturias') {
        await p.locator('[data-open-dates]:visible').first().click();
        check(`${width} Asturias two date enquiries retained`, await p.locator('#departure-dialog').isVisible() && await p.locator('#departure-dialog [data-departure]').count() === 2);
        await p.keyboard.press('Escape');
      }
      await p.goBack(); await ready(p);
    }
    await p.evaluate(() => {window.catalogAnnouncements = []; new MutationObserver(() => window.catalogAnnouncements.push(document.querySelector('#catalog-status').textContent)).observe(document.querySelector('#catalog-status'), {childList: true, subtree: true});});
    for (const level of ['', '1', '2', '3', '4']) {
      for (const state of ['', 'confirmed', 'upcoming']) {
        await p.selectOption('#catalog-level', level); await p.selectOption('#catalog-state', state);
        const expected = trips.filter(t => (!level || levelsFor(t).includes(Number(level))) && (!state || t.state === state)).map(t => t.slug);
        const actual = await shown(p);
        check(`${width} level ${level || 'all'} AND ${state || 'all'}`, JSON.stringify(actual) === JSON.stringify(expected), {actual, expected});
        check(`${width} count ${level}/${state}`, (await p.locator('#catalog-status').innerText()).startsWith(`${expected.length} de 6 destinos`));
        check(`${width} filter keeps layout ${level}/${state}`, await noOverflow(p));
      }
    }
    check(`${width} result changes exposed to assistive technology`, await p.locator('#catalog-status').evaluate(e => e.getAttribute('role') === 'status' && e.getAttribute('aria-live') === 'polite' && e.getAttribute('aria-atomic') === 'true' && window.catalogAnnouncements.length >= 15));
    await p.locator('[data-catalog-filters] [data-catalog-clear]').click();
    check(`${width} clear resets both filters and URL`, (await shown(p)).length === 6 && await p.inputValue('#catalog-level') === '' && await p.inputValue('#catalog-state') === '' && !new URL(p.url()).search);
    for (const level of ['1', '2', '3', '4', '0', '5', 'rookies', '2foo', '02', '2.0', '%202', '']) {
      await p.goto(base + '/viajes/?nivel=' + level); await ready(p);
      const valid = /^[1-4]$/.test(level);
      const expected = valid && ['1', '4'].includes(level) ? 5 : 6;
      check(`${width} URL nivel=${level}`, await p.inputValue('#catalog-level') === (valid ? level : '') && (await shown(p)).length === expected);
    }
    await p.goto(base + '/viajes/'); await ready(p);
    await p.locator('#catalog-level').focus();
    await p.keyboard.press('Space'); await p.keyboard.press('Home'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
    check(`${width} keyboard level and focus`, await p.inputValue('#catalog-level') === '1' && (await shown(p)).length === 5 && await p.locator('#catalog-level').evaluate(e => e === document.activeElement && parseFloat(getComputedStyle(e).outlineWidth) >= 3));
    await p.keyboard.press('Tab'); await p.keyboard.press('Space'); await p.keyboard.press('End'); await p.keyboard.press('Enter');
    check(`${width} keyboard combined state`, await p.inputValue('#catalog-state') === 'upcoming' && (await shown(p)).length === 4);
    await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
    check(`${width} keyboard clear`, (await shown(p)).length === 6);
    await p.keyboard.press('Tab');
    check(`${width} keyboard reaches first detail link`, await p.evaluate(() => document.activeElement.getAttribute('href') === '/viajes/el-salvador/' && document.activeElement.matches(':focus-visible')));
    await p.keyboard.press('Enter'); await p.waitForURL(base + '/viajes/el-salvador/'); await p.goBack(); await ready(p);
    if (width < 1000) {
      await p.locator('.menu-toggle').focus(); await p.keyboard.press('Enter');
      check(`${width} current catalog in menu`, await p.locator('#main-nav [aria-current=page]').innerText() === 'Viajes');
      await p.keyboard.press('Escape');
      check(`${width} menu Escape restores focus`, await p.locator('.menu-toggle').evaluate(e => e === document.activeElement && e.getAttribute('aria-expanded') === 'false'));
    }
    await p.selectOption('#catalog-level', '2'); await p.selectOption('#catalog-state', 'confirmed');
    await p.reload(); await ready(p);
    check(`${width} reload preserves both`, await p.inputValue('#catalog-level') === '2' && await p.inputValue('#catalog-state') === 'confirmed' && (await shown(p)).length === 2);
    await p.goBack();
    check(`${width} history restores previous state`, await p.inputValue('#catalog-level') === '2' && await p.inputValue('#catalog-state') === '' && (await shown(p)).length === 6);
    await p.goForward();
    check(`${width} history forward restores combination`, await p.inputValue('#catalog-state') === 'confirmed');
    if ([390, 1440].includes(width)) {
      await p.evaluate(() => scrollTo(0, 0));
      await p.screenshot({path: path.join(out, 'capturas', `catalogo-${width}-filtrado.png`), fullPage: true});
      await p.locator('[data-catalog-filters] [data-catalog-clear]').click(); await photos(p); await p.evaluate(() => scrollTo(0, 0));
      await p.screenshot({path: path.join(out, 'capturas', `catalogo-${width}.png`), fullPage: true});
    }
    await p.locator('[data-catalog-filters] [data-catalog-clear]').click();
    await p.evaluate(() => {const es = [...document.querySelectorAll('body,body *')], sizes = es.map(e => getComputedStyle(e).fontSize); es.forEach((e, i) => e.style.fontSize = parseFloat(sizes[i]) * 2 + 'px');});
    check(`${width} 200% text no page overflow`, await noOverflow(p));
    check(`${width} 200% all six readable`, (await shown(p)).length === 6 && await p.locator('.catalog-card-copy').evaluateAll(es => es.every(e => e.scrollWidth <= e.clientWidth + 1)));
    if (width === 390) await p.screenshot({path: path.join(out, 'capturas', 'catalogo-390-texto200.png'), fullPage: true});
    await c.close();
  }
  for (const width of [390, 1440]) {
    const c = await context({viewport: {width, height: 844}, javaScriptEnabled: false}); const p = await c.newPage();
    await p.goto(base + '/viajes/?nivel=1');
    check(`${width} without JS all six visible despite URL filter`, (await shown(p)).length === 6 && !await p.locator('[data-catalog-filters]').isVisible());
    check(`${width} without JS no overflow`, await noOverflow(p));
    for (const t of trips) {
      await p.locator(`[data-catalog-trip] a[href="/viajes/${t.slug}/"]`).click(); await p.waitForURL(base + `/viajes/${t.slug}/`);
      check(`${width} without JS detail ${t.slug}`, (await p.locator('h1').innerText()).includes(t.name)); await p.goBack();
    }
    await c.close();
  }
  const c = await context({viewport: {width: 390, height: 844}}); const p = await c.newPage();
  await p.goto(base + '/'); await p.locator('.home-catalog-link a').click(); await ready(p);
  check('home calendar CTA opens catalog', new URL(p.url()).pathname === '/viajes/');
  await p.goto(base + '/conocenos/'); await p.locator('.about-actions a[href="/viajes/"]').click(); await ready(p);
  check('Conócenos CTA opens catalog', new URL(p.url()).pathname === '/viajes/');
  for (const [i, slug] of ['rookies', 'aprendices', 'riders', 'supercracks'].entries()) {
    await p.goto(base + '/niveles/'); await p.locator(`#${slug} .guide-level-cta`).click(); await ready(p);
    check(`guide ${slug} opens numeric filter`, new URL(p.url()).pathname === '/viajes/' && await p.inputValue('#catalog-level') === String(i + 1));
  }
  // An isolated HTTP fixture exercises the empty state; repository commercial data stays untouched.
  await c.route('**/viajes/?nivel=4', async route => {const response = await route.fetch(); const body = (await response.text()).replace(/data-levels="[^"]*"/g, 'data-levels="1"'); await route.fulfill({response, body});});
  await p.goto(base + '/viajes/?nivel=4'); await ready(p);
  check('empty fixture explains zero matches', (await shown(p)).length === 0 && await p.locator('#catalog-empty').isVisible() && (await p.locator('#catalog-status').innerText()).startsWith('0 de 6 destinos'));
  const contact = p.locator('#catalog-empty [data-whatsapp]');
  const href = new URL(await contact.getAttribute('href'));
  check('empty fixture existing WhatsApp consultation', href.origin === 'https://wa.me' && href.pathname === '/34648189257' && href.searchParams.get('text').includes('nivel') && (await p.locator('#catalog-empty').innerText()).includes('Consultar no confirma una plaza'));
  const popupPromise = p.waitForEvent('popup'); await contact.click(); const popup = await popupPromise; await popup.waitForLoadState(); await popup.close();
  check('WhatsApp intercepted without sending', report.intercepted.some(u => u.startsWith('https://wa.me/34648189257')));
  await p.locator('#catalog-level').focus(); await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({path: path.join(out, 'capturas', 'catalogo-vacio-fixture.png'), fullPage: true});
  await p.locator('#catalog-empty [data-catalog-clear]').focus(); await p.keyboard.press('Enter');
  check('empty fixture clear restores results and visible focus', (await shown(p)).length === 6 && !await p.locator('#catalog-empty').isVisible() && await p.locator('#catalog-level').evaluate(e => e === document.activeElement));
  await c.close();
  check('no JavaScript errors', report.errors.length === 0, report.errors);
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({checks: report.checks.length, issues: report.issues, errors: report.errors}, null, 2));
}
if (report.issues.length) process.exitCode = 1;
