# is-html-minify

[![html gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/html.js.json)](./metrics/html.js.json) 
[![html ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/html-minify.json)](./bench/html-minify.json)

Dependency-free, conservative HTML whitespace optimizer.  
Can remove comments and simplify whitespace while preserving `<pre>`, `<textarea>`, `<script>`, and `<style>` content.

---

## 🚀 Why

Most HTML minifiers are large, unsafe, or over-optimized.  
`is-html-minify` is minimal, deterministic, and written for runtime safety.

- No AST parsing or rewriting of HTML structure  
- Preserves formatting inside code-sensitive tags  
- Best-effort output; this is not a complete HTML parser  
- Ideal for edge rendering, CMS pipelines, and in-browser transforms  

---

## 🌟 Features

- ✅ Removes HTML comments safely  
- ✅ Keeps significant inter-tag whitespace and attribute values by default  
- ✅ Keeps `<pre>`, `<textarea>`, `<script>`, and `<style>` intact  
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
// <div class="box"><p>Hello world</p> <pre>   keep   whitespace   here   </pre> <script> const x =  1 + 2 </script></div>
```

---

## 🧠 API

```ts
minifyHTML(input, {
  removeComments?: true,
  collapseWhitespace?: true,
  trimAttrWhitespace?: false,
  removeEmptyAttributes?: false,
  booleanAttrShortening?: false,
  removeDefaultType?: false,
  keepMarkers?: string[],           // e.g. ['prettier-ignore']
  preserveTags?: string[]           // override ['pre','textarea','script','style']
})
```

---

With `trimAttrWhitespace: true`, attribute values may be trimmed. Leave aggressive options disabled unless you have verified the output against your HTML.

## 🧪 Example (`html-test.html`)

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
or click 👉🏻 
[`html Minify Test`](https://yvancg.github.io/optimizers/is-html-minify/html-test.html)  

---

## 🛠 Development

This module is fully standalone.  
Copy `html.js` into any project — no build or install needed.

### Node CLI one-liners

```bash
node is-html-minify/html.js < input.html > output.html
```

---

## 🪪 License

MIT License  

Copyright (c) 2025 **Y Consulting LLC**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,  
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,  
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## ❤️ Support the project

If this library helped you, consider sponsoring its maintenance.

### GitHub Sponsors  
[👉 Sponsor on GitHub](https://github.com/sponsors/yvancg)

### Buy Me a Coffee  
[☕ Support via BuyMeACoffee](https://buymeacoffee.com/yconsulting)

### Direct Contribution  
[💸 Direct Contribution via Paypal](https://www.paypal.com/ncp/payment/4HT7CA3E7HYBA)

---

**Project:** [Optimizers](https://github.com/Yvancg/optimizers) · Safe & fast code utilities
