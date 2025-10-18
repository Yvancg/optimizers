# is-strip-ansi

[![strip gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/strip.js.json)](./metrics/strip.js.json)
[![strip ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/strip.json)](./bench/strip.json)

Remove ANSI escape sequences from strings safely.  
Useful for cleaning log output or user-supplied console text before display or storage.

---

## 🚀 Why

Most minifiers are over-engineered, depend on heavy parsers, or risk breaking code through unsafe rewrites.
`is-minify` takes the opposite approach: it’s small, transparent, and deterministic.
	•	It avoids AST parsing and complex optimizations that can introduce subtle bugs.
	•	It guarantees that every output can still be parsed by any compliant JS or CSS engine.
	•	It’s ideal for quick in-browser transformations, form submissions, or server-side sanitization.

---

## 🌟 Features

- ✅ Detects and strips color codes, cursor moves, hyperlinks, etc.  
- ✅ Zero dependencies.  
- ✅ Safe for untrusted input.  
- ✅ Works in browsers, Node, and edge runtimes.

---

## 📦 Usage

```js
import { stripAnsi, hasAnsi } from './is-strip-ansi/strip.js';

const noisy = '\u001B[31mError:\u001B[0m invalid token';
console.log(stripAnsi(noisy)); // → 'Error: invalid token'
console.log(hasAnsi(noisy));   // → true
```

---

## 🧠 API

```ts
stripAnsi(input: string): string
hasAnsi(input: string): boolean
safeLog(value: any): void
```

---

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

Clone the repo, open `strip-test.html` — interactive test in your browser  
or click 👉🏻 [Strip ANSI Test](https://yvancg.github.io/optimizers/is-strip-ansi/strip-test.html)

---

## 🛠 Development

This module is standalone. You can copy `strip.js` into your own project.  
No `npm install` or build step required.

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
