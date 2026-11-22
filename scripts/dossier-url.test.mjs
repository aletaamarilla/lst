import test from 'node:test';
import assert from 'node:assert/strict';
import {DOSSIER_HOST, dossierProblem, isSanityFileUrl, dossierHref} from './dossier-url.mjs';

const onHost = path => 'https://' + DOSSIER_HOST + path;

test('a trip without a dossier is allowed: empty means no link', () => {
  for (const value of [undefined, null, '']) assert.equal(dossierProblem(value), '');
});

test('a PDF on the downloads host is accepted', () => {
  assert.equal(dossierProblem(onHost('/marruecos-2027-01-17.pdf')), '');
});

test('host case, extension case and surrounding spaces do not matter', () => {
  assert.equal(dossierProblem('https://' + DOSSIER_HOST.toUpperCase() + '/a.pdf'), '');
  assert.equal(dossierProblem(onHost('/A.PDF')), '');
  assert.equal(dossierProblem('  ' + onHost('/a.pdf') + '  '), '');
});

test('look-alike hosts, plain http and Sanity links are refused with a message', () => {
  for (const value of [
    'http://' + DOSSIER_HOST + '/a.pdf',
    'https://' + DOSSIER_HOST + '.evil.com/a.pdf',
    'https://evil-' + DOSSIER_HOST + '/a.pdf',
    'https://' + DOSSIER_HOST + '@evil.com/a.pdf',
    'https://cdn.sanity.io/files/q5bj2rn2/production/abc.pdf',
  ]) assert.notEqual(dossierProblem(value), '', value);
});

test('a URL that is not a PDF file, or not a URL at all, is refused', () => {
  for (const value of [onHost('/carpeta/'), onHost('/'), onHost('/a.pdf.html'), 'not a url']) assert.notEqual(dossierProblem(value), '', value);
});

test('isSanityFileUrl recognises Sanity file links and nothing else', () => {
  assert.equal(isSanityFileUrl('https://cdn.sanity.io/files/q5bj2rn2/production/abc.pdf'), true);
  assert.equal(isSanityFileUrl(onHost('/a.pdf')), false);
  assert.equal(isSanityFileUrl('https://cdn.sanity.io/images/q5bj2rn2/production/abc.jpg'), false);
  assert.equal(isSanityFileUrl('not a url'), false);
});

test('dossierHref serves a PDF on the downloads host through the site itself, and leaves any other link alone', () => {
  assert.equal(dossierHref(onHost('/marruecos-2027-01-17.pdf')), '/descargas/marruecos-2027-01-17.pdf');
  assert.equal(dossierHref('https://' + DOSSIER_HOST.toUpperCase() + '/a.pdf'), '/descargas/a.pdf');
  assert.equal(dossierHref(onHost('/2027/a.pdf?v=2')), '/descargas/2027/a.pdf?v=2');
  assert.equal(dossierHref('https://example.com/a.pdf'), 'https://example.com/a.pdf');
  assert.equal(dossierHref(''), '');
  assert.equal(dossierHref(undefined), '');
});
