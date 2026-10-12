# is-minify

[![minify gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/minify.js.json)](./metrics/minify.js.json)
[![minify ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/minify.json)](./bench/minify.json)

**Tiny, dependency-free, best-effort JavaScript/CSS whitespace optimizer.**  
One file. ESM. Works in browser and Node.

---

## 🚀 Why

Most minifiers are over-engineered, depend on heavy parsers, or risk breaking code through unsafe rewrites.
`is-minify` takes the opposite approach: it’s small, transparent, and deterministic.
	•	It avoids AST parsing and complex optimizations that can introduce subtle bugs.
	•	It leaves many complex inputs unchanged to avoid risky rewrites.
	•	It is intended for simple snippets, not sanitization or production bundling.

---

## 🌟 Features

- ✅ JS and CSS modes in one module  
- ✅ Conservative whitespace and comment handling  
- ✅ No AST, no build step, no dependencies  
- ✅ Works in browser, Node.js, and edge runtimes  

---

## 📦 Usage

```js
import { minify, minifyJS, minifyCSS } from './minify.js';

// JavaScript
const js = `
function greet (name) {
  const msg = \`Hello, \${name}!\`; // inline
  return msg;
}
`;
console.log(minifyJS(js));

// CSS
const css = `
/* button */
.btn {
  color: #fff !important ;
  background : #111827 ;
}
`;
console.log(minifyCSS(css));

// Generic entry point
console.log(minify(js, 'js'));
console.log(minify(css, 'css'));
```

---

## API

`minify(code, kind)` dispatches to `minifyJS(code)` or `minifyCSS(code)`.

`minifyJS(code)` returns source unchanged except for edge trimming if it contains a slash, a template literal, a newline, or potentially ambiguous adjacent operators. Simple inputs receive heuristic whitespace cleanup.

`minifyCSS(code)` returns `calc(...)` inputs unchanged except for edge trimming to preserve operator spacing. Other inputs use heuristic whitespace cleanup.

The JS optimizer leaves numeric-property-access syntax such as `1 .toString()` unchanged. Neither function parses full JavaScript/CSS syntax or guarantees equivalence for arbitrary programs. For production bundling, use a tested language-aware minifier. These functions do not sanitize untrusted content.

## 🧪 Example (test.html)

```html
<!doctype html>
<html>
  <body>
    <script type="module">
      import { minifyJS, minifyCSS } from './minify.js';
      console.log(minifyJS(`function x () { // hi
        return 1 + 2 ;
      }`));
      console.log(minifyCSS(`body { color : red ; } /* c */`));
    </script>
  </body>
</html>
```

---

## 🧪 Browser test

Clone the repo, open `minify-test.html` — interactive test in your browser  
or click 👉🏻 [Minification Test](https://yvancg.github.io/optimizers/is-minify/minify-test.html)

---

## 🛠 Development

This module is standalone. You can copy `minify.js` into your own project.  
No `npm install` or build step required.

### Node one-liners

```bash
node is-minify/minify.js js < app.js > app.min.js
node is-minify/minify.js css < styles.css > styles.min.css
```

---

## 🪪 License

MIT License  

Copyright (c) 2025 **Y Consulting LLC**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

## ❤️ Support the project

If this library helped you, consider sponsoring its maintenance.

### GitHub Sponsors

[👉 Sponsor me on GitHub](https://github.com/sponsors/yvancg)

### Buy Me a Coffee

[☕ Support via BuyMeACoffee](https://buymeacoffee.com/yconsulting)

### Custom link
[💸 Direct Contribution via Paypal](https://www.paypal.com/ncp/payment/4HT7CA3E7HYBA)
