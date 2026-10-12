import test from 'node:test';
import assert from 'node:assert/strict';
import { minifyJS } from '../is-minify/minify.js';
import { minifyHTML } from '../is-html-minify/html.js';
import { stripAnsi, hasAnsi } from '../is-strip-ansi/strip.js';
import { minifyCSS } from '../is-minify/minify.js';

test('numeric literal property access remains syntactically valid', () => {
  const input = 'const s = 1 .toString();';
  const output = minifyJS(input);
  assert.equal(output, input);
  assert.equal(new Function(output + ' return s;')(), '1');
});

test('HTML collapseWhitespace false leaves textual whitespace alone', () => {
  assert.equal(minifyHTML('<p>Hello   world</p>', { collapseWhitespace: false }), '<p>Hello   world</p>');
  assert.equal(minifyHTML('<p>Hello   world</p>'), '<p>Hello world</p>');
  assert.equal(minifyHTML('<p>A</p>  <em>B</em>', { collapseWhitespace: false }), '<p>A</p>  <em>B</em>');
});

test('OSC-8 hyperlink visible text strips nested ANSI codes', () => {
  const link = '\x1b]8;;https://example.com\x1b\\Hello \x1b[31mred\x1b[0m\x1b]8;;\x1b\\';
  assert.equal(stripAnsi(link), 'Hello red');
  assert.equal(hasAnsi(link), true);
  assert.equal(hasAnsi('Plain text'), false);
});

test('CSS calc expressions are not rewritten', () => {
  const value = 'a { width: calc(100% - 1px); }';
  assert.equal(minifyCSS(value), value);
});
