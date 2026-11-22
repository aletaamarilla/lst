import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const rules = config.headers ?? [];

// Vercel `source` is path-to-regexp. Only the subset this site needs is understood here;
// anything else fails loudly instead of silently matching nothing.
function sourceToRegExp(source) {
  let pattern = '';
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') pattern += '\\' + source[++i];
    else if (char === '(') {
      let depth = 1, group = '';
      while (depth && ++i < source.length) {
        if (source[i] === '\\') { group += source[i] + source[++i]; continue; }
        if (source[i] === '(') depth++;
        if (source[i] === ')') depth--;
        if (depth) group += source[i];
      }
      assert.ok(!group.startsWith('?'), `${source}: path-to-regexp does not accept non-capturing groups`);
      assert.ok(!/\((?!\?)/.test(group.replace(/\\./g, '')), `${source}: nested capture groups are not accepted`);
      pattern += `(?:${group})`;
    } else if (char === ':') {
      const name = /^[A-Za-z_]\w*/.exec(source.slice(i + 1));
      assert.ok(name, `${source}: parameter without a name`);
      i += name[0].length;
      pattern += source[i + 1] === '*' ? (i++, '.*') : '[^/]+';
    } else {
      assert.ok(!'?+{}*'.includes(char), `${source}: unsupported pattern character ${char}`);
      pattern += char.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
}

// What Vercel would add to a response for this request path.
function headersFor(route) {
  const applied = new Map();
  for (const rule of rules) {
    if (!sourceToRegExp(rule.source).test(route)) continue;
    for (const {key, value} of rule.headers) {
      const name = key.toLowerCase();
      if (applied.has(name)) assert.equal(applied.get(name), value, `${route}: two rules disagree on ${key}`);
      applied.set(name, value);
    }
  }
  return applied;
}

async function distRoutes(dir = 'dist') {
  const routes = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) routes.push(...await distRoutes(file));
    else routes.push('/' + path.relative('dist', file).replace(/(^|\/)index\.html$/, '$1'));
  }
  return routes;
}

const routes = await distRoutes();
const byKind = kind => routes.filter(route => ({
  page: r => r.endsWith('/'),
  asset: r => r.startsWith('/assets/'),
  code: r => /^\/[^/]+\.(css|js)$/.test(r),
  data: r => /\.(json|txt|xml)$/.test(r) && !r.startsWith('/assets/'),
})[kind](route));

test('every kind of file in dist is covered by the cache test', () => {
  for (const kind of ['page', 'asset', 'code', 'data']) assert.ok(byKind(kind).length > 0, kind);
});

test('HTML pages keep revalidating so prices, availability and published trips are never stale', () => {
  for (const route of byKind('page')) {
    const cache = headersFor(route).get('cache-control');
    assert.ok(!cache || /max-age=0/.test(cache), `${route} would be cached by the browser: ${cache}`);
  }
});

test('catalogue snapshot, robots, sitemap and llms.txt revalidate too', () => {
  for (const route of [...byKind('data'), '/llms.txt']) {
    const cache = headersFor(route).get('cache-control');
    assert.ok(!cache || /max-age=0/.test(cache), `${route} would be cached by the browser: ${cache}`);
  }
});

test('fonts and images are cached for a day and may be served stale while they refresh', () => {
  for (const route of byKind('asset')) {
    const cache = headersFor(route).get('cache-control');
    assert.match(cache ?? '', /^public, max-age=86400, stale-while-revalidate=\d+$/, route);
    assert.ok(Number(/stale-while-revalidate=(\d+)/.exec(cache)[1]) > 86400, `${route}: stale window shorter than the fresh one`);
  }
});

test('CSS and JS are cached only briefly and never served stale, because the HTML that uses them revalidates', () => {
  for (const route of byKind('code')) {
    const cache = headersFor(route).get('cache-control');
    assert.match(cache ?? '', /^public, max-age=(\d+), must-revalidate$/, route);
    const seconds = Number(/max-age=(\d+)/.exec(cache)[1]);
    assert.ok(seconds >= 60 && seconds <= 3600, `${route}: ${seconds}s is outside the safe window for unversioned code`);
  }
});

test('nothing is marked immutable while file names carry no content hash', () => {
  const hashed = /[.-][0-9a-f]{8,}\.[a-z0-9]+$/;
  assert.equal(routes.some(route => hashed.test(route)), false, 'the build now hashes file names: revisit the policy and this test');
  for (const route of routes) {
    const cache = headersFor(route).get('cache-control') ?? '';
    assert.doesNotMatch(cache, /immutable/, route);
    assert.ok(Number(/max-age=(\d+)/.exec(cache)?.[1] ?? 0) <= 86400, `${route}: longer than a day without a hashed name`);
  }
});

test('every response carries the basic security headers', () => {
  for (const route of [...byKind('page'), ...byKind('asset'), ...byKind('code'), ...byKind('data')]) {
    const applied = headersFor(route);
    assert.equal(applied.get('x-content-type-options'), 'nosniff', route);
    assert.equal(applied.get('referrer-policy'), 'strict-origin-when-cross-origin', route);
    assert.equal(applied.get('x-frame-options'), 'SAMEORIGIN', route);
    assert.match(applied.get('permissions-policy') ?? '', /camera=\(\).*microphone=\(\).*geolocation=\(\)/, route);
    assert.match(applied.get('content-security-policy') ?? '', /frame-ancestors 'self'/, route);
  }
});

test('the content security policy cannot block GA4 or the Brevo form', async () => {
  const analytics = await readFile('dist/analytics.js', 'utf8');
  const brevo = JSON.parse(await readFile('scripts/brevo-config.json', 'utf8'));
  const needs = {
    'script-src': [new URL(/https:\/\/www\.googletagmanager\.com[^`'"]*/.exec(analytics)[0]).origin],
    'connect-src': [new URL(brevo.action).origin, 'https://www.google-analytics.com'],
  };
  const csp = headersFor('/').get('content-security-policy');
  assert.ok(csp, 'the home page has a content security policy');
  const directives = Object.fromEntries(csp.split(';').map(d => d.trim().split(/\s+/)).filter(([name]) => name).map(([name, ...values]) => [name, values]));
  for (const [directive, origins] of Object.entries(needs)) {
    const allowed = directives[directive] ?? directives['default-src'];
    if (!allowed) continue; // Not restricted at all.
    for (const origin of origins) assert.ok(allowed.some(v => v === origin || v === '*' || (v.startsWith('https://*.') && origin.endsWith(v.slice(9)))), `${directive} must allow ${origin}`);
    if (directive === 'script-src') assert.ok(allowed.includes("'unsafe-inline'"), 'the page configures GA4 with an inline script');
  }
  for (const forbidden of ['require-trusted-types-for', 'sandbox']) assert.ok(!(forbidden in directives), forbidden);
});

test('the redirects are still there', () => {
  assert.ok(config.redirects.length > 20);
  assert.ok(config.redirects.every(r => r.permanent === true));
});
