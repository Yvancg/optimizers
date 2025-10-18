# is-html-minify

[![html gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/html.js.json)](./metrics/html.js.json)
[![html ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/html.json)](./bench/html.json)

Safe HTML minifier. Removes comments and collapses whitespace while preserving `<pre>`, `<textarea>`, `<script>`, and `<style>` content.

---

## 🚀 Why

Most HTML minifiers are large, unsafe, or over-optimized.
`is-html-minify` is minimal, deterministic, and written for runtime safety.
- No AST parsing or rewriting of HTML structure
- Preserves formatting inside code-sensitive tags
- Guaranteed valid output for any compliant browser or parser
- Ideal for edge rendering, CMS pipelines, and in-browser transforms

---

## 🌟 Features

- ✅ Removes HTML comments safely
- ✅ Collapses whitespace between tags and attributes
- ✅ Keeps <pre>, <textarea>, <script>, and <style> intact
- ✅ No dependencies, no build step
- ✅ Works in browser, Node.js, and edge runtimes

---

## 📦 Usage

```js
import { minifyHTML } from './html.js';

const html = `
<!-- comment -->
<div class="box">
  <p> Hello   world </p>
  <pre>   keep   whitespace   here   </pre>
  <script> const x =  1 + 2 </script>
</div>
`;

console.log(minifyHTML(html));
// <div class="box"><p>Hello world</p><pre>   keep   whitespace   here   </pre><script> const x =  1 + 2 </script></div>
```

---

## 🧠 API

```ts
minifyHTML(input: string, opts?: {
  removeComments?: boolean;          // default true
  collapseWhitespace?: boolean;      // default true
  trimAttrWhitespace?: boolean;      // default true
  removeEmptyAttributes?: boolean;   // default false
  booleanAttrShortening?: boolean;   // reserved (no-op by default)
}): string
```

---

## 🧪 Example (test.html)

```html
<!doctype html>
<html>
  <body>
    <main>
      <textarea id="src"><!-- comment -->
<div class="demo">
  <p> Hello   world </p>
  <pre> keep   this </pre>
</div></textarea>
      <button id="btn">Minify</button>
      <pre id="out"></pre>
    </main>
    <script type="module">
      import { minifyHTML } from './html.js';
      const $ = id => document.getElementById(id);
      $('btn').addEventListener('click', () => {
        $('out').textContent = minifyHTML($('src').value);
      });
    </script>
  </body>
</html>
```

---

## 🧪 Browser test

Clone the repo, open `html-test.html` — interactive test in your browser  
or click 👉🏻 [html Minification Test](https://yvancg.github.io/optimizers/is-html-minify/html-test.html)

---

## 🛠 Development

This module is standalone. You can copy `html.js` into your own project.  
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
[💸 Direct contribution](https://wise.com/pay/me/yvanc7)
