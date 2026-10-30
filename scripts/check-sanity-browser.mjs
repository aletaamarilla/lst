// Optional, using the same external Playwright runtime as the existing browser checks.
import {createRequire} from 'node:module';
import {readFile, mkdtemp, mkdir, rm, stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {buildSite} from './build.mjs';
import {prepareDrafts} from './import-departures.mjs';
import {adaptTrips} from './sanity-trips.mjs';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.LST_QA_OUTPUT || path.join(os.tmpdir(), 'lst-sanity-browser');
await mkdir(output, {recursive: true});
const temp = await mkdtemp(path.join(os.tmpdir(), 'lst-browser-'));
let root = path.resolve('dist');
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.json': 'application/json'};
const server = http.createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep) && file !== root) throw Error('path');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({executablePath: process.env.LST_CHROMIUM_PATH, args: ['--no-sandbox']});
const errors = [];
let checks = 0;
try {
  const inventory = JSON.parse(await readFile('docs/sanity/2026-10-23/salidas.json', 'utf8'));
  const doc = prepareDrafts(inventory)[0];
  doc._id = doc._id.slice(7);
  doc.departures[0].price = 399.5;
  doc.departures.push({...doc.departures[0], _key: 'second', start: '2026-12-01', end: '2026-12-03', price: 450});
  doc.hero = {url: 'https://cdn.sanity.io/images/q5bj2rn2/production/browser-fixture.webp', alt: 'Imagen de prueba local'};
  doc.gallery = [1, 2].map(i => ({...doc.hero, caption: `Foto ${i}`}));
  doc.faqs = [1, 2].map(i => ({question: `Pregunta QA ${i}`, answer: `Respuesta QA ${i}`}));
  const form = structuredClone(doc);
  form._id = 'lst-form-test'; form.name = 'Solicitud de prueba'; form.slug.current = 'solicitud-prueba';
  form.booking = {applicationUrl: 'https://forms.gle/test-only'};
  form.departures = [form.departures[0]]; delete form.hero; delete form.gallery;
  const pending = {...structuredClone(form), _id: 'qa-pending', name: 'Destino pendiente QA', slug: {current: 'qa-pending'}, state: 'upcoming', levels: [4], departures: []};
  const full = {...structuredClone(doc), _id: 'qa-full', name: 'Destino completo QA', slug: {current: 'qa-full'}, levels: [3], availability: 'full'};
  const documents = [doc, form, pending, full];
  await buildSite({out: path.join(temp, 'empty'), read: async () => []});
  await buildSite({out: path.join(temp, 'sample'), read: async () => documents});
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    // No external requests or contact submissions. Use an existing local asset as the photo fixture.
    await page.route('https://**/*', async route => {
      if (route.request().url().startsWith('https://cdn.sanity.io/')) await route.fulfill({body: await readFile('dist/assets/el-salvador.webp'), contentType: 'image/webp'});
      else await route.abort();
    });
    root = path.join(temp, 'empty');
    for (const url of ['/', '/viajes/', '/niveles/', '/viajes/asturias/']) {
      await page.goto(base + url);
      assert.match(await page.locator('main').innerText(), /No hay viajes publicados|no está publicado/);
      assert.equal(await page.locator('[data-catalog-trip], .home-trip, .guide-trip-card').count(), 0);
      assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex,nofollow');
      checks += 3;
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); checks++;
    await page.screenshot({path: path.join(output, `unpublished-${width}.png`), fullPage: true});
    await page.goto(base + '/viajes/');
    await page.screenshot({path: path.join(output, `empty-${width}.png`), fullPage: true});
    root = path.join(temp, 'sample');
    for (const [url, selector] of [['/', '.home-trip-link'], ['/viajes/', '.catalog-card-link'], ['/niveles/', '.guide-trip-card .home-trip-link']]) {
      await page.goto(base + url);
      const links = await page.locator(selector).evaluateAll(links => links.map(a => a.getAttribute('href')).sort());
      assert.deepEqual(links, adaptTrips(documents).map(d => `/viajes/${d.slug}/`).sort()); checks++;
    }
    await page.goto(base + `/viajes/?nivel=1&fecha=${doc.departures[0].start.slice(0, 7)}`);
    assert.equal(await page.locator('[data-catalog-trip]:visible').count(), 0); checks++;
    assert.equal(await page.locator('#catalog-empty').isVisible(), true); checks++;
    await page.selectOption('#catalog-level', '2');
    assert.equal(await page.locator('[data-catalog-trip]:visible').count(), 2); checks++;
    assert.equal(new URL(page.url()).searchParams.get('nivel'), '2'); checks++;
    await page.goBack(); assert.equal(await page.locator('[data-catalog-trip]:visible').count(), 0); checks++;
    await page.goto(base + `/viajes/${doc.slug.current}/`);
    for (const question of await page.locator('.trip-faq summary').all()) await question.click();
    assert.equal(await page.locator('.trip-faq details[open]').count(), 2); checks++;
    await page.locator('[data-open-dates]:visible').first().click();
    assert.equal(await page.locator('#departure-dialog').evaluate(e => e.open), true); checks++;
    assert.equal(await page.locator('#departure-dialog [data-departure]').count(), 2); checks++;
    const href = await page.locator('[data-departure=second]').getAttribute('href');
    assert.match(new URL(href).searchParams.get('text'), /1 dic 2026/); checks++;
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-open-dates]:focus').count(), 1); checks++;
    await page.locator('[data-open-gallery]').click();
    await page.locator('[data-photo-next]').click();
    assert.equal(await page.locator('.photo-counter').innerText(), '2 / 2'); checks++;
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-open-gallery]:focus').count(), 1); checks++;
    await page.screenshot({path: path.join(output, `detail-${width}.png`), fullPage: true});
    await page.goto(base + '/viajes/qa-full/');
    assert.match(await page.locator('main').innerText(), /Completo/); checks++;
    assert.equal(await page.locator('[data-open-dates]').count(), 0); checks++;
    assert.match(await page.locator('.dock-cta').innerText(), /Consultar viaje completo/); checks++;
    await page.goto(base + '/viajes/qa-pending/');
    assert.match(await page.locator('main').innerText(), /Por confirmar/); checks++;
    assert.equal(await page.locator('[data-open-dates], [data-open-gallery]').count(), 0); checks++;
    await page.goto(base + '/viajes/solicitud-prueba/');
    assert.equal(await page.locator('[data-application]').count(), 0); checks++;
    assert.match(await page.locator('.trip-reserve').innerText(), /WhatsApp/); checks++;
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); checks++;
    for (const [url, card] of [['/', '.home-trip'], ['/viajes/', '[data-catalog-trip]']]) {
      await page.goto(base + url);
      await page.evaluate(() => {
        const elements = [...document.querySelectorAll('body, body *')];
        const sizes = elements.map(e => parseFloat(getComputedStyle(e).fontSize));
        elements.forEach((e, i) => e.style.fontSize = `${sizes[i] * 2}px`);
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); checks++;
      assert.equal(await page.locator(card).count(), documents.length); checks++;
      for (const item of await page.locator(card).all()) {
        assert.equal(await item.locator('a').count(), 2); checks++;
        assert.equal(await item.locator('button, input').count(), 0); checks++;
       { assert.equal(await item.locator('details summary').count(), 1); assert.equal(await item.locator('.home-trip-dates-panel[tabindex="0"]').count(), 1); checks += 2; }
      }
    }
    await page.close();
  }
  root = path.join(temp, 'sample');
  const noJs = await browser.newPage({viewport: {width: 390, height: 844}, javaScriptEnabled: false});
  await noJs.route('https://**/*', r => r.abort());
  await noJs.goto(base + '/viajes/?nivel=1');
  assert.equal(await noJs.locator('[data-catalog-trip]:visible').count(), documents.length); checks++;
  assert.equal(await noJs.locator('[data-catalog-filters]').isVisible(), false); checks++;
  await noJs.locator(`.catalog-card-link[href="/viajes/${form.slug.current}/"]`).click();
  assert.match(await noJs.locator('h1').innerText(), /Solicitud de prueba/); checks++;
  assert.match(await noJs.locator('.reserve-main').getAttribute('href'), /^https:\/\/wa.me\//); checks++;
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log(`PASS: ${checks} browser assertions at 320/390/1440px; empty catalogue, URLs, filters/history, dates, gallery/focus, optional images, legacy form removal, WhatsApp and noindex. No external submissions.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(temp, {recursive: true, force: true});
}
