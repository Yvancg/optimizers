# is-prompt-minify

[![prompt gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/prompt.js.json)](./metrics/prompt.js.json)
[![prompt ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/prompt.json)](./bench/prompt.json)

Compact large language model (LLM) prompts by removing redundancy, normalizing whitespace, and trimming excess formatting — without changing meaning.

---

## 🚀 Why

Prompt tokens are expensive.  
Every redundant space, newline, or repeated word wastes compute and cost.  
`is-prompt-minify` provides a lightweight, deterministic way to shrink text before sending it to an AI API.

- Removes duplicated words and blank lines  
- Collapses multi-space sequences  
- Normalizes newlines  
- Reduces token count and improves model throughput 

---

## 🌟 Features

- ✅ Zero dependencies  
- ✅ O(n) performance  
- ✅ Works in browser, Node, and edge runtimes  
- ✅ Safe for untrusted input (pure string ops)  

---

## 📦 Usage

```js
import { promptMinify, promptDiff } from './is-prompt-minify/prompt.js';

const text = `
  You are a helpful helpful AI assistant.

  Please please summarize the following following text clearly clearly.
`;

const minified = promptMinify(text);
console.log(minified);
// "You are a helpful AI assistant.\n\nPlease summarize the following text clearly."

console.log(promptDiff(text, minified));
// { before: 120, after: 92, savedPct: 23.3 }
```

---

## 🧠 API

```ts
promptMinify(input: string, opts?: { trim?: boolean }): string
promptDiff(input: string, output: string): { before: number; after: number; savedPct: number }
```

---

## 🧪 Example (test.html)

```html
<!doctype html>
<html>
  <body>
    <script type="module">
      import { promptMinify, promptDiff } from './prompt.js';

      const text = `
        You are a helpful helpful AI assistant.
        Please please summarize the following following text clearly clearly.
      `;

      const minified = promptMinify(text);
      console.log(minified);

      const stats = promptDiff(text, minified);
      console.log(stats); // { before: X, after: Y, savedPct: Z }
    </script>
  </body>
</html>
```

---

## 🧪 Browser test

Clone the repo, open `prompt-test.html` — interactive test in your browser  
or click 👉🏻 [Prompt Minification Test](https://yvancg.github.io/optimizers/is-prompt-minify/prompt-test.html)

---

## 🛠 Development

This module is standalone. You can copy `prompt.js` into your own project.  
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
