# is-dataset-minify

[![dataset gzip](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/metrics/dataset.js.json)](./metrics/dataset.js.json)
[![dataset ops/s](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/yvancg/optimizers/main/bench/dataset.json)](./bench/dataset.json)

**Optimize JSON / JSONL / CSV datasets** for training, evaluation, or analytics.  
Normalizes keys, trims strings, drops empty columns, deduplicates rows, and optionally shuffles with a seed.

---

## 🚀 Why

Real-world datasets are messy: inconsistent keys, trailing spaces, mostly-empty columns, and duplicate rows.  
`is-dataset` takes raw JSON / JSONL / CSV and returns a clean, compact version that is easier to train on, debug, and share.
- Normalizes field names to snake_case or camelCase
- Trims and de-duplicates string fields
- Drops mostly-empty columns
- Optionally shuffles rows with a deterministic seed
- Emits JSON, JSONL, or CSV

---

## 🌟 Features

- ✅ Auto-detects JSON / JSONL / CSV input
- ✅ Normalizes key casing (none, snake_case, camelCase)
- ✅ Trims and collapses whitespace in strings
- ✅ Drops mostly-empty columns with configurable threshold
- ✅ Removes duplicate rows by primary key or full-row hash
- ✅ Optional shuffle with seed for reproducible splits
- ✅ Works in browsers, Node, and edge runtimes

---

## 📦 Usage

```js
import { optimizeDataset } from './dataset.js';

const raw = `
[
  { "id": 1, "Text": "  Hello   world  " },
  { "id": 1, "Text": "Hello world" },
  { "id": 2, "Text": "Another   row" }
]`;

const cleaned = optimizeDataset(raw, {
  format: 'json',
  keyCase: 'snake',
  trimStrings: true,
  collapseWhitespace: true,
  dropDuplicateRows: true,
  dropEmptyColumns: true,
  emptyColumnThreshold: 0.95,
  shuffle: false
});

console.log(cleaned);
```
**Output:**
```json
[
  { "id": 1, "text": "Hello world" },
  { "id": 2, "text": "Another row" }
]
```

---

## 🧠 API

```ts
optimizeDataset(
  input: string,
  opts?: {
    format?: 'auto' | 'json' | 'jsonl' | 'csv';
    outputFormat?: 'same' | 'json' | 'jsonl' | 'csv';
    keyCase?: 'none' | 'snake' | 'camel';
    primaryKey?: string | null;
    trimStrings?: boolean;
    collapseWhitespace?: boolean;
    maxCharsPerField?: number | null;
    dropEmptyColumns?: boolean;
    emptyColumnThreshold?: number;   // 0..1, default 0.95
    dropDuplicateRows?: boolean;
    shuffle?: boolean;
    seed?: string | null;
  }
): string
```

---

## 🧪 Browser test

Clone the repo and open `dataset-test.html` in your browser  
or click 👉🏻 [Dataset Optimizer Demo](https://yvancg.github.io/optimizers/is-dataset-minify/dataset-test.html)

---

## 🛠 Development

This module is standalone. You can copy `dataset.js` into your own project.  
No `npm install` or build step required.

### Node one-liners

```bash
node --input-type=module -e "import('./dataset.js').then(m=>console.log(m.optimizeDataset('[{\"id\":1,\"Text\":\"  Hello   world  \"},{\"id\":1,\"Text\":\"Hello world\"}]',{ format:'json', keyCase:'snake', dropDuplicateRows:true })))"
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
