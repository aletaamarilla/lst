import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DOSSIER_HOST, DOSSIER_PATH} from './dossier-url.mjs';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));

test('the PDF path is proxied to the downloads host and cached, and no redirect captures it', () => {
  assert.deepEqual(config.rewrites, [{source: DOSSIER_PATH + '/:path*', destination: `https://${DOSSIER_HOST}/:path*`}]);
  const rule = config.headers.find(h => h.source === DOSSIER_PATH + '/(.*)');
  assert.ok(rule?.headers.some(h => h.key === 'x-vercel-enable-rewrite-caching' && h.value === '1'), 'rewrite caching must be explicit');
  for (const redirect of config.redirects) assert.ok(!new RegExp('^' + redirect.source + '$').test(DOSSIER_PATH + '/a.pdf'), redirect.source);
});

// A page-level policy with object-src 'none' on a PDF response can leave the browser's PDF viewer blank.
test('PDF responses do not carry the page content security policy, but are still sniff-protected', () => {
  const csp = config.headers.find(h => h.headers.some(x => x.key === 'Content-Security-Policy'));
  const matches = (rule, route) => new RegExp('^' + rule.source + '$').test(route);
  assert.ok(matches(csp, '/viajes/'));
  assert.ok(!matches(csp, DOSSIER_PATH + '/a.pdf'));
  const pdf = config.headers.find(h => h.source === DOSSIER_PATH + '/(.*)');
  assert.ok(pdf.headers.some(h => h.key === 'X-Content-Type-Options' && h.value === 'nosniff'));
  assert.ok(!pdf.headers.some(h => h.key === 'Content-Security-Policy'));
});
