# is-prompt-minify

[![prompt gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/prompt.js.json)](./metrics/prompt.js.json)
[![prompt ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/prompt.json)](./bench/prompt.json)

Compact and normalize long LLM prompts by removing redundant words, formatting noise, and filler phrases such as “please” or “as an AI language model.”
Designed for pre-processing prompts before sending them to language models, to reduce token count while preserving semantics.

---

## 🚀 Why

Prompt tokens are expensive.  
Every redundant space, newline, or repeated word wastes compute and cost.  
`is-prompt-minify` provides a lightweight, deterministic way to shrink text before sending it to an AI API.

- Removes duplicated words and blank lines  
- Collapses multi-space sequences  
- Normalizes newlines  
- Cleans boilerplate (e.g., “please”, “as an AI language model”, “make sure to”).
- Optionally skips minor edits if compression gain is negligible.
- Reduces token count and improves model throughput

---

## 🌟 Features

- ✅ Drop-in minifier for LLM prompts.
- ✅ Noise-phrase and filler removal.
- ✅ Token-aware: skips edits with negligible savings.
- ✅ Zero dependencies.
- ✅ O(n) runtime.

---

## 📦 Usage

***Input***
```js
import { optimizePrompt } from './is-prompt-minify/prompt.js';

const text = `
You are a helpful helpful AI assistant.

Please please summarize the following following text clearly clearly.

It should also also normalize newlines and trim trim output.
`;

const { optimized, stats } = optimizePrompt(text, { minGainPct: 0, noise: true });

console.log(optimized);
console.log(stats);
```

***Output***
```txt
You are a helpful AI assistant.
summarize the following text clearly.
It should also normalize newlines and trim output.
```

---

## 🧠 API

### `promptMinify(input: string, opts?) → string`
Performs base structural cleanup.  
Collapses multiple spaces, repeated words, and triple newlines.

---

### `optimizePrompt(input: string, opts?) → { optimized, stats }`
Advanced mode with noise filtering and token-based threshold.

**Options:**

| Option | Type | Default | Description |
|:--------|:------|:----------|:-------------|
| `trim` | `boolean` | `true` | Trim leading and trailing whitespace. |
| `noise` | `boolean` | `true` | Remove filler and polite phrases (e.g., “please”, “as an AI language model”). |
| `minGainPct` | `number` | `0` | Skip edits if token reduction below threshold |


***Returns***
```ts
{
  optimized: string,
  stats: {
    bytesBefore: number,
    bytesAfter: number,
    savedBytesPct: number,
    tokensBefore: number,
    tokensAfter: number,
    savedTokensPct: number
  }
}
```

---

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
[💸 Direct contribution](https://wise.com/pay/me/yvanc7)
