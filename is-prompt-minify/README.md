# is-prompt-minify

[![prompt gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/prompt.js.json)](./metrics/prompt.js.json)
[![prompt ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/prompt.json)](./bench/prompt.json)

Conservatively normalize prompt whitespace and optionally remove repeated words or filler phrases.
Designed for pre-processing prompts before sending them to language models, to reduce formatting overhead. Removing phrases can change meaning; this is opt-in.

---

## 🚀 Why

Prompt tokens are expensive.  
Every redundant space, newline, or repeated word wastes compute and cost.  
`is-prompt-minify` provides a lightweight, deterministic way to shrink text before sending it to an AI API.

- Can remove duplicated adjacent words when explicitly requested  
- Collapses multi-space sequences  
- Normalizes newlines  
- Optionally removes filler phrases (disabled by default, may change meaning).
- Optionally skips minor edits if compression gain is negligible.
- Estimates token counts heuristically; savings depend on the model tokenizer

---

## 🌟 Features

- ✅ Drop-in minifier for LLM prompts.
- ✅ Noise-phrase and filler removal.
- ✅ Token-aware: skips edits with negligible savings.
- ✅ Zero dependencies.
- ✅ O(n) runtime.

---

## Usage
~~~js
import { promptMinify, optimizePrompt } from './prompt.js';

console.log(promptMinify('Please  keep   this.')); // 'Please keep this.'
console.log(promptMinify('No no', { removeRepeatedWords: true })); // 'No'
const { optimized, stats } = optimizePrompt('Please   keep this.');
// `noise` defaults to false: 'Please' is retained.
console.log(optimized, stats);

// Opt in only when dropping instruction phrases is acceptable:
console.log(optimizePrompt('Please keep this.', { noise: true }).optimized);
~~~

## API

`promptMinify(input, { trim = true, removeRepeatedWords = false })` returns a string. It collapses repeated horizontal whitespace, reduces three or more newlines to two, and removes duplicate adjacent words **only if** `removeRepeatedWords: true`.

`optimizePrompt(input, { trim = true, noise = false, minGainPct = 0 })` returns `{ optimized, stats }`. Its token count is a heuristic, not a provider tokenizer. `noise: true` removes certain phrases and may change meaning. It does not enable `removeRepeatedWords`.

## 🧪 Example (test.html)

```html
<!doctype html>
<html>
  <body>
    <script type="module">
      import { optimizePrompt } from './prompt.js';

      const text = `
        You are a helpful helpful AI assistant.
        Please please summarize the following following text clearly clearly.
      `;

      const { optimized, stats } = optimizePrompt(text, { minGainPct: 0 });
      console.log(optimized);
      console.log(stats);
    </script>
  </body>
</html>
```

---

## ⚙️ Internals

- **Regex-based cleanup only:**  
  No AST, parser, or tokenizer dependency.

- **Noise filtering:**  
  Removes common polite or redundant phrases (e.g., “please”, “as an AI language model”, “make sure to”).

- **Token estimation:**  
  Uses a lightweight heuristic counter based on space and punctuation splitting to approximate token counts.

---

## 🧪 Browser test

Clone the repo, open `prompt-test.html` — interactive test in your browser  
or click 👉🏻 [Prompt Minification Test](https://yvancg.github.io/optimizers/is-prompt-minify/prompt-test.html)

---

## 🛠 Development

This module is standalone. You can copy `prompt.js` into your own project.  
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

[💸 Direct Contribution via Paypal](https://www.paypal.com/ncp/payment/4HT7CA3E7HYBA)
