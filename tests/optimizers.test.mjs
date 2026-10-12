import test from 'node:test';
import assert from 'node:assert/strict';
import { minifyHTML } from '../is-html-minify/html.js';
import { minifyJS, minifyCSS } from '../is-minify/minify.js';
import { promptMinify, optimizePrompt } from '../is-prompt-minify/prompt.js';
import { optimizeGoogleTag } from '../is-google-tag/gtag.js';
import { optimizeDataset } from '../is-dataset-minify/dataset.js';
import { stripAnsi } from '../is-strip-ansi/strip.js';

test('HTML minifier preserves meaningful separators and attribute values', () => {
  const html = '<p><strong>Hello</strong> <em>world</em></p>';
  assert.match(minifyHTML(html), /<\/strong> <em>/);
  assert.match(minifyHTML('<input value=" hello  world ">'), /value=" hello  world "/);
  assert.match(minifyHTML('<pre>hello  world</pre>'), /hello  world/);
});

test('JavaScript complex syntax remains untouched by a heuristic lexer', () => {
  const asi = 'let a = 1\n++a';
  assert.equal(minifyJS(asi), asi);
  const regex = 'const a = /a\\/\\/b/;';
  assert.equal(minifyJS(regex), regex);
  const template = 'const a = \`hi \${name}\`;';
  assert.equal(minifyJS(template), template);
  assert.equal(minifyCSS('width: calc(100% - 2px);'), 'width: calc(100% - 2px);');
});

test('prompt optimization does not silently remove meaningful instructions', () => {
  assert.equal(promptMinify('No no, keep this.'), 'No no, keep this.');
  assert.match(optimizePrompt('Please keep the instructions.').optimized, /Please/);
  assert.ok(optimizePrompt('Please keep the instructions.', { noise: true }).optimized.length < 30);
});

test('CSV header quoting and input handling', () => {
  const rows = JSON.stringify([{ 'first,name': 'Ada', last: 'Lovelace' }]);
  const out = optimizeDataset(rows, { format: 'json', outputFormat: 'csv' });
  assert.match(out, /^"first,name",last\n/);
});

test('GA4 snippet optimizer avoids fake IDs and injected transport settings', () => {
  assert.equal(optimizeGoogleTag('GTM-ABCD123'), 'GTM-ABCD123');
  assert.equal(optimizeGoogleTag(''), '');
  assert.match(optimizeGoogleTag('G-TEST123'), /id=G-TEST123/);
  assert.doesNotMatch(optimizeGoogleTag('G-TEST123', { transport: "x';alert(1);//" }), /alert/);
});

test('ANSI stripping retains visible text', () => {
  assert.equal(stripAnsi('\x1b[31mhello\x1b[0m'), 'hello');
});
